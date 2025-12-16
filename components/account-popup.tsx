"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Settings, LogOut, BookOpen, Users, MessageCircle, Trophy, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createClient } from "@/lib/supabase/client"
import { formatBranchName } from "@/lib/utils"

interface AccountPopupProps {
  children: React.ReactNode
}

export function AccountPopup({ children }: AccountPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Fetch profile data to get avatar
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single()

        setUser({ ...user, avatar_url: profile?.avatar_url })
      }
    }
    getUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsOpen(false)
    router.push("/auth/login")
    router.refresh()
  }

  const fullName = user?.user_metadata?.full_name || "Student"
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
  const branch = formatBranchName(user?.user_metadata?.branch)
  const semester = user?.user_metadata?.semester || "1"
  const enrollment = user?.user_metadata?.enrollment_number || "N/A"

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-90 p-0" align="end">
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-6 relative">
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Dark</span>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                aria-label="Toggle dark mode"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-background shadow-lg">
                <AvatarImage src={user?.avatar_url || "/student-avatar.png"} alt={fullName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="font-semibold text-lg">{fullName}</h3>
                <div className="flex items-center space-x-1">
                  <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center space-x-1">
                    <Star className="h-3 w-3 stroke-white stroke-2" />
                    <span>Level 12</span>
                  </div>
                  <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center space-x-1">
                    <Trophy className="h-3 w-3 stroke-black stroke-2" />
                    <span>1,250 XP</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{branch}</p>
              <div className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                <span>Semester {semester} • Enrollment: {enrollment}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-1">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs font-medium">Notes</p>
              <p className="text-lg font-bold text-primary">24</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 mx-auto mb-1 text-secondary" />
              <p className="text-xs font-medium">Friends</p>
              <p className="text-lg font-bold text-secondary">18</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <MessageCircle className="h-5 w-5 mx-auto mb-1 text-accent" />
              <p className="text-xs font-medium">Chats</p>
              <p className="text-lg font-bold text-accent">7</p>
            </div>
          </div>

          <Separator />

          <Link href="/profile">
            <Button variant="ghost" className="w-full justify-start h-10" onClick={() => setIsOpen(false)}>
              <User className="mr-3 h-4 w-4" />
              View Profile
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" className="w-full justify-start h-10" onClick={() => setIsOpen(false)}>
              <Settings className="mr-3 h-4 w-4" />
              Account Settings
            </Button>
          </Link>

          <Separator />

          <Button
            variant="ghost"
            className="w-full justify-start h-10 text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
