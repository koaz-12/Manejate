'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 space-y-6 text-center">
                {/* Icon */}
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-800">¡Ups! Algo salió mal</h2>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Ocurrió un error inesperado. Puedes intentar recargar o volver al inicio.
                    </p>
                </div>

                {/* Error detail (collapsed by default for cleaner look) */}
                <details className="text-left">
                    <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-500 transition-colors font-medium">
                        Ver detalle técnico
                    </summary>
                    <div className="mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 font-mono break-all leading-relaxed">
                            {error.message || 'Error desconocido'}
                        </p>
                        {error.digest && (
                            <p className="text-[10px] text-slate-300 mt-1 font-mono">
                                Digest: {error.digest}
                            </p>
                        )}
                    </div>
                </details>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-2">
                    <button
                        onClick={() => reset()}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Intentar de nuevo
                    </button>
                    <Link
                        href="/"
                        className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl border border-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Ir al inicio
                    </Link>
                </div>
            </div>
        </div>
    )
}
