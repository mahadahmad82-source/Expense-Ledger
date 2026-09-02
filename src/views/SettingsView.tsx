import React, { useState, useRef } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { WalletType, ThemeMode } from '../types';
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
  Edit2,
  Sun,
  Moon,
  Check,
  Zap,
  HelpCircle,
  FileSpreadsheet,
  LogOut,
  UserCheck
} from 'lucide-react';
import { formatPKR } from '../lib/formatters';
import { renderCategoryIcon } from '../lib/icons';

interface SettingsViewProps {
  onOpenStartFresh?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenStartFresh }) => {
  const {
    accounts,
    currentAccount,
    setIsAccountModalOpen,
    logout,
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
    theme,
    setTheme,
    clearDemoData,
    clearOnlyTransactions,
    loadDemoData,
    startFreshWithRealData,
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

  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 3500);
  };

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
    showAlert(`Wallet "${walletName}" added successfully!`);
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
    showAlert(`Category "${catName}" added!`);
  };

  const handleAddProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName.trim()) return;
    addProfile(profName.trim(), profAvatar);
    setIsProfileModalOpen(false);
    setProfName('');
    showAlert(`New profile "${profName}" created!`);
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
            showAlert('Backup successfully restored from JSON file!');
          } else {
            showAlert('Invalid backup JSON file format.', 'error');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const colorOptions = ['#7C3AED', '#3B82F6', '#10B981', '#F97316', '#F43F5E', '#06B6D4', '#EC4899', '#EAB308'];

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      
      {/* Toast Alert Banner */}
      {alertMsg && (
        <div
          className={`fixed top-20 right-4 z-50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl border animate-in slide-in-from-top-5 duration-200 ${
            alertMsg.type === 'success'
              ? 'bg-emerald-900/90 border-emerald-500/40 text-emerald-100'
              : 'bg-rose-900/90 border-rose-500/40 text-rose-100'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>{alertMsg.text}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">
          Settings & Configurations
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Themes, Start Fresh data tools, wallets, categories, PWA offline storage, and backups
        </p>
      </div>

      {/* 0. START FRESH WITH REAL DATA / CLEAR DEMO DATA (Featured Hero Section) */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600/15 via-purple-600/15 to-blue-600/15 border border-emerald-500/30 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Start Fresh / Clear Demo Data</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">Ready for Real Use</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Clear demo data and start fresh with your real account and bank balances.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {onOpenStartFresh && (
              <button
                onClick={onOpenStartFresh}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>Configure Real Accounts</span>
              </button>
            )}

            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all demo data and start with 0 PKR?')) {
                  clearDemoData();
                  showAlert('Demo data cleared! Wallets reset to Rs. 0.');
                }
              }}
              className="flex items-center gap-1.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/20 px-4 py-2 text-xs font-semibold transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
              <span>Clear to Zero</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Reload realistic demo transactions and sample data?')) {
                  loadDemoData();
                  showAlert('Demo sample data reloaded.');
                }
              }}
              className="flex items-center gap-1.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 px-4 py-2 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 text-indigo-500" />
              <span>Reload Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Theme Selection: Dark Mode vs Light Mode */}
      <div className="rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-6 backdrop-blur-xl shadow-xl space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sun className="h-5 w-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Display Theme (Dark & Light Mode)</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Choose between Midnight Glassmorphism or Clean High-Contrast Light</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Dark Mode Card */}
          <div
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-between rounded-2xl p-4 border transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-purple-900/30 border-purple-500 ring-2 ring-purple-500/40 shadow-xl'
                : 'bg-slate-900/40 border-slate-700 hover:border-slate-500 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a0514] text-purple-400 border border-purple-500/30">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Midnight Dark Theme</p>
                <p className="text-[10px] text-slate-400">Deep purple mesh with glass cards</p>
              </div>
            </div>

            {theme === 'dark' && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </span>
            )}
          </div>

          {/* Light Mode Card */}
          <div
            onClick={() => setTheme('light')}
            className={`flex items-center justify-between rounded-2xl p-4 border transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/40 shadow-xl text-slate-900'
                : 'bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-400 text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 border border-amber-300">
                <Sun className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Crystal Light Theme</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Bright daylight mode with crisp text</p>
              </div>
            </div>

            {theme === 'light' && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Account & Authentication Management */}
      {currentAccount && (
        <div className="rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-6 backdrop-blur-xl shadow-xl space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Account</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Profiles and data below are securely saved inside this account
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-500/20 px-3 py-1.5 text-xs font-bold transition-all"
              >
                <span>Switch Account ({accounts.length})</span>
              </button>

              <button
                type="button"
                onClick={() => logout()}
                className="flex items-center gap-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/20 px-3 py-1.5 text-xs font-bold transition-all"
                title="Log out to login screen"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-500/5 dark:bg-white/5 border border-purple-500/20">
            <div className="flex items-center gap-3">
              <img
                src={currentAccount.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={currentAccount.name}
                className="h-12 w-12 rounded-2xl object-cover ring-2 ring-purple-500/30"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{currentAccount.name}</h4>
                  {currentAccount.is_owner && (
                    <span className="rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-black uppercase">
                      Owner Account
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{currentAccount.email}</p>
                <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">
                  Account ID: <code className="font-mono">{currentAccount.id}</code> • Profiles inside: {profiles.length}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                Active Session
              </span>
              <span className="text-[10px]">Isolated Local Storage</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Profile Management */}
      <div className="rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-6 backdrop-blur-xl shadow-xl space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Multi-Profile Support</h3>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
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
                    ? 'bg-purple-50 dark:bg-purple-600/20 border-purple-500 shadow-md shadow-purple-600/20'
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={p.avatar} alt={p.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-500/50" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{p.currency} Account</p>
                  </div>
                </div>

                {isActive && (
                  <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[9px] font-extrabold text-purple-700 dark:text-purple-300">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Wallets & Accounts Management */}
      <div className="rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-6 backdrop-blur-xl shadow-xl space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <WalletIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Wallets & Bank Accounts ({wallets.length})</h3>
          </div>

          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Wallet</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3.5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm"
                  style={{ backgroundColor: `${w.color}30`, color: w.color }}
                >
                  {renderCategoryIcon(w.icon, "w-4 h-4")}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{w.name}</p>
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">{formatPKR(w.balance)}</p>
                </div>
              </div>

              {wallets.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm(`Delete wallet "${w.name}"?`)) {
                      deleteWallet(w.id);
                      showAlert(`Wallet "${w.name}" deleted.`);
                    }
                  }}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Categories Management */}
      <div className="rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-6 backdrop-blur-xl shadow-xl space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Tag className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Spending Categories ({categories.length})</h3>
          </div>

          <button
            onClick={() => setIsCatModalOpen(true)}
            className="flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Category</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-xs font-semibold text-slate-800 dark:text-white">{c.name}</span>
              <span className="text-[10px] text-slate-400 uppercase">({c.type})</span>
              <button
                onClick={() => {
                  if (categories.length > 3 && confirm(`Delete category "${c.name}"?`)) {
                    deleteCategory(c.id);
                    showAlert(`Category "${c.name}" removed.`);
                  }
                }}
                className="text-slate-400 hover:text-rose-500 ml-1"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Security & System Preferences */}
      <div className="rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-6 backdrop-blur-xl shadow-xl space-y-4 transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <span>Security & System Preferences</span>
        </h3>

        <div className="divide-y divide-slate-200 dark:divide-white/5">
          {/* Biometric Lock Toggle */}
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span>Biometric / Screen Passcode Lock</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Require biometric fingerprint / FaceID or PIN unlock when opening app
              </p>
            </div>

            <input
              type="checkbox"
              checked={isBiometricEnabled}
              onChange={(e) => {
                setIsBiometricEnabled(e.target.checked);
                showAlert(`Biometric lock ${e.target.checked ? 'enabled' : 'disabled'}.`);
              }}
              className="h-5 w-5 accent-purple-600 cursor-pointer"
            />
          </div>

          {/* Push Notifications Toggle */}
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Bill Due Date & Budget Threshold Alerts</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Notify when utility bills (LESCO, SSGC, Internet) are due or 80% budget reached
              </p>
            </div>

            <input
              type="checkbox"
              checked={isPushEnabled}
              onChange={(e) => {
                setIsPushEnabled(e.target.checked);
                showAlert(`Push notifications ${e.target.checked ? 'enabled' : 'disabled'}.`);
              }}
              className="h-5 w-5 accent-purple-600 cursor-pointer"
            />
          </div>

          {/* Currency */}
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Default Currency</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Hardcoded to Pakistani Rupee (PKR / ₨) throughout the application
              </p>
            </div>

            <span className="rounded-xl bg-purple-500/15 px-3 py-1 text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-500/30">
              PKR (₨) Active
            </span>
          </div>
        </div>
      </div>

      {/* 6. Backup, Restore & Data Reset */}
      <div className="rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-6 backdrop-blur-xl shadow-xl space-y-4 transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
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
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 p-3 text-xs font-bold text-slate-800 dark:text-white transition-colors"
          >
            <Download className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>Export JSON Backup</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 p-3 text-xs font-bold text-slate-800 dark:text-white transition-colors"
          >
            <Upload className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Restore JSON Backup</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Wipe all transactions and start fresh with empty accounts?')) {
                clearOnlyTransactions();
                showAlert('All transaction records cleared.');
              }
            }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 p-3 text-xs font-bold text-rose-700 dark:text-rose-300 transition-colors"
          >
            <Trash2 className="h-4 w-4 text-rose-500" />
            <span>Clear Transactions</span>
          </button>
        </div>
      </div>

      {/* 7. About Application & Icon Branding */}
      <div className="rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-6 backdrop-blur-xl shadow-xl transition-colors">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="relative h-20 w-20 shrink-0 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/30 ring-2 ring-purple-500/30 bg-slate-900">
            <img
              src="/app-icon.png"
              alt="ExpensePK Official App Icon"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                ExpensePK
              </h4>
              <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-purple-700 dark:text-purple-300 border border-purple-500/30">
                v2.4 Pro
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                Offline PWA
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personal & Multi-Account Financial Tracker tailored for Pakistani Rupees (PKR / ₨).
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
              Protected by Local Encrypted Storage & Biometric Locks. All data stays strictly on your device.
            </p>
          </div>
        </div>
      </div>

      {/* Add Wallet Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Wallet / Bank Account</h3>
              <button
                onClick={() => setIsWalletModalOpen(false)}
                className="rounded-xl bg-slate-100 dark:bg-white/10 p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddWallet} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Wallet / Bank Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meezan Bank, JazzCash, Nayapay, Cash in Hand"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Account Type
                  </label>
                  <select
                    value={walletType}
                    onChange={(e) => setWalletType(e.target.value as any)}
                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/15 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="cash">Cash in Hand</option>
                    <option value="mobile_wallet">Mobile Wallet</option>
                    <option value="crypto">Savings / Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Opening Balance (PKR)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={walletBalance}
                    onChange={(e) => setWalletBalance(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Theme Color
                </label>
                <div className="flex gap-2">
                  {colorOptions.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setWalletColor(c)}
                      className={`h-7 w-7 rounded-full transition-transform ${walletColor === c ? 'scale-125 ring-2 ring-purple-600 dark:ring-white' : 'opacity-80'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsWalletModalOpen(false)}
                  className="rounded-2xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
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
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Custom Category</h3>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="rounded-xl bg-slate-100 dark:bg-white/10 p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddCat} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gym & Fitness, Gaming, Pet Care, Freelance"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Classification
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCatType('expense')}
                    className={`py-2 text-xs font-bold rounded-xl ${catType === 'expense' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'}`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatType('income')}
                    className={`py-2 text-xs font-bold rounded-xl ${catType === 'income' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'}`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Tag Color
                </label>
                <div className="flex gap-2">
                  {colorOptions.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCatColor(c)}
                      className={`h-7 w-7 rounded-full transition-transform ${catColor === c ? 'scale-125 ring-2 ring-purple-600 dark:ring-white' : 'opacity-80'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="rounded-2xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
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
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Profile</h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="rounded-xl bg-slate-100 dark:bg-white/10 p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddProfile} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Profile Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Freelance Client, Household, Side Business"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="rounded-2xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
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
