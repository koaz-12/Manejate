import { BottomNav } from '@/components/Layout/BottomNav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';

import Link from 'next/link';
import { cookies } from 'next/headers';
import { TransactionActions } from '@/components/Transactions/TransactionActions';


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

    if (budgets.length === 0) return <div className='p-6'>No tienes presupuestos.</div>;

    // Determine Current Budget
    const cookieStore = await cookies();
    const selectedId = cookieStore.get('selected_budget')?.value;

    let budget = budgets.find((b: any) => b.id === selectedId);
    if (!budget) {
        budget = budgets[0];
    }

    // Fetch Transactions with Profile info
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*, profiles(display_name, email)') // Join with profiles
        .eq('budget_id', budget.id)
        .order('date', { ascending: false });

    // Fetch Categories for icons/names
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name, icon')
        .eq('budget_id', budget.id);

    const categoriesMap = new Map(categories?.map(c => [c.id, c]));

    // Group by Date
    const groupedTransactions: Record<string, typeof transactions> = {};

    transactions?.forEach(tx => {
        const date = tx.date; // already YYYY-MM-DD from DB
        if (!groupedTransactions[date]) {
            groupedTransactions[date] = [];
        }
        groupedTransactions[date].push(tx);
    });

    // Sort Dates Descending
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
            <header className="px-5 py-3 bg-white sticky top-0 z-40 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex justify-between items-center border-b border-slate-50">
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">Transacciones</h1>
                <Link href="/transactions/new" className="text-[var(--primary)] bg-emerald-50 p-1.5 rounded-full hover:bg-emerald-100 transition-colors">
                    <Plus className="w-5 h-5" />
                </Link>
            </header>

            <main className="px-6 mt-6 space-y-6">
                {sortedDates.length > 0 ? (
                    sortedDates.map(date => (
                        <div key={date}>
                            <h3 className="text-sm font-bold text-slate-400 mb-3 capitalize">{formatDate(date)}</h3>
                            <div className="space-y-3">
                                {groupedTransactions[date]?.map((tx: any) => (
                                    <div key={tx.id} className="flex items-start bg-white p-3 rounded-2xl shadow-sm border border-slate-100 gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex-shrink-0 flex items-center justify-center text-xl mt-1">
                                            {categoriesMap.get(tx.category_id)?.icon || '💸'}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                            <div className="flex justify-between items-start">
                                                <p className="font-bold text-slate-900 text-base truncate pr-2">
                                                    {categoriesMap.get(tx.category_id)?.name || 'Gasto'}
                                                </p>
                                            </div>

                                            <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-normal break-words">
                                                {tx.description || 'Sin descripción'}
                                            </p>

                                            <div className="flex items-center justify-between pt-1 mt-0.5 border-t border-slate-50">
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wide truncate max-w-[100px]">
                                                        {tx.profiles?.display_name || 'Miembro'}
                                                    </span>
                                                </div>

                                                <p className="font-bold text-slate-800 text-xl whitespace-nowrap">
                                                    {budget.currency} {Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="-mr-2 self-center">
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
