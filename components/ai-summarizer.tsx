"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
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
import { FileText, Upload, Zap, Download, Copy, CheckCircle, Sparkles, Save, Trash2, Eye } from "lucide-react"

export function AISummarizer() {
  const [inputText, setInputText] = useState("")
  const [summary, setSummary] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [summaryLength, setSummaryLength] = useState("medium")
  
  const [progress, setProgress] = useState(0)
  const [savedSummaries, setSavedSummaries] = useState([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [summaryName, setSummaryName] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [recentSummaries, setRecentSummaries] = useState([
    {
      id: "1",
      name: "Data Structures - Trees and Graphs",
      content:
        "## Key Points Summary\n\n**Main Concepts:**\n• Data structures are fundamental building blocks in computer science\n• Trees provide hierarchical organization of data with efficient search capabilities\n• Binary search trees maintain sorted order for O(log n) operations\n• AVL trees ensure balanced structure through rotation operations",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      name: "Machine Learning Fundamentals",
      content:
        "## Machine Learning Overview\n\n**Core Concepts:**\n• Supervised learning uses labeled data for training\n• Unsupervised learning finds patterns in unlabeled data\n• Neural networks mimic brain structure for complex pattern recognition\n• Feature engineering is crucial for model performance",
      timestamp: "1 day ago",
    },
    {
      id: "3",
      name: "Database Design Principles",
      content:
        "## Database Design Summary\n\n**Key Principles:**\n• Normalization reduces data redundancy\n• Primary keys ensure unique record identification\n• Foreign keys maintain referential integrity\n• Indexing improves query performance",
      timestamp: "3 days ago",
    },
  ])
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined)

  useEffect(() => {
    const loadSavedSummaries = () => {
      const saved = JSON.parse(localStorage.getItem("savedSummaries") || "[]")
      setSavedSummaries(saved)
    }
    loadSavedSummaries()
  }, [])

  const generateSummary = async () => {
    if (!inputText.trim()) return

    setIsGenerating(true)
    setProgress(0)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    setTimeout(() => {
      clearInterval(progressInterval)
      setProgress(100)

      const mockSummary = `## Key Points Summary

**Main Concepts:**
• Data structures are fundamental building blocks in computer science
• Trees provide hierarchical organization of data with efficient search capabilities
• Binary search trees maintain sorted order for O(log n) operations
• AVL trees ensure balanced structure through rotation operations

**Important Algorithms:**
• Tree traversal methods: in-order, pre-order, post-order
• Search operations with time complexity analysis
• Insertion and deletion with rebalancing procedures

**Practical Applications:**
• Database indexing systems
• File system hierarchies
• Expression parsing in compilers
• Decision trees in machine learning

**Key Formulas:**
• Height of balanced tree: h = log₂(n)
• Maximum nodes at level i: 2^i
• Total nodes in complete binary tree: 2^(h+1) - 1`

      setSummary(mockSummary)
      const newSummary = {
        id: Date.now().toString(),
        name: "Generated Summary",
        content: mockSummary,
        timestamp: "Just now",
      }
      setRecentSummaries((prev) => [newSummary, ...prev.slice(0, 2)])
      setIsGenerating(false)
      setProgress(0)
    }, 2000)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary)
  }

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `summary-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const saveSummary = () => {
    if (!summaryName.trim()) return

    const summaryData = {
      name: summaryName.trim(),
      content: summary,
      timestamp: new Date().toISOString(),
    }

    const existingSummaries = JSON.parse(localStorage.getItem("savedSummaries") || "[]")
    existingSummaries.unshift(summaryData)
    const updatedSummaries = existingSummaries.slice(0, 10)
    localStorage.setItem("savedSummaries", JSON.stringify(updatedSummaries))
    setSavedSummaries(updatedSummaries)

    setShowSaveDialog(false)
    setSummaryName("")
  }

  const openSaveDialog = () => {
    const firstLine = summary.split("\n").find((line) => line.trim() && !line.startsWith("#"))
    const defaultName = firstLine ? firstLine.replace(/[#*•]/g, "").trim().substring(0, 30) : "Untitled Summary"
    setSummaryName(defaultName)
    setShowSaveDialog(true)
  }

  const viewSavedSummary = (savedSummary) => {
    setSummary(savedSummary.content)
    setInputText("")
  }

  const viewRecentSummary = (recentSummary) => {
    setSummary(recentSummary.content)
    setInputText("")
  }

  const deleteSavedSummary = (index) => {
    const updatedSummaries = savedSummaries.filter((_, i) => i !== index)
    localStorage.setItem("savedSummaries", JSON.stringify(updatedSummaries))
    setSavedSummaries(updatedSummaries)
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            AI Summarizer
          </CardTitle>
          <CardDescription>
            Transform lengthy notes into concise, structured summaries with key points and formulas highlighted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Input Content</h3>
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.markdown,.rtf,.json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = () => {
                      const text = typeof reader.result === "string" ? reader.result : ""
                      setInputText(text)
                    }
                    reader.readAsText(file)
                    // reset value to allow re-upload of same file
                    e.currentTarget.value = ""
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </>
            </div>

            <Textarea
              placeholder="Paste your notes, lecture content, or study material here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              className="resize-none"
            />

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{inputText.length} characters</span>
              <span>Recommended: 500-5000 characters for best results</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Summary Length</label>
              <Select value={summaryLength} onValueChange={setSummaryLength}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (25% of original)</SelectItem>
                  <SelectItem value="medium">Medium (50% of original)</SelectItem>
                  <SelectItem value="long">Long (75% of original)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
          </div>

          <Button onClick={generateSummary} disabled={!inputText.trim() || isGenerating} className="w-full" size="lg">
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate AI Summary
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing content...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-secondary mr-2" />
                <CardTitle>Generated Summary</CardTitle>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadSummary}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={openSaveDialog}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Summary</DialogTitle>
                      <DialogDescription>Give your summary a name for easy identification later.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Enter summary name..."
                        value={summaryName}
                        onChange={(e) => setSummaryName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveSummary()}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={saveSummary} disabled={!summaryName.trim()}>
                        Save Summary
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <CardDescription>AI-generated summary with key concepts and formulas highlighted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="bg-card border rounded-lg p-4 whitespace-pre-wrap font-mono text-sm max-h-64 overflow-y-auto">{summary}</div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <span>Original: {inputText.length} chars</span>
                <span>Summary: {summary.length} chars</span>
              </div>
              <Badge variant="secondary">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Generated
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

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
              <CardDescription>Your previously generated summaries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSummaries.map((recentSummary) => (
                  <div key={recentSummary.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p
                        className="font-medium cursor-pointer hover:text-primary"
                        onClick={() => viewRecentSummary(recentSummary)}
                      >
                        {recentSummary.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{recentSummary.timestamp}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => viewRecentSummary(recentSummary)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const blob = new Blob([recentSummary.content], { type: "text/plain" })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement("a")
                          a.href = url
                          a.download = `${recentSummary.name}.txt`
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                          URL.revokeObjectURL(url)
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {activeTab === "saved" && (
        <TabsContent value="saved" className="space-y-4">
          {savedSummaries.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Save className="w-5 h-5 mr-2" />
                  Saved Summaries
                </CardTitle>
                <CardDescription>Your personally saved summaries for quick access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {savedSummaries.map((savedSummary, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p
                          className="font-medium cursor-pointer hover:text-primary"
                          onClick={() => viewSavedSummary(savedSummary)}
                        >
                          {savedSummary.name}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <span>Saved {formatTimestamp(savedSummary.timestamp)}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => viewSavedSummary(savedSummary)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const blob = new Blob([savedSummary.content], { type: "text/plain" })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement("a")
                            a.href = url
                            a.download = `${savedSummary.name}.txt`
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                            URL.revokeObjectURL(url)
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteSavedSummary(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Save className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Saved Summaries</h3>
                <p className="text-muted-foreground">Save your favorite summaries to access them later</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
