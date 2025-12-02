'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, Search, MapPin, Code2, Trash2, ChevronRight, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'

interface SearchSession {
    id: string
    roles: string[]
    locations: string[]
    keywords: string[]
    created_at: string
}

export default function JobListingsPage() {
    const [searches, setSearches] = useState<SearchSession[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const supabase = createClient()
    const { showToast } = useToast()

    const fetchSearches = async () => {
        try {
            const { data, error } = await supabase
                .from('job_searches')
                .select('*')
                .order('created_at', { ascending: false })

            if (data) setSearches(data)
        } catch (error) {
            console.error('Failed to fetch history:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSearches()
    }, [])

    const confirmDelete = (e: React.MouseEvent, id: string) => {
        e.preventDefault() // Prevent navigation
        setItemToDelete(id)
        setDeleteModalOpen(true)
    }

    const handleDelete = async () => {
        if (!itemToDelete) return

        setIsDeleting(true)
        try {
            const { error } = await supabase.from('job_searches').delete().eq('id', itemToDelete)

            if (error) throw error

            setSearches(prev => prev.filter(s => s.id !== itemToDelete))
            showToast('Search history deleted successfully', 'success')
        } catch (error: any) {
            console.error('Failed to delete search:', error)
            showToast('Failed to delete search: ' + error.message, 'error')
        } finally {
            setIsDeleting(false)
            setDeleteModalOpen(false)
            setItemToDelete(null)
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Job Listings</h1>
                    <p className="text-gray-500 mt-1">Manage your saved search sessions and results</p>
                </div>
                <Link
                    href="/dashboard/jobs"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <Search className="w-4 h-4" />
                    New Search
                </Link>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : searches.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No saved searches yet</h3>
                    <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                        Start a new search in the Discovery Engine to see your history here.
                    </p>
                    <Link
                        href="/dashboard/jobs"
                        className="inline-flex items-center gap-2 mt-6 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Go to Discovery Engine <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searches.map((search) => (
                        <Link
                            key={search.id}
                            href={`/dashboard/job-listings/${search.id}`}
                            className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all hover:border-blue-200 relative block"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                </div>
                                <button
                                    onClick={(e) => confirmDelete(e, search.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Search"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</span>
                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                        {search.roles.map((role, i) => (
                                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="truncate">{search.locations.join(', ') || 'Remote'}</span>
                                </div>

                                {search.keywords.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Code2 className="w-4 h-4 text-gray-400" />
                                        <span className="truncate">{search.keywords.join(', ')}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                                <span className="text-gray-400">
                                    {new Date(search.created_at).toLocaleDateString()}
                                </span>
                                <span className="text-blue-600 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                    View Results <ChevronRight className="w-4 h-4" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Search History"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to delete this search history?
                        This will also remove all associated job matches and interview prep guides.
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
