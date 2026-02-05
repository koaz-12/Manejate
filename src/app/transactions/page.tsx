import { BottomNav } from '@/components/Layout/BottomNav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';

import Link from 'next/link';
import { cookies } from 'next/headers';
import { TransactionActions } from '@/components/Transactions/TransactionActions';
import { BudgetHeader } from '@/components/Layout/BudgetHeader';


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

                {sortedDates.length > 0 ? (
                    sortedDates.map(date => (
                        <div key={date}>
                            <h3 className="text-sm font-bold text-slate-400 mb-3 capitalize">{formatDate(date)}</h3>
                            <div className="space-y-3">
                                {groupedTransactions[date]?.map((tx: any) => (
                                    <div key={tx.id} className="flex items-start bg-white p-3 rounded-2xl shadow-sm border border-slate-100 gap-3">
                                        <div className="flex flex-col items-center gap-1 mt-1">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex-shrink-0 flex items-center justify-center text-xl">
                                                {categoriesMap.get(tx.category_id)?.icon || '💸'}
                                            </div>
                                            <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 max-w-[48px] justify-center">
                                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide truncate">
                                                    {tx.profiles?.display_name?.split(' ')[0] || 'User'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                            <div className="flex flex-col items-start text-left">
                                                {(() => {
                                                    const cat = categoriesMap.get(tx.category_id)
                                                    const parent = cat?.parent_id ? categoriesMap.get(cat.parent_id) : null
                                                    return parent ? (
                                                        <div className="flex items-center gap-1 flex-wrap">
                                                            <p className="font-bold text-slate-900 text-sm leading-tight">
                                                                {parent.name}
                                                            </p>
                                                            <span className="text-slate-300 text-xs">›</span>
                                                            <p className="text-xs text-slate-500 font-medium">
                                                                {cat?.name}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="font-bold text-slate-900 text-sm leading-tight">
                                                            {cat?.name || 'Gasto'}
                                                        </p>
                                                    )
                                                })()}
                                            </div>

                                            <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-normal break-words text-left">
                                                {tx.description || 'Sin descripción'}
                                            </p>

                                            <div className="flex items-center justify-start pt-1 mt-0.5 border-t border-slate-50 w-full">
                                                <p className="font-bold text-slate-800 text-lg whitespace-nowrap">
                                                    {budget.currency} {Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="-mr-2 self-start">
                                            <TransactionActions id={tx.id} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 border-dashed">
                        <p>No tienes movimientos aún.</p>
                        <Link href="/transactions/new" className="text-[var(--primary)] font-bold mt-2 block">
                            Crear el primero
                        </Link>
                    </div>
                )}
            </main>
            <BottomNav />
        </div>
    );
}
