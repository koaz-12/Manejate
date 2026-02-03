'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChevronDown, Plus } from 'lucide-react'
import Link from 'next/link'
import { cookies } from 'next/headers'

// This will likely need to be a Client Component for interaction, 
// OR a server component with a client trigger. 
// Let's make it a server component that renders a client dropdown.

export async function BudgetSelector() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Fetch all budgets user is member of
    const { data: members } = await supabase
        .from('budget_members')
        .select('budget_id, budgets(id, name)')
        .eq('user_id', user.id)

    const budgets = members?.map(m => m.budgets) || []

    // Determine active budget
    // 1. Cookie? 
    // 2. First one?
    // Ideally we rely on a cookie 'selected_budget' set by the switcher action
    const cookieStore = await cookies()
    const selectedId = cookieStore.get('selected_budget')?.value

    // Find active object, fallback to first
    let activeBudget: any = budgets.find((b: any) => b?.id === selectedId) || budgets[0]

    // If no generic/first budget found (edge case), return null or create button
    if (!activeBudget) return null

    return (
        <div className="relative group z-50">
            {/* Trigger */}
            <button className="flex items-center gap-2 text-slate-800 font-bold text-xl">
                {activeBudget.name}
                <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            </button>

            {/* Dropdown (CSS based for simplicity in RSC, or use Client Comp) */}
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 hidden group-hover:block group-focus-within:block">
                <div className="mb-2 px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Mis Presupuestos</div>

                {budgets.map((b: any) => (
                    <form key={b.id} action={async () => {
                        'use server'
                        const { cookies } = await import('next/headers')
                        const cookieStore = await cookies()
                        cookieStore.set('selected_budget', b.id) // Supabase/Next usage might differ for setting? No, cookies().set is correct for Server Action
                        redirect('/')
                    }}>
                        <button className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${b.id === activeBudget.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                            {b.name}
                        </button>
                    </form>
                ))}

                <div className="h-px bg-slate-100 my-2" />

                <Link href="/budget/new" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">
                    <Plus className="w-4 h-4" />
                    Crear Nuevo
                </Link>
            </div>
        </div>
    )
}
