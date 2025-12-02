'use client'

import { CheckCircle2, XCircle, X, Info } from 'lucide-react'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: string
    message: string
    type: ToastType
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts(prev => [...prev, { id, message, type }])

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3000)
    }, [])

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {mounted && createPortal(
                <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                    {toasts.map(toast => (
                        <div
                            key={toast.id}
                            className={`
                                pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-right-full duration-300
                                ${toast.type === 'success' ? 'bg-white border-green-200 text-green-800' :
                                    toast.type === 'error' ? 'bg-white border-red-200 text-red-800' :
                                        'bg-white border-blue-200 text-blue-800'}
                            `}
                        >
                            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}

                            <p className="text-sm font-medium">{toast.message}</p>

                            <button
                                onClick={() => removeToast(toast.id)}
                                className="ml-2 p-1 hover:bg-black/5 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 opacity-50" />
                            </button>
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}
