import { createClient } from '@/lib/supabase/server'
import { joinBudget } from '@/actions/collaboration'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { JoinButton } from '@/components/Collaboration/JoinButton'
import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react'

interface Props {
    params: Promise<{ token: string }>
}

export default async function JoinPage({ params }: Props) {
    const { token } = await Promise.resolve(params)
    const supabase = await createClient()

    // 1. Get User Session (Required to join)
    const { data: { user } } = await supabase.auth.getUser()

    // 2. Validate Invite (Even before showing UI)
    const { data: invite } = await supabase
        .from('invitations')
        .select('*, budgets(name, created_by)')
        .eq('token', token)
        .gte('expires_at', new Date().toISOString())
        .single()

    if (!invite) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="w-8 h-8" />
                </div>
                <h1 className="text-xl font-bold text-slate-800 mb-2">Invitación Inválida</h1>
                <p className="text-slate-500 mb-8 max-w-xs">
                    Este link ha expirado o no existe. Pídele al administrador que genere uno nuevo.
                </p>
                <Link href="/" className="text-slate-900 font-bold underline">Volver al Inicio</Link>
            </div>
        )
    }

    const budgetName = (invite.budgets as any)?.name || 'un Presupuesto'

    // If user not logged in, prompt to login/register, passing the token as return param? 
    // Or just let them login and they have to click the link again? 
    // Simplest: "Inicia Sesión para unirte" button linking to login.
    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Te invitaron a colaborar</h1>
                <p className="text-slate-500 mb-8 max-w-xs">
                    Únete a <strong>{budgetName}</strong> para gestionar las finanzas juntos.
                </p>

                <div className="w-full max-w-sm space-y-4">
                    <Link
                        href={`/login?next=/join/${token}`}
                        className="block w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg"
                    >
                        Iniciar Sesión
                    </Link>
                    <Link
                        href={`/register?next=/join/${token}`}
                        className="block w-full bg-white text-slate-900 border border-slate-200 font-bold py-4 rounded-2xl"
                    >
                        Crear Cuenta
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-emerald-100 text-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
            </div>

            <h1 className="text-2xl font-bold text-slate-800 mb-2">¡Invitación Encontrada!</h1>
            <p className="text-slate-500 mb-8 max-w-xs">
                Estás a punto de unirte a <strong>{budgetName}</strong> como Editor.
            </p>

            <div className="w-full max-w-sm">
                <JoinButton token={token} budgetName={budgetName} />
                <Link href="/" className="block mt-6 text-sm text-slate-400 font-medium">Cancelar</Link>
            </div>
        </div>
    )
}
