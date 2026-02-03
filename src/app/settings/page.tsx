import { BottomNav } from '@/components/Layout/BottomNav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BudgetSettingsForm } from '@/components/Settings/BudgetSettingsForm';
import { CategoryList } from '@/components/Settings/CategoryList'
import { InviteLink } from '@/components/Settings/InviteLink';
import { MemberList } from '@/components/Settings/MemberList';
import { PendingInvites } from '@/components/Settings/PendingInvites';
import { RecurringExpensesList } from '@/components/Settings/RecurringExpensesList';

export default async function SettingsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch All Memberships
    const { data: memberships } = await supabase
        .from('budget_members')
        .select('role, budgets(*)')
        .eq('user_id', user.id)

    // Determine Active Budget from Cookie or Default
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const selectedId = cookieStore.get('selected_budget')?.value

    const activeMembership = memberships?.find((m: any) => m.budgets.id === selectedId) || memberships?.[0]
    const budget = activeMembership?.budgets as any

    if (!budget) redirect('/');

    // Fetch Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('budget_id', budget.id)
        .order('type', { ascending: true }); // Fixed first, then Variable? Or by Name.
    // Fetch Full Members List for UI
    const { data: fullMembers } = await supabase
        .from('budget_members')
        .select('user_id, role, profiles(display_name, email, avatar_url)')
        .eq('budget_id', budget.id)

    // Transform data to match MemberList type (profiles comes as array from simple join sometimes, or just ensure type safety)
    const formattedMembers = fullMembers?.map((m: any) => ({
        ...m,
        profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
    }))

    // Fetch Active Invitations
    const { data: invitations } = await supabase
        .from('invitations')
        .select('*')
        .eq('budget_id', budget.id)
        .gte('expires_at', new Date().toISOString()) // Only active ones

    // Fetch Recurring Expenses
    const { data: recurringExpenses } = await supabase
        .from('recurring_expenses')
        .select('*')
        .eq('budget_id', budget.id)
        .order('day_of_month', { ascending: true })

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <header className="px-5 py-3 bg-white sticky top-0 z-40 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border-b border-slate-50">
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">Ajustes</h1>
                <p className="text-slate-400 text-xs mt-0.5">Configura tu espacio</p>
            </header>

            <main className="px-6 mt-6 space-y-8">

                {/* Recurring Expenses Section */}
                <RecurringExpensesList
                    expenses={recurringExpenses || []}
                    categories={categories || []}
                    budgetId={budget.id}
                    currency={budget.currency}
                />

                {/* General Budget Settings */}
                <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Configuración General</h2>
                    <BudgetSettingsForm
                        budgetId={budget.id}
                        initialName={budget.name}
                        initialCutoff={budget.cutoff_day || 1}
                    />
                </section>

                {/* Categories Management */}
                <section>
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h2 className="text-lg font-bold text-slate-800">Categorías y Límites</h2>
                    </div>
                    <CategoryList categories={categories || []} currency={budget.currency} budgetId={budget.id} />
                </section>

                {/* Collaboration Section */}
                <section className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-2">Invitar Colaboradores</h2>
                        <p className="text-white/80 text-sm mb-6">
                            Comparte este presupuesto con tu pareja o familia para llevar las cuentas juntos.
                        </p>
                        <InviteLink budgetId={budget.id} />
                    </div>
                    {/* Decorative */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
                </section>

                {/* Member List */}
                <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Miembros del Equipo</h2>
                    <MemberList members={formattedMembers || []} currentUserId={user.id} budgetId={budget.id} />

                    <PendingInvites invites={invitations || []} />
                </section>

            </main>

            <BottomNav />
        </div>
    );
}
