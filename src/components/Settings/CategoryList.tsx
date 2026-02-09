'use client'

import { updateCategory, createCategory, deleteCategory } from '@/actions/settings'
import { useState } from 'react'
import { Pencil, Check, X, Loader2, Plus, Trash2, AlertTriangle } from 'lucide-react'

// Simple Emoji Picker for demonstration (can be expanded)
const COMMON_ICONS = ['🍔', '🛒', '⛽', '🏠', '💡', '🎬', '💊', '🚌', '✈️', '🎁', '🎓', '👶', '🐾', '💳', '🏦', '💰', '💸', '💼', '📦', '🔹']

interface Category {
    id: string
    name: string
    budget_limit: number
    icon: string
    type: string
    parent_id?: string | null
}

interface Props {
    categories: Category[]
    currency: string
    budgetId: string
}

export function CategoryList({ categories, currency, budgetId }: Props) {
    const [isCreating, setIsCreating] = useState(false)
    const [creatingParentId, setCreatingParentId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [selectedIcon, setSelectedIcon] = useState('🏷️')
    const [showIconPicker, setShowIconPicker] = useState(false)

    // Helper to get children
    const getChildren = (parentId: string) => categories.filter(c => c.parent_id === parentId)

    // Group by Type (Top Level Only)
    const incomeCats = categories.filter(c => c.type === 'income' && !c.parent_id)
    const fixedCats = categories.filter(c => c.type === 'fixed' && !c.parent_id)
    const variableCats = categories.filter(c => c.type === 'variable' && !c.parent_id)

    async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        try {
            const formData = new FormData(e.currentTarget)
            formData.append('budgetId', budgetId)
            formData.append('icon', selectedIcon) // Use state for icon

            if (creatingParentId) {
                formData.append('parentId', creatingParentId)
            }

            const res = await createCategory(formData)

            if (res?.error) {
                alert(`Error: ${res.error}`)
            } else {
                setIsCreating(false)
                setCreatingParentId(null)
                setSelectedIcon('🏷️')
            }
        } catch (error) {
            console.error('Error creating category:', error)
            alert('Ocurrió un error inesperado. Por favor intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    const cancelCreation = () => {
        setIsCreating(false)
        setCreatingParentId(null)
        setShowIconPicker(false)
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

            {(isCreating || creatingParentId) && (
                <form onSubmit={handleCreate} className="bg-white p-4 rounded-2xl shadow-md border-2 border-emerald-100 animate-in fade-in slide-in-from-top-2 relative">
                    <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                        {creatingParentId ? 'Crear Subcategoría' : 'Crear Nueva Categoría'}
                    </p>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            {/* Icon Picker Trigger */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowIconPicker(!showIconPicker)}
                                    className="w-12 h-12 flex items-center justify-center text-xl bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
                                >
                                    {selectedIcon}
                                </button>
                                {showIconPicker && (
                                    <div className="absolute top-14 left-0 z-50 bg-white p-2 rounded-xl shadow-xl border border-slate-100 grid grid-cols-5 gap-1 w-[200px]">
                                        {COMMON_ICONS.map(icon => (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => { setSelectedIcon(icon); setShowIconPicker(false) }}
                                                className="p-2 hover:bg-slate-100 rounded-lg text-lg transition-colors"
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-2">
                                <input
                                    name="name"
                                    placeholder="Nombre (ej. Extras)"
                                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm font-bold text-slate-800 placeholder:text-slate-400"
                                    required
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <select
                                        name="type"
                                        className="flex-1 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm text-slate-800"
                                        required
                                        defaultValue={creatingParentId ? 'variable' : 'variable'}
                                    >
                                        <option value="variable">Variables</option>
                                        <option value="fixed">Fijos</option>
                                        <option value="income">Ingresos 💰</option>
                                    </select>
                                    <input
                                        name="limit"
                                        type="number"
                                        step="0.01"
                                        placeholder="Límite"
                                        className="w-24 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm text-slate-800 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={cancelCreation} className="px-4 py-2 text-slate-400 text-sm font-medium hover:text-slate-600">Cancelar</button>
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
                    {incomeCats.map(cat => (
                        <div key={cat.id}>
                            <CategoryRow category={cat} currency={currency} onAddSub={() => setCreatingParentId(cat.id)} />
                            {getChildren(cat.id).length > 0 && (
                                <div className="pl-4 mt-2 space-y-2 ml-4 border-l border-slate-100">
                                    {getChildren(cat.id).map(child => <CategoryRow key={child.id} category={child} currency={currency} isChild />)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Fixed Section */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Gastos Fijos</h3>
                <div className="space-y-2">
                    {fixedCats.map(cat => (
                        <div key={cat.id}>
                            <CategoryRow category={cat} currency={currency} onAddSub={() => setCreatingParentId(cat.id)} />
                            {getChildren(cat.id).length > 0 && (
                                <div className="pl-4 mt-2 space-y-2 ml-4 border-l border-slate-100">
                                    {getChildren(cat.id).map(child => <CategoryRow key={child.id} category={child} currency={currency} isChild />)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Variable Section */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Gastos Variables</h3>
                <div className="space-y-2">
                    {variableCats.map(cat => (
                        <div key={cat.id}>
                            <CategoryRow category={cat} currency={currency} onAddSub={() => setCreatingParentId(cat.id)} />
                            {getChildren(cat.id).length > 0 && (
                                <div className="pl-4 mt-2 space-y-2 ml-4 border-l border-slate-100">
                                    {getChildren(cat.id).map(child => <CategoryRow key={child.id} category={child} currency={currency} isChild />)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function CategoryRow({ category, currency, onAddSub, isChild = false }: { category: Category, currency: string, onAddSub?: () => void, isChild?: boolean }) {
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [loading, setLoading] = useState(false)
    const [tempIcon, setTempIcon] = useState(category.icon || '📦')
    const [showIconPicker, setShowIconPicker] = useState(false)

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.append('categoryId', category.id)
        formData.append('icon', tempIcon)

        const res = await updateCategory(formData)
        if (!res?.error) {
            setIsEditing(false)
        }
        setLoading(false)
    }

    async function handleDelete() {
        if (!confirm('¿Estás seguro de eliminar esta categoría y todo su contenido?')) return
        setLoading(true)
        await deleteCategory(category.id)
        // No need to clear state as component unmounts
    }

    if (isEditing) {
        return (
            <form onSubmit={handleSave} className="bg-white p-3 rounded-2xl shadow-sm border border-emerald-200 flex items-center gap-2 relative">
                {/* Edit Mode Icon Picker */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowIconPicker(!showIconPicker)}
                        className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full border border-slate-100 hover:bg-slate-100"
                    >
                        {tempIcon}
                    </button>
                    {showIconPicker && (
                        <div className="absolute top-12 left-0 z-50 bg-white p-2 rounded-xl shadow-xl border border-slate-100 grid grid-cols-5 gap-1 w-[200px]">
                            {COMMON_ICONS.map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => { setTempIcon(icon); setShowIconPicker(false) }}
                                    className="p-2 hover:bg-slate-100 rounded-lg text-lg transition-colors"
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-1">
                    <input
                        name="name"
                        defaultValue={category.name}
                        className="w-full text-sm font-bold text-slate-800 border-b border-slate-200 outline-none pb-0.5 bg-transparent"
                        placeholder="Nombre"
                        autoFocus
                    />
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span>{currency}</span>
                        <input
                            name="limit"
                            type="number"
                            step="0.01"
                            defaultValue={category.budget_limit}
                            className="w-20 border-b border-slate-200 outline-none pb-0.5 bg-transparent text-slate-800"
                            placeholder="0.00"
                        />
                        <span>/mes</span>
                    </div>
                </div>
                <button type="button" onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                <button type="submit" disabled={loading} className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
            </form>
        )
    }

    return (
        <div className={`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group relative ${isChild ? 'bg-slate-50/50' : ''}`}>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border ${isChild ? 'bg-white border-slate-200 scale-90' : 'bg-slate-50 border-slate-100'}`}>
                    {category.icon || '📦'}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className={`font-bold text-slate-800 ${isChild ? 'text-xs' : 'text-sm'}`}>{category.name}</p>
                        {category.type === 'income' && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">IN</span>}
                    </div>
                    {!isChild && (
                        <p className="text-xs text-slate-400">
                            {category.budget_limit > 0
                                ? `${category.type === 'income' ? 'Meta: ' : 'Tope: '} ${currency} ${category.budget_limit}`
                                : 'Sin límite definido'}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1">
                {onAddSub && (
                    <button onClick={onAddSub} className="p-2 text-slate-300 hover:text-emerald-500 transition-colors" title="Agregar subcategoría">
                        <Plus className="w-4 h-4" />
                    </button>
                )}
                <button onClick={() => setIsEditing(true)} className="p-2 text-slate-300 hover:text-[var(--secondary)] transition-colors" title="Editar">
                    <Pencil className="w-4 h-4" />
                </button>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    title="Eliminar"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
                </button>
            </div>
        </div>
    )
}
