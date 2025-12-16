"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AccountPopup } from "./account-popup"
import { NotificationsPopup } from "./notifications-popup"
import { NoticesPopup } from "./notices-popup"
import { createClient } from "@/lib/supabase/client"
import { useEffect } from "react"

export function TopNavbar() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // User role - can be "student" or "teacher"
  // This should come from auth/context in real app
  const [userRole, setUserRole] = useState<"student" | "teacher">("student")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [initials, setInitials] = useState("U")
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.role) {
        setUserRole(user.user_metadata.role as "student" | "teacher")
      }

      // Fetch profile for avatar
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url, full_name')
          .eq('id', user.id)
          .single()

        if (profile) {
          setAvatarUrl(profile.avatar_url)
          if (profile.full_name) {
            setInitials(profile.full_name.substring(0, 2).toUpperCase())
          }
        }
      }
    }
    getUser()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-background border-b border-border">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search notes, topics, or classmates..."
              className="pl-10 bg-card border-border focus:ring-secondary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        <Badge
          variant={userRole === "teacher" ? "default" : "outline"}
          className={userRole === "teacher" ? "bg-primary text-primary-foreground" : ""}
        >
          {userRole === "teacher" ? "Teacher" : "Student"}
        </Badge>

        <NoticesPopup>
          <Button variant="ghost" size="sm" className="relative">
            <Megaphone className="w-5 h-5" />
          </Button>
        </NoticesPopup>

        <NotificationsPopup>
          <Button variant="ghost" size="sm" className="relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM9 7V3a1 1 0 011-1h4a1 1 0 011 1v4M9 7a3 3 0 00-3 3v4a3 3 0 003 3h6a3 3 0 003-3v-4a3 3 0 00-3-3M9 7h6"
              />
            </svg>
          </Button>
        </NotificationsPopup>

        <AccountPopup>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl || "/student-avatar.png"} alt="User" />
              <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </AccountPopup>
      </div>
    </header>
  )
}
