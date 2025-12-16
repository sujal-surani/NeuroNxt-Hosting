import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AccessDeniedPage({ searchParams }: { searchParams: { reason?: string } }) {
    const isPaused = searchParams.reason === 'paused'

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl shadow-lg border p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
                    <AlertCircle className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Access Restricted</h1>
                    <p className="text-muted-foreground">
                        {isPaused
                            ? "Your institute's account is currently paused. Please contact your administrator for more information."
                            : "You do not have permission to access this resource."}
                    </p>
                </div>

                <div className="pt-4">
                    <Button asChild variant="outline">
                        <Link href="/auth/login">Back to Login</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
