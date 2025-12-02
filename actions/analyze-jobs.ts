'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { Job } from './find-jobs'
import { createClient } from '@/lib/supabase/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface AnalyzedJob extends Job {
    matchScore: number
    matchReason: string
    supabase_id?: string
}

export async function analyzeJobs(jobs: Job[], userProfile: any, searchId?: string) {
    if (!jobs.length) return { success: true, jobs: [] }

    if (!process.env.GEMINI_API_KEY) {
        return { success: false, error: 'Gemini API key not configured' }
    }

    let analyzedJobs: AnalyzedJob[] = []
    let isFallback = false

    try {
        console.log(`Analyzing ${jobs.length} jobs with Gemini 2.5 Flash Lite...`)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

        const prompt = `
    You are an expert Career Coach and Recruiter.
    
    I will provide a User Profile and a list of Job Descriptions.
    Your task is to analyze each job and determine how well it fits the user.
    
    USER PROFILE:
    ${JSON.stringify(userProfile, null, 2)}
    
    JOBS TO ANALYZE:
    ${JSON.stringify(jobs.map(j => ({ id: j.job_id, title: j.title, company: j.company_name, description: j.description })), null, 2)}
    
    OUTPUT INSTRUCTIONS:
    Return a JSON object with a "rankings" array.
    Each item in "rankings" must have:
    - "job_id": (string) matching the input job_id
    - "matchScore": (number) 0-100. Be generous but realistic. If the role matches the user's title/experience, start at 70. Add points for matching skills, subtract for missing critical requirements.
    - "matchReason": (string) A helpful, 1-2 sentence explanation. Focus on WHY it's a match (e.g., "Great fit for your React experience") or what's missing (e.g., "Requires Python which isn't in your profile").
    
    IMPORTANT:
    - If the job description is short, infer requirements based on the Job Title.
    - Do not return 0 unless it's a completely irrelevant job (e.g., "Nurse" for a "Software Engineer").
    - Return ONLY valid JSON.
    `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        console.log('Gemini Raw Response:', text.substring(0, 200) + '...') // Log first 200 chars

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim()
        const analysis = JSON.parse(cleanText)

        // Merge analysis with original job data
        analyzedJobs = jobs.map(job => {
            const rank = analysis.rankings.find((r: any) => r.job_id === job.job_id)
            return {
                ...job,
                matchScore: rank?.matchScore || 0,
                matchReason: rank?.matchReason || 'Analysis failed for this item'
            }
        }).sort((a, b) => b.matchScore - a.matchScore)

    } catch (error: any) {
        console.error('Gemini Analysis Failed, falling back to raw jobs:', error)
        isFallback = true

        // Fallback: Return jobs with 0 score and error reason
        analyzedJobs = jobs.map(job => ({
            ...job,
            matchScore: 0,
            matchReason: 'AI Analysis Failed: Could not process job details. Displaying raw listing.'
        }))
    }

    // Save to Database (Cache) - Runs for both success and fallback
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            console.log('Caching jobs to database...')

            for (const job of analyzedJobs) {
                // 1. Upsert Job
                const { data: jobData, error: jobError } = await supabase
                    .from('jobs')
                    .upsert({
                        title: job.title,
                        company: job.company_name,
                        location: job.location,
                        description: job.description,
                        url: job.apply_options?.[0]?.link || job.job_id, // Use link as unique key
                        source: job.discovery_method || 'Standard Board',
                        posted_at: job.detected_extensions?.posted_at ? new Date() : undefined // Approximate if not parsed
                    }, { onConflict: 'url' })
                    .select()
                    .single()

                if (jobData) {
                    job.supabase_id = jobData.id // Attach Supabase ID for frontend use

                    // 2. Upsert Match
                    await supabase
                        .from('job_matches')
                        .upsert({
                            user_id: user.id,
                            job_id: jobData.id,
                            relevance_score: job.matchScore,
                            match_reason: job.matchReason,
                            status: 'new',
                            search_id: searchId // Link to search session
                        }, { onConflict: 'user_id, job_id, search_id' })
                }
            }
        }
    } catch (dbError) {
        console.error('Failed to cache jobs:', dbError)
        // Don't fail the request if caching fails
    }

    return { success: true, jobs: analyzedJobs, isFallback }
}
