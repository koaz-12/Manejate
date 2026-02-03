'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function RealtimeListener() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Debounce refresh to avoid multiple rapid reloads
        let timeout: NodeJS.Timeout

        const refreshData = () => {
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                console.log('🔄 Data changed, refreshing UI...')
                router.refresh()
            }, 500) // Wait 500ms after last event
        }

        // Subscribe to changes in critical tables
        const channel = supabase
            .channel('db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transactions',
                },
                (payload) => {
                    console.log('Transaction Change:', payload.eventType)
                    refreshData()
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'savings_goals',
                },
                (payload) => {
                    console.log('Goal Change:', payload.eventType)
                    refreshData()
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'categories',
                },
                (payload) => {
                    console.log('Category Change:', payload.eventType)
                    refreshData()
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'budget_members',
                },
                (payload) => {
                    console.log('Member Change:', payload.eventType)
                    refreshData()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
            clearTimeout(timeout)
        }
    }, [router, supabase])

    return null // This component renders nothing
}
