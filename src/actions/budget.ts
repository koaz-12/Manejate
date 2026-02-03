'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const DEFAULT_CATEGORIES = [
    { name: 'Vivienda', type: 'fixed', icon: '🏠', limit: 0 },
    { name: 'Alimentación', type: 'variable', icon: '🍔', limit: 0 },
    { name: 'Transporte', type: 'variable', icon: '🚗', limit: 0 },
    { name: 'Servicios', type: 'fixed', icon: '💡', limit: 0 },
    { name: 'Ocio', type: 'variable', icon: '🎉', limit: 0 },
    { name: 'Salud', type: 'variable', icon: '💊', limit: 0 },
]

export async function createBudget(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'No autorizado' }
    }

    const name = formData.get('name') as string
    const currency = formData.get('currency') as string || 'USD'

    if (!name) {
        return { error: 'El nombre es obligatorio' }
    }

    // 1. Create Budget
    const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .insert({
            name,
            currency,
            created_by: user.id
        })
        .select()
        .single()

    if (budgetError) {
        console.error('Error creating budget:', budgetError)
        return { error: budgetError.message }
    }

    // 2. Add Member (Admin)
    const { error: memberError } = await supabase
        .from('budget_members')
        .insert({
            budget_id: budget.id,
            user_id: user.id,
            role: 'admin'
        })

    if (memberError) {
        console.error('Error adding member:', memberError)
        return { error: 'Error al asignar permisos' }
    }

    // 3. Create Default Categories
    const categoriesToInsert = DEFAULT_CATEGORIES.map(cat => ({
        budget_id: budget.id,
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        budget_limit: cat.limit
    }))

    const { error: catError } = await supabase
        .from('categories')
        .insert(categoriesToInsert)

    if (catError) {
        console.error('Error creating categories:', catError)
        // Non-critical, we can continue
    }

    revalidatePath('/')
    return { success: true }
}
