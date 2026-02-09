'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Check, Tag, Layers, Component, Wallet, Plus, Repeat } from 'lucide-react'
import { createCategory } from '@/actions/settings'
import Link from 'next/link'

interface Props {
    budgetId: string
    parentId?: string | null
    categories?: any[]
    currency: string
    isSub?: boolean
}

export function NewCategoryForm({ budgetId, parentId = null, categories = [], currency, isSub = false }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [limitValue, setLimitValue] = useState('')
    const [name, setName] = useState('')
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

    async function handleCreate(e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>, shouldKeepOpen: boolean = false) {
        e.preventDefault()

        try {
            if (loading) return

            // Basic Validation
            if (!name) return

            setLoading(true)
            const formData = new FormData()
            // Manually build formData since we might be triggered by button click
            formData.append('name', name)

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

            setLoading(false)

            if (res?.error) {
                alert(res.error)
            } else {
                router.refresh()

                if (shouldKeepOpen) {
                    // Reset form for next entry
                    setName('')
                    setLimitValue('')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                } else {
                    router.push('/budget')
                }
            }
        } catch (error) {
            console.error('Client error:', error)
            alert('Ocurrió un error inesperado. Por favor intenta de nuevo.')
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto relative pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <Link href="/budget" className="absolute top-8 left-4 p-2 text-slate-400 hover:text-slate-600 transition-colors z-20">
                <ArrowLeft className="w-6 h-6" />
            </Link>

            <form onSubmit={(e) => handleCreate(e, false)} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 relative">

                {/* Hero Section */}
                <div className={`p-10 pb-12 text-center relative ${type === 'main' ? 'bg-gradient-to-br from-indigo-50 to-purple-50' : 'bg-gradient-to-br from-slate-50 to-gray-100'}`}>

                    {/* Visual Decor */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 blur-3xl rounded-full pointer-events-none" />

                    {/* Type Switcher (Pills) */}
                    {!parentId && (
                        <div className="flex justify-center mb-8 relative z-10">
                            <div className="bg-white/60 p-1.5 rounded-2xl inline-flex shadow-sm backdrop-blur-md border border-white/50">
                                <button
                                    type="button"
                                    onClick={() => setType('main')}
                                    className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${type === 'main' ? 'bg-white text-indigo-600 shadow-sm scale-100 ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                                >
                                    <Tag className="w-4 h-4" />
                                    Principal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('sub')}
                                    className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${type === 'sub' ? 'bg-white text-slate-700 shadow-sm scale-100 ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                                >
                                    <Layers className="w-4 h-4" />
                                    Subcategoría
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="relative z-10">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400/80 mb-3 block flex items-center justify-center gap-2">
                            {type === 'main' ? <Component className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
                            Nombre de la {type === 'main' ? 'Categoría' : 'Subcategoría'}
                        </label>
                        <div className="relative w-full">
                            <input
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder={type === 'sub' ? "Ej: Pizza" : "Ej: Comida"}
                                className="text-5xl sm:text-6xl font-black text-center w-full bg-transparent outline-none placeholder:text-slate-300/50 text-slate-800 tracking-tight"
                                autoFocus
                            />
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 space-y-8 bg-white relative z-10">

                    {/* Parent Selector (Only if Sub) */}
                    {type === 'sub' && !parentId && (
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">Pertenece a</label>
                            <div className="relative">
                                <select
                                    value={selectedParent}
                                    onChange={(e) => setSelectedParent(e.target.value)}
                                    className="w-full pl-5 pr-12 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 transition-all appearance-none cursor-pointer text-lg"
                                    required={type === 'sub'}
                                >
                                    <option value="" disabled>Selecciona una categoría padre</option>
                                    {parentOptions.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <Layers className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Limit Input */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">Límite Mensual</label>
                        <div className="relative group">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl group-focus-within:text-indigo-500 transition-colors">{currency === 'USD' ? '$' : currency}</span>
                            <input
                                type="text"
                                value={limitValue}
                                placeholder="0.00"
                                onChange={handleLimitChange}
                                className="w-full pl-10 pr-12 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-2xl text-slate-800 transition-all placeholder:text-slate-300"
                                inputMode="decimal"
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                            </div>
                        </div>
                    </div>

                    {/* Icon Picker */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">Icono</label>
                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                            <div className="grid grid-cols-6 sm:grid-cols-6 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                {PRESET_ICONS.map(i => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setIcon(i)}
                                        className={`aspect-square flex items-center justify-center text-2xl rounded-2xl transition-all hover:scale-110 active:scale-95 ${icon === i ? 'bg-white shadow-lg ring-2 ring-indigo-500 scale-110 z-10' : 'hover:bg-white hover:shadow-md text-slate-400 grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}`}
                                    >
                                        {i}
                                    </button>
                                ))}
                            </div>
                            <input type="hidden" name="icon" value={icon} />
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="p-8 pt-0 bg-white space-y-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-xl hover:bg-slate-800 disabled:opacity-70 flex items-center justify-center gap-3 shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98] ring-4 ring-slate-100"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
                        {type === 'sub' ? 'Crear Subcategoría' : 'Crear Categoría'}
                    </button>

                    <button
                        type="button"
                        onClick={(e) => handleCreate(e, true)}
                        disabled={loading}
                        className="w-full py-4 bg-white text-slate-500 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 flex items-center justify-center gap-2 border-2 border-slate-100 transition-all"
                    >
                        <Repeat className="w-5 h-5" />
                        Crear y agregar otra
                    </button>
                </div>

            </form>
        </div>
    )
}
