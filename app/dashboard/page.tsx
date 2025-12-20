"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { OnboardingModal } from "@/components/onboarding-modal"
import { TaskDialog } from "@/components/task-dialog"
import { Task, AddTaskDialog } from "@/components/add-task-dialog"
import {
  BookOpen,
  Brain,
  MessageCircle,
  Trophy,
  Target,
  Zap,
  Search,
  Sparkles,
  Bookmark,
  Calendar,
  ArrowRight,
  Clock,
  AlertCircle,
  Coffee,
  CheckCircle2,
} from "lucide-react"

export default function Dashboard() {
  const [aiSearchQuery, setAiSearchQuery] = useState("")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [userName, setUserName] = useState("")
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUser(user)
        setUserName(user.user_metadata.full_name || "Student")

        // Check if user is onboarded
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_onboarded')
          .eq('id', user.id)
          .single()

        if (profile && !profile.is_onboarded) {
          setShowOnboarding(true)
        }
      }
    }
    getUser()
  }, [supabase])

  const [notesStudiedCount, setNotesStudiedCount] = useState(0)
  const [userBranch, setUserBranch] = useState("")
  const [userSemester, setUserSemester] = useState("")
  const [studyStreak, setStudyStreak] = useState(0)
  const [totalNotesCount, setTotalNotesCount] = useState(0)

  useEffect(() => {
    const getData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch User Profile for Branch
        const { data: profile } = await supabase
          .from('profiles')
          .select('branch, semester, is_onboarded, study_streak')
          .eq('id', user.id)
          .single()

        console.log("Dashboard Profile Fetch:", profile)

        if (profile) {
          if (!profile.is_onboarded) {
            setShowOnboarding(true)
          }
          setUserBranch(profile.branch || "")
          setUserSemester(profile.semester || "")
          setStudyStreak(profile.study_streak || 0)
        }

        // Trigger Streak Update
        await supabase.rpc('update_study_streak')

        // Re-fetch profile to get updated streak if needed (optional, but ensures UI is sync)
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('study_streak')
          .eq('id', user.id)
          .single()

        if (updatedProfile) {
          setStudyStreak(updatedProfile.study_streak || 0)
        }

        // Fetch Total Notes Count for Branch & Semester
        if (profile?.branch && profile?.semester) {
          // Robust parsing: extract first number from string "Sem 3", "3rd", "3" etc.
          const semesterMatch = profile.semester.toString().match(/\d+/)
          const semesterInt = semesterMatch ? parseInt(semesterMatch[0]) : NaN

          // Normalize Branch: "computer-technology" -> "Computer Technology" to match Notes table
          const formattedBranch = profile.branch
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')

          if (!isNaN(semesterInt)) {
            const { count: total, error: totalError } = await supabase
              .from('notes')
              .select('*', { count: 'exact', head: true })
              .eq('branch', formattedBranch) // Use formatted branch
              .eq('semester', semesterInt)

            if (!totalError && total !== null) {
              setTotalNotesCount(total)
            }
          }
        }

        // Fetch Notes Studied Count
        const { count, error } = await supabase
          .from('note_completions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if (!error && count !== null) {
          setNotesStudiedCount(count)
        }

        // Fetch Tasks (Existing Logic)
        const { data, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .eq('completed', false) // Only pending tasks
          .order('due_date', { ascending: true })

        if (tasksError) throw tasksError

        // ... existing task processing ...
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tasks = data
          .map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            category: t.category,
            priority: t.priority,
            dueDate: t.due_date,
            completed: t.completed,
            subject: t.subject
          }))
          .filter((task: Task) => {
            const taskDate = new Date(task.dueDate)
            taskDate.setHours(0, 0, 0, 0)
            return taskDate.getTime() >= today.getTime() // Filter out overdue tasks
          })
        setUpcomingTasks(tasks.slice(0, 3))

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    getData()
  }, [supabase])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setUpcomingTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask)
    }
    // If completed, remove from upcoming? Or keep it? 
    // Usually upcoming implies pending. If user completes it in dialog, we should probably remove it from the list.
    if (updatedTask.completed) {
      setUpcomingTasks(prev => prev.filter(t => t.id !== updatedTask.id))
      setIsTaskDialogOpen(false)
    }
  }

  const handleTaskDeleted = (taskId: string) => {
    setUpcomingTasks(prev => prev.filter(t => t.id !== taskId))
    setSelectedTask(null)
  }

  const handleTaskAdded = (newTask: Task) => {
    setUpcomingTasks(prev => {
      const updated = [...prev, newTask].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      return updated.slice(0, 3) // Keep only top 3
    })
  }

  const [currentQuote, setCurrentQuote] = useState("")
  const [isAnimating, setIsAnimating] = useState(true)

  const celebratoryQuotes = [
    "No tasks? Time to save the world! 🌍",
    "Inbox zero achieved. You're a wizard 🧙‍♂️",
    "Nothing to do... suspicious 🤔",
    "Go touch some grass 🌱",
    "Time for a coffee break ☕",
    "You've earned a nap 😴",
    "All caught up! 🚀",
    "Silence is golden... and so is an empty to-do list. ✨",
    "You handle business like a boss. 😎",
    "Task list? More like 'Done' list. ✅",
    "Enjoy the sound of absolutely nothing due. 🎵",
    "Time to work on your world domination plans. 🗺️",
    "Look at all this free time! (Don't waste it). ⏳",
    "System status: All systems nominal. 🤖",
    "Level cleared! Ready for the next stage? 🎮",
    "You are the speed. ⚡",
    "Take a deep breath. You made it. 🍃",
    "Go treat yourself. You deserve it. 🍦",
    "Nothing to see here, just pure productivity. 👓",
    "Is it just me, or are you amazing? 🌟",
    "Plot twist: You actually finished everything. 🎬",
    "Error 404: Tasks not found. (This is good). 💻"
  ]

  const motivationalQuotes = [
    "Stay focused! 🎯",
    "One step at a time 👣",
    "Keep the momentum going 🚀",
    "You've got this! 💪",
    "Eyes on the prize 🏆",
    "Make it happen ✨",
    "Crush those goals! 🔥",
    "Almost at the finish line! 🏁",
    "Just a few more monsters to slay. ⚔️",
    "Don't stop now, you're on a roll! 🥐",
    "Small steps lead to big places. 🏔️",
    "Future you will thank you. 🤝",
    "Focus. Speed. I am speed. 🏎️",
    "You can do hard things. 🧱",
    "Diamonds are made under pressure. 💎",
    "Slay the day! 🐉",
    "One down, a couple to go. 👇",
    "Productivity mode: ON. 🟢",
    "Make today your masterpiece. 🎨",
    "Determined. Unstoppable. You. 🫵",
    "Finish strong! 🏋️",
    "Keep grinding, keep shining. ✨"
  ]

  useEffect(() => {
    // Determine which list to use
    const quotes = upcomingTasks.length === 0 ? celebratoryQuotes : motivationalQuotes

    // Animation configuration
    const duration = 2000 // Animation duration in ms
    const intervalTime = 50 // Time between quote changes in ms
    const steps = duration / intervalTime

    let step = 0
    const interval = setInterval(() => {
      step++
      // Pick a random quote during animation
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
      setCurrentQuote(randomQuote)

      if (step >= steps) {
        clearInterval(interval)
        setIsAnimating(false)
        // Ensure we end on a random quote (already set above, but safe to leave)
      }
    }, intervalTime)

    return () => clearInterval(interval)
  }, [upcomingTasks.length]) // Re-run when task count changes category (0 vs >0)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive"
      case "medium":
        return "bg-chart-1"
      case "low":
        return "bg-chart-3"
      default:
        return "bg-muted"
    }
  }

  const handleAiSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (aiSearchQuery.trim()) {
      router.push(`/ai-tools?query=${encodeURIComponent(aiSearchQuery)}`)
    }
  }

  const handleGenerateQuiz = () => {
    router.push("/ai-tools?tab=quiz")
  }

  const handleTaskManager = () => {
    router.push("/tasks")
  }

  const handleSavedResources = () => {
    router.push("/notes?tab=saved")
  }

  const handleViewTasks = () => {
    router.push("/tasks")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-balance">Welcome back, {userName || "Student"}!</h1>
                <p className="text-muted-foreground mt-1">Ready to continue your learning journey?</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                  <Zap className="w-3 h-3 mr-1" />{studyStreak} Day Streak
                </Badge>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Quizzes Taken</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-muted-foreground">0</span> from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{studyStreak} Days</div>
                  <p className="text-xs text-muted-foreground">Keep it up!</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leaderboard Rank</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">#0</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-muted-foreground">-</span> from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notes Studied</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col">
                    <div className="text-3xl font-bold">{notesStudiedCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total Notes: {totalNotesCount}
                      {userBranch && userSemester && (
                        <span className="ml-1">
                          ( {(() => {
                            const b = userBranch || ""
                            let abbr = b.split(/[\s-]+/).map(w => w[0]).join("").toUpperCase()
                            if (b === "Computer Technology" || b.toLowerCase() === "computer-technology") abbr = "CM"
                            return `${abbr} - Sem ${userSemester}`
                          })()} )
                        </span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcoming Tasks */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="gap-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">Upcoming Tasks</CardTitle>
                        <CardDescription className="mt-2">Tasks sorted by nearest due date. Overdue tasks are not displayed here.</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleViewTasks}
                        className="h-8 w-8 p-0 hover:bg-secondary/80"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col pt-0">
                    {upcomingTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center p-8 min-h-[200px] space-y-4 cursor-default select-none transition-all duration-500 ease-in-out">
                        <div className="flex flex-col items-center justify-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300">
                          <Coffee className={`w-12 h-12 text-primary/50 mb-2 ${isAnimating ? 'animate-pulse' : ''}`} />
                          <p className="text-lg font-medium italic text-muted-foreground min-h-[28px]">
                            "{currentQuote}"
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)} className="mt-4">
                          Add a task
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {upcomingTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 border cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => handleTaskClick(task)}
                          >
                            <div className={`w-3 h-3 ${getPriorityColor(task.priority)} rounded-full`}></div>
                            <div className="flex-1">
                              <p className="font-medium text-base">{task.title}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-muted-foreground">{task.subject}</span>
                                <div
                                  className={`flex items-center text-xs ${task.priority === "high" ? "text-destructive" : task.priority === "medium" ? "text-chart-1" : "text-chart-3"}`}
                                >
                                  <Calendar className="w-3 h-3 mr-1" />
                                  <span className="text-xs">
                                    Due{" "}
                                    {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {upcomingTasks.length < 3 && (
                          <div
                            className="flex flex-col items-center justify-center text-center p-4 transition-all duration-500 ease-in-out"
                            style={{ height: `${(3 - upcomingTasks.length) * 70 + (Math.max(0, 3 - upcomingTasks.length - 1) * 12)}px` }}
                          >
                            <div className="flex flex-col items-center justify-center gap-2 opacity-40 hover:opacity-80 transition-opacity duration-300 cursor-default select-none">
                              {upcomingTasks.length === 0 ? (
                                <>
                                  <Coffee className={`w-8 h-8 mb-1 ${isAnimating ? 'animate-pulse' : ''}`} />
                                  <span className="text-sm italic font-medium min-h-[20px]">
                                    "{currentQuote}"
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Target className={`w-8 h-8 mb-1 ${isAnimating ? 'animate-pulse' : ''}`} />
                                  <span className="text-sm italic font-medium min-h-[20px]">
                                    "{currentQuote}"
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-primary" />
                      AI Study Assistant
                    </CardTitle>
                    <CardDescription>Ask anything about your studies and get instant AI-powered help</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAiSearch} className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                          placeholder="Ask me anything... e.g., 'Explain machine learning algorithms'"
                          value={aiSearchQuery}
                          onChange={(e) => setAiSearchQuery(e.target.value)}
                          className="pl-12 h-12 text-base bg-background/50 border-primary/20 focus:border-primary/40"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-primary/10 text-xs"
                            onClick={() => setAiSearchQuery("Explain data structures")}
                          >
                            Explain data structures
                          </Badge>
                          <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-primary/10 text-xs"
                            onClick={() => setAiSearchQuery("Create a study plan")}
                          >
                            Create a study plan
                          </Badge>
                          <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-primary/10 text-xs"
                            onClick={() => setAiSearchQuery("Generate quiz questions")}
                          >
                            Generate quiz questions
                          </Badge>
                        </div>
                        <Button type="submit" disabled={!aiSearchQuery.trim()} className="ml-2">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Ask AI
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity & Quick Actions */}
              <div className="space-y-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                    <CardDescription className="text-xs">Your latest study sessions and achievements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center p-4 text-muted-foreground text-sm">
                      No recent activity
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full justify-start bg-transparent"
                      variant="outline"
                      onClick={handleGenerateQuiz}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Generate AI Quiz
                    </Button>
                    <Button
                      className="w-full justify-start bg-transparent"
                      variant="outline"
                      onClick={handleTaskManager}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Task Manager
                    </Button>
                    <Button
                      className="w-full justify-start bg-transparent"
                      variant="outline"
                      onClick={handleSavedResources}
                    >
                      <Bookmark className="w-4 h-4 mr-2" />
                      Saved Resources
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div >

      {/* Task Details Dialog */}
      < TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={selectedTask}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />

      {/* Add Task Dialog */}
      < AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onTaskAdded={handleTaskAdded}
      />

      {/* Onboarding Modal */}
      {
        user && (
          <OnboardingModal
            isOpen={showOnboarding}
            userId={user.id}
            currentFullName={user.user_metadata?.full_name || ""}
            onComplete={handleOnboardingComplete}
          />
        )
      }
    </div >
  )
}
