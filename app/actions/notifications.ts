"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function sendNotification(notification: any | any[]) {
    const supabase = createAdminClient()

    try {
        const { error } = await supabase
            .from('notifications')
            .insert(notification)

        if (error) {
            console.error("Server Action: Error sending notification:", error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error("Server Action: Unexpected error:", error)
        return { success: false, error: error.message }
    }
}
