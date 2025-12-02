import { MapPin, Building2, ExternalLink, Sparkles } from 'lucide-react'
import { AnalyzedJob } from '@/actions/analyze-jobs'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface JobCardProps {
    job: AnalyzedJob
}

export function JobCard({ job }: JobCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col h-full group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col gap-2">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-400" />
                    </div>
                    {/* Discovery Badge */}
                    {job.discovery_method === 'Direct ATS' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                            💎 Hidden Gem
                        </span>
                    )}
                    {job.discovery_method === 'Manager Post' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                            🗣️ Hiring Manager
                        </span>
                    )}
                </div>
                <div className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold",
                    job.matchScore >= 80 ? "bg-green-50 text-green-700" :
                        job.matchScore >= 50 ? "bg-amber-50 text-amber-700" :
                            "bg-red-50 text-red-700"
                )}>
                    {job.matchScore}% Match
                </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                {job.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <span className="font-medium text-gray-700">{job.company_name}</span>
                <span>•</span>
                <span>{job.location}</span>
            </div>

            <div className="flex-1">
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {job.matchReason}
                </p>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                {job.apply_options?.map((option, i) => (
                    <a
                        key={i}
                        href={option.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        {option.title} <ExternalLink className="w-4 h-4" />
                    </a>
                ))}
                <Link
                    href={`/dashboard/interviews/generating?jobId=${job.supabase_id || job.job_id}`}
                    className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Generate Prep Guide
                </Link>
            </div>
        </div>
    )
}
