"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, GraduationCap, ShieldAlert, Power, Activity } from "lucide-react"
import { useState } from "react"
import { toggleInstituteStatus } from "@/app/actions/super-admin"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface InstituteCardProps {
    admin: any
    stats: { students: number; teachers: number }
    initialStatus: string
    instituteCode: string
}

export function InstituteCard({ admin, stats, initialStatus, instituteCode }: InstituteCardProps) {
    const [status, setStatus] = useState(initialStatus)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async () => {
        setIsLoading(true)
        const newStatus = status === 'active' ? 'paused' : 'active'
        try {
            const result = await toggleInstituteStatus(instituteCode, newStatus)
            if (result.success) {
                setStatus(newStatus)
                if (newStatus === 'paused') {
                    toast.success("Institute Paused", {
                        description: "Access has been restricted for this institute.",
                    })
                } else {
                    toast.success("Institute Resumed", {
                        description: "Access has been restored.",
                    })
                }
            } else {
                toast.error("Failed to update status")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const isPaused = status === 'paused'

    return (
        <Card
            className={cn(
                "overflow-hidden transition-all duration-500 border group relative",
                isPaused
                    ? "bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    : "bg-white/50 dark:bg-card/50 border-border/50 hover:shadow-lg backdrop-blur-sm"
            )}
        >
            {/* Status Indicator Stripe */}
            <div
                className={cn(
                    "h-1 w-full transition-colors duration-500",
                    isPaused
                        ? "bg-gradient-to-r from-red-500 to-red-600 animate-pulse"
                        : "bg-gradient-to-r from-blue-500 to-indigo-500"
                )}
            />

            <CardHeader className="pb-4 relative">
                {/* Paused Overlay Pattern/Icon */}
                {isPaused && (
                    <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
                        <ShieldAlert className="w-24 h-24 text-red-600 rotate-12" />
                    </div>
                )}

                <div className="flex justify-between items-start z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className={cn(
                                "font-bold text-lg leading-tight line-clamp-1 transition-colors",
                                isPaused ? "text-red-900 dark:text-red-100" : "group-hover:text-primary"
                            )}>
                                {admin.user_metadata.institute_name || admin.user_metadata.full_name}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn(
                                "font-mono text-xs transition-colors",
                                isPaused ? "border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-300" : "bg-slate-100 dark:bg-slate-800"
                            )}>
                                {instituteCode}
                            </Badge>
                            <Badge variant={isPaused ? "destructive" : "secondary"} className={cn(
                                "text-xs capitalize transition-colors duration-300",
                                !isPaused && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            )}>
                                {status}
                            </Badge>
                        </div>
                    </div>

                    <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors duration-500",
                        isPaused
                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    )}>
                        {instituteCode?.substring(0, 2).toUpperCase() || "IN"}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="z-10 relative">
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className={cn(
                        "p-3 rounded-lg border flex flex-col items-center justify-center text-center transition-colors duration-300",
                        isPaused
                            ? "bg-red-100/50 border-red-200 dark:bg-red-900/20 dark:border-red-900/50"
                            : "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/50"
                    )}>
                        <div className={cn("text-2xl font-bold transition-colors", isPaused ? "text-red-700 dark:text-red-300" : "text-blue-700 dark:text-blue-300")}>
                            {stats.students}
                        </div>
                        <div className={cn("text-xs font-medium flex items-center gap-1", isPaused ? "text-red-600/80 dark:text-red-400/80" : "text-blue-600/80 dark:text-blue-400/80")}>
                            <Users className="w-3 h-3" /> Students
                        </div>
                    </div>

                    <div className={cn(
                        "p-3 rounded-lg border flex flex-col items-center justify-center text-center transition-colors duration-300",
                        isPaused
                            ? "bg-red-100/50 border-red-200 dark:bg-red-900/20 dark:border-red-900/50"
                            : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50"
                    )}>
                        <div className={cn("text-2xl font-bold transition-colors", isPaused ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300")}>
                            {stats.teachers}
                        </div>
                        <div className={cn("text-xs font-medium flex items-center gap-1", isPaused ? "text-red-600/80 dark:text-red-400/80" : "text-emerald-600/80 dark:text-emerald-400/80")}>
                            <GraduationCap className="w-3 h-3" /> Teachers
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <Button
                        size="sm"
                        variant={isPaused ? "destructive" : "outline"}
                        className={cn(
                            "gap-2 transition-all duration-300 relative overflow-hidden",
                            !isPaused && "hover:border-red-500 hover:text-red-500 group-hover/btn:w-full"
                        )}
                        onClick={handleToggle}
                        disabled={isLoading}
                    >
                        <Power className={cn("w-4 h-4", isLoading && "animate-spin")} />
                        {isPaused ? "Resume Institute" : "Pause Access"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
