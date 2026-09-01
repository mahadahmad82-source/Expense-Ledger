import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  UserProfile,
  Wallet,
  Category,
  Transaction,
  Budget,
  SavingsGoal,
  Bill,
  LedgerMonth,
  AppNotification,
  ActiveTab,
  ThemeMode,
} from '../types';
import {
  INITIAL_PROFILES,
  DEFAULT_CATEGORIES,
  INITIAL_WALLETS,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_BILLS,
  INITIAL_LEDGERS,
} from '../lib/initialData';
import { formatPKR, formatMonthYear } from '../lib/formatters';

interface ExpenseContextType {
  // State
  profiles: UserProfile[];
  activeProfile: UserProfile;
  wallets: Wallet[];
  allWallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  allTransactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  bills: Bill[];
  ledgers: LedgerMonth[];
  notifications: AppNotification[];
  theme: ThemeMode;
  isOnline: boolean;
  activeTab: ActiveTab;
  isBiometricEnabled: boolean;
  isBiometricUnlocked: boolean;
  
  // UI Modal State
  isSearchOpen: boolean;
  isAddTxOpen: boolean;
  isTransferOpen: boolean;
  activeReceiptUrl: string | null;
  selectedMonthForLedger: LedgerMonth | null;
  editingTransaction: Transaction | null;

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setTheme: (theme: ThemeMode) => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsAddTxOpen: (open: boolean) => void;
  setIsTransferOpen: (open: boolean) => void;
  setActiveReceiptUrl: (url: string | null) => void;
  setSelectedMonthForLedger: (ledger: LedgerMonth | null) => void;
  setEditingTransaction: (tx: Transaction | null) => void;
  setIsBiometricUnlocked: (unlocked: boolean) => void;
  toggleBiometricAuth: () => Promise<boolean>;

  // Profile Management
  switchProfile: (profileId: string) => void;
  addProfile: (name: string, email?: string) => UserProfile;
  updateProfile: (id: string, updates: Partial<UserProfile>) => void;
  deleteProfile: (id: string) => void;

  // Wallet Management
  addWallet: (walletData: Omit<Wallet, 'id' | 'created_at' | 'profile_id'>) => Wallet;
  updateWallet: (id: string, updates: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  transferFunds: (fromWalletId: string, toWalletId: string, amount: number, note?: string) => void;

  // Category Management
  addCategory: (categoryData: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Transaction Management
  addTransaction: (txData: Omit<Transaction, 'id' | 'created_at' | 'profile_id'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  bulkDeleteTransactions: (ids: string[]) => void;

  // Budget Management
  addBudget: (budgetData: Omit<Budget, 'id' | 'profile_id'>) => Budget;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Savings Goal Management
  addSavingsGoal: (goalData: Omit<SavingsGoal, 'id' | 'profile_id' | 'current_amount'>) => SavingsGoal;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  contributeToGoal: (goalId: string, amount: number, walletId?: string) => void;
  deleteSavingsGoal: (id: string) => void;

  // Bills Management
  addBill: (billData: Omit<Bill, 'id' | 'created_at' | 'profile_id' | 'is_paid'>) => Bill;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  payBill: (billId: string, walletId: string) => void;
  deleteBill: (id: string) => void;

  // Ledger Management
  closeLedgerMonth: (ledgerId: string) => void;
  reopenLedgerMonth: (ledgerId: string) => void;

  // Notification & Data Tools
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonData: string) => boolean;
  resetAllToDefault: () => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILES: 'expensepk_profiles_v1',
  ACTIVE_PROFILE: 'expensepk_active_profile_v1',
  WALLETS: 'expensepk_wallets_v1',
  CATEGORIES: 'expensepk_categories_v1',
  TRANSACTIONS: 'expensepk_transactions_v1',
  BUDGETS: 'expensepk_budgets_v1',
  SAVINGS: 'expensepk_savings_v1',
  BILLS: 'expensepk_bills_v1',
  LEDGERS: 'expensepk_ledgers_v1',
  THEME: 'expensepk_theme_v1',
  BIOMETRIC: 'expensepk_biometric_v1',
};

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Offline and connectivity detection
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Theme
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode) || 'dark';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    const root = document.documentElement;
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  };

  useEffect(() => {
    setTheme(theme);
  }, []);

  // Biometric / WebAuthn
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.BIOMETRIC) === 'true';
  });
  const [isBiometricUnlocked, setIsBiometricUnlocked] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.BIOMETRIC) !== 'true';
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modal States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [activeReceiptUrl, setActiveReceiptUrl] = useState<string | null>(null);
  const [selectedMonthForLedger, setSelectedMonthForLedger] = useState<LedgerMonth | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Core Data Sets with LocalStorage hydration
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILES);
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE);
    return saved || 'prof-personal';
  });

  const [allWallets, setAllWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WALLETS);
    return saved ? JSON.parse(saved) : INITIAL_WALLETS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [allBudgets, setAllBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [allSavingsGoals, setAllSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVINGS);
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
  });

  const [allBills, setAllBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BILLS);
    return saved ? JSON.parse(saved) : INITIAL_BILLS;
  });

  const [allLedgers, setAllLedgers] = useState<LedgerMonth[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEDGERS);
    return saved ? JSON.parse(saved) : INITIAL_LEDGERS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'K-Electric Bill Due Soon',
      message: 'Your K-Electric bill of Rs. 18,500 is due on Sep 12, 2026.',
      type: 'bill_due',
      date: '2026-09-01T08:00:00Z',
      is_read: false,
      link_tab: 'bills',
    },
    {
      id: 'notif-2',
      title: 'Budget Alert: Food & Dining',
      message: 'You have spent 78% of your Food budget this cycle.',
      type: 'budget_alert',
      date: '2026-08-30T10:00:00Z',
      is_read: false,
      link_tab: 'budgets',
    }
  ]);

  // Synchronize to localStorage whenever datasets change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, activeProfileId);
  }, [activeProfileId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(allWallets));
  }, [allWallets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(allTransactions));
  }, [allTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(allBudgets));
  }, [allBudgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(allSavingsGoals));
  }, [allSavingsGoals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(allBills));
  }, [allBills]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEDGERS, JSON.stringify(allLedgers));
  }, [allLedgers]);

  // Active Profile & Filtered collections
  const activeProfile = useMemo(() => {
    return profiles.find(p => p.id === activeProfileId) || profiles[0] || INITIAL_PROFILES[0];
  }, [profiles, activeProfileId]);

  const wallets = useMemo(() => {
    return allWallets.filter(w => w.profile_id === activeProfile.id);
  }, [allWallets, activeProfile.id]);

  const transactions = useMemo(() => {
    return allTransactions
      .filter(t => t.profile_id === activeProfile.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allTransactions, activeProfile.id]);

  const budgets = useMemo(() => {
    return allBudgets.filter(b => b.profile_id === activeProfile.id);
  }, [allBudgets, activeProfile.id]);

  const savingsGoals = useMemo(() => {
    return allSavingsGoals.filter(s => s.profile_id === activeProfile.id);
  }, [allSavingsGoals, activeProfile.id]);

  const bills = useMemo(() => {
    return allBills.filter(b => b.profile_id === activeProfile.id);
  }, [allBills, activeProfile.id]);

  const ledgers = useMemo(() => {
    return allLedgers.filter(l => l.profile_id === activeProfile.id);
  }, [allLedgers, activeProfile.id]);

  // Auto-manage Monthly Ledgers (computes income/expenses per month)
  useEffect(() => {
    // Generate or update ledgers for months present in transactions
    const monthMap = new Map<string, { income: number; expense: number; month: number; year: number; name: string }>();

    // Current month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    monthMap.set(currentKey, {
      income: 0,
      expense: 0,
      month: currentMonth,
      year: currentYear,
      name: formatMonthYear(currentYear, currentMonth),
    });

    transactions.forEach(t => {
      const d = new Date(t.date);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const key = `${y}-${String(m).padStart(2, '0')}`;
        if (!monthMap.has(key)) {
          monthMap.set(key, {
            income: 0,
            expense: 0,
            month: m,
            year: y,
            name: formatMonthYear(y, m),
          });
        }
        const data = monthMap.get(key)!;
        if (t.type === 'income') data.income += t.amount;
        if (t.type === 'expense') data.expense += t.amount;
      }
    });

    setAllLedgers(prev => {
      const updated = [...prev];
      monthMap.forEach((val, key) => {
        const ledgerId = `ledger-${activeProfile.id}-${key}`;
        const existingIdx = updated.findIndex(l => l.id === ledgerId);
        const isCurrentMonth = val.year === currentYear && val.month === currentMonth;

        const ledgerObj: LedgerMonth = {
          id: ledgerId,
          profile_id: activeProfile.id,
          month: val.month,
          year: val.year,
          month_name: val.name,
          total_income: val.income,
          total_expense: val.expense,
          net_savings: val.income - val.expense,
          is_closed: isCurrentMonth ? false : (existingIdx >= 0 ? updated[existingIdx].is_closed : true),
          closed_at: isCurrentMonth ? undefined : new Date().toISOString(),
        };

        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            total_income: val.income,
            total_expense: val.expense,
            net_savings: val.income - val.expense,
          };
        } else {
          updated.push(ledgerObj);
        }
      });
      return updated.sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month));
    });
  }, [transactions, activeProfile.id]);

  // Profile Actions
  const switchProfile = (profileId: string) => {
    setActiveProfileId(profileId);
  };

  const addProfile = (name: string, email?: string): UserProfile => {
    const newProfile: UserProfile = {
      id: `prof-${Date.now()}`,
      name,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@expensepk.app`,
      is_default: false,
      created_at: new Date().toISOString(),
    };
    setProfiles(prev => [...prev, newProfile]);

    // Create default Cash & Bank wallet for new profile
    const defaultCash: Wallet = {
      id: `w-cash-${Date.now()}`,
      profile_id: newProfile.id,
      name: 'Cash in Hand',
      type: 'cash',
      balance: 10000,
      initial_balance: 10000,
      color: '#10B981',
      icon: 'Coins',
      created_at: new Date().toISOString(),
    };
    setAllWallets(prev => [...prev, defaultCash]);
    setActiveProfileId(newProfile.id);
    return newProfile;
  };

  const updateProfile = (id: string, updates: Partial<UserProfile>) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProfile = (id: string) => {
    if (profiles.length <= 1) {
      alert("You cannot delete the only profile remaining.");
      return;
    }
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfileId === id) {
      const remaining = profiles.filter(p => p.id !== id);
      setActiveProfileId(remaining[0].id);
    }
  };

  // Wallet Actions
  const addWallet = (walletData: Omit<Wallet, 'id' | 'created_at' | 'profile_id'>): Wallet => {
    const newWallet: Wallet = {
      ...walletData,
      id: `w-${Date.now()}`,
      profile_id: activeProfile.id,
      created_at: new Date().toISOString(),
    };
    setAllWallets(prev => [...prev, newWallet]);
    return newWallet;
  };

  const updateWallet = (id: string, updates: Partial<Wallet>) => {
    setAllWallets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const deleteWallet = (id: string) => {
    setAllWallets(prev => prev.filter(w => w.id !== id));
  };

  const transferFunds = (fromWalletId: string, toWalletId: string, amount: number, note?: string) => {
    if (amount <= 0 || fromWalletId === toWalletId) return;

    // Deduct from sender, add to receiver
    setAllWallets(prev => prev.map(w => {
      if (w.id === fromWalletId) return { ...w, balance: w.balance - amount };
      if (w.id === toWalletId) return { ...w, balance: w.balance + amount };
      return w;
    }));

    // Record transaction
    const fromW = allWallets.find(w => w.id === fromWalletId);
    const toW = allWallets.find(w => w.id === toWalletId);

    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      profile_id: activeProfile.id,
      wallet_id: fromWalletId,
      to_wallet_id: toWalletId,
      category_id: 'cat-others-exp',
      amount,
      type: 'transfer',
      date: new Date().toISOString().split('T')[0],
      note: note || `Transfer: ${fromW?.name || 'Wallet'} → ${toW?.name || 'Wallet'}`,
      created_at: new Date().toISOString(),
    };

    setAllTransactions(prev => [tx, ...prev]);
  };

  // Category Actions
  const addCategory = (categoryData: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
      is_custom: true,
      profile_id: activeProfile.id,
    };
    setCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Transaction Actions
  const addTransaction = (txData: Omit<Transaction, 'id' | 'created_at' | 'profile_id'>): Transaction => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      profile_id: activeProfile.id,
      created_at: new Date().toISOString(),
    };

    // Update wallet balance
    setAllWallets(prev => prev.map(w => {
      if (w.id === newTx.wallet_id) {
        if (newTx.type === 'expense') {
          return { ...w, balance: w.balance - newTx.amount };
        } else if (newTx.type === 'income') {
          return { ...w, balance: w.balance + newTx.amount };
        }
      }
      return w;
    }));

    // Auto-Save rules for income: transfer % to active savings goal if enabled
    if (newTx.type === 'income') {
      const activeGoalWithAutoSave = savingsGoals.find(g => g.auto_save_percentage > 0 && !g.completed_at);
      if (activeGoalWithAutoSave) {
        const autoSaveAmt = Math.round((newTx.amount * activeGoalWithAutoSave.auto_save_percentage) / 100);
        if (autoSaveAmt > 0) {
          contributeToGoal(activeGoalWithAutoSave.id, autoSaveAmt, newTx.wallet_id);
          // Send notification
          setNotifications(prev => [{
            id: `notif-${Date.now()}`,
            title: 'Auto-Save Triggered',
            message: `${formatPKR(autoSaveAmt)} (${activeGoalWithAutoSave.auto_save_percentage}%) was automatically routed to your "${activeGoalWithAutoSave.name}" goal.`,
            type: 'goal_reached',
            date: new Date().toISOString(),
            is_read: false,
            link_tab: 'savings',
          }, ...prev]);
        }
      }
    }

    // Check Budget Alerts
    if (newTx.type === 'expense') {
      const overallBudget = budgets.find(b => b.type === 'overall');
      if (overallBudget) {
        // Calculate current month's expenses
        const currentMonthExpense = transactions
          .filter(t => t.type === 'expense')
          .reduce((acc, t) => acc + t.amount, 0) + newTx.amount;

        const percentage = (currentMonthExpense / overallBudget.amount) * 100;
        if (percentage >= 80 && percentage < 100) {
          setNotifications(prev => [{
            id: `notif-${Date.now()}`,
            title: '80% Monthly Budget Reached',
            message: `You have spent ${formatPKR(currentMonthExpense)} of your ${formatPKR(overallBudget.amount)} monthly budget.`,
            type: 'budget_alert',
            date: new Date().toISOString(),
            is_read: false,
            link_tab: 'budgets',
          }, ...prev]);
        } else if (percentage >= 100) {
          setNotifications(prev => [{
            id: `notif-${Date.now()}`,
            title: 'Budget Limit Exceeded!',
            message: `Alert: Total spending (${formatPKR(currentMonthExpense)}) has crossed your ${formatPKR(overallBudget.amount)} budget!`,
            type: 'budget_alert',
            date: new Date().toISOString(),
            is_read: false,
            link_tab: 'budgets',
          }, ...prev]);
        }
      }
    }

    setAllTransactions(prev => [newTx, ...prev]);
    return newTx;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const oldTx = allTransactions.find(t => t.id === id);
    if (!oldTx) return;

    // Reverse old wallet impact and apply new impact
    setAllWallets(prev => prev.map(w => {
      let balance = w.balance;
      if (w.id === oldTx.wallet_id) {
        if (oldTx.type === 'expense') balance += oldTx.amount;
        if (oldTx.type === 'income') balance -= oldTx.amount;
      }
      const newWalletId = updates.wallet_id || oldTx.wallet_id;
      const newAmount = updates.amount !== undefined ? updates.amount : oldTx.amount;
      const newType = updates.type || oldTx.type;

      if (w.id === newWalletId) {
        if (newType === 'expense') balance -= newAmount;
        if (newType === 'income') balance += newAmount;
      }
      return { ...w, balance };
    }));

    setAllTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTransaction = (id: string) => {
    const target = allTransactions.find(t => t.id === id);
    if (target) {
      // Revert wallet impact
      setAllWallets(prev => prev.map(w => {
        if (w.id === target.wallet_id) {
          if (target.type === 'expense') return { ...w, balance: w.balance + target.amount };
          if (target.type === 'income') return { ...w, balance: w.balance - target.amount };
        }
        return w;
      }));
    }
    setAllTransactions(prev => prev.filter(t => t.id !== id));
  };

  const bulkDeleteTransactions = (ids: string[]) => {
    ids.forEach(id => deleteTransaction(id));
  };

  // Budget Actions
  const addBudget = (budgetData: Omit<Budget, 'id' | 'profile_id'>): Budget => {
    const newBudget: Budget = {
      ...budgetData,
      id: `b-${Date.now()}`,
      profile_id: activeProfile.id,
    };
    setAllBudgets(prev => [...prev, newBudget]);
    return newBudget;
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setAllBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBudget = (id: string) => {
    setAllBudgets(prev => prev.filter(b => b.id !== id));
  };

  // Savings Goal Actions
  const addSavingsGoal = (goalData: Omit<SavingsGoal, 'id' | 'profile_id' | 'current_amount'>): SavingsGoal => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `sg-${Date.now()}`,
      profile_id: activeProfile.id,
      current_amount: 0,
    };
    setAllSavingsGoals(prev => [...prev, newGoal]);
    return newGoal;
  };

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setAllSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const contributeToGoal = (goalId: string, amount: number, walletId?: string) => {
    if (amount <= 0) return;

    // Deduct from wallet if wallet provided
    if (walletId) {
      setAllWallets(prev => prev.map(w => w.id === walletId ? { ...w, balance: w.balance - amount } : w));
    }

    setAllSavingsGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const newTotal = g.current_amount + amount;
        const isCompleted = newTotal >= g.target_amount && !g.completed_at;
        return {
          ...g,
          current_amount: newTotal,
          completed_at: isCompleted ? new Date().toISOString() : g.completed_at,
        };
      }
      return g;
    }));
  };

  const deleteSavingsGoal = (id: string) => {
    setAllSavingsGoals(prev => prev.filter(g => g.id !== id));
  };

  // Bills Actions
  const addBill = (billData: Omit<Bill, 'id' | 'created_at' | 'profile_id' | 'is_paid'>): Bill => {
    const newBill: Bill = {
      ...billData,
      id: `bill-${Date.now()}`,
      profile_id: activeProfile.id,
      is_paid: false,
      created_at: new Date().toISOString(),
    };
    setAllBills(prev => [...prev, newBill]);
    return newBill;
  };

  const updateBill = (id: string, updates: Partial<Bill>) => {
    setAllBills(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const payBill = (billId: string, walletId: string) => {
    const bill = allBills.find(b => b.id === billId);
    if (!bill) return;

    // Mark bill paid
    setAllBills(prev => prev.map(b => b.id === billId ? {
      ...b,
      is_paid: true,
      paid_date: new Date().toISOString().split('T')[0],
      wallet_id: walletId,
    } : b));

    // Auto-create expense transaction
    addTransaction({
      wallet_id: walletId,
      category_id: bill.category_id,
      amount: bill.amount,
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      note: `Bill Paid: ${bill.title}`,
      is_recurring: bill.is_recurring,
      recurrence_pattern: bill.recurrence_pattern === 'none' ? undefined : (bill.recurrence_pattern as any),
    });
  };

  const deleteBill = (id: string) => {
    setAllBills(prev => prev.filter(b => b.id !== id));
  };

  // Ledger actions
  const closeLedgerMonth = (ledgerId: string) => {
    setAllLedgers(prev => prev.map(l => l.id === ledgerId ? {
      ...l,
      is_closed: true,
      closed_at: new Date().toISOString(),
    } : l));
  };

  const reopenLedgerMonth = (ledgerId: string) => {
    setAllLedgers(prev => prev.map(l => l.id === ledgerId ? {
      ...l,
      is_closed: false,
      closed_at: undefined,
    } : l));
  };

  // Notifications
  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Biometrics simulation
  const toggleBiometricAuth = async (): Promise<boolean> => {
    const newState = !isBiometricEnabled;
    setIsBiometricEnabled(newState);
    localStorage.setItem(STORAGE_KEYS.BIOMETRIC, String(newState));
    return newState;
  };

  // Backup & Restore
  const exportBackupJSON = () => {
    const data = {
      export_date: new Date().toISOString(),
      version: '1.0',
      currency: 'PKR',
      profiles,
      wallets: allWallets,
      categories,
      transactions: allTransactions,
      budgets: allBudgets,
      savings_goals: allSavingsGoals,
      bills: allBills,
      ledgers: allLedgers,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ExpensePK_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackupJSON = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.profiles) setProfiles(parsed.profiles);
      if (parsed.wallets) setAllWallets(parsed.wallets);
      if (parsed.categories) setCategories(parsed.categories);
      if (parsed.transactions) setAllTransactions(parsed.transactions);
      if (parsed.budgets) setAllBudgets(parsed.budgets);
      if (parsed.savings_goals) setAllSavingsGoals(parsed.savings_goals);
      if (parsed.bills) setAllBills(parsed.bills);
      if (parsed.ledgers) setAllLedgers(parsed.ledgers);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const resetAllToDefault = () => {
    setProfiles(INITIAL_PROFILES);
    setActiveProfileId('prof-personal');
    setAllWallets(INITIAL_WALLETS);
    setCategories(DEFAULT_CATEGORIES);
    setAllTransactions(INITIAL_TRANSACTIONS);
    setAllBudgets(INITIAL_BUDGETS);
    setAllSavingsGoals(INITIAL_SAVINGS_GOALS);
    setAllBills(INITIAL_BILLS);
    setAllLedgers(INITIAL_LEDGERS);
  };

  const value: ExpenseContextType = {
    profiles,
    activeProfile,
    wallets,
    allWallets,
    categories,
    transactions,
    allTransactions,
    budgets,
    savingsGoals,
    bills,
    ledgers,
    notifications,
    theme,
    isOnline,
    activeTab,
    isBiometricEnabled,
    isBiometricUnlocked,

    isSearchOpen,
    isAddTxOpen,
    isTransferOpen,
    activeReceiptUrl,
    selectedMonthForLedger,
    editingTransaction,

    setActiveTab,
    setTheme,
    setIsSearchOpen,
    setIsAddTxOpen,
    setIsTransferOpen,
    setActiveReceiptUrl,
    setSelectedMonthForLedger,
    setEditingTransaction,
    setIsBiometricUnlocked,
    toggleBiometricAuth,

    switchProfile,
    addProfile,
    updateProfile,
    deleteProfile,

    addWallet,
    updateWallet,
    deleteWallet,
    transferFunds,

    addCategory,
    updateCategory,
    deleteCategory,

    addTransaction,
    updateTransaction,
    deleteTransaction,
    bulkDeleteTransactions,

    addBudget,
    updateBudget,
    deleteBudget,

    addSavingsGoal,
    updateSavingsGoal,
    contributeToGoal,
    deleteSavingsGoal,

    addBill,
    updateBill,
    payBill,
    deleteBill,

    closeLedgerMonth,
    reopenLedgerMonth,

    dismissNotification,
    clearAllNotifications,
    exportBackupJSON,
    importBackupJSON,
    resetAllToDefault,
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
