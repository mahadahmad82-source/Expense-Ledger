import React, { useState, useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { X, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { formatPKR } from '../lib/formatters';

export const TransferModal: React.FC = () => {
  const { isTransferOpen, setIsTransferOpen, wallets, transferFunds } = useExpense();

  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (wallets.length >= 2) {
      setFromWalletId(wallets[0].id);
      setToWalletId(wallets[1].id);
    } else if (wallets.length === 1) {
      setFromWalletId(wallets[0].id);
    }
  }, [wallets, isTransferOpen]);

  if (!isTransferOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (!fromWalletId || !toWalletId || fromWalletId === toWalletId) {
      alert('Please select two distinct wallets.');
      return;
    }

    const sourceWallet = wallets.find(w => w.id === fromWalletId);
    if (sourceWallet && sourceWallet.balance < numAmount) {
      if (!confirm(`Warning: Selected source wallet only has ${formatPKR(sourceWallet.balance)}. Proceed anyway?`)) {
        return;
      }
    }

    transferFunds(fromWalletId, toWalletId, numAmount, note.trim() || undefined);
    setIsTransferOpen(false);
    setAmount('');
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-indigo-500/20 p-2 text-indigo-400">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Wallet Transfer</h3>
              <p className="text-[11px] text-slate-400">Move funds between PKR accounts</p>
            </div>
          </div>
          <button
            onClick={() => setIsTransferOpen(false)}
            className="rounded-xl bg-white/10 p-2 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Transfer Amount (PKR)
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
                className="w-full rounded-2xl bg-white/5 border border-white/15 pl-11 pr-4 py-3 text-2xl font-black text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                From Wallet
              </label>
              <select
                value={fromWalletId}
                onChange={(e) => setFromWalletId(e.target.value)}
                className="w-full rounded-2xl bg-slate-800 border border-white/15 px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatPKR(w.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                To Wallet
              </label>
              <select
                value={toWalletId}
                onChange={(e) => setToWalletId(e.target.value)}
                className="w-full rounded-2xl bg-slate-800 border border-white/15 px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatPKR(w.balance)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. ATM withdrawal for cash, Bank transfer to EasyPaisa"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsTransferOpen(false)}
              className="rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all"
            >
              Transfer Funds
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
