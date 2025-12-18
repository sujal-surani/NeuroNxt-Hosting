"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function checkUserStatus(email: string) {
    const supabase = createAdminClient()

    // We need to use listUsers to find by email since getUserById requires ID
    // This is limited to 1000 users by default in Supabase Auth, which matches existing patterns
    const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })

    if (error) {
        console.error("Error checking user status:", error)
        return { exists: false, error: error.message }
    }

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
        return { exists: false }
    }

    return {
        exists: true,
        emailConfirmed: user.email_confirmed_at != null,
        status: user.user_metadata.status,
        role: user.user_metadata.role
    }
}
