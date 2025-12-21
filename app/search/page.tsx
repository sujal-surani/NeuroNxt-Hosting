"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  BookOpen,
  Users,
  TrendingUp,
  Clock,
  Eye,
  Heart,
  FileText,
  Video,
  Mic,
  ImageIcon,
  Link as LinkIcon,
  GraduationCap,
  MessageCircle,
  Loader2,
  Copy,
  Grid,
  List,
  Pin,
  Play,
  Pause,
  Volume2,
  ExternalLink,
  Bookmark,
  Brain,
  CheckCircle,
  Circle,
  CircleCheck,
  User,
  Target,
  X,
  Trash2,
  Download,
  FileImage,
  Star,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatBranchName } from "@/lib/utils"
import { toast } from "sonner"
import { StudentProfilePopup } from "@/components/student-profile-popup"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"

interface Note {
  id: number
  title: string
  description: string
  content: string
  type: "text" | "pdf" | "video" | "audio" | "link" | "voice" | "image"
  difficulty: string
  subject: string
  branch: string
  semester: number
  author_name: string
  authorId: string // Mapped from author_id
  author_avatar: string
  created_at: string // used for uploadDate logic
  views: number
  likes: number
  tags: string[]
  thumbnail: string
  saved: boolean
  pinned: boolean
  folder: string
  lastModified: string
  wordCount: number
  readingTime: string
  rating: number
  url?: string
  fileName?: string
  duration?: string
  fileSize?: string
}

interface Person {
  id: string
  full_name: string
  avatar_url: string
  branch: string
  semester: string
  role: string
  notesCount: number
  followers: number
  email?: string
  bio?: string
  status?: "online" | "offline" | "away"
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
}

interface SearchResults {
  notes: Note[]
  teachers: Person[]
  students: Person[]
}

const typeIcons = {
  document: FileText,
  video: Video,
  audio: Mic,
  image: ImageIcon,
  link: LinkIcon,
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  // scope: 'notes' | 'people' | null (null = all)
  const [searchScope, setSearchScope] = useState<"notes" | "people" | null>(null)

  const [results, setResults] = useState<SearchResults>({ notes: [], teachers: [], students: [] })
  const [isLoading, setIsLoading] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 6

  // Social connection state
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [sentRequests, setSentRequests] = useState<Connection[]>([])
  const [friendRequests, setFriendRequests] = useState<Connection[]>([])

  // Note Interaction State
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [likedNotes, setLikedNotes] = useState<Set<number>>(new Set())
  const [savedNotes, setSavedNotes] = useState<Set<number>>(new Set())
  const [completedNotes, setCompletedNotes] = useState<Set<number>>(new Set())

  const [showStudentInfo, setShowStudentInfo] = useState(false)
  const [selectedStudentInfo, setSelectedStudentInfo] = useState<any>(null)

  const handleStudentInfoClick = (student: Person) => {
    // Only open for students, not teachers if that's the desired behavior, 
    // but the user said "just like social page" where teachers also open profile?
    // Actually social page opens profile for both.
    // However, Person interface here might not match exactly what StudentProfilePopup expects.
    // Let's assume compatibility or map it.
    setSelectedStudentInfo({
      ...student,
      name: student.full_name,
      avatar: student.avatar_url,
      // map other fields if necessary
    })
    setShowStudentInfo(true)
  }

  const supabase = createClient()

  // Helper Functions
  const getNoteTypeIcon = (type: Note["type"], themed = false) => {
    const themedClass = "h-4 w-4 text-primary"
    const defaultClass = "h-4 w-4 text-muted-foreground"
    switch (type) {
      case "text": return <FileText className={themed ? themedClass : defaultClass} />
      case "pdf": return <FileText className={themed ? themedClass : defaultClass} />
      case "video": return <Video className={themed ? themedClass : defaultClass} />
      case "audio": return <Volume2 className={themed ? themedClass : defaultClass} />
      case "link": return <LinkIcon className={themed ? themedClass : defaultClass} />
      case "voice": return <Mic className={themed ? themedClass : defaultClass} />
      case "image": return <FileImage className={themed ? themedClass : defaultClass} />
      default: return <FileText className={themed ? themedClass : defaultClass} />
    }
  }

  const getNoteTypeLabel = (type: Note["type"]) => {
    switch (type) {
      case "text": return "Text"
      case "pdf": return "PDF"
      case "video": return "Video"
      case "audio": return "Audio"
      case "link": return "Link"
      case "voice": return "Voice"
      case "image": return "Image"
      default: return "Unknown"
    }
  }

  const getBranchAbbreviation = (branch: string): string => {
    if (!branch) return ""
    if (branch === "Computer Technology" || branch.toLowerCase() === "computer-technology") return "CM"
    const letters = (branch.match(/[A-Za-z]+/g) || []).map((w) => w[0]).join("").toUpperCase()
    return letters
  }

  const getCurrentLikeCount = (note: Note) => note.likes
  const isNoteSaved = (noteId: number) => savedNotes.has(noteId)

  const toggleLike = async (noteId: number) => {
    if (!currentUserId) {
      toast.error("Please login to like notes")
      return
    }

    const isLiked = likedNotes.has(noteId)
    // Optimistic update
    setLikedNotes((prev) => {
      const newLiked = new Set(prev)
      if (isLiked) newLiked.delete(noteId)
      else newLiked.add(noteId)
      return newLiked
    })

    setResults(prev => ({
      ...prev,
      notes: prev.notes.map(n => n.id === noteId ? { ...n, likes: n.likes + (isLiked ? -1 : 1) } : n)
    }))

    try {
      if (isLiked) {
        await supabase.from('note_likes').delete().eq('user_id', currentUserId).eq('note_id', noteId)
      } else {
        await supabase.from('note_likes').insert({ user_id: currentUserId, note_id: noteId })
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error("Failed to update like")
      // Revert
      setLikedNotes((prev) => {
        const newLiked = new Set(prev)
        if (isLiked) newLiked.add(noteId)
        else newLiked.delete(noteId)
        return newLiked
      })
      setResults(prev => ({
        ...prev,
        notes: prev.notes.map(n => n.id === noteId ? { ...n, likes: n.likes + (isLiked ? 1 : -1) } : n)
      }))
    }
  }

  const toggleSave = async (noteId: number) => {
    if (!currentUserId) {
      toast.error("Please login to save notes")
      return
    }

    const isSaved = savedNotes.has(noteId)
    setSavedNotes((prev) => {
      const newSaved = new Set(prev)
      if (isSaved) newSaved.delete(noteId)
      else newSaved.add(noteId)
      return newSaved
    })

    setResults(prev => ({
      ...prev,
      notes: prev.notes.map(n => n.id === noteId ? { ...n, saved: !isSaved } : n)
    }))

    try {
      if (isSaved) {
        await supabase.from('note_saves').delete().eq('user_id', currentUserId).eq('note_id', noteId)
      } else {
        await supabase.from('note_saves').insert({ user_id: currentUserId, note_id: noteId })
      }
    } catch (error) {
      console.error('Error toggling save:', error)
      toast.error("Failed to update save")
      setSavedNotes((prev) => {
        const newSaved = new Set(prev)
        if (isSaved) newSaved.add(noteId)
        else newSaved.delete(noteId)
        return newSaved
      })
      setResults(prev => ({
        ...prev,
        notes: prev.notes.map(n => n.id === noteId ? { ...n, saved: isSaved } : n)
      }))
    }
  }

  const toggleCompleted = async (noteId: number) => {
    if (!currentUserId) {
      toast.error("Please login to mark notes as studied")
      return
    }

    const isCompleted = completedNotes.has(noteId)
    setCompletedNotes((prev) => {
      const next = new Set(prev)
      if (isCompleted) next.delete(noteId)
      else next.add(noteId)
      return next
    })

    try {
      if (isCompleted) {
        await supabase.from('note_completions').delete().eq('user_id', currentUserId).eq('note_id', noteId)
      } else {
        await supabase.from('note_completions').insert({ user_id: currentUserId, note_id: noteId })
      }
    } catch (error) {
      console.error('Error toggling completion:', error)
      setCompletedNotes((prev) => {
        const next = new Set(prev)
        if (isCompleted) next.add(noteId)
        else next.delete(noteId)
        return next
      })
    }
  }

  const openNoteViewer = async (note: Note) => {
    setSelectedNote(note)
    setIsViewerOpen(true)
    if (currentUserId) {
      await supabase.rpc('increment_view_count', { note_id: note.id, p_user_id: currentUserId })
    }
  }

  const summarizeNote = async (note: Note) => {
    setIsSummarizing(true)
    await new Promise((r) => setTimeout(r, 800))
    setSummary(`Summary: ${note.description.slice(0, 120)}${note.description.length > 120 ? '...' : ''}`)
    setIsSummarizing(false)
  }

  const copyNote = (note: any) => {
    navigator.clipboard.writeText(note.content)
    toast.success("Content copied to clipboard")
  }

  const downloadNote = (note: any) => {
    if (note.url && note.type !== 'link') {
      const a = document.createElement("a")
      a.href = note.url
      a.download = note.fileName || note.title || "download"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else {
      const blob = new Blob([note.content], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${note.title}.md`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm("Are you sure you want to delete this note? This action cannot be undone.")) return

    try {
      const { error } = await supabase.from('notes').delete().eq('id', noteId)

      if (error) {
        console.error('Error deleting note:', error)
        toast.error("Failed to delete note")
      } else {
        setResults(prev => ({
          ...prev,
          notes: prev.notes.filter(n => n.id !== noteId)
        }))
        if (selectedNote?.id === noteId) {
          setIsViewerOpen(false)
          setSelectedNote(null)
        }
        toast.success("Note deleted successfully")
      }
    } catch (e) {
      console.error('Error deleting note:', e)
      toast.error("An unexpected error occurred")
    }
  }

  // Fetch interactions on mount/auth
  useEffect(() => {
    const fetchInteractions = async () => {
      if (!currentUserId) return
      const { data: likesData } = await supabase.from('note_likes').select('note_id').eq('user_id', currentUserId)
      if (likesData) setLikedNotes(new Set(likesData.map((l: any) => l.note_id)))

      const { data: savesData } = await supabase.from('note_saves').select('note_id').eq('user_id', currentUserId)
      if (savesData) setSavedNotes(new Set(savesData.map((s: any) => s.note_id)))

      const { data: completionsData } = await supabase.from('note_completions').select('note_id').eq('user_id', currentUserId)
      if (completionsData) setCompletedNotes(new Set(completionsData.map((c: any) => c.note_id)))
    }
    fetchInteractions()
  }, [currentUserId])

  // Initialize data
  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)

        // Fetch connections
        const { data: connectionsData } = await supabase
          .from('connections')
          .select('*')
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)

        if (connectionsData) {
          const accepted = connectionsData.filter((c: any) => c.status === 'accepted')
          const pendingReceived = connectionsData.filter((c: any) => c.status === 'pending' && c.recipient_id === user.id)
          const pendingSent = connectionsData.filter((c: any) => c.status === 'pending' && c.requester_id === user.id)

          setConnections(accepted)
          setFriendRequests(pendingReceived)
          setSentRequests(pendingSent)
        }
      }
    }
    initData()
  }, [])

  // Initialize from URL params
  useEffect(() => {
    const query = searchParams.get("q")
    if (query) {
      setSearchQuery(query)
    }
  }, [searchParams])

  // Reset page on search change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, searchScope])

  const performSearch = useCallback(async (query: string, scope: "notes" | "people" | null) => {
    const normalizedQuery = query.toLowerCase().trim()

    if (!normalizedQuery) {
      setResults({ notes: [], teachers: [], students: [] })
      return
    }

    setIsLoading(true)
    try {
      // Determine what to fetch
      const fetchNotes = scope === "notes" || scope === null
      const fetchPeople = scope === "people" || scope === null

      const notesPromise = (async () => {
        if (!fetchNotes) return []

        let queryBuilder = supabase
          .from('notes')
          .select('*')
          .or(`title.ilike.%${normalizedQuery}%,description.ilike.%${normalizedQuery}%,subject.ilike.%${normalizedQuery}%`)
          .limit(20)

        const { data, error } = await queryBuilder
        if (error) throw error

        return (data || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          content: item.content || "",
          type: item.type as any,
          difficulty: item.difficulty,
          subject: item.subject,
          branch: item.branch,
          semester: item.semester,
          author_name: item.author_name || "Unknown",
          authorId: item.author_id,
          author_avatar: item.author_avatar || "U",
          created_at: item.created_at,
          views: item.views,
          likes: item.likes,
          tags: item.tags || [],
          thumbnail: "/placeholder.jpg",
          saved: savedNotes.has(item.id),
          pinned: false,
          folder: item.subject,
          lastModified: item.created_at,
          wordCount: 0,
          readingTime: "5 min read",
          rating: 0,
          url: item.file_url,
          fileName: item.file_name,
          fileSize: item.file_size,
        })) as Note[]
      })()

      const peoplePromise = (async () => {
        if (!fetchPeople) return { teachers: [], students: [] }

        let queryBuilder = supabase
          .from('profiles')
          .select('*')
          .or(`full_name.ilike.%${normalizedQuery}%,branch.ilike.%${normalizedQuery}%`)
          .limit(50)

        const { data, error } = await queryBuilder
        if (error) throw error

        const people = (data || []).map((p: any) => ({
          id: p.id,
          full_name: p.full_name || 'Unknown',
          avatar_url: p.avatar_url,
          branch: formatBranchName(p.branch) || 'General',
          semester: p.semester || '1',
          role: p.role,
          notesCount: 0,
          followers: 0,
          email: p.email,
          bio: p.bio,
          status: "offline",
          location: p.location,
          enrollment: p.enrollment_number,
          studyStreak: p.study_streak || 0,
          quizzesCompleted: p.quizzes_completed || 0,
          interests: p.interests || []
        })) as Person[]

        // Separate teachers and students
        const teachers = people.filter(p => p.role === 'teacher' && p.id !== currentUserId)
        const students = people.filter(p => p.role === 'student' && p.id !== currentUserId)

        return { teachers, students }
      })()

      const [notes, peopleData] = await Promise.all([notesPromise, peoplePromise])

      setResults({
        notes: notes || [],
        teachers: peopleData.teachers || [],
        students: peopleData.students || []
      })

    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsLoading(false)
    }
  }, [currentUserId, savedNotes]) // Re-create when user ID or saved notes change

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery, searchScope)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchScope, performSearch, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchQuery, searchScope)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Helper to format branch name
  const formatBranch = (branch: string) => {
    return branch
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Social Helper Functions
  const isConnected = (userId: string) => {
    return connections.some(c =>
      (c.requester_id === userId && c.recipient_id === currentUserId) ||
      (c.recipient_id === userId && c.requester_id === currentUserId)
    )
  }

  const isRequestSent = (userId: string) => {
    return sentRequests.some(r => r.recipient_id === userId && r.requester_id === currentUserId)
  }

  const isRequestReceived = (userId: string) => {
    return friendRequests.some(r => r.requester_id === userId && r.recipient_id === currentUserId)
  }

  const sendConnectRequest = async (person: Person) => {
    if (!currentUserId) return

    try {
      const { data, error } = await supabase
        .from('connections')
        .upsert({
          requester_id: currentUserId,
          recipient_id: person.id,
          status: 'pending'
        }, {
          onConflict: 'requester_id, recipient_id'
        })
        .select()
        .single()

      if (error) throw error

      setSentRequests(prev => [...prev, data])
      toast.success("Connection request sent!")
    } catch (error) {
      console.error('Error sending request:', error)
      toast.error("Failed to send request")
    }
  }

  const openPersonalChat = (person: Person) => {
    router.push(`/chat?person=${encodeURIComponent(person.full_name)}&id=${person.id}`)
  }

  // Helper to render person card
  const renderPersonCard = (person: Person) => (
    <Card key={person.id} className="group transition-all duration-300 cursor-pointer" onClick={() => handleStudentInfoClick(person)}>
      <CardContent className="p-4 flex items-center gap-4">
        <Avatar className="w-12 h-12 border-2 border-border group-hover:border-primary transition-colors">
          <AvatarImage src={person.avatar_url} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {person.full_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 grid gap-0.5">
          <h4 className="font-bold text-base truncate leading-none">{person.full_name}</h4>
          <p className="text-sm text-muted-foreground truncate font-medium">
            {person.role === 'teacher' ? formatBranch(person.branch) : `${formatBranch(person.branch)} • ${person.semester || '1st'} Sem`}
          </p>
        </div>

        <div className="flex-shrink-0">
          {person.id === currentUserId ? (
            null
          ) : isConnected(person.id) ? (
            <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:text-primary hover:bg-primary/10 rounded-full cursor-pointer" onClick={(e) => { e.stopPropagation(); openPersonalChat(person); }}>
              <MessageCircle className="w-5 h-5" />
            </Button>
          ) : isRequestSent(person.id) ? (
            <Badge variant="outline" className="text-xs h-7 px-3 text-muted-foreground bg-muted/50">Requested</Badge>
          ) : isRequestReceived(person.id) ? (
            <div className="flex flex-col gap-1">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer">Accept</Badge>
            </div>
          ) : (
            <Button size="sm" className="h-8 text-xs px-4 font-medium rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={(e) => { e.stopPropagation(); sendConnectRequest(person); }}>
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const showNotes = (searchScope === "notes" || searchScope === null) && results.notes.length > 0
  const showTeachers = (searchScope === "people" || searchScope === null) && results.teachers.length > 0
  const showStudents = (searchScope === "people" || searchScope === null) && results.students.length > 0
  // Handle empty state: if queried but no results for active scope
  const hasNotes = results.notes.length > 0
  const hasPeople = results.teachers.length > 0 || results.students.length > 0
  const noResults = searchQuery && !isLoading && !hasNotes && !hasPeople

  // Pagination Logic
  const totalPeople = Math.max(results.teachers.length, results.students.length) // Simplified max page logic
  const paginatedTeachers = results.teachers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const paginatedStudents = results.students.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Calculate total pages based on the longest list to ensure we can reach the end of everything
  const maxItems = Math.max(results.teachers.length, results.students.length)
  const totalPages = Math.ceil(maxItems / ITEMS_PER_PAGE)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-balance">Search Results</h1>
              <p className="text-muted-foreground mt-1">
                Find notes, topics, and classmates
              </p>
            </div>

            {/* Search Interface */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder={
                        searchScope === "notes"
                          ? "Search for notes by title, subject, description..."
                          : searchScope === "people"
                            ? "Search for students and teachers by name..."
                            : "Search everywhere..."
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 text-lg h-12"
                    />
                  </form>
                </CardContent>
              </Card>

              {/* Scope Filter Tabs - Outside the box, right aligned */}
              <div className="flex justify-end">
                <div className="inline-flex bg-muted rounded-lg p-1">
                  <button
                    onClick={() => setSearchScope(null)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${searchScope === null
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSearchScope("notes")}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${searchScope === "notes"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Notes
                  </button>
                  <button
                    onClick={() => setSearchScope("people")}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${searchScope === "people"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <Users className="w-4 h-4" />
                    People
                  </button>
                </div>
              </div>
            </div>



            {/* Search Results */}
            {
              isLoading ? (
                <div className="text-center py-12 text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading results...
                </div>
              ) : searchQuery && (
                <div className="space-y-8">

                  {/* NOTES VIEW */}
                  {showNotes && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center">
                        <BookOpen className="w-5 h-5 mr-2" />
                        Notes ({results.notes.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {results.notes.map((note) => (
                          <Card
                            key={note.id}
                            className="group hover:shadow-lg transition-all duration-200 cursor-pointer bg-card border-border px-0 py-1 gap-0 flex flex-col min-h-[400px]"
                            onClick={() => openNoteViewer(note)}
                          >
                            <CardHeader className="px-4 pt-4 pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0 pr-2">
                                  <div className="flex items-center gap-2 mb-5 flex-wrap">
                                    <div className="flex items-center gap-1">
                                      {getNoteTypeIcon(note.type)}
                                      <Badge variant="secondary" className="text-xs">
                                        {getNoteTypeLabel(note.type)}
                                      </Badge>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                      {note.subject}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                                      {note.difficulty}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                                      {getBranchAbbreviation(note.branch)} - Sem {note.semester}
                                    </Badge>
                                  </div>
                                  <div className="text-base font-semibold leading-tight text-balance break-words mb-3 line-clamp-2">{note.title}</div>
                                  <p className="mt-2 line-clamp-3 text-pretty text-sm text-muted-foreground mb-4">{note.description}</p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleSave(note.id)
                                    }}
                                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${isNoteSaved(note.id) ? "text-primary hover:text-primary" : "hover:text-primary"
                                      }`}
                                    aria-label={isNoteSaved(note.id) ? "Unsave" : "Save"}
                                  >
                                    <Bookmark className={`h-4 w-4 ${isNoteSaved(note.id) ? "fill-current" : ""}`} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openNoteViewer(note)
                                      setTimeout(() => summarizeNote(note), 0)
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
                                    aria-label="Summarize"
                                  >
                                    <Brain className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleCompleted(note.id)
                                    }}
                                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${completedNotes.has(note.id) ? "text-primary" : "hover:text-primary"
                                      }`}
                                    aria-label="Studied"
                                  >
                                    {completedNotes.has(note.id) ? (
                                      <CircleCheck className="h-4 w-4" />
                                    ) : (
                                      <Circle className="h-4 w-4" />
                                    )}
                                  </Button>
                                  {currentUserId === note.authorId && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteNote(note.id)
                                      }}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-500/10"
                                      aria-label="Delete Note"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="px-4 pt-2 pb-4 flex flex-col flex-1">
                              <div className="flex flex-wrap gap-2 mb-4">
                                {note.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {note.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{note.tags.length - 3}
                                  </Badge>
                                )}
                              </div>

                              <div className="mt-auto space-y-3">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                  <div className="flex items-center gap-4 min-w-0 flex-1 flex-wrap">
                                    <div className="flex items-center gap-1 min-w-0">
                                      <Avatar className="h-5 w-5 flex-shrink-0">
                                        <AvatarFallback className="text-xs">{note.author_avatar}</AvatarFallback>
                                      </Avatar>
                                      <span className="truncate">{note.author_name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 whitespace-nowrap">
                                      <Clock className="h-3 w-3" />
                                      <span>{note.readingTime}</span>
                                    </div>
                                    {(note.fileName || note.duration || note.fileSize) && (
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                        {note.duration && <span className="whitespace-nowrap">Duration: {note.duration}</span>}
                                        {note.fileSize && <span className="whitespace-nowrap">Size: {note.fileSize}</span>}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-2">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <span className="whitespace-nowrap">{formatDate(note.created_at)}</span>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <div className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      <span>{note.views}</span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleLike(note.id)
                                      }}
                                      className={`flex items-center gap-1 transition-colors hover:text-primary ${likedNotes.has(note.id) ? "text-primary" : ""
                                        }`}
                                    >
                                      <Heart className={`h-3 w-3 ${likedNotes.has(note.id) ? "fill-current" : ""}`} />
                                      <span>{getCurrentLikeCount(note)}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PEOPLE VIEW */}
                  {
                    (showTeachers || showStudents) && (
                      <div className="space-y-6">
                        {showTeachers && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center text-primary">
                              <GraduationCap className="w-5 h-5 mr-2" />
                              Teachers ({results.teachers.length})
                            </h3>
                            {paginatedTeachers.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {paginatedTeachers.map(renderPersonCard)}
                              </div>
                            ) : (
                              <div className="text-muted-foreground italic pl-2">No teachers found on this page.</div>
                            )}
                          </div>
                        )}

                        {showStudents && (
                          <div className={`space-y-4 ${showTeachers ? 'pt-4 border-t' : ''}`}>
                            <h3 className="text-lg font-semibold flex items-center">
                              <Users className="w-5 h-5 mr-2" />
                              Students ({results.students.length})
                            </h3>
                            {paginatedStudents.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {paginatedStudents.map(renderPersonCard)}
                              </div>
                            ) : (
                              <div className="text-muted-foreground italic pl-2">No students found on this page.</div>
                            )}
                          </div>
                        )}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="flex justify-center items-center gap-2 mt-8 pt-4 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="h-8 w-8 p-0"
                            >
                              &lt;
                            </Button>
                            <span className="text-sm font-medium px-2">
                              {currentPage} <span className="text-muted-foreground">/ {totalPages}</span>
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="h-8 w-8 p-0"
                            >
                              &gt;
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  }

                  {noResults && (
                    <div className="text-center py-12 text-muted-foreground">
                      No results found for "{searchQuery}". Try different keywords.
                    </div>
                  )}

                  {/* Empty State / Welcome */}
                  {
                    !searchQuery && (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Start Your Search</h3>
                          <p className="text-muted-foreground mb-6">
                            Select a category and type to find what you need.
                          </p>
                        </CardContent>
                      </Card>
                    )
                  }
                </div>
              )
            }
          </div>
        </main>

        <StudentProfilePopup
          isOpen={showStudentInfo}
          onClose={() => setShowStudentInfo(false)}
          student={selectedStudentInfo}
        />

        {/* Note Viewer Dialog */}
        <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
          <DialogContent className="w-[65vw] max-w-[65vw] h-[76vh] max-h-[80vh] overflow-auto flex flex-col p-0 bg-background border border-border shadow-2xl rounded-xl" style={{ maxWidth: '65vw', width: '65vw' }}>
            <DialogHeader className="sticky top-0 z-20 border-b border-border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50">
              <div className="p-6">
                <div className="flex items-center justify-between min-h-[84px]">
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex flex-col justify-center">
                      <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-tight mb-1 break-words line-clamp-2 text-balance">
                        {selectedNote?.title}
                      </h1>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {selectedNote?.description}
                      </p>
                      {selectedNote && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="secondary" className="text-2xs">{getNoteTypeLabel(selectedNote?.type)}</Badge>
                          <Badge variant="secondary" className="text-2xs">{selectedNote?.subject}</Badge>
                          <Badge variant="outline" className="text-2xs border-border text-muted-foreground">{selectedNote?.difficulty}</Badge>
                          <div className="flex items-center gap-1 text-2xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{selectedNote?.readingTime}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Action Buttons (icons only) */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectedNote && toggleLike(selectedNote!.id)}
                      aria-label="Like"
                    >
                      <Heart className={`w-4 h-4 ${selectedNote && likedNotes.has(selectedNote?.id) ? "fill-current text-primary" : ""}`} />
                    </Button>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => selectedNote && toggleSave(selectedNote!.id)} aria-label={isNoteSaved(selectedNote?.id || 0) ? "Unsave" : "Save"}>
                        <Bookmark className={`w-4 h-4 ${isNoteSaved(selectedNote?.id || 0) ? "fill-current" : ""}`} />
                      </Button>
                      {selectedNote?.type !== 'text' && selectedNote?.type !== 'link' && (
                        <Button variant="outline" size="sm" onClick={() => selectedNote && downloadNote(selectedNote)} aria-label="Download">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => selectedNote && copyNote(selectedNote)} aria-label="Copy">
                        <Copy className="w-4 h-4" />
                      </Button>
                      {selectedNote && currentUserId === selectedNote?.authorId && (
                        <Button variant="outline" size="sm" onClick={() => handleDeleteNote(selectedNote!.id)} aria-label="Delete" className="text-red-500 border-red-200 hover:bg-red-500/10 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setIsViewerOpen(false)} aria-label="Close" autoFocus>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-auto">
              <div className="flex flex-col xl:flex-row h-full">
                {/* Main Content Area */}
                <div className="flex-1 p-6">
                  {(selectedNote?.type === 'text' || selectedNote?.type === 'link') ? (
                    <div className="bg-muted/30 rounded-2xl p-6 shadow-inner flex flex-col h-full overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                          {selectedNote?.type === 'link' ? <LinkIcon className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
                          {selectedNote?.type === 'link' ? 'Link Details' : 'Note Content'}
                        </h3>
                      </div>
                      <div className="bg-card rounded-xl p-5 border border-border flex-1 overflow-y-auto">
                        {selectedNote?.type === 'link' ? (
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">{selectedNote?.description}</p>
                            <a
                              href={selectedNote?.url || selectedNote?.content}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline break-all flex items-center gap-2"
                            >
                              <LinkIcon className="w-4 h-4" />
                              {selectedNote?.url || selectedNote?.content}
                            </a>
                          </div>
                        ) : (
                          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                            {selectedNote?.content}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/30 rounded-2xl p-6 shadow-inner flex flex-col overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          File Details
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <BookOpen className="w-4 h-4" />
                          <span>{selectedNote?.wordCount} words</span>
                        </div>
                      </div>

                      <div className="bg-card rounded-xl p-5 border border-border">
                        <div className="text-base md:text-lg font-semibold text-foreground break-all">
                          {selectedNote?.fileName || selectedNote?.title}
                        </div>
                        {selectedNote?.description && (
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            {selectedNote?.description}
                          </p>
                        )}
                        <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-3">
                          {selectedNote?.fileSize && <span>Size: {selectedNote?.fileSize}</span>}
                          {selectedNote?.duration && <span>Length: {selectedNote?.duration}</span>}
                          <span>Type: {selectedNote ? getNoteTypeLabel(selectedNote?.type) : ""}</span>
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Button
                            onClick={() => selectedNote && downloadNote(selectedNote)}
                            className="w-full"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download File
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (!selectedNote) return
                              const direct = (selectedNote?.url as string) || (selectedNote?.thumbnail as string)
                              if (direct) {
                                window.open(direct, "_blank")
                              }
                            }}
                            className="w-full"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open in new tab
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* Analytics box outside grey content container but inside left column */}
                  {/* Summarized section inserted as requested, between content and statistics */}
                  <div className="mt-3">
                    <div className="bg-muted/30 rounded-2xl p-4 border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Star className="w-4 h-4 text-primary" />
                          Summarized File
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectedNote && summarizeNote(selectedNote!)}
                          disabled={isSummarizing}
                        >
                          <Star className="w-4 h-4 mr-2" /> {isSummarizing ? "Summarizing" : "Generate Summary"}
                        </Button>
                      </div>
                      {summary ? (
                        <div className="space-y-3">
                          {/* Generated PDF file box */}
                          <div className="bg-card rounded-xl p-4 border border-border">
                            <div className="text-sm font-medium text-foreground break-all">
                              {(selectedNote?.title || "note").replace(/\s+/g, "_")}-summary.pdf
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Auto-generated PDF from AI summary</p>
                            <div className="mt-3 flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (!summary) return
                                  const blob = new Blob([summary], { type: "text/plain" })
                                  const url = URL.createObjectURL(blob)
                                  window.open(url, "_blank")
                                }}
                                aria-label="Open summary pdf"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" /> Open
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (!summary) return
                                  const blob = new Blob([summary], { type: "text/plain" })
                                  const url = URL.createObjectURL(blob)
                                  const a = document.createElement("a")
                                  a.href = url
                                  a.download = `${(selectedNote?.title || "note").replace(/\s+/g, "_")}-summary.pdf`
                                  a.click()
                                  URL.revokeObjectURL(url)
                                }}
                                aria-label="Download summary pdf"
                              >
                                <Download className="w-4 h-4 mr-2" /> Download
                              </Button>
                            </div>
                          </div>
                          {/* Actual summary content shown below */}
                          <div className="bg-card rounded-xl p-4 border border-border">
                            <h5 className="text-sm font-semibold text-foreground mb-2">Summary Content</h5>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No summary yet. Click Generate Summary to create one.</p>
                      )}
                    </div>
                  </div>

                  {/* Analytics box outside grey content container but inside left column */}
                  <div className="mt-3 mb-6">
                    <div className="bg-muted/30 rounded-2xl p-4 border border-border">
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        Statistics
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Reading Time</p>
                            <p className="text-sm font-semibold text-foreground">{selectedNote?.readingTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Views</p>
                            <p className="text-sm font-semibold text-foreground">{selectedNote?.views}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Likes</p>
                            <p className="text-sm font-semibold text-foreground">{selectedNote && getCurrentLikeCount(selectedNote)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Branch</p>
                            <p className="text-sm font-semibold text-foreground">{selectedNote?.branch}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-2" />
                </div>

                {/* Right Sidebar - Enhanced Details Panel */}
                <div className="w-full xl:w-88 p-5 bg-muted/20">
                  <div className="space-y-4 bg-muted/30 border border-border rounded-2xl p-4">


                    {/* Basic Information Section */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        Basic Information
                      </h4>

                      <div className="space-y-1">
                        <div className="bg-muted/30 rounded-xl p-3 divide-y divide-border">
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-primary" />
                              <span className="text-xs font-medium text-muted-foreground">Teacher</span>
                            </div>
                            <p className="text-sm font-semibold text-foreground">{selectedNote?.author_name}</p>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-primary" />
                              <span className="text-xs font-medium text-muted-foreground">Subject</span>
                            </div>
                            <p className="text-sm font-semibold text-foreground">{selectedNote?.subject}</p>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-primary" />
                              <span className="text-xs font-medium text-muted-foreground">Difficulty</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">{selectedNote?.difficulty}</span>
                              <span className="bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
                                Sem {selectedNote?.semester}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>


                    {/* Tags Section Redesign */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground">Tags</h4>
                      <div className="bg-card rounded-xl p-3 border border-border">
                        <div className="flex flex-wrap gap-2">
                          {selectedNote?.tags.map((tag: string) => (
                            <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium border border-border bg-muted/40">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>


                  </div>
                </div>
              </div>
            </div>

          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
