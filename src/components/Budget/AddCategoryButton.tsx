'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'

interface Props {
    budgetId: string
    currency?: string
    categories?: any[]
}

export function AddCategoryButton({ budgetId }: Props) {
    return (
        <Link
            href="/budget/categories/new"
            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-sm shadow-indigo-200"
            title="Nueva Categoría"
        >
            <Plus className="w-6 h-6" />
        </Link>
    )
}
