'use client'

import { switchBudget } from '@/actions/app'
import { Bell, ChevronDown, Plus, User, Check, Briefcase, Wallet } from 'lucide-react'
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
    userAvatar?: string | null
}

export function BudgetHeader({ budgets, currentBudgetId, userAvatar }: Props) {
    const [isOpen, setIsOpen] = useState(false)

    const currentBudget = budgets.find(b => b.id === currentBudgetId)

    return (
        <header className="px-5 py-3 flex justify-between items-center bg-white sticky top-0 z-40 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border-b border-slate-50 h-[60px]">
            {/* Left: Budget Switcher */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 text-slate-800 hover:text-slate-600 transition-colors p-1 rounded-lg active:bg-slate-50"
                >
                    <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-700">
                        <Wallet className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm max-w-[140px] truncate">{currentBudget?.name || 'Mi Presupuesto'}</span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                        <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">Mis Presupuestos</p>
                        <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {budgets.map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => {
                                        switchBudget(b.id)
                                        setIsOpen(false)
                                    }}
                                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex justify-between items-center transition-colors ${b.id === currentBudgetId
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="truncate">{b.name}</span>
                                    {b.id === currentBudgetId && <Check className="w-3.5 h-3.5" />}
                                </button>
                            ))}
                        </div>
                        <div className="h-px bg-slate-100 my-2"></div>
                        <Link
                            href="/budgets/new"
                            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--primary)] hover:bg-emerald-50 flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Crear Nuevo
                        </Link>
                    </div>
                )}

                {/* Backdrop */}
                {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <button className="p-2 text-slate-400 hover:text-[var(--secondary)] transition-colors relative rounded-full hover:bg-slate-50">
                    <Bell className="w-5 h-5" />
                    {/* Notification Dot (Mock) */}
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <Link
                    href="/settings"
                    className="relative w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border border-slate-200 hover:border-emerald-200 active:scale-95 transition-all"
                >
                    {userAvatar ? (
                        <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-5 h-5 text-slate-400" />
                    )}
                </Link>
            </div>
        </header>
    )
}
