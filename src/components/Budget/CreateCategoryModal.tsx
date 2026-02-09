'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, Check, Tag, Layers, Component, Wallet } from 'lucide-react'
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
    const [icon, setIcon] = useState(isSub ? '🔖' : '🏠') // Default icon based on type

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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar relative flex flex-col">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur-sm rounded-full hover:bg-white/80 transition-all z-10 text-slate-500 hover:text-slate-800"
                >
                    <X className="w-5 h-5" />
                </button>

                <form onSubmit={handleCreate} className="flex flex-col h-full">

                    {/* Hero Section */}
                    <div className={`p-8 pb-10 text-center relative ${type === 'main' ? 'bg-gradient-to-br from-indigo-50 to-purple-50' : 'bg-gradient-to-br from-slate-50 to-gray-100'}`}>

                        {/* Type Switcher (Pills) */}
                        {!parentId && (
                            <div className="flex justify-center mb-6">
                                <div className="bg-white/60 p-1 rounded-xl inline-flex shadow-sm backdrop-blur-sm border border-white/50">
                                    <button
                                        type="button"
                                        onClick={() => setType('main')}
                                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${type === 'main' ? 'bg-white text-indigo-600 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <Tag className="w-3.5 h-3.5" />
                                        Principal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('sub')}
                                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${type === 'sub' ? 'bg-white text-slate-700 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <Layers className="w-3.5 h-3.5" />
                                        Subcategoría
                                    </button>
                                </div>
                            </div>
                        )}

                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400/80 mb-2 block flex items-center justify-center gap-1">
                            {type === 'main' ? <Component className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
                            Nombre
                        </label>
                        <div className="relative w-full">
                            <input
                                name="name"
                                required
                                placeholder={type === 'sub' ? "Ej: Pizza" : "Ej: Comida"}
                                className="text-5xl font-black text-center w-full bg-transparent outline-none placeholder:text-slate-300/50 text-slate-800"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 space-y-6 flex-1">

                        {/* Parent Selector (Only if Sub) */}
                        {type === 'sub' && !parentId && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">Pertenece a</label>
                                <div className="relative">
                                    <select
                                        value={selectedParent}
                                        onChange={(e) => setSelectedParent(e.target.value)}
                                        className="w-full pl-4 pr-10 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                                        required={type === 'sub'}
                                    >
                                        <option value="" disabled>Selecciona una categoría padre</option>
                                        {parentOptions.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-3.5 text-slate-400 pointer-events-none">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Limit Input */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">Límite Mensual</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-slate-400 font-bold">{currency === 'USD' ? '$' : currency}</span>
                                <input
                                    type="text"
                                    value={limitValue}
                                    placeholder="0.00"
                                    onChange={handleLimitChange}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                                    inputMode="decimal"
                                />
                                <div className="absolute right-4 top-3.5 text-slate-400 pointer-events-none">
                                    <Wallet className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Icon Picker */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">Icono</label>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                    {PRESET_ICONS.map(i => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setIcon(i)}
                                            className={`aspect-square flex items-center justify-center text-xl rounded-xl transition-all hover:scale-110 active:scale-95 ${icon === i ? 'bg-white shadow-md ring-2 ring-indigo-500 scale-110 z-10' : 'hover:bg-white hover:shadow-sm text-slate-500 grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}`}
                                        >
                                            {i}
                                        </button>
                                    ))}
                                </div>
                                <input type="hidden" name="icon" value={icon} />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="p-6 pt-2 bg-white sticky bottom-0 border-t border-slate-50">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 disabled:opacity-70 flex items-center justify-center gap-2 shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                            {type === 'sub' ? 'Crear Subcategoría' : 'Crear Categoría'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
