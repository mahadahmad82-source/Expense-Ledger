import React, { useState } from 'react';
import { useExpense, StartingWalletInput } from '../context/ExpenseContext';
import {
  Sparkles,
  Trash2,
  CheckCircle2,
  Plus,
  RotateCcw,
  X,
  Wallet as WalletIcon,
  Landmark,
  Smartphone,
  Coins,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { formatPKR } from '../lib/formatters';

interface StartFreshModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StartFreshModal: React.FC<StartFreshModalProps> = ({ isOpen, onClose }) => {
  const { startFreshWithRealData, clearDemoData, loadDemoData } = useExpense();

  const [activeMode, setActiveMode] = useState<'real_setup' | 'quick_wipe' | 'reload_demo'>('real_setup');
  
  // Starting wallets inputs
  const [walletsList, setWalletsList] = useState<StartingWalletInput[]>([
    { name: 'Cash in Hand', type: 'cash', balance: 15000, color: '#10B981', icon: 'Coins' },
    { name: 'Meezan / HBL Bank', type: 'bank', balance: 50000, color: '#3B82F6', icon: 'Landmark' },
    { name: 'JazzCash / EasyPaisa', type: 'jazzcash', balance: 5000, color: '#7C3AED', icon: 'Smartphone' },
  ]);

  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleUpdateWallet = (index: number, field: keyof StartingWalletInput, value: any) => {
    setWalletsList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddWalletRow = () => {
    setWalletsList(prev => [
      ...prev,
      { name: 'New Wallet', type: 'bank', balance: 0, color: '#06B6D4', icon: 'Landmark' },
    ]);
  };

  const handleRemoveWalletRow = (index: number) => {
    if (walletsList.length <= 1) return;
    setWalletsList(prev => prev.filter((_, i) => i !== index));
  };

  const totalStartingLiquidity = walletsList.reduce((acc, w) => acc + (Number(w.balance) || 0), 0);

  const handleExecuteStartFresh = () => {
    startFreshWithRealData(walletsList);
    setSuccessMessage('Your fresh account is ready with your actual starting balances!');
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  const handleExecuteQuickWipe = () => {
    clearDemoData();
    setSuccessMessage('All demo transactions and fake records wiped to zero!');
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  const handleExecuteReloadDemo = () => {
    loadDemoData();
    setSuccessMessage('Sample demo data successfully reloaded for exploration!');
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-white/20 p-6 sm:p-7 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-200 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500 to-emerald-500 text-white shadow-lg shadow-purple-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Start Fresh / Reset Data</h3>
              <p className="text-xs text-slate-400">Clear demo data and configure your real starting balances</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 p-2 text-slate-400 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-12 text-center space-y-3 animate-in zoom-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Ready for Real Tracking!</h4>
            <p className="text-xs text-emerald-300 max-w-md mx-auto">{successMessage}</p>
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* Mode Selection Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => setActiveMode('real_setup')}
                className={`py-2 px-2 text-xs font-bold rounded-xl transition-all ${
                  activeMode === 'real_setup'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Set Real Balances
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('quick_wipe')}
                className={`py-2 px-2 text-xs font-bold rounded-xl transition-all ${
                  activeMode === 'quick_wipe'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Clear to Zero
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('reload_demo')}
                className={`py-2 px-2 text-xs font-bold rounded-xl transition-all ${
                  activeMode === 'reload_demo'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Reload Demo
              </button>
            </div>

            {/* Mode 1: Set Real Balances */}
            {activeMode === 'real_setup' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-4">
                  <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                    ✨ <strong>Recommended</strong>: This will remove all mock transactions and initialize your real starting accounts so you can begin logging your actual income and expenses right away.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Your Starting Accounts & Balances (PKR)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddWalletRow}
                      className="flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Account</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {walletsList.map((w, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 p-2.5 hover:bg-white/10 transition-colors"
                      >
                        <select
                          value={w.type}
                          onChange={(e) => handleUpdateWallet(index, 'type', e.target.value as any)}
                          className="rounded-xl bg-slate-800 border border-white/10 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        >
                          <option value="cash">💵 Cash</option>
                          <option value="bank">🏦 Bank</option>
                          <option value="jazzcash">📱 JazzCash</option>
                          <option value="easypaisa">📱 EasyPaisa</option>
                          <option value="crypto">🪙 Crypto/Other</option>
                        </select>

                        <input
                          type="text"
                          value={w.name}
                          onChange={(e) => handleUpdateWallet(index, 'name', e.target.value)}
                          placeholder="Account Name"
                          className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />

                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400 font-mono">₨</span>
                          <input
                            type="number"
                            value={w.balance}
                            onChange={(e) => handleUpdateWallet(index, 'balance', Number(e.target.value))}
                            placeholder="0"
                            className="w-24 sm:w-28 rounded-xl bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs font-bold font-mono text-emerald-400 text-right focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>

                        {walletsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveWalletRow(index)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 p-3 mt-2">
                    <span className="text-xs font-semibold text-slate-300">Total Starting Cash & Wealth:</span>
                    <span className="text-base font-black text-emerald-400 font-mono">{formatPKR(totalStartingLiquidity)}</span>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteStartFresh}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                  >
                    <span>Start Real Tracking</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Mode 2: Quick Wipe to Zero */}
            {activeMode === 'quick_wipe' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-rose-950/40 border border-rose-500/30 p-4">
                  <h4 className="text-xs font-bold text-rose-300">Wipe All Transactions to Zero (0 PKR)</h4>
                  <p className="text-xs text-rose-200 mt-1 leading-relaxed">
                    This will delete all sample records, resetting your wallets to Rs. 0 balance with a clean transaction ledger.
                  </p>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteQuickWipe}
                    className="flex items-center gap-1.5 rounded-2xl bg-rose-600 hover:bg-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Confirm Wipe to Zero</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mode 3: Reload Sample Demo */}
            {activeMode === 'reload_demo' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-indigo-950/40 border border-indigo-500/30 p-4">
                  <h4 className="text-xs font-bold text-indigo-300">Reload Sample Demo Data</h4>
                  <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
                    Populates realistic Pakistani household expenses, salary income, utility bills (LESCO, K-Electric), budgets, and monthly ledgers so you can demo the analytics and calculators.
                  </p>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteReloadDemo}
                    className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reload Sample Demo</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
