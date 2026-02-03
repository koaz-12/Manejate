import { createClient } from '@/lib/supabase/server'

export async function checkAndGenerateRecurring(budgetId: string) {
    const supabase = await createClient()
    const today = new Date()
    const currentDay = today.getDate()
    const currentMonth = today.getMonth() // 0-11
    const currentYear = today.getFullYear()

    // 1. Get Active Recurring Expenses for this Budget
    const { data: expenses } = await supabase
        .from('recurring_expenses')
        .select('*')
        .eq('budget_id', budgetId)
        .eq('is_active', true)

    if (!expenses || expenses.length === 0) return

    const updates = []

    for (const expense of expenses) {
        // Check local Last Generated Date
        let lastGen = expense.last_generated_date ? new Date(expense.last_generated_date) : null

        // Condition:
        // 1. Last Gen is null OR Last Gen is in a previous month (or previous year)
        // 2. Current Day is >= Expense Day

        let needsGeneration = false

        if (!lastGen) {
            // Never generated. If today >= day_of_month, generate for THIS month.
            // (Assumes we don't backfill past months for simplicity, only start current)
            if (currentDay >= expense.day_of_month) {
                needsGeneration = true
            }
        } else {
            // Already generated at least once.
            // Check if last generation was this month/year.
            const lastGenMonth = lastGen.getMonth()
            const lastGenYear = lastGen.getFullYear()

            if (lastGenYear < currentYear || (lastGenYear === currentYear && lastGenMonth < currentMonth)) {
                // It's a new month. Is it time?
                if (currentDay >= expense.day_of_month) {
                    needsGeneration = true
                }
            }
        }

        if (needsGeneration) {
            // Create Transaction
            const dateStr = today.toISOString().split('T')[0] // Using TODAY as transaction date, or should we use the "Day of Month"? 
            // Better use TODAY so user sees it just happened, OR strict due date?
            // Strict due date is better for history. But if I check on day 10 and it was due day 5, better to date it day 5.
            const dueDate = new Date(currentYear, currentMonth, expense.day_of_month)
            // Adjust for TZ offset if needed, but simplistic YYYY-MM-DD construction:
            const dueDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(expense.day_of_month).padStart(2, '0')}`

            const { error: txError } = await supabase
                .from('transactions')
                .insert({
                    budget_id: budgetId,
                    category_id: expense.category_id,
                    amount: expense.amount, // Expense is typically positive amount in DB or depends on schema? 
                    // In transactions table, expense is positive amount usually, type handled by category? 
                    // Let's check transaction schema. Usually amount is stored, and category determines type.
                    description: `[Auto] ${expense.description}`,
                    date: dueDateStr
                })

            if (!txError) {
                // Update Last Generated Date
                await supabase
                    .from('recurring_expenses')
                    .update({ last_generated_date: dueDateStr })
                    .eq('id', expense.id)
            } else {
                console.error('Failed to generate recurring tx:', txError)
            }
        }
    }
}
