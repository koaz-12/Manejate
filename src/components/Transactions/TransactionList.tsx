'use client'

import { format, isToday, isYesterday } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { useState, useMemo } from 'react'
import { TransactionActions } from './TransactionActions'

interface Transaction {
    id: string
    amount: number
    description: string
    date: string
    type: 'income' | 'expense'
    category_id: string
    profiles?: {
        display_name: string
    }
}

interface Category {
    id: string
    name: string
    icon: string
    parent_id: string | null
}

interface Props {
    transactions: Transaction[]
    categories: Category[]
    currency: string
}

export function TransactionList({ transactions, categories, currency }: Props) {
    const [search, setSearch] = useState('')

    const categoriesMap = useMemo(() =>
        new Map(categories.map(c => [c.id, c])),
        [categories])

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const cat = categoriesMap.get(tx.category_id)
            const matchSearch =
                tx.description?.toLowerCase().includes(search.toLowerCase()) ||
                cat?.name.toLowerCase().includes(search.toLowerCase())

            return matchSearch
        })
    }, [transactions, search, categoriesMap])

    const groupedTransactions = useMemo(() => {
        const groups: Record<string, Transaction[]> = {}
        filteredTransactions.forEach(tx => {
            if (!groups[tx.date]) groups[tx.date] = []
            groups[tx.date].push(tx)
        })
        return groups
    }, [filteredTransactions])

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a))

    function formatDateHeader(dateStr: string) {
        const date = new Date(dateStr)
        if (isToday(date)) return 'Hoy'
        if (isYesterday(date)) return 'Ayer'
        return format(date, "EEEE d 'de' MMMM", { locale: es })
    }

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="sticky top-0 z-20 bg-slate-50 pt-2 pb-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar movimientos..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border-slate-200 pl-12 pr-4 py-3 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium placeholder:text-slate-400 text-slate-800"
                    />
                </div>
            </div>

            {/* List */}
            {sortedDates.length > 0 ? (
                <div className="space-y-6 pb-20">
                    {sortedDates.map(date => (
                        <div key={date} className="relative">
                            <h3 className="sticky top-[76px] z-10 bg-slate-50 py-2 text-sm font-bold text-slate-500 capitalize flex items-center gap-2">
                                {formatDateHeader(date)}
                                <div className="h-px bg-slate-200 flex-1 ml-2"></div>
                            </h3>

                            <div className="space-y-3">
                                {groupedTransactions[date].map(tx => {
                                    const category = categoriesMap.get(tx.category_id)
                                    const isExpense = tx.type === 'expense'

                                    return (
                                        <div key={tx.id} className="group relative bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.99]">
                                            <div className="flex items-center gap-4">
                                                {/* Icon */}
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${isExpense ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-500'
                                                    }`}>
                                                    {category?.icon || (isExpense ? <ArrowDownLeft /> : <ArrowUpRight />)}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-slate-800 truncate pr-2">
                                                            {category?.name || 'Sin Categoría'}
                                                        </h4>
                                                        <span className={`font-black whitespace-nowrap ${isExpense ? 'text-slate-900' : 'text-emerald-600'
                                                            }`}>
                                                            {isExpense ? '-' : '+'}{currency} {Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between items-center mt-0.5">
                                                        <p className="text-sm text-slate-500 truncate max-w-[70%]">
                                                            {tx.description || 'Sin descripción'}
                                                        </p>
                                                        <div className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                                            {tx.profiles?.display_name?.split(' ')[0]}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions Overlay (only visible on specific interaction, but for now we keep the dot menu) */}
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <TransactionActions id={tx.id} />
                                                {/* Note: TransactionActions might need styling tweaks to fit this new layout */}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="font-medium">No se encontraron movimientos</p>
                    <p className="text-sm opacity-70 mt-1">Intenta con otra búsqueda</p>
                </div>
            )}
        </div>
    )
}
