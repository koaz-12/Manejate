'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'

interface Category {
    id: string
    name: string
    icon: string
    parent_id?: string | null
}

interface TransactionFiltersProps {
    categories: Category[]
    onFiltersChange: (filters: { search: string; categoryId: string; dateFrom: string; dateTo: string }) => void
}

export function TransactionFilters({ categories, onFiltersChange }: TransactionFiltersProps) {
    const [search, setSearch] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    const activeFilterCount = [categoryId, dateFrom, dateTo].filter(Boolean).length

    const updateFilters = (update: Partial<{ search: string; categoryId: string; dateFrom: string; dateTo: string }>) => {
        const newFilters = {
            search: update.search ?? search,
            categoryId: update.categoryId ?? categoryId,
            dateFrom: update.dateFrom ?? dateFrom,
            dateTo: update.dateTo ?? dateTo,
        }
        if ('search' in update) setSearch(update.search!)
        if ('categoryId' in update) setCategoryId(update.categoryId!)
        if ('dateFrom' in update) setDateFrom(update.dateFrom!)
        if ('dateTo' in update) setDateTo(update.dateTo!)
        onFiltersChange(newFilters)
    }

    const clearAll = () => {
        setSearch('')
        setCategoryId('')
        setDateFrom('')
        setDateTo('')
        onFiltersChange({ search: '', categoryId: '', dateFrom: '', dateTo: '' })
    }

    // Group categories: parents only (no subcategories in filter for simplicity)
    const parentCategories = categories.filter(c => !c.parent_id)

    return (
        <div className="space-y-3">
            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4 pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => updateFilters({ search: e.target.value })}
                        placeholder="Buscar transacciones..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-300 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                    {search && (
                        <button
                            onClick={() => updateFilters({ search: '' })}
                            className="absolute right-3 top-2.5 text-slate-300 hover:text-slate-500"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-3 py-2.5 rounded-xl border text-sm font-bold flex items-center gap-1.5 transition-all ${showFilters || activeFilterCount > 0
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                >
                    <Filter className="w-4 h-4" />
                    {activeFilterCount > 0 && (
                        <span className="bg-indigo-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Category Filter */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Categoría</label>
                        <div className="relative">
                            <select
                                value={categoryId}
                                onChange={(e) => updateFilters({ categoryId: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:border-indigo-300 appearance-none"
                            >
                                <option value="">Todas las categorías</option>
                                {parentCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Desde</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => updateFilters({ dateFrom: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:border-indigo-300"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Hasta</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => updateFilters({ dateTo: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:border-indigo-300"
                            />
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {activeFilterCount > 0 && (
                        <button
                            onClick={clearAll}
                            className="text-xs text-red-500 hover:text-red-600 font-bold flex items-center gap-1"
                        >
                            <X className="w-3 h-3" />
                            Limpiar filtros
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
