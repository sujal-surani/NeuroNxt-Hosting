"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { StudentProfilePopup } from "@/components/student-profile-popup"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award, TrendingUp, Users, Target } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface LeaderboardUser {
  id: string
  name: string
  avatar: string
  xp: number
  rank: number
  branch: string
  semester: string
  quizzesCompleted: number
  averageScore: number
  streak: number
  email?: string
  bio?: string
  location?: string
  visibility?: "institute" | "classmates"
  role?: string
  instituteCode?: string
  lastActive?: string
}

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([])
  const [currentUserXP, setCurrentUserXP] = useState(0)
  const [currentUserRank, setCurrentUserRank] = useState(0)
  const [showStudentInfo, setShowStudentInfo] = useState(false)
  const [selectedStudentInfo, setSelectedStudentInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        // Fetch all profiles
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student')
          .order('full_name') // In a real app, order by XP

        if (error) throw error

        // Transform profiles to leaderboard format
        // Note: XP, quizzes, score, streak are mocked for now as they are not in profiles table
        const formattedData: LeaderboardUser[] = profiles.map((profile: any, index: number) => ({
          id: profile.id,
          name: profile.full_name,
          avatar: profile.avatar_url,
          xp: Math.floor(Math.random() * 3000) + 500, // Mock XP
          rank: index + 1,
          branch: profile.branch || "General",
          semester: profile.semester || "1",
          quizzesCompleted: Math.floor(Math.random() * 50), // Mock
          averageScore: Math.floor(Math.random() * 20) + 80, // Mock
          streak: Math.floor(Math.random() * 15), // Mock
          email: profile.email,
          bio: profile.bio,
          location: profile.location,
          visibility: profile.visibility,
          role: profile.role,
          instituteCode: profile.institute_code,
          lastActive: profile.last_active
        })).sort((a, b) => b.xp - a.xp) // Sort by mock XP

        // Re-assign ranks based on sorted XP
        formattedData.forEach((user, index) => {
          user.rank = index + 1
        })

        setLeaderboardData(formattedData)

        if (user) {
          // Find current user in the list
          const currentUser = formattedData.find(u => u.id === user.id)
          if (currentUser) {
            setCurrentUserXP(currentUser.xp)
            setCurrentUserRank(currentUser.rank)
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const handleStudentInfoClick = (user: LeaderboardUser) => {
    // Transform leaderboard user data to match Student interface
    const studentData = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      status: "offline" as const, // TODO: Real status
      branch: user.branch,
      semester: user.semester,
      quizzesCompleted: user.quizzesCompleted,
      studyStreak: user.streak,
      connections: Math.floor(Math.random() * 200) + 50, // Mock connections
      bio: user.bio,
      location: user.location,
      visibility: user.visibility,
      role: user.role,
      instituteCode: user.instituteCode,
      lastActive: user.lastActive
    }
    setSelectedStudentInfo(studentData)
    setShowStudentInfo(true)
  }

  const closeStudentInfo = () => {
    setShowStudentInfo(false)
    setSelectedStudentInfo(null)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return (
          <div className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">
            #{rank}
          </div>
        )
    }
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return "bg-gradient-to-r from-yellow-400 to-yellow-600"
    if (rank <= 10) return "bg-gradient-to-r from-blue-400 to-blue-600"
    return "bg-gradient-to-r from-gray-400 to-gray-600"
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">#{currentUserRank}</div>
                  <p className="text-sm text-muted-foreground">Your Rank</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{currentUserXP.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Your XP</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{leaderboardData.length}</div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {currentUserRank <= 3
                      ? "🔥"
                      : leaderboardData[2]?.xp - currentUserXP > 0
                        ? (leaderboardData[2]?.xp - currentUserXP).toLocaleString()
                        : "0"}
                  </div>
                  <p className="text-sm text-muted-foreground">{currentUserRank <= 3 ? "Top 3!" : "XP to Top 3"}</p>
                </CardContent>
              </Card>
            </div>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  XP Leaderboard
                </CardTitle>
                <CardDescription>Students ranked by total experience points earned from quizzes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboardData.map((user, index) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 ${index < 3 ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200" : ""
                        }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12">{getRankIcon(user.rank)}</div>

                        <Avatar
                          className="w-12 h-12 cursor-pointer"
                          onClick={() => handleStudentInfoClick(user)}
                        >
                          <AvatarImage src={user.avatar || "/student-avatar.png"} alt={user.name} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="cursor-pointer" onClick={() => handleStudentInfoClick(user)}>
                          <h3 className="font-semibold hover:text-primary transition-colors">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {user.branch} • {user.semester} Semester
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">{user.xp.toLocaleString()}</div>
                          <p className="text-xs text-muted-foreground">XP</p>
                        </div>

                        <div className="text-center">
                          <div className="text-lg font-bold">{user.quizzesCompleted}</div>
                          <p className="text-xs text-muted-foreground">Quizzes</p>
                        </div>

                        <div className="text-center">
                          <div className="text-lg font-bold">{user.averageScore}%</div>
                          <p className="text-xs text-muted-foreground">Avg Score</p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center">
                            <div className="text-lg font-bold text-orange-600">{user.streak}</div>
                            <div className="text-orange-600 ml-1">🔥</div>
                          </div>
                          <p className="text-xs text-muted-foreground">Streak</p>
                        </div>

                        <Badge className={`${getRankBadgeColor(user.rank)} text-white`}>#{user.rank}</Badge>
                      </div>
                    </div>
                  ))}

                  {/* Current User Row (if not in top 8) */}
                  {currentUserRank > 8 && (
                    <>
                      <div className="border-t pt-4">
                        <p className="text-center text-sm text-muted-foreground mb-4">...</p>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-blue-50 border-blue-200">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12">
                            {getRankIcon(currentUserRank)}
                          </div>

                          <Avatar className="w-12 h-12">
                            <AvatarImage src="/student-avatar.png" alt="You" />
                            <AvatarFallback>You</AvatarFallback>
                          </Avatar>

                          <div>
                            <h3 className="font-semibold">You</h3>
                            <p className="text-sm text-muted-foreground">Computer Technology • 6th Semester</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary">{currentUserXP.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">XP</p>
                          </div>

                          <Badge className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                            #{currentUserRank}
                          </Badge>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Student Profile Popup */}
      <StudentProfilePopup
        student={selectedStudentInfo}
        isOpen={showStudentInfo}
        onClose={closeStudentInfo}
      />
    </div>
  )
}
