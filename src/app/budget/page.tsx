import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/Layout/BottomNav'
import { MonthSelector } from '@/components/Dashboard/MonthSelector'
import { AlertCircle, CheckCircle2, Users } from 'lucide-react'
import { cookies } from 'next/headers'
import { CollaborationManager } from '@/components/Budget/CollaborationManager'
import { BudgetHeader } from '@/components/Layout/BudgetHeader'

export default async function BudgetPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const params = await Promise.resolve(searchParams)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 1. Get Selected Budget (copied logic from home)
    const cookieStore = await cookies()
    const selectedId = cookieStore.get('selected_budget')?.value

    const { data: userMemberships } = await supabase
        .from('budget_members')
        .select('budgets(*)')
        .eq('user_id', user.id)

    const budgets = userMemberships?.map(m => m.budgets as any) || []
    let budget = budgets.find((b: any) => b?.id === selectedId) || budgets[0]

    if (!budget) return <div className="p-6">No tienes presupuestos.</div>

    // Fetch Full Members List for Collaboration Manager
    const { data: fullMembers } = await supabase
        .from('budget_members')
        .select('user_id, role, profiles(display_name, email, avatar_url)')
        .eq('budget_id', budget.id)

    const formattedMembers = fullMembers?.map((m: any) => ({
        ...m,
        profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
    }))

    // Fetch Active Invitations
    const { data: invitations } = await supabase
        .from('invitations')
        .select('*')
        .eq('budget_id', budget.id)
        .gte('expires_at', new Date().toISOString())

    // Fetch User Profile for Header

    // Fetch User Profile for Header
    const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

    // 2. Date Logic
    const cutoffDay = budget.cutoff_day || 1
    const paramDate = params?.date ? new Date(params.date) : new Date()
    // ... reused logic for start/end period ...
    const referenceDay = paramDate.getDate()
    let startOfPeriod = new Date(paramDate)
    let endOfPeriod = new Date(paramDate)

    if (referenceDay >= cutoffDay) {
        startOfPeriod.setDate(cutoffDay); startOfPeriod.setHours(0, 0, 0, 0)
        endOfPeriod.setMonth(endOfPeriod.getMonth() + 1); endOfPeriod.setDate(cutoffDay); endOfPeriod.setHours(0, 0, 0, 0)
    } else {
        startOfPeriod.setMonth(startOfPeriod.getMonth() - 1); startOfPeriod.setDate(cutoffDay); startOfPeriod.setHours(0, 0, 0, 0)
        endOfPeriod.setDate(cutoffDay); endOfPeriod.setHours(0, 0, 0, 0)
    }

    // 3. Fetch Data
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('budget_id', budget.id)
        .eq('type', 'variable') // Only variables usually have limits? Or Fixed too? Fixed are limits themselves. Let's fetch all except income.
        .neq('type', 'income')
        .order('budget_limit', { ascending: false })

    const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, category_id')
        .eq('budget_id', budget.id)
        .gte('date', startOfPeriod.toISOString())
        .lt('date', endOfPeriod.toISOString())

    // 4. Transform Data
    const spendingMap = new Map()
    transactions?.forEach(tx => {
        const current = spendingMap.get(tx.category_id) || 0
        spendingMap.set(tx.category_id, current + Number(tx.amount))
    })

    const budgetItems = categories?.map(cat => {
        const spent = spendingMap.get(cat.id) || 0
        const limit = Number(cat.budget_limit) || 0
        const percent = limit > 0 ? (spent / limit) * 100 : 0
        const remaining = limit - spent
        return { ...cat, spent, limit, percent, remaining }
    }) || []

    const totalBudgeted = budgetItems.reduce((sum, item) => sum + item.limit, 0)
    const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0)
    const totalRemaining = totalBudgeted - totalSpent

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <BudgetHeader
                budgets={budgets}
                currentBudgetId={budget.id}
                userAvatar={profile?.avatar_url}
            />

            <MonthSelector cutoffDay={cutoffDay} />

            <main className="px-6 mt-6 space-y-6">

                <div className="mb-2">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Presupuesto Mensual</h1>
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
                    {/* Progress Bar */}
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${totalSpent > totalBudgeted ? 'bg-red-500' : 'bg-indigo-500'}`}
                            style={{ width: `${Math.min((totalSpent / totalBudgeted) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Categories Breakdown */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 text-lg">Desglose por Categoría</h3>

                    {budgetItems.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl">
                                    {item.icon || '🏷️'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h4 className="font-bold text-slate-800">{item.name}</h4>
                                        <span className={`text-sm font-bold ${item.remaining < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {item.remaining < 0 ? '-' : ''}{budget.currency} {Math.abs(item.remaining).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                                        <span>Gasto: {budget.currency} {item.spent.toLocaleString()}</span>
                                        <span>Límite: {budget.currency} {item.limit.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Mini Progress */}
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${item.percent > 100 ? 'bg-red-500' : item.percent > 80 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                    style={{ width: `${Math.min(item.percent, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}

                    {budgetItems.length === 0 && (
                        <p className="text-center text-slate-400 py-8">
                            No tienes categorías de gastos configuradas.
                            <br />
                            Ve a <a href="/settings" className="text-indigo-600 font-bold">Ajustes</a> para crearlas.
                        </p>
                    )}
                </div>

                {/* Collaboration Shortcuts */}
                <CollaborationManager
                    members={formattedMembers || []}
                    invitations={invitations || []}
                    budgetId={budget.id}
                    currentUserId={user.id}
                />

            </main>
            <BottomNav />
        </div>
    )
}
