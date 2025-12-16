"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PauseCircle, PlayCircle, Loader2 } from "lucide-react"
import { useState } from "react"
import { toggleInstituteStatus } from "@/app/actions/super-admin"
import { toast } from "sonner"

interface InstituteStatusToggleProps {
    instituteCode: string
    currentStatus: string
}

export function InstituteStatusToggle({ instituteCode, currentStatus }: InstituteStatusToggleProps) {
    const [status, setStatus] = useState(currentStatus)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async () => {
        setIsLoading(true)
        const newStatus = status === 'active' ? 'paused' : 'active'
        try {
            const result = await toggleInstituteStatus(instituteCode, newStatus)
            if (result.success) {
                setStatus(newStatus)
                toast.success(`Institute ${newStatus === 'active' ? 'resumed' : 'paused'}`)
            } else {
                toast.error("Failed to update status")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Badge
                variant={status === 'active' ? "secondary" : "destructive"}
                className={status === 'active'
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}
            >
                {status === 'active' ? 'Active' : 'Paused'}
            </Badge>

            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleToggle()
                }}
                disabled={isLoading}
                title={status === 'active' ? "Pause Institute" : "Resume Institute"}
            >
                {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : status === 'active' ? (
                    <PauseCircle className="h-4 w-4" />
                ) : (
                    <PlayCircle className="h-4 w-4" />
                )}
            </Button>
        </div>
    )
}
