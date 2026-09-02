import React, { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Transaction, TransactionType } from '../types';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  FileSpreadsheet,
  FileText,
  Calendar,
  Wallet as WalletIcon,
  Tag,
  ArrowUpDown,
  Repeat,
  Image as ImageIcon,
  CheckSquare,
  Square,
  X
} from 'lucide-react';
import { formatPKR, formatDate } from '../lib/formatters';
import { renderCategoryIcon } from '../lib/icons';
import { exportTransactionsToExcel, exportComprehensiveReportPDF } from '../lib/exports';

export const TransactionsView: React.FC = () => {
  const {
    activeProfile,
    transactions,
    categories,
    wallets,
    budgets,
    savingsGoals,
    deleteTransaction,
    bulkDeleteTransactions,
    setIsAddTxOpen,
    setEditingTransaction,
    setActiveReceiptUrl,
    theme,
  } = useExpense();

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | TransactionType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWallet, setSelectedWallet] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  
  // Bulk selection mode
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
  const walletMap = useMemo(() => new Map(wallets.map(w => [w.id, w])), [wallets]);

  // Filter and Sort Pipeline
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Type filter
      if (selectedType !== 'all' && t.type !== selectedType) return false;

      // Category filter
      if (selectedCategory !== 'all' && t.category_id !== selectedCategory) return false;

      // Wallet filter
      if (selectedWallet !== 'all' && t.wallet_id !== selectedWallet && t.to_wallet_id !== selectedWallet) return false;

      // Date Range
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;

      // Search query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const catName = catMap.get(t.category_id)?.name.toLowerCase() || '';
        const wName = walletMap.get(t.wallet_id)?.name.toLowerCase() || '';
        const note = (t.note || '').toLowerCase();
        const amtStr = String(t.amount);
        if (!catName.includes(q) && !wName.includes(q) && !note.includes(q) && !amtStr.includes(q)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, selectedType, selectedCategory, selectedWallet, startDate, endDate, searchTerm, sortBy, catMap, walletMap]);

  // Summaries of filtered set
  const filteredSummary = useMemo(() => {
    const inc = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const exp = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { inc, exp, net: inc - exp, count: filteredTransactions.length };
  }, [filteredTransactions]);

  // Bulk Selection Handlers
  const toggleSelectTx = (id: string) => {
    setSelectedTxIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTxIds.length === filteredTransactions.length) {
      setSelectedTxIds([]);
    } else {
      setSelectedTxIds(filteredTransactions.map(t => t.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedTxIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedTxIds.length} selected transactions?`)) {
      bulkDeleteTransactions(selectedTxIds);
      setSelectedTxIds([]);
      setIsBulkMode(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedWallet('all');
    setStartDate('');
    setEndDate('');
    setSortBy('date-desc');
  };

  const isFiltered = searchTerm || selectedType !== 'all' || selectedCategory !== 'all' || selectedWallet !== 'all' || startDate || endDate;

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">
            Transaction History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Detailed ledger of all expenses, incomes, and transfers in PKR
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportTransactionsToExcel(filteredTransactions, categories, wallets, `Transactions_${activeProfile.name}`)}
            className="flex items-center gap-1.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-500/20 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => exportComprehensiveReportPDF(
              `Transaction_Report_${activeProfile.name}`,
              isFiltered ? 'Filtered Selection' : 'Full History',
              filteredTransactions,
              categories,
              wallets,
              budgets,
              savingsGoals,
              activeProfile.name
            )}
            className="flex items-center gap-1.5 rounded-2xl bg-purple-500/10 dark:bg-purple-600/20 border border-purple-500/30 hover:bg-purple-500/20 px-3.5 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 transition-colors"
          >
            <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>PDF Export</span>
          </button>

          <button
            onClick={() => setIsAddTxOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-4 sm:p-5 backdrop-blur-xl shadow-xl space-y-3 transition-colors">
        
        {/* Top search & Type filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Box (5 cols) */}
          <div className="md:col-span-5 relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-purple-500 dark:text-purple-400" />
            <input
              type="text"
              placeholder="Search category, note, amount, wallet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Type Toggle (4 cols) */}
          <div className="md:col-span-4 flex rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1">
            {(['all', 'expense', 'income', 'transfer'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`flex-1 rounded-xl py-1 text-[11px] font-bold capitalize transition-all ${
                  selectedType === t
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Sort Dropdown (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="date-desc">Date (Newest first)</option>
              <option value="date-asc">Date (Oldest first)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Secondary Filters: Category, Wallet, Date Range */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Wallet</label>
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Wallets</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Filter Summary and Clear action */}
        <div className="flex items-center justify-between pt-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{filteredSummary.count}</span> records
            </span>
            <span className="text-slate-300 dark:text-slate-500">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+{formatPKR(filteredSummary.inc)}</span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">-{formatPKR(filteredSummary.exp)}</span>
          </div>

          {isFiltered && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline font-semibold"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsBulkMode(!isBulkMode);
              if (isBulkMode) setSelectedTxIds([]);
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-colors ${
              isBulkMode
                ? 'bg-purple-600/15 border-purple-500 text-purple-700 dark:text-white'
                : 'bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isBulkMode ? 'Exit Selection' : 'Select Multiple'}
          </button>

          {isBulkMode && (
            <button
              onClick={handleSelectAll}
              className="text-xs text-slate-500 dark:text-slate-400 hover:underline"
            >
              {selectedTxIds.length === filteredTransactions.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {isBulkMode && selectedTxIds.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Selected ({selectedTxIds.length})</span>
          </button>
        )}
      </div>

      {/* Transaction List Card */}
      <div className="rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-xl overflow-hidden transition-colors">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Tag className="h-10 w-10 mx-auto mb-2 opacity-30 text-purple-500" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No transactions match the criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the filters or logging a new entry.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredTransactions.map((tx) => {
              const cat = catMap.get(tx.category_id);
              const wallet = walletMap.get(tx.wallet_id);
              const toWallet = tx.to_wallet_id ? walletMap.get(tx.to_wallet_id) : null;
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';
              const isSelected = selectedTxIds.includes(tx.id);

              return (
                <div
                  key={tx.id}
                  onClick={() => {
                    if (isBulkMode) {
                      toggleSelectTx(tx.id);
                    } else {
                      setEditingTransaction(tx);
                      setIsAddTxOpen(true);
                    }
                  }}
                  className={`flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                    isSelected ? 'bg-purple-500/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5 truncate">
                    {isBulkMode && (
                      <div className="text-purple-600 dark:text-purple-400 shrink-0">
                        {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-slate-400" />}
                      </div>
                    )}

                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shrink-0 shadow-sm"
                      style={{
                        backgroundColor: isTransfer ? '#6366F125' : `${cat?.color || '#64748B'}25`,
                        color: isTransfer ? '#818CF8' : (cat?.color || '#94A3B8'),
                      }}
                    >
                      {renderCategoryIcon(isTransfer ? 'ArrowRightLeft' : (cat?.icon || 'Tag'), "w-5 h-5")}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {isTransfer ? `Transfer ➔ ${toWallet?.name || 'Wallet'}` : (cat?.name || 'Uncategorized')}
                        </p>
                        {tx.is_recurring && (
                          <span className="flex items-center gap-0.5 rounded-full bg-purple-500/15 px-1.5 py-0.2 text-[9px] font-semibold text-purple-700 dark:text-purple-300 border border-purple-500/30">
                            <Repeat className="h-2.5 w-2.5" />
                            <span>{tx.recurrence_pattern || 'auto'}</span>
                          </span>
                        )}
                        {tx.receipt_url && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveReceiptUrl(tx.receipt_url!);
                            }}
                            className="rounded-md bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-500/30"
                          >
                            📷 Receipt
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {tx.note || (isTransfer ? `From ${wallet?.name}` : 'No note entered')}
                        {' • '}
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{wallet?.name || 'Wallet'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <p
                      className={`text-sm sm:text-base font-black font-mono ${
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : isTransfer ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {isIncome ? '+' : isTransfer ? '↔ ' : '-'}{formatPKR(tx.amount)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5">{formatDate(tx.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
