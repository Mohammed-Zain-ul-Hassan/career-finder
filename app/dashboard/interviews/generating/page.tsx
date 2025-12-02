'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { generatePrepGuide } from '@/actions/generate-prep'
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react'

export default function GeneratingPrepPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const jobId = searchParams.get('jobId')
    const [status, setStatus] = useState('Initializing...')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!jobId) {
            setError('No Job ID provided')
            return
        }

        const startGeneration = async () => {
            try {
                setStatus('🔍 Researching company culture and interview process...')
                // We can't easily stream progress from a server action without more complex setup,
                // so we'll just show a generic loading state that updates after a delay to simulate progress.

                const timer1 = setTimeout(() => setStatus('🧠 Analyzing your resume against job requirements...'), 3000)
                const timer2 = setTimeout(() => setStatus('✨ Synthesizing custom study guide...'), 8000)

                const result = await generatePrepGuide(jobId)

                clearTimeout(timer1)
                clearTimeout(timer2)

                if (result.success && result.interviewId) {
                    setStatus('✅ Guide generated! Redirecting...')
                    router.push(`/dashboard/interviews/${result.interviewId}`)
                } else {
                    setError(result.error || 'Failed to generate guide')
                }
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred')
            }
        }

        startGeneration()
    }, [jobId, router])

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Generation Failed</h1>
                <p className="text-gray-500 max-w-md mb-6">{error}</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    Go Back
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping opacity-25"></div>
                <div className="relative w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center border-2 border-purple-100">
                    <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Generating Prep Guide</h1>
            <p className="text-gray-500 max-w-md animate-pulse">
                {status}
            </p>

            <div className="mt-8 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    )
}
