import React, { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import {
  Compass,
  Calculator,
  HelpCircle,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatPKR, formatCompactPKR } from '../lib/formatters';

export const PlanningView: React.FC = () => {
  const { transactions, wallets, activeProfile } = useExpense();

  // 1. Goal Timeline Calculator State
  const [goalTargetAmount, setGoalTargetAmount] = useState<number>(300000);
  const [monthlySavingsContribution, setMonthlySavingsContribution] = useState<number>(25000);
  const [initialSavingsAmount, setInitialSavingsAmount] = useState<number>(50000);

  // 2. Can I Afford This? Simulator State
  const [purchasePrice, setPurchasePrice] = useState<number>(65000);
  const [purchaseCategory, setPurchaseCategory] = useState<string>('Electronics');
  const [installmentMonths, setInstallmentMonths] = useState<number>(1);

  // 3-Month Historical Average Run Rate
  const now = new Date();
  const pastThreeMonthsTxs = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    const dStr = d.toISOString().split('T')[0];
    return transactions.filter(t => t.date >= dStr);
  }, [transactions]);

  const avgMonthlyIncome = useMemo(() => {
    const inc = pastThreeMonthsTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    return Math.round(inc / 3) || 120000;
  }, [pastThreeMonthsTxs]);

  const avgMonthlyExpense = useMemo(() => {
    const exp = pastThreeMonthsTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return Math.round(exp / 3) || 75000;
  }, [pastThreeMonthsTxs]);

  const historicalNetSavings = avgMonthlyIncome - avgMonthlyExpense;
  const totalWalletLiquidity = wallets.reduce((acc, w) => acc + w.balance, 0);

  // Calculations for Goal Timeline
  const neededSavings = Math.max(goalTargetAmount - initialSavingsAmount, 0);
  const monthsToReachGoal = monthlySavingsContribution > 0 ? Math.ceil(neededSavings / monthlySavingsContribution) : 0;
  
  const completionDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsToReachGoal);
    return d.toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });
  }, [monthsToReachGoal]);

  // Multi-Month Future Projection Data
  const projectionData = useMemo(() => {
    const data = [];
    let current = initialSavingsAmount;
    const months = ['Current', 'M+1', 'M+2', 'M+3', 'M+4', 'M+5', 'M+6', 'M+9', 'M+12', 'M+18', 'M+24'];
    
    for (let i = 0; i <= 10; i++) {
      const added = i === 0 ? 0 : (i <= 6 ? i : i === 7 ? 9 : i === 8 ? 12 : i === 9 ? 18 : 24) * monthlySavingsContribution;
      data.push({
        period: months[i],
        Accumulated: initialSavingsAmount + added,
        Target: goalTargetAmount,
      });
    }
    return data;
  }, [initialSavingsAmount, monthlySavingsContribution, goalTargetAmount]);

  // Affordability Assessment Logic
  const monthlyImpact = Math.round(purchasePrice / installmentMonths);
  const projectedRemainingBuffer = historicalNetSavings - monthlyImpact;
  const isAffordable = purchasePrice <= totalWalletLiquidity * 0.7 && projectedRemainingBuffer > 10000;
  const isRisky = purchasePrice > totalWalletLiquidity * 0.9 || projectedRemainingBuffer < 0;

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Header Bar */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
          Financial Planning & Calculators
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Simulate purchase impacts, goal forecast timelines, and compound growth in PKR
        </p>
      </div>

      {/* Historical Run-Rate Baseline Card */}
      <div className="rounded-3xl bg-slate-900/60 border border-purple-500/20 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-5 w-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white">Your Past 90-Day Baseline Run-Rate</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5">
            <span className="text-[10px] font-bold uppercase text-slate-400">Avg Monthly Inflow</span>
            <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">{formatPKR(avgMonthlyIncome)}</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5">
            <span className="text-[10px] font-bold uppercase text-slate-400">Avg Monthly Burn</span>
            <p className="text-lg font-black text-rose-400 font-mono mt-0.5">{formatPKR(avgMonthlyExpense)}</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5">
            <span className="text-[10px] font-bold uppercase text-slate-400">Avg Free Cash Flow</span>
            <p className="text-lg font-black text-purple-300 font-mono mt-0.5">{formatPKR(historicalNetSavings)}</p>
          </div>
        </div>
      </div>

      {/* Calculator 1: Goal Timeline Forecaster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-purple-600/30 p-2 text-purple-400">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Goal Timeline Calculator</h3>
              <p className="text-[11px] text-slate-400">Estimate target completion date</p>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Target Goal Amount (PKR)
            </label>
            <input
              type="number"
              value={goalTargetAmount}
              onChange={(e) => setGoalTargetAmount(Number(e.target.value))}
              className="w-full rounded-2xl bg-white/5 border border-white/15 px-3.5 py-2.5 text-base font-bold text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Monthly Contribution (PKR)
            </label>
            <input
              type="number"
              value={monthlySavingsContribution}
              onChange={(e) => setMonthlySavingsContribution(Number(e.target.value))}
              className="w-full rounded-2xl bg-white/5 border border-white/15 px-3.5 py-2.5 text-base font-bold text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Existing Saved Funds (PKR)
            </label>
            <input
              type="number"
              value={initialSavingsAmount}
              onChange={(e) => setInitialSavingsAmount(Number(e.target.value))}
              className="w-full rounded-2xl bg-white/5 border border-white/15 px-3.5 py-2.5 text-base font-bold text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Outcome Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/30 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Estimated Milestone</span>
            <p className="text-2xl font-black text-white font-display mt-0.5">
              {monthsToReachGoal} Months
            </p>
            <p className="text-xs text-purple-200 mt-1">
              You will reach {formatPKR(goalTargetAmount)} by <span className="font-bold text-white">{completionDate}</span>!
            </p>
          </div>
        </div>

        {/* Projection Chart (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900/60 border border-white/10 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Compound Savings Growth Trajectory</h3>
            <p className="text-[11px] text-slate-400">Visual path toward {formatPKR(goalTargetAmount)} target</p>
          </div>

          <div className="h-64 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <defs>
                  <linearGradient id="accumGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} tickFormatter={(val) => formatCompactPKR(val)} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '16px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [formatPKR(Number(val)), '']}
                />
                <Area type="monotone" dataKey="Accumulated" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#accumGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Accelerate by +Rs. 5,000/mo to shave ~{(monthsToReachGoal * 0.18).toFixed(1)} months off your timeline.
          </p>
        </div>

      </div>

      {/* Calculator 2: "Can I Afford This?" Instant Simulator */}
      <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-500/20 p-2.5 text-cyan-400">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">"Can I Afford This Purchase?" Simulator</h3>
            <p className="text-xs text-slate-400">Stress-test any expense against your liquid wallets and monthly savings rate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Item Price (PKR)
            </label>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
              className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-base font-bold text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Category
            </label>
            <select
              value={purchaseCategory}
              onChange={(e) => setPurchaseCategory(e.target.value)}
              className="w-full rounded-2xl bg-slate-800 border border-white/15 px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Electronics">Electronics / Tech</option>
              <option value="Vehicle">Vehicle / Bike Maintenance</option>
              <option value="Shopping">Luxury Shopping / Wardrobe</option>
              <option value="Travel">Vacation / Travel</option>
              <option value="Home">Home Appliance</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Payment Schedule
            </label>
            <select
              value={installmentMonths}
              onChange={(e) => setInstallmentMonths(Number(e.target.value))}
              className="w-full rounded-2xl bg-slate-800 border border-white/15 px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={1}>100% Upfront (Single Debit)</option>
              <option value={3}>3-Month Installment</option>
              <option value={6}>6-Month Installment</option>
              <option value={12}>12-Month Installment</option>
            </select>
          </div>
        </div>

        {/* Dynamic Verdict Card */}
        <div
          className={`rounded-3xl p-6 border transition-all ${
            isAffordable
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : isRisky
              ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-2xl bg-white/10 shrink-0">
              {isAffordable ? (
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              ) : isRisky ? (
                <AlertTriangle className="h-7 w-7 text-rose-400" />
              ) : (
                <ShieldCheck className="h-7 w-7 text-amber-400" />
              )}
            </div>

            <div>
              <h4 className="text-base font-bold text-white">
                {isAffordable
                  ? 'Verdict: Financially Safe to Purchase! ✅'
                  : isRisky
                  ? 'Verdict: High Risk of Cash Crunch ⚠️'
                  : 'Verdict: Moderate Impact on Monthly Savings ⚖️'}
              </h4>

              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                {isAffordable && (
                  <>
                    Your liquid cash of <span className="font-bold text-white">{formatPKR(totalWalletLiquidity)}</span> easily covers this purchase without destabilizing your baseline emergency buffer. Your projected monthly surplus remains healthy at <span className="font-bold text-white">{formatPKR(projectedRemainingBuffer)}</span>.
                  </>
                )}
                {isRisky && (
                  <>
                    This purchase requires <span className="font-bold text-white">{Math.round((purchasePrice / totalWalletLiquidity) * 100)}%</span> of your total liquid wealth or will compress your monthly cash flow into negative territory. Consider spreading across {installmentMonths > 1 ? `${installmentMonths + 3}` : '3'} months or saving for 2 more pay cycles.
                  </>
                )}
                {!isAffordable && !isRisky && (
                  <>
                    You have enough balance to cover this, but it will consume <span className="font-bold text-white">{formatPKR(monthlyImpact)}</span> from your monthly cash flow, leaving <span className="font-bold text-white">{formatPKR(projectedRemainingBuffer)}</span> for unexpected expenses.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
