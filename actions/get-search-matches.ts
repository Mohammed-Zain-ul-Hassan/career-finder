'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSearchMatches(searchId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const { data, error } = await supabase
            .from('job_matches')
            .select(`
                relevance_score,
                match_reason,
                status,
                job:jobs (
                    id,
                    title,
                    company,
                    location,
                    description,
                    url,
                    source,
                    posted_at
                )
            `)
            .eq('search_id', searchId)
            .order('relevance_score', { ascending: false })

        if (error) throw error

        // Transform to AnalyzedJob format
        const jobs = data.map((match: any) => ({
            job_id: match.job.url, // Use URL as ID for consistency
            supabase_id: match.job.id, // Include Supabase UUID
            title: match.job.title,
            company_name: match.job.company,
            location: match.job.location,
            description: match.job.description,
            via: match.job.source,
            matchScore: match.relevance_score,
            matchReason: match.match_reason,
            discovery_method: match.job.source === 'Direct ATS' ? 'Direct ATS' :
                match.job.source === 'Manager Post' ? 'Manager Post' : 'Standard Board',
            apply_options: [{ title: 'Apply', link: match.job.url }]
        }))

        return { success: true, jobs }
    } catch (error: any) {
        console.error('Failed to fetch matches:', error)
        return { success: false, error: error.message }
    }
}
