import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { createGoal } from '@/actions/savings'
import { NewGoalForm } from '@/components/Goals/NewGoalForm'

export default async function NewGoalPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get Budget ID
    const { data: membership } = await supabase
        .from('budget_members')
        .select('budget_id')
        .eq('user_id', user.id)
        .single()

    if (!membership) redirect('/')

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <header className="mb-8 flex items-center gap-4">
                <Link href="/goals" className="p-2 -ml-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">Nueva Meta</h1>
            </header>

            <main>
                <div className="text-center mb-8">
                    <span className="text-4xl">🏝️</span>
                    <p className="text-slate-500 mt-2 text-sm">¿Para qué estás ahorrando?</p>
                </div>

                <NewGoalForm budgetId={membership.budget_id} />
            </main>
        </div>
    )
}
