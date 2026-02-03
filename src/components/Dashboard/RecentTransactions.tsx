'use client'

import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'

// Basic interface, assuming partial transaction object
interface Transaction {
    id: string
    description: string
    amount: number | string
    date: string
    category?: { name: string, icon?: string, type?: string }
}

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center">
                <p className="text-slate-400 text-sm">No hay transacciones recientes.</p>
            </div>
        )
    }

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Recientes
            </h2>
            <div className="space-y-4">
                {transactions.map(tx => (
                    <div key={tx.id} className="flex justify-between items-center pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${Number(tx.amount) > 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                                }`}>
                                {Number(tx.amount) > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="font-bold text-slate-700">{tx.description || 'Sin descripción'}</p>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                                    {tx.category?.name || 'General'}
                                </p>
                            </div>
                        </div>
                        <p className={`font-bold ${Number(tx.amount) > 0 ? 'text-red-500' : 'text-emerald-500'
                            }`}>
                            {Number(tx.amount) > 0 ? '-' : '+'}${Math.abs(Number(tx.amount)).toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
