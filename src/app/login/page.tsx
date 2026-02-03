import { login, signup } from './actions'
import { Wallet } from 'lucide-react'

interface LoginPageProps {
    searchParams: Promise<{ error?: string; message?: string; next?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
    // Await searchParams as required in Next.js 15+ (though currently 14 compatible too)
    // Depending on Next.js version, searchParams might be a promise. treating it as object for now based on typical 14 usage.
    // If working with latest canaries, await might be needed. Safe to treat as object for 14.
    const params = await Promise.resolve(searchParams);
    const error = params?.error;
    const message = params?.message;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">

            <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 space-y-8">
                <div className="text-center space-y-2">
                    <div className="bg-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Manejate</h1>
                    <p className="text-slate-500">Tu presupuesto, bajo control.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-sm text-center border border-emerald-100">
                        {message}
                    </div>
                )}

                <form className="space-y-4">
                    {/* Preserve 'next' param for redirect after auth */}
                    <input type="hidden" name="next" value={params?.next || '/'} />

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-slate-50 text-slate-900"
                            placeholder="hola@ejemplo.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-slate-700">Contraseña</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-slate-50 text-slate-900"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <button formAction={login} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]">
                            Iniciar Sesión
                        </button>
                        <button formAction={signup} className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl border border-slate-200 transition-all active:scale-[0.98]">
                            Crear Cuenta
                        </button>
                    </div>
                </form>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400 max-w-xs">
                Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad.
            </p>
        </div>
    )
}
