"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { approveStudent, rejectStudent } from "@/lib/actions/admin"
import { toast } from "sonner"

interface StudentActionButtonsProps {
    studentId: string
    studentName: string
}

export function StudentActionButtons({ studentId, studentName }: StudentActionButtonsProps) {
    const [isApproving, setIsApproving] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)

    const handleApprove = async () => {
        setIsApproving(true)
        try {
            const result = await approveStudent(studentId)
            if (result.success) {
                toast.success(`Approved the Student: ${studentName}`)
            } else {
                toast.error(`Failed to approve: ${result.error}`)
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsApproving(false)
        }
    }

    const handleReject = async () => {
        setIsRejecting(true)
        try {
            const result = await rejectStudent(studentId)
            if (result.success) {
                toast.success(`Rejected the Student: ${studentName}`)
            } else {
                toast.error(`Failed to reject: ${result.error}`)
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsRejecting(false)
        }
    }

    return (
        <div className="flex gap-2">
            <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
            >
                {isApproving ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                    <CheckCircle className="w-4 h-4 mr-1" />
                )}
                Approve
            </Button>
            <Button
                size="sm"
                variant="destructive"
                onClick={handleReject}
                disabled={isApproving || isRejecting}
            >
                {isRejecting ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                    <XCircle className="w-4 h-4 mr-1" />
                )}
                Reject
            </Button>
        </div>
    )
}
