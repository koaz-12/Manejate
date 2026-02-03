'use client'

import { updateCategory, createCategory } from '@/actions/settings'
import { useState } from 'react'
import { Pencil, Check, X, Loader2, Plus, Trash2 } from 'lucide-react'

interface Category {
    id: string
    name: string
    budget_limit: number
    icon: string
    type: string
}

interface Props {
    categories: Category[]
    currency: string
    budgetId: string
}

export function CategoryList({ categories, currency, budgetId }: Props) {
    const [isCreating, setIsCreating] = useState(false)
    const [loading, setLoading] = useState(false)

    // Group by Type
    const incomeCats = categories.filter(c => c.type === 'income')
    const fixedCats = categories.filter(c => c.type === 'fixed')
    const variableCats = categories.filter(c => c.type === 'variable')

    async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.append('budgetId', budgetId)

        await createCategory(formData)
        setLoading(false)
        setIsCreating(false)
    }

    return (
        <div className="space-y-6">

            <div className="flex justify-end">
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 text-sm font-bold text-[var(--primary)] bg-emerald-50 px-4 py-2 rounded-xl transition-colors hover:bg-emerald-100"
                >
                    <Plus className="w-4 h-4" />
                    Nueva Categoría
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="bg-white p-4 rounded-2xl shadow-md border-2 border-emerald-100 animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Crear Nueva</p>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <input name="icon" placeholder="💊" className="w-12 h-12 text-center text-xl bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" maxLength={2} required />
                            <div className="flex-1 space-y-2">
                                <input name="name" placeholder="Nombre (ej. Extras)" className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm font-bold" required />
                                <div className="flex gap-2">
                                    <select name="type" className="flex-1 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm" required>
                                        <option value="variable">Variables</option>
                                        <option value="fixed">Fijos</option>
                                        <option value="income">Ingresos 💰</option>
                                    </select>
                                    <input name="limit" type="number" step="0.01" placeholder="Límite" className="w-24 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-400 text-sm font-medium hover:text-slate-600">Cancelar</button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 disabled:opacity-50">
                                {loading ? 'Guardando...' : 'Crear'}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Income Section */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Ingresos</h3>
                <div className="space-y-2">
                    {incomeCats.length === 0 && <p className="text-sm text-slate-400 px-2 italic">Sin categorías de ingreso.</p>}
                    {incomeCats.map(cat => <CategoryRow key={cat.id} category={cat} currency={currency} />)}
                </div>
            </div>

            {/* Fixed Section */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Gastos Fijos</h3>
                <div className="space-y-2">
                    {fixedCats.map(cat => <CategoryRow key={cat.id} category={cat} currency={currency} />)}
                </div>
            </div>

            {/* Variable Section */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Gastos Variables</h3>
                <div className="space-y-2">
                    {variableCats.map(cat => <CategoryRow key={cat.id} category={cat} currency={currency} />)}
                </div>
            </div>
        </div>
    )
}

function CategoryRow({ category, currency }: { category: Category, currency: string }) {
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.append('categoryId', category.id)

        const res = await updateCategory(formData)
        if (!res?.error) {
            setIsEditing(false)
        }
        setLoading(false)
    }

    if (isEditing) {
        return (
            <form onSubmit={handleSave} className="bg-white p-3 rounded-2xl shadow-sm border border-emerald-200 flex items-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full border border-slate-100">
                    <input name="icon" defaultValue={category.icon || '📦'} className="w-6 bg-transparent text-center outline-none" />
                </div>
                <div className="flex-1 space-y-1">
                    <input name="name" defaultValue={category.name} className="w-full text-sm font-bold text-slate-800 border-b border-slate-200 outline-none pb-0.5" placeholder="Nombre" />
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span>{currency}</span>
                        <input name="limit" type="number" step="0.01" defaultValue={category.budget_limit} className="w-20 border-b border-slate-200 outline-none pb-0.5" placeholder="0.00" />
                        <span>/mes</span>
                    </div>
                </div>
                <button type="button" onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                <button type="submit" disabled={loading} className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
            </form>
        )
    }

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl border border-slate-100">
                    {category.icon || '📦'}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800 text-sm">{category.name}</p>
                        {category.type === 'income' && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">IN</span>}
                    </div>
                    <p className="text-xs text-slate-400">
                        {category.budget_limit > 0
                            ? `${category.type === 'income' ? 'Meta: ' : 'Tope: '} ${currency} ${category.budget_limit}`
                            : 'Sin límite definido'}
                    </p>
                </div>
            </div>
            <button onClick={() => setIsEditing(true)} className="p-2 text-slate-300 hover:text-[var(--secondary)] transition-colors">
                <Pencil className="w-4 h-4" />
            </button>
        </div>
    )
}
