'use client'

import { addTransaction, updateTransaction } from '@/actions/transaction'
import { useState } from 'react'
import { Loader2, Calendar, TrendingUp, TrendingDown, Save } from 'lucide-react'

interface Category {
    id: string
    name: string
    icon: string
    type: string
    parent_id?: string | null
}

interface TransactionData {
    id: string
    amount: number
    description?: string
    date: string
    category_id: string
    is_recurring: boolean
}

interface AddTransactionFormProps {
    budgetId: string
    categories: Category[]
    currency: string
    initialData?: TransactionData
}

export function AddTransactionForm({ budgetId, categories, currency, initialData }: AddTransactionFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Initial State Logic
    const initialCategory = categories.find(c => c.id === initialData?.category_id)
    const initialType = initialCategory?.type === 'income' ? 'income' : 'expense'

    const [selectedCategory, setSelectedCategory] = useState<string>(initialData?.category_id || '')
    const [type, setType] = useState<'expense' | 'income'>(initialType)

    // Filter categories by type
    const filteredCategories = categories.filter(c => {
        if (type === 'income') return c.type === 'income'
        return c.type === 'fixed' || c.type === 'variable'
    })

    // Group by Parent
    const parents = filteredCategories.filter(c => !c.parent_id)
    const getChildren = (parentId: string) => filteredCategories.filter(c => c.parent_id === parentId)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        // Append budgetId manually
        formData.append('budgetId', budgetId)
        formData.append('categoryId', selectedCategory)

        let result
        if (initialData) {
            formData.append('transactionId', initialData.id)
            result = await updateTransaction(formData)
        } else {
            result = await addTransaction(formData)
        }

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-8 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Type Toggle */}
            <div className="bg-slate-100 p-1 rounded-2xl flex relative">
                <button
                    type="button"
                    onClick={() => { setType('expense'); setSelectedCategory('') }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${type === 'expense' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <TrendingDown className="w-4 h-4" />
                    Gastos
                </button>
                <button
                    type="button"
                    onClick={() => { setType('income'); setSelectedCategory('') }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <TrendingUp className="w-4 h-4" />
                    Ingresos
                </button>
            </div>

            {/* Amount Input */}
            <div className="text-center space-y-2">
                <label className="text-slate-500 text-sm font-medium">Monto {type === 'expense' ? 'del Gasto' : 'de Ingreso'}</label>
                <div className="relative inline-flex items-center justify-center">
                    <span className={`text-4xl font-bold absolute left-4 ${type === 'expense' ? 'text-slate-300' : 'text-emerald-200'}`}>$</span>
                    <input
                        type="number"
                        name="amount"
                        step="0.01"
                        required
                        defaultValue={initialData?.amount}
                        placeholder="0.00"
                        className={`text-5xl font-bold text-center w-full bg-transparent outline-none placeholder:text-slate-200 ${type === 'expense' ? 'text-slate-800' : 'text-emerald-500'}`}
                        autoFocus={!initialData}
                    />
                </div>
                <p className="text-slate-400 text-sm">{currency}</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100">
                    {error}
                </div>
            )}

            {/* Category Selection */}
            <div className="space-y-4">
                <p className="text-sm font-medium text-slate-700">Categoría</p>

                {filteredCategories.length > 0 ? (
                    <div className="space-y-6">
                        {parents.map((parent) => {
                            const children = getChildren(parent.id)
                            return (
                                <div key={parent.id} className="space-y-2">
                                    {/* Parent Header/Button (Can be selected) */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCategory(parent.id)}
                                            className={`flex-1 p-3 rounded-xl border transition-all flex items-center gap-3 text-left ${selectedCategory === parent.id
                                                ? `bg-emerald-50 ring-2 ring-emerald-200 border-emerald-500`
                                                : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span className="text-xl">{parent.icon || '📦'}</span>
                                            <span className={`text-sm font-bold ${selectedCategory === parent.id ? 'text-emerald-700' : 'text-slate-700'}`}>
                                                {parent.name}
                                            </span>
                                        </button>
                                    </div>

                                    {/* Children Grid */}
                                    {children.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 pl-4 border-l-2 border-slate-100 ml-2">
                                            {children.map(child => (
                                                <button
                                                    key={child.id}
                                                    type="button"
                                                    onClick={() => setSelectedCategory(child.id)}
                                                    className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-1 ${selectedCategory === child.id
                                                        ? `bg-emerald-50 ring-2 ring-emerald-200 border-emerald-500`
                                                        : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <span className="text-lg">{child.icon || '🔹'}</span>
                                                    <span className={`text-[10px] font-medium text-center leading-tight ${selectedCategory === child.id ? 'text-emerald-700' : 'text-slate-500'}`}>
                                                        {child.name}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
                        No hay categorías en esta sección.
                    </div>
                )}

                <input type="hidden" name="categoryId" required value={selectedCategory} />
            </div>

            {/* Details */}
            <div className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium text-slate-700">Descripción (Opcional)</label>
                    <input
                        id="description"
                        name="description"
                        type="text"
                        defaultValue={initialData?.description}
                        placeholder={type === 'expense' ? "¿En qué gastaste?" : "¿De qué es el ingreso?"}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-slate-50 text-slate-900"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="date" className="text-sm font-medium text-slate-700">Fecha</label>
                    <div className="relative">
                        <input
                            id="date"
                            name="date"
                            type="date"
                            required
                            defaultValue={initialData?.date || new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-slate-50 text-slate-900"
                        />
                        <Calendar className="absolute right-4 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Recurring Option */}
            <div className="flex items-center gap-3 pt-2">
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        name="isRecurring"
                        id="isRecurring"
                        defaultChecked={initialData?.is_recurring}
                        className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white checked:bg-slate-900 checked:border-slate-900 transition-all"
                    />
                    <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
                <label htmlFor="isRecurring" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                    {type === 'expense' ? 'Gasto fijo mensual' : 'Ingreso recurrente'}
                </label>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading}
                className={`w-full font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg ${type === 'expense' ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'}`}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Guardando...
                    </>
                ) : (
                    initialData ? (
                        <>
                            <Save className="w-5 h-5" />
                            Actualizar {type === 'expense' ? 'Gasto' : 'Ingreso'}
                        </>
                    ) : (
                        type === 'expense' ? 'Registrar Gasto' : 'Registrar Ingreso'
                    )
                )}
            </button>

        </form>
    )
}
