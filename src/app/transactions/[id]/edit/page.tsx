import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AddTransactionForm } from '@/components/Transactions/AddTransactionForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface Props {
    params: Promise<{ id: string }>
}

export default async function EditTransactionPage({ params }: Props) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { id: transactionId } = await params

    // Fetch Transaction
    const { data: transaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single()

    if (!transaction) redirect('/transactions')

    // Verify Access via Budget Membership
    const { data: membership } = await supabase
        .from('budget_members')
        .select('*')
        .eq('budget_id', transaction.budget_id)
        .eq('user_id', user.id)
        .single()

    // If not a member, get out
    if (!membership) redirect('/')

    // Get Budget (Currency)
    const { data: budget } = await supabase
        .from('budgets')
        .select('currency')
        .eq('id', transaction.budget_id)
        .single()

    // Get Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('budget_id', transaction.budget_id)

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <header className="mb-8 flex items-center gap-4">
                <Link href="/transactions" className="p-2 -ml-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">Editar Transacción</h1>
            </header>

            <main>
                <AddTransactionForm
                    budgetId={transaction.budget_id}
                    categories={categories || []}
                    currency={budget?.currency || 'USD'}
                    initialData={transaction}
                />
            </main>
        </div>
    )
}
