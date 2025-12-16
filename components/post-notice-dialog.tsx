"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface PostNoticeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function PostNoticeDialog({ open, onOpenChange, onSuccess }: PostNoticeDialogProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [type, setType] = useState("general")
    const [priority, setPriority] = useState("medium")
    const [targetType, setTargetType] = useState("all")
    const [targetBranch, setTargetBranch] = useState("")
    const [targetSemester, setTargetSemester] = useState("all")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [userBranch, setUserBranch] = useState<string | null>(null)
    const [instituteCode, setInstituteCode] = useState<string | null>(null)
    const [authorName, setAuthorName] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('branch, institute_code, full_name')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    setUserBranch(profile.branch)
                    setInstituteCode(profile.institute_code)
                    setAuthorName(profile.full_name)
                }
            }
        }
        if (open) {
            fetchUserProfile()
            // Reset form on open
            setTitle("")
            setDescription("")
            setType("general")
            setPriority("medium")
            setTargetType("all")
            setTargetBranch("")
            setTargetSemester("all")
            setError(null)
        }
    }, [open, supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!instituteCode) {
            setError("User profile not loaded. Please try again.")
            return
        }

        if (targetType === 'branch' && !targetBranch) {
            setError("Please select a branch.")
            return
        }

        setIsSubmitting(true)

        const { error: insertError } = await supabase.from('notices').insert({
            title,
            description,
            type,
            priority,
            target_type: targetType,
            target_branch: targetType === 'branch' ? targetBranch : null,
            target_semester: targetSemester,
            institute_code: instituteCode,
            author_name: authorName,
            author_id: (await supabase.auth.getUser()).data.user?.id
        })

        setIsSubmitting(false)

        if (insertError) {
            console.error('Error posting notice:', insertError)
            setError("Failed to post notice. Please try again.")
        } else {
            onSuccess()
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Post New Notice</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter notice title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter notice details"
                            required
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="exam">Exam</SelectItem>
                                    <SelectItem value="holiday">Holiday</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="target">Target Audience</Label>
                            <Select value={targetType} onValueChange={setTargetType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select target" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Institute</SelectItem>
                                    <SelectItem value="branch">Specific Branch</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="semester">Semester</Label>
                            <Select value={targetSemester} onValueChange={setTargetSemester}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Semesters</SelectItem>
                                    {[1, 2, 3, 4, 5, 6].map((sem) => (
                                        <SelectItem key={sem} value={sem.toString()}>
                                            Semester {sem}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {targetType === 'branch' && (
                        <div className="space-y-2">
                            <Label htmlFor="branch">Branch</Label>
                            <Select value={targetBranch} onValueChange={setTargetBranch}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="computer-technology">Computer Technology</SelectItem>
                                    <SelectItem value="electronics-communication">Electronics & Communication</SelectItem>
                                    <SelectItem value="mechanical-engineering">Mechanical Engineering</SelectItem>
                                    <SelectItem value="civil-engineering">Civil Engineering</SelectItem>
                                    <SelectItem value="information-technology">Information Technology</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Post Notice
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
