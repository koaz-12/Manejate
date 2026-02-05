'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CreateCategoryModal } from './CreateCategoryModal'

interface Props {
    budgetId: string
    currency: string
    categories: any[]
}

export function AddCategoryButton({ budgetId, currency, categories }: Props) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-sm shadow-indigo-200"
                title="Nueva Categoría"
            >
                <Plus className="w-6 h-6" />
            </button>

            {isOpen && (
                <CreateCategoryModal
                    budgetId={budgetId}
                    currency={currency}
                    categories={categories}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
