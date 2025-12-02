'use client'

import { useState, KeyboardEvent, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagInputProps {
    placeholder?: string
    value: string[]
    onChange: (tags: string[]) => void
    icon?: React.ReactNode
    className?: string
}

export function TagInput({ placeholder, value, onChange, icon, className }: TagInputProps) {
    const [inputValue, setInputValue] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addTag()
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            removeTag(value.length - 1)
        }
    }

    const addTag = () => {
        const trimmed = inputValue.trim()
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed])
            setInputValue('')
        }
    }

    const removeTag = (index: number) => {
        onChange(value.filter((_, i) => i !== index))
    }

    return (
        <div className={cn(
            "flex flex-wrap items-center gap-2 p-2 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white transition-all",
            className
        )}>
            {icon && <div className="text-gray-400 select-none">{icon}</div>}

            {value.map((tag, index) => (
                <span
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-md border border-blue-100 animate-in fade-in zoom-in duration-200"
                >
                    {tag}
                    <button
                        onClick={() => removeTag(index)}
                        className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </span>
            ))}

            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={addTag}
                className="flex-1 min-w-[120px] outline-none text-sm bg-transparent py-1"
                placeholder={value.length === 0 ? placeholder : ''}
            />
        </div>
    )
}
