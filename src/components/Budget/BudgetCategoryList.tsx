'use client'

import { useState } from 'react'
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
    budget_limit: number // Need raw limit for editing
}

interface Props {
    categories: CategoryItem[]
    currency: string
}

export function BudgetCategoryList({ categories, currency }: Props) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-lg">Desglose por Categoría</h3>
                {/* Optional: Add "Reorder" or "Manage" global button later */}
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
    const [isOpen, setIsOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const hasChildren = category.children && category.children.length > 0

    // Visual Helpers
    const isOverspent = category.remaining < 0
    const progressColor = isOverspent ? 'bg-red-500' : category.percent > 85 ? 'bg-amber-400' : 'bg-emerald-400'
    const textColor = isOverspent ? 'text-red-500' : 'text-emerald-600'

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        e.stopPropagation()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.append('categoryId', category.id)
        // Icon handling simpler here or keep existing
        formData.append('icon', category.icon)

        await updateCategory(formData)
        setLoading(false)
        setIsEditing(false)
    }

    async function handleDelete(e: React.MouseEvent) {
        e.stopPropagation()
        if (!confirm('¿Eliminar esta categoría y todo su contenido?')) return
        setLoading(true)
        await deleteCategory(category.id)
        // Router refresh usually handled by action revalidate
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
                                        name="limit"
                                        type="number"
                                        step="0.01"
                                        defaultValue={category.budget_limit}
                                        className="w-full font-bold text-slate-800 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-2">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDelete(e) }}
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

            {/* Edit Trigger (Always visible now for mobile) */}
            <button
                onClick={(e) => { e.stopPropagation(); setIsEditing(true) }}
                className="absolute top-3 right-3 p-2 text-indigo-400 hover:text-indigo-600 transition-colors z-20"
            >
                <Pencil className="w-4 h-4" />
            </button>

            {/* Main Clickable Area */}
            <div
                onClick={() => hasChildren && setIsOpen(!isOpen)}
                className={`flex flex-col gap-3 ${hasChildren ? 'cursor-pointer' : ''}`}
            >
                {/* Header: Icon + Info */}
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

                    <div className="flex-1 pr-10"> {/* Increased padding to avoid overlap */}
                        <div className="flex justify-between items-center mb-0.5">
                            <h4 className="font-bold text-slate-800">{category.name}</h4>
                            <span className={`text-sm font-bold ${textColor}`}>
                                {isOverspent ? '-' : ''}{currency} {Math.abs(category.remaining).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Gasto: {currency} {category.spent.toLocaleString()}</span>
                            <span>Límite: {currency} {category.limit.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar (Full Width) */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${progressColor}`}
                        style={{ width: `${Math.min(category.percent, 100)}%` }}
                    />
                </div>
            </div>

            {/* Children List - Collapsible */}
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
    const [isEditing, setIsEditing] = useState(false)
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
    }

    async function handleDelete() {
        if (!confirm('¿Eliminar esta subcategoría?')) return
        setLoading(true)
        await deleteCategory(category.id)
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
                <button type="button" onClick={handleDelete} className="p-1.5 text-red-300 hover:text-red-500">
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
                    <p className="text-sm font-bold text-slate-600">{currency} {category.spent.toLocaleString()}</p>
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
