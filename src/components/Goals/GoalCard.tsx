'use client'

import Link from 'next/link'
import { contributeToGoal, deleteGoal } from '@/actions/savings'
import { useState } from 'react'
import { Plus, Check, Loader2, Trophy, Trash2, X, Edit2, Zap } from 'lucide-react'

interface Goal {
    id: string
    name: string
    target_amount: number
    current_amount: number
    deadline: string | null
    created_at: string
    contribution_amount?: number
}

// Helper for duration
const getRemainingTime = (dateStr: string) => {
    if (!dateStr) return null
    const target = new Date(dateStr)
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const diffTime = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Vencida'
    if (diffDays === 0) return 'Vence hoy'
    if (diffDays < 30) return `${diffDays}d`

    const months = Math.floor(diffDays / 30.44)
    const remainingDays = Math.round(diffDays % 30.44)

    if (months >= 12) return `${(months / 12).toFixed(1)} años`
    if (remainingDays > 0) return `${months}m ${remainingDays}d`
    return `${months} mes${months > 1 ? 'es' : ''}`
}

export function GoalCard({ goal, currency }: { goal: Goal, currency: string }) {
    const [isAdding, setIsAdding] = useState(false)
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
    const isCompleted = goal.current_amount >= goal.target_amount
    const remainingTime = goal.deadline ? getRemainingTime(goal.deadline) : null

    async function handleContribute(e: React.FormEvent) {
        e.preventDefault()
        if (!amount) return

        setLoading(true)
        await contributeToGoal(goal.id, parseFloat(amount))
        setLoading(false)
        setIsAdding(false)
        setAmount('')
    }

    async function handleQuickContribute() {
        if (!goal.contribution_amount) return
        setLoading(true)
        await contributeToGoal(goal.id, goal.contribution_amount)
        setLoading(false)
    }

    async function handleDeleteConfirmed() {
        setLoading(true)
        await deleteGoal(goal.id)
    }

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">

            {/* --- DELETE CONFIRMATION OVERLAY --- */}
            {isDeleting && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                    <div className="bg-red-100 p-3 rounded-full mb-3 text-red-500">
                        <Trash2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1">¿Eliminar meta?</h4>
                    <p className="text-sm text-slate-500 mb-4">Esta acción no se puede deshacer.</p>
                    <div className="flex gap-2 w-full">
                        <button
                            onClick={() => setIsDeleting(false)}
                            className="flex-1 py-2 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transaction-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDeleteConfirmed}
                            disabled={loading}
                            className="flex-1 py-2 font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transaction-colors flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eliminar'}
                        </button>
                    </div>
                </div>
            )}

            {/* Completion Badge */}
            {isCompleted && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-bl-xl z-20 flex items-center gap-1 shadow-sm">
                    <Trophy className="w-3 h-3" /> Completada
                </div>
            )}

            <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="pr-16 relative">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{goal.name}</h3>
                </div>

                <div className="absolute -top-1 -right-1 flex gap-1">
                    {/* Edit Button */}
                    <Link
                        href={`/goals/${goal.id}/edit`}
                        className="p-2 text-slate-300 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-all"
                        title="Editar Meta"
                    >
                        <Edit2 className="w-4 h-4" />
                    </Link>

                    {/* Delete Trigger */}
                    <button
                        onClick={() => setIsDeleting(true)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        title="Eliminar Meta"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-end mb-2">
                <div className="text-right w-full">
                    <p className="font-bold text-emerald-600 text-xl">
                        {currency} {Number(goal.current_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                        de {currency} {Number(goal.target_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-100">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-yellow-400' : 'bg-emerald-500'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Dates Footer */}
            <div className="flex justify-between items-center mb-4 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                    <span>📅</span>
                    <span className="text-slate-600">{new Date(goal.created_at).toLocaleDateString()}</span>
                </div>
                {goal.deadline ? (
                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                        <span>🏁</span>
                        <span className="text-slate-600">{new Date(goal.deadline).toLocaleDateString()}</span>
                        {/* Remaining Time Badge */}
                        {remainingTime && !isCompleted && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${remainingTime === 'Vencida' ? 'bg-red-100 text-red-600 border-red-200' :
                                    remainingTime === 'Vence hoy' ? 'bg-orange-100 text-orange-600 border-orange-200' :
                                        'bg-sky-100 text-sky-600 border-sky-200'
                                }`}>
                                {remainingTime}
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="bg-slate-50 px-2 py-1 rounded-lg">Sin fecha límite</div>
                )}
            </div>

            {/* Actions */}
            {!isCompleted && (
                <div className="space-y-2">
                    {isAdding ? (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <form onSubmit={handleContribute} className="flex gap-2 mb-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">$</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="w-full pl-6 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 font-bold text-slate-700 placeholder:font-normal"
                                        placeholder="0.00"
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600 disabled:opacity-50 shadow-lg shadow-emerald-200"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="text-slate-400 p-2 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </form>

                            {/* Quick Action Chips */}
                            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                                {[100, 500, 1000].map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => setAmount(val.toString())}
                                        className="px-2 py-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap"
                                    >
                                        +{val}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            {/* Quick Contribute Button if configured */}
                            {goal.contribution_amount && goal.contribution_amount > 0 && (
                                <button
                                    onClick={handleQuickContribute}
                                    disabled={loading}
                                    className="flex-1 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-1 shadow-sm"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                                    Aportar {currency} {goal.contribution_amount}
                                </button>
                            )}

                            <button
                                onClick={() => setIsAdding(true)}
                                className={`flex-1 py-2.5 rounded-xl border-2 border-dashed border-emerald-100 text-emerald-600 text-sm font-bold hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center justify-center gap-2 ${(!goal.contribution_amount || goal.contribution_amount <= 0) ? 'w-full' : ''}`}
                            >
                                <Plus className="w-4 h-4" />
                                Otro Monto
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
