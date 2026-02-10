'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

interface SubmitButtonProps {
    children: React.ReactNode
    className?: string
    pendingText?: string
    variant?: 'primary' | 'danger' | 'secondary'
    formAction?: (formData: FormData) => void
}

export function SubmitButton({ children, className, pendingText, variant = 'primary', formAction }: SubmitButtonProps) {
    const { pending } = useFormStatus()

    const baseClasses = 'flex items-center justify-center gap-2 font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none'

    const variantClasses = {
        primary: 'bg-slate-900 hover:bg-slate-800 text-white',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200',
    }

    return (
        <button
            type="submit"
            disabled={pending}
            formAction={formAction}
            className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}
        >
            {pending ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {pendingText || 'Procesando...'}
                </>
            ) : children}
        </button>
    )
}
