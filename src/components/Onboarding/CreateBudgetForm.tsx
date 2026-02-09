'use client'

import { createBudget } from '@/actions/budget'
import { useState } from 'react'
import { Loader2, Building, Globe, ChevronDown, Check, Sparkles } from 'lucide-react'

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
        }
    }

    return (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-sm">
                    <Sparkles className="w-8 h-8 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">¡Bienvenido a Manejate!</h2>
                <p className="text-slate-500 font-medium">Crea tu primer Espacio para comenzar.</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm text-center border border-red-100 font-bold">
                    {error}
                </div>
            )}

            <form action={handleSubmit} className="space-y-6">

                {/* Main Card */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">

                    {/* Hero Section: Name */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 pb-10 text-center">
                        <label className="text-xs font-bold uppercase tracking-wider text-indigo-900/40 mb-2 block flex items-center justify-center gap-1">
                            <Building className="w-3 h-3" />
                            Nombre del Espacio
                        </label>
                        <div className="relative inline-flex items-center justify-center w-full">
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                placeholder="Ej. Casa"
                                className="text-5xl sm:text-6xl font-black text-center w-full bg-transparent outline-none placeholder:text-indigo-900/10 text-indigo-800"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                        <div className="space-y-1">
                            <label htmlFor="currency" className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">Moneda Principal</label>
                            <div className="relative">
                                <div className="absolute left-4 top-4 text-slate-400 pointer-events-none">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <select
                                    id="currency"
                                    name="currency"
                                    defaultValue="DOP"
                                    className="w-full pl-11 pr-10 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="DOP">🇩🇴 Peso Dominicano (DOP)</option>
                                    <option value="USD">🇺🇸 Dólar Americano (USD)</option>
                                    <option value="MXN">🇲🇽 Peso Mexicano (MXN)</option>
                                    <option value="EUR">🇪🇺 Euro (EUR)</option>
                                </select>
                                <div className="absolute right-4 top-4 text-slate-400 pointer-events-none">
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creando...
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                Crear Espacio
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
