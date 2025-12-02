'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, Search, ChevronRight, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchSession {
    id: string
    roles: string[]
    locations: string[]
    keywords: string[]
    created_at: string
}

interface SearchHistorySidebarProps {
    onSelectSearch: (search: SearchSession) => void
    className?: string
}

export function SearchHistorySidebar({ onSelectSearch, className }: SearchHistorySidebarProps) {
    const [searches, setSearches] = useState<SearchSession[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    const fetchSearches = async () => {
        try {
            const { data, error } = await supabase
                .from('job_searches')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20)

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

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        try {
            await supabase.from('job_searches').delete().eq('id', id)
            setSearches(prev => prev.filter(s => s.id !== id))
        } catch (error) {
            console.error('Failed to delete search:', error)
        }
    }

    return (
        <div className={cn("flex flex-col h-full bg-white border-r border-gray-200 w-64", className)}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> History
                </h3>
                <button onClick={fetchSearches} className="text-xs text-blue-600 hover:underline">
                    Refresh
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {isLoading ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
                ) : searches.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">No recent searches</div>
                ) : (
                    searches.map((search) => (
                        <div
                            key={search.id}
                            onClick={() => onSelectSearch(search)}
                            className="group relative p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors border border-transparent hover:border-blue-100"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {search.roles[0] || 'Any Role'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                        {search.locations[0] || 'Remote'}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {new Date(search.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400" />
                            </div>

                            <button
                                onClick={(e) => handleDelete(e, search.id)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-600 transition-all"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
