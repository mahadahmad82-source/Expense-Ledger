import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { SavingsGoal } from '../types';
import {
  Target,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Calendar,
  Wallet as WalletIcon,
  X,
  ArrowUpRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { formatPKR, formatDate } from '../lib/formatters';

export const SavingsView: React.FC = () => {
  const {
    activeProfile,
    savingsGoals,
    wallets,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    depositToSavingsGoal,
    withdrawFromSavingsGoal,
    theme,
  } = useExpense();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedGoalForAction, setSelectedGoalForAction] = useState<SavingsGoal | null>(null);
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [actionAmount, setActionAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('');

  // Create Goal Form State
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Purchase');
  const [autoSavePercent, setAutoSavePercent] = useState<number>(0);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(targetAmount);
    const currNum = parseFloat(currentAmount) || 0;

    if (isNaN(targetNum) || targetNum <= 0) {
      alert('Please enter a valid target PKR amount.');
      return;
    }

    addSavingsGoal({
      name: name.trim(),
      target_amount: targetNum,
      current_amount: currNum,
      target_date: targetDate || undefined,
      category,
      auto_save_percent: autoSavePercent > 0 ? autoSavePercent : undefined,
    });

    setIsCreateModalOpen(false);
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setAutoSavePercent(0);
  };

  const handleGoalAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForAction) return;

    const num = parseFloat(actionAmount);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (actionType === 'deposit') {
      depositToSavingsGoal(selectedGoalForAction.id, num, selectedWalletId || undefined);
    } else {
      withdrawFromSavingsGoal(selectedGoalForAction.id, num, selectedWalletId || undefined);
    }

    setSelectedGoalForAction(null);
    setActionAmount('');
  };

  const totalSaved = savingsGoals.reduce((acc, g) => acc + g.current_amount, 0);
  const totalTarget = savingsGoals.reduce((acc, g) => acc + g.target_amount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">
            Savings Goals & Buckets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dedicated target funds for emergency, gadgets, hajj/umrah, and investments in PKR
          </p>
        </div>

        <button
          onClick={() => {
            if (wallets.length > 0) setSelectedWalletId(wallets[0].id);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Savings Target</span>
        </button>
      </div>

      {/* Aggregate Savings Metric Banner */}
      <div className="rounded-3xl bg-gradient-to-tr from-emerald-900/20 via-slate-100 dark:from-emerald-950/70 dark:via-slate-900/80 dark:to-purple-950/70 border border-emerald-500/30 p-6 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Total Saved Across Targets</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display mt-1">
            {formatPKR(totalSaved)}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Overall Progress: <span className="font-bold text-emerald-600 dark:text-emerald-400">{overallProgress}%</span> of {formatPKR(totalTarget)} combined goal
          </p>
        </div>

        {/* Big Progress bar */}
        <div className="w-full md:w-72">
          <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            <span>Overall Milestone</span>
            <span className="text-emerald-600 dark:text-emerald-400">{overallProgress}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savingsGoals.map((goal) => {
          const progress = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
          const isCompleted = goal.current_amount >= goal.target_amount;
          const remaining = Math.max(goal.target_amount - goal.current_amount, 0);

          return (
            <div
              key={goal.id}
              className={`rounded-3xl p-6 border backdrop-blur-xl shadow-xl relative overflow-hidden transition-all hover:scale-[1.01] ${
                isCompleted
                  ? 'bg-emerald-50/80 dark:bg-gradient-to-tr dark:from-emerald-950/50 dark:via-slate-900/80 dark:to-teal-950/50 border-emerald-500/50 shadow-emerald-500/10'
                  : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 hover:border-purple-400 dark:hover:border-white/20'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm ${
                      isCompleted ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-purple-600/20 text-purple-600 dark:text-purple-300'
                    }`}
                  >
                    {isCompleted ? <Award className="h-6 w-6 text-white" /> : <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{goal.name}</h3>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {goal.category} {goal.target_date ? `• By ${formatDate(goal.target_date)}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Delete savings goal "${goal.name}"?`)) deleteSavingsGoal(goal.id);
                  }}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Progress and Numbers */}
              <div className="space-y-2 mb-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{formatPKR(goal.current_amount)}</span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">/ {formatPKR(goal.target_amount)}</span>
                </div>

                <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-purple-600 to-indigo-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className={`font-bold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-300'}`}>
                    {progress}% Reached
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isCompleted ? 'Target Achieved! 🎉' : `${formatPKR(remaining)} left`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  onClick={() => {
                    setSelectedGoalForAction(goal);
                    setActionType('deposit');
                    if (wallets.length > 0) setSelectedWalletId(wallets[0].id);
                  }}
                  className="flex-1 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 text-center transition-colors"
                >
                  + Add Funds
                </button>

                <button
                  onClick={() => {
                    setSelectedGoalForAction(goal);
                    setActionType('withdraw');
                    if (wallets.length > 0) setSelectedWalletId(wallets[0].id);
                  }}
                  className="rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Withdraw
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deposit / Withdraw Action Modal */}
      {selectedGoalForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {actionType === 'deposit' ? 'Add Funds to Target' : 'Withdraw from Target'}
              </h3>
              <button
                onClick={() => setSelectedGoalForAction(null)}
                className="rounded-xl bg-slate-100 dark:bg-white/10 p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-purple-600 dark:text-purple-300 font-semibold mb-3">
              Target: {selectedGoalForAction.name}
            </p>

            <form onSubmit={handleGoalAction} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Amount (PKR)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 font-bold text-slate-400 text-lg">₨</span>
                  <input
                    type="number"
                    required
                    autoFocus
                    placeholder="0"
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 pl-11 pr-4 py-2.5 text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  {actionType === 'deposit' ? 'Deduct from Wallet' : 'Deposit into Wallet'}
                </label>
                <select
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/15 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Do not touch wallet balance</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({formatPKR(w.balance)})</option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedGoalForAction(null)}
                  className="rounded-2xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`rounded-2xl px-6 py-2 text-xs font-bold text-white shadow-lg ${
                    actionType === 'deposit'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                      : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                  }`}
                >
                  Confirm {actionType === 'deposit' ? 'Deposit' : 'Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Goal Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Savings Goal</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl bg-slate-100 dark:bg-white/10 p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Honda 125 Bike, MacBook M3, Emergency Fund, Umrah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Target (PKR)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 200000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Initial Deposit (PKR)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/15 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Vehicle">Vehicle / Bike</option>
                    <option value="Electronics">Electronics / Gadget</option>
                    <option value="Emergency">Emergency Fund</option>
                    <option value="Travel">Travel / Umrah</option>
                    <option value="Investment">Investment</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Target Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/15 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
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
                  className="rounded-2xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
