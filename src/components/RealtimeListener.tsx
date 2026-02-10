'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'

export function RealtimeListener() {
    const router = useRouter()
    // Memoize the client so it doesn't recreate on every render
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        let timeout: NodeJS.Timeout

        const refreshData = () => {
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                router.refresh()
            }, 1500) // Increased debounce: wait 1.5s after last event
        }

        const channel = supabase
            .channel('db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, refreshData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_goals' }, refreshData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, refreshData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'budget_members' }, refreshData)
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
            clearTimeout(timeout)
        }
    }, [router, supabase])

    return null
}
