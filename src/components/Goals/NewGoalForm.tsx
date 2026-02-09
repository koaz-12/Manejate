'use client'

import { useState, useEffect } from 'react'
import { createGoal, updateGoal } from '@/actions/savings'
import { Loader2, Target, Calendar, Clock, Sparkles, Wallet, Banknote, Check } from 'lucide-react'

// Helper function outside component to avoid dependency cycles
const calculateDuration = (dateStr: string) => {
    if (!dateStr) return ''
    const target = new Date(dateStr)
    if (isNaN(target.getTime())) return '' // Invalid date
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const diffTime = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'La fecha ya pasó'
    if (diffDays === 0) return 'Es hoy'

    if (diffDays < 30) return `Faltan ${diffDays} días`

    const months = Math.floor(diffDays / 30.44)
    const remainingDays = Math.round(diffDays % 30.44)

    if (months >= 12) {
        const years = (months / 12).toFixed(1)
        return `Faltan aprox. ${years} años`
    }

    if (remainingDays > 0) {
        return `Faltan ${months} meses y ${remainingDays} días`
    }
    return `Faltan ${months} meses`
}

// Define Goal Interface (reuse or import if available)
interface Goal {
    id: string
    name: string
    target_amount: number
    current_amount: number
    deadline: string | null
    contribution_amount?: number
    budget_id: string
}

export function NewGoalForm({ budgetId, initialData, defaultCheckInitialDeposit = false }: { budgetId?: string, initialData?: Goal, defaultCheckInitialDeposit?: boolean }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Initial State
    const initialDeadlineValue = initialData?.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : ''
    const [name, setName] = useState(initialData?.name || '')
    const [deadline, setDeadline] = useState(initialDeadlineValue)
    const [durationText, setDurationText] = useState(() => calculateDuration(initialDeadlineValue))
    const [checkInitialDeposit, setCheckInitialDeposit] = useState(defaultCheckInitialDeposit)

    // Amount Helpers
    const formatNumber = (num: string) => {
        if (!num) return ''
        const parts = num.split('.')
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        return parts.join('.')
    }

    const handleDateChange = (val: string) => {
        setDeadline(val)
        setDurationText(calculateDuration(val))
    }

    // Effect to ensure duration is correct on mount/updates just in case
    useEffect(() => {
        setDurationText(calculateDuration(deadline))
    }, [deadline])

    // State for inputs
    const [amountValue, setAmountValue] = useState(initialData?.target_amount ? formatNumber(initialData.target_amount.toString()) : '')
    const [contributionValue, setContributionValue] = useState(initialData?.contribution_amount ? formatNumber(initialData.contribution_amount.toString()) : '')

    const handleAmountChange = (val: string, setter: (v: string) => void) => {
        if (val === '') {
            setter('')
            return
        }
        const raw = val.replace(/[^0-9.]/g, '')
        if ((raw.match(/\./g) || []).length > 1) return
        setter(formatNumber(raw))
    }

    const setDateInMonths = (months: number) => {
        const date = new Date()
        date.setMonth(date.getMonth() + months)
        const val = date.toISOString().split('T')[0]
        setDeadline(val)
        setDurationText(calculateDuration(val))
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        // Clean raw amounts
        const rawTarget = amountValue.replace(/,/g, '')
        const rawContribution = contributionValue.replace(/,/g, '')

        if (!rawTarget || Number(rawTarget) <= 0) {
            setError('Por favor ingresa un objetivo válido mayor a 0.')
            setLoading(false)
            return
        }

        // Add fields to FormData
        formData.set('targetAmount', rawTarget)
        formData.set('contributionAmount', rawContribution || '0')
        formData.set('name', name) // Ensure name is set from state
        formData.set('deadline', deadline)
        if (checkInitialDeposit) {
            formData.set('makeInitialDeposit', 'true')
        }

        let result;
        if (initialData) {
            formData.set('goalId', initialData.id)
            result = await updateGoal(formData)
        } else {
            if (budgetId) formData.set('budgetId', budgetId)
            result = await createGoal(formData)
        }

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 max-w-lg mx-auto">
            {/* Main Card */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">

                {/* Hero Section: Target Amount */}
                <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-8 pb-10 text-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-sky-900/40 mb-2 block flex items-center justify-center gap-1">
                        <Target className="w-3 h-3" />
                        Meta de Ahorro
                    </label>
                    <div className="relative inline-flex items-center justify-center">
                        <span className="text-4xl font-bold absolute -left-6 top-1.5 text-sky-900/20">$</span>
                        <input
                            type="text"
                            inputMode="decimal"
                            required
                            placeholder="0.00"
                            value={amountValue}
                            onChange={(e) => handleAmountChange(e.target.value, setAmountValue)}
                            className="text-6xl font-black text-center w-full bg-transparent outline-none placeholder:text-sky-900/10 text-sky-600"
                        />
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-6">

                    {/* Name Input */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">Nombre</label>
                        <div className="relative">
                            <input
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Ej. Vacaciones"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                            />
                            <div className="absolute left-4 top-3.5 text-slate-400 pointer-events-none">
                                <Sparkles className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Deadline Input */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">Fecha Límite</label>
                        <div className="relative">
                            <input
                                name="deadline"
                                type="date"
                                value={deadline}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none font-bold text-slate-700 transition-all"
                            />
                            <div className="absolute left-4 top-3.5 text-slate-400 pointer-events-none">
                                <Calendar className="w-5 h-5" />
                            </div>
                        </div>
                        {/* Duration Preview Badge */}
                        {durationText && (
                            <div className="flex justify-center mt-3 animate-in fade-in slide-in-from-top-1">
                                <span className="bg-sky-50 text-sky-600 text-xs font-bold px-3 py-1.5 rounded-full border border-sky-100 flex items-center gap-1.5 shadow-sm">
                                    <Clock className="w-3.5 h-3.5" /> {durationText}
                                </span>
                            </div>
                        )}
                        {/* Quick Date Buttons */}
                        <div className="flex gap-2 mt-2 overflow-x-auto pb-1 custom-scrollbar">
                            <button type="button" onClick={() => setDateInMonths(3)} className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold whitespace-nowrap hover:bg-sky-100 hover:text-sky-600 transition-colors">3 Meses</button>
                            <button type="button" onClick={() => setDateInMonths(6)} className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold whitespace-nowrap hover:bg-sky-100 hover:text-sky-600 transition-colors">6 Meses</button>
                            <button type="button" onClick={() => setDateInMonths(12)} className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold whitespace-nowrap hover:bg-sky-100 hover:text-sky-600 transition-colors">1 Año</button>
                        </div>
                    </div>

                    {/* Contribution Amount Input (Optional) */}
                    <div className="space-y-1 pt-2 border-t border-slate-100">
                        <label className="text-xs font-bold uppercase tracking-wider text-emerald-600 pl-1 flex items-center gap-1">
                            <Banknote className="w-3.5 h-3.5" />
                            <span>Aporte Sugerido</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full ml-1">Opcional</span>
                        </label>
                        <p className="text-xs text-slate-400 mb-2 pl-1">Para el botón de "Ahorro Rápido".</p>
                        <div className="relative">
                            <div className="absolute left-4 top-3.5 text-emerald-500/50 pointer-events-none">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="Ej. 500.00"
                                value={contributionValue}
                                onChange={(e) => handleAmountChange(e.target.value, setContributionValue)}
                                className="w-full pl-11 pr-4 py-3 bg-emerald-50/30 rounded-xl border border-emerald-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-emerald-700 transition-all placeholder:text-emerald-300/50"
                            />
                        </div>

                        {/* Initial Deposit Checkbox */}
                        {!initialData && contributionValue && parseFloat(contributionValue.replace(/,/g, '')) > 0 && (
                            <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                                <label className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 cursor-pointer hover:bg-indigo-50 transition-colors group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            name="makeInitialDeposit"
                                            checked={checkInitialDeposit}
                                            onChange={(e) => setCheckInitialDeposit(e.target.checked)}
                                            className="w-5 h-5 rounded-md border-indigo-300 text-indigo-600 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-indigo-900 group-hover:text-indigo-700">Realizar este aporte ahora</p>
                                        <p className="text-xs text-indigo-400">Se registrará como gasto hoy.</p>
                                    </div>
                                </label>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm text-center border border-red-100 font-medium animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        initialData ? (
                            <>
                                <Check className="w-5 h-5" />
                                Guardar Cambios
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Crear Meta
                            </>
                        )
                    )}
                </button>
            </div>
        </form >
    )
}
