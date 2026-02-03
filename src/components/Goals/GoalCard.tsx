'use client'

import { contributeToGoal } from '@/actions/savings'
import { useState } from 'react'
import { Plus, Check, Loader2, Trophy } from 'lucide-react'

interface Goal {
    id: string
    name: string
    target_amount: number
    current_amount: number
    deadline: string | null
}

export function GoalCard({ goal, currency }: { goal: Goal, currency: string }) {
    const [isAdding, setIsAdding] = useState(false)
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)

    const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
    const isCompleted = goal.current_amount >= goal.target_amount

    async function handleContribute(e: React.FormEvent) {
        e.preventDefault()
        if (!amount) return

        setLoading(true)
        await contributeToGoal(goal.id, parseFloat(amount))
        setLoading(false)
        setIsAdding(false)
        setAmount('')
    }

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">

            {/* Completion Badge */}
            {isCompleted && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-xl z-10 flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> Completada
                </div>
            )}

            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">{goal.name}</h3>
                    {goal.deadline && <p className="text-xs text-slate-400">Meta: {new Date(goal.deadline).toLocaleDateString()}</p>}
                </div>
                <div className="text-right">
                    <p className="font-bold text-emerald-600">
                        {currency} {Number(goal.current_amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">
                        de {currency} {Number(goal.target_amount).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-yellow-400' : 'bg-emerald-500'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Actions */}
            {!isCompleted && (
                <div>
                    {isAdding ? (
                        <form onSubmit={handleContribute} className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full pl-6 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                                    placeholder="Monto"
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="text-slate-400 p-2 hover:text-slate-600"
                            >
                                Cancelar
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-2 rounded-xl border border-dashed border-emerald-200 text-emerald-600 text-sm font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Aportar Dinero
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
