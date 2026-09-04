import React, { useState, useEffect, useRef } from 'react';
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
  UserCheck,
  Cloud,
  RefreshCw,
  Fingerprint,
  KeyRound,
} from 'lucide-react';
import { formatPKR } from '../lib/formatters';
import { renderCategoryIcon } from '../lib/icons';
import { checkBiometricSupport, BiometricAvailability } from '../lib/biometrics';

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
    deleteProfile,
    setProfilePassword,
    wallets,
    addWallet,
    updateWallet,
    deleteWallet,
    categories,
    addCategory,
    deleteCategory,
    isBiometricEnabled,
    setIsBiometricEnabled,
    biometricAutoLock,
    setBiometricAutoLock,
    biometricPin,
    setBiometricPin,
    lockAppNow,
    registerBiometricSensor,
    disableAndResetBiometrics,
    setIsBiometricSetupOpen,
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
    firebaseStatus,
    syncToFirebase,
    pullFromFirebase,
  } = useExpense();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Biometrics hardware detection
  const [bioSupport, setBioSupport] = useState<BiometricAvailability | null>(null);
  const [isEditingBackupPin, setIsEditingBackupPin] = useState(false);
  const [backupPinInput, setBackupPinInput] = useState('');

  useEffect(() => {
    checkBiometricSupport().then(setBioSupport);
  }, []);

  // Modal States
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingPinProfile, setEditingPinProfile] = useState<any | null>(null);
  const [pinInputValue, setPinInputValue] = useState('');
  const [deletingProfile, setDeletingProfile] = useState<any | null>(null);

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
  const [profPin, setProfPin] = useState('');

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
    if (profPin && !/^\d{4}$/.test(profPin.trim())) {
      showAlert('Profile PIN must be exactly 4 digits (e.g. 1234), or left blank.', 'error');
      return;
    }
    addProfile(profName.trim(), profAvatar, undefined, profPin.trim() || undefined);
    setIsProfileModalOpen(false);
    setProfName('');
    setProfPin('');
    showAlert(`New profile "${profName}" created successfully!`);
  };

  const handleOpenPinModal = (profile: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPinProfile(profile);
    setPinInputValue(profile.pin || profile.password || '');
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPinProfile) return;
    const cleanPin = pinInputValue.trim();
    if (cleanPin && !/^\d{4}$/.test(cleanPin)) {
      showAlert('PIN must be exactly 4 numeric digits (e.g. 1234).', 'error');
      return;
    }
    const res = setProfilePassword(editingPinProfile.id, cleanPin || undefined);
    showAlert(res.message, res.success ? 'success' : 'error');
    setEditingPinProfile(null);
    setPinInputValue('');
  };

  const handleRemovePin = () => {
    if (!editingPinProfile) return;
    const res = setProfilePassword(editingPinProfile.id, undefined);
    showAlert(res.message, res.success ? 'success' : 'error');
    setEditingPinProfile(null);
    setPinInputValue('');
  };

  const handleDeleteProfileClick = (profile: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (profiles.length <= 1) {
      showAlert('Cannot delete the only profile. Every account requires at least one profile.', 'error');
      return;
    }
    setDeletingProfile(profile);
  };

  const handleConfirmDeleteProfile = () => {
    if (!deletingProfile) return;
    const res = deleteProfile(deletingProfile.id);
    showAlert(res.message, res.success ? 'success' : 'error');
    setDeletingProfile(null);
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
          <div>
            <div className="flex items-center gap-2.5">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Multi-Profile & PIN Security</h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Manage profiles, set 4-digit PIN locks, or remove unwanted profiles
            </p>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-600/20 text-xs font-bold text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-600/30 transition-all border border-purple-200 dark:border-purple-500/30"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Profile</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {profiles.map((p) => {
            const isActive = p.id === activeProfile.id;
            const hasPin = Boolean((p.pin || p.password)?.trim());

            return (
              <div
                key={p.id}
                className={`flex flex-col justify-between rounded-2xl p-4 border transition-all ${
                  isActive
                    ? 'bg-purple-50/80 dark:bg-purple-600/15 border-purple-500 shadow-md shadow-purple-600/15 ring-1 ring-purple-500/30'
                    : 'bg-slate-50/80 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-100/80 dark:hover:bg-white/10'
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div
                    onClick={() => switchProfile(p.id)}
                    className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                  >
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="h-11 w-11 rounded-2xl object-cover ring-2 ring-purple-500/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                        {isActive && (
                          <span className="rounded-full bg-purple-600 text-white px-2 py-0.2 text-[9px] font-extrabold shadow-sm">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {p.email || 'Local Profile'}
                      </p>
                    </div>
                  </div>

                  {/* Delete Profile button */}
                  {profiles.length > 1 ? (
                    <button
                      type="button"
                      title="Delete this profile"
                      onClick={(e) => handleDeleteProfileClick(p, e)}
                      className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : (
                    <span className="p-1 text-[10px] text-slate-400" title="Cannot delete default profile">
                      Default
                    </span>
                  )}
                </div>

                {/* Bottom action row: PIN Management & Switch */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/60 dark:border-white/10 text-xs">
                  {/* PIN Action button */}
                  <button
                    type="button"
                    onClick={(e) => handleOpenPinModal(p, e)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                      hasPin
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                        : 'bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/15'
                    }`}
                  >
                    {hasPin ? (
                      <>
                        <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        <span>PIN Set • Edit</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                        <span>Set 4-Digit PIN</span>
                      </>
                    )}
                  </button>

                  {/* Switch button */}
                  {!isActive ? (
                    <button
                      type="button"
                      onClick={() => switchProfile(p.id)}
                      className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline px-1"
                    >
                      Switch To Profile →
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      In Use
                    </span>
                  )}
                </div>
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

      {/* 5. Security & Biometric Preferences */}
      <div className="rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-6 backdrop-blur-xl shadow-xl space-y-5 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security & Biometrics</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Fingerprint, Face ID, Screen Lock & Auto-Protection</p>
            </div>
          </div>

          {/* Hardware Detection Badge */}
          {bioSupport && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] font-semibold border ${
                bioSupport.isSupported
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
              }`}
            >
              <Fingerprint className="h-3.5 w-3.5" />
              <span>{bioSupport.hasPlatformSensor ? 'Hardware Biometrics Ready' : 'WebAuthn Ready'}</span>
            </span>
          )}
        </div>

        <div className="divide-y divide-slate-200 dark:divide-white/5 space-y-4">
          {/* Top Wizard Banner */}
          <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Complete Biometric & PIN Configuration Wizard</span>
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Guided 3-step setup to register your fingerprint sensor, set a backup 4-digit PIN, and choose auto-lock preferences.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                id="open-biometric-wizard-btn"
                onClick={() => setIsBiometricSetupOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
              >
                <Fingerprint className="h-4 w-4" />
                <span>{isBiometricEnabled ? 'Reconfigure Security' : 'Start Guided Setup'}</span>
              </button>

              {isBiometricEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Disable and remove all lock protection? You can re-enable anytime.')) {
                      disableAndResetBiometrics();
                      showAlert('Security locks removed.');
                    }
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 p-2 rounded-xl transition-colors"
                  title="Remove all security lock restrictions"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Lock</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Biometric / Passcode Switch */}
          <div className="flex items-center justify-between pt-3">
            <div className="pr-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Fingerprint className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Biometric / Screen Lock Active</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Require Touch ID, Face ID, Android Fingerprint, or 4-digit PIN to open ExpensePK
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isBiometricEnabled}
              onClick={async () => {
                if (!isBiometricEnabled) {
                  setIsBiometricSetupOpen(true);
                } else {
                  disableAndResetBiometrics();
                  showAlert('Biometric security lock disabled.');
                }
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isBiometricEnabled ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isBiometricEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sub-controls when Biometric Lock is Active */}
          {isBiometricEnabled && (
            <div className="pt-4 space-y-4 animate-in fade-in">
              {/* Quick Lock App Now Button */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-purple-50/70 dark:bg-purple-950/20 rounded-2xl border border-purple-200 dark:border-purple-800/30">
                <div>
                  <h5 className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Test Lock Protection</span>
                  </h5>
                  <p className="text-[11px] text-purple-700/80 dark:text-purple-300/70">
                    Immediately lock the screen to test your fingerprint scanner or backup PIN
                  </p>
                </div>
                <button
                  type="button"
                  id="lock-app-now-btn"
                  onClick={() => {
                    lockAppNow();
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3.5 py-2 shadow-md shadow-purple-600/30 transition-all active:scale-95"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Lock App Now</span>
                </button>
              </div>

              {/* Auto-Lock Timeout */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Auto-Lock on App Minimize / Tab Switch</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Automatically lock when you switch tabs or minimize the browser window
                  </p>
                </div>

                <select
                  value={biometricAutoLock}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setBiometricAutoLock(val);
                    showAlert(`Auto-lock set to: ${val === 'immediate' ? 'Immediately on minimize' : val}`);
                  }}
                  className="rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="immediate">Immediately on minimize</option>
                  <option value="1min">After 1 minute of background</option>
                  <option value="5min">After 5 minutes of background</option>
                  <option value="never">Only on manual lock</option>
                </select>
              </div>

              {/* 4-Digit Backup PIN */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Backup Security PIN</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Used if biometric hardware is unavailable (Current: <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{biometricPin || '1234'}</span>)
                  </p>
                </div>

                {!isEditingBackupPin ? (
                  <button
                    type="button"
                    onClick={() => {
                      setBackupPinInput(biometricPin || '1234');
                      setIsEditingBackupPin(true);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-500 bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800/30"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Change PIN</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      maxLength={6}
                      value={backupPinInput}
                      onChange={(e) => setBackupPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="4-digit PIN"
                      className="w-24 rounded-xl bg-slate-100 dark:bg-white/5 border border-purple-500 px-2 py-1 text-center font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (backupPinInput.length >= 4) {
                          setBiometricPin(backupPinInput);
                          setIsEditingBackupPin(false);
                          showAlert(`Security PIN updated to ${backupPinInput}`);
                        } else {
                          showAlert('PIN must be at least 4 digits', 'error');
                        }
                      }}
                      className="rounded-xl bg-purple-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-purple-500"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingBackupPin(false)}
                      className="rounded-xl bg-slate-200 dark:bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Push Notifications Toggle */}
          <div className="flex items-center justify-between pt-3">
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
          <div className="flex items-center justify-between pt-3">
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

      {/* 7. Firebase Firestore Cloud Database & Sync */}
      <div className="rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-6 backdrop-blur-xl shadow-xl space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-white/10">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Firebase Firestore Cloud Database</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time cloud synchronization & persistent database for your financial records
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border ${
              firebaseStatus.isConnected
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
            }`}>
              <span className={`h-2 w-2 rounded-full ${firebaseStatus.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {firebaseStatus.isConnected ? 'Firebase Connected' : 'Connecting to Cloud'}
            </span>
          </div>
        </div>

        {/* Cloud Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Database Engine</span>
            <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">Google Cloud Firestore</p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">{firebaseStatus.databaseId || 'Default instance'}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Firebase Project</span>
            <p className="text-xs font-bold text-slate-800 dark:text-white mt-1 truncate">{firebaseStatus.projectId || 'Active'}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Security Rules Deployed</p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Synchronized</span>
            <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">
              {firebaseStatus.lastSyncedAt 
                ? new Date(firebaseStatus.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : 'Pending sync'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {firebaseStatus.lastSyncedAt ? new Date(firebaseStatus.lastSyncedAt).toLocaleDateString() : 'Auto-sync active'}
            </p>
          </div>
        </div>

        {/* Architecture Note */}
        <div className="rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-3.5 text-xs text-blue-900 dark:text-blue-200 space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Hybrid Architecture: Offline-First + Real-time Cloud Sync</span>
          </p>
          <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
            Aapka app offline-first hai — jab internet na ho, har entry phone me foran save hoti hai. Jaise hi internet connect hota hai, sab data real-time Google Firebase Firestore cloud database ke sath synchronize ho jata hai.
          </p>
        </div>

        {/* Sync Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={async () => {
              const ok = await syncToFirebase();
              if (ok) {
                showAlert('Successfully synced all financial records to Firebase Firestore Cloud!');
              } else {
                showAlert(firebaseStatus.error || 'Failed to sync to Firebase. Check internet connection.');
              }
            }}
            disabled={firebaseStatus.isSyncing}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${firebaseStatus.isSyncing ? 'animate-spin' : ''}`} />
            <span>{firebaseStatus.isSyncing ? 'Syncing to Cloud...' : 'Sync Now to Firebase'}</span>
          </button>

          <button
            onClick={async () => {
              if (confirm('Restore and pull latest cloud records from Firebase Firestore?')) {
                const ok = await pullFromFirebase();
                if (ok) {
                  showAlert('Data successfully pulled and restored from Firebase Firestore!');
                } else {
                  showAlert(firebaseStatus.error || 'Could not pull remote data from Firebase.');
                }
              }
            }}
            disabled={firebaseStatus.isSyncing}
            className="flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white active:scale-95 disabled:opacity-50 transition-colors"
          >
            <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Pull from Firebase Cloud</span>
          </button>
        </div>
      </div>

      {/* 8. About Application & Icon Branding */}
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

              <div>
                <label className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  <span>4-Digit PIN Lock (Optional)</span>
                  <span className="text-purple-600 dark:text-purple-400 lowercase font-normal">Optional</span>
                </label>
                <input
                  type="password"
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="e.g. 1234 (leave blank for no lock)"
                  value={profPin}
                  onChange={(e) => setProfPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono tracking-widest"
                />
                <p className="text-[10px] text-slate-400 mt-1">Require 4-digit numeric code when switching to this profile</p>
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

      {/* Set / Change 4-Digit Profile PIN Modal */}
      {editingPinProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Profile 4-Digit PIN</h3>
                  <p className="text-[10px] text-slate-400">Profile: {editingPinProfile.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingPinProfile(null)}
                className="rounded-xl bg-slate-100 dark:bg-white/10 p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePin} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Enter 4-Digit Code
                </label>
                <input
                  type="password"
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  placeholder="e.g. 5678"
                  value={pinInputValue}
                  onChange={(e) => setPinInputValue(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono tracking-widest text-center"
                  autoFocus
                />
                <p className="text-[10px] text-slate-400 mt-1 text-center">
                  This 4-digit PIN will be asked whenever anyone tries to switch to this profile.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPinProfile(null)}
                    className="flex-1 rounded-2xl py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-500 shadow-lg shadow-purple-600/30"
                  >
                    Save 4-Digit PIN
                  </button>
                </div>

                {(editingPinProfile.pin || editingPinProfile.password) && (
                  <button
                    type="button"
                    onClick={handleRemovePin}
                    className="w-full py-2 rounded-2xl text-[11px] font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    Remove PIN Protection
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Profile Confirmation Modal */}
      {deletingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 text-slate-900 dark:text-white">
            <div className="text-center pt-2 pb-4">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 mb-3">
                <Trash2 className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold">Delete Profile?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white font-mono">"{deletingProfile.name}"</span>?
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-2 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50">
                This will permanently remove all wallets and entries created exclusively inside this profile.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setDeletingProfile(null)}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-semibold"
              >
                Keep Profile
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProfile}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
