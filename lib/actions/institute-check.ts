"use server"

import { createClient } from "@/lib/supabase/server"

export async function getInstituteStatus(code: string) {
    if (!code) return { status: 'active' } // Default to active if no code (e.g. super admin)

    const supabase = createClient()

    try {
        const { data, error } = await supabase
            .from('institutes')
            .select('status')
            .eq('code', code)
            .single()

        if (error) {
            console.error("Error fetching institute status:", error)
            return { status: 'active', error: error.message }
        }

        return { status: data.status }
    } catch (error) {
        console.error("Unexpected error checking institute status:", error)
        return { status: 'active', error: "Unexpected error" }
    }
}
