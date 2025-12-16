"use client"

import React, { useEffect } from "react"

import { useState } from "react"
import { Megaphone, Calendar, AlertTriangle, Info, Eye, Clock, Plus, CheckCircle, GraduationCap, Shield, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PostNoticeDialog } from "./post-notice-dialog"

interface NoticesPopupProps {
  children: React.ReactNode
}

interface Notice {
  id: number
  type: "exam" | "holiday" | "urgent" | "general"
  title: string
  description: string
  time: string
  unread: boolean
  priority: "high" | "medium" | "low"
  author: string
  authorRole?: string
  targetType?: string
  targetBranch?: string
  targetSemester?: string
  icon: any
  created_at: string
}

const priorityColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'exam': return Calendar
    case 'holiday': return Info
    case 'urgent': return AlertTriangle
    default: return Info
  }
}

export function NoticesPopup({ children }: NoticesPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [noticeList, setNoticeList] = useState<Notice[]>([])
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const supabase = createClient()

  const fetchNotices = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setUserRole(user.user_metadata.role)

    const { data: noticesData, error: noticesError } = await supabase
      .from('notices')
      .select('*, profiles:author_id(role)')
      .order('created_at', { ascending: false })

    if (noticesError) {
      console.error('Error fetching notices:', noticesError)
      return
    }

    // Fetch views for current user
    const { data: viewsData, error: viewsError } = await supabase
      .from('notice_views')
      .select('notice_id, is_cleared')
      .eq('user_id', user.id)

    const viewedNoticeIds = new Set(
      viewsData
        ?.filter((v: any) => !v.is_cleared)
        .map((v: any) => v.notice_id) || []
    )

    // Create a set of cleared notice IDs to filter them out
    const clearedNoticeIds = new Set(
      viewsData
        ?.filter((v: any) => v.is_cleared)
        .map((v: any) => v.notice_id) || []
    )

    const formattedNotices = noticesData
      .filter((n: any) => !clearedNoticeIds.has(n.id)) // Filter out cleared notices
      .map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        description: n.description,
        time: new Date(n.created_at).toLocaleDateString(),
        unread: !viewedNoticeIds.has(n.id),
        priority: n.priority,
        author: n.author_name || "Admin",
        authorRole: n.profiles?.role || "Admin",
        targetType: n.target_type,
        targetBranch: n.target_branch,
        targetSemester: n.target_semester,
        icon: getIconForType(n.type),
        created_at: n.created_at
      }))

    setNoticeList(formattedNotices)
  }

  const markAsViewed = async (noticeId: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Optimistic update
    setNoticeList((prev) => prev.map((n) => (n.id === noticeId ? { ...n, unread: false } : n)))
    if (selectedNotice?.id === noticeId) {
      setSelectedNotice((prev) => prev ? { ...prev, unread: false } : null)
    }

    const { error } = await supabase
      .from('notice_views')
      .insert({ notice_id: noticeId, user_id: user.id })

    if (error) {
      console.error('Error marking notice as viewed:', error)
      // Revert optimistic update if needed, but for now we'll assume success
    }
  }

  useEffect(() => {
    fetchNotices()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('notices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notices'
        },
        () => {
          fetchNotices()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const unreadCount = noticeList.filter((n) => n.unread).length

  const markAsRead = (id: number) => {
    setNoticeList((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)))
  }

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const unreadNotices = noticeList.filter(n => n.unread)
    if (unreadNotices.length === 0) return

    // Optimistic update
    setNoticeList((prev) => prev.map((n) => ({ ...n, unread: false })))

    const updates = unreadNotices.map(n => ({
      notice_id: n.id,
      user_id: user.id
    }))

    const { error } = await supabase
      .from('notice_views')
      .insert(updates)

    if (error) {
      console.error('Error marking all as viewed:', error)
    }
  }

  const clearViewedNotices = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Optimistically remove viewed notices
    setNoticeList((prev) => prev.filter((n) => n.unread))

    // Update DB: Mark all viewed notices for this user as cleared
    const { error } = await supabase
      .from('notice_views')
      .update({ is_cleared: true })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error clearing notices:', error)
      fetchNotices() // Revert on error
    }
  }

  const openNoticeModal = (notice: Notice) => {
    setSelectedNotice(notice)
    setIsModalOpen(true)
    // Removed automatic markAsRead
  }

  const getTargetDisplay = (notice: any) => {
    if (notice.targetType === 'all') return "All Institute Members"
    let display = notice.targetBranch || "Specific Branch"
    if (notice.targetSemester && notice.targetSemester !== 'all') {
      display += ` • Sem ${notice.targetSemester}`
    }
    return display
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            {children}
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-orange-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Megaphone className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-lg">Official Notices</h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-1">
                {(userRole === 'teacher' || userRole === 'admin' || userRole === 'institute_admin') && (
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setIsPostDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 w-7 p-0 transition-all duration-200 ${noticeList.some(n => !n.unread)
                              ? "text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                              : "text-muted-foreground/30 pointer-events-none"
                            }`}
                          onClick={clearViewedNotices}
                          disabled={!noticeList.some(n => !n.unread)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {noticeList.some(n => !n.unread)
                        ? "Clear all viewed notices"
                        : "No viewed notices to clear"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          <ScrollArea className="h-96">
            <div className="p-2">
              {noticeList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No notices found</p>
                </div>
              ) : (
                noticeList.map((notice) => {
                  const IconComponent = notice.icon
                  return (
                    <div
                      key={notice.id}
                      className={`group flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-all duration-200 ${notice.unread ? "bg-orange-50 dark:bg-orange-950/20 border-l-2 border-l-orange-500" : ""
                        }`}
                      onClick={() => openNoticeModal(notice)}
                    >
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate" title={notice.title}>
                                {notice.title}
                              </p>
                              <Badge className={`${priorityColors[notice.priority]} shrink-0`} variant="secondary">
                                {notice.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-foreground/70 mb-1 font-medium truncate flex items-center gap-1">
                              <span>By {notice.author}</span>
                              {notice.authorRole === 'teacher' && <GraduationCap className="h-3 w-3 text-indigo-500" />}
                              {(notice.authorRole === 'admin' || notice.authorRole === 'institute_admin') && <Shield className="h-3 w-3 text-orange-500" />}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                            {notice.unread && <div className="h-2 w-2 bg-orange-500 rounded-full"></div>}
                          </div>
                        </div>
                        <p className="text-sm text-foreground/80 mt-1 leading-relaxed break-all" title={notice.description}>
                          {notice.description.length > 60
                            ? `${notice.description.slice(0, 60)}...`
                            : notice.description}
                        </p>
                        <div className="flex items-center space-x-1 mt-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{notice.time}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-orange-600 hover:text-orange-700 ml-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              openNoticeModal(notice)
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Read full notice
                          </Button>
                          {notice.unread && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-green-600 ml-2 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsViewed(notice.id)
                              }}
                              title="Mark as viewed"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>

          <div className="p-3 border-t bg-muted/20">
            {unreadCount > 0 ? (
              <Button variant="ghost" className="w-full text-xs flex items-center justify-center gap-2" onClick={markAllAsRead}>
                <CheckCircle className="h-4 w-4" />
                Mark all as read
              </Button>
            ) : (
              <Button variant="ghost" className="w-full text-xs" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden">
          {selectedNotice && (
            <>
              <DialogHeader className="pb-6">
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900 flex items-center justify-center shadow-sm">
                    {React.createElement(selectedNotice.icon, {
                      className: "h-6 w-6 text-orange-600 dark:text-orange-400",
                    })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-xl font-bold text-balance leading-tight mb-2">
                      {selectedNotice.title}
                    </DialogTitle>
                    <div className="flex items-center space-x-3 flex-wrap gap-2">
                      <Badge
                        className={`${priorityColors[selectedNotice.priority]} font-medium text-xs`}
                        variant="secondary"
                      >
                        {selectedNotice.priority.toUpperCase()} PRIORITY
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Posted {selectedNotice.time}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <span>•</span>
                        <span>Notice #{selectedNotice.id.toString().padStart(3, "0")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="max-h-[65vh] pr-4">
                <Card className="mb-6 border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-950/20">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-orange-200 dark:bg-orange-800 flex items-center justify-center">
                        <span className="text-xs font-bold text-orange-700 dark:text-orange-300">
                          {selectedNotice.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{selectedNotice.author}</p>
                        <p className="text-xs text-muted-foreground">Official Notice Publisher</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-base font-semibold text-foreground mb-3 flex items-center">
                        <Info className="h-4 w-4 mr-2 text-orange-600" />
                        Notice Details
                      </h3>
                    </div>

                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <DialogDescription className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {selectedNotice.description}
                      </DialogDescription>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Category</p>
                          <p className="text-xs font-semibold capitalize">{selectedNotice.type}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Posted By</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs font-semibold capitalize">{selectedNotice.authorRole || "Admin"}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Applies To</p>
                          <p className="text-xs font-semibold">{getTargetDisplay(selectedNotice)}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Effective Date</p>
                          <p className="text-xs font-semibold">Immediate</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollArea>

              <div className="flex items-center justify-between pt-6 border-t bg-muted/20 -mx-6 -mb-6 px-6 py-4">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {selectedNotice.unread ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsViewed(selectedNotice.id)}
                      className="text-orange-600 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20"
                    >
                      <Eye className="h-3 w-3 mr-2" />
                      Mark as viewed
                    </Button>
                  ) : (
                    <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Viewed
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-orange-600 hover:bg-orange-700 text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <PostNoticeDialog
        open={isPostDialogOpen}
        onOpenChange={setIsPostDialogOpen}
        onSuccess={() => {
          fetchNotices()
          setIsPostDialogOpen(false)
        }}
      />
    </>
  )
}
