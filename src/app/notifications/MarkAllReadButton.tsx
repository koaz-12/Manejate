'use client'

import { CheckCheck } from 'lucide-react'
import { markAllNotificationsAsRead } from '@/actions/notifications'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export function MarkAllReadButton({ budgetId }: { budgetId: string }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    return (
        <button
            disabled={isPending}
            onClick={() => {
                startTransition(async () => {
                    await markAllNotificationsAsRead(budgetId)
                    router.refresh()
                })
            }}
            className="text-emerald-600 text-sm font-bold flex items-center gap-1 hover:bg-emerald-50 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
        >
            <CheckCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Marcar leídas</span>
        </button>
    )
}
