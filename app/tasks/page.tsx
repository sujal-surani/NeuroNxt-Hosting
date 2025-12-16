"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckSquare, Plus, Calendar as CalendarIcon, BookOpen, Brain, Users, Trophy, Target, CheckCircle2, Circle, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useEffect } from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"


import { AddTaskDialog, Task } from "@/components/add-task-dialog"
import { TaskDialog } from "@/components/task-dialog"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [categoryFilter, setCategoryFilter] = useState<"all" | "pending" | "completed">("all")
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true })

      if (error) throw error

      setTasks(data.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        dueDate: t.due_date,
        completed: t.completed,
        subject: t.subject
      })))
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)))
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(prev => prev ? { ...prev, completed: !prev.completed } : null)
      }
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const openTaskDetails = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDetailsOpen(true)
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    setSelectedTask(updatedTask)
  }

  const handleTaskDeleted = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
    setSelectedTask(null)
  }

  const handleTaskAdded = (newTask: Task) => {
    setTasks([...tasks, newTask])
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "assignment":
        return <BookOpen className="w-4 h-4" />
      case "study":
        return <Brain className="w-4 h-4" />
      case "project":
        return <Users className="w-4 h-4" />
      case "exam":
        return <Target className="w-4 h-4" />
      default:
        return <CheckSquare className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400"
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400"
      case "low":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:border-green-900 dark:text-green-400"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  const getPriorityWeight = (priority: string) => {
    switch (priority) {
      case "high":
        return 3
      case "medium":
        return 2
      case "low":
        return 1
      default:
        return 0
    }
  }

  const completedTasks = tasks.filter((task) => task.completed).length
  const pendingTasks = tasks.filter((task) => !task.completed).length
  const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

  const upNextTask = tasks
    .filter((task) => {
      if (task.completed) return false
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const due = new Date(task.dueDate)
      // We want to include today, so due date must be >= today (midnight)
      // But wait, if due date is just "YYYY-MM-DD", new Date("YYYY-MM-DD") is UTC midnight.
      // And new Date() is local time.
      // Let's use the same logic as getRemainingDays roughly, or just simple comparison.
      // Safest is to reset time on both to 0.
      due.setHours(0, 0, 0, 0)
      return due.getTime() >= today.getTime()
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]

  const overdueTasksCount = tasks.filter((task) => {
    if (task.completed) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(task.dueDate)
    due.setHours(0, 0, 0, 0)
    return due.getTime() < today.getTime()
  }).length

  const filteredTasks = (() => {
    const filtered =
      activeTab === "all"
        ? tasks
        : activeTab === "pending"
          ? tasks.filter((task) => !task.completed)
          : activeTab === "completed"
            ? tasks.filter((task) => task.completed)
            : tasks.filter((task) => task.category === activeTab) // This case is actually not used due to "categories" tab

    // Sort by priority first (high > medium > low), then by due date (nearest first)
    return filtered.sort((a, b) => {
      const priorityDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority)
      if (priorityDiff !== 0) return priorityDiff
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
  })()

  const getTasksByCategory = () => {
    const categories = ["assignment", "study", "project", "exam"] as const
    return categories
      .map((category) => {
        let categoryTasks = tasks.filter((task) => task.category === category)

        if (categoryFilter === "pending") {
          categoryTasks = categoryTasks.filter((task) => !task.completed)
        } else if (categoryFilter === "completed") {
          categoryTasks = categoryTasks.filter((task) => task.completed)
        }

        return {
          category,
          tasks: categoryTasks.sort((a, b) => {
            const priorityDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority)
            if (priorityDiff !== 0) return priorityDiff
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          }),
        }
      })
      .filter((group) => group.tasks.length > 0)
  }

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "assignment":
        return "Assignments"
      case "study":
        return "Study Sessions"
      case "project":
        return "Projects"
      case "exam":
        return "Exams"
      default:
        return category
    }
  }

  const getCategoryColor = (category: string) => {
    return "bg-muted/50 border-border"
  }

  const getRemainingDays = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getRemainingDaysStyle = (remainingDays: number) => {
    if (remainingDays <= 0) {
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:border-red-900 dark:text-red-400"
    } else {
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-900 dark:text-emerald-400"
    }
  }

  const getRemainingDaysText = (remainingDays: number) => {
    if (remainingDays < 0) {
      const overdueDays = Math.abs(remainingDays)
      return `Overdue by ${overdueDays} day${overdueDays !== 1 ? "s" : ""}`
    } else if (remainingDays === 0) {
      return "Due today"
    } else {
      return `${remainingDays} day${remainingDays !== 1 ? "s" : ""} remaining`
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-balance">Study Tasks</h1>
                <p className="text-muted-foreground mt-1">Organize and track your academic assignments and goals</p>
              </div>
              <Button onClick={() => setIsAddTaskOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
              <AddTaskDialog
                open={isAddTaskOpen}
                onOpenChange={setIsAddTaskOpen}
                onTaskAdded={handleTaskAdded}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{tasks.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {completedTasks} completed, {pendingTasks} pending
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {Math.round(completionRate)}%
                  </div>
                  <Progress value={completionRate} className="h-2 mt-2" />
                </CardContent>
              </Card>
              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Up Next
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upNextTask ? (
                    <div>
                      <div className="font-medium truncate text-foreground">
                        {upNextTask.title}
                      </div>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {getRemainingDaysText(getRemainingDays(upNextTask.dueDate))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {overdueTasksCount > 0
                        ? `No upcoming tasks, but ${overdueTasksCount} overdue`
                        : "No upcoming tasks"}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-4">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed">
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <CheckSquare className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No tasks found</h3>
                      <p className="text-muted-foreground mt-1">
                        You don't have any tasks in this view. Add a new task to get started.
                      </p>
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <Card
                        key={task.id}
                        className={`transition-all hover:shadow-md cursor-pointer ${task.completed ? "opacity-70 bg-muted/30" : ""}`}
                        onClick={() => openTaskDetails(task)}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`rounded-full shrink-0 ${task.completed ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-muted-foreground hover:text-foreground"}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleTask(task.id)
                            }}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </Button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3
                                className={`font-medium truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}
                              >
                                {task.title}
                              </h3>
                              <Badge variant="outline" className={`text-xs px-1.5 py-0 h-5 ${getPriorityColor(task.priority)}`}>
                                {formatPriority(task.priority)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                {getCategoryIcon(task.category)}
                                <span className="capitalize">{task.category}</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                              {!task.completed && (
                                <>
                                  <span>•</span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getRemainingDaysStyle(getRemainingDays(task.dueDate))}`}
                                  >
                                    {getRemainingDaysText(getRemainingDays(task.dueDate))}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pending" className="mt-6">
                <div className="space-y-4">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed">
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <CheckSquare className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No pending tasks</h3>
                      <p className="text-muted-foreground mt-1">Great job! You've completed all your pending tasks.</p>
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <Card
                        key={task.id}
                        className="transition-all hover:shadow-md cursor-pointer"
                        onClick={() => openTaskDetails(task)}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full shrink-0 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleTask(task.id)
                            }}
                          >
                            <Circle className="w-5 h-5" />
                          </Button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium truncate">{task.title}</h3>
                              <Badge variant="outline" className={`text-xs px-1.5 py-0 h-5 ${getPriorityColor(task.priority)}`}>
                                {formatPriority(task.priority)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                {getCategoryIcon(task.category)}
                                <span className="capitalize">{task.category}</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                              <span>•</span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getRemainingDaysStyle(getRemainingDays(task.dueDate))}`}
                              >
                                {getRemainingDaysText(getRemainingDays(task.dueDate))}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <div className="space-y-4">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed">
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <CheckSquare className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No completed tasks</h3>
                      <p className="text-muted-foreground mt-1">Finish some tasks to see them listed here.</p>
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <Card
                        key={task.id}
                        className="transition-all hover:shadow-md cursor-pointer opacity-70 bg-muted/30"
                        onClick={() => openTaskDetails(task)}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full shrink-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleTask(task.id)
                            }}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </Button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium truncate line-through text-muted-foreground">{task.title}</h3>
                              <Badge variant="outline" className={`text-xs px-1.5 py-0 h-5 ${getPriorityColor(task.priority)}`}>
                                {formatPriority(task.priority)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                {getCategoryIcon(task.category)}
                                <span className="capitalize">{task.category}</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="categories" className="mt-6">
                <div className="flex items-center justify-end mb-4">
                  <Select
                    value={categoryFilter}
                    onValueChange={(value: any) => setCategoryFilter(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="pending">Pending Only</SelectItem>
                      <SelectItem value="completed">Completed Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-8">
                  {getTasksByCategory().length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed">
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <CheckSquare className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No tasks found</h3>
                      <p className="text-muted-foreground mt-1">Try changing the filter or add new tasks.</p>
                    </div>
                  ) : (
                    getTasksByCategory().map((group) => (
                      <div key={group.category} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-md border ${getCategoryColor(group.category)}`}>
                            {getCategoryIcon(group.category)}
                          </div>
                          <h3 className="font-semibold text-lg">{getCategoryTitle(group.category)}</h3>
                          <Badge variant="secondary" className="ml-2">
                            {group.tasks.length}
                          </Badge>
                        </div>
                        <div className="grid gap-3">
                          {group.tasks.map((task) => (
                            <Card
                              key={task.id}
                              className={`transition-all hover:shadow-md cursor-pointer ${task.completed ? "opacity-70 bg-muted/30" : ""}`}
                              onClick={() => openTaskDetails(task)}
                            >
                              <CardContent className="p-4 flex items-center gap-4">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`rounded-full shrink-0 ${task.completed ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-muted-foreground hover:text-foreground"}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleTask(task.id)
                                  }}
                                >
                                  {task.completed ? (
                                    <CheckCircle2 className="w-5 h-5" />
                                  ) : (
                                    <Circle className="w-5 h-5" />
                                  )}
                                </Button>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3
                                      className={`font-medium truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}
                                    >
                                      {task.title}
                                    </h3>
                                    <Badge variant="outline" className={`text-xs px-1.5 py-0 h-5 ${getPriorityColor(task.priority)}`}>
                                      {formatPriority(task.priority)}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <CalendarIcon className="w-3 h-3" />
                                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                    </div>
                                    {!task.completed && (
                                      <>
                                        <span>•</span>
                                        <span
                                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getRemainingDaysStyle(getRemainingDays(task.dueDate))}`}
                                        >
                                          {getRemainingDaysText(getRemainingDays(task.dueDate))}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <TaskDialog
              open={isTaskDetailsOpen}
              onOpenChange={setIsTaskDetailsOpen}
              task={selectedTask}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
            />
          </div>
        </main>
      </div >
    </div >
  )
}
