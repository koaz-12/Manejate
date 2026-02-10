'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markAllNotificationsAsRead(budgetId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('budget_id', budgetId)
        .eq('read', false)

    if (error) {
        console.error('Error marking notifications as read:', error)
        return { error: 'Error al marcar notificaciones' }
    }

    revalidatePath('/')
    return { success: true }
}

export async function markNotificationAsRead(notificationId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

    if (error) {
        console.error('Error marking notification as read:', error)
        return { error: 'Error al marcar notificación' }
    }

    revalidatePath('/')
    return { success: true }
}

export async function getNotifications(budgetId: string, limit = 20) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('budget_id', budgetId)
        .order('created_at', { ascending: false })
        .limit(limit)

    return data || []
}
