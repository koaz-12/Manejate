import { Wallet, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { SubmitButton } from '@/components/Common/SubmitButton'
import { resetPassword } from './actions'

export default async function ForgotPasswordPage(props: { searchParams: Promise<{ message?: string; error?: string }> }) {
    const searchParams = await props.searchParams
    const { message, error } = searchParams || {}

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 space-y-8">
                <div className="text-center space-y-2">
                    <div className="bg-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Recuperar Contraseña</h1>
                    <p className="text-slate-500 text-sm">Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.</p>
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

                <form className="space-y-4" action={resetPassword}>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-slate-50 text-slate-900"
                            placeholder="hola@ejemplo.com"
                            autoFocus
                        />
                    </div>

                    <div className="pt-2">
                        <SubmitButton className="w-full py-3.5 rounded-xl" pendingText="Enviando...">
                            Enviar enlace de recuperación
                        </SubmitButton>
                    </div>
                </form>

                <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Volver al login
                </Link>
            </div>
        </div>
    )
}
