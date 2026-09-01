import React, { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  PieChart as PieIcon,
  BarChart3,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Activity,
  Flame,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatPKR, formatCompactPKR, formatDate } from '../lib/formatters';
import { renderCategoryIcon } from '../lib/icons';
import { exportComprehensiveReportPDF, exportTransactionsToExcel } from '../lib/exports';

export const AnalyticsView: React.FC = () => {
  const {
    activeProfile,
    transactions,
    categories,
    wallets,
    budgets,
    savingsGoals,
  } = useExpense();

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month');

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
  const walletMap = useMemo(() => new Map(wallets.map(w => [w.id, w])), [wallets]);

  // Date filtering logic
  const filteredTxs = useMemo(() => {
    const now = new Date();
    let cutoff = new Date();

    if (timeRange === 'week') {
      cutoff.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      cutoff.setDate(now.getDate() - 30);
    } else if (timeRange === 'quarter') {
      cutoff.setDate(now.getDate() - 90);
    } else if (timeRange === 'year') {
      cutoff.setFullYear(now.getFullYear() - 1);
    } else {
      cutoff = new Date(2000, 0, 1);
    }

    const cutoffStr = cutoff.toISOString().split('T')[0];
    return transactions.filter(t => t.date >= cutoffStr);
  }, [transactions, timeRange]);

  // Aggregate Metrics
  const totalIncome = useMemo(() => {
    return filteredTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  }, [filteredTxs]);

  const totalExpense = useMemo(() => {
    return filteredTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  }, [filteredTxs]);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Daily average burn
  const daysCount = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : timeRange === 'quarter' ? 90 : 365;
  const avgDailyExpense = Math.round(totalExpense / daysCount);

  // Category Breakdown for Pie & List
  const categoryData = useMemo(() => {
    const map: Record<string, { id: string; name: string; value: number; color: string; icon: string }> = {};

    filteredTxs.filter(t => t.type === 'expense').forEach(t => {
      const cat = catMap.get(t.category_id);
      const name = cat?.name || 'Uncategorized';
      const color = cat?.color || '#8B5CF6';
      const icon = cat?.icon || 'Tag';

      if (!map[name]) {
        map[name] = { id: t.category_id, name, value: 0, color, icon };
      }
      map[name].value += t.amount;
    });

    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [filteredTxs, catMap]);

  // Daily Spending Chart Data (grouped by date)
  const dailyData = useMemo(() => {
    const map: Record<string, { date: string; income: number; expense: number }> = {};

    filteredTxs.forEach(t => {
      if (!map[t.date]) {
        map[t.date] = { date: t.date, income: 0, expense: 0 };
      }
      if (t.type === 'income') map[t.date].income += t.amount;
      if (t.type === 'expense') map[t.date].expense += t.amount;
    });

    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTxs]);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Analytics & Insights
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Spending patterns, daily velocity, cash flow trends, and report exports
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportComprehensiveReportPDF(
              `Analytics_Report_${timeRange}`,
              `${timeRange.toUpperCase()} Statement`,
              filteredTxs,
              categories,
              wallets,
              budgets,
              savingsGoals,
              activeProfile.name
            )}
            className="flex items-center gap-1.5 rounded-2xl bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 px-3.5 py-2 text-xs font-semibold text-purple-300 transition-colors"
          >
            <FileText className="h-4 w-4 text-purple-400" />
            <span>Export PDF Report</span>
          </button>

          <button
            onClick={() => exportTransactionsToExcel(
              filteredTxs,
              categories,
              wallets,
              `Analytics_Export_${timeRange}`
            )}
            className="flex items-center gap-1.5 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Time Range Pill Filters */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900/60 border border-white/10 w-fit">
        {(['week', 'month', 'quarter', 'year', 'all'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setTimeRange(r)}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold capitalize transition-all ${
              timeRange === r
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {r === 'week' ? 'Last 7 Days' : r === 'month' ? 'Last 30 Days' : r === 'quarter' ? 'Last 90 Days' : r === 'year' ? '12 Months' : 'All Time'}
          </button>
        ))}
      </div>

      {/* Key Metric Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-slate-900/60 border border-emerald-500/20 p-5 backdrop-blur-xl shadow-xl">
          <span className="text-xs font-semibold text-slate-400">Total Income</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{formatPKR(totalIncome)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Inflow for selected window</p>
        </div>

        <div className="rounded-3xl bg-slate-900/60 border border-rose-500/20 p-5 backdrop-blur-xl shadow-xl">
          <span className="text-xs font-semibold text-slate-400">Total Outflow</span>
          <p className="text-2xl font-black text-rose-400 font-mono mt-1">{formatPKR(totalExpense)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Direct spending</p>
        </div>

        <div className="rounded-3xl bg-slate-900/60 border border-purple-500/20 p-5 backdrop-blur-xl shadow-xl">
          <span className="text-xs font-semibold text-slate-400">Net Surplus / Savings</span>
          <p className={`text-2xl font-black font-mono mt-1 ${netSavings >= 0 ? 'text-purple-300' : 'text-rose-400'}`}>
            {formatPKR(netSavings)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{savingsRate}% savings efficiency</p>
        </div>

        <div className="rounded-3xl bg-slate-900/60 border border-cyan-500/20 p-5 backdrop-blur-xl shadow-xl">
          <span className="text-xs font-semibold text-slate-400">Average Daily Burn</span>
          <p className="text-2xl font-black text-cyan-300 font-mono mt-1">{formatPKR(avgDailyExpense)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Estimated daily run rate</p>
        </div>
      </div>

      {/* Main Cash Flow Chart */}
      <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Daily Cash Inflow & Outflow Timeline</h3>
            <p className="text-[11px] text-slate-400">Daily breakdown in Pakistani Rupees (PKR)</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={10}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis stroke="#64748B" fontSize={10} tickFormatter={(val) => formatCompactPKR(val)} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '16px',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [formatPKR(Number(val)), '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#F43F5E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown Donut & Ranked Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Donut Chart */}
        <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Expense Breakdown by Category</h3>
            <p className="text-[11px] text-slate-400">Proportional distribution for {timeRange}</p>
          </div>

          <div className="h-64 w-full my-4">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [formatPKR(Number(val)), 'Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-500">
                No expense transactions found in this time range.
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categoryData.slice(0, 5).map((c) => (
              <span key={c.name} className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span>{c.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Category Ranked Table */}
        <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1">Top Expense Categories</h3>
          <p className="text-[11px] text-slate-400 mb-4">Ranked by highest total outflow</p>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {categoryData.map((c, index) => {
              const share = totalExpense > 0 ? Math.round((c.value / totalExpense) * 100) : 0;

              return (
                <div key={c.name} className="rounded-2xl bg-white/5 p-3 border border-white/5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-500">#{index + 1}</span>
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-xl text-white"
                        style={{ backgroundColor: `${c.color}25`, color: c.color }}
                      >
                        {renderCategoryIcon(c.icon, "w-4 h-4")}
                      </div>
                      <span className="text-xs font-bold text-white">{c.name}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-white font-mono">{formatPKR(c.value)}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({share}%)</span>
                    </div>
                  </div>

                  {/* Visual Share Bar */}
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${share}%`, backgroundColor: c.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
