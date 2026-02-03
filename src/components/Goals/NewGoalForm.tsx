'use client'

import { createGoal } from '@/actions/savings'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export function NewGoalForm({ budgetId }: { budgetId: string }) {
    const [loading, setLoading] = useState(false)
    const [deadline, setDeadline] = useState('')

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        await createGoal(formData)
        setLoading(false)
    }

    const setDateInMonths = (months: number) => {
        const date = new Date()
        date.setMonth(date.getMonth() + months)
        setDeadline(date.toISOString().split('T')[0])
    }

    return (
        <form action={handleSubmit} className="space-y-6 max-w-md mx-auto">
            <input type="hidden" name="budgetId" value={budgetId} />

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Nombre de la Meta</label>
                <input
                    name="name"
                    required
                    placeholder="Ej. Vacaciones Cancún"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-white text-slate-900"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Objetivo ($)</label>
                <input
                    name="targetAmount"
                    type="number"
                    step="0.01"
                    required
                    placeholder="1000.00"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-white text-slate-900"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Fecha Límite (Opcional)</label>
                <input
                    name="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-slate-900 bg-white"
                />
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                    <button type="button" onClick={() => setDateInMonths(3)} className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs font-medium whitespace-nowrap hover:bg-slate-300">3 Meses</button>
                    <button type="button" onClick={() => setDateInMonths(6)} className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs font-medium whitespace-nowrap hover:bg-slate-300">6 Meses</button>
                    <button type="button" onClick={() => setDateInMonths(12)} className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs font-medium whitespace-nowrap hover:bg-slate-300">1 Año</button>
                    <button type="button" onClick={() => setDateInMonths(24)} className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs font-medium whitespace-nowrap hover:bg-slate-300">2 Años</button>
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center shadow-lg hover:bg-slate-800 transition-colors"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear Meta'}
                </button>
            </div>
        </form>
    )
}
