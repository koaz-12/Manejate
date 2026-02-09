'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    const displayName = formData.get('displayName') as string
    const avatarUrl = formData.get('avatarUrl') as string

    if (!displayName) return { error: 'El nombre es requerido' }

    const updates: any = { display_name: displayName }
    if (avatarUrl) updates.avatar_url = avatarUrl

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        return { error: 'Error al actualizar el perfil' }
    }

    revalidatePath('/', 'layout') // Refresh header everywhere
    return { success: true }
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!password || password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres' }
    if (password !== confirmPassword) return { error: 'Las contraseñas no coinciden' }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        console.error('Error updating password:', error)
        return { error: 'Error al actualizar la contraseña' }
    }

    return { success: true }
}
