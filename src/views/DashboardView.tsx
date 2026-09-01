import React, { useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import {
  TrendingUp,
  TrendingDown,
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  Plus,
  Receipt,
  FileCheck2,
  Calendar,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  PiggyBank
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { formatPKR, formatCompactPKR, formatDate } from '../lib/formatters';
import { renderCategoryIcon } from '../lib/icons';

export const DashboardView: React.FC = () => {
  const {
    activeProfile,
    wallets,
    transactions,
    categories,
    budgets,
    bills,
    savingsGoals,
    setIsAddTxOpen,
    setIsTransferOpen,
    setActiveTab,
    setEditingTransaction,
    setActiveReceiptUrl,
  } = useExpense();

  const totalBalance = useMemo(() => {
    return wallets.reduce((acc, w) => acc + w.balance, 0);
  }, [wallets]);

  // Current Month calculations
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(currentMonthStr));
  }, [transactions, currentMonthStr]);

  const totalIncome = useMemo(() => {
    return currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [currentMonthTransactions]);

  const totalExpense = useMemo(() => {
    return currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [currentMonthTransactions]);

  const netSavings = totalIncome - totalExpense;

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
  const walletMap = useMemo(() => new Map(wallets.map(w => [w.id, w])), [wallets]);

  // Category-wise Breakdown for Pie Chart
  const categoryExpensesData = useMemo(() => {
    const map: Record<string, { name: string; value: number; color: string; icon: string }> = {};
    
    currentMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = catMap.get(t.category_id);
      const name = cat?.name || 'Other';
      const color = cat?.color || '#8B5CF6';
      const icon = cat?.icon || 'Tag';
      
      if (!map[name]) {
        map[name] = { name, value: 0, color, icon };
      }
      map[name].value += t.amount;
    });

    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [currentMonthTransactions, catMap]);

  // Last 6 months trend data
  const trendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result: { month: string; income: number; expense: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${months[d.getMonth()]}`;

      const txs = transactions.filter(t => t.date.startsWith(mStr));
      const inc = txs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const exp = txs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

      result.push({
        month: label,
        income: inc,
        expense: exp,
      });
    }
    return result;
  }, [transactions]);

  // Budget Status Check
  const overallBudget = budgets.find(b => b.type === 'overall');
  const budgetSpent = totalExpense;
  const budgetPercentage = overallBudget ? Math.min(Math.round((budgetSpent / overallBudget.amount) * 100), 100) : 0;

  // Upcoming bills
  const upcomingBills = useMemo(() => {
    return bills.filter(b => !b.is_paid).slice(0, 3);
  }, [bills]);

  // Recent 6 transactions
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 6);
  }, [transactions]);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Top Banner: Total Balance Hero Card matching Sleek Interface */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-purple-600 via-indigo-700 to-[#3B82F6] border border-white/20 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        
        {/* Glow ambient spots */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-black/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200">Total Net Balance</span>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white border border-white/30">
                {activeProfile.name}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-display">
              {formatPKR(totalBalance)}
            </h1>
            <p className="text-xs text-purple-200/80 mt-1">
              Live consolidated balance across {wallets.length} active wallets
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsAddTxOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-white text-purple-900 hover:bg-white/90 px-4 py-2.5 text-xs font-bold shadow-lg shadow-black/20 active:scale-95 transition-all"
            >
              <ArrowDownRight className="h-4 w-4 text-rose-600" />
              <span>Add Expense</span>
            </button>

            <button
              onClick={() => setIsAddTxOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-2.5 text-xs font-bold text-white shadow-lg active:scale-95 transition-all"
            >
              <ArrowUpRight className="h-4 w-4 text-emerald-300" />
              <span>Add Income</span>
            </button>

            <button
              onClick={() => setIsTransferOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-black/20 hover:bg-black/30 border border-white/20 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md active:scale-95 transition-all"
            >
              <ArrowRightLeft className="h-4 w-4 text-purple-200" />
              <span>Transfer</span>
            </button>
          </div>
        </div>

        {/* Scrollable Wallet Badges */}
        <div className="mt-6 pt-4 border-t border-white/15 flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="flex items-center gap-2.5 rounded-2xl bg-black/20 border border-white/15 px-3.5 py-2 shrink-0 backdrop-blur-md hover:bg-black/30 transition-colors"
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: `${w.color}40`, color: '#fff' }}
              >
                {renderCategoryIcon(w.icon, "w-4 h-4")}
              </div>
              <div>
                <p className="text-[11px] font-semibold text-purple-100 truncate max-w-[120px]">{w.name}</p>
                <p className="text-xs font-bold text-white font-mono">{formatPKR(w.balance)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Month-to-Date KPI Cards (Income, Expense, Net Savings, Budget Usage) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Income Card */}
        <div className="rounded-[32px] bg-white/5 border border-white/10 p-6 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white/50">This Month Income</span>
            <div className="rounded-2xl bg-emerald-500/20 p-2.5 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-display">
            {formatPKR(totalIncome)}
          </p>
          <p className="text-[11px] text-white/40 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">Active Cycle</span> • {currentMonthTransactions.filter(t => t.type === 'income').length} entries
          </p>
        </div>

        {/* Expense Card */}
        <div className="rounded-[32px] bg-white/5 border border-white/10 p-6 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white/50">This Month Outflow</span>
            <div className="rounded-2xl bg-rose-500/20 p-2.5 text-rose-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-400 font-display">
            {formatPKR(totalExpense)}
          </p>
          <p className="text-[11px] text-white/40 mt-1 flex items-center gap-1">
            <span className="text-rose-400 font-semibold">Spent</span> • {currentMonthTransactions.filter(t => t.type === 'expense').length} transactions
          </p>
        </div>

        {/* Net Savings Card */}
        <div className="rounded-[32px] bg-white/5 border border-white/10 p-6 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white/50">Net Month Savings</span>
            <div className="rounded-2xl bg-purple-500/20 p-2.5 text-purple-400">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <p className={`text-2xl font-bold font-display ${netSavings >= 0 ? 'text-purple-300' : 'text-rose-400'}`}>
            {formatPKR(netSavings)}
          </p>
          <p className="text-[11px] text-white/40 mt-1">
            {totalIncome > 0 ? `${Math.round((netSavings / totalIncome) * 100)}% savings rate` : '0% savings rate'}
          </p>
        </div>

        {/* Overall Budget Tracker Card */}
        <div className="rounded-[32px] bg-white/5 border border-white/10 p-6 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white/50">Budget Limit</span>
            <span className={`text-xs font-bold ${budgetPercentage > 90 ? 'text-rose-400' : budgetPercentage > 70 ? 'text-amber-400' : 'text-cyan-400'}`}>
              {budgetPercentage}%
            </span>
          </div>
          <p className="text-xl font-bold text-white font-display">
            {overallBudget ? formatPKR(overallBudget.amount) : 'No Budget Set'}
          </p>
          
          {/* Progress Bar */}
          <div className="mt-2.5 h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetPercentage > 90
                  ? 'bg-rose-500'
                  : budgetPercentage > 70
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-purple-500 to-cyan-400'
              }`}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            />
          </div>
        </div>

      </div>

      {/* Budget Warning Banner if above 80% */}
      {overallBudget && budgetPercentage >= 80 && (
        <div className="rounded-[32px] bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-transparent border border-amber-500/30 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-500/30 p-2.5 text-amber-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                {budgetPercentage >= 100 ? 'Budget Limit Exceeded!' : 'High Spending Alert (Over 80%)'}
              </h4>
              <p className="text-[11px] text-white/60 mt-0.5">
                You have spent {formatPKR(totalExpense)} of your {formatPKR(overallBudget.amount)} monthly budget cap.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('budgets')}
            className="rounded-2xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors shrink-0 border border-white/10"
          >
            Review Limits
          </button>
        </div>
      )}

      {/* Analytics Visual Grid: Spending Trend & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Spending Trend Line/Area Chart (2 Cols) */}
        <div className="lg:col-span-2 rounded-[32px] bg-white/5 border border-white/10 p-6 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">6-Month Cash Flow Trend</h3>
              <p className="text-[11px] text-white/40">Income vs Expenses (PKR)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-rose-400" /> Expenses
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => formatCompactPKR(val)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0e0720',
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    color: '#fff',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  }}
                  formatter={(value: any) => [formatPKR(Number(value)), '']}
                />
                <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeGradient)" />
                <Area type="monotone" dataKey="expense" stroke="#F43F5E" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Expense Donut Chart (1 Col) */}
        <div className="rounded-[32px] bg-white/5 border border-white/10 p-6 backdrop-blur-2xl shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">Expense Breakdown</h3>
              <span className="text-[11px] text-purple-400 font-semibold cursor-pointer hover:underline" onClick={() => setActiveTab('analytics')}>
                View all →
              </span>
            </div>
            <p className="text-[11px] text-white/40">Current Month Distribution</p>
          </div>

          <div className="h-48 w-full my-2">
            {categoryExpensesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryExpensesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryExpensesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0e0720',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [formatPKR(Number(val)), 'Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-white/40">
                No expenses logged this month
              </div>
            )}
          </div>

          {/* Top 3 Category list */}
          <div className="space-y-2">
            {categoryExpensesData.slice(0, 3).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-white/70 font-medium truncate max-w-[110px]">{item.name}</span>
                </div>
                <span className="font-bold text-white">{formatPKR(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Row: Recent Transactions & Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions List (2 Cols) */}
        <div className="lg:col-span-2 rounded-[32px] bg-white/5 border border-white/10 p-6 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
              <p className="text-[11px] text-white/40">Latest activity in Pakistani Rupees</p>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300"
            >
              See All History →
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTransactions.length === 0 ? (
              <p className="py-8 text-center text-xs text-white/40">No transactions recorded yet.</p>
            ) : (
              recentTransactions.map((tx) => {
                const cat = catMap.get(tx.category_id);
                const wallet = walletMap.get(tx.wallet_id);
                const isIncome = tx.type === 'income';
                const isTransfer = tx.type === 'transfer';

                return (
                  <div
                    key={tx.id}
                    onClick={() => {
                      setEditingTransaction(tx);
                      setIsAddTxOpen(true);
                    }}
                    className="flex items-center justify-between rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] p-3.5 transition-colors cursor-pointer border border-white/5"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shrink-0"
                        style={{
                          backgroundColor: isTransfer ? '#6366F125' : `${cat?.color || '#64748B'}25`,
                          color: isTransfer ? '#818CF8' : (cat?.color || '#94A3B8'),
                        }}
                      >
                        {renderCategoryIcon(isTransfer ? 'ArrowRightLeft' : (cat?.icon || 'Tag'), "w-5 h-5")}
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white truncate">
                            {isTransfer ? 'Wallet Transfer' : (cat?.name || 'Uncategorized')}
                          </p>
                          {tx.receipt_url && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveReceiptUrl(tx.receipt_url!);
                              }}
                              className="rounded-lg bg-purple-500/20 px-1.5 py-0.5 text-[9px] text-purple-300 hover:bg-purple-500/40"
                              title="View receipt"
                            >
                              Receipt 📷
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/50 truncate">
                          {tx.note || wallet?.name || 'No description'} • {wallet?.name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`text-xs font-bold font-mono ${
                          isIncome ? 'text-emerald-400' : isTransfer ? 'text-indigo-300' : 'text-white'
                        }`}
                      >
                        {isIncome ? '+' : isTransfer ? '↔ ' : '-'}{formatPKR(tx.amount)}
                      </p>
                      <p className="text-[10px] text-white/40">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Bills & Smart Tip Widget (1 Col) */}
        <div className="space-y-6">
          
          {/* Bills Widget */}
          <div className="rounded-[32px] bg-white/5 border border-white/10 p-6 backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Upcoming Bills</h3>
              <button
                onClick={() => setActiveTab('bills')}
                className="text-xs font-semibold text-amber-400 hover:underline"
              >
                Manage →
              </button>
            </div>

            <div className="space-y-2">
              {upcomingBills.length === 0 ? (
                <div className="py-4 text-center text-xs text-white/40">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-emerald-400/60" />
                  All bills paid for this cycle!
                </div>
              ) : (
                upcomingBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[130px]">{bill.title}</p>
                      <p className="text-[10px] text-amber-300/80">Due {formatDate(bill.due_date)}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-300">{formatPKR(bill.amount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Smart Tip Banner */}
          <div className="rounded-[32px] bg-gradient-to-tr from-cyan-950/40 via-purple-950/40 to-blue-950/40 border border-cyan-500/30 p-6 backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300">Smart Financial Tip</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              "Automating 10% of monthly salary into Meezan Islamic savings could yield you an extra <span className="font-bold text-white">Rs. 18,500</span> every month towards your bike goal."
            </p>
            <button
              onClick={() => setActiveTab('tips')}
              className="mt-3 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Explore AI Insights →
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
