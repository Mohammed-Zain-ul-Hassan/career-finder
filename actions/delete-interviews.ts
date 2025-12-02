'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteInterviews(interviewIds: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const { error } = await supabase
            .from('interviews')
            .delete()
            .in('id', interviewIds)
            .eq('user_id', user.id) // Security: Ensure user owns the interviews

        if (error) {
            console.error('Error deleting interviews:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/dashboard/interviews')
        return { success: true }
    } catch (error: any) {
        console.error('Unexpected error deleting interviews:', error)
        return { success: false, error: error.message }
    }
}
