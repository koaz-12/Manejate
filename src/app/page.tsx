import { BottomNav } from '@/components/Layout/BottomNav';
import { ExpenseChart } from '@/components/Dashboard/ExpenseChart';
import { SpendingTrends } from '@/components/Dashboard/SpendingTrends';
import { SummaryCard } from '@/components/Dashboard/SummaryCard';
import { CreateBudgetForm } from '@/components/Onboarding/CreateBudgetForm';
import { BudgetHeader } from '@/components/Layout/BudgetHeader';
import { RecentTransactions } from '@/components/Dashboard/RecentTransactions';
import { MonthSelector } from '@/components/Dashboard/MonthSelector';
import { getActiveBudgetContext } from '@/lib/budget-helpers';
import { calculatePeriod } from '@/lib/period';
import { getMonthlyTrends } from '@/lib/trends';

export default async function Home({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const { supabase, budgets, budget, profile } = await getActiveBudgetContext();

  // Show Onboarding if no budget
  if (!budget) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <CreateBudgetForm />
      </div>
    );
  }

  // Period calculation
  const cutoffDay = budget.cutoff_day || 1;
  const paramDate = params.date ? new Date(params.date) : new Date();
  const { startOfPeriod, endOfPeriod } = calculatePeriod(cutoffDay, paramDate);

  // Trigger recurring expenses in background (non-blocking)
  const { checkAndGenerateRecurring } = await import('@/lib/recurring');
  // Fire-and-forget: don't await
  checkAndGenerateRecurring(budget.id).catch(console.error);

  // Parallel data fetching — all at once instead of sequentially
  const [{ data: transactions }, { data: categories }, trendsData] = await Promise.all([
    supabase
      .from('transactions')
      .select('*, profiles(display_name, email)')
      .eq('budget_id', budget.id)
      .gte('date', startOfPeriod.toISOString())
      .lt('date', endOfPeriod.toISOString())
      .order('date', { ascending: false }),
    supabase
      .from('categories')
      .select('id, name, type, budget_limit, icon')
      .eq('budget_id', budget.id),
    getMonthlyTrends(budget.id, cutoffDay),
  ]);

  // Calculate Spent & Income
  const categoriesMap = new Map(categories?.map(c => [c.id, c]));
  let totalSpent = 0;
  let totalIncome = 0;
  const chartDataMap = new Map<string, number>();

  transactions?.forEach(tx => {
    const amount = Number(tx.amount);
    const category = categoriesMap.get(tx.category_id);
    const type = category?.type || 'variable';

    if (type === 'income') {
      totalIncome += amount;
    } else {
      totalSpent += amount;
      const catName = category?.name || 'Otros';
      const current = chartDataMap.get(catName) || 0;
      chartDataMap.set(catName, current + amount);
    }
  });

  const chartData = Array.from(chartDataMap.entries()).map(([name, value], index) => ({
    name,
    value,
    color: [`#10b981`, `#3b82f6`, `#f59e0b`, `#ef4444`, `#8b5cf6`, `#ec4899`][index % 6]
  }));

  const available = totalIncome - totalSpent;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <BudgetHeader
        budgets={budgets}
        currentBudgetId={budget.id}
        userAvatar={profile?.avatar_url}
      />

      <MonthSelector cutoffDay={cutoffDay} currentDate={paramDate} />

      <main className="px-6 space-y-8 mt-8">
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

        <SpendingTrends data={trendsData} currency={budget?.currency || 'USD'} />

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
