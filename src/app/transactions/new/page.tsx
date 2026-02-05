import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AddTransactionForm } from '@/components/Transactions/AddTransactionForm'
import { BackButton } from '@/components/Common/BackButton'

export default async function NewTransactionPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const params = await Promise.resolve(searchParams)
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

    // Parse Initial Data from URL
    const initialData = params?.categoryId ? {
        id: '',
        category_id: params.categoryId,
        amount: params.amount ? Number(params.amount) : 0,
        date: new Date().toISOString().split('T')[0],
        is_recurring: false
    } : undefined

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <header className="mb-8 flex items-center gap-4">
                <BackButton />
                <h1 className="text-2xl font-bold text-slate-800">Nueva Transacción</h1>
            </header>

            <main>
                <AddTransactionForm
                    budgetId={budget.id}
                    categories={categories || []}
                    currency={budget.currency}
                    initialData={initialData}
                />
            </main>
        </div>
    )
}
