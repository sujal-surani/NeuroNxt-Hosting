"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Bookmark,
  FileText,
  Youtube,
  Brain,
  Search,
  Download,
  Copy,
  Clock,
  ExternalLink,
  Filter,
  X,
  Grid3X3,
  List,
  Calendar,
  TrendingUp,
  Sparkles,
} from "lucide-react"

interface SavedSummary {
  name: string
  content: string
  timestamp: string
  type: "ai-summary"
  confidence?: number
  originalLength?: number
  summaryLength?: number
}

interface SavedVideoSummary {
  id: string
  title: string
  url: string
  duration: string
  summary: string
  keyPoints: string[]
  timestamp: string
  thumbnail: string
  channel: string
  customName?: string
  type: "video-summary"
}

interface SavedNote {
  id: string
  title: string
  content: string
  subject: string
  tags: string[]
  timestamp: string
  saved: boolean
  type: "note"
  likes?: number
  shared?: boolean
}

interface SavedQuiz {
  id: string
  title: string
  subject: string
  score?: number
  totalQuestions: number
  completedAt: string
  type: "quiz"
  difficulty: "easy" | "medium" | "hard" | "mixed"
  xpEarned?: number
  correctAnswers?: number
  timeSpent?: string
  questions?: Array<{
    question: string
    userAnswer?: number
    correctAnswer: number
    isCorrect: boolean
    explanation: string
    confidence: number
  }>
}

interface SavedFlashcard {
  id: string
  title: string
  subject: string
  totalCards: number
  masteredCards: number
  difficulty: "easy" | "medium" | "hard" | "mixed"
  lastStudied: string
  type: "flashcard"
  studyStreak?: number
  averageConfidence?: number
}

export default function SavedResources() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [viewingItem, setViewingItem] = useState<any>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [savedSummaries, setSavedSummaries] = useState<SavedSummary[]>([])
  const [savedVideoSummaries, setSavedVideoSummaries] = useState<SavedVideoSummary[]>([])
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([])
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([])
  // Added state for flashcards
  const [savedFlashcards, setSavedFlashcards] = useState<SavedFlashcard[]>([])

  useEffect(() => {
    // Load saved summaries from localStorage
    const summaries = JSON.parse(localStorage.getItem("savedSummaries") || "[]")
    setSavedSummaries(summaries.map((s: any) => ({ ...s, type: "ai-summary" })))

    // Load saved video summaries from localStorage
    const videoSummaries = JSON.parse(localStorage.getItem("savedVideoSummaries") || "[]")
    setSavedVideoSummaries(videoSummaries.map((s: any) => ({ ...s, type: "video-summary" })))

    // Mock saved notes
    setSavedNotes([
      {
        id: "1",
        title: "Machine Learning Fundamentals",
        content:
          "Comprehensive notes on supervised and unsupervised learning algorithms, neural networks, and deep learning architectures...",
        subject: "AI/ML",
        tags: ["machine-learning", "algorithms", "neural-networks"],
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        saved: true,
        type: "note",
      },
      {
        id: "2",
        title: "Data Structures - Trees",
        content: "Binary trees, AVL trees, and tree traversal algorithms with implementation examples...",
        subject: "Computer Technology",
        tags: ["data-structures", "trees", "algorithms"],
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        saved: true,
        type: "note",
      },
      {
        id: "3",
        title: "React Hooks Deep Dive",
        content: "Advanced patterns with useState, useEffect, useContext, and custom hooks...",
        subject: "Web Development",
        tags: ["react", "hooks", "frontend"],
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        saved: true,
        type: "note",
      },
    ])

    // Mock saved quizzes
    setSavedQuizzes([
      {
        id: "1",
        title: "Data Structures Quiz",
        subject: "Computer Technology",
        score: 85,
        totalQuestions: 10,
        completedAt: new Date(Date.now() - 3600000).toISOString(),
        type: "quiz",
      },
      {
        id: "2",
        title: "Machine Learning Basics",
        subject: "AI/ML",
        score: 92,
        totalQuestions: 15,
        completedAt: new Date(Date.now() - 7200000).toISOString(),
        type: "quiz",
      },
      {
        id: "3",
        title: "React Fundamentals",
        subject: "Web Development",
        score: 78,
        totalQuestions: 12,
        completedAt: new Date(Date.now() - 10800000).toISOString(),
        type: "quiz",
      },
    ])

    // Mock saved summaries with confidence scores
    setSavedSummaries([
      {
        name: "Machine Learning Fundamentals Summary",
        content:
          "## Key Points Summary\n\n**Main Concepts:**\n• Supervised learning uses labeled data for training\n• Unsupervised learning finds patterns in unlabeled data\n• Neural networks mimic brain structure for complex pattern recognition\n• Feature engineering is crucial for model performance\n\n**Important Algorithms:**\n• Linear regression for continuous predictions\n• Decision trees for interpretable classification\n• K-means clustering for data grouping\n• Gradient descent for optimization\n\n**Practical Applications:**\n• Image recognition systems\n• Natural language processing\n• Recommendation engines\n• Autonomous vehicle navigation",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        type: "ai-summary",
        confidence: 92,
        originalLength: 2500,
        summaryLength: 850,
      },
      {
        name: "Data Structures Overview",
        content:
          "## Data Structures Summary\n\n**Core Structures:**\n• Arrays provide indexed access with O(1) lookup\n• Linked lists enable dynamic memory allocation\n• Trees organize hierarchical data efficiently\n• Hash tables offer fast key-value operations\n\n**Time Complexities:**\n• Binary search: O(log n)\n• Hash table operations: O(1) average\n• Tree traversal: O(n)\n• Sorting algorithms: O(n log n) optimal",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        type: "ai-summary",
        confidence: 88,
        originalLength: 1800,
        summaryLength: 650,
      },
    ])

    // Mock enhanced video summaries
    setSavedVideoSummaries([
      {
        id: "1",
        title: "Advanced React Patterns",
        url: "https://youtube.com/watch?v=example1",
        duration: "42:15",
        summary:
          "This comprehensive tutorial covers advanced React patterns including render props, higher-order components, compound components, and the latest hooks patterns. The instructor demonstrates practical implementations of each pattern with real-world examples, showing when and why to use each approach. Special attention is given to performance optimization techniques and best practices for component composition.",
        keyPoints: [
          "Render Props pattern for flexible component logic sharing",
          "Higher-Order Components (HOCs) for cross-cutting concerns",
          "Compound Components for building flexible APIs",
          "Custom Hooks for stateful logic reuse",
          "Performance optimization with React.memo and useMemo",
          "Context API patterns for state management",
        ],
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        thumbnail: "/react-patterns-thumb.jpg",
        channel: "React Mastery",
        customName: "React Advanced Patterns - Complete Guide",
        type: "video-summary",
      },
    ])

    // Mock enhanced quiz results
    setSavedQuizzes([
      {
        id: "1",
        title: "Data Structures & Algorithms Quiz",
        subject: "Computer Technology",
        score: 85,
        totalQuestions: 10,
        completedAt: new Date(Date.now() - 3600000).toISOString(),
        type: "quiz",
        difficulty: "medium",
        xpEarned: 25,
        correctAnswers: 8,
        timeSpent: "12:45",
        questions: [
          {
            question: "What is the time complexity of binary search?",
            userAnswer: 1,
            correctAnswer: 1,
            isCorrect: true,
            explanation:
              "Binary search has O(log n) time complexity as it eliminates half the search space in each iteration.",
            confidence: 92,
          },
          {
            question: "Which data structure uses LIFO principle?",
            userAnswer: 1,
            correctAnswer: 1,
            isCorrect: true,
            explanation: "Stack follows Last In, First Out (LIFO) principle.",
            confidence: 95,
          },
        ],
      },
      {
        id: "2",
        title: "Machine Learning Fundamentals",
        subject: "AI/ML",
        score: 78,
        totalQuestions: 15,
        completedAt: new Date(Date.now() - 7200000).toISOString(),
        type: "quiz",
        difficulty: "hard",
        xpEarned: 32,
        correctAnswers: 12,
        timeSpent: "18:30",
      },
    ])

    // Mock flashcard sets
    setSavedFlashcards([
      {
        id: "1",
        title: "React Hooks Mastery",
        subject: "Web Development",
        totalCards: 25,
        masteredCards: 18,
        difficulty: "medium",
        lastStudied: new Date(Date.now() - 1800000).toISOString(),
        type: "flashcard",
        studyStreak: 7,
        averageConfidence: 84,
      },
      {
        id: "2",
        title: "Database Design Principles",
        subject: "Computer Technology",
        totalCards: 30,
        masteredCards: 22,
        difficulty: "hard",
        lastStudied: new Date(Date.now() - 86400000).toISOString(),
        type: "flashcard",
        studyStreak: 3,
        averageConfidence: 76,
      },
    ])
  }, [])

  const getAllSavedItems = () => {
    // Included flashcards in the combined list
    const allItems = [...savedSummaries, ...savedVideoSummaries, ...savedNotes, ...savedQuizzes, ...savedFlashcards]

    // Filter by search query
    let filteredItems = allItems.filter((item) => {
      const searchText = searchQuery.toLowerCase()
      const title = (item.customName || item.title || item.name || "").toLowerCase()
      const content = (item.content || item.summary || "").toLowerCase()
      const subject = (item.subject || "").toLowerCase()
      return title.includes(searchText) || content.includes(searchText) || subject.includes(searchText)
    })

    // Filter by type
    if (selectedFilter !== "all") {
      filteredItems = filteredItems.filter((item) => item.type === selectedFilter)
    }

    // Sort by timestamp (newest first)
    return filteredItems.sort((a, b) => {
      const aTime = new Date(a.timestamp || a.completedAt || a.lastStudied || 0).getTime()
      const bTime = new Date(b.timestamp || b.completedAt || b.lastStudied || 0).getTime()
      return bTime - aTime
    })
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case "ai-summary":
        return <FileText className="w-5 h-5 text-primary" />
      case "video-summary":
        return <Youtube className="w-5 h-5 text-red-500" />
      case "note":
        return <FileText className="w-5 h-5 text-emerald-500" />
      case "quiz":
        return <Brain className="w-5 h-5 text-purple-500" />
      // Added icon for flashcards
      case "flashcard":
        return <Sparkles className="w-5 h-5 text-orange-500" />
      default:
        return <Bookmark className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ai-summary":
        return "AI Summary"
      case "video-summary":
        return "Video Summary"
      case "note":
        return "Note"
      // Updated label for quiz results
      case "quiz":
        return "Quiz Result"
      // Added label for flashcard sets
      case "flashcard":
        return "Flashcard Set"
      default:
        return "Resource"
    }
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const downloadItem = (item: any) => {
    const content = item.content || item.summary || `Quiz: ${item.title}\nScore: ${item.score}/${item.totalQuestions}`
    const filename = `${(item.customName || item.title || item.name || "resource").replace(/[^a-z0-9]/gi, "_")}.txt`

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const deleteItem = (item: any) => {
    if (item.type === "ai-summary") {
      const updated = savedSummaries.filter((s) => s.timestamp !== item.timestamp)
      setSavedSummaries(updated)
      localStorage.setItem("savedSummaries", JSON.stringify(updated))
    } else if (item.type === "video-summary") {
      const updated = savedVideoSummaries.filter((s) => s.id !== item.id)
      setSavedVideoSummaries(updated)
      localStorage.setItem("savedVideoSummaries", JSON.stringify(updated))
    }
    // Add logic for deleting other item types if needed
  }

  const filteredItems = getAllSavedItems()
  // Included flashcards in total count
  const totalCount =
    savedSummaries.length +
    savedVideoSummaries.length +
    savedNotes.length +
    savedQuizzes.length +
    savedFlashcards.length

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto">
          <div className="relative border-b bg-gradient-to-br from-background to-muted/50">
            <div className="max-w-7xl mx-auto px-6 py-16">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center space-x-3 bg-muted/50 backdrop-blur-sm rounded-full px-6 py-3 border">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Your Learning Library</span>
                </div>
                <h1 className="text-5xl font-bold text-foreground text-balance">Saved Resources</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                  All your notes, summaries, quizzes, and study materials organized in one place
                </p>
                <div className="flex items-center justify-center space-x-12 pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">{totalCount}</div>
                    <div className="text-sm text-muted-foreground">Total Items</div>
                  </div>
                  <div className="w-px h-12 bg-border"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">{savedNotes.length}</div>
                    <div className="text-sm text-muted-foreground">Notes</div>
                  </div>
                  <div className="w-px h-12 bg-border"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">{savedQuizzes.length}</div>
                    <div className="text-sm text-muted-foreground">Quizzes</div>
                  </div>
                  {/* Added flashcard count to hero section */}
                  <div className="w-px h-12 bg-border"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">{savedFlashcards.length}</div>
                    <div className="text-sm text-muted-foreground">Flashcards</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder="Search your resources..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 text-base"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-5 h-5 text-muted-foreground" />
                      <div className="flex space-x-2">
                        {[
                          { value: "all", label: "All", count: totalCount },
                          { value: "ai-summary", label: "AI", count: savedSummaries.length },
                          { value: "video-summary", label: "Videos", count: savedVideoSummaries.length },
                          { value: "note", label: "Notes", count: savedNotes.length },
                          { value: "quiz", label: "Quizzes", count: savedQuizzes.length },
                          // Added flashcard filter
                          { value: "flashcard", label: "Flashcards", count: savedFlashcards.length },
                        ].map((filter) => (
                          <Button
                            key={filter.value}
                            variant={selectedFilter === filter.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedFilter(filter.value)}
                            className="relative"
                          >
                            {filter.label}
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {filter.count}
                            </Badge>
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="w-px h-8 bg-border"></div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {filteredItems.length > 0 ? (
              <div
                className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}
              >
                {filteredItems.map((item, index) => (
                  <Card
                    key={`${item.type}-${item.id || item.timestamp || index}`}
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary/50"
                    onClick={() => setViewingItem(item)}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-primary/10">{getItemIcon(item.type)}</div>
                            <div className="flex-1 min-w-0">
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(item.type)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            {/* Use lastStudied for flashcards */}
                            {formatTimestamp(item.timestamp || item.completedAt || item.lastStudied)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                            {item.customName || item.title || item.name}
                          </h3>
                          {(item.content || item.summary) && (
                            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                              {item.content || item.summary}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center space-x-2">
                            {item.subject && (
                              <Badge variant="secondary" className="text-xs">
                                {item.subject}
                              </Badge>
                            )}
                            {item.score !== undefined && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                                {item.score}%
                              </Badge>
                            )}
                            {item.confidence && (
                              <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                                {item.confidence}% confidence
                              </Badge>
                            )}
                            {item.xpEarned && (
                              <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">
                                +{item.xpEarned} XP
                              </Badge>
                            )}
                            {item.masteredCards !== undefined && (
                              <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                                {item.masteredCards}/{item.totalCards} mastered
                              </Badge>
                            )}
                            {item.duration && (
                              <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                                {item.duration}
                              </Badge>
                            )}
                          </div>
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(item.content || item.summary || "")
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                downloadItem(item)
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-lg">
                <CardContent className="text-center py-16">
                  <div className="space-y-6">
                    <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
                      <Bookmark className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-semibold text-2xl text-foreground">
                        {searchQuery || selectedFilter !== "all"
                          ? "No matching resources found"
                          : "Start your learning journey"}
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        {searchQuery || selectedFilter !== "all"
                          ? "Try adjusting your search or filter criteria"
                          : "Create your first notes, generate summaries, or take quizzes to build your personal library"}
                      </p>
                    </div>
                    {!searchQuery && selectedFilter === "all" && (
                      <div className="flex justify-center space-x-4 pt-4">
                        <Button onClick={() => (window.location.href = "/ai-tools")} className="space-x-2">
                          <Brain className="w-4 h-4" />
                          <span>AI Tools</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => (window.location.href = "/notes")}
                          className="space-x-2"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Create Notes</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {viewingItem && (
        <Dialog open={!!viewingItem} onOpenChange={() => setViewingItem(null)}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden">
            <DialogHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-primary/10">{getItemIcon(viewingItem.type)}</div>
                  <div>
                    <DialogTitle className="text-2xl font-semibold">
                      {viewingItem.customName || viewingItem.title || viewingItem.name}
                    </DialogTitle>
                    <DialogDescription className="flex items-center space-x-4 mt-2">
                      <Badge variant="outline">{getTypeLabel(viewingItem.type)}</Badge>
                      <span className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {/* Use lastStudied for flashcards */}
                        {formatTimestamp(viewingItem.timestamp || viewingItem.completedAt || viewingItem.lastStudied)}
                      </span>
                      {viewingItem.confidence && (
                        <Badge variant="secondary" className="text-blue-600">
                          {viewingItem.confidence}% confidence
                        </Badge>
                      )}
                    </DialogDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setViewingItem(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-6 pt-4">
              {/* Quiz Results Display */}
              {viewingItem.type === "quiz" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <div className="text-2xl font-bold text-green-500">{viewingItem.score}%</div>
                        <div className="text-sm text-muted-foreground">Final Score</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Brain className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold">
                          {viewingItem.correctAnswers || 0}/{viewingItem.totalQuestions}
                        </div>
                        <div className="text-sm text-muted-foreground">Correct</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                        <div className="text-2xl font-bold text-purple-500">+{viewingItem.xpEarned || 0}</div>
                        <div className="text-sm text-muted-foreground">XP Earned</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                        <div className="text-lg font-bold">{viewingItem.timeSpent || "N/A"}</div>
                        <div className="text-sm text-muted-foreground">Time Spent</div>
                      </CardContent>
                    </Card>
                  </div>

                  {viewingItem.questions && (
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-semibold mb-4 text-lg">Question Review</h4>
                        <div className="space-y-4">
                          {viewingItem.questions.slice(0, 3).map((q, index) => (
                            <div
                              key={index}
                              className={`p-4 rounded-lg border ${q.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-medium">Question {index + 1}</h5>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={q.isCorrect ? "default" : "destructive"}>
                                    {q.isCorrect ? "Correct" : "Incorrect"}
                                  </Badge>
                                  <Badge variant="outline" className="text-blue-600">
                                    {q.confidence}% confidence
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm mb-2">{q.question}</p>
                              <p className="text-xs text-muted-foreground">{q.explanation}</p>
                            </div>
                          ))}
                          {viewingItem.questions.length > 3 && (
                            <p className="text-sm text-muted-foreground text-center">
                              And {viewingItem.questions.length - 3} more questions...
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Flashcard Set Display */}
              {viewingItem.type === "flashcard" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                        <div className="text-2xl font-bold">
                          {viewingItem.masteredCards}/{viewingItem.totalCards}
                        </div>
                        <div className="text-sm text-muted-foreground">Cards Mastered</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <div className="text-2xl font-bold">{viewingItem.studyStreak || 0}</div>
                        <div className="text-sm text-muted-foreground">Study Streak</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Brain className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                        <div className="text-2xl font-bold">{viewingItem.averageConfidence || 0}%</div>
                        <div className="text-sm text-muted-foreground">Avg Confidence</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Video Summary Display */}
              {viewingItem.type === "video-summary" && (
                <div className="space-y-6">
                  {viewingItem.thumbnail && (
                    <div className="relative">
                      <img
                        src={viewingItem.thumbnail || "/placeholder.svg"}
                        alt="Video thumbnail"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm">
                        {viewingItem.duration}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Youtube className="w-4 h-4 mr-1 text-red-500" />
                      {viewingItem.channel}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {viewingItem.duration}
                    </span>
                  </div>
                </div>
              )}

              {/* AI Summary Display */}
              {viewingItem.type === "ai-summary" && viewingItem.originalLength && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <div className="text-lg font-bold">{viewingItem.originalLength}</div>
                      <div className="text-sm text-muted-foreground">Original Chars</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <div className="text-lg font-bold">{viewingItem.summaryLength}</div>
                      <div className="text-sm text-muted-foreground">Summary Chars</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <div className="text-lg font-bold">
                        {Math.round(
                          ((viewingItem.originalLength - viewingItem.summaryLength) / viewingItem.originalLength) * 100,
                        )}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground">Reduction</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Content Display */}
              {(viewingItem.content || viewingItem.summary) && (
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center text-lg">
                      <FileText className="w-5 h-5 mr-2" />
                      {viewingItem.type === "video-summary" ? "Video Summary" : "Content"}
                    </h4>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {viewingItem.content || viewingItem.summary}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Key Points Display */}
              {viewingItem.keyPoints && (
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4 text-lg">Key Points</h4>
                    <div className="space-y-3">
                      {viewingItem.keyPoints.map((point: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm leading-relaxed">{point}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t bg-muted/20 -mx-6 -mb-6 px-6 py-4">
              <div className="flex space-x-3">
                {(viewingItem.content || viewingItem.summary) && (
                  <Button variant="outline" onClick={() => copyToClipboard(viewingItem.content || viewingItem.summary)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                )}
                <Button variant="outline" onClick={() => downloadItem(viewingItem)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
              {viewingItem.url && (
                <Button asChild>
                  <a href={viewingItem.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Original
                  </a>
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
