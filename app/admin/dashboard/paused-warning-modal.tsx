"use client"

import { useEffect, useState } from "react"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { ShieldAlert, Mail, Users, Lock } from "lucide-react"

export function PausedWarningModal({ isPaused }: { isPaused: boolean }) {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!isPaused) return

        // Show immediately on mount
        setOpen(true)

        // Set up interval to show every 10 seconds
        const interval = setInterval(() => {
            setOpen(true)
        }, 10000)

        return () => clearInterval(interval)
    }, [isPaused])

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className="max-w-2xl p-0 overflow-hidden border-0 shadow-2xl">
                <div className="bg-destructive/10 p-6 flex items-center justify-center border-b border-destructive/20">
                    <div className="h-16 w-16 bg-destructive/20 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-300">
                        <ShieldAlert className="h-8 w-8 text-destructive" />
                    </div>
                </div>

                <div className="p-6 md:p-8 space-y-6 bg-background">
                    <div className="text-center space-y-2">
                        <AlertDialogTitle className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                            Institute Access Suspended
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base md:text-lg text-muted-foreground max-w-md mx-auto">
                            The platform administrator has temporarily paused your institute's account.
                        </AlertDialogDescription>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-xl p-4 bg-muted/30 flex flex-col gap-2 relative overflow-hidden group hover:border-destructive/30 transition-colors">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-4xl">🚫</span>
                            </div>
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                                <Users className="h-4 w-4 text-destructive" />
                                Student Access
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Login restricted for all students and teachers. Platform resources are unavailable.
                            </p>
                        </div>
                        <div className="border rounded-xl p-4 bg-muted/30 flex flex-col gap-2 relative overflow-hidden group hover:border-destructive/30 transition-colors">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-4xl">🔒</span>
                            </div>
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                                <Lock className="h-4 w-4 text-amber-500" />
                                Admin Controls
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Dashboard access is limited to <strong>Read-Only</strong>. Management actions are disabled.
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 p-4 rounded-xl text-sm flex items-start gap-3">
                        <Mail className="h-5 w-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                        <div>
                            <p className="font-medium">Action Required</p>
                            <p className="opacity-90">Please contact <strong>NeuroNxt Support</strong> immediately to resolve this violation and restore full access.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-muted/10 border-t flex justify-center">
                    <AlertDialogAction
                        onClick={() => setOpen(false)}
                        className="w-full sm:w-auto min-w-[200px] font-semibold"
                    >
                        I Understand & Acknowledge
                    </AlertDialogAction>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}
