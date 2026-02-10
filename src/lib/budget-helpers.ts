import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Get the authenticated user, their budgets, and the currently-selected budget.
 * Redirects to /login if not authenticated.
 * 
 * Returns: { supabase, user, budgets, budget, membership, profile }
 * - `budget` may be null if the user has no budgets.
 * - `membership` is the user's membership record for the active budget.
 */
export async function getActiveBudgetContext() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch all memberships + budgets in one query
    const { data: memberships } = await supabase
        .from('budget_members')
        .select('role, budgets(*)')
        .eq('user_id', user.id)

    const budgets = memberships?.map((m: any) => m.budgets).filter(Boolean) || []

    // Determine active budget from cookie
    const cookieStore = await cookies()
    const selectedId = cookieStore.get('selected_budget')?.value

    const activeMembership = memberships?.find((m: any) => m.budgets?.id === selectedId) || memberships?.[0]
    const budget = activeMembership?.budgets as any || null
    const role = activeMembership?.role || 'viewer'

    // Fetch profile (needed by header on every page)
    const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, email, avatar_url')
        .eq('id', user.id)
        .single()

    return {
        supabase,
        user,
        budgets,
        budget,
        role,
        profile,
    }
}
