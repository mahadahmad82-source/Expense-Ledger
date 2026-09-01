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
  ArrowRightLeft
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const {
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
          <div className="fixed bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-[32px] bg-[#0e0720]/95 border-t border-white/15 p-6 shadow-2xl backdrop-blur-2xl pb-28">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="text-sm font-bold text-white">More Modules</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="rounded-full bg-white/10 p-2 text-white/50 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => handleTabClick('budgets')}
                className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-all border ${
                  activeTab === 'budgets' ? 'bg-purple-600/30 border-purple-500/40 text-white' : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                <div className="rounded-xl bg-purple-500/20 p-2 text-purple-400">
                  <PieChart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Budgets</p>
                  <p className="text-[10px] text-white/40">Spending limits</p>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('savings')}
                className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-all border ${
                  activeTab === 'savings' ? 'bg-emerald-600/30 border-emerald-500/40 text-white' : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-white">Savings</p>
                    {activeGoalsCount > 0 && <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] text-emerald-300">{activeGoalsCount}</span>}
                  </div>
                  <p className="text-[10px] text-white/40">Goals & Targets</p>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('bills')}
                className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-all border ${
                  activeTab === 'bills' ? 'bg-amber-600/30 border-amber-500/40 text-white' : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                <div className="rounded-xl bg-amber-500/20 p-2 text-amber-400">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-white">Bills & Subs</p>
                    {unpaidBillsCount > 0 && <span className="rounded-full bg-rose-500/30 px-1.5 py-0.2 text-[9px] text-rose-300">{unpaidBillsCount}</span>}
                  </div>
                  <p className="text-[10px] text-white/40">Reminders</p>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('analytics')}
                className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-all border ${
                  activeTab === 'analytics' ? 'bg-blue-600/30 border-blue-500/40 text-white' : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                <div className="rounded-xl bg-blue-500/20 p-2 text-blue-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Analytics</p>
                  <p className="text-[10px] text-white/40">Reports & Charts</p>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('planning')}
                className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-all border ${
                  activeTab === 'planning' ? 'bg-indigo-600/30 border-indigo-500/40 text-white' : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                <div className="rounded-xl bg-indigo-500/20 p-2 text-indigo-400">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Planning</p>
                  <p className="text-[10px] text-white/40">Affordability calc</p>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('tips')}
                className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-all border ${
                  activeTab === 'tips' ? 'bg-cyan-600/30 border-cyan-500/40 text-white' : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                <div className="rounded-xl bg-cyan-500/20 p-2 text-cyan-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Smart Tips</p>
                  <p className="text-[10px] text-white/40">AI Advice in PKR</p>
                </div>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsTransferOpen(true);
                  setIsMenuOpen(false);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/10 py-3 text-xs font-semibold text-white hover:bg-white/15 border border-white/10"
              >
                <ArrowRightLeft className="h-4 w-4 text-purple-400" />
                <span>Wallet Transfer</span>
              </button>
              <button
                onClick={() => handleTabClick('settings')}
                className="flex items-center justify-center rounded-2xl bg-white/10 px-4 py-3 text-white hover:bg-white/15 border border-white/10"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sleek Bottom Navigation Dock */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 lg:hidden flex items-center justify-around gap-1 bg-[#0e0720]/80 backdrop-blur-2xl border border-white/20 px-3 py-2 rounded-full shadow-2xl w-[92%] max-w-sm">
        
        <button
          id="mobile-tab-dashboard"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition-colors ${
            activeTab === 'dashboard' ? 'text-purple-400' : 'text-white/50 hover:text-white'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="text-[9px] font-medium">Home</span>
        </button>

        <button
          id="mobile-tab-transactions"
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition-colors ${
            activeTab === 'transactions' ? 'text-purple-400' : 'text-white/50 hover:text-white'
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
            activeTab === 'ledgers' ? 'text-purple-400' : 'text-white/50 hover:text-white'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span className="text-[9px] font-medium">Ledgers</span>
        </button>

        <button
          id="mobile-tab-menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition-colors ${
            isMenuOpen ? 'text-purple-400' : 'text-white/50 hover:text-white'
          }`}
        >
          <Menu className="h-4 w-4" />
          <span className="text-[9px] font-medium">More</span>
        </button>

      </div>
    </>
  );
};
