import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/Layout/BottomNav'
import { MonthSelector } from '@/components/Dashboard/MonthSelector'
import { AlertCircle, CheckCircle2, Users } from 'lucide-react'
import { cookies } from 'next/headers'
import { CollaborationManager } from '@/components/Budget/CollaborationManager'
import { BudgetHeader } from '@/components/Layout/BudgetHeader'
import { BudgetCategoryList } from '@/components/Budget/BudgetCategoryList'
import { AddCategoryButton } from '@/components/Budget/AddCategoryButton'
import { Wallet, Plus } from 'lucide-react'
import Link from 'next/link'

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
        .select('role, budgets(*)')
        .eq('user_id', user.id)

    const budgets = userMemberships?.map(m => m.budgets as any) || []
    let budget = budgets.find((b: any) => b?.id === selectedId) || budgets[0]

    const activeMember = userMemberships?.find((m: any) => m.budgets.id === budget?.id)
    const currentUserRole = activeMember?.role || 'viewer'

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

    // Fetch Full Members List for Collaboration Manager
    const { data: fullMembers } = await supabase
        .from('budget_members')
        .select('user_id, role, profiles(display_name, email, avatar_url)')
        .eq('budget_id', budget.id)

    // Debugging RLS:
    console.log('Fetched Members for Budget:', budget.id, fullMembers?.length)

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
    const { data: allCategories } = await supabase
        .from('categories')
        .select('*')
        .eq('budget_id', budget.id)
        .neq('type', 'income') // Get all expenses (Fixed & Variable)
    // We will sort later manually

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

    // Helper to process category stats
    const processCategory = (cat: any) => {
        const directSpent = spendingMap.get(cat.id) || 0
        const limit = Number(cat.budget_limit) || 0
        return {
            ...cat,
            spent: directSpent, // Initial value, will be rolled up
            directSpent,
            limit,
            children: [] as any[]
        }
    }

    // Build Hierarchy & Rollup
    const categoryMap = new Map()
    const rootCategories: any[] = []

    // first pass: create objects
    allCategories?.forEach(cat => {
        categoryMap.set(cat.id, processCategory(cat))
    })

    // second pass: link children and ROLLUP spending
    allCategories?.forEach(originalCat => {
        const cat = categoryMap.get(originalCat.id)
        if (originalCat.parent_id) {
            const parent = categoryMap.get(originalCat.parent_id)
            if (parent) {
                parent.children.push(cat)
                // Rollup Logic: Add child spending to parent
                // Note: This simple loop works because we assume only 1 level of depth for now.
                // If unlimited depth, we'd need recursion.
            } else {
                rootCategories.push(cat) // Orphan? Treat as root
            }
        } else {
            rootCategories.push(cat)
        }
    })

    // third pass: Final sums for parents (since we pushed children, now we settle totals)
    rootCategories.forEach(parent => {
        // Parent's total spent = Direct + Children's Spent
        const childrenSpent = parent.children.reduce((sum: number, child: any) => sum + child.spent, 0)
        parent.spent += childrenSpent

        parent.remaining = parent.limit - parent.spent
        parent.percent = parent.limit > 0 ? (parent.spent / parent.limit) * 100 : 0

        // Sort children by spent descending
        parent.children.sort((a: any, b: any) => b.spent - a.spent)
    })

    // Filter Logic: We generally want to show Variable expenses here, 
    // but user might want to see Fixed too in "Monthly Budget"?
    // User context implies "Variable" management mostly, but let's stick to what we had (Variable only?)
    // Actually, previously we filtered `.eq('type', 'variable')`. Let's keep that focus for the main list,
    // OR show all expenses because "Presupuesto Mensual" usually implies everything.
    // Let's filter roots by 'variable' to match previous behavior, but keep 'fixed' if requested.
    // Given the prompt "subcategories inside category", let's show all that match structure.

    // Let's filter to show only Root Categories that are 'variable' OR have children that are 'variable'?
    // Simple approach: Show all root variable categories for now.
    const displayCategories = rootCategories
        .filter(c => c.type === 'variable' || c.type === 'fixed' || c.type === 'savings')
        .sort((a, b) => b.limit - a.limit)

    // Global Totals (based on filtered list + others? No, global status should be REAL total)
    // We should calculate global total based on ALL expenses (Fixed + Variable) to vary "Available" correctly?
    // Previously we calculated based on the list shown. Let's stick to consistent view.
    // Wait, "Total Budgeted" was sum of limits. "Total Spent" sum of spent.

    const totalBudgeted = displayCategories.reduce((sum, item) => sum + item.limit, 0)
    const totalSpent = displayCategories.reduce((sum, item) => sum + item.spent, 0) // Includes rollup
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


                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Presupuesto Mensual</h1>
                    <div className="flex gap-2">
                        <CollaborationManager
                            members={formattedMembers || []}
                            invitations={invitations || []}
                            budgetId={budget.id}
                            currentUserId={user.id}
                            currentUserRole={currentUserRole}
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
                    {/* Progress Bar */}
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${totalSpent > totalBudgeted ? 'bg-red-500' : 'bg-indigo-500'}`}
                            style={{ width: `${Math.min((totalSpent / totalBudgeted) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                {/* New Hierarchical Category List */}
                <BudgetCategoryList categories={displayCategories} currency={budget.currency} budgetId={budget.id} />

            </main>
            <BottomNav />
        </div>
    )


}
