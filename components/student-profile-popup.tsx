<<<<<<< HEAD
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Mail,
  GraduationCap,
  Clock,
  BookOpen,
  Calendar,
  Link,
  Flame,
  Trophy,
  X
} from "lucide-react"
import { formatBranchName } from "@/lib/utils"

interface Student {
  id: number | string
  name: string
  avatar: string
  email?: string
  status: "online" | "offline" | "away"
  branch?: string
  semester?: string
  bio?: string
  quizzesCompleted?: number
  studyStreak?: number
  connections?: number
  enrollment?: string
  location?: string
  visibility?: "institute" | "classmates"
  role?: string
}

interface StudentProfilePopupProps {
  student: Student | null
  isOpen: boolean
  onClose: () => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-green-500"
    case "away":
      return "bg-yellow-500"
    case "offline":
      return "bg-gray-400"
    default:
      return "bg-gray-400"
  }
}

export function StudentProfilePopup({ student, isOpen, onClose }: StudentProfilePopupProps) {
  const [connectionCount, setConnectionCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const fetchConnectionCount = async () => {
      if (!student?.id) return

      const { count, error } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${student.id},recipient_id.eq.${student.id}`)
        .eq('status', 'accepted')

      if (!error && count !== null) {
        setConnectionCount(count)
      }
    }

    if (isOpen && student) {
      // Always fetch to ensure it's up to date
      fetchConnectionCount()
      // Also set initial value if available to avoid flicker
      if (typeof student.connections === 'number') {
        setConnectionCount(student.connections)
      }
    }
  }, [isOpen, student, supabase])

  if (!isOpen || !student) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
        {/* Header with close button */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold">Student Profile</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-start space-x-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src={student.avatar} alt={student.name} className="object-cover" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {student.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-1">{student.name}</h2>
              <p className="text-muted-foreground mb-2">{student.email}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className={`w-2 h-2 ${getStatusColor(student.status)} rounded-full mr-2`}></div>
                  <span className="text-sm text-muted-foreground capitalize">{student.status}</span>
                </div>
                {student.branch && student.semester && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <GraduationCap className="w-4 h-4 mr-1" />
                    {formatBranchName(student.branch)} - {student.semester} Semester
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {student.bio && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">About</h4>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {student.bio || "No bio available"}
              </p>
            </div>
          )}

          {/* Stats Grid */}
          {student.role !== 'teacher' && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">{student.quizzesCompleted || 0}</p>
                <p className="text-xs text-muted-foreground">Quizzes Completed</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{student.studyStreak || 0}</p>
                <p className="text-xs text-muted-foreground">Study Streak</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Link className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{connectionCount}</p>
                <p className="text-xs text-muted-foreground">Connections</p>
              </div>
            </div>
          )}

          {/* Academic Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                </div>
              </div>
              {student.location && (
                <div className="flex items-center space-x-3">
                  <span className="w-4 h-4 flex items-center justify-center text-muted-foreground">📍</span>
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{student.location}</p>
                  </div>
                </div>
              )}
              {student.enrollment && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Enrollment</p>
                    <p className="text-sm text-muted-foreground">{student.enrollment}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {student.branch && (
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Branch</p>
                    <p className="text-sm text-muted-foreground">{formatBranchName(student.branch)}</p>
                  </div>
                </div>
              )}
              {student.semester && (
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Semester</p>
                    <p className="text-sm text-muted-foreground">{student.semester}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
=======
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Mail,
  GraduationCap,
  Clock,
  BookOpen,
  Calendar,
  Link,
  Flame,
  Trophy,
  X
} from "lucide-react"
import { formatBranchName } from "@/lib/utils"

interface Student {
  id: number | string
  name: string
  avatar: string
  email?: string
  status: "online" | "offline" | "away"
  branch?: string
  semester?: string
  bio?: string
  quizzesCompleted?: number
  studyStreak?: number
  connections?: number
  enrollment?: string
  location?: string
  visibility?: "institute" | "classmates"
  role?: string
}

interface StudentProfilePopupProps {
  student: Student | null
  isOpen: boolean
  onClose: () => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-green-500"
    case "away":
      return "bg-yellow-500"
    case "offline":
      return "bg-gray-400"
    default:
      return "bg-gray-400"
  }
}

export function StudentProfilePopup({ student, isOpen, onClose }: StudentProfilePopupProps) {
  const [connectionCount, setConnectionCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const fetchConnectionCount = async () => {
      if (!student?.id) return

      const { count, error } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${student.id},recipient_id.eq.${student.id}`)
        .eq('status', 'accepted')

      if (!error && count !== null) {
        setConnectionCount(count)
      }
    }

    if (isOpen && student) {
      // Always fetch to ensure it's up to date
      fetchConnectionCount()
      // Also set initial value if available to avoid flicker
      if (typeof student.connections === 'number') {
        setConnectionCount(student.connections)
      }
    }
  }, [isOpen, student, supabase])

  if (!isOpen || !student) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
        {/* Header with close button */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold">Student Profile</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-start space-x-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src={student.avatar} alt={student.name} className="object-cover" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {student.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-1">{student.name}</h2>
              <p className="text-muted-foreground mb-2">{student.email}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className={`w-2 h-2 ${getStatusColor(student.status)} rounded-full mr-2`}></div>
                  <span className="text-sm text-muted-foreground capitalize">{student.status}</span>
                </div>
                {student.branch && student.semester && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <GraduationCap className="w-4 h-4 mr-1" />
                    {formatBranchName(student.branch)} - {student.semester} Semester
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {student.bio && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">About</h4>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {student.bio || "No bio available"}
              </p>
            </div>
          )}

          {/* Stats Grid */}
          {student.role !== 'teacher' && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">{student.quizzesCompleted || 0}</p>
                <p className="text-xs text-muted-foreground">Quizzes Completed</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{student.studyStreak || 0}</p>
                <p className="text-xs text-muted-foreground">Study Streak</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Link className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{connectionCount}</p>
                <p className="text-xs text-muted-foreground">Connections</p>
              </div>
            </div>
          )}

          {/* Academic Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                </div>
              </div>
              {student.location && (
                <div className="flex items-center space-x-3">
                  <span className="w-4 h-4 flex items-center justify-center text-muted-foreground">📍</span>
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{student.location}</p>
                  </div>
                </div>
              )}
              {student.enrollment && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Enrollment</p>
                    <p className="text-sm text-muted-foreground">{student.enrollment}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {student.branch && (
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Branch</p>
                    <p className="text-sm text-muted-foreground">{formatBranchName(student.branch)}</p>
                  </div>
                </div>
              )}
              {student.semester && (
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Semester</p>
                    <p className="text-sm text-muted-foreground">{student.semester}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
>>>>>>> 8c01869 (Chat Page 99% Completed)
