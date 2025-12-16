"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  Link,
  Brain,
  Hash,
  Sparkles,
  GraduationCap,
} from "lucide-react"

// Mock search results
const mockSearchResults = {
  notes: [
    {
      id: 1,
      title: "Advanced Data Structures - Graph Algorithms",
      description: "Comprehensive guide to graph traversal, shortest path algorithms, and network analysis",
      type: "document",
      author: "Alice Smith",
      authorAvatar: "AS",
      subject: "Computer Technology",
      difficulty: "Hard",
      views: 234,
      likes: 45,
      uploadDate: "1 week ago",
      relevanceScore: 95,
    },
    {
      id: 2,
      title: "Machine Learning Interview Questions",
      description: "Common ML interview questions with detailed explanations and code examples",
      type: "video",
      author: "Bob Johnson",
      authorAvatar: "BJ",
      subject: "Data Science",
      difficulty: "Medium",
      views: 189,
      likes: 32,
      uploadDate: "3 days ago",
      relevanceScore: 88,
    },
  ],
  people: [
    {
      id: 1,
      name: "Alice Smith",
      avatar: "AS",
      branch: "Computer Technology",
      semester: "6th",
      notesCount: 24,
      followers: 156,
      isFollowing: true,
    },
    {
      id: 2,
      name: "Bob Johnson",
      avatar: "BJ",
      branch: "Data Science",
      semester: "8th",
      notesCount: 18,
      followers: 89,
      isFollowing: false,
    },
  ],
}

const typeIcons = {
  document: FileText,
  video: Video,
  audio: Mic,
  image: ImageIcon,
  link: Link,
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchMode, setSearchMode] = useState<"keywords" | "semantic" | "teacher">("keywords")
  const [results, setResults] = useState(mockSearchResults)

  const performSearch = useCallback((query: string, mode: string) => {
    const normalizedQuery = query.toLowerCase().trim()

    if (!normalizedQuery) {
      if (mode === "teacher") {
        setResults({
          notes: mockSearchResults.notes,
          people: [] // Don't show people in teacher search mode even if query is empty
        })
      } else {
        setResults(mockSearchResults)
      }
      return
    }

    const filteredNotes = mockSearchResults.notes.filter(note => {
      if (mode === "teacher") {
        return note.author.toLowerCase().includes(normalizedQuery)
      } else if (mode === "keywords") {
        return (
          note.title.toLowerCase().includes(normalizedQuery) ||
          note.description.toLowerCase().includes(normalizedQuery) ||
          note.subject.toLowerCase().includes(normalizedQuery)
        )
      }
      return true // Semantic mock returns all
    })

    const filteredPeople = mockSearchResults.people.filter(person => {
      if (mode === "teacher") {
        return false // Don't show people in teacher search mode
      }
      return person.name.toLowerCase().includes(normalizedQuery) || person.branch.toLowerCase().includes(normalizedQuery)
    })

    setResults({
      notes: filteredNotes,
      people: filteredPeople
    })
  }, [])

  useEffect(() => {
    performSearch(searchQuery, searchMode)
  }, [searchMode, performSearch]) // searchQuery is intentionally excluded to avoid searching on every keystroke, but included via closure if we wanted. 
  // Actually, we want to re-filter current results when mode changes. 
  // But wait, if we include searchQuery in dependency, it searches on type. 
  // We only want to search on mode change OR submit.
  // So we call performSearch(searchQuery, searchMode) inside useEffect dependent on [searchMode].

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchQuery, searchMode)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-balance">Search Results</h1>
              <p className="text-muted-foreground mt-1">
                Find notes, topics, and classmates with advanced search options
              </p>
            </div>

            {/* Search Interface */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={searchMode === "keywords" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSearchMode("keywords")}
                    className="flex items-center gap-2"
                  >
                    <Hash className="w-4 h-4" />
                    Keywords
                  </Button>
                  <Button
                    variant={searchMode === "semantic" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSearchMode("semantic")}
                    className="flex items-center gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    Semantic
                  </Button>
                  <Button
                    variant={searchMode === "teacher" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSearchMode("teacher")}
                    className="flex items-center gap-2"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Teacher
                  </Button>
                </div>

                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder={
                        searchMode === "keywords"
                          ? "Search by keywords..."
                          : searchMode === "semantic"
                            ? "Describe what you're looking for..."
                            : "Search for teachers and faculty members..."
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 text-lg h-12"
                    />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {searchMode === "keywords" && "Search using specific keywords and terms"}
                    {searchMode === "semantic" && "AI understands context and meaning of your search"}
                    {searchMode === "teacher" && "Find teachers, faculty, and mentors"}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                <TrendingUp className="w-3 h-3 mr-1" />
                Popular
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                <Clock className="w-3 h-3 mr-1" />
                Recent
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                Computer Technology
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                Data Structures
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                Machine Learning
              </Badge>
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Results</h2>
                  <div className="text-sm text-muted-foreground">
                    Found {results.notes.length + results.people.length} results
                  </div>
                </div>

                {/* Notes Results */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Notes
                  </h3>
                  {results.notes.map((note) => {
                    const TypeIcon = typeIcons[note.type as keyof typeof typeIcons]
                    return (
                      <Card key={note.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <TypeIcon className="w-6 h-6 text-primary" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-lg hover:text-primary transition-colors">
                                  {note.title}
                                </h4>
                                <Badge variant="secondary" className="ml-2">
                                  {note.relevanceScore}% match
                                </Badge>
                              </div>

                              <p className="text-muted-foreground mb-3">{note.description}</p>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <div className="flex items-center space-x-2">
                                    <Avatar className="w-5 h-5">
                                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                        {note.authorAvatar}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{note.author}</span>
                                  </div>
                                  <Badge variant="outline">{note.subject}</Badge>
                                  <Badge variant="outline">{note.difficulty}</Badge>
                                  <div className="flex items-center space-x-1">
                                    <Eye className="w-3 h-3" />
                                    <span>{note.views}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Heart className="w-3 h-3" />
                                    <span>{note.likes}</span>
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground">{note.uploadDate}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* People Results */}
                {results.people.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      People
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.people.map((person) => (
                        <Card key={person.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-12 h-12">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {person.avatar}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1">
                                <h4 className="font-semibold">{person.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {person.branch} • {person.semester} Semester
                                </p>
                                <div className="flex items-center space-x-3 mt-1 text-xs text-muted-foreground">
                                  <span>{person.notesCount} notes</span>
                                  <span>{person.followers} followers</span>
                                </div>
                              </div>

                              <Button size="sm" variant={person.isFollowing ? "outline" : "default"}>
                                {person.isFollowing ? "Following" : "Follow"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!searchQuery && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Start Your Search</h3>
                  <p className="text-muted-foreground mb-6">
                    Use our AI-powered search to find notes, topics, and classmates
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                      "machine learning algorithms"
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                      "data structures trees"
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                      "react hooks tutorial"
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
