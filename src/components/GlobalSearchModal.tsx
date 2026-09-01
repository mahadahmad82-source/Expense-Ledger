import React, { useState, useMemo, useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';
import {
  Search,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Wallet as WalletIcon,
  Tag,
  FileCheck2,
  Target
} from 'lucide-react';
import { formatPKR, formatDate } from '../lib/formatters';
import { renderCategoryIcon } from '../lib/icons';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    transactions,
    categories,
    wallets,
    bills,
    savingsGoals,
    setActiveTab,
    setEditingTransaction,
    setIsAddTxOpen,
  } = useExpense();

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'transactions' | 'bills' | 'savings'>('all');

  // Keyboard shortcut listener (Cmd+K / Ctrl+K & Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
  const walletMap = useMemo(() => new Map(wallets.map(w => [w.id, w])), [wallets]);

  const results = useMemo(() => {
    if (!query.trim()) return { txs: [], billsList: [], goals: [] };

    const q = query.toLowerCase().trim();

    const txs = transactions.filter(t => {
      const cat = catMap.get(t.category_id)?.name.toLowerCase() || '';
      const wallet = walletMap.get(t.wallet_id)?.name.toLowerCase() || '';
      const note = (t.note || '').toLowerCase();
      const amt = String(t.amount);
      const date = t.date;
      return cat.includes(q) || wallet.includes(q) || note.includes(q) || amt.includes(q) || date.includes(q);
    });

    const billsList = bills.filter(b => {
      const cat = catMap.get(b.category_id)?.name.toLowerCase() || '';
      const title = b.title.toLowerCase();
      const amt = String(b.amount);
      return title.includes(q) || cat.includes(q) || amt.includes(q);
    });

    const goals = savingsGoals.filter(g => {
      return g.name.toLowerCase().includes(q) || String(g.target_amount).includes(q);
    });

    return { txs, billsList, goals };
  }, [query, transactions, bills, savingsGoals, catMap, walletMap]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-md p-4 pt-16 sm:pt-24 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900/95 border border-white/20 shadow-2xl overflow-hidden backdrop-blur-2xl animate-in zoom-in-95 duration-150">
        
        {/* Search Header Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/5">
          <Search className="h-5 w-5 text-purple-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search PKR amount, category, merchant, note, bill, or savings goal..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-white p-1 rounded-md"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="rounded-xl bg-white/10 p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/40 border-b border-white/5 overflow-x-auto">
          {(['all', 'transactions', 'bills', 'savings'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize transition-colors ${
                filterType === type
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="text-center py-10 text-slate-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-30 text-purple-400" />
              <p className="text-xs">Type anything to search across your expenses, bills, and goals.</p>
              <p className="text-[11px] text-slate-600 mt-1">Try: "Biryani", "Petrol", "5000", "Nayatel", "Meezan"</p>
            </div>
          ) : results.txs.length === 0 && results.billsList.length === 0 && results.goals.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm font-semibold">No records found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">Check spelling or try a broader search term.</p>
            </div>
          ) : (
            <>
              {/* Transactions Section */}
              {(filterType === 'all' || filterType === 'transactions') && results.txs.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                      Transactions ({results.txs.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {results.txs.map((t) => {
                      const cat = catMap.get(t.category_id);
                      const wallet = walletMap.get(t.wallet_id);
                      const isIncome = t.type === 'income';

                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            setEditingTransaction(t);
                            setIsAddTxOpen(true);
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center justify-between rounded-2xl bg-white/5 hover:bg-white/10 p-3 transition-colors cursor-pointer border border-white/5"
                        >
                          <div className="flex items-center gap-3 truncate">
                            <div
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0"
                              style={{ backgroundColor: `${cat?.color || '#64748B'}25`, color: cat?.color || '#94A3B8' }}
                            >
                              {renderCategoryIcon(cat?.icon || 'Tag', "w-4 h-4")}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-white truncate">{cat?.name || 'Expense'}</p>
                              <p className="text-[11px] text-slate-400 truncate">{t.note || wallet?.name || 'No note'}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className={`text-xs font-bold ${isIncome ? 'text-emerald-400' : 'text-slate-100'}`}>
                              {isIncome ? '+' : '-'}{formatPKR(t.amount)}
                            </p>
                            <p className="text-[10px] text-slate-500">{formatDate(t.date)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bills Section */}
              {(filterType === 'all' || filterType === 'bills') && results.billsList.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      Bills & Reminders ({results.billsList.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {results.billsList.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => {
                          setActiveTab('bills');
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center justify-between rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 p-3 transition-colors cursor-pointer border border-amber-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-amber-500/20 p-2 text-amber-400">
                            <FileCheck2 className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{b.title}</p>
                            <p className="text-[10px] text-amber-300/80">Due: {formatDate(b.due_date)} {b.is_paid ? '• (Paid)' : '• (Pending)'}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-300">{formatPKR(b.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Savings Goals Section */}
              {(filterType === 'all' || filterType === 'savings') && results.goals.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      Savings Goals ({results.goals.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {results.goals.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => {
                          setActiveTab('savings');
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center justify-between rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 p-3 transition-colors cursor-pointer border border-emerald-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400">
                            <Target className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{g.name}</p>
                            <p className="text-[10px] text-emerald-300/80">
                              {formatPKR(g.current_amount)} of {formatPKR(g.target_amount)} ({Math.round((g.current_amount / g.target_amount) * 100)}%)
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
