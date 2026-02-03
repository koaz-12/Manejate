'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function switchBudget(budgetId: string) {
    const cookieStore = await cookies()
    cookieStore.set('selected_budget', budgetId)
    redirect('/')
}
