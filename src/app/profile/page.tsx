
import { BottomNav } from '@/components/Layout/BottomNav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BudgetHeader } from '@/components/Layout/BudgetHeader';
import { ProfileCard } from '@/components/Settings/ProfileCard';
import { PreferencesSection } from '@/components/Settings/PreferencesSection';
import { SecurityCard } from '@/components/Settings/SecurityCard';
import { NotificationPreferencesCard } from '@/components/Settings/NotificationPreferencesCard';
import { getNotifications } from '@/actions/notifications';

export default async function ProfilePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch All Memberships for Header (Budget Switcher context)
    const { data: memberships } = await supabase
        .from('budget_members')
        .select('role, budgets(*)')
        .eq('user_id', user.id)

    const budgets = memberships?.map((m: any) => m.budgets) || [];

    // Determine Active Budget (Optional for Profile, but good for Header consistency)
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const selectedId = cookieStore.get('selected_budget')?.value

    const activeMembership = memberships?.find((m: any) => m.budgets.id === selectedId) || memberships?.[0]
    const budget = activeMembership?.budgets as any
    const currentBudgetId = budget?.id || ''

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

    const notifications = currentBudgetId ? await getNotifications(currentBudgetId) : []

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <BudgetHeader
                budgets={budgets}
                currentBudgetId={currentBudgetId}
                userAvatar={profile?.avatar_url}
                notifications={notifications}
            />

            <main className="px-6 mt-6 space-y-6 max-w-2xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mi Perfil</h1>
                    <p className="text-slate-400 text-sm mt-0.5">Gestiona tu identidad y preferencias personales.</p>
                </div>

                <ProfileCard
                    displayName={profile?.display_name}
                    email={profile?.email || user.email || ''}
                    avatarUrl={profile?.avatar_url}
                />

                <SecurityCard />

                <PreferencesSection initialDepositDefault={settings?.value === true} />

                <NotificationPreferencesCard />
            </main>

            <BottomNav />
        </div>
    );
}
