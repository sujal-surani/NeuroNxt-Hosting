"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, MessageCircle, Users, BookOpen, Trophy, Clock, Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface NotificationsPopupProps {
  children: React.ReactNode
}

interface Notification {
  id: string
  user_id: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'social' | 'academic' | 'system' | 'study'
  title: string
  message: string
  link?: string
  is_read: boolean
  metadata?: any
  created_at: string
}

export function NotificationsPopup({ children }: NotificationsPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notificationList, setNotificationList] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const unreadCount = notificationList.filter((n) => !n.is_read).length

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setNotificationList(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()

    // Realtime subscription
    const channel = supabase
      .channel('notifications-popup')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          // We could verify user_id match here if we want to be strict, but RLS on select protects data
          // Ideally we check payload.new.user_id === currentUserId
          fetchNotifications()
          toast.info("New Notification: " + payload.new.title)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotificationList((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))

    // DB update
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }

  const markAllAsRead = async () => {
    const ids = notificationList.filter(n => !n.is_read).map(n => n.id)
    if (ids.length === 0) return

    setNotificationList((prev) => prev.map((n) => ({ ...n, is_read: true })))

    await supabase.from('notifications').update({ is_read: true }).in('id', ids)
  }

  const clearAllNotifications = async () => {
    // Only clear read notifications
    const ids = notificationList.filter(n => n.is_read).map(n => n.id)

    if (ids.length === 0) {
      toast.info("No read notifications to clear")
      return
    }

    // Remove from UI
    setNotificationList(prev => prev.filter(n => !n.is_read))

    // Delete from DB
    await supabase.from('notifications').delete().in('id', ids)
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }

    if (notification.link) {
      router.push(notification.link)
    }
    setIsOpen(false)
  }

  const getIcon = (type: string, category: string) => {
    if (category === 'social') return Users
    if (category === 'academic') return BookOpen
    if (type === 'success') return CheckCircle
    if (type === 'warning') return AlertTriangle
    if (type === 'error') return AlertCircle
    return Info // Default
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          {children}
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-primary text-primary-foreground">
              {unreadCount}
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </div>

        <ScrollArea className="h-96">
          <div className="p-2">
            {notificationList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No notifications</p>
                <p className="text-sm text-muted-foreground">You're all caught up!</p>
              </div>
            ) : (
              notificationList.map((notification) => {
                const IconComponent = getIcon(notification.type, notification.category)
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-all duration-200 ${!notification.is_read ? "bg-primary/5 border-l-2 border-l-primary" : ""
                      }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-green-100 text-green-600' :
                        notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-primary/10 text-primary'
                        }`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-semibold text-foreground max-w-[200px] truncate">
                          {notification.title}
                        </p>
                        {!notification.is_read && <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>}
                      </div>
                      <p className="text-sm text-foreground/80 mt-1 leading-relaxed line-clamp-2 break-words">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-1 mt-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{formatTime(notification.created_at)}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t bg-muted/20">
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={clearAllNotifications}
            disabled={notificationList.filter(n => n.is_read).length === 0}
          >
            Clear Read Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
