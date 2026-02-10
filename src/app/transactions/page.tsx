import { BottomNav } from '@/components/Layout/BottomNav';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { BudgetHeader } from '@/components/Layout/BudgetHeader';
import { TransactionList } from '@/components/Transactions/TransactionList';
import { getActiveBudgetContext } from '@/lib/budget-helpers';
import { redirect } from 'next/navigation';

export default async function TransactionsPage() {
    const { supabase, budgets, budget, profile } = await getActiveBudgetContext();

    if (!budget) redirect('/');

    // Parallel data fetching
    const [{ data: transactions }, { data: categories }] = await Promise.all([
        supabase
            .from('transactions')
            .select('*, profiles(display_name, email)')
            .eq('budget_id', budget.id)
            .order('date', { ascending: false }),
        supabase
            .from('categories')
            .select('id, name, icon, parent_id')
            .eq('budget_id', budget.id),
    ]);

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <BudgetHeader
                budgets={budgets}
                currentBudgetId={budget.id}
                userAvatar={profile?.avatar_url}
            />

            <main className="px-6 mt-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Transacciones</h1>
                    <Link href="/transactions/new" className="text-white bg-slate-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95">
                        <Plus className="w-4 h-4" />
                        Agregar
                    </Link>
                </div>

                <TransactionList
                    transactions={transactions || []}
                    categories={categories || []}
                    currency={budget.currency}
                />
            </main>
            <BottomNav />
        </div>
    );
}
