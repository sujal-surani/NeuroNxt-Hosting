"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function approveStudent(userId: string) {
    const supabase = createAdminClient()

    const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { status: 'active' }
    })

    if (error) {
        console.error("Error approving student:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/dashboard')
    return { success: true }
}

export async function rejectStudent(userId: string) {
    const supabase = createAdminClient()

    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
        console.error("Error rejecting student:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/dashboard')
    return { success: true }
}

export async function deleteUser(userId: string) {
    const supabase = createAdminClient()

    console.log(`Attempting to delete user: ${userId}`)

    // 1. Manually delete files first (Workaround for storage permission issue)
    try {
        const { error: fileError } = await supabase.rpc('delete_user_files', {
            target_user_id: userId
        })
        if (fileError) console.error("Error cleaning up user files:", fileError)
        else console.log("User files cleaned up (or none existed)")
    } catch (e) {
        console.error("Exception calling delete_user_files:", e)
    }

    // 2. Delete User Activity (Likes, Views, Saves, Completions)
    // We do this explicitly to avoid cascade failures
    const tables = ['note_likes', 'note_views', 'note_saves', 'note_completions']
    for (const table of tables) {
        const { error } = await supabase.from(table).delete().eq('user_id', userId)
        if (error) console.error(`Error deleting ${table}:`, error)
        else console.log(`Deleted ${table}`)
    }

    // 3. Delete Connections
    const { error: connError } = await supabase
        .from('connections')
        .delete()
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)

    if (connError) console.error("Error deleting connections:", connError)
    else console.log("Deleted connections")

    // 4. Delete Profile (Isolate downstream blockers)
    const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

    if (profileError) console.error("Error deleting profile:", profileError)
    else console.log("Profile deleted successfully")

    // 5. Delete Notes (Isolate note dependencies)
    const { error: notesError } = await supabase
        .from('notes')
        .delete()
        .eq('author_id', userId)

    if (notesError) console.error("Error deleting notes:", notesError)
    else console.log("Notes deleted successfully")

    // 6. Now delete the user (Auth)
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
        console.error("Error deleting user (upstream blocker?):", error)
        return { success: false, error: error.message }
    }

    console.log("User deleted successfully")
    revalidatePath('/admin/dashboard')
    return { success: true }
}

export async function createTeacher(data: {
    email: string
    password: string
    name: string
    instituteCode: string
    branch: string
}) {
    console.log("createTeacher action started", { email: data.email, instituteCode: data.instituteCode })

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("SUPABASE_SERVICE_ROLE_KEY is missing")
        return { success: false, error: "Server configuration error: Missing Service Role Key" }
    }

    try {
        const supabase = createAdminClient()

        const { data: user, error } = await supabase.auth.admin.createUser({
            email: data.email,
            password: data.password,
            email_confirm: true,
            user_metadata: {
                full_name: data.name,
                institute_code: data.instituteCode,
                branch: data.branch,
                role: 'teacher',
                status: 'active'
            }
        })

        if (error) {
            console.error("Error creating teacher:", error)
            return { success: false, error: error.message }
        }

        console.log("Teacher created successfully:", user?.user?.id)
        revalidatePath('/admin/dashboard')
        return { success: true, user }
    } catch (err) {
        console.error("Unexpected error in createTeacher:", err)
        return { success: false, error: "An unexpected server error occurred" }
    }
}

export async function createInstituteAdmin(data: {
    email: string
    password: string
    name: string
    instituteCode: string
}) {
    const supabase = createAdminClient()

    const { data: user, error } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
            full_name: data.name,
            institute_code: data.instituteCode,
            role: 'institute_admin',
            status: 'active'
        }
    })

    if (error) {
        console.error("Error creating institute admin:", error)
        return { success: false, error: error.message }
    }

    return { success: true, user }
}
