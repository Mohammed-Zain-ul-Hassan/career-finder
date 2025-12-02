import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard-sidebar'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <DashboardSidebar userEmail={user.email} />

            {/* Main Content */}
            <main className="flex-1 md:ml-64">
                {children}
            </main>
        </div>
    )
}
