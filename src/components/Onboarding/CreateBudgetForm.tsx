'use client'

import { createBudget } from '@/actions/budget'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export function CreateBudgetForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const result = await createBudget(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            // Success will trigger revalidatePath in server action
            // We can just wait or reload if needed, but revalidate should update the RSC
        }
    }

    return (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
            <div className="text-center space-y-2">
                <div className="text-4xl mb-4">🚀</div>
                <h2 className="text-2xl font-bold text-slate-800">¡Bienvenido a Manejate!</h2>
                <p className="text-slate-500">Para comenzar, crea tu primer Espacio de Presupuesto.</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100">
                    {error}
                </div>
            )}

            <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-slate-700">Nombre del Espacio</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Ej. Casa, Personal, Viaje..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-slate-50 text-slate-900"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="currency" className="text-sm font-medium text-slate-700">Moneda</label>
                    <select
                        id="currency"
                        name="currency"
                        defaultValue="DOP"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-slate-50 text-slate-900"
                    >
                        <option value="DOP">Peso Dominicano (DOP)</option>
                        <option value="USD">Dólar Americano (USD)</option>
                        <option value="MXN">Peso Mexicano (MXN)</option>
                        <option value="EUR">Euro (EUR)</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Creando...
                        </>
                    ) : (
                        'Crear Espacio'
                    )}
                </button>
            </form>
        </div>
    )
}
