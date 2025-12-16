"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Megaphone } from "lucide-react"
import { PostNoticeDialog } from "@/components/post-notice-dialog"

export function AdminPostNoticeButton() {
    const [isPostDialogOpen, setIsPostDialogOpen] = useState(false)

    return (
        <>
            <Button onClick={() => setIsPostDialogOpen(true)} className="gap-2">
                <Megaphone className="w-4 h-4" />
                Post Notice
            </Button>
            <PostNoticeDialog
                open={isPostDialogOpen}
                onOpenChange={setIsPostDialogOpen}
                onSuccess={() => setIsPostDialogOpen(false)}
            />
        </>
    )
}
