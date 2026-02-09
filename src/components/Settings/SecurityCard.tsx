'use client'

import { updatePassword } from '@/actions/auth'
import { Lock, Loader2, Check, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export function SecurityCard() {
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setMsg(null)

        const res = await updatePassword(formData)

        if (res?.error) {
            setMsg({ type: 'error', text: res.error })
        } else {
            setMsg({ type: 'success', text: 'Contraseña actualizada correctamente' })
            const form = document.getElementById('password-form') as HTMLFormElement
            form?.reset()
        }
        setLoading(false)
    }

    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                Seguridad
            </h3>

            <form id="password-form" action={handleSubmit} className="space-y-4">
                {msg && (
                    <div className={`p-3 rounded-xl text-sm text-center ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {msg.text}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Current Password */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contraseña Actual</label>
                        <div className="relative">
                            <input
                                name="currentPassword"
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Tu contraseña actual"
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 transition-colors text-slate-800 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nueva Contraseña</label>
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                minLength={6}
                                placeholder="Nueva contraseña"
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 transition-colors text-slate-800"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirmar</label>
                            <input
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                required
                                minLength={6}
                                placeholder="Confirmar nueva"
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 transition-colors text-slate-800"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        disabled={loading}
                        className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Actualizar Contraseña'}
                    </button>
                </div>
            </form>
        </div>
    )
}
