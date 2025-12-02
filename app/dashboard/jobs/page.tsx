import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { JobSearchInterface } from '@/components/job-search-interface'

// Types for our structured data
interface ResumeData {
    skills: { category: string; items: string[] }[]
    experience: { role: string; company: string }[]
}

export default async function JobMatchesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    // Fetch latest resume to get defaults
    const { data: resumes } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

    const resume = resumes?.[0]
    const data = resume?.structured_data as unknown as ResumeData

    const initialRole = data?.experience?.[0]?.role || 'Software Engineer'
    const initialSkills = data?.skills?.flatMap(s => s.items) || []

    // Prepare minimal user profile for the AI
    const userProfile = {
        role: initialRole,
        skills: initialSkills,
        experience: data?.experience?.map(e => `${e.role} at ${e.company}`).slice(0, 3)
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Job Discovery</h1>
                    <p className="text-gray-500">
                        Configure your search and let AI find the best matches for you.
                    </p>
                </div>

                <JobSearchInterface
                    initialRole={initialRole}
                    initialSkills={initialSkills}
                    userProfile={userProfile}
                />
            </div>
        </div>
    )
}
