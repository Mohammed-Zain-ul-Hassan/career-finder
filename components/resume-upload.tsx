'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { uploadResume } from '@/actions/upload-resume'
import { Upload, Loader2, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ResumeUpload() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [fileName, setFileName] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFileName(file.name)
            setStatus('idle')
            handleUpload(file)
        }
    }

    const handleUpload = (file: File) => {
        const formData = new FormData()
        formData.append('file', file)

        startTransition(async () => {
            const result = await uploadResume(formData)
            if (result.success) {
                setStatus('success')
                // Redirect to Overview (Home) after short delay
                setTimeout(() => {
                    router.push('/dashboard')
                }, 1000)
            } else {
                setStatus('error')
                console.error(result.error)
            }
        })
    }

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Upload Resume</h2>
                <p className="text-sm text-gray-500 mt-1">PDF format only, max 5MB</p>
            </div>

            <div className="relative group">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={isPending}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                />

                <div className={cn(
                    "border-2 border-dashed rounded-lg p-8 transition-all duration-200 flex flex-col items-center justify-center gap-3",
                    isPending ? "border-blue-200 bg-blue-50/50" : "border-gray-200 hover:border-blue-400 hover:bg-gray-50",
                    status === 'error' && "border-red-200 bg-red-50/50",
                    status === 'success' && "border-green-200 bg-green-50/50"
                )}>
                    {isPending ? (
                        <>
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                            <div className="text-center">
                                <p className="text-sm font-medium text-blue-700">Analyzing Resume...</p>
                                <p className="text-xs text-blue-500 mt-1">Extracting skills & experience</p>
                            </div>
                        </>
                    ) : status === 'success' ? (
                        <>
                            <CheckCircle className="w-10 h-10 text-green-500" />
                            <div className="text-center">
                                <p className="text-sm font-medium text-green-700">Analysis Complete</p>
                                <p className="text-xs text-green-500 mt-1">{fileName}</p>
                            </div>
                        </>
                    ) : status === 'error' ? (
                        <>
                            <AlertCircle className="w-10 h-10 text-red-500" />
                            <div className="text-center">
                                <p className="text-sm font-medium text-red-700">Upload Failed</p>
                                <p className="text-xs text-red-500 mt-1">Please try again</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-700">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Supported format: PDF
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
