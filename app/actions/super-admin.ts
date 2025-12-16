"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function toggleInstituteStatus(instituteCode: string, newStatus: 'active' | 'paused') {
    const supabase = createAdminClient()

    try {
        const { error } = await supabase
            .from('institutes')
            .update({ status: newStatus })
            .eq('code', instituteCode)

        if (error) throw error

        revalidatePath('/super-admin/dashboard')
        return { success: true }
    } catch (error: any) {
        console.error("Error toggling institute status:", error)
        return { success: false, error: error.message }
    }
}
