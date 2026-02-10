import { BottomNav } from '@/components/Layout/BottomNav'
import { MonthSelector } from '@/components/Dashboard/MonthSelector'
import { BudgetHeader } from '@/components/Layout/BudgetHeader'
import { BudgetCategoryList } from '@/components/Budget/BudgetCategoryList'
import { AddCategoryButton } from '@/components/Budget/AddCategoryButton'
import { CollaborationManager } from '@/components/Budget/CollaborationManager'
import { Wallet, Plus } from 'lucide-react'
import Link from 'next/link'
import { getActiveBudgetContext } from '@/lib/budget-helpers'
import { calculatePeriod } from '@/lib/period'
import { getNotifications } from '@/actions/notifications'

export default async function BudgetPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const params = await Promise.resolve(searchParams)
    const { supabase, user, budgets, budget, role, profile } = await getActiveBudgetContext()

    if (!budget) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-6">
                <div className="bg-emerald-100 text-emerald-600 w-20 h-20 rounded-full flex items-center justify-center animate-bounce">
                    <Wallet className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-800">¡Empecemos!</h1>
                    <p className="text-slate-500 max-w-xs mx-auto">
                        No tienes ningún presupuesto activo. Crea uno para comenzar a tomar el control.
                    </p>
                </div>
                <Link
                    href="/budgets/new"
                    className="bg-slate-900 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-slate-200 hover:scale-105 transition-transform flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Crear mi primer presupuesto
                </Link>
            </div>
        )
    }

    // Period calculation
    const cutoffDay = budget.cutoff_day || 1
    const paramDate = params?.date ? new Date(params.date) : new Date()
    const { startOfPeriod, endOfPeriod } = calculatePeriod(cutoffDay, paramDate)

    // Parallel data fetching
    const [
        { data: fullMembers },
        { data: invitations },
        { data: allCategories },
        { data: transactions },
        notifications,
    ] = await Promise.all([
        supabase
            .from('budget_members')
            .select('user_id, role, profiles(display_name, email, avatar_url)')
            .eq('budget_id', budget.id),
        supabase
            .from('invitations')
            .select('*')
            .eq('budget_id', budget.id)
            .gte('expires_at', new Date().toISOString()),
        supabase
            .from('categories')
            .select('*')
            .eq('budget_id', budget.id)
            .neq('type', 'income'),
        supabase
            .from('transactions')
            .select('amount, category_id')
            .eq('budget_id', budget.id)
            .gte('date', startOfPeriod.toISOString())
            .lt('date', endOfPeriod.toISOString()),
        getNotifications(budget.id),
    ])

    const formattedMembers = fullMembers?.map((m: any) => ({
        ...m,
        profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
    }))

    // Build spending map
    const spendingMap = new Map()
    transactions?.forEach(tx => {
        const current = spendingMap.get(tx.category_id) || 0
        spendingMap.set(tx.category_id, current + Number(tx.amount))
    })

    // Build category hierarchy
    const processCategory = (cat: any) => ({
        ...cat,
        spent: spendingMap.get(cat.id) || 0,
        directSpent: spendingMap.get(cat.id) || 0,
        limit: Number(cat.budget_limit) || 0,
        children: [] as any[]
    })

    const categoryMap = new Map()
    const rootCategories: any[] = []

    allCategories?.forEach(cat => {
        categoryMap.set(cat.id, processCategory(cat))
    })

    allCategories?.forEach(originalCat => {
        const cat = categoryMap.get(originalCat.id)
        if (originalCat.parent_id) {
            const parent = categoryMap.get(originalCat.parent_id)
            if (parent) {
                parent.children.push(cat)
            } else {
                rootCategories.push(cat)
            }
        } else {
            rootCategories.push(cat)
        }
    })

    rootCategories.forEach(parent => {
        const childrenSpent = parent.children.reduce((sum: number, child: any) => sum + child.spent, 0)
        parent.spent += childrenSpent
        parent.remaining = parent.limit - parent.spent
        parent.percent = parent.limit > 0 ? (parent.spent / parent.limit) * 100 : 0
        parent.children.sort((a: any, b: any) => b.spent - a.spent)
    })

    const displayCategories = rootCategories
        .filter(c => c.type === 'variable' || c.type === 'fixed' || c.type === 'savings')
        .sort((a, b) => b.limit - a.limit)

    const totalBudgeted = displayCategories.reduce((sum, item) => sum + item.limit, 0)
    const totalSpent = displayCategories.reduce((sum, item) => sum + item.spent, 0)
    const totalRemaining = totalBudgeted - totalSpent

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <BudgetHeader
                budgets={budgets}
                currentBudgetId={budget.id}
                userAvatar={profile?.avatar_url}
                notifications={notifications}
            />

            <MonthSelector cutoffDay={cutoffDay} />

            <main className="px-6 mt-6 space-y-6">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Presupuesto Mensual</h1>
                    <div className="flex gap-2">
                        <CollaborationManager
                            members={formattedMembers || []}
                            invitations={invitations || []}
                            budgetId={budget.id}
                            currentUserId={user.id}
                            currentUserRole={role}
                            variant="compact"
                        />
                        <AddCategoryButton
                            budgetId={budget.id}
                            currency={budget.currency}
                            categories={allCategories || []}
                        />
                    </div>
                </div>

                {/* Overall Status */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-sm text-slate-400 font-medium uppercase tracking-wide">Restante General</p>
                            <h2 className={`text-3xl font-bold ${totalRemaining < 0 ? 'text-red-500' : 'text-slate-800'}`}>
                                {budget.currency} {totalRemaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Presupuestado</p>
                            <p className="font-bold text-slate-600">{budget.currency} {totalBudgeted.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${totalSpent > totalBudgeted ? 'bg-red-500' : 'bg-indigo-500'}`}
                            style={{ width: `${Math.min((totalSpent / totalBudgeted) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                <BudgetCategoryList categories={displayCategories} currency={budget.currency} budgetId={budget.id} />
            </main>
            <BottomNav />
        </div>
    )
}
