import React, { useState, useRef } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { WalletType } from '../types';
import {
  Settings,
  Users,
  Wallet as WalletIcon,
  Tag,
  ShieldCheck,
  Bell,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Smartphone,
  Sparkles,
  Database,
  Lock,
  X,
  CreditCard,
  Edit2
} from 'lucide-react';
import { formatPKR } from '../lib/formatters';
import { renderCategoryIcon } from '../lib/icons';

export const SettingsView: React.FC = () => {
  const {
    profiles,
    activeProfile,
    switchProfile,
    addProfile,
    wallets,
    addWallet,
    updateWallet,
    deleteWallet,
    categories,
    addCategory,
    deleteCategory,
    isBiometricEnabled,
    setIsBiometricEnabled,
    isPushEnabled,
    setIsPushEnabled,
    exportAllDataJSON,
    importDataJSON,
    resetToInitialData,
  } = useExpense();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal States
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // New Wallet Form
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState<WalletType>('bank');
  const [walletBalance, setWalletBalance] = useState('');
  const [walletColor, setWalletColor] = useState('#3B82F6');
  const [walletIcon, setWalletIcon] = useState('Landmark');

  // New Category Form
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'expense' | 'income'>('expense');
  const [catColor, setCatColor] = useState('#8B5CF6');
  const [catIcon, setCatIcon] = useState('Tag');

  // New Profile Form
  const [profName, setProfName] = useState('');
  const [profAvatar, setProfAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256');

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(walletBalance) || 0;
    addWallet({
      name: walletName.trim(),
      type: walletType,
      balance: bal,
      color: walletColor,
      icon: walletIcon,
      is_default: false,
    });
    setIsWalletModalOpen(false);
    setWalletName('');
    setWalletBalance('');
  };

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    addCategory({
      name: catName.trim(),
      type: catType,
      color: catColor,
      icon: catIcon,
    });
    setIsCatModalOpen(false);
    setCatName('');
  };

  const handleAddProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName.trim()) return;
    addProfile(profName.trim(), profAvatar);
    setIsProfileModalOpen(false);
    setProfName('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const success = importDataJSON(text);
          if (success) {
            alert('Backup successfully restored!');
          } else {
            alert('Invalid backup JSON file.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const colorOptions = ['#7C3AED', '#3B82F6', '#10B981', '#F97316', '#F43F5E', '#06B6D4', '#EC4899', '#EAB308'];
  const iconOptions = ['Wallet', 'CreditCard', 'Landmark', 'Smartphone', 'Coins', 'Banknote', 'Zap', 'ShoppingBag', 'Car', 'Utensils', 'Home', 'Shield'];

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Header Bar */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
          Settings & Configurations
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage profiles, bank accounts, categories, PWA offline storage, and data backups
        </p>
      </div>

      {/* 1. Profile Management */}
      <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="h-5 w-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Multi-Profile Support</h3>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Profile</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {profiles.map((p) => {
            const isActive = p.id === activeProfile.id;

            return (
              <div
                key={p.id}
                onClick={() => switchProfile(p.id)}
                className={`flex items-center justify-between rounded-2xl p-3 border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600/20 border-purple-500 shadow-md shadow-purple-600/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={p.avatar} alt={p.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-500/50" />
                  <div>
                    <p className="text-xs font-bold text-white">{p.name}</p>
                    <p className="text-[10px] text-slate-400">{p.currency} Account</p>
                  </div>
                </div>

                {isActive && (
                  <span className="rounded-full bg-purple-500/30 px-2 py-0.5 text-[9px] font-extrabold text-purple-300">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Wallets & Accounts Management */}
      <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <WalletIcon className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Wallets & Bank Accounts ({wallets.length})</h3>
          </div>

          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Wallet</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 p-3.5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: `${w.color}30`, color: w.color }}
                >
                  {renderCategoryIcon(w.icon, "w-4 h-4")}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{w.name}</p>
                  <p className="text-xs font-black text-emerald-400 font-mono">{formatPKR(w.balance)}</p>
                </div>
              </div>

              {wallets.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm(`Delete wallet "${w.name}"?`)) deleteWallet(w.id);
                  }}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Categories Management */}
      <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Tag className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Spending Categories ({categories.length})</h3>
          </div>

          <button
            onClick={() => setIsCatModalOpen(true)}
            className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Category</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-3 py-1.5 hover:bg-white/10 transition-colors"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-xs font-semibold text-white">{c.name}</span>
              <span className="text-[10px] text-slate-500 uppercase">({c.type})</span>
              <button
                onClick={() => {
                  if (categories.length > 3 && confirm(`Delete category "${c.name}"?`)) {
                    deleteCategory(c.id);
                  }
                }}
                className="text-slate-500 hover:text-rose-400 ml-1"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Security & Preferences (Biometric & Notifications) */}
      <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-purple-400" />
          <span>Security & System Preferences</span>
        </h3>

        <div className="divide-y divide-white/5">
          {/* Biometric Lock Toggle */}
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-purple-400" />
                <span>Biometric WebAuthn Screen Lock</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Require FaceID / Fingerprint / Passcode to view financial records
              </p>
            </div>

            <input
              type="checkbox"
              checked={isBiometricEnabled}
              onChange={(e) => setIsBiometricEnabled(e.target.checked)}
              className="h-5 w-5 accent-purple-600 cursor-pointer"
            />
          </div>

          {/* Push Notifications Toggle */}
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-cyan-400" />
                <span>Bill Due Date & Budget Threshold Alerts</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Notify when bills are upcoming or when category spending reaches 80%
              </p>
            </div>

            <input
              type="checkbox"
              checked={isPushEnabled}
              onChange={(e) => setIsPushEnabled(e.target.checked)}
              className="h-5 w-5 accent-purple-600 cursor-pointer"
            />
          </div>

          {/* Hardcoded Currency */}
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-xs font-bold text-white">Default Currency</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                All calculations and formatting hardcoded to Pakistani Rupee (PKR / ₨)
              </p>
            </div>

            <span className="rounded-xl bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300 border border-purple-500/30">
              PKR (₨) Hardcoded
            </span>
          </div>
        </div>
      </div>

      {/* 5. Backup, Restore & Reset */}
      <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="h-5 w-5 text-indigo-400" />
          <span>Data Backup, Export & Reset</span>
        </h3>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileUpload}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            onClick={exportAllDataJSON}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-3 text-xs font-bold text-white transition-colors"
          >
            <Download className="h-4 w-4 text-purple-400" />
            <span>Export JSON Backup</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-3 text-xs font-bold text-white transition-colors"
          >
            <Upload className="h-4 w-4 text-emerald-400" />
            <span>Restore JSON Backup</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Reset all transactions and ledgers back to demo sample state?')) {
                resetToInitialData();
              }
            }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 p-3 text-xs font-bold text-rose-300 transition-colors"
          >
            <RotateCcw className="h-4 w-4 text-rose-400" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Add Wallet Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">Add Wallet / Bank</h3>
              <button
                onClick={() => setIsWalletModalOpen(false)}
                className="rounded-xl bg-white/10 p-1.5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddWallet} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Wallet / Bank Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meezan Bank, JazzCash, Nayapay, Cash in Hand"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Account Type
                  </label>
                  <select
                    value={walletType}
                    onChange={(e) => setWalletType(e.target.value as any)}
                    className="w-full rounded-2xl bg-slate-800 border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="cash">Cash in Hand</option>
                    <option value="mobile_wallet">Mobile Wallet</option>
                    <option value="crypto">Savings / Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Opening Balance (PKR)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={walletBalance}
                    onChange={(e) => setWalletBalance(e.target.value)}
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Theme Color
                </label>
                <div className="flex gap-2">
                  {colorOptions.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setWalletColor(c)}
                      className={`h-7 w-7 rounded-full transition-transform ${walletColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-80'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsWalletModalOpen(false)}
                  className="rounded-2xl px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30"
                >
                  Save Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">Add Custom Category</h3>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="rounded-xl bg-white/10 p-1.5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddCat} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gym & Fitness, Gaming, Pet Care, Freelance"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Classification
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCatType('expense')}
                    className={`py-2 text-xs font-bold rounded-xl ${catType === 'expense' ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-400'}`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatType('income')}
                    className={`py-2 text-xs font-bold rounded-xl ${catType === 'income' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-400'}`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Tag Color
                </label>
                <div className="flex gap-2">
                  {colorOptions.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCatColor(c)}
                      className={`h-7 w-7 rounded-full transition-transform ${catColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-80'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="rounded-2xl px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-cyan-600 px-6 py-2 text-xs font-bold text-white hover:bg-cyan-500 shadow-lg shadow-cyan-600/30"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">Create New Profile</h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="rounded-xl bg-white/10 p-1.5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddProfile} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Profile Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Freelance Client, Household, Side Business"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="rounded-2xl px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-purple-600 px-6 py-2 text-xs font-bold text-white hover:bg-purple-500 shadow-lg shadow-purple-600/30"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
