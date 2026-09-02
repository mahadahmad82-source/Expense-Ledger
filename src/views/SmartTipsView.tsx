import React, { useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import {
  Sparkles,
  Lightbulb,
  TrendingDown,
  Percent,
  PiggyBank,
  CheckCircle2,
  Zap,
  ShoppingBag,
  Car,
  Utensils,
  Home,
  ShieldCheck
} from 'lucide-react';
import { formatPKR } from '../lib/formatters';

export const SmartTipsView: React.FC = () => {
  const { transactions, categories, budgets, activeProfile, theme } = useExpense();

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthTxs = transactions.filter(t => t.date.startsWith(currentMonthStr));

  const totalIncome = currentMonthTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) || 120000;
  const totalExpense = currentMonthTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) || 75000;

  // 50 / 30 / 20 Rule Breakdown
  const idealNeeds = Math.round(totalIncome * 0.5);
  const idealWants = Math.round(totalIncome * 0.3);
  const idealSavings = Math.round(totalIncome * 0.2);

  // Food & Dining Spend
  const foodCatIds = categories.filter(c => c.name.toLowerCase().includes('food') || c.name.toLowerCase().includes('dining') || c.name.toLowerCase().includes('grocer')).map(c => c.id);
  const foodSpend = currentMonthTxs.filter(t => foodCatIds.includes(t.category_id)).reduce((acc, t) => acc + t.amount, 0);

  // Fuel / Transport Spend
  const transportCatIds = categories.filter(c => c.name.toLowerCase().includes('fuel') || c.name.toLowerCase().includes('transport')).map(c => c.id);
  const transportSpend = currentMonthTxs.filter(t => transportCatIds.includes(t.category_id)).reduce((acc, t) => acc + t.amount, 0);

  // Generated Real-time Smart Tips
  const smartInsights = useMemo(() => [
    {
      id: 'tip-1',
      title: '50/30/20 Rule Budget Alignment',
      badge: 'Formula',
      icon: Percent,
      color: '#8B5CF6',
      description: `Based on your Rs. ${totalIncome.toLocaleString()} monthly inflow, target Rs. ${idealNeeds.toLocaleString()} for essentials, Rs. ${idealWants.toLocaleString()} for lifestyle/leisure, and allocate Rs. ${idealSavings.toLocaleString()} straight into savings.`,
      action: 'Set Monthly Budgets'
    },
    {
      id: 'tip-2',
      title: 'Islamic Mutual Funds & Halal Savings',
      badge: 'Wealth Growth',
      icon: PiggyBank,
      color: '#10B981',
      description: `Parking your Rs. ${idealSavings.toLocaleString()} monthly savings in AAA-rated Meezan or Al Meezan Islamic Income Funds (18-20% annualized yields) generates compounding returns that beat domestic inflation.`,
      action: 'Explore Savings Targets'
    },
    {
      id: 'tip-3',
      title: 'Food & Dining Out Optimization',
      badge: 'Spending Tip',
      icon: Utensils,
      color: '#F97316',
      description: `You've spent Rs. ${foodSpend.toLocaleString()} on food & groceries this cycle. Consolidating weekly household staples via bulk wholesale (Imtiaz, Metro, Carrefour) typically saves 12-15% compared to frequent convenience store runs.`,
      action: 'Review Food Expenses'
    },
    {
      id: 'tip-4',
      title: 'Fuel & Commute Cashback Perks',
      badge: 'Cashback',
      icon: Car,
      color: '#06B6D4',
      description: `Your transport expense is Rs. ${transportSpend.toLocaleString()}. Using partner cards (e.g. Standard Chartered / Alfalah / Meezan Titanium) offers up to 5% cash rebate on PSO, Shell, and Total fuel pumps.`,
      action: 'Track Fuel Category'
    },
    {
      id: 'tip-5',
      title: 'Off-Peak Electricity & Utility Conservation',
      badge: 'Bills',
      icon: Zap,
      color: '#F43F5E',
      description: `LESCO, K-Electric, and IESCO charge premium Peak Tariff between 6:00 PM and 10:00 PM. Running heavy washing machines, ACs, and water motors during daytime or late night reduces monthly unit costs by up to 25%.`,
      action: 'Check Bills Tracker'
    },
  ], [totalIncome, idealNeeds, idealWants, idealSavings, foodSpend, transportSpend]);

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      
      {/* Header Bar */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">
          Smart Tips & Financial Health
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Real-time algorithmic recommendations tailored for your PKR budget and lifestyle
        </p>
      </div>

      {/* 50 / 30 / 20 Framework Card */}
      <div className="rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-purple-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-purple-500/20 p-2.5 text-purple-600 dark:text-purple-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Your Tailored 50/30/20 Allocation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Standard financial benchmark calculated from your active income</p>
            </div>
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">50% Needs (Rent, Bills, Food)</span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">₨</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white font-mono">{formatPKR(idealNeeds)}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Recommended ceiling for essentials</p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">30% Wants (Dining, Outings, Gear)</span>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">₨</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white font-mono">{formatPKR(idealWants)}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Discretionary lifestyle spending</p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">20% Savings & Emergency</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">₨</span>
            </div>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{formatPKR(idealSavings)}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Target monthly wealth accumulation</p>
          </div>
        </div>
      </div>

      {/* Dynamic Insights Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Personalized Actionable Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {smartInsights.map((tip) => {
            const IconComp = tip.icon;

            return (
              <div
                key={tip.id}
                className="rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 hover:border-purple-400 dark:hover:border-white/20 p-6 backdrop-blur-xl shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-sm"
                        style={{ backgroundColor: `${tip.color}25`, color: tip.color }}
                      >
                        <IconComp className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{tip.title}</h4>
                    </div>

                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-bold border"
                      style={{
                        backgroundColor: `${tip.color}15`,
                        color: tip.color,
                        borderColor: `${tip.color}30`,
                      }}
                    >
                      {tip.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
                    {tip.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer">
                  <span>{tip.action}</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
