import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  Receipt,
  BookOpen,
  PieChart,
  Target,
  FileCheck2,
  TrendingUp,
  Calculator,
  Sparkles,
  Settings,
  ArrowRightLeft,
  PlusCircle,
  Plus
} from 'lucide-react';
import { formatPKR, formatCompactPKR } from '../lib/formatters';
import { renderCategoryIcon } from '../lib/icons';

interface NavItem {
  tab: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  color?: string;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    wallets,
    activeProfile,
    setIsTransferOpen,
    setIsAddTxOpen,
    bills,
    savingsGoals,
  } = useExpense();

  const unpaidBillsCount = bills.filter(b => !b.is_paid).length;
  const activeGoalsCount = savingsGoals.filter(s => !s.completed_at).length;

  const navItems: NavItem[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { tab: 'transactions', label: 'Transactions', icon: Receipt },
    { tab: 'ledgers', label: 'Ledgers', icon: BookOpen },
    { tab: 'budgets', label: 'Budgets', icon: PieChart },
    { tab: 'savings', label: 'Savings Goals', icon: Target, badge: activeGoalsCount > 0 ? `${activeGoalsCount}` : undefined },
    { tab: 'bills', label: 'Bills & Subs', icon: FileCheck2, badge: unpaidBillsCount > 0 ? `${unpaidBillsCount}` : undefined, color: 'text-amber-400' },
    { tab: 'analytics', label: 'Analytics', icon: TrendingUp },
    { tab: 'planning', label: 'Planning', icon: Calculator },
    { tab: 'tips', label: 'Smart Insights', icon: Sparkles, badge: 'AI', color: 'text-cyan-400' },
    { tab: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] flex-col p-5 shadow-2xl shrink-0 h-[calc(100vh-5.5rem)] sticky top-20 justify-between">
      
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="w-10 h-10 bg-gradient-to-tr from-[#7C3AED] to-[#3B82F6] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 text-white shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
        </div>
        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Expense<span className="text-purple-400">PK</span>
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;

          return (
            <div
              key={item.tab}
              id={`nav-item-${item.tab}`}
              onClick={() => setActiveTab(item.tab)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-white/10 text-white shadow-inner font-semibold'
                  : 'text-white/50 hover:bg-white/5 hover:text-white font-medium'
              }`}
            >
              {isActive && (
                <div className="w-1 h-5 bg-purple-400 rounded-full absolute left-2" />
              )}

              <div className="flex items-center gap-3 pl-2">
                <Icon
                  className={`h-4 w-4 transition-transform ${
                    isActive ? 'text-purple-400' : 'text-white/50'
                  }`}
                />
                <span className="text-xs">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    item.badge === 'AI'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-purple-500/20 text-purple-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Active Profile & Wallets Card at Bottom */}
      <div className="mt-4 pt-3 border-t border-white/10 space-y-3">
        <div className="p-3.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl border border-white/10">
          <div className="text-[10px] uppercase tracking-widest text-purple-300 font-bold mb-1">
            Active Profile
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">{activeProfile.name}</span>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Quick Wallets summary list */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Wallets ({wallets.length})</span>
            <button
              onClick={() => setIsTransferOpen(true)}
              title="Transfer between wallets"
              className="text-white/50 hover:text-purple-300 p-0.5 transition-colors"
            >
              <ArrowRightLeft className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-0.5">
            {wallets.slice(0, 3).map((w) => (
              <div key={w.id} className="flex items-center justify-between text-[11px]">
                <span className="text-white/60 truncate max-w-[100px]">{w.name}</span>
                <span className="font-mono font-bold text-white/90">{formatCompactPKR(w.balance)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </aside>
  );
};
