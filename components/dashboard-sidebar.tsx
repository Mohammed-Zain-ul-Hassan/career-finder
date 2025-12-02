'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Settings, LogOut, List, Sparkles, Briefcase } from 'lucide-react'
import { SignOutButton } from '@/components/sign-out-button'
import { cn } from '@/lib/utils'

interface DashboardSidebarProps {
    userEmail?: string | null
}

export function DashboardSidebar({ userEmail }: DashboardSidebarProps) {
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path

    return (
        <aside className="w-64 bg-white border-r border-gray-200 fixed h-full inset-y-0 left-0 z-10 hidden md:flex flex-col">
            <div className="p-6 border-b border-gray-100">
                <h1 className="text-xl font-bold">
                    Career Finder <span className="text-blue-600">AI</span>
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                <Link
                    href="/dashboard"
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                        isActive('/dashboard')
                            ? "text-blue-600 bg-blue-50"
                            : "text-gray-700 hover:bg-gray-50"
                    )}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    Overview
                </Link>
                <Link
                    href="/dashboard/jobs"
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                        isActive('/dashboard/jobs')
                            ? "text-blue-600 bg-blue-50"
                            : "text-gray-700 hover:bg-gray-50"
                    )}
                >
                    <Briefcase className="w-5 h-5" />
                    Job Discovery
                </Link>
                <Link
                    href="/dashboard/job-listings"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        pathname === '/dashboard/job-listings'
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100"
                    )}
                >
                    <List className="w-5 h-5" />
                    Job Listings
                </Link>
                <Link
                    href="/dashboard/interviews"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        pathname.startsWith('/dashboard/interview')
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100"
                    )}
                >
                    <Sparkles className="w-5 h-5" />
                    Interview Prep
                </Link>
                <Link
                    href="/dashboard/resume"
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                        isActive('/dashboard/resume')
                            ? "text-blue-600 bg-blue-50"
                            : "text-gray-700 hover:bg-gray-50"
                    )}
                >
                    <FileText className="w-5 h-5" />
                    Resume Settings
                </Link>


            </nav>

            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {userEmail?.[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="truncate">{userEmail}</p>
                    </div>
                </div>
                <SignOutButton />
            </div>
        </aside>
    )
}
