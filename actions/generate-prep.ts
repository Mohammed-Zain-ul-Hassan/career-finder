'use server'

import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getJson } from 'serpapi'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generatePrepGuide(jobId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        // 1. Fetch Job Details & User Resume
        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId) // Assuming jobId is the UUID from jobs table, or we might need to look up via job_matches if passed match ID
            .single()

        if (jobError || !job) {
            // Try to find by job_matches if the ID passed was actually a match ID? 
            // For now assume we pass the job UUID.
            // Actually, let's verify if we are passing job_id or job_match_id. 
            // The prompt says "jobId=...". Let's assume it's the job UUID.
            return { success: false, error: 'Job not found' }
        }

        const { data: resume, error: resumeError } = await supabase
            .from('resumes')
            .select('structured_data')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (resumeError || !resume) {
            return { success: false, error: 'Resume not found. Please upload a resume first.' }
        }

        // 2. SerpAPI Research (The Deep Dive)
        const companyName = job.company
        const roleTitle = job.title

        console.log(`Researching ${companyName} for ${roleTitle}...`)

        const searchQueries = [
            // 1. Interview Experiences (Real user data)
            `site:glassdoor.com OR site:reddit.com OR site:teamblind.com "${companyName}" "${roleTitle}" interview questions`,
            // 2. Company Culture & Values (Official & Unofficial)
            `"${companyName}" engineering culture values principles`,
            // 3. Recent News/Context (For conversation starters)
            `"${companyName}" recent news technology product launch 2024 2025`,
            // 4. Salary/Compensation (Context)
            `"${companyName}" "${roleTitle}" salary levels.fyi`
        ]

        const searchResults = await Promise.all(searchQueries.map(q => {
            return new Promise<any>((resolve) => {
                getJson({
                    engine: "google",
                    q: q,
                    api_key: process.env.SERPAPI_KEY,
                    num: 5 // Fetch more results per query
                }, (json) => {
                    resolve(json)
                })
            })
        }))

        // Extract snippets with source attribution
        const researchContext = searchResults.map((result, i) => {
            const category = ['Interview Experiences', 'Culture', 'News', 'Salary'][i]
            const snippets = result.organic_results?.map((r: any) => `[Source: ${r.title}] ${r.snippet}`).slice(0, 5).join('\n') || 'No specific results found.'
            return `### ${category}\nQuery: ${searchQueries[i]}\nResults:\n${snippets}`
        }).join('\n\n')


        // 3. Gemini Analysis (The Synthesis)
        console.log('Synthesizing study guide with Gemini...')
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

        const prompt = `
        You are an Expert Career Coach and OSINT Analyst.
        
        JOB DETAILS:
        Title: ${roleTitle}
        Company: ${companyName}
        Description: ${job.description}
        
        CANDIDATE RESUME (Technical Proficiency):
        ${JSON.stringify(resume.structured_data?.technicalProficiency || {}, null, 2)}
        
        DEEP WEB RESEARCH ON COMPANY:
        ${researchContext}
        
        TASK:
        Generate a highly specific, "insider" Study Guide for this interview.
        
        CRITICAL RULES:
        1. **NO PLACEHOLDERS**: Never use "[Insert info]" or "Search for X". If you don't find specific info, use your general knowledge of the industry/role to provide *likely* scenarios or best practices, and explicitly state "Based on industry standards for [Company Type]...".
        2. **USE REAL DATA**: Incorporate the specific interview questions, values, and news found in the web research.
        3. **BE STRATEGIC**: If the company is a startup, focus on speed/ownership. If big tech, focus on scale/process. Infer this from the research.
        
        REQUIRED JSON STRUCTURE:
        {
            "company_culture": [
                "Specific Value 1 (e.g. 'Customer Obsession' - found in research)", 
                "Inferred Value 2 (e.g. 'Fast-paced' - inferred from startup status)"
            ],
            "technical_gaps": [
                { "skill": "Skill Name", "missing_reason": "Why it's needed vs what user has" }
            ],
            "questions": [
                { 
                    "question": "Actual question found in research OR highly relevant technical question", 
                    "difficulty": "Easy/Medium/Hard", 
                    "topic": "Topic Name", 
                    "suggested_answer_points": ["Point 1", "Point 2"],
                    "source": "Glassdoor/Reddit/Inferred" 
                }
            ],
            "simulated_scenario": {
                "title": "Real-world Scenario",
                "description": "A specific problem this company likely faces (e.g. 'Scaling their X service' based on news)"
            }
        }
        
        Return ONLY valid JSON.
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim()
        const studyGuide = JSON.parse(cleanText)

        // 4. Save to Database
        // First, ensure we have a job_match for this user/job to link the interview to
        // If we came from a saved search, it exists. If not, we might need to create one?
        // Let's check if a match exists.
        const { data: matchData, error: matchError } = await supabase
            .from('job_matches')
            .select('id')
            .eq('user_id', user.id)
            .eq('job_id', job.id)
            .maybeSingle()

        let jobMatchId = matchData?.id

        if (!jobMatchId) {
            // Create a match if it doesn't exist (e.g. if we allow generating prep for any job)
            // For now, let's assume it exists or create a dummy one.
            const { data: newMatch } = await supabase
                .from('job_matches')
                .insert({
                    user_id: user.id,
                    job_id: job.id,
                    relevance_score: 0,
                    match_reason: 'Manual Prep Generation',
                    status: 'interviewing'
                })
                .select()
                .single()
            jobMatchId = newMatch.id
        } else {
            // Update status to interviewing
            await supabase
                .from('job_matches')
                .update({ status: 'interviewing' })
                .eq('id', jobMatchId)
        }

        // Create Interview Record
        const { data: interview, error: interviewError } = await supabase
            .from('interviews')
            .insert({
                user_id: user.id,
                job_match_id: jobMatchId,
                status: 'scheduled', // or 'preparing'
                date: new Date(), // Use 'date' column
                title: job.title, // Required field
                company: job.company // Optional but good to have
            })
            .select()
            .single()

        if (interviewError) throw interviewError

        // Save Prep Materials
        const { error: prepError } = await supabase
            .from('prep_materials')
            .insert({
                interview_id: interview.id,
                type: 'study_guide',
                content: studyGuide
            })

        if (prepError) throw prepError

        return { success: true, interviewId: interview.id }

    } catch (error: any) {
        console.error('Generate Prep Error:', error)
        return { success: false, error: error.message }
    }
}
