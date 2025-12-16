"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Zap,
  RotateCcw,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Shuffle,
  Play,
  Pause,
  SkipForward,
  Sparkles,
  Upload,
} from "lucide-react"

interface Flashcard {
  id: number
  front: string
  back: string
  difficulty: "Easy" | "Medium" | "Hard"
  category: string
  mastered: boolean
}

const mockFlashcards: Flashcard[] = [
  {
    id: 1,
    front: "What is the time complexity of binary search?",
    back: "O(log n) - Binary search eliminates half of the remaining elements in each step, resulting in logarithmic time complexity.",
    difficulty: "Medium",
    category: "Algorithms",
    mastered: false,
  },
  {
    id: 2,
    front: "Define a Binary Search Tree (BST)",
    back: "A binary tree where for each node: all values in the left subtree are less than the node's value, and all values in the right subtree are greater than the node's value.",
    difficulty: "Easy",
    category: "Data Structures",
    mastered: true,
  },
  {
    id: 3,
    front: "What is an AVL tree?",
    back: "A self-balancing binary search tree where the heights of the two child subtrees of any node differ by at most one. Named after Adelson-Velsky and Landis.",
    difficulty: "Hard",
    category: "Data Structures",
    mastered: false,
  },
]

export function AIFlashcards() {
  const [currentCard, setCurrentCard] = useState(0)
  const [showBack, setShowBack] = useState(false)
  const [studyMode, setStudyMode] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [inputContent, setInputContent] = useState("")
  const [cardCount, setCardCount] = useState("10")
  const [difficulty, setDifficulty] = useState("mixed")
  const [autoPlay, setAutoPlay] = useState(false)
  const [cards, setCards] = useState<Flashcard[]>([])
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set())
  const [resultsShown, setResultsShown] = useState(false)
  const [savedSets, setSavedSets] = useState<any[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [viewingSavedSet, setViewingSavedSet] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined)
  const [feedback, setFeedback] = useState<"mastered" | "practice" | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedFlashcardSets") || "[]")
    setSavedSets(saved)
  }, [])

  const generateFlashcards = async () => {
    setIsGenerating(true)
    const count = Number.parseInt(cardCount)
    // Simple mock generation from input: split into sentences or fallback topics
    const seeds = inputContent
      .split(/\n+|\.\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    const generated: Flashcard[] = Array.from({ length: count }).map((_, idx) => {
      const seed = seeds[idx % Math.max(1, seeds.length)] || `Concept ${idx + 1}`
      return {
        id: idx + 1,
        front: `Explain: ${seed}`,
        back:
          `Key idea: ${seed}. Provide a concise definition and one example to reinforce the concept for quick recall.`,
        difficulty: ((): Flashcard["difficulty"] => {
          if (difficulty === "mixed") return (["Easy", "Medium", "Hard"] as const)[idx % 3]
          return (difficulty.charAt(0).toUpperCase() + difficulty.slice(1)) as Flashcard["difficulty"]
        })(),
        category: "Study",
        mastered: false,
      }
    })
    setTimeout(() => {
      setCards(generated)
      setMasteredCards(new Set())
      setCurrentCard(0)
      setShowBack(false)
      setResultsShown(false)
      setIsGenerating(false)
      setStudyMode(true)
    }, 1200)
  }

  const nextCard = () => {
    setShowBack(false)
    setCurrentCard((prev) => {
      const next = prev + 1
      if (next >= cards.length) {
        setResultsShown(true)
        return prev
      }
      return next
    })
  }

  const prevCard = () => {
    setShowBack(false)
    setCurrentCard((prev) => Math.max(0, prev - 1))
  }

  const shuffleCards = () => {
    if (cards.length === 0) return
    setCurrentCard(Math.floor(Math.random() * cards.length))
    setShowBack(false)
  }

  const markAsMastered = (cardId: number, mastered: boolean) => {
    const newMastered = new Set(masteredCards)
    if (mastered) {
      newMastered.add(cardId)
      setFeedback("mastered")
    } else {
      newMastered.delete(cardId)
      setFeedback("practice")
    }
    setMasteredCards(newMastered)
    
    // Show feedback briefly, then move to next card
    setTimeout(() => {
      setFeedback(null)
      // Check if there's a next card, otherwise show results
      if (currentCard < cards.length - 1) {
        nextCard()
      } else {
        setResultsShown(true)
      }
    }, 600)
  }

  const resetStudySession = () => {
    setCurrentCard(0)
    setShowBack(false)
    setStudyMode(false)
    setAutoPlay(false)
    setResultsShown(false)
  }

  const saveCurrentSet = () => {
    if (!saveName.trim() || cards.length === 0) return
    const entry = {
      id: Date.now().toString(),
      name: saveName.trim(),
      count: cards.length,
      createdAt: new Date().toISOString(),
      difficulty,
      cards,
    }
    const existing = JSON.parse(localStorage.getItem("savedFlashcardSets") || "[]")
    existing.unshift(entry)
    const updated = existing.slice(0, 50)
    localStorage.setItem("savedFlashcardSets", JSON.stringify(updated))
    setSavedSets(updated)
    setShowSaveDialog(false)
    setSaveName("")
  }

  const startSavedSet = (set: any) => {
    setCards(set.cards || [])
    setMasteredCards(new Set())
    setCurrentCard(0)
    setShowBack(false)
    setResultsShown(false)
    setStudyMode(true)
  }

  const viewSavedSet = (set: any) => {
    setViewingSavedSet(set)
    setActiveTab("saved")
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!studyMode) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Smart Flashcards
            </CardTitle>
            <CardDescription>
              Generate AI-powered flashcards from your notes for effective spaced repetition learning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Study Material</label>
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
                          setInputContent(text)
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
                  placeholder="Paste your notes, definitions, or study content here..."
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Cards</label>
                  <Select value={cardCount} onValueChange={setCardCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Cards</SelectItem>
                      <SelectItem value="10">10 Cards</SelectItem>
                      <SelectItem value="15">15 Cards</SelectItem>
                      <SelectItem value="20">20 Cards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty Level</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={generateFlashcards}
                disabled={!inputContent.trim() || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating Flashcards...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate AI Flashcards
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Saved Flashcard Sets with Tabs */}
        {viewingSavedSet && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{viewingSavedSet.name}</span>
                <Button size="sm" onClick={() => startSavedSet(viewingSavedSet)}>
                  Study
                </Button>
              </CardTitle>
              <CardDescription>
                {viewingSavedSet.count} cards • {new Date(viewingSavedSet.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {viewingSavedSet.cards?.map((c: any, idx: number) => (
                <div key={c.id || idx} className="p-3 border rounded-lg">
                  <div className="font-medium mb-2">Q{idx + 1}. {c.front}</div>
                  <div className="text-sm text-muted-foreground">Answer:</div>
                  <div className="text-sm mt-1">{c.back}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="saved">Saved Flashcard Sets ({savedSets.length})</TabsTrigger>
          </TabsList>

          {activeTab === "saved" && (
            <TabsContent value="saved" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Flashcard Sets</CardTitle>
                  <CardDescription>Your saved card sets. Click View to see cards or Study to start practicing.</CardDescription>
                </CardHeader>
                <CardContent>
                  {savedSets.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No saved flashcard sets yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {savedSets.map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="min-w-0">
                            <h4 className="font-medium truncate" title={s.name}>{s.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">{s.count} cards • {new Date(s.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => viewSavedSet(s)}>View</Button>
                            <Button size="sm" onClick={() => startSavedSet(s)}>Study</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    )
  }

  const card = cards[currentCard]
  const progress = cards.length > 0 ? ((currentCard + 1) / cards.length) * 100 : 0
  const masteredCount = masteredCards.size
  const needPracticeCount = cards.length - masteredCount

  if (resultsShown) {
    const scorePct = cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Session Complete</CardTitle>
            <CardDescription>Your flashcard practice summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-4xl font-bold text-primary mb-1">{scorePct}%</div>
                  <p className="text-sm text-muted-foreground">Mastery Score</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-xl font-semibold text-green-700">{masteredCount}</div>
                  <p className="text-sm text-muted-foreground">Mastered</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <div className="text-xl font-semibold text-red-700">{needPracticeCount}</div>
                  <p className="text-sm text-muted-foreground">Need Practice</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center gap-2 flex-wrap">
              <Button variant="outline" onClick={resetStudySession}>End Session</Button>
              <Button onClick={() => { setResultsShown(false); setCurrentCard(0); setShowBack(false) }}>Review Again</Button>
              <Button
                variant="outline"
                onClick={() => { setSaveName(`Flashcards - ${cards.length} cards`); setShowSaveDialog(true) }}
                disabled={cards.length === 0}
              >
                Save Set
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* All Flashcards Review */}
        <Card>
          <CardHeader>
            <CardTitle>All Flashcards Review</CardTitle>
            <CardDescription>Review all cards with their mastery status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cards.map((cardItem, index) => {
                const isMastered = masteredCards.has(cardItem.id)
                return (
                  <div
                    key={cardItem.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isMastered
                        ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                        : "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isMastered
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(cardItem.difficulty)}>
                            {cardItem.difficulty}
                          </Badge>
                          {isMastered ? (
                            <Badge className="bg-green-600 text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Mastered
                            </Badge>
                          ) : (
                            <Badge className="bg-red-600 text-white">
                              <XCircle className="w-3 h-3 mr-1" />
                              Need Practice
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">Question</h4>
                        <p className="text-base">{cardItem.front}</p>
                      </div>
                      <div className="border-t pt-3">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">Answer</h4>
                        <p className="text-base">{cardItem.back}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Flashcard Set</DialogTitle>
              <DialogDescription>Give your set a name for later practice.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter set name..."
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveCurrentSet()}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
              <Button onClick={saveCurrentSet} disabled={!saveName.trim()}>Save Set</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Study Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Study Progress</span>
            <span className="text-sm text-muted-foreground">
              {currentCard + 1} of {cards.length} cards
            </span>
          </div>
          <Progress value={progress} className="h-2 mb-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{masteredCount} mastered</span>
            <span>{cards.length - masteredCount} remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Flashcard */}
      <Card className="min-h-[400px] relative">
        {/* Feedback overlay */}
        {feedback && (
          <div className={`absolute inset-0 z-50 flex items-center justify-center rounded-lg ${
            feedback === "mastered" 
              ? "bg-green-500/90 backdrop-blur-sm" 
              : "bg-red-500/90 backdrop-blur-sm"
          } transition-opacity duration-300`}>
            <div className="text-center text-white">
              {feedback === "mastered" ? (
                <>
                  <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Great job!</h3>
                  <p className="text-lg">You've mastered this card</p>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Keep practicing!</h3>
                  <p className="text-lg">Review this card again later</p>
                </>
              )}
            </div>
          </div>
        )}
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge className={getDifficultyColor(card?.difficulty || "Easy")}>{card?.difficulty}</Badge>
              <Badge variant="outline">{card?.category}</Badge>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={shuffleCards}>
                <Shuffle className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAutoPlay(!autoPlay)}>
                {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center p-8">
          <div className="text-center space-y-6">
            <div className="min-h-[200px] flex items-center justify-center">
              <div className="max-w-2xl">
                {!showBack ? (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Question</h3>
                    <p className="text-lg leading-relaxed">{card?.front}</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Answer</h3>
                    <p className="text-lg leading-relaxed">{card?.back}</p>
                  </div>
                )}
              </div>
            </div>

            <Button onClick={() => setShowBack(!showBack)} variant="outline" size="lg" className="mx-auto">
              {showBack ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Show Question
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show Answer
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={prevCard}>
              Previous
            </Button>

            {showBack && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => markAsMastered(card?.id, false)}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Need Practice
                </Button>
                <Button
                  variant="default"
                  onClick={() => markAsMastered(card?.id, true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mastered
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setResultsShown(true)}>
                Submit
              </Button>
              <Button variant="outline" onClick={nextCard}>
                <SkipForward className="w-4 h-4 mr-2" />
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Session Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Session: {masteredCount}/{cards.length} cards mastered
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={resetStudySession}>
                <RotateCcw className="w-4 h-4 mr-2" />
                End Session
              </Button>
              <Button variant="default">Save Progress</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
