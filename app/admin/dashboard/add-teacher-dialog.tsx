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
import { Plus, Loader2 } from "lucide-react"
import { createTeacher } from "@/lib/actions/admin"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AddTeacherDialog({ instituteCode }: { instituteCode: string }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        branch: "Computer Technology",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Submitting Add Teacher form", formData)
        setIsLoading(true)

        try {
            const result = await createTeacher({
                ...formData,
                instituteCode,
            })

            console.log("createTeacher result:", result)

            if (result.success) {
                toast.success("Teacher account created successfully")
                setOpen(false)
                setFormData({ name: "", email: "", password: "", branch: "Computer Technology" })
            } else {
                toast.error(result.error || "Failed to create teacher")
            }
        } catch (error) {
            console.error("Error in handleSubmit:", error)
            toast.error("An unexpected error occurred: " + (error as Error).message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Teacher
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Teacher</DialogTitle>
                    <DialogDescription>
                        Create a new teacher account for your institute. They will be able to log in immediately.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="branch" className="text-right">
                                Branch
                            </Label>
                            <Select
                                value={formData.branch}
                                onValueChange={(value) => setFormData({ ...formData, branch: value })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Computer Technology">Computer Technology</SelectItem>
                                    <SelectItem value="Information Technology">Information Technology</SelectItem>
                                    <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                                    <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="text"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="col-span-3"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Account
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
