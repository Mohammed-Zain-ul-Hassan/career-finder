'use client'

import { useEffect, useState } from 'react'
import { getSearchMatches } from '@/actions/get-search-matches'
import { JobCard } from '@/components/job-card'
import { ArrowLeft, Building2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AnalyzedJob } from '@/actions/analyze-jobs'

export default function JobListingDetailPage() {
    const params = useParams()
    const [jobs, setJobs] = useState<AnalyzedJob[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchJobs = async () => {
            if (!params.id) return

            try {
                const result = await getSearchMatches(params.id as string)
                if (result.success && result.jobs) {
                    setJobs(result.jobs as AnalyzedJob[])
                }
            } catch (error) {
                console.error('Failed to fetch jobs:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchJobs()
    }, [params.id])

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <Link
                    href="/dashboard/job-listings"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Listings
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
                <p className="text-gray-500 mt-1">
                    {isLoading ? 'Loading matches...' : `Found ${jobs.length} matches for this session`}
                </p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No matches found</h3>
                    <p className="text-gray-500 mt-2">
                        This search didn't return any results.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <JobCard key={job.job_id} job={job} />
                    ))}
                </div>
            )}
        </div>
    )
}
