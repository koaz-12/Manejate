'use client'

import { joinBudget } from '@/actions/collaboration'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function JoinButton({ token, budgetName }: { token: string, budgetName: string }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function handleJoin() {
        setLoading(true)
        const result = await joinBudget(token)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            router.push('/') // Redirect to dashboard success
        }
    }

    return (
        <div className="space-y-4">
            <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Aceptar Invitación'}
            </button>
            {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded-lg">{error}</p>}
        </div>
    )
}
