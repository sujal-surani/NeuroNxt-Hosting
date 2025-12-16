"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function updateStudentProfile(userId: string, data: {
    fullName: string
    email: string
    branch: string
    semester: string
    enrollmentNumber: string
}) {
    const supabaseAdmin = createAdminClient()

    try {
        // 1. Update Auth User (Metadata + Email)
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            {
                email: data.email,
                user_metadata: {
                    full_name: data.fullName,
                    branch: data.branch,
                    semester: data.semester,
                    enrollment_number: data.enrollmentNumber
                }
            }
        )

        if (authError) {
            console.error("Auth update error:", authError)
            return { success: false, error: authError.message }
        }

        // 2. Update Profiles Table (for public display consistency)
        // Note: Triggers might handle this, but explicit update ensures it's done.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                full_name: data.fullName,
                email: data.email,
                // Add specific profile columns if they map directly, 
                // but user_metadata is the source of truth for these academic details usually.
                // Assuming 'profiles' has these columns?
                // Based on previous file reads, 'profiles' has bio, location, avatar_url, full_name, etc.
                // It might not have branch/sem if those are only in metadata.
                // Let's just update common fields available in profiles.
            })
            .eq('id', userId)

        if (profileError) {
            console.warn("Profile table update error (non-critical if metadata is source):", profileError)
        }

        revalidatePath('/admin/dashboard')
        return { success: true }

    } catch (error: any) {
        console.error("Update profile error:", error)
        return { success: false, error: error.message }
    }
}
