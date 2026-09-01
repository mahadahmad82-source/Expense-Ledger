import React, { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { LedgerMonth, Transaction } from '../types';
import {
  BookOpen,
  Calendar,
  Lock,
  Unlock,
  FileSpreadsheet,
  FileText,
  Search,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { formatPKR, formatDate } from '../lib/formatters';
import { renderCategoryIcon } from '../lib/icons';
import { exportMonthLedgerToPDF, exportTransactionsToExcel } from '../lib/exports';

export const LedgersView: React.FC = () => {
  const {
    activeProfile,
    ledgers,
    transactions,
    categories,
    wallets,
    closeLedgerMonth,
    reopenLedgerMonth,
  } = useExpense();

  const [selectedLedger, setSelectedLedger] = useState<LedgerMonth | null>(null);
  const [tableSearch, setTableSearch] = useState('');
  const [tableTypeFilter, setTableTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
  const walletMap = useMemo(() => new Map(wallets.map(w => [w.id, w])), [wallets]);

  // Transactions for selected ledger month
  const monthTransactions = useMemo(() => {
    if (!selectedLedger) return [];
    const prefix = `${selectedLedger.year}-${String(selectedLedger.month).padStart(2, '0')}`;
    
    return transactions.filter(t => {
      if (!t.date.startsWith(prefix)) return false;
      if (tableTypeFilter !== 'all' && t.type !== tableTypeFilter) return false;

      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        const cat = catMap.get(t.category_id)?.name.toLowerCase() || '';
        const w = walletMap.get(t.wallet_id)?.name.toLowerCase() || '';
        const note = (t.note || '').toLowerCase();
        const amt = String(t.amount);
        if (!cat.includes(q) && !w.includes(q) && !note.includes(q) && !amt.includes(q)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortField === 'date') {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortOrder === 'desc' ? -diff : diff;
      }
      if (sortField === 'amount') {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
      if (sortField === 'category') {
        const catA = catMap.get(a.category_id)?.name || '';
        const catB = catMap.get(b.category_id)?.name || '';
        return sortOrder === 'desc' ? catB.localeCompare(catA) : catA.localeCompare(catB);
      }
      return 0;
    });
  }, [selectedLedger, transactions, tableTypeFilter, tableSearch, sortField, sortOrder, catMap, walletMap]);

  const handleExportExcel = () => {
    if (!selectedLedger) return;
    exportTransactionsToExcel(
      monthTransactions,
      categories,
      wallets,
      `${selectedLedger.month_name}_Ledger`
    );
  };

  const handleExportPDF = () => {
    if (!selectedLedger) return;
    exportMonthLedgerToPDF(
      selectedLedger,
      monthTransactions,
      categories,
      wallets,
      activeProfile.name
    );
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* If No Month is Selected: Grid of Month Cards */}
      {!selectedLedger ? (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
                Month-Wise Ledgers
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Archived financial statements and active monthly books in PKR
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-slate-300">
              <Lock className="h-3.5 w-3.5 text-purple-400" />
              <span>Past months auto-archive into read-only books</span>
            </div>
          </div>

          {/* Ledger Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ledgers.map((ledger) => {
              const isCurrent = !ledger.is_closed;

              return (
                <div
                  key={ledger.id}
                  onClick={() => setSelectedLedger(ledger)}
                  className={`group relative overflow-hidden rounded-3xl p-6 border transition-all cursor-pointer backdrop-blur-xl shadow-xl hover:scale-[1.02] ${
                    isCurrent
                      ? 'bg-gradient-to-tr from-purple-950/70 via-slate-900/80 to-indigo-950/70 border-purple-500/40 shadow-purple-500/10'
                      : 'bg-slate-900/50 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Status Pill */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-xl p-2 text-white ${isCurrent ? 'bg-purple-600' : 'bg-white/10'}`}>
                        <Calendar className="h-4 w-4" />
                      </div>
                      <h3 className="text-base font-bold text-white font-display">{ledger.month_name}</h3>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold border flex items-center gap-1 ${
                        isCurrent
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse'
                          : 'bg-slate-800 text-slate-400 border-white/10'
                      }`}
                    >
                      {isCurrent ? <Unlock className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
                      <span>{isCurrent ? 'Active Book' : 'Closed Archive'}</span>
                    </span>
                  </div>

                  {/* Financial Stats */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/10 my-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Income</p>
                      <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                        {formatPKR(ledger.total_income)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Outflow</p>
                      <p className="text-sm font-bold text-rose-400 font-mono mt-0.5">
                        {formatPKR(ledger.total_expense)}
                      </p>
                    </div>
                  </div>

                  {/* Net Savings & CTA */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400">Net Month Savings:</span>
                      <p className={`text-base font-black font-mono ${ledger.net_savings >= 0 ? 'text-purple-300' : 'text-rose-400'}`}>
                        {formatPKR(ledger.net_savings)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:text-purple-300">
                      <span>Inspect</span>
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Detailed Excel-like Ledger Data Table View */
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* Back button & Month Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedLedger(null)}
                className="rounded-2xl bg-white/5 border border-white/10 p-2.5 text-slate-300 hover:bg-white/10 transition-colors"
                title="Back to Month Cards"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
                    {selectedLedger.month_name}
                  </h1>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                      !selectedLedger.is_closed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-white/10'
                    }`}
                  >
                    {!selectedLedger.is_closed ? 'Active Book' : 'Closed Ledger'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Excel-grade tabular ledger with instant exports and audits
                </p>
              </div>
            </div>

            {/* Export buttons & Close/Reopen ledger toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                <span>Download .xlsx</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 rounded-2xl bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 px-3.5 py-2 text-xs font-semibold text-purple-300 transition-colors"
              >
                <FileText className="h-4 w-4 text-purple-400" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={() => {
                  if (selectedLedger.is_closed) {
                    reopenLedgerMonth(selectedLedger.id);
                    setSelectedLedger({ ...selectedLedger, is_closed: false });
                  } else {
                    closeLedgerMonth(selectedLedger.id);
                    setSelectedLedger({ ...selectedLedger, is_closed: true });
                  }
                }}
                className={`flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
                  selectedLedger.is_closed
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                    : 'bg-white/10 border-white/15 text-slate-300 hover:bg-white/15'
                }`}
              >
                {selectedLedger.is_closed ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                <span>{selectedLedger.is_closed ? 'Reopen Book' : 'Close Book'}</span>
              </button>
            </div>
          </div>

          {/* Month Financial KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl bg-slate-900/60 border border-emerald-500/20 p-4 backdrop-blur-xl">
              <span className="text-xs font-semibold text-slate-400">Total Inflow (Income)</span>
              <p className="text-xl font-bold text-emerald-400 font-mono mt-1">
                {formatPKR(selectedLedger.total_income)}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-900/60 border border-rose-500/20 p-4 backdrop-blur-xl">
              <span className="text-xs font-semibold text-slate-400">Total Outflow (Expenses)</span>
              <p className="text-xl font-bold text-rose-400 font-mono mt-1">
                {formatPKR(selectedLedger.total_expense)}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-900/60 border border-purple-500/20 p-4 backdrop-blur-xl">
              <span className="text-xs font-semibold text-slate-400">Net Month Surplus</span>
              <p className={`text-xl font-bold font-mono mt-1 ${selectedLedger.net_savings >= 0 ? 'text-purple-300' : 'text-rose-400'}`}>
                {formatPKR(selectedLedger.net_savings)}
              </p>
            </div>
          </div>

          {/* Filter and Search Bar for Ledger Table */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl bg-white/5 border border-white/10 p-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search within this month..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex rounded-xl bg-white/5 border border-white/10 p-0.5">
                {(['all', 'expense', 'income'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTableTypeFilter(t)}
                    className={`rounded-lg px-3 py-1 text-[11px] font-bold capitalize transition-colors ${
                      tableTypeFilter === t ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Excel-like Data Table */}
          <div className="rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:text-white"
                      onClick={() => {
                        setSortField('date');
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Date</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5">Type</th>
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:text-white"
                      onClick={() => {
                        setSortField('category');
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Category</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5">Description / Note</th>
                    <th className="px-4 py-3.5">Wallet</th>
                    <th
                      className="px-4 py-3.5 text-right cursor-pointer hover:text-white"
                      onClick={() => {
                        setSortField('amount');
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                      }}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Amount (PKR)</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 font-sans">
                  {monthTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No transactions found for this query in {selectedLedger.month_name}.
                      </td>
                    </tr>
                  ) : (
                    monthTransactions.map((t) => {
                      const cat = catMap.get(t.category_id);
                      const wallet = walletMap.get(t.wallet_id);
                      const isIncome = t.type === 'income';

                      return (
                        <tr key={t.id} className="hover:bg-white/5 transition-colors font-mono">
                          <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(t.date)}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold font-sans uppercase ${
                                isIncome ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {t.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-sans font-semibold text-white whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat?.color || '#8B5CF6' }} />
                              <span>{cat?.name || 'Uncategorized'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-sans text-slate-400 max-w-xs truncate">
                            {t.note || '-'}
                          </td>
                          <td className="px-4 py-3 font-sans text-slate-300 whitespace-nowrap">
                            {wallet?.name || 'Wallet'}
                          </td>
                          <td className={`px-4 py-3 text-right font-black whitespace-nowrap ${isIncome ? 'text-emerald-400' : 'text-slate-100'}`}>
                            {isIncome ? '+' : '-'}{formatPKR(t.amount)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
