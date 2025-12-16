"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Brain, CheckCircle, XCircle, RotateCcw, Play, Target, Sparkles, Clock, AlertCircle, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: "Easy" | "Medium" | "Hard"
  confidence: number
}

const mockQuestions: Question[] = [
  {
    id: 1,
    question: "What is the time complexity of searching in a balanced binary search tree?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 1,
    explanation: "In a balanced BST, the height is log n, so search operations take O(log n) time.",
    difficulty: "Medium",
    confidence: 92,
  },
  {
    id: 2,
    question: "Which traversal method visits the root node first?",
    options: ["In-order", "Pre-order", "Post-order", "Level-order"],
    correctAnswer: 1,
    explanation: "Pre-order traversal visits the root first, then left subtree, then right subtree.",
    difficulty: "Easy",
    confidence: 88,
  },
  {
    id: 3,
    question: "What is the maximum number of nodes in a binary tree of height h?",
    options: ["2^h", "2^(h+1)", "2^(h+1) - 1", "2^h - 1"],
    correctAnswer: 2,
    explanation: "A complete binary tree of height h has 2^(h+1) - 1 nodes maximum.",
    difficulty: "Hard",
    confidence: 85,
  },
  {
    id: 4,
    question: "What is the worst-case time complexity of QuickSort?",
    options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
    correctAnswer: 1,
    explanation: "QuickSort has O(n²) worst-case complexity when the pivot is always the smallest or largest element.",
    difficulty: "Medium",
    confidence: 90,
  },
  {
    id: 5,
    question: "Which data structure uses LIFO (Last In, First Out) principle?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correctAnswer: 1,
    explanation: "Stack follows LIFO principle where the last element added is the first one to be removed.",
    difficulty: "Easy",
    confidence: 95,
  },
  {
    id: 6,
    question: "What is the space complexity of merge sort?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 2,
    explanation: "Merge sort requires O(n) additional space for the temporary arrays used during merging.",
    difficulty: "Medium",
    confidence: 87,
  },
  {
    id: 7,
    question: "Which of the following is NOT a stable sorting algorithm?",
    options: ["Merge Sort", "Bubble Sort", "Quick Sort", "Insertion Sort"],
    correctAnswer: 2,
    explanation: "Quick Sort is not stable because it can change the relative order of equal elements.",
    difficulty: "Hard",
    confidence: 83,
  },
  {
    id: 8,
    question: "What is the average time complexity of hash table operations?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correctAnswer: 0,
    explanation: "Hash tables provide O(1) average time complexity for insert, delete, and search operations.",
    difficulty: "Easy",
    confidence: 91,
  },
  {
    id: 9,
    question: "In a min-heap, where is the smallest element located?",
    options: ["At any leaf node", "At the root", "At the rightmost node", "At the last level"],
    correctAnswer: 1,
    explanation: "In a min-heap, the smallest element is always at the root of the tree.",
    difficulty: "Easy",
    confidence: 94,
  },
  {
    id: 10,
    question: "What is the time complexity of building a heap from an unsorted array?",
    options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
    correctAnswer: 2,
    explanation: "Building a heap from an unsorted array can be done in O(n) time using the bottom-up approach.",
    difficulty: "Hard",
    confidence: 79,
  },
  {
    id: 11,
    question: "Which graph traversal algorithm uses a queue?",
    options: ["Depth-First Search", "Breadth-First Search", "Dijkstra's Algorithm", "A* Algorithm"],
    correctAnswer: 1,
    explanation: "Breadth-First Search (BFS) uses a queue to explore nodes level by level.",
    difficulty: "Medium",
    confidence: 89,
  },
  {
    id: 12,
    question: "What is the worst-case time complexity of binary search?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 1,
    explanation: "Binary search has O(log n) time complexity in all cases when the array is sorted.",
    difficulty: "Easy",
    confidence: 96,
  },
  {
    id: 13,
    question: "Which data structure is best for implementing recursion?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correctAnswer: 1,
    explanation: "Stack is used to implement recursion as it follows LIFO principle for function calls.",
    difficulty: "Medium",
    confidence: 88,
  },
  {
    id: 14,
    question: "What is the time complexity of inserting an element at the beginning of a linked list?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correctAnswer: 0,
    explanation: "Inserting at the beginning of a linked list is O(1) as it only requires updating pointers.",
    difficulty: "Easy",
    confidence: 93,
  },
  {
    id: 15,
    question: "Which algorithm is used to find the shortest path in a weighted graph?",
    options: ["BFS", "DFS", "Dijkstra's Algorithm", "Binary Search"],
    correctAnswer: 2,
    explanation: "Dijkstra's Algorithm finds the shortest path in a weighted graph with non-negative weights.",
    difficulty: "Hard",
    confidence: 86,
  },
  {
    id: 16,
    question: "What is the space complexity of a recursive fibonacci implementation?",
    options: ["O(1)", "O(log n)", "O(n)", "O(2^n)"],
    correctAnswer: 2,
    explanation: "Recursive fibonacci has O(n) space complexity due to the call stack depth.",
    difficulty: "Medium",
    confidence: 82,
  },
  {
    id: 17,
    question: "Which sorting algorithm has the best worst-case time complexity?",
    options: ["Quick Sort", "Bubble Sort", "Merge Sort", "Selection Sort"],
    correctAnswer: 2,
    explanation: "Merge Sort has O(n log n) worst-case time complexity, which is optimal for comparison-based sorting.",
    difficulty: "Hard",
    confidence: 84,
  },
  {
    id: 18,
    question: "What is the primary advantage of a doubly linked list over a singly linked list?",
    options: ["Less memory usage", "Faster insertion", "Bidirectional traversal", "Better cache performance"],
    correctAnswer: 2,
    explanation: "Doubly linked lists allow traversal in both directions, making certain operations more efficient.",
    difficulty: "Medium",
    confidence: 90,
  },
  {
    id: 19,
    question: "Which tree traversal visits nodes in ascending order for a BST?",
    options: ["Pre-order", "In-order", "Post-order", "Level-order"],
    correctAnswer: 1,
    explanation: "In-order traversal of a BST visits nodes in ascending order of their values.",
    difficulty: "Easy",
    confidence: 95,
  },
  {
    id: 20,
    question: "What is the time complexity of finding the kth smallest element in a min-heap?",
    options: ["O(1)", "O(log k)", "O(k)", "O(k log k)"],
    correctAnswer: 3,
    explanation:
      "Finding the kth smallest element in a min-heap requires O(k log k) time using a priority queue approach.",
    difficulty: "Hard",
    confidence: 78,
  },
]

export function AIQuizGenerator() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [quizTopic, setQuizTopic] = useState("")
  const [quizDifficulty, setQuizDifficulty] = useState("medium")
  const [questionCount, setQuestionCount] = useState("10")
  const [timeLimit, setTimeLimit] = useState("15")
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([])
  const [savedQuizzes, setSavedQuizzes] = useState<any[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [viewingSaved, setViewingSaved] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedQuizzes") || "[]")
    setSavedQuizzes(saved)
  }, [])

  const generateQuiz = async () => {
    setIsGenerating(true)
    // Simulate AI quiz generation
    setTimeout(() => {
      const selectedCount = Number.parseInt(questionCount)
      const generatedQuestions = mockQuestions.slice(0, selectedCount).map((q, index) => ({
        ...q,
        id: index + 1, // Renumber questions starting from 1
      }))
      setQuizQuestions(generatedQuestions)

      setIsGenerating(false)
      setQuizStarted(true)
      if (timeLimit !== "unlimited") {
        setTimeRemaining(Number.parseInt(timeLimit) * 60)
        setTimerActive(true)
      }
      setSelectedAnswers({})
      setCurrentQuestion(0)
      setShowResults(false)
    }, 2000)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false)
            setShowResults(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerActive, timeRemaining])

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: answerIndex })
  }

  const allQuestionsAnswered = () => {
    return quizQuestions.every((question) => selectedAnswers[question.id] !== undefined)
  }

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      if (allQuestionsAnswered()) {
        setShowResults(true)
        setTimerActive(false)
      }
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswers({})
    setShowResults(false)
    setQuizStarted(false)
    setTimerActive(false)
    setTimeRemaining(0)
  }

  const saveCurrentQuiz = () => {
    if (!saveName.trim()) return
    const entry = {
      id: Date.now().toString(),
      name: saveName.trim(),
      topic: quizTopic,
      difficulty: quizDifficulty,
      questionCount: quizQuestions.length,
      questions: quizQuestions,
      timestamp: new Date().toISOString(),
    }
    const existing = JSON.parse(localStorage.getItem("savedQuizzes") || "[]")
    existing.unshift(entry)
    const updated = existing.slice(0, 50)
    localStorage.setItem("savedQuizzes", JSON.stringify(updated))
    setSavedQuizzes(updated)
    setShowSaveDialog(false)
    setSaveName("")
  }

  const viewSavedQuiz = (quiz: any) => {
    setViewingSaved(quiz)
  }

  const retakeSavedQuiz = (quiz: any) => {
    setQuizTopic(quiz.topic || "")
    setQuizDifficulty(quiz.difficulty || "medium")
    setQuestionCount(String(quiz.questions?.length || 10))
    setQuizQuestions(quiz.questions || [])
    setSelectedAnswers({})
    setCurrentQuestion(0)
    setShowResults(false)
    setQuizStarted(true)
    setTimerActive(false)
    setTimeRemaining(0)
  }

  const calculateScore = () => {
    let correct = 0
    quizQuestions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++
      }
    })
    return Math.round((correct / quizQuestions.length) * 100)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600"
    if (confidence >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const calculateXP = (score: number, difficulty: string) => {
    const baseXP = {
      easy: 10,
      medium: 20,
      hard: 35,
    }

    const difficultyMultiplier = baseXP[difficulty.toLowerCase() as keyof typeof baseXP] || 20
    const scoreMultiplier = score / 100
    const bonusXP = score >= 80 ? 10 : score >= 60 ? 5 : 0

    return Math.round(difficultyMultiplier * scoreMultiplier + bonusXP)
  }

  const saveXPToProfile = (xpEarned: number) => {
    // In a real app, this would save to database
    const currentXP = Number.parseInt(localStorage.getItem("userXP") || "0")
    const newXP = currentXP + xpEarned
    localStorage.setItem("userXP", newXP.toString())

    // Also save quiz completion data
    const completedQuizzes = JSON.parse(localStorage.getItem("completedQuizzes") || "[]")
    completedQuizzes.push({
      topic: quizTopic,
      difficulty: quizDifficulty,
      score: calculateScore(),
      xpEarned,
      date: new Date().toISOString(),
    })
    localStorage.setItem("completedQuizzes", JSON.stringify(completedQuizzes))
  }

  useEffect(() => {
    // Save XP (only once when results are first shown)
    if (showResults) {
      const score = calculateScore()
      const xpEarned = calculateXP(score, quizDifficulty)
      saveXPToProfile(xpEarned)
    }
  }, [showResults])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!quizStarted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              AI Quiz Generator
            </CardTitle>
            <CardDescription>
              Generate personalized quizzes from your notes with AI-powered confidence scoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="topic">Quiz Topic or Content</Label>
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
                          setQuizTopic(text)
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
                  id="topic"
                  placeholder="Enter the topic or paste your notes here..."
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select value={quizDifficulty} onValueChange={setQuizDifficulty}>
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

                <div className="space-y-2">
                  <Label>Number of Questions</Label>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time Limit (minutes)</Label>
                  <Select value={timeLimit} onValueChange={setTimeLimit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={generateQuiz} disabled={!quizTopic.trim() || isGenerating} className="w-full" size="lg">
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate AI Quiz
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Recent and Saved */}
        {viewingSaved && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{viewingSaved.name}</span>
                <Button size="sm" onClick={() => retakeSavedQuiz(viewingSaved)}>
                  Retake
                </Button>
              </CardTitle>
              <CardDescription>{viewingSaved.topic} • {viewingSaved.difficulty} • {viewingSaved.questions?.length || 0} questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {viewingSaved.questions?.map((q: any, idx: number) => (
                <div key={q.id || idx} className="p-3 border rounded-lg">
                  <div className="font-medium mb-2">Q{idx + 1}. {q.question}</div>
                  <div className="grid gap-2">
                    {q.options?.map((opt: string, i: number) => (
                      <div key={i} className="text-sm p-2 rounded bg-muted/30 border">{opt}</div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="recent">Recent Quizzes</TabsTrigger>
            <TabsTrigger value="saved">Saved Quizzes ({savedQuizzes.length})</TabsTrigger>
          </TabsList>

          {activeTab === "recent" && (
          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Quizzes</CardTitle>
                <CardDescription>Your previously generated quizzes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Data Structures - Trees</p>
                      <p className="text-sm text-muted-foreground">10 questions • Medium • Score: 85%</p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="secondary">Completed</Badge>
                      <Button variant="outline" size="sm">Retake</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Machine Learning Basics</p>
                      <p className="text-sm text-muted-foreground">15 questions • Mixed • Score: 78%</p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="secondary">Completed</Badge>
                      <Button variant="outline" size="sm">Retake</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Database Design</p>
                      <p className="text-sm text-muted-foreground">8 questions • Hard • In Progress</p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="outline">In Progress</Badge>
                      <Button variant="default" size="sm">Continue</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {activeTab === "saved" && (
          <TabsContent value="saved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">Saved Quizzes</CardTitle>
                <CardDescription>Your saved quizzes. View questions or retake.</CardDescription>
              </CardHeader>
              <CardContent>
                {savedQuizzes.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No saved quizzes yet.</div>
                ) : (
                  <div className="space-y-3">
                    {savedQuizzes.map((q) => (
                      <div key={q.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="min-w-0">
                          <p className="font-medium truncate" title={q.name}>{q.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{q.topic} • {q.difficulty} • {q.questionCount} questions</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => viewSavedQuiz(q)}>View</Button>
                          <Button size="sm" onClick={() => retakeSavedQuiz(q)}>Retake</Button>
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

  if (showResults) {
    const score = calculateScore()
    const xpEarned = calculateXP(score, quizDifficulty)
    const answeredQuestions = Object.keys(selectedAnswers).length

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
            <CardDescription>Here are your results with AI confidence analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{score}%</div>
              <p className="text-muted-foreground">Overall Score</p>
              <p className="text-sm text-muted-foreground mt-1">
                {answeredQuestions} of {quizQuestions.length} questions answered
              </p>
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
                <div className="text-2xl font-bold text-green-600">+{xpEarned} XP</div>
                <p className="text-sm text-muted-foreground">Experience Points Earned</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {quizDifficulty.charAt(0).toUpperCase() + quizDifficulty.slice(1)} difficulty bonus applied
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {
                      Object.values(selectedAnswers).filter(
                        (answer, index) => answer === quizQuestions[index]?.correctAnswer,
                      ).length
                    }
                  </div>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">
                    {answeredQuestions -
                      Object.values(selectedAnswers).filter(
                        (answer, index) => answer === quizQuestions[index]?.correctAnswer,
                      ).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Incorrect</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(quizQuestions.reduce((acc, q) => acc + q.confidence, 0) / quizQuestions.length)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Confidence</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center gap-2 flex-wrap">
              <Button onClick={resetQuiz} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Take New Quiz
              </Button>
              <Button onClick={resetQuiz}>
                <Play className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSaveName(quizTopic ? `${quizTopic} - ${quizQuestions.length}Q` : "Untitled Quiz")
                  setShowSaveDialog(true)
                }}
              >
                Save Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
            <CardDescription>Review each question with correct answers highlighted</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quizQuestions.map((question, index) => {
              const userAnswer = selectedAnswers[question.id]
              const isCorrect = userAnswer === question.correctAnswer
              const wasAnswered = userAnswer !== undefined
              return (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg border transition ${
                    !wasAnswered ? "border-gray-300" : isCorrect ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Question {index + 1}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{question.question}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!wasAnswered ? (
                        <Badge variant="outline">Not Answered</Badge>
                      ) : (
                        <Badge variant={isCorrect ? "default" : "destructive"}>
                          {isCorrect ? "Correct" : "Incorrect"}
                        </Badge>
                      )}
                      <Badge variant="outline" className={getConfidenceColor(question.confidence)}>
                        {question.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1 mb-3">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`p-2 rounded text-sm ${
                          optionIndex === question.correctAnswer
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : optionIndex === userAnswer && !isCorrect
                              ? "bg-red-100 text-red-800 border border-red-300"
                              : optionIndex === userAnswer && isCorrect
                                ? "bg-green-100 text-green-800 border border-green-300"
                                : "bg-gray-50"
                        }`}
                      >
                        {option}
                        {optionIndex === question.correctAnswer && " ✓ (Correct Answer)"}
                        {optionIndex === userAnswer && optionIndex !== question.correctAnswer && " ✗ (Your Answer)"}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{question.explanation}</p>
                </div>
              )
            })}
          </CardContent>
        </Card>
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Quiz</DialogTitle>
              <DialogDescription>Give your quiz a name for easy identification later.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter quiz name..."
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveCurrentQuiz()}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
              <Button onClick={saveCurrentQuiz} disabled={!saveName.trim()}>Save Quiz</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  const question = quizQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100
  const answeredCount = Object.keys(selectedAnswers).length
  const isCurrentQuestionAnswered = selectedAnswers[question?.id] !== undefined

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Question {currentQuestion + 1} of {quizQuestions.length}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {timerActive && (
                <Badge variant="outline" className={timeRemaining < 300 ? "text-red-600" : "text-blue-600"}>
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(timeRemaining)}
                </Badge>
              )}
              <Badge variant="outline">{question?.difficulty}</Badge>
              <Badge variant="secondary" className={getConfidenceColor(question?.confidence || 0)}>
                {question?.confidence}% confidence
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {answeredCount} of {quizQuestions.length} answered
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">{question?.question}</h3>
            <RadioGroup
              value={selectedAnswers[question?.id]?.toString() || ""}
              onValueChange={(value) => handleAnswerSelect(question?.id, Number.parseInt(value))}
            >
              {question?.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {!isCurrentQuestionAnswered && (
              <div className="flex items-center mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-700">Please select an answer to continue</span>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <div className="flex space-x-2">
              {currentQuestion === quizQuestions.length - 1 ? (
                <Button
                  onClick={nextQuestion}
                  disabled={!allQuestionsAnswered()}
                  className={allQuestionsAnswered() ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {allQuestionsAnswered()
                    ? "Finish Quiz"
                    : `Answer All Questions (${answeredCount}/${quizQuestions.length})`}
                </Button>
              ) : (
                <Button onClick={nextQuestion} disabled={!isCurrentQuestionAnswered}>
                  Next Question
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quiz Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {quizQuestions.map((_, index) => (
              <Button
                key={index}
                variant={currentQuestion === index ? "default" : "outline"}
                size="sm"
                className={`h-8 w-8 p-0 ${
                  selectedAnswers[quizQuestions[index].id] !== undefined
                    ? "bg-green-100 border-green-300 text-green-700"
                    : ""
                }`}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Click any question number to jump to it. Green indicates answered questions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
