'use client'

import { updateBudgetSettings } from '@/actions/settings'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface Props {
    budgetId: string
    initialName: string
    initialCutoff: number
}

export function BudgetSettingsForm({ budgetId, initialName, initialCutoff }: Props) {
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setMsg(null)
        formData.append('budgetId', budgetId)

        const res = await updateBudgetSettings(formData)

        if (res?.error) {
            setMsg({ type: 'error', text: res.error })
        } else {
            setMsg({ type: 'success', text: 'Guardado correctamente' })
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

            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre del Espacio</label>
                <input
                    name="name"
                    defaultValue={initialName}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 transition-colors text-slate-800 font-medium"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Día de Corte Mensual</label>
                <div className="flex items-center gap-2">
                    <input
                        name="cutoffDay"
                        type="number"
                        min="1"
                        max="31"
                        defaultValue={initialCutoff}
                        required
                        className="w-20 px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 transition-colors text-slate-800 font-medium text-center"
                    />
                    <span className="text-sm text-slate-400">de cada mes</span>
                </div>
                <p className="text-[10px] text-slate-400">El saldo "Disponible" se reiniciará este día.</p>
            </div>

            <div className="pt-2 flex justify-end">
                <button
                    disabled={loading}
                    className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                    {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                    Guardar Cambios
                </button>
            </div>
        </form>
    )
}
