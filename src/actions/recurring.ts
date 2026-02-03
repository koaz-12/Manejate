'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper to calculate date ranges based on Cutoff Day
function getCycleDates(cutoffDay: number, referenceDate: Date = new Date()) {
    const currentDay = referenceDate.getDate();
    let startOfCurrent = new Date(referenceDate);
    let startOfPrevious = new Date(referenceDate);

    if (currentDay >= cutoffDay) {
        // Current cycle started this month
        startOfCurrent.setDate(cutoffDay);
        startOfCurrent.setHours(0, 0, 0, 0);

        // Previous cycle started last month
        startOfPrevious.setMonth(startOfPrevious.getMonth() - 1);
        startOfPrevious.setDate(cutoffDay);
        startOfPrevious.setHours(0, 0, 0, 0);
    } else {
        // Current cycle started last month
        startOfCurrent.setMonth(startOfCurrent.getMonth() - 1);
        startOfCurrent.setDate(cutoffDay);
        startOfCurrent.setHours(0, 0, 0, 0);

        // Previous cycle started 2 months ago
        startOfPrevious.setMonth(startOfPrevious.getMonth() - 2);
        startOfPrevious.setDate(cutoffDay);
        startOfPrevious.setHours(0, 0, 0, 0);
    }

    // End of previous is Start of current - 1ms
    const endOfPrevious = new Date(startOfCurrent);
    endOfPrevious.setTime(endOfPrevious.getTime() - 1);

    return { startOfCurrent, startOfPrevious, endOfPrevious };
}

export async function checkRecurringExpenses(budgetId: string, cutoffDay: number) {
    const supabase = await createClient();
    const { startOfCurrent, startOfPrevious, endOfPrevious } = getCycleDates(cutoffDay);

    // 1. Get Recurring expenses from PREVIOUS cycle
    const { data: previousRecurring } = await supabase
        .from('transactions')
        .select('*')
        .eq('budget_id', budgetId)
        .eq('is_recurring', true)
        .gte('date', startOfPrevious.toISOString())
        .lte('date', endOfPrevious.toISOString());

    if (!previousRecurring || previousRecurring.length === 0) {
        return { count: 0, expenses: [] };
    }

    // 2. Get Recurring expenses already added in CURRENT cycle
    // We match by description/amount roughly, or just check if ANY recurring exists?
    // Better: Check if we have likely candidates. For now, simple check:
    // If we have "Internet" in prev, do we have "Internet" in current?

    const { data: currentRecurring } = await supabase
        .from('transactions')
        .select('description, amount')
        .eq('budget_id', budgetId)
        .gte('date', startOfCurrent.toISOString());

    const missingExpenses = previousRecurring.filter(prev => {
        // Check if there's a match in current
        const exists = currentRecurring?.some(curr =>
            curr.description === prev.description &&
            Math.abs(curr.amount - prev.amount) < 0.01 // float tolerance
        );
        return !exists;
    });

    return {
        count: missingExpenses.length,
        expenses: missingExpenses
    };
}

export async function copyRecurringExpenses(expensesToCopy: any[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const today = new Date().toISOString().split('T')[0];

    const newTransactions = expensesToCopy.map(ex => ({
        budget_id: ex.budget_id,
        user_id: user.id, // Current user triggers the copy
        category_id: ex.category_id,
        amount: ex.amount,
        description: ex.description,
        date: today, // Copied as of today
        is_recurring: true // Keep them recurring for next month
    }));

    const { error } = await supabase
        .from('transactions')
        .insert(newTransactions);

    if (error) {
        console.error("Error Copying:", error);
        return { error: 'Error al copiar gastos' };
    }

    revalidatePath('/');
    return { success: true };
}
