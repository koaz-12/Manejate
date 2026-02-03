'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createGoal(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    const budgetId = formData.get('budgetId') as string
    const name = formData.get('name') as string
    const targetAmount = parseFloat(formData.get('targetAmount') as string)
    const deadline = formData.get('deadline') as string
    const initialAmount = parseFloat(formData.get('initialAmount') as string) || 0

    if (!budgetId || !name || !targetAmount) return { error: 'Faltan campos requeridos' }

    const { data: goal, error } = await supabase
        .from('savings_goals')
        .insert({
            budget_id: budgetId,
            name,
            target_amount: targetAmount,
            current_amount: initialAmount,
            deadline: deadline || null
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating goal:', error)
        return { error: 'Error al crear la meta' }
    }

    // If initial amount > 0, we should probably record it as a transaction too?
    // For simplicity, let's assume initial amount is "already saved" money from before using the app,
    // OR we could force users to start at 0 and "Contribute" to it.
    // Let's stick to 0 or treat initial as just setting the state, checking if user wants a transaction is complex here.
    // Users can use "Contribute" for new money.

    revalidatePath('/goals')
    return { success: true }
}

export async function contributeToGoal(goalId: string, amount: number) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    // 1. Get Goal Details
    const { data: goal } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('id', goalId)
        .single()

    if (!goal) return { error: 'Meta no encontrada' }

    // 2. Find or Create "Ahorros" Category
    // We try to find a category with type 'fixed' (or maybe variable) named 'Ahorros' or created by logic
    // Simplified: Find ANY category used for savings, or create one.
    let { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('budget_id', goal.budget_id)
        .ilike('name', 'Ahorros')
        .single()

    if (!category) {
        const { data: newCat } = await supabase
            .from('categories')
            .insert({
                budget_id: goal.budget_id,
                name: 'Ahorros', // Standardized name
                type: 'fixed',
                budget_limit: 0,
                icon: '🐖'
            })
            .select()
            .single()
        category = newCat
    }

    // 3. Update Goal Amount
    const { error: updateError } = await supabase
        .from('savings_goals')
        .update({ current_amount: Number(goal.current_amount) + amount })
        .eq('id', goalId)

    if (updateError) return { error: 'Error actualizando meta' }

    // 4. Create Transaction
    const { error: txError } = await supabase
        .from('transactions')
        .insert({
            budget_id: goal.budget_id,
            user_id: user.id,
            category_id: category?.id,
            amount: amount,
            description: `Aporte a meta: ${goal.name}`,
            date: new Date().toISOString()
        })

    if (txError) {
        // Rollback? Hard with Supabase without specific RPC or just ignore and warn.
        console.error('Transaction creation failed for savings contribution', txError)
        return { error: 'Aporte registrado pero falló la transacción de gasto.' }
    }

    revalidatePath('/goals')
    revalidatePath('/') // Updates dashboard available balance
    return { success: true }
}
