import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AddTransactionForm } from '@/components/Transactions/AddTransactionForm'

export default async function NewTransactionPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get User's Budget
    const { data: membership } = await supabase
        .from('budget_members')
        .select('budgets(*)')
        .eq('user_id', user.id)
        .single()

    const budget = membership?.budgets as any

    if (!budget) redirect('/')

    // Get Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('budget_id', budget.id)

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <header className="mb-8 flex items-center gap-4">
                <a href="/" className="p-2 -ml-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </a>
                <h1 className="text-2xl font-bold text-slate-800">Nueva Transacción</h1>
            </header>

            <main>
                <AddTransactionForm
                    budgetId={budget.id}
                    categories={categories || []}
                    currency={budget.currency}
                />
            </main>
        </div>
    )
}
