import React, { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Bill } from '../types';
import {
  FileCheck2,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Repeat,
  X,
  Wallet as WalletIcon
} from 'lucide-react';
import { formatPKR, formatDate } from '../lib/formatters';
import { renderCategoryIcon } from '../lib/icons';

export const BillsView: React.FC = () => {
  const {
    bills,
    categories,
    wallets,
    addBill,
    updateBill,
    deleteBill,
    markBillAsPaid,
    theme,
  } = useExpense();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  // Mark as paid popup for wallet selection
  const [payingBill, setPayingBill] = useState<Bill | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [recurrencePattern, setRecurrencePattern] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  const today = new Date().toISOString().split('T')[0];

  const sortedBills = useMemo(() => {
    return [...bills].sort((a, b) => {
      if (a.is_paid !== b.is_paid) return a.is_paid ? 1 : -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  }, [bills]);

  const handleOpenCreate = () => {
    setEditingBill(null);
    setTitle('');
    setAmount('');
    setDueDate(new Date().toISOString().split('T')[0]);
    setIsRecurring(true);
    setRecurrencePattern('monthly');
    const expCats = categories.filter(c => c.type === 'expense');
    if (expCats.length > 0) setCategoryId(expCats[0].id);
    setIsCreateModalOpen(true);
  };

  const handleSaveBill = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (editingBill) {
      updateBill(editingBill.id, {
        title: title.trim(),
        amount: num,
        due_date: dueDate,
        category_id: categoryId,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : undefined,
      });
    } else {
      addBill({
        title: title.trim(),
        amount: num,
        due_date: dueDate,
        category_id: categoryId,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : undefined,
        is_paid: false,
      });
    }

    setIsCreateModalOpen(false);
  };

  const handleConfirmPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingBill || !selectedWalletId) return;
    markBillAsPaid(payingBill.id, selectedWalletId);
    setPayingBill(null);
  };

  const totalPending = bills.filter(b => !b.is_paid).reduce((acc, b) => acc + b.amount, 0);
  const totalPaid = bills.filter(b => b.is_paid).reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">
            Bills & Reminders
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track utility bills, subscriptions, Wi-Fi, rent, and one-tap payments in PKR
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-amber-600/30 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Bill</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-amber-500/30 p-5 backdrop-blur-xl shadow-xl flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending Dues (This Cycle)</span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-300 font-mono mt-1">{formatPKR(totalPending)}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{bills.filter(b => !b.is_paid).length} bills awaiting payment</p>
          </div>
          <div className="rounded-2xl bg-amber-500/20 p-3 text-amber-600 dark:text-amber-400">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-emerald-500/30 p-5 backdrop-blur-xl shadow-xl flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Cleared & Paid</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-300 font-mono mt-1">{formatPKR(totalPaid)}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{bills.filter(b => b.is_paid).length} bills successfully cleared</p>
          </div>
          <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Bills Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedBills.map((bill) => {
          const cat = catMap.get(bill.category_id);
          const isOverdue = !bill.is_paid && bill.due_date < today;
          const isDueToday = !bill.is_paid && bill.due_date === today;

          return (
            <div
              key={bill.id}
              className={`rounded-3xl p-6 border backdrop-blur-xl shadow-xl transition-all relative overflow-hidden ${
                bill.is_paid
                  ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 opacity-80'
                  : isOverdue
                  ? 'bg-rose-50/90 dark:bg-rose-950/20 border-rose-500/50'
                  : isDueToday
                  ? 'bg-amber-50/90 dark:bg-amber-950/20 border-amber-500/50'
                  : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 hover:border-purple-400 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-sm"
                    style={{ backgroundColor: `${cat?.color || '#F59E0B'}30`, color: cat?.color || '#F59E0B' }}
                  >
                    {renderCategoryIcon(cat?.icon || 'FileCheck2', "w-5 h-5")}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{bill.title}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{cat?.name || 'Utility'}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Delete bill "${bill.title}"?`)) deleteBill(bill.id);
                  }}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Amount & Due Date */}
              <div className="my-4 py-2 border-y border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Bill Amount</span>
                  <p className="text-lg font-black text-slate-900 dark:text-white font-mono">{formatPKR(bill.amount)}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Due Date</span>
                  <p className={`text-xs font-bold ${isOverdue ? 'text-rose-600 dark:text-rose-400' : isDueToday ? 'text-amber-600 dark:text-amber-300' : 'text-slate-600 dark:text-slate-300'}`}>
                    {formatDate(bill.due_date)}
                  </p>
                </div>
              </div>

              {/* Status and Action */}
              <div className="flex items-center justify-between pt-1">
                <span
                  className={`text-xs font-bold flex items-center gap-1 ${
                    bill.is_paid
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : isOverdue
                      ? 'text-rose-600 dark:text-rose-400'
                      : isDueToday
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {bill.is_paid ? <CheckCircle2 className="h-4 w-4" /> : isOverdue ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  <span>{bill.is_paid ? 'Paid' : isOverdue ? 'Overdue!' : isDueToday ? 'Due Today!' : 'Upcoming'}</span>
                </span>

                {!bill.is_paid && (
                  <button
                    onClick={() => {
                      setPayingBill(bill);
                      if (wallets.length > 0) setSelectedWalletId(wallets[0].id);
                    }}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
                  >
                    Mark Paid ✓
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pay Bill & Deduct Wallet Modal */}
      {payingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Bill Payment</h3>
              <button
                onClick={() => setPayingBill(null)}
                className="rounded-xl bg-slate-100 dark:bg-white/10 p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-1 font-semibold">{payingBill.title}</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mb-4">{formatPKR(payingBill.amount)}</p>

            <form onSubmit={handleConfirmPay} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Pay From Wallet / Bank
                </label>
                <select
                  required
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/15 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatPKR(w.balance)})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  An expense transaction will be logged instantly and marked on your monthly ledger.
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setPayingBill(null)}
                  className="rounded-2xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Bill Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Bill Reminder</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl bg-slate-100 dark:bg-white/10 p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBill} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Bill Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nayatel Fiber, K-Electric Bill, Gym Membership"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Amount (PKR)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/15 px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/15 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {categories.filter(c => c.type === 'expense').map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>Recurring Monthly Bill?</span>
                </label>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 accent-purple-600 cursor-pointer"
                />
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
                  className="rounded-2xl bg-amber-600 px-6 py-2 text-xs font-bold text-white hover:bg-amber-500 shadow-lg shadow-amber-600/30"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
