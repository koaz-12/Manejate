import { BottomNav } from '@/components/Layout/BottomNav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';

import Link from 'next/link';
import { cookies } from 'next/headers';
import { TransactionActions } from '@/components/Transactions/TransactionActions';
import { BudgetHeader } from '@/components/Layout/BudgetHeader';
import { TransactionList } from '@/components/Transactions/TransactionList';


export default async function TransactionsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Get ALL User's Budgets
    const { data: memberships } = await supabase
        .from('budget_members')
        .select('budgets(*)')
        .eq('user_id', user.id);

    const budgets = memberships?.map((m: any) => m.budgets) || [];

    // Determine Current Budget
    const cookieStore = await cookies();
    const selectedId = cookieStore.get('selected_budget')?.value;

    let budget = budgets.find((b: any) => b.id === selectedId);
    if (!budget && budgets.length > 0) {
        budget = budgets[0];
    }

    if (!budget) redirect('/');

    // Fetch User Profile for Header
    const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

    // Fetch Transactions with Profile info
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*, profiles(display_name, email)')
        .eq('budget_id', budget.id)
        .order('date', { ascending: false });

    // Fetch Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name, icon, parent_id')
        .eq('budget_id', budget.id);

    const categoriesMap = new Map(categories?.map(c => [c.id, c]));

    // Group by Date
    const groupedTransactions: Record<string, typeof transactions> = {};

    transactions?.forEach(tx => {
        const date = tx.date;
        if (!groupedTransactions[date]) {
            groupedTransactions[date] = [];
        }
        groupedTransactions[date].push(tx);
    });

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (dateStr === today.toISOString().split('T')[0]) return 'Hoy';
        if (dateStr === yesterday.toISOString().split('T')[0]) return 'Ayer';

        return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <BudgetHeader
                budgets={budgets}
                currentBudgetId={budget.id}
                userAvatar={profile?.avatar_url}
            />

            <main className="px-6 mt-6 space-y-6">
                {/* Page Title & Action */}
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
