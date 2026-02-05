'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, AlertTriangle, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react'
import { updateCategory, deleteCategory } from '@/actions/settings'

interface CategoryItem {
    id: string
    name: string
    icon: string
    limit: number
    spent: number
    remaining: number
    percent: number
    children: CategoryItem[]
    budget_limit: number
}

interface Props {
    categories: CategoryItem[]
    currency: string
    budgetId: string
}

export function BudgetCategoryList({ categories, currency, budgetId }: Props) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-lg">Desglose por Categoría</h3>
            </div>

            {categories.map(cat => (
                <BudgetCategoryRow key={cat.id} category={cat} currency={currency} />
            ))}

            {categories.length === 0 && (
                <p className="text-center text-slate-400 py-8">
                    No tienes categorías de gastos configuradas.
                </p>
            )}
        </div>
    )
}

function BudgetCategoryRow({ category, currency }: { category: CategoryItem, currency: string }) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [limitValue, setLimitValue] = useState(category.budget_limit.toString())

    const hasChildren = category.children && category.children.length > 0
    const isOverspent = category.remaining < 0
    const progressColor = isOverspent ? 'bg-red-500' : category.percent > 85 ? 'bg-amber-400' : 'bg-emerald-400'
    const textColor = isOverspent ? 'text-red-500' : 'text-emerald-600'

    // Format initial value on edit start
    useEffect(() => {
        if (isEditing) {
            setLimitValue(formatNumber(category.budget_limit))
        }
    }, [isEditing, category.budget_limit])

    const formatNumber = (num: string | number) => {
        if (!num) return ''
        const parts = num.toString().split('.')
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        return parts.join('.')
    }

    const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove non-numeric chars except dot
        const raw = e.target.value.replace(/[^0-9.]/g, '')
        setLimitValue(formatNumber(raw))
    }

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        e.stopPropagation()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const rawLimit = limitValue.replace(/,/g, '') // Remove commas for numbers

        formData.append('categoryId', category.id)
        formData.append('icon', category.icon)
        formData.set('limit', rawLimit) // Override with clean number

        await updateCategory(formData)
        setLoading(false)
        setIsEditing(false)
        router.refresh()
    }

    async function handleDelete(e: React.MouseEvent) {
        e.stopPropagation()
        setLoading(true)
        const res = await deleteCategory(category.id)
        if (res?.error) {
            alert(res.error)
            setLoading(false)
        } else {
            router.refresh()
            // Keep loading true until refresh completes or component unmounts
        }
    }

    // Custom Delete Modal
    if (showDeleteConfirm) {
        return (
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 animate-in fade-in zoom-in-95">
                <p className="text-red-800 font-bold mb-1">¿Eliminar categoría?</p>
                <p className="text-red-600 text-sm mb-3">Se borrarán también todas sus subcategorías.</p>
                <div className="flex gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false) }}
                        className="flex-1 py-2 bg-white text-slate-600 font-bold rounded-xl text-sm border border-red-100"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex-1 py-2 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                        Eliminar
                    </button>
                </div>
            </div>
        )
    }

    // Edit Mode UI
    if (isEditing) {
        return (
            <form onSubmit={handleSave} className="bg-white p-4 rounded-2xl shadow-sm border-2 border-indigo-100 space-y-3 relative">
                <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl border border-slate-200">
                        {category.icon}
                    </div>
                    <div className="flex-1 space-y-3">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase">Nombre</label>
                            <input
                                name="name"
                                defaultValue={category.name}
                                className="w-full font-bold text-slate-800 border-b border-slate-200 outline-none focus:border-indigo-500 py-1"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Límite Mensual</label>
                                <div className="flex items-center gap-1 border-b border-slate-200 focus-within:border-indigo-500 py-1">
                                    <span className="text-slate-400 text-sm">{currency}</span>
                                    <input
                                        type="text"
                                        value={limitValue}
                                        onChange={handleLimitChange}
                                        className="w-full font-bold text-slate-800 outline-none"
                                        inputMode="decimal"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-2">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true) }}
                        className="mr-auto p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setIsEditing(false) }}
                        className="px-3 py-2 text-slate-400 font-bold text-sm hover:text-slate-600"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                        Guardar
                    </button>
                </div>
            </form>
        )
    }

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-200 group relative">

            <button
                onClick={(e) => { e.stopPropagation(); setIsEditing(true) }}
                className="absolute top-3 right-3 p-2 text-indigo-400 hover:text-indigo-600 transition-colors z-20"
            >
                <Pencil className="w-4 h-4" />
            </button>

            <div
                onClick={() => hasChildren && setIsOpen(!isOpen)}
                className={`flex flex-col gap-3 ${hasChildren ? 'cursor-pointer' : ''}`}
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl">
                            {category.icon || '📦'}
                        </div>
                        {hasChildren && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-200 rounded-full flex items-center justify-center border border-white shadow-sm">
                                {isOpen ? <ChevronDown className="w-2.5 h-2.5 text-slate-500" /> : <ChevronRight className="w-2.5 h-2.5 text-slate-500" />}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 pr-10">
                        <div className="flex justify-between items-center mb-0.5">
                            <h4 className="font-bold text-slate-800">{category.name}</h4>
                            <span className={`text-sm font-bold ${textColor}`}>
                                {isOverspent ? '-' : ''}{currency} {Math.abs(category.remaining).toLocaleString('en-US')}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Gasto: {currency} {category.spent.toLocaleString('en-US')}</span>
                            <span>Límite: {currency} {category.limit.toLocaleString('en-US')}</span>
                        </div>
                    </div>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${progressColor}`}
                        style={{ width: `${Math.min(category.percent, 100)}%` }}
                    />
                </div>
            </div>

            {hasChildren && isOpen && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
                    {category.children.map(child => (
                        <BudgetSubCategoryRow key={child.id} category={child} currency={currency} />
                    ))}
                </div>
            )}
        </div>
    )
}

function BudgetSubCategoryRow({ category, currency }: { category: CategoryItem, currency: string }) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.append('categoryId', category.id)
        formData.append('icon', category.icon)
        await updateCategory(formData)
        setLoading(false)
        setIsEditing(false)
        router.refresh()
    }

    async function handleDelete() {
        setLoading(true)
        const res = await deleteCategory(category.id)
        if (res?.error) {
            alert(res.error)
            setLoading(false)
        } else {
            router.refresh()
        }
    }

    if (showDeleteConfirm) {
        return (
            <div className="bg-red-50 p-3 rounded-xl border border-red-100 ml-2 animate-in fade-in">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-700">¿Eliminar subcategoría?</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(false)} className="text-xs px-3 py-1 bg-white rounded-lg border text-slate-500">No</button>
                    <button onClick={handleDelete} className="text-xs px-3 py-1 bg-red-500 text-white rounded-lg font-bold">Sí, eliminar</button>
                </div>
            </div>
        )
    }

    if (isEditing) {
        return (
            <form onSubmit={handleSave} className="pl-2 flex items-center gap-2 animate-in fade-in">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-sm border border-slate-200">
                    {category.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <input
                        name="name"
                        defaultValue={category.name}
                        className="w-full text-sm font-bold text-slate-800 border-b border-slate-300 outline-none pb-0.5 bg-transparent"
                        autoFocus
                    />
                </div>
                <button type="button" onClick={() => setShowDeleteConfirm(true)} className="p-1.5 text-red-300 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="p-1.5 text-slate-300 hover:text-slate-500">
                    <X className="w-3.5 h-3.5" />
                </button>
                <button type="submit" disabled={loading} className="p-1.5 text-indigo-500 hover:text-indigo-600">
                    <Check className="w-3.5 h-3.5" />
                </button>
            </form>
        )
    }

    return (
        <div className="flex items-center gap-3 pl-2 group/child relative pr-8">
            {/* Edit Trigger for Child - Always Visible but Subtle */}
            <button
                onClick={() => setIsEditing(true)}
                className="absolute right-0 top-1 p-1 text-indigo-400 hover:text-indigo-600 transition-colors"
                title="Editar subcategoría"
            >
                <Pencil className="w-3.5 h-3.5" />
            </button>

            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-sm">
                {category.icon || '🏷️'}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-slate-700">{category.name}</p>
                    <p className="text-sm font-bold text-slate-600">{currency} {category.spent.toLocaleString('en-US')}</p>
                </div>
                {/* Child Progress */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${category.percent > 100 ? 'bg-red-500' : category.percent > 85 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                        style={{ width: `${Math.min(category.percent, 100)}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
