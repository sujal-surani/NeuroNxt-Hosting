"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Calendar as CalendarIcon, CheckCircle2, BookOpen, Brain, Users, Trophy, ClipboardList, CheckSquare, X, Clock, AlertCircle, Tag, FileText, Trash2, Pencil } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Task } from "@/components/add-task-dialog"

interface TaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    task: Task | null
    onTaskUpdated: (task: Task) => void
    onTaskDeleted: (taskId: string) => void
}

export function TaskDialog({ open, onOpenChange, task, onTaskUpdated, onTaskDeleted }: TaskDialogProps) {
    const [isEditMode, setIsEditMode] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const [editTask, setEditTask] = useState<Partial<Task>>({})
    const supabase = createClient()

    useEffect(() => {
        if (open && task) {
            setEditTask(task)
            setIsEditMode(false)
        }
    }, [open, task])

    if (!task) return null

    const saveEditTask = async () => {
        if (!editTask.title?.trim() || !task) return

        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    title: editTask.title,
                    description: editTask.description,
                    category: editTask.category,
                    priority: editTask.priority,
                    due_date: editTask.dueDate,
                    subject: editTask.subject
                })
                .eq('id', task.id)

            if (error) throw error

            onTaskUpdated({ ...task, ...editTask } as Task)
            setIsEditMode(false)
            onOpenChange(false)
        } catch (error) {
            console.error('Error updating task:', error)
        }
    }

    const deleteTask = async () => {
        if (!task) return

        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', task.id)

            if (error) throw error

            onTaskDeleted(task.id)
            setIsDeleteConfirmOpen(false)
            onOpenChange(false)
        } catch (error) {
            console.error('Error deleting task:', error)
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "assignment":
                return <ClipboardList className="w-4 h-4" />
            case "study":
                return <Brain className="w-4 h-4" />
            case "project":
                return <Users className="w-4 h-4" />
            case "exam":
                return <Trophy className="w-4 h-4" />
            default:
                return <CheckSquare className="w-4 h-4" />
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400"
            case "medium":
                return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400"
            case "low":
                return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-400"
            default:
                return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800 dark:text-slate-400"
        }
    }

    const getRemainingDays = (dueDate: string) => {
        const today = new Date()
        const due = new Date(dueDate)
        const diffTime = due.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const getRemainingDaysBadgeStyle = (remainingDays: number) => {
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
            return `${remainingDays} day${remainingDays !== 1 ? "s" : ""} left`
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-card border shadow-xl rounded-xl overflow-hidden" showCloseButton={false}>
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 border-b bg-muted/50 backdrop-blur-sm">
                        <div className="flex-1 mr-4 flex gap-4">
                            <div className="h-10 w-10 bg-background rounded-xl shrink-0 flex items-center justify-center border shadow-sm">
                                <CheckSquare className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                {isEditMode ? (
                                    <Input
                                        value={editTask.title || ""}
                                        onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                                        className="font-semibold text-xl h-10"
                                        placeholder="Task Title"
                                    />
                                ) : (
                                    <div className="space-y-1.5">
                                        <DialogTitle className="text-xl font-semibold leading-none tracking-tight">
                                            {task.title}
                                        </DialogTitle>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={cn("capitalize font-normal px-2 py-0.5 h-auto",
                                                task.completed ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:border-green-900 dark:text-green-400" : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400"
                                            )}>
                                                {task.completed ? (
                                                    <><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</>
                                                ) : (
                                                    <><Clock className="w-3 h-3 mr-1" /> In Progress</>
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {!isEditMode ? (
                                <>
                                    <Button variant="ghost" size="icon" onClick={() => setIsEditMode(true)} className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors">
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setIsDeleteConfirmOpen(true)} className="h-8 w-8 text-muted-foreground hover:text-red-600 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setIsEditMode(false)} className="h-8">
                                        Cancel
                                    </Button>
                                    <Button size="sm" onClick={saveEditTask} className="h-8 px-4">
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                            <div className="w-px h-4 bg-border mx-2" />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => onOpenChange(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Description Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <FileText className="w-4 h-4" />
                                Description
                            </div>

                            {isEditMode ? (
                                <Textarea
                                    value={editTask.description || ""}
                                    onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                                    className="min-h-[120px] resize-none text-base p-4 bg-muted/30 focus:bg-background transition-colors"
                                    placeholder="Add details about this task..."
                                />
                            ) : (
                                <div className={cn("text-base leading-relaxed whitespace-pre-wrap",
                                    !task.description ? "text-muted-foreground italic" : "text-foreground/90"
                                )}>
                                    {task.description || "No description provided."}
                                </div>
                            )}
                        </div>

                        {/* Days Left Indicator */}
                        {!isEditMode && (
                            <div className="flex justify-center py-2">
                                <Badge variant="outline" className={cn("font-medium px-4 py-1.5 text-sm h-auto justify-center min-w-[100px] shadow-sm", getRemainingDaysBadgeStyle(getRemainingDays(task.dueDate)))}>
                                    {getRemainingDaysText(getRemainingDays(task.dueDate))}
                                </Badge>
                            </div>
                        )}

                        {/* Task Details Card */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Tag className="w-4 h-4" /> Task Details
                            </h4>
                            <div className="bg-muted/40 rounded-xl p-5 border border-border/50">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                    {/* Due Date */}
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Due Date</span>
                                        {isEditMode ? (
                                            <div className="flex gap-2">
                                                <Input
                                                    type="date"
                                                    value={editTask.dueDate ? format(new Date(editTask.dueDate), "yyyy-MM-dd") : ""}
                                                    onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
                                                    className="flex-1 h-9 bg-background [&::-webkit-calendar-picker-indicator]:hidden"
                                                />
                                                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            size="icon"
                                                            className={cn(
                                                                "w-9 h-9 bg-background",
                                                                !editTask.dueDate && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 z-[200]" align="end">
                                                        <Calendar
                                                            mode="single"
                                                            selected={editTask.dueDate ? new Date(editTask.dueDate) : undefined}
                                                            onSelect={(date) => {
                                                                setEditTask({ ...editTask, dueDate: date ? date.toISOString() : "" })
                                                                setIsCalendarOpen(false)
                                                            }}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium text-sm">
                                                        {format(new Date(task.dueDate), "MMM d, yyyy")}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Priority */}
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Priority</span>
                                        {isEditMode ? (
                                            <Select
                                                value={editTask.priority}
                                                onValueChange={(value: Task["priority"]) => setEditTask({ ...editTask, priority: value })}
                                            >
                                                <SelectTrigger className="h-9 bg-background">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="z-[200]">
                                                    <SelectItem value="low">Low Priority</SelectItem>
                                                    <SelectItem value="medium">Medium Priority</SelectItem>
                                                    <SelectItem value="high">High Priority</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={cn("capitalize font-medium border px-2.5 py-0.5", getPriorityColor(task.priority))}>
                                                    {task.priority} Priority
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    {/* Subject */}
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Subject</span>
                                        {isEditMode ? (
                                            <Input
                                                value={editTask.subject || ""}
                                                onChange={(e) => setEditTask({ ...editTask, subject: e.target.value })}
                                                className="h-9 bg-background"
                                                placeholder="Subject..."
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-muted-foreground" />
                                                <div className="font-medium text-sm">
                                                    {task.subject || "—"}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</span>
                                        {isEditMode ? (
                                            <Select
                                                value={editTask.category}
                                                onValueChange={(value: Task["category"]) => setEditTask({ ...editTask, category: value })}
                                            >
                                                <SelectTrigger className="h-9 bg-background">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="z-[200]">
                                                    <SelectItem value="assignment">Assignment</SelectItem>
                                                    <SelectItem value="study">Study Session</SelectItem>
                                                    <SelectItem value="project">Project</SelectItem>
                                                    <SelectItem value="exam">Exam Prep</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="text-muted-foreground">
                                                    {getCategoryIcon(task.category)}
                                                </div>
                                                <div className="font-medium text-sm capitalize">
                                                    {task.category}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-xl rounded-2xl" showCloseButton={false}>
                    <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 bg-background">
                        {/* Icon */}
                        <div className="h-16 w-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center shrink-0">
                            <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>

                        {/* Text */}
                        <div className="space-y-2">
                            <DialogTitle className="text-xl font-bold text-foreground">
                                Delete Task?
                            </DialogTitle>
                            <DialogDescription className="text-base text-muted-foreground max-w-[280px] mx-auto">
                                Are you sure you want to delete <span className="font-semibold text-foreground">"{task.title}"</span>?
                                <br />
                                This action cannot be undone.
                            </DialogDescription>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-3 w-full pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteConfirmOpen(false)}
                                className="flex-1 h-11 rounded-xl border-muted-foreground/20 hover:bg-muted/50 hover:text-foreground"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={deleteTask}
                                className="flex-1 h-11 rounded-xl shadow-md hover:shadow-lg transition-all bg-red-600 hover:bg-red-700 text-white"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
