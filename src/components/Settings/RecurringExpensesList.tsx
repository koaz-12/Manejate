'use client'

import { useState } from 'react'
import { Plus, Trash2, Power, AlertCircle } from 'lucide-react'
import { toggleRecurringExpense, deleteRecurringExpense } from '@/actions/recurring'
import { RecurringExpenseForm } from './RecurringExpenseForm'

interface RecurringExpense {
    id: string
    description: string
    amount: number
    day_of_month: number
    is_active: boolean
    category_id: string
}

interface Category {
    id: string
    name: string
    icon: string
}

interface Props {
    expenses: RecurringExpense[]
    categories: Category[]
    budgetId: string
    currency: string
}

export function RecurringExpensesList({ expenses, categories, budgetId, currency }: Props) {
    const [isAdding, setIsAdding] = useState(false)
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const categoriesMap = new Map(categories.map(c => [c.id, c]))

    async function handleToggle(id: string, currentState: boolean) {
        setLoadingId(id)
        await toggleRecurringExpense(id, currentState)
        setLoadingId(null)
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Seguro que deseas eliminar este gasto recurrente?')) return
        setLoadingId(id)
        await deleteRecurringExpense(id)
        setLoadingId(null)
    }

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Gastos Recurrentes</h2>
                    <p className="text-slate-400 text-xs">Se generan automáticamente cada mes</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`p-2 rounded-full transition-colors ${isAdding ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'}`}
                >
                    <Plus className={`w-5 h-5 transition-transform ${isAdding ? 'rotate-45' : ''}`} />
                </button>
            </div>

            {isAdding && (
                <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-emerald-100">
                    <RecurringExpenseForm
                        budgetId={budgetId}
                        categories={categories}
                        onSuccess={() => setIsAdding(false)}
                    />
                </div>
            )}

            <div className="space-y-3">
                {expenses.length === 0 && !isAdding && (
                    <div className="text-center py-6 text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl">
                        No hay gastos programados.
                    </div>
                )}

                {expenses.map(expense => {
                    const category = categoriesMap.get(expense.category_id)
                    return (
                        <div
                            key={expense.id}
                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${expense.is_active ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${expense.is_active ? 'bg-emerald-50' : 'bg-slate-200'}`}>
                                    {category?.icon || '📅'}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{expense.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium">Día {expense.day_of_month}</span>
                                        <span>{currency} {expense.amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    disabled={loadingId === expense.id}
                                    onClick={() => handleToggle(expense.id, expense.is_active)}
                                    className={`p-2 rounded-xl transition-colors ${expense.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                                >
                                    <Power className="w-5 h-5" />
                                </button>
                                <button
                                    disabled={loadingId === expense.id}
                                    onClick={() => handleDelete(expense.id)}
                                    className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
