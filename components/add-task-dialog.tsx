"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CheckSquare, Plus, Calendar as CalendarIcon, BookOpen, Brain, Users, Trophy, Target, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

export interface Task {
    id: string
    title: string
    description: string
    category: "assignment" | "study" | "project" | "exam"
    priority: "low" | "medium" | "high"
    dueDate: string
    completed: boolean
    subject: string
}

interface AddTaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onTaskAdded: (task: Task) => void
}

export function AddTaskDialog({ open, onOpenChange, onTaskAdded }: AddTaskDialogProps) {
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        category: "assignment" as Task["category"],
        priority: "medium" as Task["priority"],
        dueDate: "",
        subject: "",
    })
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (!open) {
            setIsCalendarOpen(false)
            // Optional: Reset form when dialog closes? 
            // Maybe not, user might want to resume. 
            // But usually "Add New" implies fresh start.
            // Let's reset on successful add instead.
        }
    }, [open])

    const addTask = async () => {
        if (!newTask.title.trim() || !newTask.dueDate.trim()) return

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('tasks')
                .insert({
                    title: newTask.title,
                    description: newTask.description,
                    category: newTask.category,
                    priority: newTask.priority,
                    due_date: newTask.dueDate,
                    subject: newTask.subject,
                    user_id: user.id
                })
                .select()
                .single()

            if (error) throw error

            const createdTask: Task = {
                id: data.id,
                title: data.title,
                description: data.description,
                category: data.category,
                priority: data.priority,
                dueDate: data.due_date,
                completed: data.completed,
                subject: data.subject
            }

            onTaskAdded(createdTask)
            onOpenChange(false)
            setNewTask({
                title: "",
                description: "",
                category: "assignment" as Task["category"],
                priority: "medium" as Task["priority"],
                dueDate: "",
                subject: "",
            })
        } catch (error) {
            console.error('Error adding task:', error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0" showCloseButton={false}>
                <DialogHeader className="p-6 bg-muted/30 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl ring-1 ring-primary/20">
                                <CheckSquare className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold tracking-tight">Add New Task</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                    Create a new task to track your academic progress.
                                </DialogDescription>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Main Task Info */}
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                                <Target className="w-4 h-4 text-primary/70" />
                                Task Title
                            </Label>
                            <Input
                                id="title"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                placeholder="e.g., Complete Data Structures Assignment"
                                className="h-11 bg-muted/20 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                                <BookOpen className="w-4 h-4 text-primary/70" />
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                placeholder="Add details about your task..."
                                className="min-h-[100px] resize-none bg-muted/20 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Classification */}
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category" className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                                    <Users className="w-4 h-4 text-primary/70" />
                                    Category
                                </Label>
                                <Select
                                    value={newTask.category}
                                    onValueChange={(value: Task["category"]) => setNewTask({ ...newTask, category: value })}
                                >
                                    <SelectTrigger className="h-10 bg-muted/20 border-muted-foreground/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-[200]">
                                        <SelectItem value="assignment">Assignment</SelectItem>
                                        <SelectItem value="study">Study Session</SelectItem>
                                        <SelectItem value="project">Project</SelectItem>
                                        <SelectItem value="exam">Exam Prep</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="subject" className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                                    <Brain className="w-4 h-4 text-primary/70" />
                                    Subject
                                </Label>
                                <Input
                                    id="subject"
                                    value={newTask.subject}
                                    onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                                    placeholder="e.g., Computer Technology"
                                    className="h-10 bg-muted/20 border-muted-foreground/20"
                                />
                            </div>
                        </div>

                        {/* Planning */}
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="priority" className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                                    <Trophy className="w-4 h-4 text-primary/70" />
                                    Priority
                                </Label>
                                <Select
                                    value={newTask.priority}
                                    onValueChange={(value: Task["priority"]) => setNewTask({ ...newTask, priority: value })}
                                >
                                    <SelectTrigger className="h-10 bg-muted/20 border-muted-foreground/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-[200]">
                                        <SelectItem value="low">Low Priority</SelectItem>
                                        <SelectItem value="medium">Medium Priority</SelectItem>
                                        <SelectItem value="high">High Priority</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="dueDate" className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                                    <CalendarIcon className="w-4 h-4 text-primary/70" />
                                    Due Date
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        value={newTask.dueDate ? format(new Date(newTask.dueDate), "yyyy-MM-dd") : ""}
                                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                        className="flex-1 h-10 bg-muted/20 border-muted-foreground/20 [&::-webkit-calendar-picker-indicator]:hidden"
                                    />
                                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                size="icon"
                                                className={cn(
                                                    "w-10 h-10 bg-muted/20 border-muted-foreground/20",
                                                    !newTask.dueDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 z-[200]" align="end">
                                            <Calendar
                                                mode="single"
                                                selected={newTask.dueDate ? new Date(newTask.dueDate) : undefined}
                                                onSelect={(date) => {
                                                    setNewTask({ ...newTask, dueDate: date ? date.toISOString() : "" })
                                                    setIsCalendarOpen(false)
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-2 bg-background">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10 px-6">
                        Cancel
                    </Button>
                    <Button type="submit" onClick={addTask} className="h-10 px-6 gap-2">
                        <Plus className="w-4 h-4" />
                        Create Task
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
