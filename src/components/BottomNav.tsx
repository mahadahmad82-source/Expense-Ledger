import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  Receipt,
  Plus,
  BookOpen,
  Menu,
  PieChart,
  Target,
  FileCheck2,
  TrendingUp,
  Calculator,
  Sparkles,
  Settings,
  X,
  ArrowRightLeft,
  LogOut,
  Users,
  User
} from 'lucide-react';

interface BottomNavProps {
  onOpenStartFresh?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenStartFresh }) => {
  const {
    currentAccount,
    setIsAccountModalOpen,
    logout,
    activeTab,
    setActiveTab,
    setIsAddTxOpen,
    setIsTransferOpen,
    bills,
    savingsGoals,
  } = useExpense();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const unpaidBillsCount = bills.filter(b => !b.is_paid).length;
  const activeGoalsCount = savingsGoals.filter(s => !s.completed_at).length;

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Drawer Overlay for Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md lg:hidden animate-in fade-in">
          <div className="fixed bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-[32px] bg-white dark:bg-[#0e0720]/95 border-t border-slate-200 dark:border-white/15 p-6 shadow-2xl backdrop-blur-2xl pb-28">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-4">
              <span className="text-sm font-bold text-slate-900 dark:text-white">More Financial Modules</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="rounded-full bg-slate-100 dark:bg-white/10 p-2 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => handleTabClick('budgets')}
                className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-all border ${
                  activeTab === 'budgets' 
                    ? 'bg-purple-100 dark:bg-purple-600/30 border-purple-300 dark:border-purple-500/40 text-purple-900 dark:text-white' 
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70'
                }`}
              >
                <div className="rounded-xl bg-purple-500/15 p-2 text-purple-600 dark:text-purple-400">
                  <PieChart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Budgets</p>
                  <p className="text-[10px] text-slate-500 dark:text-white/40">Spending limits</p>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('savings')}
                className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-all border ${
                  activeTab === 'savings' 
                    ? 'bg-emerald-100 dark:bg-emerald-600/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-white' 
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70'
                }`}
              >
                <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-600 dark:text-emerald-400">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Savings</p>
                    {activeGoalsCount > 0 && <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] text-emerald-700 dark:text-emerald-300">{activeGoalsCount}</span>}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-white/40">Goals & Targets</p>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('bills')}
                className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-all border ${
                  activeTab === 'bills' 
                    ? 'bg-amber-100 dark:bg-amber-600/30 border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-white' 
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70'
                }`}
              >
                <div className="rounded-xl bg-amber-500/15 p-2 text-amber-600 dark:text-amber-400">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Bills & Subs</p>
                    {unpaidBillsCount > 0 && <span className="rounded-full bg-rose-500/20 px-1.5 py-0.2 text-[9px] text-rose-700 dark:text-rose-300">{unpaidBillsCount}</span>}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-white/40">Reminders</p>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('analytics')}
                className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-all border ${
                  activeTab === 'analytics' 
                    ? 'bg-blue-100 dark:bg-blue-600/30 border-blue-300 dark:border-blue-500/40 text-blue-900 dark:text-white' 
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70'
                }`}
              >
                <div className="rounded-xl bg-blue-500/15 p-2 text-blue-600 dark:text-blue-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Analytics</p>
                  <p className="text-[10px] text-slate-500 dark:text-white/40">Reports & Charts</p>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('planning')}
                className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-all border ${
                  activeTab === 'planning' 
                    ? 'bg-indigo-100 dark:bg-indigo-600/30 border-indigo-300 dark:border-indigo-500/40 text-indigo-900 dark:text-white' 
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70'
                }`}
              >
                <div className="rounded-xl bg-indigo-500/15 p-2 text-indigo-600 dark:text-indigo-400">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Planning</p>
                  <p className="text-[10px] text-slate-500 dark:text-white/40">Affordability calc</p>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('tips')}
                className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-all border ${
                  activeTab === 'tips' 
                    ? 'bg-cyan-100 dark:bg-cyan-600/30 border-cyan-300 dark:border-cyan-500/40 text-cyan-900 dark:text-white' 
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70'
                }`}
              >
                <div className="rounded-xl bg-cyan-500/15 p-2 text-cyan-600 dark:text-cyan-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Smart Tips</p>
                  <p className="text-[10px] text-slate-500 dark:text-white/40">AI Advice in PKR</p>
                </div>
              </button>
            </div>

            {/* Account & Session Controls in Mobile Drawer */}
            {currentAccount && (
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={currentAccount.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={currentAccount.name}
                    className="h-9 w-9 rounded-xl object-cover ring-1 ring-purple-400 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {currentAccount.name}
                      </p>
                      {currentAccount.is_owner && (
                        <span className="rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1 py-0.2 text-[8px] font-black uppercase">
                          Owner
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {currentAccount.username ? `@${currentAccount.username}` : currentAccount.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-500/15">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsAccountModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 text-purple-700 dark:text-purple-300 py-2 text-xs font-bold border border-purple-500/20"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Switch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white py-2 text-xs font-bold border border-rose-500/25 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsTransferOpen(true);
                  setIsMenuOpen(false);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-100 dark:bg-white/10 py-3 text-xs font-semibold text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10"
              >
                <ArrowRightLeft className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Wallet Transfer</span>
              </button>
              <button
                onClick={() => handleTabClick('settings')}
                className="flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/10 px-4 py-3 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sleek Bottom Navigation Dock */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 lg:hidden flex items-center justify-around gap-1 bg-white/90 dark:bg-[#0e0720]/85 backdrop-blur-2xl border border-slate-200/80 dark:border-white/20 px-3 py-2 rounded-full shadow-2xl w-[92%] max-w-sm transition-colors">
        
        <button
          id="mobile-tab-dashboard"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition-colors ${
            activeTab === 'dashboard' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="text-[9px] font-medium">Home</span>
        </button>

        <button
          id="mobile-tab-transactions"
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition-colors ${
            activeTab === 'transactions' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span className="text-[9px] font-medium">History</span>
        </button>

        {/* Center Floating Action (+) Button */}
        <button
          id="mobile-quick-add"
          onClick={() => setIsAddTxOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#3B82F6] text-white shadow-lg shadow-purple-500/40 active:scale-90 transition-transform -my-1"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </button>

        <button
          id="mobile-tab-ledgers"
          onClick={() => setActiveTab('ledgers')}
          className={`flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition-colors ${
            activeTab === 'ledgers' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span className="text-[9px] font-medium">Ledgers</span>
        </button>

        <button
          id="mobile-tab-menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition-colors ${
            isMenuOpen ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Menu className="h-4 w-4" />
          <span className="text-[9px] font-medium">More</span>
        </button>

      </div>
    </>
  );
};
