import React, { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Budget, BudgetType } from '../types';
import {
  PieChart as PieIcon,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  X,
  Tag,
  Wallet as WalletIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatPKR, formatCompactPKR } from '../lib/formatters';
import { renderCategoryIcon } from '../lib/icons';

export const BudgetsView: React.FC = () => {
  const {
    activeProfile,
    budgets,
    categories,
    wallets,
    transactions,
    addBudget,
    updateBudget,
    deleteBudget,
    theme,
  } = useExpense();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Form State
  const [budgetType, setBudgetType] = useState<BudgetType>('category');
  const [targetId, setTargetId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [threshold, setThreshold] = useState<number>(80);

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
  const walletMap = useMemo(() => new Map(wallets.map(w => [w.id, w])), [wallets]);

  // Current month expenses
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthExpenses = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(currentMonthStr) && t.type === 'expense');
  }, [transactions, currentMonthStr]);

  // Calculate spent per budget
  const budgetCalculations = useMemo(() => {
    return budgets.map((b) => {
      let spent = 0;
      if (b.type === 'overall') {
        spent = currentMonthExpenses.reduce((acc, t) => acc + t.amount, 0);
      } else if (b.type === 'category' && b.target_id) {
        spent = currentMonthExpenses
          .filter(t => t.category_id === b.target_id)
          .reduce((acc, t) => acc + t.amount, 0);
      } else if (b.type === 'wallet' && b.target_id) {
        spent = currentMonthExpenses
          .filter(t => t.wallet_id === b.target_id)
          .reduce((acc, t) => acc + t.amount, 0);
      }

      const percent = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
      const remaining = b.amount - spent;
      const isOver = spent > b.amount;
      const isWarning = percent >= b.alert_threshold && !isOver;

      return {
        budget: b,
        spent,
        percent,
        remaining,
        isOver,
        isWarning,
      };
    });
  }, [budgets, currentMonthExpenses]);

  // Comparison Chart Data
  const chartData = useMemo(() => {
    return budgetCalculations.map((bc) => {
      let label = 'Overall Monthly';
      if (bc.budget.type === 'category' && bc.budget.target_id) {
        label = catMap.get(bc.budget.target_id)?.name || 'Category';
      } else if (bc.budget.type === 'wallet' && bc.budget.target_id) {
        label = walletMap.get(bc.budget.target_id)?.name || 'Wallet';
      }
      return {
        name: label,
        Budget: bc.budget.amount,
        Spent: bc.spent,
      };
    });
  }, [budgetCalculations, catMap, walletMap]);

  const handleOpenCreate = () => {
    setEditingBudget(null);
    setBudgetType('category');
    const expCats = categories.filter(c => c.type === 'expense');
    setTargetId(expCats[0]?.id || '');
    setAmount('');
    setPeriod('monthly');
    setThreshold(80);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (b: Budget) => {
    setEditingBudget(b);
    setBudgetType(b.type);
    setTargetId(b.target_id || '');
    setAmount(String(b.amount));
    setPeriod(b.period);
    setThreshold(b.alert_threshold || 80);
    setIsCreateModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid budget amount.');
      return;
    }

    if (editingBudget) {
      updateBudget(editingBudget.id, {
        type: budgetType,
        target_id: budgetType === 'overall' ? undefined : targetId,
        amount: num,
        period,
        alert_threshold: threshold,
      });
    } else {
      addBudget({
        type: budgetType,
        target_id: budgetType === 'overall' ? undefined : targetId,
        amount: num,
        period,
        start_date: new Date().toISOString().split('T')[0],
        alert_threshold: threshold,
      });
    }

    setIsCreateModalOpen(false);
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">
            Budget Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Spending caps, alert thresholds, and budget vs actual analytics
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Create Budget</span>
        </button>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgetCalculations.map((bc) => {
          const b = bc.budget;
          let title = 'Overall Spending Budget';
          let icon = 'PieChart';
          let color = '#7C3AED';

          if (b.type === 'category' && b.target_id) {
            const cat = catMap.get(b.target_id);
            title = cat?.name || 'Category';
            icon = cat?.icon || 'Tag';
            color = cat?.color || '#3B82F6';
          } else if (b.type === 'wallet' && b.target_id) {
            const w = walletMap.get(b.target_id);
            title = `${w?.name || 'Wallet'} Outflow`;
            icon = w?.icon || 'Wallet';
            color = w?.color || '#10B981';
          }

          return (
            <div
              key={b.id}
              className={`rounded-3xl bg-white/80 dark:bg-slate-900/60 border p-6 backdrop-blur-xl shadow-xl relative overflow-hidden transition-all hover:border-purple-400 dark:hover:border-white/20 ${
                bc.isOver
                  ? 'border-rose-500/50 bg-rose-50/80 dark:bg-rose-950/20'
                  : bc.isWarning
                  ? 'border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/20'
                  : 'border-slate-200 dark:border-white/10'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-sm"
                    style={{ backgroundColor: `${color}30`, color }}
                  >
                    {renderCategoryIcon(icon, "w-5 h-5")}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 capitalize">{b.period} Cycle</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline p-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this budget limit?')) deleteBudget(b.id);
                    }}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Amount Metrics */}
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Spent:</span>
                  <p className="text-lg font-black text-slate-900 dark:text-white font-mono">{formatPKR(bc.spent)}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Limit:</span>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">{formatPKR(b.amount)}</p>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    bc.isOver
                      ? 'bg-rose-500'
                      : bc.percent >= 80
                      ? 'bg-amber-400'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(bc.percent, 100)}%` }}
                />
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className={`font-bold ${bc.isOver ? 'text-rose-600 dark:text-rose-400' : bc.isWarning ? 'text-amber-600 dark:text-amber-300' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {bc.percent}% used
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {bc.remaining >= 0 ? `${formatPKR(bc.remaining)} left` : `${formatPKR(Math.abs(bc.remaining))} over limit!`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Budget vs Actual Comparison Chart */}
      {budgetCalculations.length > 0 && (
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-6 backdrop-blur-xl shadow-xl transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Budget vs Actual Spending Comparison</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Allocated PKR limit vs Recorded Outflow</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} angle={-15} textAnchor="end" />
                <YAxis stroke="#94A3B8" fontSize={10} tickFormatter={(val) => formatCompactPKR(val)} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0F172A' : '#ffffff',
                    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.15)' : '#e2e8f0',
                    borderRadius: '16px',
                    fontSize: '12px',
                    color: theme === 'dark' ? '#fff' : '#0f172a',
                  }}
                  formatter={(val: any) => [formatPKR(Number(val)), '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Budget" fill="#6366F1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Spent" fill="#F43F5E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Create / Edit Budget Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingBudget ? 'Edit Budget' : 'Create New Budget'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl bg-slate-100 dark:bg-white/10 p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Budget Target
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setBudgetType('overall')}
                    className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                      budgetType === 'overall' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Overall
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBudgetType('category');
                      if (expenseCategories.length > 0) setTargetId(expenseCategories[0].id);
                    }}
                    className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                      budgetType === 'category' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Category
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBudgetType('wallet');
                      if (wallets.length > 0) setTargetId(wallets[0].id);
                    }}
                    className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                      budgetType === 'wallet' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Wallet
                  </button>
                </div>
              </div>

              {/* Target Selector if not overall */}
              {budgetType === 'category' && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Select Expense Category
                  </label>
                  <select
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/15 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {expenseCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {budgetType === 'wallet' && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Select Wallet
                  </label>
                  <select
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/15 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Budget Limit (PKR)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 font-bold text-slate-400 text-lg">₨</span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 25000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 pl-11 pr-4 py-2.5 text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>
              </div>

              {/* Threshold */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Alert Threshold
                  </label>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{threshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  You will receive in-app and browser notifications when spending reaches {threshold}%.
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-2xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-purple-600 px-6 py-2 text-xs font-bold text-white hover:bg-purple-500 shadow-lg shadow-purple-600/30"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
