'use client'

import { deleteTransaction } from '@/actions/transaction'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/Common/ConfirmDialog'

export function TransactionActions({ id }: { id: string }) {
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        setLoading(true)
        await deleteTransaction(id)
        setLoading(false)
    }

    return (
        <div className="flex flex-col gap-0.5 items-end pl-2 border-l border-slate-50 ml-2">
            <Link href={`/transactions/${id}/edit`} className="p-1.5 text-slate-300 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
                <Pencil className="w-3.5 h-3.5" />
            </Link>
            <ConfirmDialog
                title="¿Eliminar movimiento?"
                message="Esta transacción será eliminada permanentemente."
                confirmLabel="Eliminar"
                onConfirm={handleDelete}
                trigger={
                    <button disabled={loading} className="p-1.5 text-slate-300 hover:text-red-500 disabled:opacity-50 rounded-lg hover:bg-red-50 transition-colors">
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                }
            />
        </div>
    )
}
