import { createClient } from '@/lib/supabase/server'
import { calculatePeriod } from '@/lib/period'

/**
 * Fetch monthly spending/income totals for the last N months,
 * using the budget's cutoff_day for period boundaries.
 */
export async function getMonthlyTrends(budgetId: string, cutoffDay: number, months: number = 6) {
    const supabase = await createClient()

    const now = new Date()
    const results: { month: string; spent: number; income: number }[] = []

    // Build date ranges for each month going back
    for (let i = months - 1; i >= 0; i--) {
        const refDate = new Date(now.getFullYear(), now.getMonth() - i, 15)
        const { startOfPeriod, endOfPeriod } = calculatePeriod(cutoffDay, refDate)

        const { data: transactions } = await supabase
            .from('transactions')
            .select('amount, category_id, categories(type)')
            .eq('budget_id', budgetId)
            .gte('date', startOfPeriod.toISOString())
            .lt('date', endOfPeriod.toISOString())

        let spent = 0
        let income = 0

        transactions?.forEach((tx: any) => {
            const amount = Number(tx.amount)
            if (tx.categories?.type === 'income') {
                income += amount
            } else {
                spent += amount
            }
        })

        const monthLabel = refDate.toLocaleDateString('es', { month: 'short' }).replace('.', '')
        results.push({ month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1), spent, income })
    }

    return results
}
