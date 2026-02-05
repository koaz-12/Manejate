'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function BackButton() {
    const router = useRouter()

    return (
        <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
        >
            <ArrowLeft className="w-6 h-6" />
        </button>
    )
}
