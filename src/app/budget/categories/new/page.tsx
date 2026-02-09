import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { NewCategoryForm } from '@/components/Budget/NewCategoryForm'

export const dynamic = 'force-dynamic'

export default async function NewCategoryPage({ searchParams }: { searchParams: Promise<{ parentId?: string }> }) {
    const params = await Promise.resolve(searchParams)
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get Budget ID from Cookie or Fallback
    const cookieStore = await cookies()
    let budgetId = cookieStore.get('selected_budget')?.value

    if (!budgetId) {
        const { data: membership } = await supabase
            .from('budget_members')
            .select('budget_id')
            .eq('user_id', user.id)
            .limit(1)
            .single()

        budgetId = membership?.budget_id
    }

    if (!budgetId) redirect('/')

    // Fetch Budget Info (Currency)
    const { data: budget } = await supabase
        .from('budgets')
        .select('currency')
        .eq('id', budgetId)
        .single()

    if (!budget) redirect('/')

    // Fetch Categories (For Parent Options)
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('budget_id', budgetId)
        .neq('type', 'income')

    return (
        <div className="min-h-screen bg-slate-50 sm:p-4 pb-0 sm:pb-20">
            <NewCategoryForm
                budgetId={budgetId}
                currency={budget.currency}
                categories={categories || []}
                parentId={params?.parentId}
                isSub={!!params?.parentId}
            />
        </div>
    )
}
