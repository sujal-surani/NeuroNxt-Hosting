"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// Dropdown menu removed from note cards
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  FileText,
  Download,
  Heart,
  // MoreVertical removed
  Eye,
  Clock,
  BookOpen,
  Star,
  Copy,
  Grid,
  List,
  Pin,
  LinkIcon,
  Mic,
  Video,
  FileImage,
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
  Plus,
  Upload,
  UploadCloud,
  File,
  Trash2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

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
  author: string
  authorId: string
  authorAvatar: string
  uploadDate: string
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

// Mock notes removed


export default function NotesPage() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [selectedBranch, setSelectedBranch] = useState("all")
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [selectedType, setSelectedType] = useState("all") // Added type filter
  const [sortBy, setSortBy] = useState("recent")
  const [viewMode, setViewMode] = useState("grid")
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Upload Form State
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [newNoteDescription, setNewNoteDescription] = useState("")
  const [newNoteSubject, setNewNoteSubject] = useState("")
  const [newNoteBranch, setNewNoteBranch] = useState("Computer Technology")
  const [newNoteSemester, setNewNoteSemester] = useState("1")
  const [newNoteDifficulty, setNewNoteDifficulty] = useState("Medium")
  const [newNoteType, setNewNoteType] = useState<Note["type"]>("text")
  const [newNoteContent, setNewNoteContent] = useState("")
  const [newNoteTags, setNewNoteTags] = useState("")
  const [newNoteReadingTime, setNewNoteReadingTime] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [likedNotes, setLikedNotes] = useState<Set<number>>(new Set())
  const [savedNotes, setSavedNotes] = useState<Set<number>>(new Set())
  const [completedNotes, setCompletedNotes] = useState<Set<number>>(new Set())
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const supabase = createClient()

  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  // Check auth and set user role
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setUserName(user.user_metadata?.full_name || "User")
        setUserRole(user.user_metadata?.role || "student")
      }
    }
    checkUser()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchNotes = async (pageNumber = 0, isLoadMore = false) => {
    if (!isLoadMore) setIsLoading(true)

    // Build query
    let query = supabase
      .from('notes')
      .select('*')

    // Apply filters
    if (debouncedSearchTerm) {
      query = query.or(`title.ilike.%${debouncedSearchTerm}%,description.ilike.%${debouncedSearchTerm}%`)
    }
    if (selectedBranch !== "all") {
      query = query.eq('branch', selectedBranch)
    }
    if (selectedSemester !== "all") {
      query = query.eq('semester', parseInt(selectedSemester))
    }
    if (selectedDifficulty !== "all") {
      query = query.eq('difficulty', selectedDifficulty)
    }
    if (selectedType !== "all") {
      query = query.eq('type', selectedType)
    }

    // Apply sorting
    switch (sortBy) {
      case "recent":
        query = query.order('created_at', { ascending: false })
        break
      case "oldest":
        query = query.order('created_at', { ascending: true })
        break
      case "title":
        query = query.order('title', { ascending: true })
        break
      case "views":
        query = query.order('views', { ascending: false })
        break
      case "likes":
        query = query.order('likes', { ascending: false })
        break
      // Rating and Saved sorting are tricky server-side without joins/aggregates. 
      // For MVP, we might keep client-side sort for "Saved" or just filter saved first if "Saved" sort is picked?
      // Let's handle "Saved" sort by just fetching normally and filtering client side for now, OR:
      // If "Saved" tab/sort is active, we should probably modify the query to ONLY fetch saved notes if showSavedOnly is on.
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Pagination
    const from = pageNumber * 12
    const to = from + 11
    query = query.range(from, to)

    const { data: notesData, error: notesError } = await query

    if (notesError) {
      console.error('Error fetching notes:', notesError)
      setIsLoading(false)
      return
    }

    // Checking length to determine if more pages exist
    if (notesData.length < 12) {
      setHasMore(false)
    } else {
      setHasMore(true)
    }

    // Fetch user interactions (Likes/Saves) - We do this once or per batch?
    // Doing it per batch is more efficient than fetching ALL user likes ever.
    // But currently we have a Set<number> for all user likes. 
    // Let's keep the existing "fetch all user interactions" logic separate or ensure we have it.
    // For now, assuming userInteractions are already fetched or we fetch them for these specific IDs?
    // To keep it simple and consistent with previous "Set" logic, let's just make sure we have the sets.
    // If we paginate, fetching ALL likes for a user might be okay (IDs are small). 
    // Let's keep the `fetchUserInteractions` separate.

    // Map notes
    const mappedNotes: Note[] = notesData.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      content: item.content || "",
      type: item.type as any,
      difficulty: item.difficulty,
      subject: item.subject,
      branch: item.branch,
      semester: item.semester,
      author: item.author_name || "Unknown",
      authorId: item.author_id,
      authorAvatar: item.author_avatar || "U",
      uploadDate: new Date(item.created_at).toLocaleDateString(),
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
    }))

    if (isLoadMore) {
      setNotes(prev => [...prev, ...mappedNotes])
    } else {
      setNotes(mappedNotes)
    }

    setIsLoading(false)
  }

  // Effect to fetch user interactions on mount/auth
  useEffect(() => {
    const fetchInteractions = async () => {
      if (!userId) return

      const { data: likesData } = await supabase.from('note_likes').select('note_id').eq('user_id', userId)
      if (likesData) setLikedNotes(new Set(likesData.map((l: any) => l.note_id)))

      const { data: savesData } = await supabase.from('note_saves').select('note_id').eq('user_id', userId)
      if (savesData) setSavedNotes(new Set(savesData.map((s: any) => s.note_id)))

      const { data: completionsData } = await supabase.from('note_completions').select('note_id').eq('user_id', userId)
      if (completionsData) setCompletedNotes(new Set(completionsData.map((c: any) => c.note_id)))
    }
    fetchInteractions()
  }, [userId])


  useEffect(() => {
    setPage(0)
    fetchNotes(0, false)
  }, [debouncedSearchTerm, selectedBranch, selectedSemester, selectedDifficulty, selectedType, sortBy, userId])
  // Added userId to dependency to refetch if user changes (though usually page reloads)

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchNotes(nextPage, true)
  }

  // Hardcoded filter options as we can't derive from paginated data
  const difficulties = ["all", "Easy", "Medium", "Hard"]
  // Static branches list to ensure upload options exist
  const branches = [
    "all",
    "Computer Technology",
    "Civil Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Electronics & Telecommunication"
    // Add other branches as needed
  ]
  const semesters = ["all", "1", "2", "3", "4", "5", "6"]
  const types = ["all", "text", "pdf", "video", "audio", "link", "voice", "image"]

  const getBranchAbbreviation = (branch: string): string => {
    if (!branch) return ""
    if (branch === "Computer Technology" || branch.toLowerCase() === "computer-technology") return "CM"
    const letters = (branch.match(/[A-Za-z]+/g) || []).map((w) => w[0]).join("").toUpperCase()
    return letters
  }

  // Filter for Saved only (client side on top of server page)
  // This is a limitation: if "Saved" is not in current page, it won't show even if user has saved notes.
  // Ideally "Saved" should be a server filter OR a separate tab that ignores pagination/other filters or handles them differently.
  // For now, if "Saved" toggle is on, it filters the current page. User might feel it matches nothing.
  const filteredNotes = showSavedOnly ? notes.filter(n => savedNotes.has(n.id)) : notes

  // We rely on server sorting for most keys. 
  // Client side sort only needed if server didn't handle it (e.g. Rating, Saved).
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      // Server handled these, but no harm re-sorting tiny page if consistent. 
      // Main ones to handle here are those NOT in server query.
      case "rating":
        return b.rating - a.rating
      case "saved":
        return (savedNotes.has(b.id) ? 1 : 0) - (savedNotes.has(a.id) ? 1 : 0)
      default:
        return 0 // Preserve server order
    }
  })

  const openNoteViewer = async (note: Note) => {
    setSelectedNote(note)
    setIsViewerOpen(true)

    if (userId) {
      // Increment view count (unique per user)
      const { error } = await supabase.rpc('increment_view_count', { note_id: note.id, p_user_id: userId })
      if (!error) {
        // We can't easily know if it was actually incremented (unique check), 
        // so we might optimistically increment or just wait for next fetch.
        // For better UX, let's just assume it might increment, but since we don't know if it's the first time,
        // maybe we shouldn't optimistically update to avoid showing +1 when it didn't happen.
        // Or we could check if we already viewed it? Too complex for frontend.
        // Let's just NOT optimistically update views for now to ensure accuracy.
        // Or fetch the single note to get updated view count?
        // setNotes(prev => prev.map(n => n.id === note.id ? { ...n, views: n.views + 1 } : n))
      } else {
        console.error('Error incrementing view count:', error)
      }
    }
  }

  const toggleSave = async (noteId: number) => {
    if (!userId) {
      alert("Please login to save notes")
      return
    }

    const isSaved = savedNotes.has(noteId)

    // Optimistic update
    setSavedNotes((prev) => {
      const newSavedNotes = new Set(prev)
      if (isSaved) {
        newSavedNotes.delete(noteId)
      } else {
        newSavedNotes.add(noteId)
      }
      return newSavedNotes
    })

    setNotes(prev => prev.map(n => {
      if (n.id === noteId) {
        return { ...n, saved: !isSaved }
      }
      return n
    }))

    try {
      if (isSaved) {
        // Unsave
        const { error } = await supabase
          .from('note_saves')
          .delete()
          .eq('user_id', userId)
          .eq('note_id', noteId)

        if (error) throw error
      } else {
        // Save
        const { error } = await supabase
          .from('note_saves')
          .insert({ user_id: userId, note_id: noteId })

        if (error) throw error
      }
    } catch (error) {
      console.error('Error toggling save:', error)
      // Revert optimistic update
      setSavedNotes((prev) => {
        const newSavedNotes = new Set(prev)
        if (isSaved) {
          newSavedNotes.add(noteId)
        } else {
          newSavedNotes.delete(noteId)
        }
        return newSavedNotes
      })
      setNotes(prev => prev.map(n => {
        if (n.id === noteId) {
          return { ...n, saved: isSaved }
        }
        return n
      }))
    }
  }

  const togglePin = (noteId: number) => {
    // In a real app, this would update the backend
  }

  const toggleCompleted = async (noteId: number) => {
    if (!userId) {
      alert("Please login to mark notes as studied")
      return
    }

    const isCompleted = completedNotes.has(noteId)

    // Optimistic update
    setCompletedNotes((prev) => {
      const next = new Set(prev)
      if (next.has(noteId)) next.delete(noteId)
      else next.add(noteId)
      return next
    })

    try {
      if (isCompleted) {
        // Uncomplete
        const { error } = await supabase
          .from('note_completions')
          .delete()
          .eq('user_id', userId)
          .eq('note_id', noteId)

        if (error) throw error
      } else {
        // Complete
        const { error } = await supabase
          .from('note_completions')
          .insert({ user_id: userId, note_id: noteId })

        if (error) throw error
      }
    } catch (error) {
      console.error('Error toggling completion:', error)
      // Revert optimistic update
      setCompletedNotes((prev) => {
        const next = new Set(prev)
        if (isCompleted) next.add(noteId)
        else next.delete(noteId)
        return next
      })
    }
  }

  const copyNote = (note: any) => {
    navigator.clipboard.writeText(note.content)
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

  const getNoteTypeIcon = (type: Note["type"], themed = false) => {
    const themedClass = "h-4 w-4 text-primary"
    const defaultClass = "h-4 w-4 text-muted-foreground"
    switch (type) {
      case "text":
        return <FileText className={themed ? themedClass : defaultClass} />
      case "pdf":
        return <FileText className={themed ? themedClass : defaultClass} />
      case "video":
        return <Video className={themed ? themedClass : defaultClass} />
      case "audio":
        return <Volume2 className={themed ? themedClass : defaultClass} />
      case "link":
        return <LinkIcon className={themed ? themedClass : defaultClass} />
      case "voice":
        return <Mic className={themed ? themedClass : defaultClass} />
      case "image":
        return <FileImage className={themed ? themedClass : defaultClass} />
      default:
        return <FileText className={themed ? themedClass : defaultClass} />
    }
  }

  const getNoteTypeLabel = (type: Note["type"]) => {
    switch (type) {
      case "text":
        return "Text"
      case "pdf":
        return "PDF"
      case "video":
        return "Video"
      case "audio":
        return "Audio"
      case "link":
        return "Link"
      case "voice":
        return "Voice"
      case "image":
        return "Image"
      default:
        return "Unknown"
    }
  }

  // Removed createNote function and related state

  const toggleLike = async (noteId: number) => {
    if (!userId) {
      alert("Please login to like notes")
      return
    }

    const isLiked = likedNotes.has(noteId)

    // Optimistic update
    setLikedNotes((prev) => {
      const newLikedNotes = new Set(prev)
      if (isLiked) {
        newLikedNotes.delete(noteId)
      } else {
        newLikedNotes.add(noteId)
      }
      return newLikedNotes
    })

    setNotes(prev => prev.map(n => {
      if (n.id === noteId) {
        return { ...n, likes: n.likes + (isLiked ? -1 : 1) }
      }
      return n
    }))

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('note_likes')
          .delete()
          .eq('user_id', userId)
          .eq('note_id', noteId)

        if (error) throw error
      } else {
        // Like
        const { error } = await supabase
          .from('note_likes')
          .insert({ user_id: userId, note_id: noteId })

        if (error) throw error
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      // Revert optimistic update on error
      setLikedNotes((prev) => {
        const newLikedNotes = new Set(prev)
        if (isLiked) {
          newLikedNotes.add(noteId)
        } else {
          newLikedNotes.delete(noteId)
        }
        return newLikedNotes
      })
      setNotes(prev => prev.map(n => {
        if (n.id === noteId) {
          return { ...n, likes: n.likes + (isLiked ? 1 : -1) }
        }
        return n
      }))
    }
  }

  const getCurrentLikeCount = (note: Note) => {
    // Since we update note.likes directly in toggleLike, we just return note.likes
    return note.likes
  }

  const isNoteSaved = (noteId: number) => {
    return savedNotes.has(noteId)
  }

  const summarizeNote = async (note: Note) => {
    setIsSummarizing(true)
    // Mock summarization; replace with API call as needed
    await new Promise((r) => setTimeout(r, 800))
    setSummary(
      `Summary: ${note.description.slice(0, 120)}${note.description.length > 120 ? '...' : ''}`,
    )
    setIsSummarizing(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleUpload = async () => {
    setIsUploading(true)
    let content = newNoteContent
    let fileName = undefined
    let fileSize = undefined
    let fileUrl = undefined

    try {
      if (newNoteType !== "text" && newNoteType !== "link" && selectedFile) {
        if (!userId) {
          toast.error("You must be logged in to upload files")
          setIsUploading(false)
          return
        }

        const timestamp = Date.now()
        const sanitizedName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const filePath = `${userId}/${timestamp}_${sanitizedName}`

        const { error: uploadError } = await supabase.storage
          .from('notes')
          .upload(filePath, selectedFile)

        if (uploadError) {
          console.error('Supabase upload error:', uploadError)
          toast.error(`Upload failed: ${uploadError.message}`)
          setIsUploading(false)
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from('notes')
          .getPublicUrl(filePath)

        fileUrl = publicUrl
        fileName = selectedFile.name
        fileSize = formatFileSize(selectedFile.size)
        content = `File: ${fileName}`
      }

      // Fetch user's institute code
      const { data: { user } } = await supabase.auth.getUser()
      const instituteCode = user?.user_metadata?.institute_code

      const { error } = await supabase.from('notes').insert({
        title: newNoteTitle,
        description: newNoteDescription,
        content: content,
        type: newNoteType,
        difficulty: newNoteDifficulty,
        subject: newNoteSubject,
        branch: newNoteBranch,
        semester: parseInt(newNoteSemester),
        author_id: userId,
        author_name: userName || "Teacher",
        author_avatar: "T", // Placeholder
        tags: newNoteTags.split(",").map(t => t.trim()).filter(t => t),
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        institute_code: instituteCode,
      })

      if (error) {
        console.error('Error inserting note:', error)
        alert('Failed to save note metadata')
      } else {
        setIsUploadOpen(false)
        // Reset form
        setNewNoteTitle("")
        setNewNoteDescription("")
        setNewNoteSubject("")
        setNewNoteContent("")
        setNewNoteTags("")
        setNewNoteReadingTime("")
        setSelectedFile(null)
        // Refresh notes
        fetchNotes()
      }
    } catch (e) {
      console.error('Error in handleUpload:', e)
      alert('An unexpected error occurred')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm("Are you sure you want to delete this note? This action cannot be undone.")) return

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (error) {
        console.error('Error deleting note:', error)
        alert("Failed to delete note")
      } else {
        // Remove from local state
        setNotes(prev => prev.filter(n => n.id !== noteId))
        if (selectedNote?.id === noteId) {
          setIsViewerOpen(false)
          setSelectedNote(null)
        }
        // Also remove from interaction sets if needed, but not strictly required as UI updates from `notes`
      }
    } catch (e) {
      console.error('Error deleting note:', e)
      alert("An unexpected error occurred")
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">SmartNote Hub</h1>
                <p className="text-muted-foreground mt-1">Access and organize your study notes</p>
              </div>
              <div className="flex items-center gap-2">
                {userRole === 'teacher' && (
                  <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Note
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl">Upload New Note</DialogTitle>
                        <DialogDescription>
                          Fill in the details below to upload a new note to the platform.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 py-4">
                        {/* Row 1: Title */}
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input id="title" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} placeholder="e.g. Advanced Calculus Notes" className="text-lg" />
                        </div>

                        {/* Row 2: Subject, Branch, Semester */}
                        <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
                          <div className="md:col-span-4 space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" value={newNoteSubject} onChange={(e) => setNewNoteSubject(e.target.value)} placeholder="e.g. Mathematics" />
                          </div>
                          <div className="md:col-span-3 space-y-2">
                            <Label htmlFor="branch">Branch</Label>
                            <Select value={newNoteBranch} onValueChange={setNewNoteBranch}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Branch" />
                              </SelectTrigger>
                              <SelectContent>
                                {branches.filter(b => b !== 'all').map(b => (
                                  <SelectItem key={b} value={b}>{b}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="md:col-span-3 space-y-2">
                            <Label htmlFor="semester">Semester</Label>
                            <Select value={newNoteSemester} onValueChange={setNewNoteSemester}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Semester" />
                              </SelectTrigger>
                              <SelectContent>
                                {["1", "2", "3", "4", "5", "6"].map(s => (
                                  <SelectItem key={s} value={s}>Semester {s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Row 3: Type, Difficulty, Reading Time */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="type">Note Type</Label>
                            <Select value={newNoteType} onValueChange={(v: any) => setNewNoteType(v)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Type" />
                              </SelectTrigger>
                              <SelectContent>
                                {types.filter(t => t !== 'all').map(t => (
                                  <SelectItem key={t} value={t}>{getNoteTypeLabel(t as any)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <Select value={newNoteDifficulty} onValueChange={setNewNoteDifficulty}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Difficulty" />
                              </SelectTrigger>
                              <SelectContent>
                                {["Easy", "Medium", "Hard"].map(d => (
                                  <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="readingTime">Reading Time</Label>
                            <Input id="readingTime" value={newNoteReadingTime} onChange={(e) => setNewNoteReadingTime(e.target.value)} placeholder="e.g. 5 min read" />
                          </div>
                        </div>

                        {/* Row 4: Description */}
                        <div className="space-y-2">
                          <Label htmlFor="description">Short Description</Label>
                          <Textarea id="description" value={newNoteDescription} onChange={(e) => setNewNoteDescription(e.target.value)} placeholder="Brief summary of the note content..." />
                        </div>

                        {/* Row 5: Content */}
                        <div className="space-y-2">
                          <Label htmlFor="content">
                            {newNoteType === 'link' ? 'URL' : newNoteType === 'text' ? 'Content' : 'Upload File'}
                          </Label>
                          {newNoteType === 'text' ? (
                            <Textarea id="content" value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} placeholder="Type your notes here..." className="min-h-[150px]" />
                          ) : newNoteType === 'link' ? (
                            <Input id="content" value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} placeholder="https://..." />
                          ) : (
                            <div className="flex items-center gap-2">
                              <div
                                className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 transition-colors rounded-lg p-8 text-center cursor-pointer w-full flex flex-col items-center justify-center gap-2"
                                onClick={() => document.getElementById('file-upload')?.click()}
                              >
                                <Input
                                  id="file-upload"
                                  type="file"
                                  onChange={handleFileChange}
                                  className="hidden"
                                />
                                {selectedFile ? (
                                  <>
                                    <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                      <File className="h-5 w-5" />
                                    </div>
                                    <div className="text-sm font-medium">{selectedFile.name}</div>
                                    <div className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</div>
                                    <Button variant="ghost" size="sm" className="mt-2 text-xs h-7" onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedFile(null)
                                    }}>
                                      Remove File
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center mb-2">
                                      <UploadCloud className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="text-sm font-medium">Click to upload file</div>
                                    <div className="text-xs text-muted-foreground">PDF, Video, Audio, or Image (max. 50MB)</div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Row 6: Tags */}
                        <div className="space-y-2">
                          <Label htmlFor="tags">Tags (comma separated)</Label>
                          <Input id="tags" value={newNoteTags} onChange={(e) => setNewNoteTags(e.target.value)} placeholder="e.g. math, calculus, limits" />
                        </div>

                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpload}>Upload Note</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by title, teacher, or topic"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch === "all" ? "All Branches" : branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((sem) => (
                      <SelectItem key={sem} value={sem}>
                        {sem === "all" ? "All Semesters" : `Semester ${sem}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Notes Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "all" ? "All Types" : getNoteTypeLabel(type as Note["type"])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty === "all" ? "All Levels" : difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="views">Most Viewed</SelectItem>
                    <SelectItem value="likes">Most Liked</SelectItem>
                    <SelectItem value="saved">Saved</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={showSavedOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowSavedOnly(!showSavedOnly)}
                >
                  <Bookmark className="h-4 w-4 mr-1" />
                  Saved
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* 1. Total Notes */}
              <Card className="border border-border bg-card hover:shadow-sm transition">
                <CardContent className="p-3 h-16 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xs text-muted-foreground">Total Notes</div>
                    <div className="text-base font-semibold leading-tight">{notes.length}</div>
                  </div>
                </CardContent>
              </Card>
              {/* 2. My Department */}
              <Card className="border border-border bg-card hover:shadow-sm transition">
                <CardContent className="p-3 h-16 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xs text-muted-foreground">
                      {"My Department "}
                      {(() => {
                        const branchLabel = selectedBranch === "all" ? (notes[0]?.branch || "") : selectedBranch
                        const abbr = getBranchAbbreviation(branchLabel)
                        return abbr ? `(${abbr})` : ""
                      })()}
                    </div>
                    <div className="text-base font-semibold leading-tight">
                      {(() => {
                        const currentBranch = selectedBranch === "all" ? notes[0]?.branch : selectedBranch
                        return notes.filter((n) => n.branch === currentBranch).length
                      })()}
                    </div>
                    {/* removed full branch label under the value per request */}
                  </div>
                </CardContent>
              </Card>
              {/* 3. Completed */}
              <Card className="border border-border bg-card hover:shadow-sm transition">
                <CardContent className="p-3 h-16 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <CircleCheck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xs text-muted-foreground">Studied</div>
                    <div className="text-base font-semibold leading-tight">{completedNotes.size}</div>
                  </div>
                </CardContent>
              </Card>
              {/* 4. Saved */}
              <Card className="border border-border bg-card hover:shadow-sm transition">
                <CardContent className="p-3 h-16 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Bookmark className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xs text-muted-foreground">Saved</div>
                    <div className="text-base font-semibold leading-tight">{savedNotes.size}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes Grid/List */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedNotes.map((note) => (
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
                          <CardTitle className="text-base leading-tight text-balance break-words mb-3">{note.title}</CardTitle>
                          <CardDescription className="mt-2 line-clamp-3 text-pretty text-sm mb-4">{note.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Hover actions */}
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
                          {userId === note.authorId && (
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
                                <AvatarFallback className="text-xs">{note.authorAvatar}</AvatarFallback>
                              </Avatar>
                              <span className="truncate">{note.author}</span>
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
                            <span className="whitespace-nowrap">{note.uploadDate}</span>
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
            ) : (
              <div className="space-y-3">
                {sortedNotes.map((note) => (
                  <Card
                    key={note.id}
                    className="bg-card border-border group cursor-pointer hover:shadow-md transition-all"
                    onClick={() => openNoteViewer(note)}
                  >
                    <CardContent className="p-3 pr-6">
                      <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center justify-center h-10 w-10 rounded-md bg-muted flex-shrink-0">
                          {getNoteTypeIcon(note.type, true)}
                        </div>
                        <div className="flex-1 min-w-0 grid gap-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-foreground truncate">{note.title}</h3>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 flex-shrink-0">{getNoteTypeLabel(note.type)}</Badge>
                            <span className="hidden sm:inline text-xs text-muted-foreground">•</span>
                            <span className="hidden sm:inline text-xs text-muted-foreground">{getBranchAbbreviation(note.branch)} - Sem {note.semester}</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{note.description}</p>
                        </div>

                        <div className="flex items-center gap-6 flex-shrink-0">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openNoteViewer(note); setTimeout(() => summarizeNote(note), 0) }} aria-label="Summarize" disabled={isSummarizing}>
                                    <Brain className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{isSummarizing ? "Summarizing" : "Summarize"}</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleSave(note.id) }} aria-label={isNoteSaved(note.id) ? "Unsave" : "Save"}>
                                    <Bookmark className={`h-4 w-4 ${isNoteSaved(note.id) ? "fill-current" : ""}`} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{isNoteSaved(note.id) ? "Saved" : "Save"}</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleCompleted(note.id) }} aria-label="Studied">
                                    {completedNotes.has(note.id) ? (
                                      <CircleCheck className="h-4 w-4" />
                                    ) : (
                                      <Circle className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Studied</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); downloadNote(note) }} aria-label="Download">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Download</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{note.views}</span>
                            <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{getCurrentLikeCount(note)}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{note.readingTime}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {hasMore && notes.length > 0 && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" onClick={loadMore} disabled={isLoading}>
                  {isLoading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}

            {sortedNotes.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No notes found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
              </div>
            )}
          </div>
        </main >
      </div >

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
                        <Badge variant="secondary" className="text-2xs">{getNoteTypeLabel(selectedNote.type)}</Badge>
                        <Badge variant="secondary" className="text-2xs">{selectedNote.subject}</Badge>
                        <Badge variant="outline" className="text-2xs border-border text-muted-foreground">{selectedNote.difficulty}</Badge>
                        <div className="flex items-center gap-1 text-2xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{selectedNote.readingTime}</span>
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
                    onClick={() => selectedNote && toggleLike(selectedNote.id)}
                    aria-label="Like"
                  >
                    <Heart className={`w-4 h-4 ${selectedNote && likedNotes.has(selectedNote.id) ? "fill-current text-primary" : ""}`} />
                  </Button>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => selectedNote && toggleSave(selectedNote.id)} aria-label={isNoteSaved(selectedNote?.id || 0) ? "Unsave" : "Save"}>
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
                    {selectedNote && userId === selectedNote.authorId && (
                      <Button variant="outline" size="sm" onClick={() => handleDeleteNote(selectedNote.id)} aria-label="Delete" className="text-red-500 border-red-200 hover:bg-red-500/10 hover:text-red-600">
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
                        {selectedNote.type === 'link' ? <LinkIcon className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
                        {selectedNote.type === 'link' ? 'Link Details' : 'Note Content'}
                      </h3>
                    </div>
                    <div className="bg-card rounded-xl p-5 border border-border flex-1 overflow-y-auto">
                      {selectedNote.type === 'link' ? (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">{selectedNote.description}</p>
                          <a
                            href={selectedNote.url || selectedNote.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline break-all flex items-center gap-2"
                          >
                            <LinkIcon className="w-4 h-4" />
                            {selectedNote.url || selectedNote.content}
                          </a>
                        </div>
                      ) : (
                        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                          {selectedNote.content}
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
                          {selectedNote.description}
                        </p>
                      )}
                      <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-3">
                        {selectedNote?.fileSize && <span>Size: {selectedNote.fileSize}</span>}
                        {selectedNote?.duration && <span>Length: {selectedNote.duration}</span>}
                        <span>Type: {selectedNote ? getNoteTypeLabel(selectedNote.type) : ""}</span>
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
                            const direct = (selectedNote.url as string) || (selectedNote.thumbnail as string)
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
                        onClick={() => selectedNote && summarizeNote(selectedNote)}
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
                                const blob = new Blob([summary], { type: "application/pdf" })
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
                                const blob = new Blob([summary], { type: "application/pdf" })
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
                          <p className="text-sm font-semibold text-foreground">{selectedNote?.author}</p>
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


                  {/* Removed File Information Section (now shown in the main content box) */}

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

    </div >
  )
}
