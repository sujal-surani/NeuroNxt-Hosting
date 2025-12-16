"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Youtube, Play, Clock, Download, Copy, Bookmark, Trash2, ExternalLink, X } from "lucide-react"

interface VideoSummary {
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
}

export function YouTubeSummarizer() {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentSummary, setCurrentSummary] = useState<VideoSummary | null>(null)
  const [savedSummaries, setSavedSummaries] = useState<VideoSummary[]>([])
  const [recentSummaries, setRecentSummaries] = useState<VideoSummary[]>([
    {
      id: "1",
      title: "Machine Learning Fundamentals",
      url: "https://youtube.com/watch?v=example1",
      duration: "45:32",
      summary:
        "This comprehensive video covers the basics of machine learning, including supervised and unsupervised learning, neural networks, and practical applications in modern technology. The instructor begins with fundamental concepts, explaining how machines can learn from data without being explicitly programmed for every scenario. The video delves deep into supervised learning techniques, covering regression and classification algorithms, and demonstrates how these methods can be applied to real-world problems. Unsupervised learning is explored through clustering and dimensionality reduction techniques, showing how patterns can be discovered in unlabeled data. The neural network section provides an intuitive understanding of how artificial neurons work, building up to complex architectures like deep learning networks. Practical applications are discussed throughout, including image recognition, natural language processing, recommendation systems, and autonomous vehicles. The video concludes with best practices for model evaluation, avoiding overfitting, and deploying machine learning solutions in production environments.",
      keyPoints: [
        "Supervised vs Unsupervised Learning",
        "Neural Network Architecture",
        "Training and Validation",
        "Real-world Applications",
      ],
      timestamp: "2 hours ago",
      thumbnail: "/machine-learning-thumbnail.png",
      channel: "AI Education Hub",
    },
    {
      id: "2",
      title: "Data Structures and Algorithms",
      url: "https://youtube.com/watch?v=example2",
      duration: "1:23:15",
      summary:
        "Deep dive into essential data structures like arrays, linked lists, trees, and graphs, along with common algorithms for searching and sorting. This extensive tutorial starts with basic array operations and progresses to more complex data structures. Arrays are covered in detail, including dynamic arrays, multi-dimensional arrays, and their time complexity characteristics. Linked lists are thoroughly explained, covering singly linked lists, doubly linked lists, and circular linked lists, with practical implementations and use cases. The tree section covers binary trees, binary search trees, AVL trees, and heap data structures, explaining traversal algorithms like in-order, pre-order, and post-order. Graph algorithms are extensively covered, including breadth-first search (BFS), depth-first search (DFS), Dijkstra's shortest path algorithm, and minimum spanning tree algorithms. Sorting algorithms are demonstrated with visual examples, covering bubble sort, selection sort, insertion sort, merge sort, quick sort, and heap sort, with detailed analysis of their time and space complexities. The video also covers hash tables, their implementation, collision resolution techniques, and practical applications in solving algorithmic problems.",
      keyPoints: [
        "Array and Linked List Operations",
        "Tree Traversal Algorithms",
        "Graph Search Methods",
        "Time Complexity Analysis",
      ],
      timestamp: "1 day ago",
      thumbnail: "/data-structures-algorithms-video.jpg",
      channel: "CS Fundamentals",
    },
  ])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [customName, setCustomName] = useState("")
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedYouTubeSummaries") || "[]")
    setSavedSummaries(saved)
  }, [])

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const generateSummary = async () => {
    if (!youtubeUrl.trim()) return

    const videoId = extractVideoId(youtubeUrl)
    if (!videoId) {
      alert("Please enter a valid YouTube URL")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const mockSummary: VideoSummary = {
        id: Date.now().toString(),
        title: "Introduction to React Hooks",
        url: youtubeUrl,
        duration: "28:45",
        summary:
          "This video provides a comprehensive introduction to React Hooks, covering useState, useEffect, and custom hooks. The instructor explains how hooks revolutionize functional components and provide a cleaner way to manage state and side effects in React applications.",
        keyPoints: [
          "useState for state management",
          "useEffect for side effects",
          "Custom hooks for reusability",
          "Migration from class components",
        ],
        timestamp: "Just now",
        thumbnail: "/react-hooks-tutorial-video.jpg",
        channel: "React Mastery",
      }

      setCurrentSummary(mockSummary)
      setRecentSummaries((prev) => [mockSummary, ...prev.slice(0, 2)])
      setIsLoading(false)
      setYoutubeUrl("")
    }, 3000)
  }

  const copySummary = (summary: VideoSummary) => {
    const text = `${summary.title}\n\nSummary: ${summary.summary}\n\nKey Points:\n${summary.keyPoints.map((point) => `• ${point}`).join("\n")}\n\nSource: ${summary.url}`
    navigator.clipboard.writeText(text)
  }

  const downloadSummary = (summary: VideoSummary) => {
    const content = `${summary.title}\n\nSummary: ${summary.summary}\n\nKey Points:\n${summary.keyPoints.map((point) => `• ${point}`).join("\n")}\n\nDuration: ${summary.duration}\nChannel: ${summary.channel}\nSource: ${summary.url}\n\nGenerated: ${summary.timestamp}`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${summary.customName || summary.title.replace(/[^a-z0-9]/gi, "_")}_summary.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const saveSummary = (summary: VideoSummary) => {
    setShowSaveDialog(true)
    setCustomName(summary.title)
  }

  const persistSave = () => {
    if (!currentSummary) return
    if (!customName.trim()) return
    const summaryWithName = { ...currentSummary, customName: customName.trim() }
    const existing = JSON.parse(localStorage.getItem("savedYouTubeSummaries") || "[]")
    existing.unshift(summaryWithName)
    const updated = existing.slice(0, 20)
    localStorage.setItem("savedYouTubeSummaries", JSON.stringify(updated))
    setSavedSummaries(updated)
    setShowSaveDialog(false)
    setCustomName("")
  }

  const deleteSavedSummary = (id: string) => {
    const updated = savedSummaries.filter((s) => s.id !== id)
    setSavedSummaries(updated)
    localStorage.setItem("savedYouTubeSummaries", JSON.stringify(updated))
  }

  const viewSummaryInline = (summary: VideoSummary) => {
    setCurrentSummary(summary)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Youtube className="w-5 h-5 mr-2 text-red-500" />
            YouTube Video Summarizer
          </CardTitle>
          <CardDescription>
            Get instant AI-powered summaries of educational YouTube videos with key points and insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="youtube-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button onClick={generateSummary} disabled={isLoading || !youtubeUrl.trim()} size="lg">
                  {isLoading ? "Processing..." : "Summarize"}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Supports all YouTube video formats</span>
              <span>Processing time: 30-60 seconds</span>
            </div>
          </div>

          {isLoading && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Youtube className="w-4 h-4 text-red-500" />
                <span className="text-sm">Analyzing video content...</span>
              </div>
              <Progress value={65} className="h-2" />
              <p className="text-xs text-muted-foreground">This may take a few moments for longer videos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Summary */}
      {currentSummary && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center space-x-2">
                  <Play className="w-5 h-5 text-red-500" />
                  <span>{currentSummary.title}</span>
                </CardTitle>
                <CardDescription className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{currentSummary.duration}</span>
                  </span>
                  <span>{currentSummary.channel}</span>
                  <Badge variant="secondary">Fresh</Badge>
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => copySummary(currentSummary)}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" onClick={() => downloadSummary(currentSummary)}>
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button size="sm" variant="outline" onClick={() => saveSummary(currentSummary)}>
                  <Bookmark className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <img
                src={currentSummary.thumbnail || "/placeholder.svg"}
                alt="Video thumbnail"
                className="w-40 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Summary</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{currentSummary.summary}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Key Points</h4>
              <ul className="space-y-1">
                {currentSummary.keyPoints.map((point, index) => (
                  <li key={index} className="text-sm flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-muted-foreground">{currentSummary.timestamp}</span>
              <Button size="sm" variant="ghost" asChild>
                <a href={currentSummary.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Watch Video
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Removed popup viewer; inline viewing handled by currentSummary above */}

      {/* Save Dialog (popup) */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Summary</DialogTitle>
            <DialogDescription>Give your summary a name for easy identification later.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter summary name..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && persistSave()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={persistSave} disabled={!customName.trim()}>
              Save Summary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recent and Saved Summaries */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Summaries</TabsTrigger>
          <TabsTrigger value="saved">Saved Summaries ({savedSummaries.length})</TabsTrigger>
        </TabsList>

        {activeTab === "recent" && (
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Summaries</CardTitle>
              <CardDescription>Your recently generated video summaries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentSummaries.map((summary) => (
                <div key={summary.id} className="flex space-x-4 p-4 border rounded-lg">
                  <img
                    src={summary.thumbnail || "/placeholder.svg"}
                    alt="Video thumbnail"
                    className="w-32 h-20 object-cover rounded cursor-pointer"
                    onClick={() => viewSummaryInline(summary)}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4
                        className="font-semibold cursor-pointer hover:text-primary"
                        onClick={() => viewSummaryInline(summary)}
                      >
                        {summary.title}
                      </h4>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => copySummary(summary)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => downloadSummary(summary)}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => saveSummary(summary)}>
                          <Bookmark className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p
                      className="text-sm text-muted-foreground line-clamp-2 cursor-pointer hover:text-foreground"
                      onClick={() => viewSummaryInline(summary)}
                    >
                      {summary.summary}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{summary.duration}</span>
                      </span>
                      <span>{summary.channel}</span>
                      <span>{summary.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {activeTab === "saved" && (
        <TabsContent value="saved" className="space-y-4">
          {savedSummaries.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Saved Summaries</CardTitle>
                <CardDescription>Your bookmarked video summaries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {savedSummaries.map((summary) => (
                  <div key={summary.id} className="flex space-x-4 p-4 border rounded-lg">
                    <img
                      src={summary.thumbnail || "/placeholder.svg"}
                      alt="Video thumbnail"
                      className="w-32 h-20 object-cover rounded cursor-pointer"
                      onClick={() => viewSummaryInline(summary)}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4
                            className="font-semibold cursor-pointer hover:text-primary"
                            onClick={() => viewSummaryInline(summary)}
                          >
                            {summary.customName || summary.title}
                          </h4>
                          {summary.customName && <p className="text-sm text-muted-foreground">{summary.title}</p>}
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => copySummary(summary)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => downloadSummary(summary)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSavedSummary(summary.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p
                        className="text-sm text-muted-foreground line-clamp-2 cursor-pointer hover:text-foreground"
                        onClick={() => viewSummaryInline(summary)}
                      >
                        {summary.summary}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{summary.duration}</span>
                        </span>
                        <span>{summary.channel}</span>
                        <span>{summary.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Saved Summaries</h3>
                <p className="text-muted-foreground">Save your favorite video summaries to access them later</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
