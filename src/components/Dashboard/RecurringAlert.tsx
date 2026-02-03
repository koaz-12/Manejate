'use client'

import { copyRecurringExpenses } from '@/actions/recurring'
import { useState } from 'react'
import { Bell, Copy, X } from 'lucide-react'

interface Props {
    expenses: any[]
}

export function RecurringAlert({ expenses }: Props) {
    const [visible, setVisible] = useState(true)
    const [loading, setLoading] = useState(false)

    if (!visible || expenses.length === 0) return null

    const totalAmount = expenses.reduce((sum, ex) => sum + ex.amount, 0)

    async function handleCopy() {
        setLoading(true)
        await copyRecurringExpenses(expenses)
        setLoading(false)
        setVisible(false)
        // Optional: Toast success
    }

    return (
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex flex-col gap-3 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2">
                <button onClick={() => setVisible(false)} className="text-indigo-300 hover:text-indigo-500"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                    <Bell className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-indigo-900 text-sm">Gastos Recurrentes Detectados</h3>
                    <p className="text-xs text-indigo-700 mt-1">
                        Tienes <strong>{expenses.length} gastos</strong> del ciclo pasado (ej. {expenses[0].description}) que no has registrado este mes.
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between pl-12">
                <span className="text-lg font-bold text-indigo-900">${totalAmount.toFixed(2)}</span>
                <button
                    onClick={handleCopy}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all text-nowrap"
                >
                    {loading ? 'Copiando...' : 'Copiar al Mes Actual'}
                    <Copy className="w-3 h-3" />
                </button>
            </div>
        </div>
    )
}
