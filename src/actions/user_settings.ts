'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserSetting(key: string, value: any) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    const { error } = await supabase
        .from('user_settings')
        .upsert({
            user_id: user.id,
            key,
            value
        }, { onConflict: 'user_id, key' })

    if (error) {
        console.error('Error updating setting:', error)
        return { error: 'Error al guardar preferencia' }
    }

    revalidatePath('/settings')
    revalidatePath('/goals/new') // Where preference is used
    return { success: true }
}
