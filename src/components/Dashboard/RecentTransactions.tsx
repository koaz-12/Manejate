'use client'

import { ArrowUpRight, ArrowDownLeft, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Transaction {
    id: string
    description: string
    amount: number | string
    date: string
    category?: { name: string, icon?: string, type?: string }
    profiles?: { display_name: string }
}

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 text-center py-10">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-400 text-sm font-medium">No hay transacciones recientes.</p>
            </div>
        )
    }

    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-500" />
                    Recientes
                </h2>
                <Link
                    href="/transactions"
                    className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-wide bg-slate-50 px-3 py-1.5 rounded-full"
                >
                    Ver todas
                    <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="space-y-4">
                {transactions.map(tx => {
                    const isExpense = Number(tx.amount) > 0; // Assuming positive is expense based on previous logic, but check context!
                    // Wait, previous logic in SummaryCard was: 
                    // type === 'income' ? income : expense. 
                    // In RecentTransactions, it checked: Number(tx.amount) > 0 ? 'text-red-500' : 'text-emerald-500'. 
                    // This implies > 0 is Expense (Red) and < 0 or logic is reversed?
                    // Let's stick to the visual logic: Red for Expense, Green for Income.
                    // Usually Expense is negative in DB or handled strictly by type. 
                    // Let's assume the passed 'transactions' have handled amounts or we check type.
                    // The previous code had: Number(tx.amount) > 0 ? 'bg-red-50' ...
                    // This implies Positive = Expense (Red). 

                    /* 
                       NOTE: In many systems, Expense is negative. But here it seems Positive = Expense. 
                       I will stick to the previous visual logic to avoid breaking it, but ideally we should check `type`.
                       Let's look at `page.tsx`: 
                       if (type === 'income') totalIncome += amount; else totalSpent += amount;
                       So `amount` is absolute or positive. 
                       We need `type` to distinguish color. 
                       The previous `RecentTransactions` code didn't use `type`, it just used `amount > 0` which is ambiguous if everything is positive.
                       Let's try to trust the `category.type` if available.
                    */

                    const categoryType = tx.category?.type || 'expense';
                    const isIncome = categoryType === 'income';

                    return (
                        <div key={tx.id} className="flex items-center gap-4 group">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner transition-transform group-hover:scale-110 ${!isIncome ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-500'
                                }`}>
                                {tx.category?.icon || (!isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <p className="font-bold text-slate-800 truncate pr-2 text-sm">{tx.category?.name || 'General'}</p>
                                    <p className={`font-black text-sm whitespace-nowrap ${!isIncome ? 'text-slate-900' : 'text-emerald-600'
                                        }`}>
                                        {!isIncome ? '-' : '+'}${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-slate-400 font-medium truncate max-w-[120px]">
                                        {tx.description || 'Sin descripción'}
                                    </p>
                                    <p className="text-[10px] uppercase font-bold text-slate-300">
                                        {new Date(tx.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
