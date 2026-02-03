'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateBudgetSettings(formData: FormData) {
    const supabase = await createClient()

    const budgetId = formData.get('budgetId') as string
    const name = formData.get('name') as string
    const cutoffDay = parseInt(formData.get('cutoffDay') as string)

    if (!budgetId) return { error: 'ID de presupuesto requerido' }
    if (cutoffDay < 1 || cutoffDay > 31) return { error: 'Día de corte inválido (1-31)' }

    const { error } = await supabase
        .from('budgets')
        .update({ name, cutoff_day: cutoffDay })
        .eq('id', budgetId)

    if (error) {
        console.error('Error updating budget:', error)
        return { error: 'Error al actualizar configuración' }
    }

    revalidatePath('/settings')
    revalidatePath('/')
    return { success: true }
}

export async function updateCategory(formData: FormData) {
    const supabase = await createClient()

    const categoryId = formData.get('categoryId') as string
    const name = formData.get('name') as string
    const limit = parseFloat(formData.get('limit') as string)
    const icon = formData.get('icon') as string

    const { error } = await supabase
        .from('categories')
        .update({
            name,
            budget_limit: limit,
            icon
        })
        .eq('id', categoryId)

    if (error) {
        console.error('Category update error:', error)
        return { error: 'Error al actualizar categoría' }
    }

    revalidatePath('/settings')
    return { success: true }
}

export async function createCategory(formData: FormData) {
    const supabase = await createClient()

    const budgetId = formData.get('budgetId') as string
    const name = formData.get('name') as string
    const type = formData.get('type') as string // 'fixed', 'variable', 'income'
    const limit = parseFloat(formData.get('limit') as string) || 0
    const icon = formData.get('icon') as string || '🏷️'

    if (!budgetId || !name || !type) return { error: 'Missing required fields' }

    const { error } = await supabase
        .from('categories')
        .insert({
            budget_id: budgetId,
            name,
            type,
            budget_limit: limit,
            icon
        })

    if (error) {
        console.error('Create category error:', error)
        return { error: 'Error al crear categoría' }
    }

    revalidatePath('/settings')
    return { success: true }
}
