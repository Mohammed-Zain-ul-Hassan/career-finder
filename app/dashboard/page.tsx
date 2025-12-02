import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, ArrowRight, Upload, CheckCircle2, Briefcase, Award, GraduationCap, User } from 'lucide-react'
import { cn } from '@/lib/utils'

// Types for our structured data
interface ResumeData {
    summary: string
    skills: { category: string; items: string[] }[]
    experience: { role: string; company: string; duration: string; keyAchievements: string[] }[]
    education: { degree: string; school: string; year: string }[]
    contactInfo: { email: string; phone: string; linkedin: string; website: string }
}

export default async function DashboardOverview() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    // Fetch latest resume
    const { data: resumes } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

    const resume = resumes?.[0]
    const data = resume?.structured_data as unknown as ResumeData

    // Calculate Readiness Score
    let readinessScore = 0
    if (data) {
        if (data.summary) readinessScore += 20
        if (data.skills?.length > 0) readinessScore += 20
        if (data.experience?.length > 0) readinessScore += 30
        if (data.education?.length > 0) readinessScore += 20
        if (data.contactInfo?.email) readinessScore += 10
    }

    // STATE A: EMPTY
    if (!resume) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Upload className="w-10 h-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Career Finder</h1>
                    <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
                        Upload your resume to unlock AI-powered job matches and personalized interview prep.
                    </p>
                    <Link
                        href="/dashboard/resume"
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        Upload Resume <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                </div>
            </div>
        )
    }

    // STATE B: POPULATED (Detailed View)
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* ... existing header ... */}
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Candidate Overview</h1>
                        <p className="text-gray-500">Your comprehensive career profile.</p>
                    </div>
                    <div className="text-sm text-gray-500">
                        Last updated: {new Date(resume.created_at).toLocaleDateString()}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* ... existing resume sections ... */}

                        {/* Professional Summary */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-500" />
                                Professional Summary
                            </h2>
                            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
                        </div>

                        {/* Experience */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-purple-500" />
                                Experience
                            </h2>
                            <div className="space-y-8">
                                {data.experience?.map((exp, i) => (
                                    <div key={i} className="relative pl-4 border-l-2 border-gray-100 last:border-0">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-100 border-2 border-white"></div>
                                        <div className="mb-1">
                                            <h3 className="font-semibold text-gray-900 text-base">{exp.role}</h3>
                                            <div className="flex items-center justify-between text-sm mt-0.5">
                                                <span className="text-blue-600 font-medium">{exp.company}</span>
                                                <span className="text-gray-500 bg-gray-50 px-2 py-0.5 rounded">{exp.duration}</span>
                                            </div>
                                        </div>
                                        <ul className="mt-3 space-y-2">
                                            {exp.keyAchievements?.map((ach, j) => (
                                                <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                                                    <span className="mt-1.5 w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></span>
                                                    <span className="leading-relaxed">{ach}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-indigo-500" />
                                Education
                            </h2>
                            <div className="space-y-4">
                                {data.education?.map((edu, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{edu.school}</h3>
                                            <p className="text-sm text-gray-500">{edu.degree}</p>
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">{edu.year}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sidebar Stats */}
                    <div className="space-y-6">
                        {/* Job Match Readiness */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    Readiness
                                </h2>
                                <span className={cn(
                                    "text-xs font-bold px-2 py-1 rounded uppercase tracking-wide",
                                    readinessScore >= 80 ? "text-green-700 bg-green-50" :
                                        readinessScore >= 50 ? "text-amber-700 bg-amber-50" :
                                            "text-red-700 bg-red-50"
                                )}>
                                    {readinessScore >= 80 ? "High" : readinessScore >= 50 ? "Medium" : "Low"}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                                <div
                                    className={cn(
                                        "h-2.5 rounded-full transition-all duration-500",
                                        readinessScore >= 80 ? "bg-green-500" :
                                            readinessScore >= 50 ? "bg-amber-500" :
                                                "bg-red-500"
                                    )}
                                    style={{ width: `${readinessScore}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Your profile is {readinessScore}% complete based on extracted data.
                            </p>
                        </div>

                        {/* Skills */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-500" />
                                Skills Profile
                            </h2>
                            <div className="space-y-5">
                                {data.skills?.map((category, i) => (
                                    <div key={i}>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                                            {category.category}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {category.items.map((skill) => (
                                                <span key={skill} className="px-2.5 py-1 bg-gray-50 text-gray-700 rounded-md text-xs font-medium border border-gray-100 hover:border-gray-200 transition-colors cursor-default">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
