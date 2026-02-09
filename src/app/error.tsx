'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-2">¡Ups! Algo salió mal</h2>
                <p className="text-slate-500 mb-6 text-sm">
                    Ocurrió un error inesperado al cargar esta página.
                </p>
                <p className="text-xs text-slate-400 font-mono mb-6 bg-slate-100 p-2 rounded break-all">
                    {error.message || 'Error desconocido'}
                </p>
                <button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm w-full hover:bg-slate-800 transition-colors"
                >
                    Intentar de nuevo
                </button>
            </div>
        </div>
    )
}
