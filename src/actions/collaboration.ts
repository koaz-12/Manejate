'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

export async function createInviteLink(budgetId: string, role: 'editor' | 'viewer' = 'editor') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    // Check permissions (Only admins can invite ideally, or editors too? Let's say both)
    const { data: member } = await supabase
        .from('budget_members')
        .select('role')
        .eq('budget_id', budgetId)
        .eq('user_id', user.id)
        .single()

    if (!member || (member.role !== 'admin' && member.role !== 'editor')) {
        return { error: 'No tienes permisos para invitar' }
    }

    // Create Invite
    const token = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { error } = await supabase
        .from('invitations')
        .insert({
            budget_id: budgetId,
            token,
            created_by: user.id,
            expires_at: expiresAt.toISOString(),
            role // Store the role
        })

    if (error) {
        console.error("Invite creation failed", error)
        return { error: 'Error al crear la invitación' }
    }

    return { success: true, url: `/join/${token}` }
}

export async function joinBudget(token: string) {
    const supabase = await createClient()

    // 1. Auth Check - User MUST be logged in to join
    // If not logged in, we should redirect to login with a specific "next" param?
    // Handled in the Page component usually, but action needs auth.
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Debes iniciar sesión para unirte', redirectToLogin: true }

    // 2. Validate Token
    const { data: invite } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .gte('expires_at', new Date().toISOString())
        .single()

    if (!invite) return { error: 'Invitación inválida o expirada' }

    // 3. Check if already member
    const { data: existingMember } = await supabase
        .from('budget_members')
        .select('*')
        .eq('budget_id', invite.budget_id)
        .eq('user_id', user.id)
        .single()

    if (existingMember) {
        return { success: true, message: 'Ya eres miembro de este presupuesto' }
    }

    // 4. Add Member
    const role = invite.role || 'editor' // Fallback for old invites

    const { error: joinError } = await supabase
        .from('budget_members')
        .insert({
            budget_id: invite.budget_id,
            user_id: user.id,
            role: role
        })

    if (joinError) return { error: 'Error al unirte al grupo' }

    revalidatePath('/')
    return { success: true }
}

export async function removeMember(budgetId: string, userIdToRemove: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    // 1. Check if requester is Admin
    const { data: requester } = await supabase
        .from('budget_members')
        .select('role')
        .eq('budget_id', budgetId)
        .eq('user_id', user.id)
        .single()

    // Only Admin can remove others. Anyone can remove themselves (Leave).
    if (requester?.role !== 'admin' && user.id !== userIdToRemove) {
        return { error: 'Solo el administrador puede eliminar miembros' }
    }

    const { error } = await supabase
        .from('budget_members')
        .delete()
        .eq('budget_id', budgetId)
        .eq('user_id', userIdToRemove)

    if (error) {
        return { error: 'Error al eliminar miembro' }
    }

    revalidatePath('/settings')
    return { success: true }
}
