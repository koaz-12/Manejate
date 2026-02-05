import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/Layout/BottomNav'
import { Plus, Target, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { GoalCard } from '@/components/Goals/GoalCard'
import { BudgetHeader } from '@/components/Layout/BudgetHeader'

export default async function GoalsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get ALL User's Budgets
    const { data: memberships } = await supabase
        .from('budget_members')
        .select('budgets(*)')
        .eq('user_id', user.id);

    const budgets = memberships?.map((m: any) => m.budgets) || [];

    if (budgets.length === 0) return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
            <div className="text-center">
                <p className="text-slate-500 mb-4">No tienes presupuestos activos.</p>
                <Link href="/" className="text-emerald-600 font-bold hover:underline">Ir al Inicio</Link>
            </div>
            <BottomNav />
        </div>
    );

    // Determine Current Budget
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const selectedId = cookieStore.get('selected_budget')?.value;

    let budget = budgets.find((b: any) => b.id === selectedId);
    if (!budget) {
        budget = budgets[0];
    }

    // Fetch User Profile for Header
    const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

    // Fetch Goals
    const { data: goals } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('budget_id', budget.id)
        .order('created_at', { ascending: false })

    const totalSaved = goals?.reduce((sum, g) => sum + Number(g.current_amount), 0) || 0

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <BudgetHeader
                budgets={budgets}
                currentBudgetId={budget.id}
                userAvatar={profile?.avatar_url}
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
                <div className="bg-[#52D1DC] p-6 rounded-3xl shadow-lg text-white relative overflow-hidden">
                    {/* Decorative Circles */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1 opacity-90">
                            <Target className="w-5 h-5" />
                            <span className="text-sm font-medium">Ahorro Total</span>
                        </div>
                        <h2 className="text-4xl font-bold mb-2">
                            {budget.currency === 'USD' ? '$' : budget.currency} {totalSaved.toLocaleString()}
                        </h2>
                        <p className="text-sm opacity-80">
                            Has acumulado esto entre todas tus metas.
                        </p>
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
