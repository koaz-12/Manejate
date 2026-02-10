import { BottomNav } from '@/components/Layout/BottomNav'
import { Plus, Target } from 'lucide-react'
import Link from 'next/link'
import { GoalCard } from '@/components/Goals/GoalCard'
import { BudgetHeader } from '@/components/Layout/BudgetHeader'
import { getActiveBudgetContext } from '@/lib/budget-helpers'
import { getNotifications } from '@/actions/notifications'

export default async function GoalsPage() {
    const { supabase, budgets, budget, profile } = await getActiveBudgetContext()

    if (!budget) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
                <div className="text-center">
                    <p className="text-slate-500 mb-4">No tienes presupuestos activos.</p>
                    <Link href="/" className="text-emerald-600 font-bold hover:underline">Ir al Inicio</Link>
                </div>
                <BottomNav />
            </div>
        )
    }

    const { data: goals } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('budget_id', budget.id)
        .order('created_at', { ascending: false })

    const [notifications] = await Promise.all([
        getNotifications(budget.id),
    ])

    const totalSaved = goals?.reduce((sum, g) => sum + Number(g.current_amount), 0) || 0

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <BudgetHeader
                budgets={budgets}
                currentBudgetId={budget.id}
                userAvatar={profile?.avatar_url}
                notifications={notifications}
            />

            <main className="px-6 mt-6 space-y-6">

                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Metas de Ahorro</h1>
                    <Link href="/goals/new" className="text-white bg-slate-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95">
                        <Plus className="w-4 h-4" />
                        Nueva Meta
                    </Link>
                </div>

                {/* Total Saved Summary Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-sky-500 p-8 rounded-[2rem] shadow-xl shadow-indigo-200 text-white relative overflow-hidden group">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-800/20 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                                <Target className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-bold tracking-wider uppercase">Ahorro Total</span>
                        </div>
                        <h2 className="text-5xl font-black mb-3 tracking-tight">
                            {budget.currency === 'USD' ? '$' : budget.currency} {totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h2>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium border border-white/10">
                            <span>🚀</span>
                            <span>Sigue así, ¡vas muy bien!</span>
                        </div>
                    </div>
                </div>

                {/* Goals List */}
                <div className="space-y-4">
                    {goals && goals.length > 0 ? (
                        goals.map((goal) => (
                            <GoalCard key={goal.id} goal={goal} currency={budget.currency} />
                        ))
                    ) : (
                        <div className="text-center py-12 px-6">
                            <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Target className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Sin metas aún</h3>
                            <p className="text-slate-500 mb-6">Define un objetivo (viaje, auto, emergencia) y empieza a guardar dinero.</p>
                            <Link href="/goals/new" className="inline-block bg-slate-900 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-slate-200">
                                Crear mi primera meta
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            <BottomNav />
        </div>
    )
}
