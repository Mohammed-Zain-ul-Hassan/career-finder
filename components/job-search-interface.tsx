'use client'

import { useState } from 'react'
import { Search, MapPin, Code2, Play, Loader2, Terminal, Building2, Clock, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react'
import { findJobs, Job } from '@/actions/find-jobs'
import { analyzeJobs, AnalyzedJob } from '@/actions/analyze-jobs'
import { cn } from '@/lib/utils'
import { createJobSearch } from '@/actions/create-search'
import { TagInput } from '@/components/ui/tag-input'
import { JobCard } from '@/components/job-card'

interface JobSearchInterfaceProps {
    initialRole?: string
    initialSkills?: string[]
    userProfile: any
}

type LogStep = {
    message: string
    status: 'pending' | 'success' | 'error'
    timestamp: string
}

export function JobSearchInterface({ initialRole, initialSkills, userProfile }: JobSearchInterfaceProps) {
    // Search Config State
    const [roles, setRoles] = useState<string[]>(initialRole ? [initialRole] : [])
    const [locations, setLocations] = useState<string[]>(['Remote'])
    const [keywords, setKeywords] = useState<string[]>(initialSkills?.slice(0, 5) || [])

    // Advanced Filters State
    const [datePosted, setDatePosted] = useState('any')
    const [jobType, setJobType] = useState('any')
    const [remote, setRemote] = useState('any')
    const [salaryMin, setSalaryMin] = useState('')

    // Process State
    const [isSearching, setIsSearching] = useState(false)
    const [logs, setLogs] = useState<LogStep[]>([])
    const [jobs, setJobs] = useState<AnalyzedJob[]>([])

    const addLog = (message: string, status: 'pending' | 'success' | 'error' = 'pending') => {
        setLogs(prev => [...prev, {
            message,
            status,
            timestamp: new Date().toLocaleTimeString()
        }])
    }

    const updateLastLogStatus = (status: 'success' | 'error') => {
        setLogs(prev => {
            const newLogs = [...prev]
            if (newLogs.length > 0) {
                newLogs[newLogs.length - 1].status = status
            }
            return newLogs
        })
    }

    const handleSearch = async () => {
        setIsSearching(true)
        setLogs([])
        setJobs([])

        try {
            // Step 0: Create Search Record
            addLog('📝 Creating search session...')
            const searchRes = await createJobSearch(roles, locations, keywords)
            let searchId: string | undefined;
            if (!searchRes.success) {
                console.error('Failed to create search record', searchRes.error)
                // Continue anyway, just won't be saved to history
            } else {
                searchId = searchRes.searchId
            }
            updateLastLogStatus('success') // Assuming success if no error, even if searchId is undefined

            // Step 1: Fetch
            const roleString = roles.join(' or ')
            const locationString = locations.join(' or ')
            addLog(`🔍 Searching SerpAPI for "${roleString}" in "${locationString}"...`)

            const fetchResult = await findJobs(roles, locations, keywords, {
                datePosted,
                jobType,
                remote,
                salaryMin: salaryMin ? parseInt(salaryMin) : undefined
            })

            if (!fetchResult.success || !fetchResult.jobs) {
                updateLastLogStatus('error')
                addLog(`❌ Fetch failed: ${fetchResult.error}`, 'error')
                setIsSearching(false)
                return
            }

            updateLastLogStatus('success')
            addLog(`✅ Found ${fetchResult.jobs.length} listings. Analyzing fit...`)

            // Step 2: Analyze & Save (with searchId)
            // Only proceed with analysis if jobs were found
            if (fetchResult.jobs.length > 0) {
                addLog(`🧠 Sending ${fetchResult.jobs.length} jobs to Gemini 2.5 Flash Lite for analysis...`)
                const analysisResult = await analyzeJobs(fetchResult.jobs, userProfile, searchId)

                if (!analysisResult.success || !analysisResult.jobs) {
                    updateLastLogStatus('error')
                    addLog(`❌ Analysis failed: ${analysisResult.error}`, 'error')
                    setIsSearching(false)
                    return
                }

                updateLastLogStatus('success')

                if (analysisResult.isFallback) {
                    addLog(`⚠️ AI Analysis failed. Showing ${analysisResult.jobs.length} raw results.`, 'error')
                } else {
                    addLog(`✨ Analysis complete! Top match: ${analysisResult.jobs[0]?.matchScore}%`, 'success')
                }

                setJobs(analysisResult.jobs)
            } else {
                addLog('⚠️ No jobs found to analyze.', 'error')
            }

        } catch (error: any) {
            addLog(`❌ Unexpected error: ${error.message}`, 'error')
        } finally {
            setIsSearching(false)
        }
    }



    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Search Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Search className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Discovery Engine</h2>
                        <p className="text-sm text-gray-500">Configure your OSINT search parameters</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Roles</label>
                        <TagInput
                            placeholder="e.g. Software Engineer"
                            value={roles}
                            onChange={setRoles}
                            icon={<Search className="w-4 h-4" />}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Locations</label>
                        <TagInput
                            placeholder="e.g. Remote"
                            value={locations}
                            onChange={setLocations}
                            icon={<MapPin className="w-4 h-4" />}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tech Stack</label>
                        <TagInput
                            placeholder="e.g. React"
                            value={keywords}
                            onChange={setKeywords}
                            icon={<Code2 className="w-4 h-4" />}
                        />
                    </div>
                </div>

                {/* Advanced Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Date Posted</label>
                        <select
                            value={datePosted}
                            onChange={(e) => setDatePosted(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        >
                            <option value="any">Any Time</option>
                            <option value="today">Past 24 Hours</option>
                            <option value="3days">Past 3 Days</option>
                            <option value="week">Past Week</option>
                            <option value="month">Past Month</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Job Type</label>
                        <select
                            value={jobType}
                            onChange={(e) => setJobType(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        >
                            <option value="any">Any Type</option>
                            <option value="fulltime">Full-time</option>
                            <option value="contract">Contract</option>
                            <option value="parttime">Part-time</option>
                            <option value="internship">Internship</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Remote</label>
                        <select
                            value={remote}
                            onChange={(e) => setRemote(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        >
                            <option value="any">Any Location</option>
                            <option value="remote">Remote Only</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="onsite">On-site</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Min Salary</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                            <input
                                type="number"
                                placeholder="e.g. 100000"
                                value={salaryMin}
                                onChange={(e) => setSalaryMin(e.target.value)}
                                className="w-full h-10 pl-7 pr-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSearch}
                        disabled={isSearching || roles.length === 0}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSearching ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Searching...
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                Find Jobs
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Process Logs */}
            {(logs.length > 0 || isSearching) && (
                <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-3 border-b border-gray-800 bg-gray-950 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-green-400" />
                            <span className="text-xs font-mono text-gray-400">Process Log</span>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                        </div>
                    </div>
                    <div className="p-4 font-mono text-sm space-y-3 max-h-60 overflow-y-auto">
                        {logs.map((log, i) => (
                            <div key={i} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                <span className="text-gray-600 text-xs mt-0.5 min-w-[60px]">{log.timestamp}</span>
                                <div className="flex-1">
                                    <p className={cn(
                                        "text-gray-300",
                                        log.status === 'success' && "text-green-300",
                                        log.status === 'error' && "text-red-300"
                                    )}>
                                        {log.message}
                                    </p>
                                </div>
                                {log.status === 'pending' && <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />}
                                {log.status === 'success' && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                                {log.status === 'error' && <AlertCircle className="w-3 h-3 text-red-400" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Results Grid */}
            {jobs.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Found {jobs.length} Matches</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <JobCard key={job.job_id} job={job} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
