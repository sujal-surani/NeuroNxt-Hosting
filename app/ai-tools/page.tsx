"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, FileText, Zap, MessageCircle, Youtube } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { AIQuizGenerator } from "@/components/ai-quiz-generator"
import { AIFlashcards } from "@/components/ai-flashcards"
import { AISummarizer } from "@/components/ai-summarizer"
import { AIChatAssistant } from "@/components/ai-chat-assistant"
import { YouTubeSummarizer } from "@/components/youtube-summarizer"

interface ToolCard {
  id: string
  title: string
  description: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
}

export default function AIToolsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [processedQuery, setProcessedQuery] = useState<string | null>(null)
  const [quickStats, setQuickStats] = useState<{
    summariesCount: number
    youtubeCount: number
    quizzesCount: number
    flashcardsCount: number
    aiChatsCount: number
    lastUpdated: string
  } | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)

  const toolCards: ToolCard[] = [
    {
      id: "summarizer",
      title: "Auto Summarizer",
      description: "Generate concise summaries from your notes",
      icon: FileText,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      badge: "Active",
      badgeVariant: "secondary",
    },
    {
      id: "youtube",
      title: "YouTube Summarizer",
      description: "Summarize educational YouTube videos instantly",
      icon: Youtube,
      iconBg: "bg-red-500/10",
      iconColor: "text-red-500",
      badge: "New",
      badgeVariant: "secondary",
    },
    {
      id: "quiz",
      title: "Quiz Generator",
      description: "Create personalized quizzes with confidence scoring",
      icon: Brain,
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      badge: "Popular",
      badgeVariant: "secondary",
    },
    {
      id: "flashcards",
      title: "Smart Flashcards",
      description: "Auto-generated flashcards for quick revision",
      icon: Zap,
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
      badge: "Active",
      badgeVariant: "secondary",
    },
    {
      id: "chat",
      title: "AI Assistant",
      description: "Get help with questions and explanations",
      icon: MessageCircle,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      badge: "Online",
      badgeVariant: "secondary",
    },
  ]

  useEffect(() => {
    const tabParam = searchParams.get("tab")
    const queryParam = searchParams.get("query")

    if (queryParam && queryParam.trim() && queryParam !== processedQuery) {
      setActiveTab("chat")
      setProcessedQuery(queryParam)
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete("query")
      router.replace(`/ai-tools?${newSearchParams.toString()}`, { scroll: false })
    } else if (tabParam && ["summarizer", "youtube", "quiz", "flashcards", "chat"].includes(tabParam)) {
      setActiveTab(tabParam)
    } else {
      setActiveTab("overview")
    }
  }, [searchParams, processedQuery, router])

  useEffect(() => {
    let isMounted = true
    const fetchStats = async () => {
      try {
        setStatsError(null)
        const res = await fetch("/api/ai-stats", { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (isMounted) setQuickStats(data)
      } catch (err) {
        if (isMounted) setStatsError("Failed to load stats")
      }
    }
    fetchStats()
    return () => {
      isMounted = false
    }
  }, [])


  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 
                className={`text-3xl font-bold text-balance ${activeTab !== "overview" ? "cursor-pointer hover:text-primary transition-colors" : ""}`}
                onClick={() => activeTab !== "overview" && setActiveTab("overview")}
              >
                AI Study Tools
              </h1>
              <p className="text-muted-foreground mt-1">Enhance your learning with AI-powered features</p>
            </div>

            {activeTab === "overview" ? (
              <div className="space-y-6">
                {/* AI Tools Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
                  {toolCards.map((tool) => {
                    const Icon = tool.icon
                    return (
                      <Card
                        key={tool.id}
                        className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20"
                        onClick={() => setActiveTab(tool.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className={`w-12 h-12 ${tool.iconBg} rounded-lg flex items-center justify-center mb-3`}>
                            <Icon className={`w-6 h-6 ${tool.iconColor}`} />
                          </div>
                          <CardTitle className="text-lg leading-tight">{tool.title}</CardTitle>
                          <CardDescription className="text-sm mt-2">{tool.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-end">
                            {tool.badge && (
                              <Badge variant={tool.badgeVariant || "secondary"}>{tool.badge}</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Quick Stats */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Quick Stats</CardTitle>
                      {quickStats && (
                        <span className="text-xs text-muted-foreground">
                          Updated {new Date(quickStats.lastUpdated).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {statsError && (
                      <div className="text-center py-8">
                        <div className="text-sm text-destructive mb-2">{statsError}</div>
                        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                          Retry
                        </Button>
                      </div>
                    )}
                    {!quickStats && !statsError && (
                      <div className="text-center py-8 text-sm text-muted-foreground">Loading statistics...</div>
                    )}
                    {quickStats && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Summaries</div>
                          <div className="text-3xl font-bold text-foreground">{quickStats.summariesCount}</div>
                        </div>

                        <div className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">YouTube</div>
                          <div className="text-3xl font-bold text-foreground">{quickStats.youtubeCount}</div>
                        </div>

                        <div className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Quizzes</div>
                          <div className="text-3xl font-bold text-foreground">{quickStats.quizzesCount}</div>
                        </div>

                        <div className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Flashcards</div>
                          <div className="text-3xl font-bold text-foreground">{quickStats.flashcardsCount}</div>
                        </div>

                        <div className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">AI Chats</div>
                          <div className="text-3xl font-bold text-foreground">{quickStats.aiChatsCount}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="summarizer">Summarizer</TabsTrigger>
                  <TabsTrigger value="youtube">YouTube</TabsTrigger>
                  <TabsTrigger value="quiz">Quiz</TabsTrigger>
                  <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                  <TabsTrigger value="chat">AI Assistant</TabsTrigger>
                </TabsList>

                <TabsContent value="summarizer" className="mt-6">
                  <AISummarizer />
                </TabsContent>

                <TabsContent value="youtube" className="mt-6">
                  <YouTubeSummarizer />
                </TabsContent>

                <TabsContent value="quiz" className="mt-6">
                  <AIQuizGenerator />
                </TabsContent>

                <TabsContent value="flashcards" className="mt-6">
                  <AIFlashcards />
                </TabsContent>

                <TabsContent value="chat" className="mt-6">
                  <AIChatAssistant initialQuery={processedQuery} onQueryProcessed={() => setProcessedQuery(null)} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
