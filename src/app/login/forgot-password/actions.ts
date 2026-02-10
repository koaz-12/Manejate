'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function resetPassword(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string

    if (!email) {
        redirect('/login/forgot-password?error=Por favor ingresa tu email')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/login`,
    })

    if (error) {
        redirect(`/login/forgot-password?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/login/forgot-password?message=Revisa tu bandeja de entrada. Te enviamos un enlace para restablecer tu contraseña.')
}
