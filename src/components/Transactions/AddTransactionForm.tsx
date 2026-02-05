'use client'

import { addTransaction, updateTransaction } from '@/actions/transaction'
import { useState, useEffect } from 'react'
import { Loader2, Calendar, TrendingUp, TrendingDown, Save, AlignLeft, Check } from 'lucide-react'
// import { format } from 'date-fns' (not installed, use native)

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
    const initialType = initialData
        ? (initialCategory?.type === 'income' ? 'income' : 'expense')
        : 'expense'

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

    // If type changes, clear category unless it matches type
    useEffect(() => {
        const cat = categories.find(c => c.id === selectedCategory)
        if (cat) {
            const catType = cat.type === 'income' ? 'income' : 'expense'
            if (catType !== type) setSelectedCategory('')
        }
    }, [type, categories])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const amount = Number(formData.get('amount'))
        if (amount <= 0) {
            setError('El monto debe ser mayor a 0')
            setLoading(false)
            return
        }

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
        <form action={handleSubmit} className="space-y-6 max-w-lg mx-auto">

            {/* Type Toggle Segmented Pille */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex relative shadow-inner">
                <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${type === 'expense' ? 'bg-white text-slate-900 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <TrendingDown className="w-4 h-4" />
                    Gasto
                </button>
                <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${type === 'income' ? 'bg-white text-emerald-600 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <TrendingUp className="w-4 h-4" />
                    Ingreso
                </button>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                {/* Amount Section */}
                <div className={`p-8 pb-10 text-center ${type === 'expense' ? 'bg-slate-50' : 'bg-emerald-50/50'}`}>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                        Monto
                    </label>
                    <div className="relative inline-flex items-center justify-center">
                        <span className={`text-4xl font-bold absolute -left-6 top-1.5 ${type === 'expense' ? 'text-slate-300' : 'text-emerald-300/50'}`}>$</span>
                        <input
                            type="number"
                            name="amount"
                            step="0.01"
                            min="0.01"
                            required
                            defaultValue={initialData?.amount}
                            placeholder="0.00"
                            className={`text-6xl font-black text-center w-full bg-transparent outline-none placeholder:text-slate-200/50 ${type === 'expense' ? 'text-slate-800' : 'text-emerald-500'}`}
                            autoFocus={!initialData}
                        />
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Category Selection Grid */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">
                            Categoría
                        </label>

                        {filteredCategories.length > 0 ? (
                            <div className="bg-slate-50 rounded-2xl p-4 max-h-[300px] overflow-y-auto border border-slate-100 custom-scrollbar">
                                <div className="grid grid-cols-2 gap-3">
                                    {parents.map((parent) => {
                                        const children = getChildren(parent.id)
                                        const isSelected = selectedCategory === parent.id

                                        return (
                                            <div key={parent.id} className="col-span-2 sm:col-span-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedCategory(parent.id)}
                                                    className={`w-full p-3 rounded-xl border transition-all flex items-center gap-3 text-left group ${isSelected
                                                        ? 'bg-white border-indigo-500 ring-2 ring-indigo-100 shadow-md z-10 relative'
                                                        : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'
                                                        }`}
                                                >
                                                    <span className="text-2xl group-hover:scale-110 transition-transform">{parent.icon || '📦'}</span>
                                                    <span className={`text-sm font-bold flex-1 truncate ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                        {parent.name}
                                                    </span>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                                                </button>

                                                {/* Children */}
                                                {children.length > 0 && (
                                                    <div className="ml-8 mt-2 space-y-2 border-l-2 border-slate-100 pl-3">
                                                        {children.map(child => {
                                                            const isChildSelected = selectedCategory === child.id
                                                            return (
                                                                <button
                                                                    key={child.id}
                                                                    type="button"
                                                                    onClick={() => setSelectedCategory(child.id)}
                                                                    className={`w-full text-left p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${isChildSelected
                                                                        ? 'bg-indigo-50 text-indigo-700'
                                                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                                                        }`}
                                                                >
                                                                    <span>{child.icon}</span>
                                                                    {child.name}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-slate-400 text-sm">No hay categorías disponibles.</p>
                            </div>
                        )}
                        <input type="hidden" name="categoryId" required value={selectedCategory} />
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">Fecha</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="date"
                                    required
                                    defaultValue={initialData?.date || new Date().toISOString().split('T')[0]}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 transition-all"
                                />
                                <Calendar className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">Nota</label>
                            <div className="relative">
                                <input
                                    name="description"
                                    defaultValue={initialData?.description}
                                    placeholder={type === 'expense' ? "Ej: Cena con amigos" : "Ej: Pago de cliente"}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium text-slate-700 transition-all placeholder:text-slate-300"
                                />
                                <AlignLeft className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                            </div>
                        </div>
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
                    className={`w-full font-bold text-lg py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-slate-200 ${type === 'expense'
                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200'}`}
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
                                Actualizar
                            </>
                        ) : (
                            <>
                                <Check className="w-6 h-6" />
                                {type === 'expense' ? 'Registrar Gasto' : 'Registrar Ingreso'}
                            </>
                        )
                    )}
                </button>
            </div>
        </form>
    )
}
