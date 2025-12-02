import { ResumeUpload } from '@/components/resume-upload'
import { AlertTriangle } from 'lucide-react'

export default function ResumeSettings() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Resume Settings</h1>
                <p className="text-gray-500 mb-8">Manage your resume and career profile data.</p>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-amber-50/50">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-amber-900">Important Note</h3>
                                <p className="text-sm text-amber-700 mt-1">
                                    Uploading a new resume will <strong>replace your current profile</strong> and reset your job match scores.
                                    Please ensure you are uploading the latest version.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <ResumeUpload />
                    </div>
                </div>
            </div>
        </div>
    )
}
