import { createClient } from '@/lib/supabase/server'

/**
 * Create a notification for a specific user
 */
export async function createNotification({
    userId,
    budgetId,
    type,
    title,
    message,
}: {
    userId: string
    budgetId: string
    type: 'info' | 'success' | 'warning' | 'danger'
    title: string
    message: string
}) {
    const supabase = await createClient()

    const { error } = await supabase.from('notifications').insert({
        user_id: userId,
        budget_id: budgetId,
        type,
        title,
        message,
    })

    if (error) {
        console.error('Error creating notification:', error)
    }
}

/**
 * After a transaction is created, check if any category has exceeded its budget threshold.
 * Generates notifications at 80% (warning) and 100% (danger).
 */
export async function checkBudgetThresholds(budgetId: string, categoryId: string) {
    const supabase = await createClient()

    // Get category info
    const { data: category } = await supabase
        .from('categories')
        .select('id, name, budget_limit, type')
        .eq('id', categoryId)
        .single()

    if (!category || category.budget_limit <= 0 || category.type === 'income') return

    // Get current period spending for this category
    const { data: budget } = await supabase
        .from('budgets')
        .select('cutoff_day')
        .eq('id', budgetId)
        .single()

    if (!budget) return

    // Calculate current period
    const { calculatePeriod } = await import('@/lib/period')
    const { startOfPeriod, endOfPeriod } = calculatePeriod(budget.cutoff_day || 1, new Date())

    const { data: transactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('budget_id', budgetId)
        .eq('category_id', categoryId)
        .gte('date', startOfPeriod.toISOString())
        .lt('date', endOfPeriod.toISOString())

    const totalSpent = transactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0
    const percent = Math.round((totalSpent / category.budget_limit) * 100)

    // Get all budget members to notify
    const { data: members } = await supabase
        .from('budget_members')
        .select('user_id')
        .eq('budget_id', budgetId)

    if (!members || members.length === 0) return

    // Check if we already sent a notification for this threshold this period
    const thresholdKey = percent >= 100 ? 'danger' : percent >= 80 ? 'warning' : null
    if (!thresholdKey) return

    // Check for existing notification this period to avoid duplicates
    const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('budget_id', budgetId)
        .eq('type', thresholdKey)
        .ilike('title', `%${category.name}%`)
        .gte('created_at', startOfPeriod.toISOString())
        .limit(1)

    if (existing && existing.length > 0) return // Already notified

    // Create notifications for all members
    const title = percent >= 100
        ? `¡Límite excedido!`
        : `Alerta de gasto`

    const message = percent >= 100
        ? `Excediste el presupuesto de "${category.name}" (${percent}% gastado).`
        : `Estás al ${percent}% del límite en "${category.name}".`

    for (const member of members) {
        await createNotification({
            userId: member.user_id,
            budgetId,
            type: thresholdKey,
            title,
            message,
        })
    }
}
