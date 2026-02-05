'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, Check } from 'lucide-react'
import { createCategory } from '@/actions/settings'

interface Props {
    budgetId: string
    parentId?: string | null
    categories?: any[]
    onClose: () => void
    currency: string
    isSub?: boolean
}

export function CreateCategoryModal({ budgetId, parentId = null, categories = [], onClose, currency, isSub = false }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [limitValue, setLimitValue] = useState('')
    const [type, setType] = useState<'main' | 'sub'>(isSub ? 'sub' : 'main')
    const [selectedParent, setSelectedParent] = useState(parentId || '')
    const [icon, setIcon] = useState(isSub ? '🔖' : '🆕')

    const PRESET_ICONS = [
        '🏠', '🍔', '🛒', '🚗', '⛽', '💡', '📱', '📡',
        '💊', '🏋️', '🎬', '☕', '✈️', '🐶', '🎓', '📚',
        '💸', '🏦', '🎁', '🔧', '💇', '👗', '💳', '👶'
    ]

    // Filter only potential parents (roots)
    const parentOptions = categories.filter(c => !c.parent_id)

    const formatNumber = (num: string) => {
        const parts = num.split('.')
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        return parts.join('.')
    }
    const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9.]/g, '')
        setLimitValue(formatNumber(raw))
    }

    async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const rawLimit = limitValue.replace(/,/g, '')

        formData.append('budgetId', budgetId)
        formData.append('type', 'variable')
        formData.append('icon', icon)

        if (type === 'sub') {
            if (!selectedParent) {
                alert('Selecciona una categoría padre')
                setLoading(false)
                return
            }
            formData.append('parentId', selectedParent)
        }

        formData.set('limit', rawLimit)

        const res = await createCategory(formData)
        if (res?.error) {
            alert(res.error)
            setLoading(false)
        } else {
            router.refresh()
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">
                        {type === 'sub' ? 'Nueva Subcategoría' : 'Nueva Categoría'}
                    </h3>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Type Switcher */}
                {!parentId && (
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setType('main')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'main' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Principal
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('sub')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'sub' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Subcategoría
                        </button>
                    </div>
                )}

                <form onSubmit={handleCreate} className="space-y-4">

                    {/* Parent Selector (Only if Sub) */}
                    {type === 'sub' && !parentId && (
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Pertenece a</label>
                            <select
                                value={selectedParent}
                                onChange={(e) => setSelectedParent(e.target.value)}
                                className="w-full bg-slate-50 border-b-2 border-slate-200 font-bold text-slate-700 py-2 outline-none focus:border-indigo-500 rounded-t-lg px-2"
                                required={type === 'sub'}
                            >
                                <option value="" disabled>Selecciona una categoría</option>
                                {parentOptions.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Name Input */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Nombre</label>
                            <input
                                name="name"
                                placeholder={type === 'sub' ? "Ej: Supermercado" : "Ej: Comida"}
                                className="w-full font-bold text-lg text-slate-800 border-b-2 border-slate-100 focus:border-indigo-500 outline-none py-1 placeholder:text-slate-300 transition-colors"
                                autoFocus
                                required
                            />
                        </div>

                        {/* Icon Picker */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Icono</label>
                            <div className="flex gap-3 items-start">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl border-2 border-indigo-100 shrink-0 relative">
                                    {icon}
                                    <input type="hidden" name="icon" value={icon} />
                                </div>

                                <div className="flex-1">
                                    <div className="grid grid-cols-6 gap-2">
                                        {PRESET_ICONS.map(i => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setIcon(i)}
                                                className={`aspect-square flex items-center justify-center text-lg rounded-lg hover:bg-slate-100 hover:scale-110 transition-all ${icon === i ? 'bg-indigo-100 ring-2 ring-indigo-200' : 'bg-slate-50'}`}
                                            >
                                                {i}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Límite Mensual</label>
                        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                            <span className="text-slate-500 font-bold">{currency}</span>
                            <input
                                type="text"
                                value={limitValue}
                                placeholder="0.00"
                                onChange={handleLimitChange}
                                className="w-full bg-transparent font-bold text-xl text-slate-800 outline-none placeholder:text-slate-300"
                                inputMode="decimal"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        {type === 'sub' ? 'Crear Subcategoría' : 'Crear Categoría'}
                    </button>
                </form>
            </div>
        </div>
    )
}
