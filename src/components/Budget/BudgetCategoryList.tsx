'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react'

interface CategoryItem {
    id: string
    name: string
    icon: string
    limit: number
    spent: number
    remaining: number
    percent: number
    children: CategoryItem[]
}

interface Props {
    categories: CategoryItem[]
    currency: string
}

export function BudgetCategoryList({ categories, currency }: Props) {
    return (
        <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">Desglose por Categoría</h3>

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
    const hasChildren = category.children && category.children.length > 0

    // Visual Helpers
    const isOverspent = category.remaining < 0
    const progressColor = isOverspent ? 'bg-red-500' : category.percent > 85 ? 'bg-amber-400' : 'bg-emerald-400'
    const textColor = isOverspent ? 'text-red-500' : 'text-emerald-600'

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Parent Row - Always Visible */}
            <div
                onClick={() => hasChildren && setIsOpen(!isOpen)}
                className={`p-4 flex items-center gap-3 ${hasChildren ? 'cursor-pointer hover:bg-slate-50/50 transition-colors' : ''}`}
            >
                {/* Icon & Toggle */}
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl z-10 relative">
                        {category.icon || '📦'}
                    </div>
                    {hasChildren && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-200 rounded-full flex items-center justify-center border border-white">
                            {isOpen ? <ChevronDown className="w-2.5 h-2.5 text-slate-500" /> : <ChevronRight className="w-2.5 h-2.5 text-slate-500" />}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-slate-800 truncate pr-2">{category.name}</h4>
                        <span className={`text-sm font-bold whitespace-nowrap ${textColor}`}>
                            {isOverspent ? '-' : ''}{currency} {Math.abs(category.remaining).toLocaleString()}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-1">
                        <div
                            className={`h-full rounded-full ${progressColor}`}
                            style={{ width: `${Math.min(category.percent, 100)}%` }}
                        />
                    </div>

                    <div className="flex justify-between text-xs text-slate-400">
                        <span>{currency} {category.spent.toLocaleString()} de {currency} {category.limit.toLocaleString()}</span>
                        {isOverspent && <div className="flex items-center gap-1 text-red-500 font-bold"><AlertTriangle className="w-3 h-3" /> Excedido</div>}
                    </div>
                </div>
            </div>

            {/* Children List - Collapsible */}
            {hasChildren && isOpen && (
                <div className="bg-slate-50/50 border-t border-slate-100">
                    {category.children.map(child => (
                        <div key={child.id} className="flex items-center gap-3 p-3 pl-6 border-b border-slate-100 last:border-0 hover:bg-slate-100/50 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm border border-slate-100">
                                {child.icon || '🏷️'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between">
                                    <p className="text-sm font-medium text-slate-700 truncate">{child.name}</p>
                                    <p className="text-sm font-bold text-slate-600">{currency} {child.spent.toLocaleString()}</p>
                                </div>
                                <div className="text-xs text-slate-400">Gasto directo</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
