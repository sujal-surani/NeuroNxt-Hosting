"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateStudentProfile } from "@/app/actions/admin-updates"

interface EditStudentDialogProps {
    student: any // Using any for flexibility with user object structure
}

export function EditStudentDialog({ student }: EditStudentDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Initial state from student prop
    const [fullName, setFullName] = useState(student.user_metadata.full_name || "")
    const [email, setEmail] = useState(student.email || "")
    const [branch, setBranch] = useState(student.user_metadata.branch || "")
    const [semester, setSemester] = useState(student.user_metadata.semester || "1")
    const [enrollmentNumber, setEnrollmentNumber] = useState(student.user_metadata.enrollment_number || "")

    const handleUpdate = async () => {
        setIsLoading(true)
        try {
            const result = await updateStudentProfile(student.id, {
                fullName,
                email,
                branch,
                semester,
                enrollmentNumber
            })

            if (result.success) {
                toast.success("Student updated successfully")
                setOpen(false)
            } else {
                toast.error(`Update failed: ${result.error}`)
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Student Profile</DialogTitle>
                    <DialogDescription>
                        Make changes to the student's profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="enrollment">Enrollment Number</Label>
                        <Input id="enrollment" value={enrollmentNumber} onChange={(e) => setEnrollmentNumber(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="branch">Branch</Label>
                            <Select value={branch} onValueChange={setBranch}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="computer-technology">Computer Technology</SelectItem>
                                    <SelectItem value="civil-engineering">Civil Engineering</SelectItem>
                                    <SelectItem value="mechanical-engineering">Mechanical Engineering</SelectItem>
                                    <SelectItem value="electrical-engineering">Electrical Engineering</SelectItem>
                                    <SelectItem value="electronics-telecommunication">ENT</SelectItem>
                                    {/* Add other branches as needed matching your system */}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="semester">Semester</Label>
                            <Select value={semester} onValueChange={setSemester}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                        <SelectItem key={s} value={s.toString()}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleUpdate} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
