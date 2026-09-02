import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import {
  Search,
  Bell,
  Plus,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  ChevronDown,
  UserPlus,
  ShieldCheck,
  Check,
  Sparkles,
  Download
} from 'lucide-react';
import { formatPKR } from '../lib/formatters';

interface NavbarProps {
  onOpenStartFresh?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenStartFresh }) => {
  const {
    profiles,
    activeProfile,
    switchProfile,
    addProfile,
    wallets,
    notifications,
    dismissNotification,
    clearAllNotifications,
    theme,
    setTheme,
    toggleTheme,
    isOnline,
    setIsSearchOpen,
    setIsAddTxOpen,
    setActiveTab,
  } = useExpense();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isNewProfileModalOpen, setIsNewProfileModalOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const unreadNotifs = notifications.filter(n => !n.is_read);
  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    addProfile(newProfileName.trim());
    setNewProfileName('');
    setIsNewProfileModalOpen(false);
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0514]/80 backdrop-blur-2xl transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        
        {/* Left: Brand Logo & Profile Switcher */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#3B82F6] p-0.5 shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
              <span className="font-black text-white text-base">₨</span>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Expense<span className="text-purple-600 dark:text-purple-400">PK</span></span>
                <span className="rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 px-2 py-0.5 text-[10px] font-semibold border border-purple-500/20">PWA</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-white/40">Sleek Financial Ledger</p>
            </div>
          </div>

          {/* Profile Switcher Dropdown */}
          <div className="relative ml-1 sm:ml-3">
            <button
              id="profile-dropdown-btn"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 pl-2 pr-3 py-1.5 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors focus:outline-none"
            >
              <img
                src={activeProfile.avatar}
                alt={activeProfile.name}
                className="h-7 w-7 rounded-xl object-cover ring-1 ring-purple-400/40"
              />
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-slate-800 dark:text-white leading-tight truncate max-w-[110px]">{activeProfile.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-white/50 leading-tight">{formatPKR(totalBalance)}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500 dark:text-white/50" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-3xl bg-white dark:bg-[#0e0720]/95 border border-slate-200 dark:border-white/15 p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-white/10 mb-1">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-white/50 uppercase tracking-wider">Switch Profile</p>
                </div>
                <div className="space-y-1">
                  {profiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchProfile(p.id);
                        setIsProfileMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-xs transition-colors ${
                        p.id === activeProfile.id
                          ? 'bg-purple-50 dark:bg-purple-600/30 text-purple-700 dark:text-white font-medium border border-purple-300 dark:border-purple-500/30'
                          : 'text-slate-700 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={p.avatar} alt={p.name} className="h-6 w-6 rounded-lg object-cover" />
                        <span className="truncate">{p.name}</span>
                      </div>
                      {p.id === activeProfile.id && <Check className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />}
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/10">
                  <button
                    onClick={() => {
                      setIsNewProfileModalOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/15 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Create New Profile</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center / Right: Global Search, Quick Actions, Start Fresh, Notifications, Theme */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Global Search Button */}
          <button
            id="global-search-trigger"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3.5 py-2 text-xs text-slate-500 dark:text-white/50 hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <Search className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            <span className="hidden md:inline">Search transactions, bills, categories...</span>
            <span className="hidden lg:inline-block rounded-lg bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-600 dark:text-white/60">⌘K</span>
          </button>

          {/* Quick Add Expense Button (Desktop) */}
          <button
            id="quick-add-btn"
            onClick={() => setIsAddTxOpen(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-500/25 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Entry</span>
          </button>

          {/* Start Fresh with Real Data Trigger */}
          {onOpenStartFresh && (
            <button
              onClick={onOpenStartFresh}
              title="Start fresh or clear demo data"
              className="hidden xl:flex items-center gap-1.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 px-3 py-2 text-xs font-semibold transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>Start Real Account</span>
            </button>
          )}

          {/* Online / Offline status badge */}
          <div 
            title={isOnline ? "Connected & Synchronized" : "Offline mode active — data saved locally"}
            className={`hidden md:flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-[11px] font-medium border ${
              isOnline 
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' 
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Notification Center */}
          <div className="relative">
            <button
              id="notif-dropdown-btn"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2 text-slate-600 dark:text-white/70 hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0a0514]">
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-3xl bg-white dark:bg-[#0e0720]/95 border border-slate-200 dark:border-white/15 p-4 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10 mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications ({notifications.length})</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 dark:text-white/40 py-4">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="group relative rounded-2xl bg-slate-50 dark:bg-white/5 p-3 text-left text-xs transition-colors hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5"
                      >
                        <div className="flex items-start justify-between">
                          <p className="font-semibold text-slate-800 dark:text-white">{n.title}</p>
                          <button
                            onClick={() => dismissNotification(n.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-[10px]"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-white/50 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Mode Toggle (Dark / Light) */}
          <button
            onClick={toggleTheme}
            className="rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2 text-slate-600 dark:text-white/70 hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
            title={`Current: ${theme.toUpperCase()} Mode (Click to switch)`}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-purple-600" />
            )}
          </button>
        </div>
      </div>

      {/* New Profile Modal */}
      {isNewProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Create New Profile</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Separate your expenses between Personal, Business, Family, or Freelance.
            </p>
            <form onSubmit={handleCreateProfile}>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Profile Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Side Hustle, Family Budget"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewProfileModalOpen(false)}
                  className="rounded-2xl px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 shadow-lg shadow-purple-600/30"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
