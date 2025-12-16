"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, MessageCircle, Users, BookOpen, Trophy, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface NotificationsPopupProps {
  children: React.ReactNode
}

const notifications: any[] = []

export function NotificationsPopup({ children }: NotificationsPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notificationList, setNotificationList] = useState(notifications)
  const router = useRouter()

  const unreadCount = notificationList.filter((n) => n.unread).length

  const markAsRead = (id: number) => {
    setNotificationList((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)))
  }

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  const clearAllNotifications = () => {
    setNotificationList([])
  }

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)

    if (notification.type === "message") {
      if (notification.title.includes("Group chat")) {
        router.push("/chat")
      } else {
        router.push("/chat")
      }
    } else if (notification.type === "friend") {
      router.push("/social?tab=classmates")
    } else if (notification.type === "note") {
      router.push("/notes")
    } else if (notification.type === "achievement") {
      router.push("/profile")
    }

    setIsOpen(false)
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
                const IconComponent = notification.icon
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-all duration-200 ${notification.unread ? "bg-primary/5 border-l-2 border-l-primary" : ""
                      }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0">
                      {notification.avatar ? (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={notification.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            <IconComponent className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-semibold text-foreground max-w-[200px] truncate">
                          {notification.title}
                        </p>
                        {notification.unread && <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>}
                      </div>
                      <p className="text-sm text-foreground/80 mt-1 leading-relaxed line-clamp-2 break-words">
                        {notification.description}
                      </p>
                      <div className="flex items-center space-x-1 mt-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
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
            disabled={notificationList.length === 0}
          >
            Clear All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
