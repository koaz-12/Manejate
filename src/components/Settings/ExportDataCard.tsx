'use client'

import { Download, FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'

interface Props {
    budgetId: string
}

export function ExportDataCard({ budgetId }: Props) {
    const [loading, setLoading] = useState(false)

    async function handleExport() {
        setLoading(true)
        // TODO: Implement actual CSV generation via API route or Server Action that returns a Blob.
        // For now, let's just simulate it or create a simple client-side CSV if we had the data.
        // Since we don't have the data here, we'd ideally call an API route like `/api/export?budgetId=...`

        // Mock for now as backend endpoint isn't ready.
        alert("La exportación de datos se implementará pronto con un endpoint dedicado.")
        setLoading(false)
    }

    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                    <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">Exportar Datos</h3>
                    <p className="text-sm text-slate-400">Descarga tus movimientos en CSV</p>
                </div>
            </div>

            <button
                onClick={handleExport}
                disabled={loading}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center gap-2"
            >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
            </button>
        </div>
    )
}
