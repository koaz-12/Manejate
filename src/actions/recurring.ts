'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addRecurringExpense(formData: FormData) {
    const supabase = await createClient()

    const description = formData.get('description') as string
    const amount = Number(formData.get('amount'))
    const dayOfMonth = Number(formData.get('dayOfMonth'))
    const categoryId = formData.get('categoryId') as string
    const budgetId = formData.get('budgetId') as string

    if (!description || !amount || !dayOfMonth || !categoryId || !budgetId) {
        return { error: 'Faltan campos requeridos' }
    }

    const { error } = await supabase
        .from('recurring_expenses')
        .insert({
            description,
            amount,
            day_of_month: dayOfMonth,
            category_id: categoryId,
            budget_id: budgetId,
            is_active: true
        })

    if (error) {
        console.error('Error adding recurring expense:', error)
        return { error: 'Error al crear el gasto recurrente' }
    }

    revalidatePath('/settings')
    return { success: true }
}

export async function toggleRecurringExpense(id: string, currentState: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('recurring_expenses')
        .update({ is_active: !currentState })
        .eq('id', id)

    if (error) return { error: 'Error modifying state' }

    revalidatePath('/settings')
    return { success: true }
}

export async function deleteRecurringExpense(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('recurring_expenses')
        .delete()
        .eq('id', id)

    if (error) return { error: 'Error deleting' }

    revalidatePath('/settings')
    return { success: true }
}
