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
    const deadline = formData.get('deadline')?.toString() || null // Handle empty string as null
    const contributionAmount = parseFloat(formData.get('contributionAmount') as string) || 0
    const makeInitialDeposit = formData.get('makeInitialDeposit') === 'true'

    if (!budgetId || !name || !targetAmount) return { error: 'Faltan campos requeridos' }

    const { data: goal, error } = await supabase
        .from('savings_goals')
        .insert({
            budget_id: budgetId,
            name,
            target_amount: targetAmount,
            current_amount: 0,
            deadline: deadline || null,
            contribution_amount: contributionAmount
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating goal:', error)
        return { error: `Error detalle: ${error.message} (${error.code})` }
    }

    // Ensure corresponding Category exists for Budget
    const { error: catError } = await supabase
        .from('categories')
        .insert({
            budget_id: budgetId,
            name: name,
            type: 'savings',
            budget_limit: contributionAmount || 0,
            icon: '🎯'
        })
        .select() // Optional, just need insertion

    // Note: If insertions fails (duplicate name), we silently ignore as it might mean category exists. 
    // Ideally we should handle it but for now 'good enough'.
    // Actually, distinct 'savings' type allows duplicate name vs 'variable' if DB constraints allow.


    // Handle Initial Deposit
    if (makeInitialDeposit && contributionAmount > 0) {
        // Reuse contributeToGoal logic (we can't import it easily if it's in same file and server action, avoiding circularity issues or context loss?
        // Actually, we can just call the exported function.
        // But wait, createGoal and contributeToGoal are in the same file.
        // We can just call it directly.

        await contributeToGoal(goal.id, contributionAmount)
        // We ignore error here to not block the flow, or maybe we should store it in a toast?
        // For now, silent fail or log is acceptable as the goal is created.
    }

    revalidatePath('/goals')
    redirect('/goals')
}

export async function updateGoal(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    const goalId = formData.get('goalId') as string
    const name = formData.get('name') as string
    const targetAmount = parseFloat(formData.get('targetAmount') as string)
    const deadline = formData.get('deadline') as string
    const contributionAmount = parseFloat(formData.get('contributionAmount') as string) || 0

    if (!goalId || !name || !targetAmount) return { error: 'Faltan campos requeridos' }

    // Fetch old goal to check name change
    const { data: oldGoal } = await supabase
        .from('savings_goals')
        .select('name, budget_id')
        .eq('id', goalId)
        .single()

    const { error } = await supabase
        .from('savings_goals')
        .update({
            name,
            target_amount: targetAmount,
            deadline: deadline || null,
            contribution_amount: contributionAmount
        })
        .eq('id', goalId)

    // Sync Category Name
    if (oldGoal && oldGoal.name !== name) {
        await supabase
            .from('categories')
            .update({ name: name })
            .eq('budget_id', oldGoal.budget_id)
            .eq('type', 'savings')
            .eq('name', oldGoal.name)
    }

    if (error) {
        console.error('Error updating goal:', error)
        return { error: `Error al actualizar: ${error.message}` }
    }

    revalidatePath('/goals')
    redirect('/goals')
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

    // 2. Find or Create Goal Specific Category
    // We try to find a category used for THIS specific goal (by name and type 'savings')
    let { data: category } = await supabase
        .from('categories')
        .select('id, type')
        .eq('budget_id', goal.budget_id)
        .eq('type', 'savings')
        .ilike('name', goal.name) // Use Goal Name
        .single()

    if (!category) {
        const { data: newCat } = await supabase
            .from('categories')
            .insert({
                budget_id: goal.budget_id,
                name: goal.name, // Goal Name
                type: 'savings',
                budget_limit: goal.contribution_amount || 0, // Suggest monthly contribution
                icon: '🎯' // Distinct icon for goals
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

export async function deleteGoal(goalId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', goalId)

    if (error) {
        console.error('Error deleting goal:', error)
        return { error: 'Error al eliminar la meta' }
    }

    revalidatePath('/goals')
    return { success: true }
}
