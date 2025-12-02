'use server'

import { createClient } from '@/lib/supabase/server'

export async function createJobSearch(roles: string[], locations: string[], keywords: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const { data, error } = await supabase
            .from('job_searches')
            .insert({
                user_id: user.id,
                roles,
                locations,
                keywords
            })
            .select()
            .single()

        if (error) throw error

        return { success: true, searchId: data.id }
    } catch (error: any) {
        console.error('Failed to create search record:', error)
        return { success: false, error: error.message }
    }
}
