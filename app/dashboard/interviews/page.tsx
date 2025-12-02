'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Building2, Calendar, ChevronRight, Sparkles, Trash2, CheckSquare, Square } from 'lucide-react'
import { deleteInterviews } from '@/actions/delete-interviews'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'

export default function InterviewsPage() {
    const [interviews, setInterviews] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [itemsToDelete, setItemsToDelete] = useState<string[]>([])

    const router = useRouter()
    const { showToast } = useToast()

    const fetchInterviews = async () => {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('interviews')
            .select(`
                id,
                created_at,
                status,
                job_match:job_matches (
                    job:jobs (
                        title,
                        company,
                        location
                    )
                )
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching interviews:', error)
        } else {
            setInterviews(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchInterviews()
    }, [])

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    const toggleAll = () => {
        if (selectedIds.size === interviews.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(interviews.map(i => i.id)))
        }
    }

    const confirmDelete = (ids: string[]) => {
        setItemsToDelete(ids)
        setDeleteModalOpen(true)
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        const result = await deleteInterviews(itemsToDelete)

        if (result.success) {
            setInterviews(prev => prev.filter(i => !itemsToDelete.includes(i.id)))
            setSelectedIds(new Set())
            showToast('Interview guides deleted successfully', 'success')
            router.refresh()
        } else {
            showToast('Failed to delete interviews: ' + result.error, 'error')
        }
        setIsDeleting(false)
        setDeleteModalOpen(false)
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Interview Prep</h1>
                    <p className="text-gray-500 mt-1">Your generated study guides and interview strategies</p>
                </div>
                {selectedIds.size > 0 && (
                    <button
                        onClick={() => confirmDelete(Array.from(selectedIds))}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete ({selectedIds.size})
                    </button>
                )}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : interviews.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No guides generated yet</h3>
                    <p className="text-gray-500 mt-2 mb-6">
                        Find a job in your listings and click "Generate Prep Guide" to get started.
                    </p>
                    <Link
                        href="/dashboard/job-listings"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Go to Job Listings
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-4 py-2 text-sm text-gray-500">
                        <button onClick={toggleAll} className="flex items-center gap-2 hover:text-gray-900">
                            {selectedIds.size === interviews.length && interviews.length > 0 ? (
                                <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                                <Square className="w-5 h-5" />
                            )}
                            Select All
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {interviews.map((interview) => (
                            <div
                                key={interview.id}
                                className={`group relative flex items-center bg-white border rounded-xl transition-all ${selectedIds.has(interview.id) ? 'border-blue-500 bg-blue-50/10' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                                    }`}
                            >
                                <div className="pl-4 pr-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleSelection(interview.id)
                                        }}
                                        className="text-gray-400 hover:text-blue-600"
                                    >
                                        {selectedIds.has(interview.id) ? (
                                            <CheckSquare className="w-5 h-5 text-blue-600" />
                                        ) : (
                                            <Square className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                <Link
                                    href={`/dashboard/interviews/${interview.id}`}
                                    className="flex-1 flex items-center justify-between p-6 pl-2"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                            <Building2 className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {interview.job_match?.job?.title || 'Unknown Role'}
                                            </h3>
                                            <p className="text-gray-500 text-sm mb-1">
                                                {interview.job_match?.job?.company || 'Unknown Company'} • {interview.job_match?.job?.location}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <Calendar className="w-3 h-3" />
                                                Generated {new Date(interview.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                </Link>

                                <div className="pr-4 border-l border-gray-100 pl-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            confirmDelete([interview.id])
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Guide"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Interview Guides"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to delete {itemsToDelete.length} interview guide{itemsToDelete.length > 1 ? 's' : ''}?
                        This action cannot be undone and will remove all associated study materials.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setDeleteModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Forever'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
