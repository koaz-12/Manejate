import { BottomNav } from '@/components/Layout/BottomNav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BudgetSettingsForm } from '@/components/Settings/BudgetSettingsForm';
import { CategoryList } from '@/components/Settings/CategoryList'
import { InviteLink } from '@/components/Settings/InviteLink';
import { MemberList } from '@/components/Settings/MemberList';
import { PendingInvites } from '@/components/Settings/PendingInvites';
import { RecurringExpensesList } from '@/components/Settings/RecurringExpensesList';
import { BudgetHeader } from '@/components/Layout/BudgetHeader';
import { ProfileCard } from '@/components/Settings/ProfileCard';
import { PreferencesSection } from '@/components/Settings/PreferencesSection';
import { ExportDataCard } from '@/components/Settings/ExportDataCard';
import { DangerZoneCard } from '@/components/Settings/DangerZoneCard';

export default async function SettingsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch All Memberships
    const { data: memberships } = await supabase
        .from('budget_members')
        .select('role, budgets(*)')
        .eq('user_id', user.id)

    const budgets = memberships?.map((m: any) => m.budgets) || [];

    // Determine Active Budget from Cookie or Default
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const selectedId = cookieStore.get('selected_budget')?.value

    const activeMembership = memberships?.find((m: any) => m.budgets.id === selectedId) || memberships?.[0]
    const budget = activeMembership?.budgets as any
    const role = activeMembership?.role

    if (!budget) redirect('/');

    // Fetch User Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url, display_name, email')
        .eq('id', user.id)
        .single();

    // Fetch User Settings
    const { data: settings } = await supabase
        .from('user_settings')
        .select('value')
        .eq('user_id', user.id)
        .eq('key', 'goals.default_initial_deposit')
        .single()

    // Fetch Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('budget_id', budget.id)
        .order('type', { ascending: true });

    // Fetch Full Members List
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

    // Fetch Recurring Expenses
    const { data: recurringExpenses } = await supabase
        .from('recurring_expenses')
        .select('*')
        .eq('budget_id', budget.id)
        .order('day_of_month', { ascending: true })

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <BudgetHeader
                budgets={budgets}
                currentBudgetId={budget.id}
                userAvatar={profile?.avatar_url}
            />

            <main className="px-6 mt-6 space-y-8 max-w-2xl mx-auto">

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Ajustes</h1>
                    <p className="text-slate-400 text-sm mt-0.5">Configura tu perfil y tu espacio de trabajo.</p>
                </div>

                {/* 1. Profile Section */}
                <section className="space-y-4">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2">Mi Perfil</h2>
                    <ProfileCard
                        displayName={profile?.display_name}
                        email={profile?.email || user.email || ''}
                        avatarUrl={profile?.avatar_url}
                    />
                    <PreferencesSection initialDepositDefault={settings?.value === true} />
                </section>

                <hr className="border-slate-200/60 my-8" />

                {/* 2. Budget Config Section */}
                <section className="space-y-4">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2">Configuración del Presupuesto</h2>

                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                        <BudgetSettingsForm
                            budgetId={budget.id}
                            initialName={budget.name}
                            initialCutoff={budget.cutoff_day || 1}
                        />
                    </div>
                </section>

                {/* 3. Collaboration Section */}
                <section className="space-y-4">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2">Equipo</h2>

                    {/* Invite Card */}
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-lg overflow-hidden relative">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-1">Invitar Colaboradores</h3>
                            <p className="text-white/80 text-sm mb-4 max-w-[80%]">
                                Comparte el control financiero con tu familia o socios.
                            </p>
                            <InviteLink budgetId={budget.id} />
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                        <MemberList members={formattedMembers || []} currentUserId={user.id} budgetId={budget.id} currentUserRole={role} />
                        <PendingInvites invites={invitations || []} />
                    </div>
                </section>

                {/* 4. Data Management Section */}
                <section className="space-y-4">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2">Gestión de Datos</h2>

                    <RecurringExpensesList
                        expenses={recurringExpenses || []}
                        categories={categories || []}
                        budgetId={budget.id}
                        currency={budget.currency}
                    />

                    <section>
                        <h3 className="text-sm font-bold text-slate-700 mb-2 pl-2">Categorías</h3>
                        <CategoryList categories={categories || []} currency={budget.currency} budgetId={budget.id} />
                    </section>

                    <ExportDataCard budgetId={budget.id} />
                </section>

                {/* 5. Danger Zone */}
                <section className="pt-4">
                    <h2 className="text-xs font-bold text-red-300 uppercase tracking-wider pl-2 mb-2">Zona de Peligro</h2>
                    <DangerZoneCard budgetId={budget.id} isOwner={role === 'admin' || role === 'owner'} />
                </section>

            </main>

            <BottomNav />
        </div>
    );
}
