'use client'

import { addRecurringExpense } from '@/actions/recurring'
import { useState } from 'react'
import { Loader2, Calendar, DollarSign, Tag } from 'lucide-react'

interface Category {
    id: string
    name: string
    icon: string
}

interface Props {
    budgetId: string
    categories: Category[]
    onSuccess: () => void
}

export function RecurringExpenseForm({ budgetId, categories = [], onSuccess }: Props) {
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setMsg(null)
        formData.append('budgetId', budgetId)

        const res = await addRecurringExpense(formData)

        if (res?.error) {
            setMsg({ type: 'error', text: res.error })
        } else {
            setMsg({ type: 'success', text: 'Gasto recurrente programado' })
            setTimeout(() => {
                onSuccess()
            }, 1000)
        }
        setLoading(false)
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            {msg && (
                <div className={`p-3 rounded-xl text-sm text-center ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {msg.text}
                </div>
            )}

            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Descripción</label>
                <input
                    name="description"
                    placeholder="Ej. Netflix, Renta, Gym"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 transition-colors text-slate-800"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Monto</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            name="amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            required
                            className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 transition-colors text-slate-800"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Día del Mes</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            name="dayOfMonth"
                            type="number"
                            min="1"
                            max="31"
                            placeholder="1-31"
                            required
                            className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 transition-colors text-slate-800"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Categoría</label>
                <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        name="categoryId"
                        required
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 transition-colors text-slate-800 bg-white appearance-none"
                    >
                        <option value="">Seleccionar...</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-75 disabled:cursor-not-allowed mt-2"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Programar Gasto'}
            </button>
        </form>
    )
}
