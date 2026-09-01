import React, { useState, useEffect, useRef } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { TransactionType, RecurrencePattern } from '../types';
import {
  X,
  Upload,
  Camera,
  Trash2,
  Calendar,
  Wallet as WalletIcon,
  Tag,
  Repeat,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRightLeft
} from 'lucide-react';
import { formatPKR } from '../lib/formatters';
import { renderCategoryIcon } from '../lib/icons';

export const AddTransactionModal: React.FC = () => {
  const {
    isAddTxOpen,
    setIsAddTxOpen,
    categories,
    wallets,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    editingTransaction,
    setEditingTransaction,
    transferFunds,
  } = useExpense();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('');
  const [toWalletId, setToWalletId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('monthly');

  // Filter categories based on transaction type
  const availableCategories = categories.filter(c => c.type === (type === 'income' ? 'income' : 'expense'));

  // Pre-fill state when editing an existing transaction or opening fresh
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setCategoryId(editingTransaction.category_id);
      setWalletId(editingTransaction.wallet_id);
      setToWalletId(editingTransaction.to_wallet_id || '');
      setDate(editingTransaction.date);
      setNote(editingTransaction.note || '');
      setReceiptUrl(editingTransaction.receipt_url);
      setIsRecurring(!!editingTransaction.is_recurring);
      setRecurrencePattern(editingTransaction.recurrence_pattern || 'monthly');
    } else {
      setType('expense');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setReceiptUrl(undefined);
      setIsRecurring(false);
      setRecurrencePattern('monthly');
      
      // Defaults
      const expCats = categories.filter(c => c.type === 'expense');
      if (expCats.length > 0) setCategoryId(expCats[0].id);
      if (wallets.length > 0) {
        setWalletId(wallets[0].id);
        if (wallets.length > 1) setToWalletId(wallets[1].id);
      }
    }
  }, [editingTransaction, isAddTxOpen, categories, wallets]);

  // When type changes, ensure valid category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType !== 'transfer') {
      const match = categories.filter(c => c.type === (newType === 'income' ? 'income' : 'expense'));
      if (match.length > 0) setCategoryId(match[0].id);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid positive PKR amount');
      return;
    }

    if (type === 'transfer') {
      if (!walletId || !toWalletId || walletId === toWalletId) {
        alert('Please select two distinct wallets for transfer.');
        return;
      }
      transferFunds(walletId, toWalletId, numAmount, note);
      handleClose();
      return;
    }

    if (!categoryId) {
      alert('Please choose a category.');
      return;
    }
    if (!walletId) {
      alert('Please select a wallet.');
      return;
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        amount: numAmount,
        type,
        category_id: categoryId,
        wallet_id: walletId,
        date,
        note: note.trim() || undefined,
        receipt_url: receiptUrl,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : undefined,
      });
    } else {
      addTransaction({
        amount: numAmount,
        type,
        category_id: categoryId,
        wallet_id: walletId,
        date,
        note: note.trim() || undefined,
        receipt_url: receiptUrl,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : undefined,
      });
    }

    handleClose();
  };

  const handleDelete = () => {
    if (editingTransaction && confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(editingTransaction.id);
      handleClose();
    }
  };

  const handleClose = () => {
    setEditingTransaction(null);
    setIsAddTxOpen(false);
  };

  const quickAmounts = [500, 1000, 2000, 5000, 10000, 50000];

  if (!isAddTxOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-white/15 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h2 className="text-base sm:text-lg font-bold text-white">
            {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
          </h2>
          <div className="flex items-center gap-2">
            {editingTransaction && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl bg-rose-500/15 p-2 text-rose-400 hover:bg-rose-500/25 transition-colors"
                title="Delete Transaction"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="rounded-xl bg-white/10 p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Type Switcher Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-white/5 border border-white/10 mb-5">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              type === 'income'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('transfer')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              type === 'transfer'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Transfer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Amount Input with PKR prefix */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Amount (PKR)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-bold text-slate-400 text-lg">₨</span>
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-2xl bg-white/5 border border-white/15 pl-11 pr-4 py-3 text-2xl font-black text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => {
                    const curr = parseFloat(amount) || 0;
                    setAmount(String(curr + amt));
                  }}
                  className="rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-300 transition-colors"
                >
                  +{formatPKR(amt, false)}
                </button>
              ))}
            </div>
          </div>

          {/* Standard Fields (Category & Wallet) */}
          {type !== 'transfer' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category Dropdown */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-2xl bg-slate-800 border border-white/15 px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {availableCategories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Wallet Selector */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Paid via / Wallet
                </label>
                <select
                  required
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full rounded-2xl bg-slate-800 border border-white/15 px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id} className="bg-slate-900 text-white">
                      {w.name} ({formatPKR(w.balance)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            /* Wallet Transfer Source and Destination */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  From Wallet
                </label>
                <select
                  required
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full rounded-2xl bg-slate-800 border border-white/15 px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id} className="bg-slate-900 text-white">
                      {w.name} ({formatPKR(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  To Destination Wallet
                </label>
                <select
                  required
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full rounded-2xl bg-slate-800 border border-white/15 px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id} className="bg-slate-900 text-white">
                      {w.name} ({formatPKR(w.balance)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Date & Recurring Option */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {type !== 'transfer' && (
              <div className="flex flex-col justify-end">
                <div className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5">
                  <label htmlFor="recurring-toggle" className="text-xs font-semibold text-slate-300 cursor-pointer flex items-center gap-1.5">
                    <Repeat className="h-3.5 w-3.5 text-purple-400" />
                    <span>Recurring?</span>
                  </label>
                  <input
                    id="recurring-toggle"
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="h-4 w-4 rounded accent-purple-600 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Recurrence Frequency selector if enabled */}
          {isRecurring && type !== 'transfer' && (
            <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-3">
              <label className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider block mb-1">
                Recurrence Frequency
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((pat) => (
                  <button
                    type="button"
                    key={pat}
                    onClick={() => setRecurrencePattern(pat)}
                    className={`py-1.5 text-[11px] font-bold capitalize rounded-xl transition-all ${
                      recurrencePattern === pat
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Note / Description */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Note / Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Lunch with team, monthly groceries at Imtiaz, fuel pump"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Receipt Image Attachment */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Receipt / Bill Photo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            {receiptUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-slate-950 p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={receiptUrl} alt="Receipt" className="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <p className="text-xs font-bold text-white">Receipt attached</p>
                    <p className="text-[10px] text-emerald-400">Ready to save</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptUrl(undefined)}
                  className="rounded-xl bg-rose-500/20 p-2 text-rose-400 hover:bg-rose-500/30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/5 p-3 text-xs text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
              >
                <Camera className="h-4 w-4 text-purple-400" />
                <span>Upload or take photo of receipt</span>
              </div>
            )}
          </div>

          {/* Submit Action Buttons */}
          <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-2xl px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:opacity-95 active:scale-95 transition-all"
            >
              {editingTransaction ? 'Save Changes' : (type === 'transfer' ? 'Execute Transfer' : 'Record Transaction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
