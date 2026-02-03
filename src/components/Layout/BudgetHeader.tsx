'use client'

import { switchBudget } from '@/actions/app'
import { Bell, ChevronDown, Plus, User, Check } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface Budget {
    id: string
    name: string
    role?: string
}

interface Props {
    budgets: Budget[]
    currentBudgetId: string
    displayName: string
}

export function BudgetHeader({ budgets, currentBudgetId, displayName }: Props) {
    const [isOpen, setIsOpen] = useState(false)

    const currentBudget = budgets.find(b => b.id === currentBudgetId)

    return (
        <header className="px-5 py-2 flex justify-between items-center bg-white sticky top-0 z-40 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">{displayName}</h1>

                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-0.5 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>

                    {isOpen && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                            <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">Mis Espacios</p>
                            {budgets.map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => switchBudget(b.id)}
                                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 flex justify-between items-center"
                                >
                                    {b.name}
                                    {b.id === currentBudgetId && <Check className="w-3 h-3 text-emerald-500" />}
                                </button>
                            ))}
                            <div className="h-px bg-slate-100 my-1"></div>
                            <Link
                                href="/budgets/new"
                                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-[var(--primary)] hover:bg-emerald-50 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Crear Nuevo
                            </Link>
                        </div>
                    )}

                    {/* Backdrop */}
                    {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}
                </div>

            </div>
            <div className="flex gap-4">
                <button className="p-2 text-slate-400 hover:text-[var(--secondary)] transition-colors relative">
                    <Bell className="w-6 h-6" />
                </button>
                <Link href="/settings" className="relative z-50 w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-100 hover:border-slate-300 active:scale-90 active:bg-slate-300 transition-all duration-100">
                    <User className="w-6 h-6 text-slate-400" />
                </Link>
            </div>
        </header>
    )
}
