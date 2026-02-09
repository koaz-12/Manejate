'use client'

import { Trash2, LogOut, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

interface Props {
    budgetId: string
    isOwner: boolean
}

export function DangerZoneCard({ budgetId, isOwner }: Props) {
    // Actions would be deleteBudget(id) or leaveBudget(id)

    return (
        <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 space-y-4">
            <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Zona de Peligro
            </h3>

            <div className="space-y-3">
                {isOwner ? (
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-red-100">
                        <div>
                            <p className="font-bold text-slate-800">Eliminar Presupuesto</p>
                            <p className="text-xs text-slate-400">Esta acción no se puede deshacer.</p>
                        </div>
                        <button className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-red-200 hover:border-red-300">
                            Eliminar
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-red-100">
                        <div>
                            <p className="font-bold text-slate-800">Salir del Presupuesto</p>
                            <p className="text-xs text-slate-400">Perderás acceso a este espacio.</p>
                        </div>
                        <button className="text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-slate-200">
                            Salir
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
