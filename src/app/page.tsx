import { BottomNav } from '@/components/Layout/BottomNav';
import { ExpenseChart } from '@/components/Dashboard/ExpenseChart';
import { SummaryCard } from '@/components/Dashboard/SummaryCard';
import { CreateBudgetForm } from '@/components/Onboarding/CreateBudgetForm';
import { Bell, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BudgetHeader } from '@/components/Layout/BudgetHeader';
import { cookies } from 'next/headers';
import { RecentTransactions } from '@/components/Dashboard/RecentTransactions';
import { ExpensesPieChart } from '@/components/Dashboard/ExpensesPieChart';
import { BudgetSelector } from '@/components/Layout/BudgetSelector';

import { MonthSelector } from '@/components/Dashboard/MonthSelector';

export default async function Home({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();

  const response = await supabase.auth.getUser();
  const user = response.data?.user;

  if (!user) {
    redirect('/login');
  }

  // Fetch ALL Budgets user is member of
  const { data: membershipData } = await supabase
    .from('budget_members')
    .select('role, budgets(*)')
    .eq('user_id', user.id);

  const budgets = membershipData?.map((m: any) => m.budgets) || [];

  // Show Onboarding if no budget at all
  if (budgets.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <CreateBudgetForm />
      </div>
    );
  }

  // Determine Current Budget
  const cookieStore = await cookies();
  const selectedId = cookieStore.get('selected_budget')?.value;

  let budget = budgets.find((b: any) => b.id === selectedId);
  if (!budget) {
    budget = budgets[0]; // Default to first
  }

  // Show Onboarding if no budget
  if (!budget) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <CreateBudgetForm />
      </div>
    );
  }

  // Fetch Profile Name
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single();

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Usuario';

  // Real Data Fetching (Transactions)
  // Logic for Cutoff Day & Month Navigation
  const cutoffDay = budget.cutoff_day || 1;
  const paramDate = params.date ? new Date(params.date) : new Date();

  // We determine the "Start of Period" based on the paramDate
  const referenceDay = paramDate.getDate();
  let startOfPeriod = new Date(paramDate);
  let endOfPeriod = new Date(paramDate);

  if (referenceDay >= cutoffDay) {
    // Current cycle started this month
    startOfPeriod.setDate(cutoffDay);
    startOfPeriod.setHours(0, 0, 0, 0);

    // Ends next month
    endOfPeriod.setMonth(endOfPeriod.getMonth() + 1);
    endOfPeriod.setDate(cutoffDay);
    endOfPeriod.setHours(0, 0, 0, 0);
  } else {
    // Previous month cycle
    startOfPeriod.setMonth(startOfPeriod.getMonth() - 1);
    startOfPeriod.setDate(cutoffDay);
    startOfPeriod.setHours(0, 0, 0, 0);

    // Ends this month
    endOfPeriod.setDate(cutoffDay);
    endOfPeriod.setHours(0, 0, 0, 0);
  }

  // Formatting for display "Title" (e.g. "Feb 15 - Mar 14")
  // Not used in UI yet but good logical step.

  // 1. Check & Generate Recurring Expenses (Lazy Trigger) - BEFORE fetching
  const { checkAndGenerateRecurring } = await import('@/lib/recurring')
  await checkAndGenerateRecurring(budget.id)

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, profiles(display_name, email)')
    .eq('budget_id', budget.id)
    .gte('date', startOfPeriod.toISOString())
    .lt('date', endOfPeriod.toISOString()) // Filter by period end
    .order('date', { ascending: false });

  // Calculate Spent & Income
  // Assumptions: Positive amount = Expense (if no type field), using a convention or Category Type
  // Actually schema doesn't specify Income vs Expense clearly in Transaction table alone, 
  // usually it depends on Category Type. Let's fetch categories too.

  // Calculate Spent & Income
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, type, budget_limit, icon')
    .eq('budget_id', budget.id);

  const categoriesMap = new Map(categories?.map(c => [c.id, c]));

  let totalSpent = 0;
  let totalIncome = 0;

  const chartDataMap = new Map<string, number>();

  transactions?.forEach(tx => {
    const amount = Number(tx.amount);
    const category = categoriesMap.get(tx.category_id);
    const type = category?.type || 'variable'; // Default to variable/expense if unknown

    if (type === 'income') {
      totalIncome += amount;
    } else {
      // Expenses (Fixed or Variable)
      totalSpent += amount;

      // Chart Data (Only Expenses)
      const catName = category?.name || 'Otros';
      const current = chartDataMap.get(catName) || 0;
      chartDataMap.set(catName, current + amount);
    }
  });

  // Prepare Chart Data
  const chartData = Array.from(chartDataMap.entries()).map(([name, value], index) => ({
    name,
    value,
    color: [`#10b981`, `#3b82f6`, `#f59e0b`, `#ef4444`, `#8b5cf6`, `#ec4899`][index % 6]
  }));

  // "Disponible" (Real Cashflow): Real Income - Real Expenses
  // If no income registered yet, available will be negative (or we can show 0 if preferred, but negative is honest)
  const available = totalIncome - totalSpent;

  // Future Feature: If user selects "Budget Method", we would use:
  // const totalBudgeted = categories?.filter(c=>c.type!=='income').reduce((sum, cat) => sum + Number(cat.budget_limit), 0) || 0;
  // const available = totalBudgeted - totalSpent;
  // Only show positive available if they set limits, otherwise 0.

  // Only show positive available if they set limits, otherwise 0.

  // ... inside component ...

  // Check for Recurring Expenses
  // const { count: recurringCount, expenses: recurringExpenses } = await checkRecurringExpenses(budget.id, cutoffDay);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* ... Header ... */}
      <BudgetHeader
        budgets={budgets}
        currentBudgetId={budget.id}
        userAvatar={profile?.avatar_url} // Assuming avatar_url exists in profile fetch
      />

      {/* Month Navigation */}
      <MonthSelector cutoffDay={cutoffDay} currentDate={params.date ? new Date(params.date) : new Date()} />

      {/* Main Content */}
      <main className="px-6 space-y-8 mt-8">

        {/* Recurring Alert */}
        {/* {recurringCount > 0 && (
          <RecurringAlert expenses={recurringExpenses} />
        )} */}

        <SummaryCard
          available={available}
          spent={totalSpent}
          income={totalIncome}
          currency={budget?.currency || 'USD'}
        />

        {chartData.length > 0 ? (
          <ExpenseChart data={chartData} />
        ) : (
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 text-center py-12 shadow-sm">
            <p className="text-slate-400 font-medium">Aún no tienes gastos este mes.</p>
          </div>
        )}

        {/* Recent Transactions */}
        <RecentTransactions transactions={transactions?.slice(0, 5).map((tx: any) => ({
          id: tx.id,
          description: tx.description,
          amount: tx.amount,
          date: tx.date,
          category: categoriesMap.get(tx.category_id),
          profiles: tx.profiles
        })) || []} />
      </main>

      <BottomNav />
    </div>
  );
}
