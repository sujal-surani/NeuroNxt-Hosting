"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MessageCircle, Search, UserPlus, UserCheck, CheckCircle, XCircle, Loader2, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { StudentProfilePopup } from "@/components/student-profile-popup"
import { formatBranchName } from "@/lib/utils"

interface SocialUser {
  id: string
  name: string
  avatar: string
  role: string
  branch: string
  semester: string
  status: "online" | "offline" | "away"
  account_status?: string // Added
  bio: string
  email?: string
  instituteCode?: string
  lastActive?: string
  location?: string
  enrollment?: string
  studyStreak?: number
  quizzesCompleted?: number
  interests?: string[]
}

interface Connection {
  id: number
  requester_id: string
  recipient_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  requester?: SocialUser
  recipient?: SocialUser
}

const SocialPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState("feed")
  const [searchQuery, setSearchQuery] = useState("")
  const [showStudentInfo, setShowStudentInfo] = useState(false)
  const [selectedStudentInfo, setSelectedStudentInfo] = useState<any>(null)
  const [users, setUsers] = useState<SocialUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [globalSearch, setGlobalSearch] = useState("")
  const [globalBranchFilter, setGlobalBranchFilter] = useState("all")
  const [globalSemesterFilter, setGlobalSemesterFilter] = useState("all")
  const [teacherSearch, setTeacherSearch] = useState("")

  // New filters
  const [branchFilter, setBranchFilter] = useState("all")
  const [semesterFilter, setSemesterFilter] = useState("all")

  const [classmates, setClassmates] = useState<SocialUser[]>([])
  const [teachers, setTeachers] = useState<SocialUser[]>([])
  const [publicStudents, setPublicStudents] = useState<SocialUser[]>([])

  const [friendRequests, setFriendRequests] = useState<Connection[]>([])
  const [sentRequests, setSentRequests] = useState<Connection[]>([])
  const [connections, setConnections] = useState<Connection[]>([])

  const [showAllClassmates, setShowAllClassmates] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const [currentUserBranch, setCurrentUserBranch] = useState<string | null>(null)
  const [currentUserSemester, setCurrentUserSemester] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      // 1. Fetch all profiles
      // Note: RLS should filter this, but we add client-side check for double safety
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name')

      if (profilesError) throw profilesError

      const formattedUsers: SocialUser[] = profiles.map((profile: any) => ({
        id: profile.id,
        name: profile.full_name,
        avatar: profile.avatar_url,
        role: profile.role, // Keep original role for filtering
        branch: formatBranchName(profile.branch),
        semester: profile.semester || "1",
        status: "offline", // TODO: Real status
        account_status: profile.account_status, // Map from DB
        bio: profile.bio || "No bio available",
        email: profile.email,
        instituteCode: profile.institute_code,
        lastActive: profile.last_active,
        location: profile.location,
        enrollment: profile.enrollment_number,
        studyStreak: profile.study_streak || 0,
        quizzesCompleted: profile.quizzes_completed || 0,
        interests: profile.interests || []
      }))

      setUsers(formattedUsers)

      // Identify current user's role and details
      if (user) {
        const myProfile = formattedUsers.find(u => u.id === user.id)
        if (myProfile) {
          setCurrentUserRole(myProfile.role)
          setCurrentUserBranch(myProfile.branch) // Already formatted
          setCurrentUserSemester(myProfile.semester)
        }
      }

      // Filter and set specific groups
      // Only show actual students and teachers, excluding admins AND current user
      // CRITICAL: Filter out pending/inactive users
      const allStudents = formattedUsers.filter(u =>
        u.role === 'student' &&
        u.id !== user?.id &&
        u.account_status === 'active' // Strict client-side check
      )

      const allTeachers = formattedUsers.filter(u =>
        u.role === 'teacher' &&
        u.id !== user?.id &&
        u.account_status === 'active' // Strict client-side check
      )

      setClassmates(allStudents)
      setTeachers(allTeachers)
      setPublicStudents(allStudents)

      // 2. Fetch connections if user is logged in
      if (user) {
        const { data: connectionsData, error: connectionsError } = await supabase
          .from('connections')
          .select(`
            *,
            requester:profiles!requester_id(*),
            recipient:profiles!recipient_id(*)
          `)
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)

        if (connectionsError) throw connectionsError

        const formatConnectionUser = (profile: any): SocialUser => ({
          id: profile.id,
          name: profile.full_name || "Unknown User",
          avatar: profile.avatar_url,
          role: profile.role,
          branch: formatBranchName(profile.branch),
          semester: profile.semester || "1",
          status: "offline",
          bio: profile.bio || "",
          email: profile.email,
          instituteCode: profile.institute_code,
          lastActive: profile.last_active,
          location: profile.location,
          enrollment: profile.enrollment_number,
          studyStreak: profile.study_streak || 0,
          quizzesCompleted: profile.quizzes_completed || 0,
          interests: profile.interests || []
        })

        const formattedConnections = connectionsData.map((c: any) => ({
          ...c,
          requester: c.requester ? formatConnectionUser(c.requester) : undefined,
          recipient: c.recipient ? formatConnectionUser(c.recipient) : undefined
        }))

        const accepted = formattedConnections.filter((c: any) => c.status === 'accepted')
        const pendingReceived = formattedConnections.filter((c: any) => c.status === 'pending' && c.recipient_id === user.id)
        const pendingSent = formattedConnections.filter((c: any) => c.status === 'pending' && c.requester_id === user.id)

        setConnections(accepted)
        setFriendRequests(pendingReceived)
        setSentRequests(pendingSent)
        setSentRequests(pendingSent)
      } else if (user) {
        // Even if no connections needed for teachers, we clear the arrays to be safe
        setConnections([])
        setFriendRequests([])
        setSentRequests([])
      }

    } catch (error) {
      console.error('Error fetching social data:', error)
      toast.error("Failed to load social data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('social-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchData()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'connections' },
        () => {
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase]) // Dependency changed from currentUser to supabase

  // Filter users based on search query - DEPRECATED / UNUSED
  // logic moved to specific filtered lists below


  const handleStudentInfoClick = (user: SocialUser) => {
    const studentData = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      status: user.status,
      branch: user.branch,
      semester: user.semester,
      quizzesCompleted: user.quizzesCompleted || 0,
      studyStreak: user.studyStreak || 0,
      connections: 0, // Will be fetched by popup
      bio: user.bio,
      role: user.role,
      instituteCode: user.instituteCode,
      lastActive: user.lastActive,
      location: user.location,
      enrollment: user.enrollment,
      interests: user.interests
    }
    setSelectedStudentInfo(studentData)
    setShowStudentInfo(true)
  }

  const filteredPublicStudents = publicStudents.filter((s) => {
    const searchLower = globalSearch.toLowerCase()
    const matchesSearch =
      s.name.toLowerCase().includes(searchLower) ||
      (s.enrollment && s.enrollment.toLowerCase().includes(searchLower)) ||
      (s.interests && s.interests.some(i => i.toLowerCase().includes(searchLower))) ||
      s.branch.toLowerCase().includes(searchLower) || // Keeping existing specific logic just in case
      s.semester.includes(searchLower)

    const matchesBranch = globalBranchFilter === "all" || s.branch === formatBranchName(globalBranchFilter)
    const matchesSemester = globalSemesterFilter === "all" || s.semester === globalSemesterFilter

    return matchesSearch && matchesBranch && matchesSemester
  })

  const filteredClassmates = classmates.filter((c) => {
    // 1. Strict Classmate Definition for Students: Same Branch AND Same Semester
    if (currentUserRole === 'student') {
      if (currentUserBranch && c.branch !== currentUserBranch) return false
      if (currentUserSemester && c.semester !== currentUserSemester) return false
    }

    // 2. Search Filter (Text)
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      c.name.toLowerCase().includes(searchLower) ||
      (c.enrollment && c.enrollment.toLowerCase().includes(searchLower)) ||
      (c.interests && c.interests.some(i => i.toLowerCase().includes(searchLower)));

    // 3. Dropdown Filters (Teacher only)
    if (currentUserRole === 'teacher') {
      const matchesBranch = branchFilter === "all" || c.branch === formatBranchName(branchFilter)
      // Note: Branch names stored in DB might be formatted differently than select values, 
      // but formatBranchName usage here suggests standardization.

      const matchesSemester = semesterFilter === "all" || c.semester === semesterFilter
      return matchesSearch && matchesBranch && matchesSemester
    }

    // Default for Student (Strict Branch/Sem matched above, just need search now)
    return matchesSearch
  })

  const filteredTeachers = teachers.filter((t) =>
    t.name?.toLowerCase().includes(teacherSearch.toLowerCase())
  )

  const openPersonalChat = (person: SocialUser) => {
    router.push(`/chat?person=${encodeURIComponent(person.name)}&id=${person.id}`)
  }

  const isConnected = (userId: string) => {
    return connections.some(c =>
      (c.requester_id === userId || c.recipient_id === userId)
    )
  }

  const isRequestSent = (userId: string) => {
    return sentRequests.some(r => r.recipient_id === userId)
  }

  const isRequestReceived = (userId: string) => {
    return friendRequests.some(r => r.requester_id === userId)
  }

  const sendConnectRequest = async (person: SocialUser) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('connections')
        .upsert({
          requester_id: user.id,
          recipient_id: person.id,
          status: 'pending'
        }, {
          onConflict: 'requester_id, recipient_id'
        })
        .select('*, recipient:profiles!recipient_id(*)')
        .single()

      if (error) throw error

      setSentRequests(prev => [...prev, data])
      toast.success("Connection request sent!")
    } catch (error) {
      console.error('Error sending request:', error)
      toast.error("Failed to send request")
    }
  }

  const acceptFriendRequest = async (requestId: number) => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .select('*, requester:profiles!requester_id(*), recipient:profiles!recipient_id(*)')
        .single()

      if (error) throw error

      setFriendRequests(prev => prev.filter(req => req.id !== requestId))
      setConnections(prev => [...prev, data])
      toast.success("Request accepted!")
    } catch (error) {
      console.error('Error accepting request:', error)
      toast.error("Failed to accept request")
    }
  }

  const denyFriendRequest = async (requestId: number) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('id', requestId)

      if (error) throw error

      setFriendRequests(prev => prev.filter(req => req.id !== requestId))
      toast.success("Request denied")
    } catch (error) {
      console.error('Error denying request:', error)
      toast.error("Failed to deny request")
    }
  };

  const formatShortAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    return `${Math.floor(diffInSeconds / 86400)}d`
  }

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || '??'
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-7xl mx-auto w-full space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-balance">Social Hub</h1>
                <p className="text-muted-foreground mt-1">Connect with classmates and join study groups</p>
              </div>
            </div>

            {/* Overview stats - Conditional for Teachers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentUserRole !== 'teacher' && (
                <>
                  <Card className="border shadow-none">
                    <CardContent className="px-3 py-1 flex items-center justify-between">
                      <div className="text-base text-muted-foreground">Connections</div>
                      <div className="text-2xl font-bold">{connections.length}</div>
                    </CardContent>
                  </Card>
                </>
              )}
              <Card className="border shadow-none">
                <CardContent className="px-3 py-1 flex items-center justify-between">
                  <div className="text-base text-muted-foreground">Teachers</div>
                  <div className="text-2xl font-bold">{teachers.length}</div>
                </CardContent>
              </Card>
              {currentUserRole !== 'teacher' && (
                <Card className="border shadow-none">
                  <CardContent className="px-3 py-1 flex items-center justify-between">
                    <div className="text-base text-muted-foreground">Pending Requests</div>
                    <div className="text-2xl font-bold">{friendRequests.length}</div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Global Search */}
            <Card>
              <CardHeader className="py-3">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">Search People</CardTitle>
                    <CardDescription className="text-sm">Find students across the institute</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Select value={globalBranchFilter} onValueChange={setGlobalBranchFilter}>
                      <SelectTrigger className="w-[180px] h-9">
                        <SelectValue placeholder="Branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        <SelectItem value="computer-technology">Computer Technology</SelectItem>
                        <SelectItem value="civil-engineering">Civil Engineering</SelectItem>
                        <SelectItem value="mechanical-engineering">Mechanical Engineering</SelectItem>
                        <SelectItem value="electrical-engineering">Electrical Engineering</SelectItem>
                        <SelectItem value="electronics-and-telecommunication">Electronics & Telecomm</SelectItem>
                        <SelectItem value="information-technology">Information Technology</SelectItem>
                        <SelectItem value="artificial-intelligence-and-machine-learning">AI & ML</SelectItem>
                        <SelectItem value="dress-designing-and-garment-manufacturing">Dress Designing</SelectItem>
                        <SelectItem value="interior-design-and-decoration">Interior Design</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={globalSemesterFilter} onValueChange={setGlobalSemesterFilter}>
                      <SelectTrigger className="w-[140px] h-9">
                        <SelectValue placeholder="Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Semesters</SelectItem>
                        <SelectItem value="1">1st Semester</SelectItem>
                        <SelectItem value="2">2nd Semester</SelectItem>
                        <SelectItem value="3">3rd Semester</SelectItem>
                        <SelectItem value="4">4th Semester</SelectItem>
                        <SelectItem value="5">5th Semester</SelectItem>
                        <SelectItem value="6">6th Semester</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search by name, branch..."
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        className="pl-10 h-9"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filteredPublicStudents.slice(0, 21).map((s) => (
                      <Card key={s.id} className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => handleStudentInfoClick(s)}>
                        <CardContent className="px-3 py-2">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage src={s.avatar} alt={s.name} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                {getInitials(s.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium text-base truncate" title={s.name}>{s.name}</div>
                              <div className="text-sm text-muted-foreground truncate" title={`${s.branch} • ${s.semester}`}>
                                {s.branch} • {s.semester}
                              </div>
                            </div>
                            <div className="ml-auto inline-flex items-center gap-2">
                              {isConnected(s.id) ? (
                                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openPersonalChat(s); }}>
                                  <MessageCircle className="w-3 h-3" />
                                </Button>
                              ) : isRequestSent(s.id) ? (
                                <Badge variant="secondary" className="text-xs">Requested</Badge>
                              ) : isRequestReceived(s.id) ? (
                                <Badge variant="secondary" className="text-xs">Pending Accept</Badge>
                              ) : (
                                currentUserRole === 'teacher' ? (
                                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openPersonalChat(s); }}>
                                    <MessageCircle className="w-3 h-3" />
                                  </Button>
                                ) : (
                                  <Button size="sm" onClick={(e) => { e.stopPropagation(); sendConnectRequest(s); }}>Connect</Button>
                                )
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {filteredPublicStudents.length === 0 && (
                      <div className="text-sm text-muted-foreground">No students found</div>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Single-page layout starts */}
            <div className="grid gap-4">
              <Card>
                <CardHeader className="py-3">

                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{currentUserRole === 'teacher' ? 'All Students' : 'Your Classmates'}</CardTitle>
                      <CardDescription className="text-sm">{currentUserRole === 'teacher' ? 'Search and manage students' : 'Students in your branch'}</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                      {currentUserRole === 'teacher' && (
                        <>
                          <Select value={branchFilter} onValueChange={setBranchFilter}>
                            <SelectTrigger className="w-[180px] h-9">
                              <SelectValue placeholder="Branch" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Branches</SelectItem>
                              <SelectItem value="computer-technology">Computer Technology</SelectItem>
                              <SelectItem value="civil-engineering">Civil Engineering</SelectItem>
                              <SelectItem value="mechanical-engineering">Mechanical Engineering</SelectItem>
                              <SelectItem value="electrical-engineering">Electrical Engineering</SelectItem>
                              <SelectItem value="electronics-and-telecommunication">Electronics & Telecomm</SelectItem>
                              <SelectItem value="information-technology">Information Technology</SelectItem>
                              <SelectItem value="artificial-intelligence-and-machine-learning">AI & ML</SelectItem>
                              <SelectItem value="dress-designing-and-garment-manufacturing">Dress Designing</SelectItem>
                              <SelectItem value="interior-design-and-decoration">Interior Design</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                            <SelectTrigger className="w-[140px] h-9">
                              <SelectValue placeholder="Semester" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Semesters</SelectItem>
                              <SelectItem value="1">1st Semester</SelectItem>
                              <SelectItem value="2">2nd Semester</SelectItem>
                              <SelectItem value="3">3rd Semester</SelectItem>
                              <SelectItem value="4">4th Semester</SelectItem>
                              <SelectItem value="5">5th Semester</SelectItem>
                              <SelectItem value="6">6th Semester</SelectItem>
                            </SelectContent>
                          </Select>
                        </>
                      )}
                      <div className="relative w-full sm:w-56">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder={currentUserRole === 'teacher' ? "Search student name..." : "Search classmates..."}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 h-9"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
                    {(showAllClassmates ? filteredClassmates : filteredClassmates.slice(0, 12)).map((c) => (
                      <Card key={c.id} className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => handleStudentInfoClick(c)}>
                        <CardContent className="px-3 py-2">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage src={c.avatar} alt={c.name} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                {getInitials(c.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium text-base truncate" title={c.name}>{c.name}</div>
                              <div className="text-sm text-muted-foreground truncate" title={`${c.branch} • ${c.semester}`}>
                                {c.branch} • {c.semester}
                              </div>
                            </div>
                            <div className="ml-auto inline-flex items-center gap-2">
                              {isConnected(c.id) ? (
                                <Button variant="outline" size="sm" className="h-8" onClick={(e) => { e.stopPropagation(); openPersonalChat(c); }}>
                                  <MessageCircle className="w-3 h-3" />
                                </Button>
                              ) : isRequestSent(c.id) ? (
                                <Badge variant="secondary" className="text-xs">Requested</Badge>
                              ) : isRequestReceived(c.id) ? (
                                <Badge variant="secondary" className="text-xs">Pending Accept</Badge>
                              ) : (
                                currentUserRole === 'teacher' ? (
                                  <Button variant="outline" size="sm" className="h-8" onClick={(e) => { e.stopPropagation(); openPersonalChat(c); }}>
                                    <MessageCircle className="w-3 h-3" />
                                  </Button>
                                ) : (
                                  <Button size="sm" className="h-8 px-3" onClick={(e) => { e.stopPropagation(); sendConnectRequest(c); }}>Connect</Button>
                                )
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {filteredClassmates.length === 0 && (
                      <div className="text-sm text-muted-foreground col-span-full text-center py-4">No classmates found</div>
                    )}
                  </div>
                  {filteredClassmates.length > 12 && (
                    <div className="flex justify-center mt-3">
                      <Button variant="outline" size="sm" onClick={() => setShowAllClassmates((v) => !v)}>
                        {showAllClassmates ? "Show less" : `Show all (${filteredClassmates.length})`}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Teachers list */}
              <Card>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-xl">Teachers</CardTitle>
                      <CardDescription className="text-sm">Message teachers directly</CardDescription>
                    </div>
                    <div className="relative w-56">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search teachers..."
                        value={teacherSearch}
                        onChange={(e) => setTeacherSearch(e.target.value)}
                        className="pl-10 h-9"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
                    {filteredTeachers.map((t) => (
                      <Card key={t.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="px-3 py-2">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage src={t.avatar} alt={t.name} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                {getInitials(t.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium text-base truncate" title={t.name}>{t.name}</div>
                              <div className="text-sm text-muted-foreground truncate" title={t.branch}>{t.branch}</div>
                            </div>
                            <div className="ml-auto inline-flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openPersonalChat(t); }}>
                                <MessageCircle className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {filteredTeachers.length === 0 && (
                      <div className="text-sm text-muted-foreground col-span-full text-center py-4">No teachers found</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {currentUserRole !== 'teacher' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center text-xl">
                          <UserPlus className="w-5 h-5 mr-2" />
                          Friend Requests
                        </CardTitle>
                        {friendRequests.length > 0 && <Badge variant="secondary" className="text-sm whitespace-nowrap">{friendRequests.length} pending</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {friendRequests.length === 0 ? (
                        <div className="text-center py-6">
                          <UserCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                          <h3 className="text-lg font-medium mb-1">No pending requests</h3>
                          <p className="text-muted-foreground">You're all caught up! No new friend requests at the moment.</p>
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto pr-2 scrollbar-none hover:scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 scrollbar-thumb-rounded-full transition-all duration-300"
                          style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "rgb(203 213 225) transparent",
                          }}>
                          <div className="space-y-3">
                            {friendRequests.map((r) => (
                              <Card key={r.id} className="hover:shadow-sm transition-shadow">
                                <CardContent className="px-3 py-2">
                                  <div className="flex items-center gap-2.5">
                                    <Avatar className="w-8 h-8 flex-shrink-0">
                                      <AvatarImage src={r.requester?.avatar} alt={r.requester?.name} />
                                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                        {getInitials(r.requester?.name || '??')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                      <div className="font-medium text-base truncate" title={r.requester?.name}>{r.requester?.name}</div>
                                      <div className="text-sm text-muted-foreground truncate" title={`${r.requester?.branch} • ${r.requester?.semester}`}>
                                        {r.requester?.branch} • {r.requester?.semester}
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1 truncate" title={r.created_at}>
                                        {formatShortAgo(r.created_at)}
                                      </div>
                                    </div>
                                    <div className="ml-auto inline-flex items-center gap-2">
                                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => acceptFriendRequest(r.id)}>
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Accept
                                      </Button>
                                      <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => denyFriendRequest(r.id)}>
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Deny
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-xl">Sent Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {sentRequests.length === 0 ? (
                        <div className="text-center py-6">
                          <h3 className="text-lg font-medium mb-1">No pending sent requests</h3>
                          <p className="text-muted-foreground">Any requests you send will appear here until accepted.</p>
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto pr-2 scrollbar-none hover:scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 scrollbar-thumb-rounded-full transition-all duration-300"
                          style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "rgb(203 213 225) transparent",
                          }}>
                          <div className="space-y-3">
                            {sentRequests.map((r) => (
                              <Card key={r.id} className="hover:shadow-sm transition-shadow">
                                <CardContent className="px-3 py-2">
                                  <div className="flex items-center gap-2.5">
                                    <Avatar className="w-8 h-8 flex-shrink-0">
                                      <AvatarImage src={r.recipient?.avatar} alt={r.recipient?.name} />
                                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                        {getInitials(r.recipient?.name || '??')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                      <div className="font-medium text-base truncate" title={r.recipient?.name}>{r.recipient?.name}</div>
                                      <div className="text-sm text-muted-foreground truncate" title={`${r.recipient?.branch} • ${r.recipient?.semester}`}>
                                        {r.recipient?.branch} • {r.recipient?.semester}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className="text-xs">Pending</Badge>
                                      <Badge variant="outline" className="text-xs text-muted-foreground">Sent {formatShortAgo(r.created_at)}</Badge>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
            {/* end grid */}
          </div>
        </main>
      </div>
      <StudentProfilePopup
        student={selectedStudentInfo}
        isOpen={showStudentInfo}
        onClose={() => setShowStudentInfo(false)}
      />
    </div >
  )
}

export default SocialPage
