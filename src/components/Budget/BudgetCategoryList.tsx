'use client'

import { useState } from 'react'
import { PlusCircle, Info, ChevronRight, ChevronDown, Trash2, CreditCard } from 'lucide-react'
import { deleteCategory } from '@/actions/settings'
import { useRouter } from 'next/navigation'

import { CreateCategoryModal } from './CreateCategoryModal'
import { AddCategoryButton } from './AddCategoryButton'
import Link from 'next/link'

interface TransactionItem {
    id: string
    amount: number
    date: string
}

interface CategoryItem {
    id: string
    name: string
    icon: string
    limit: number
    spent: number
    remaining: number
    percent: number
    children: CategoryItem[]
    type: string
}

interface Props {
    categories: CategoryItem[]
    currency: string
    budgetId: string
}

export function BudgetCategoryList({ categories, currency, budgetId }: Props) {
    const [isCreating, setIsCreating] = useState(false)

    // Split Fixed vs Variable
    const variableCats = categories.filter(c => c.type === 'variable')
    const fixedCats = categories.filter(c => c.type === 'fixed')

    return (
        <div className="space-y-8">

            {/* 1. Fixed Expenses Section */}
            {fixedCats.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        Gastos Fijos
                    </h3>

                    <div className="grid gap-3">
                        {fixedCats.map(cat => (
                            <FixedCategoryCard key={cat.id} category={cat} currency={currency} />
                        ))}
                    </div>
                </div>
            )}

            {/* 2. Variable Expenses Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        Gastos Variables
                    </h3>
                </div>

                {variableCats.map(cat => (
                    <BudgetCategoryRow key={cat.id} category={cat} currency={currency} budgetId={budgetId} />
                ))}

                {/* Inline Create removed in favor of header button */}
                {/* But keeping subcategory creation logic relative to parent row */}

                {categories.length === 0 && (
                    <p className="text-center text-slate-400 py-4">
                        Comienza agregando tu primera categoría desde el botón superior.
                    </p>
                )}
            </div>
        </div>
    )
}

function FixedCategoryCard({ category, currency }: { category: CategoryItem, currency: string }) {
    const isPaid = category.spent >= category.limit
    const percent = category.limit > 0 ? Math.min((category.spent / category.limit) * 100, 100) : 0

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 ${isPaid ? 'bg-green-50 border-green-100 text-green-600 grayscale-0' : 'bg-slate-50 border-slate-100 grayscale'}`}>
                {category.icon}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-slate-800 truncate">{category.name}</h4>
                    {isPaid ? (
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">PAGADO</span>
                    ) : (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">PENDIENTE</span>
                    )}
                </div>

                <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400">Presupuesto</span>
                        <span className="font-bold text-slate-600 text-sm">{currency} {category.limit.toLocaleString('en-US')}</span>
                    </div>

                    {!isPaid && (
                        <Link
                            href={`/transactions/new?categoryId=${category.id}&amount=${category.limit}`}
                            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-colors flex items-center gap-2"
                        >
                            <CreditCard className="w-3 h-3" />
                            Pagar
                        </Link>
                    )}
                    {isPaid && (
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-slate-400">Pagado</span>
                            <span className="font-bold text-green-600 text-sm">{currency} {category.spent.toLocaleString('en-US')}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function BudgetCategoryRow({ category, currency, budgetId }: { category: CategoryItem, currency: string, budgetId: string }) {
    const [expanded, setExpanded] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isCreatingSub, setIsCreatingSub] = useState(false)
    const router = useRouter()

    async function handleDelete(e: React.MouseEvent) {
        e.stopPropagation()
        if (!confirm('¿Seguro que quieres eliminar esta categoría?')) return

        setLoading(true)
        const res = await deleteCategory(category.id)
        if (res?.error) {
            alert(res.error)
            setLoading(false)
        } else {
            router.refresh()
        }
    }

    const hasChildren = category.children && category.children.length > 0
    const percent = category.limit > 0 ? Math.min((category.spent / category.limit) * 100, 100) : 0

    // Status Color
    let statusColor = 'bg-indigo-500' // safe
    if (percent > 80) statusColor = 'bg-amber-500' // warning
    if (percent >= 100) statusColor = 'bg-red-500' // danger

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all">
            {/* Main Row */}
            <div
                onClick={() => setExpanded(!expanded)}
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors relative group"
            >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl border-2 border-indigo-100 shrink-0">
                    {category.icon}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="font-extrabold text-slate-800 text-lg truncate leading-tight">{category.name}</h4>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${percent >= 100 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                            {Math.round(percent)}%
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mb-1.5">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${statusColor}`}
                            style={{ width: `${percent}%` }}
                        />
                    </div>

                    <div className="flex justify-between text-xs items-center">
                        <span className="text-slate-400 font-medium">
                            <span className="text-slate-800 font-bold">{currency} {category.spent.toLocaleString('en-US')}</span> de {category.limit.toLocaleString('en-US')}
                        </span>
                        <span className={`font-bold ${category.remaining < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                            {category.remaining < 0 ? '-' : '+'}{currency} {Math.abs(category.remaining).toLocaleString('en-US')}
                        </span>
                    </div>
                </div>

                {hasChildren && (
                    <div className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-5 h-5 text-slate-300" />
                    </div>
                )}

                {/* Delete Action (Hidden by default, shown on hover/slide) */}
                <button
                    onClick={handleDelete}
                    className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-all"
                    title="Eliminar Categoría"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Subcategories */}
            {(expanded || isCreatingSub) && (
                <div className="bg-slate-50/50 border-t border-slate-100">
                    {category.children.map(sub => (
                        <BudgetSubCategoryRow key={sub.id} category={sub} currency={currency} />
                    ))}

                    {/* Add Subcategory Trigger */}
                    {isCreatingSub && (
                        <CreateCategoryModal
                            budgetId={budgetId}
                            parentId={category.id}
                            onClose={() => setIsCreatingSub(false)}
                            currency={currency}
                            isSub={true}
                        />
                    )}

                    {!isCreatingSub && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                if (!expanded) setExpanded(true)
                                setIsCreatingSub(true)
                            }}
                            className="w-full py-3 text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center justify-center gap-1 hover:bg-indigo-50/50 transition-colors"
                        >
                            <PlusCircle className="w-3 h-3" />
                            Agregar Subcategoría
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

function BudgetSubCategoryRow({ category, currency }: { category: CategoryItem, currency: string }) {
    const router = useRouter()

    async function handleDeleteSub(e: React.MouseEvent) {
        e.stopPropagation()
        if (!confirm('¿Eliminar subcategoría?')) return
        const res = await deleteCategory(category.id)
        if (res?.error) alert(res.error)
        else router.refresh()
    }

    const percent = category.limit > 0 ? Math.min((category.spent / category.limit) * 100, 100) : 0

    return (
        <div className="p-3 pl-4 flex items-center gap-3 border-b border-slate-100 last:border-0 hover:bg-slate-100 transition-colors group relative">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sm border border-slate-200 shadow-sm shrink-0">
                {category.icon}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                    <h5 className="font-bold text-slate-700 text-sm truncate">{category.name}</h5>
                    <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-100 text-slate-500 font-mono">
                        {Math.round(percent)}%
                    </span>
                </div>

                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-1 mb-1">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${percent}%` }} />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{currency} {category.spent.toLocaleString('en-US')}</span>
                    <span>Meta: {currency} {category.limit.toLocaleString('en-US')}</span>
                </div>
            </div>

            <button
                onClick={handleDeleteSub}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-lg transition-all"
            >
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
    )
}
