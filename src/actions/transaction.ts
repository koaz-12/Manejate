'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addTransaction(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'No autorizado' }
    }

    const amount = parseFloat(formData.get('amount') as string)
    const description = formData.get('description') as string
    const categoryId = formData.get('categoryId') as string
    const date = formData.get('date') as string
    const budgetId = formData.get('budgetId') as string

    if (!amount || isNaN(amount)) {
        return { error: 'El monto es inválido' }
    }
    if (!categoryId) {
        return { error: 'Selecciona una categoría' }
    }
    if (!date) {
        return { error: 'Selecciona una fecha' }
    }

    // Verify membership (Optional but safer)
    // RLS will block it anyway if policies are correct, but good for custom error

    const { error } = await supabase
        .from('transactions')
        .insert({
            budget_id: budgetId,
            user_id: user.id,
            category_id: categoryId,
            amount: amount, // Assuming expenses are positive numbers in DB for now, or front-end sends negative? 
            // Let's store as positive number and treat as expense by context/category type.
            description,
            date,
            is_recurring: formData.get('isRecurring') === 'on'
        })

    if (error) {
        console.error('Error adding transaction:', error)
        return { error: error.message }
    }


    revalidatePath('/')
    revalidatePath('/transactions')
    redirect('/')
}

export async function updateTransaction(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    const transactionId = formData.get('transactionId') as string
    const amount = parseFloat(formData.get('amount') as string)
    const description = formData.get('description') as string
    const categoryId = formData.get('categoryId') as string
    const date = formData.get('date') as string
    const budgetId = formData.get('budgetId') as string
    const isRecurring = formData.get('isRecurring') === 'on'

    if (!amount || isNaN(amount)) return { error: 'Monto inválido' }

    const { error } = await supabase
        .from('transactions')
        .update({
            amount,
            description,
            category_id: categoryId,
            date,
            is_recurring: isRecurring
        })
        .eq('id', transactionId)
        .eq('budget_id', budgetId) // Extra safety

    if (error) {
        console.error('Update error:', error)
        return { error: 'Error al actualizar' }
    }

    revalidatePath('/')
    revalidatePath('/transactions')
    redirect('/transactions')
}

export async function deleteTransaction(transactionId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)

    if (error) {
        return { error: 'Error al eliminar' }
    }

    revalidatePath('/')
    revalidatePath('/transactions')
    return { success: true }
}
