'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Building2, BrainCircuit, MessageSquare, Target, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PrepMaterial {
    company_culture: string[]
    technical_gaps: { skill: string; missing_reason: string }[]
    questions: {
        question: string
        difficulty: string
        topic: string
        suggested_answer_points: string[]
    }[]
    simulated_scenario: {
        title: string
        description: string
    }
}

export default function InterviewPrepPage() {
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [prepData, setPrepData] = useState<PrepMaterial | null>(null)
    const [jobInfo, setJobInfo] = useState<any>(null)
    const [activeTab, setActiveTab] = useState('strategy')
    const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set())

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()

            // Fetch Interview & Linked Data
            const { data: interview, error } = await supabase
                .from('interviews')
                .select(`
                    *,
                    job_match:job_matches (
                        *,
                        job:jobs (*)
                    ),
                    prep_materials (*)
                `)
                .eq('id', params.id)
                .single()

            if (error || !interview) {
                console.error('Error fetching interview:', error)
                return
            }

            setJobInfo(interview.job_match?.job)

            // Find the study guide in prep materials
            const guide = interview.prep_materials?.find((m: any) => m.type === 'study_guide')
            if (guide) {
                setPrepData(guide.content)
            }

            setLoading(false)
        }

        fetchData()
    }, [params.id])

    const toggleAnswer = (index: number) => {
        const newRevealed = new Set(revealedAnswers)
        if (newRevealed.has(index)) {
            newRevealed.delete(index)
        } else {
            newRevealed.add(index)
        }
        setRevealedAnswers(newRevealed)
    }

    if (loading) {
        return (
            <div className="p-8 max-w-5xl mx-auto animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-100 rounded-xl mb-8"></div>
                <div className="h-64 bg-gray-100 rounded-xl"></div>
            </div>
        )
    }

    if (!prepData) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Guide Not Found</h1>
                <Link href="/dashboard/job-listings" className="text-blue-600 hover:underline mt-4 inline-block">
                    Return to Listings
                </Link>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-5xl mx-auto pb-20">
            <Link
                href="/dashboard/job-listings"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Listings
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Interview Prep: {jobInfo?.title}
                </h1>
                <div className="flex items-center gap-2 text-gray-500">
                    <Building2 className="w-4 h-4" />
                    <span>{jobInfo?.company}</span>
                </div>
            </div>

            {/* Tabs Header */}
            <div className="flex border-b border-gray-200 mb-8">
                <button
                    onClick={() => setActiveTab('strategy')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'strategy'
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                >
                    <Target className="w-4 h-4" />
                    Strategy & Culture
                </button>
                <button
                    onClick={() => setActiveTab('gaps')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'gaps'
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                >
                    <BrainCircuit className="w-4 h-4" />
                    Technical Gaps
                </button>
                <button
                    onClick={() => setActiveTab('qa')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'qa'
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                >
                    <MessageSquare className="w-4 h-4" />
                    Q&A Practice
                </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-8">

                {/* STRATEGY TAB */}
                {activeTab === 'strategy' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Culture & Values</h2>
                            <ul className="space-y-3">
                                {prepData.company_culture.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-purple-900 mb-2">Simulated Scenario</h2>
                            <h3 className="text-md font-medium text-purple-700 mb-3">{prepData.simulated_scenario.title}</h3>
                            <p className="text-gray-700 leading-relaxed">
                                {prepData.simulated_scenario.description}
                            </p>
                        </div>
                    </div>
                )}

                {/* GAPS TAB */}
                {activeTab === 'gaps' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-amber-900 mb-2">Skill Gap Analysis</h2>
                            <p className="text-amber-800 mb-6">
                                Based on your resume and the job description, here are the areas you should focus on studying.
                            </p>

                            <div className="grid gap-4">
                                {prepData.technical_gaps.map((gap, i) => (
                                    <div key={i} className="bg-white p-4 rounded-lg border border-amber-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-gray-900">{gap.skill}</span>
                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Missing / Weak</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{gap.missing_reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Q&A TAB */}
                {activeTab === 'qa' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {prepData.questions.map((q, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <h3 className="font-medium text-gray-900 text-lg">{q.question}</h3>
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-xs font-medium shrink-0",
                                            q.difficulty === 'Hard' ? "bg-red-100 text-red-700" :
                                                q.difficulty === 'Medium' ? "bg-yellow-100 text-yellow-700" :
                                                    "bg-green-100 text-green-700"
                                        )}>
                                            {q.difficulty}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">Topic: {q.topic}</p>

                                    <button
                                        onClick={() => toggleAnswer(i)}
                                        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        {revealedAnswers.has(i) ? (
                                            <>Hide Answer <ChevronUp className="w-4 h-4" /></>
                                        ) : (
                                            <>Reveal Answer <ChevronDown className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </div>

                                {revealedAnswers.has(i) && (
                                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Talking Points:</h4>
                                        <ul className="list-disc list-inside space-y-1">
                                            {q.suggested_answer_points.map((point, j) => (
                                                <li key={j} className="text-sm text-gray-700">{point}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
