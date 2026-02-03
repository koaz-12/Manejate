'use client'

import { deleteTransaction } from '@/actions/transaction'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export function TransactionActions({ id }: { id: string }) {
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        if (!confirm('¿Seguro que deseas eliminar este movimiento?')) return

        setLoading(true)
        await deleteTransaction(id)
        setLoading(false)
    }

    return (
        <div className="flex items-center gap-1 pl-2">
            <Link href={`/transactions/${id}/edit`} className="p-2 text-slate-300 hover:text-blue-500">
                <Pencil className="w-4 h-4" />
            </Link>
            <button onClick={handleDelete} disabled={loading} className="p-2 text-slate-300 hover:text-red-500 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
        </div>
    )
}
