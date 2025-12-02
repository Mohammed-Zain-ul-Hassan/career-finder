'use server'

import { getJson } from 'serpapi'

const SERPAPI_KEY = process.env.SERPAPI_KEY

export interface Job {
    title: string
    company_name: string
    location: string
    description: string
    via: string
    detected_extensions?: {
        posted_at?: string
        schedule_type?: string
        salary?: string
    }
    apply_options?: {
        title: string
        link: string
    }[]
    job_id: string
    discovery_method?: 'Direct ATS' | 'Manager Post' | 'Standard Board'
}

export interface SearchFilters {
    datePosted?: string
    jobType?: string
    remote?: string
    salaryMin?: number
}

export async function findJobs(roles: string[], locations: string[], keywords: string[] = [], filters: SearchFilters = {}) {
    if (!SERPAPI_KEY) {
        console.error('SERPAPI_KEY is not set')
        return { success: false, error: 'API configuration error' }
    }

    // Helper to build OR queries
    const buildOrQuery = (items: string[]) => items.length > 1 ? `(${items.map(i => `"${i}"`).join(' OR ')})` : `"${items[0] || ''}"`

    const roleQuery = buildOrQuery(roles)
    const locationQuery = buildOrQuery(locations)
    const topSkill = keywords[0] || ''

    // Filter Logic
    let filterString = ''
    if (filters.salaryMin) filterString += ` salary $${Math.floor(filters.salaryMin / 1000)}k+`
    if (filters.remote === 'remote') filterString += ' remote'
    if (filters.jobType && filters.jobType !== 'any') filterString += ` ${filters.jobType}`

    // Date Logic (tbs parameter)
    let tbs = ''
    if (filters.datePosted === 'today') tbs = 'qdr:d'
    if (filters.datePosted === '3days') tbs = 'qdr:d3'
    if (filters.datePosted === 'week') tbs = 'qdr:w'
    if (filters.datePosted === 'month') tbs = 'qdr:m'

    // 1. Strategy A: The 'ATS Raid' (Hidden Jobs)
    const atsQuery = `(site:greenhouse.io OR site:lever.co OR site:ashbyhq.com OR site:workday.com) ${roleQuery} ${locationQuery} ${filterString}`

    // 2. Strategy B: The 'Hiring Manager' (Human Posts)
    const managerQuery = `site:linkedin.com/posts "hiring" ${roleQuery} "${topSkill}" ${filterString}`

    // 3. Strategy C: The 'Standard Sweep' (Baseline)
    const standardQuery = `${roles[0] || ''} ${topSkill} ${filterString}`.trim()

    try {
        console.log(`[${new Date().toISOString()}] Starting OSINT Search Strategies...`)
        console.log(`Filters:`, filters)

        const results = await Promise.allSettled([
            // A. ATS Raid (Google Search)
            getJson({
                engine: 'google',
                q: atsQuery,
                api_key: SERPAPI_KEY,
                num: 5,
                tbs: tbs
            }),
            // B. Hiring Manager (Google Search)
            getJson({
                engine: 'google',
                q: managerQuery,
                api_key: SERPAPI_KEY,
                num: 5,
                tbs: tbs
            }),
            // C. Standard Sweep (Google Jobs)
            getJson({
                engine: 'google_jobs',
                q: standardQuery,
                location: locations[0] || 'United States',
                api_key: SERPAPI_KEY,
                // Google Jobs specific chips for type/remote could go here if we want to be more precise
                // but adding to query is often enough for a broad sweep
            })
        ])

        const jobs: Job[] = []

        // Helper to safely extract results
        const getResult = (index: number) =>
            results[index].status === 'fulfilled' ? (results[index] as PromiseFulfilledResult<any>).value : null

        const atsResults = getResult(0)
        const managerResults = getResult(1)
        const standardResults = getResult(2)

        // Log failures
        results.forEach((r, i) => {
            if (r.status === 'rejected') {
                const strategy = i === 0 ? 'ATS' : i === 1 ? 'Manager' : 'Standard'
                console.error(`Strategy ${strategy} failed:`, r.reason)
            }
        })

        // Process ATS Results
        if (atsResults?.organic_results) {
            jobs.push(...atsResults.organic_results.map((r: any) => ({
                title: r.title,
                company_name: r.displayed_link || 'Direct Apply',
                location: locations[0] || 'Remote',
                description: r.snippet,
                via: 'Company Portal',
                job_id: r.link,
                apply_options: [{ title: 'Apply Direct', link: r.link }],
                discovery_method: 'Direct ATS'
            })))
        }

        // Process Manager Results
        if (managerResults?.organic_results) {
            jobs.push(...managerResults.organic_results.map((r: any) => ({
                title: r.title,
                company_name: 'LinkedIn Network',
                location: locations[0] || 'Remote',
                description: r.snippet,
                via: 'LinkedIn Post',
                job_id: r.link,
                apply_options: [{ title: 'View Post', link: r.link }],
                discovery_method: 'Manager Post'
            })))
        }

        // Process Standard Results
        if (standardResults?.jobs_results) {
            jobs.push(...standardResults.jobs_results.map((r: any) => ({
                ...r,
                discovery_method: 'Standard Board'
            })))
        }

        console.log(`Found ${jobs.length} total jobs. (ATS: ${atsResults?.organic_results?.length || 0}, Manager: ${managerResults?.organic_results?.length || 0}, Standard: ${standardResults?.jobs_results?.length || 0})`)

        if (jobs.length === 0) {
            // If all failed or found nothing, return error to prompt retry or show empty state
            if (results.every(r => r.status === 'rejected')) {
                return { success: false, error: 'All search strategies failed. Please check API quota or try again.' }
            }
        }

        return { success: true, jobs }

    } catch (error: any) {
        console.error('Critical Search Error:', error)
        return { success: false, error: error.message || 'Critical failure in job search' }
    }
}
