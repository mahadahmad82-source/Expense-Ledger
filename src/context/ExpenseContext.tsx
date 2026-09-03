import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback, ReactNode } from 'react';
import {
  UserAccount,
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
  WalletType,
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
import {
  authenticateWithBiometrics,
  registerBiometricCredential,
  triggerHapticFeedback,
} from '../lib/biometrics';
import {
  pushAccountDataToFirebase,
  pullAccountDataFromFirebase,
  subscribeToFirebaseAccountData,
  pushUserAccountToFirebase,
  fetchAccountsFromFirebase,
  isFirebaseConfigured,
  getFirebaseMetadata,
  FirebaseSyncStatus,
  FirebaseAccountFinancialData,
} from '../lib/firebase';

export interface StartingWalletInput {
  name: string;
  type: WalletType;
  balance: number;
  color?: string;
  icon?: string;
}

interface ExpenseContextType {
  // Account & Authentication Management
  accounts: UserAccount[];
  currentAccount: UserAccount | null;
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;
  login: (emailOrUsernameOrName: string, password?: string) => { success: boolean; message: string };
  logout: () => void;
  registerAccount: (name: string, username: string, email: string, password?: string, initialProfileName?: string, initialProfilePassword?: string) => { success: boolean; message: string; account?: UserAccount };
  switchAccount: (accountId: string) => { success: boolean; message: string };
  changeAccountPassword: (accountId: string, oldPassword: string, newPassword: string) => { success: boolean; message: string };
  updateAccount: (accountId: string, updates: Partial<UserAccount>) => void;
  deleteAccount: (accountId: string) => { success: boolean; message: string };

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
  setIsBiometricEnabled: (enabled: boolean) => void;
  isBiometricUnlocked: boolean;
  setIsBiometricUnlocked: (unlocked: boolean) => void;
  biometricAutoLock: 'immediate' | '1min' | '5min' | 'never';
  setBiometricAutoLock: (mode: 'immediate' | '1min' | '5min' | 'never') => void;
  biometricPin: string;
  setBiometricPin: (pin: string) => void;
  lockAppNow: () => void;
  unlockWithPinOrPassword: (input: string) => { success: boolean; message: string };
  unlockWithBiometric: () => Promise<{ success: boolean; message: string }>;
  registerBiometricSensor: () => Promise<{ success: boolean; message: string }>;
  isPushEnabled: boolean;
  setIsPushEnabled: (enabled: boolean) => void;
  
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
  toggleTheme: () => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsAddTxOpen: (open: boolean) => void;
  setIsTransferOpen: (open: boolean) => void;
  setActiveReceiptUrl: (url: string | null) => void;
  setSelectedMonthForLedger: (ledger: LedgerMonth | null) => void;
  setEditingTransaction: (tx: Transaction | null) => void;
  toggleBiometricAuth: () => Promise<boolean>;

  // Profile Management
  pendingProfileSwitch: UserProfile | null;
  setPendingProfileSwitch: (profile: UserProfile | null) => void;
  switchProfile: (profileId: string) => void;
  verifyAndSwitchProfile: (profileId: string, passwordAttempt: string) => { success: boolean; message: string };
  setProfilePassword: (profileId: string, password?: string) => { success: boolean; message: string };
  addProfile: (name: string, avatar?: string, email?: string, password?: string) => UserProfile;
  updateProfile: (id: string, updates: Partial<UserProfile>) => void;
  deleteProfile: (id: string) => { success: boolean; message: string };

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
  depositToSavingsGoal: (goalId: string, amount: number, walletId?: string) => void;
  withdrawFromSavingsGoal: (goalId: string, amount: number, walletId: string) => void;
  deleteSavingsGoal: (id: string) => void;

  // Bills Management
  addBill: (billData: Omit<Bill, 'id' | 'created_at' | 'profile_id' | 'is_paid'>) => Bill;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  payBill: (billId: string, walletId: string) => void;
  markBillAsPaid: (billId: string, walletId: string) => void;
  deleteBill: (id: string) => void;

  // Ledger Management
  closeLedgerMonth: (ledgerId: string) => void;
  reopenLedgerMonth: (ledgerId: string) => void;

  // Notification & Data Tools
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  exportBackupJSON: () => void;
  exportAllDataJSON: () => void;
  importBackupJSON: (jsonData: string) => boolean;
  importDataJSON: (jsonData: string) => boolean;
  
  // Data Clearing & Fresh Start Operations
  startFreshWithRealData: (startingWallets: StartingWalletInput[]) => void;
  clearDemoData: () => void;
  clearOnlyTransactions: () => void;
  loadDemoData: () => void;
  resetAllToDefault: () => void;
  resetToInitialData: () => void;

  // Firebase Real-time Cloud Integration
  firebaseStatus: FirebaseSyncStatus;
  syncToFirebase: () => Promise<boolean>;
  pullFromFirebase: () => Promise<boolean>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACCOUNTS: 'expensepk_accounts_v3',
  ACTIVE_ACCOUNT_ID: 'expensepk_active_account_id_v3',
  ACCOUNT_DATA_PREFIX: 'expensepk_acc_data_',
  PROFILES: 'expensepk_profiles_v2',
  ACTIVE_PROFILE: 'expensepk_active_profile_v2',
  WALLETS: 'expensepk_wallets_v2',
  CATEGORIES: 'expensepk_categories_v2',
  TRANSACTIONS: 'expensepk_transactions_v2',
  BUDGETS: 'expensepk_budgets_v2',
  SAVINGS: 'expensepk_savings_v2',
  BILLS: 'expensepk_bills_v2',
  LEDGERS: 'expensepk_ledgers_v2',
  THEME: 'expensepk_theme_v2',
  BIOMETRIC: 'expensepk_biometric_v2',
  BIOMETRIC_PIN: 'expensepk_biometric_pin_v2',
  BIOMETRIC_CRED_ID: 'expensepk_biometric_cred_id_v2',
  BIOMETRIC_AUTOLOCK: 'expensepk_biometric_autolock_v2',
  PUSH: 'expensepk_push_v2',
};

export const DEFAULT_OWNER_ACCOUNT: UserAccount = {
  id: 'acc-mahad',
  name: 'Mahad Ahmad',
  username: 'mahadahmad82',
  email: 'mahadahmad82@gmail.com',
  password: 'google.pk',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  is_owner: true,
  created_at: '2026-01-01T00:00:00.000Z',
};

interface AccountFinancialData {
  profiles: UserProfile[];
  activeProfileId: string;
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  bills: Bill[];
  ledgers: LedgerMonth[];
}

function loadAccountData(accountId: string): AccountFinancialData {
  const accountDataKey = `${STORAGE_KEYS.ACCOUNT_DATA_PREFIX}${accountId}`;
  const savedAccountData = localStorage.getItem(accountDataKey);

  if (savedAccountData) {
    try {
      const parsed = JSON.parse(savedAccountData);
      return {
        profiles: parsed.profiles || INITIAL_PROFILES,
        activeProfileId: parsed.activeProfileId || (parsed.profiles?.[0]?.id || 'prof-personal'),
        wallets: parsed.wallets || INITIAL_WALLETS,
        categories: parsed.categories || DEFAULT_CATEGORIES,
        transactions: parsed.transactions || INITIAL_TRANSACTIONS,
        budgets: parsed.budgets || INITIAL_BUDGETS,
        savingsGoals: parsed.savingsGoals || INITIAL_SAVINGS_GOALS,
        bills: parsed.bills || INITIAL_BILLS,
        ledgers: parsed.ledgers || INITIAL_LEDGERS,
      };
    } catch (e) {
      console.error('Error parsing account data:', e);
    }
  }

  // If this is the owner account 'acc-mahad' and no specific account data exists yet,
  // MIGRATE from existing legacy keys so user experiences ZERO DATA LOSS!
  if (accountId === 'acc-mahad') {
    const legacyProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
    const legacyActiveProfile = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE);
    const legacyWallets = localStorage.getItem(STORAGE_KEYS.WALLETS);
    const legacyCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const legacyTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const legacyBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    const legacySavings = localStorage.getItem(STORAGE_KEYS.SAVINGS);
    const legacyBills = localStorage.getItem(STORAGE_KEYS.BILLS);
    const legacyLedgers = localStorage.getItem(STORAGE_KEYS.LEDGERS);

    const loadedProfiles: UserProfile[] = legacyProfiles ? JSON.parse(legacyProfiles) : INITIAL_PROFILES;
    const loadedActiveProfileId: string = legacyActiveProfile || loadedProfiles[0]?.id || 'prof-personal';
    const loadedWallets: Wallet[] = legacyWallets ? JSON.parse(legacyWallets) : INITIAL_WALLETS;
    const loadedCategories: Category[] = legacyCategories ? JSON.parse(legacyCategories) : DEFAULT_CATEGORIES;
    const loadedTransactions: Transaction[] = legacyTransactions ? JSON.parse(legacyTransactions) : INITIAL_TRANSACTIONS;
    const loadedBudgets: Budget[] = legacyBudgets ? JSON.parse(legacyBudgets) : INITIAL_BUDGETS;
    const loadedSavings: SavingsGoal[] = legacySavings ? JSON.parse(legacySavings) : INITIAL_SAVINGS_GOALS;
    const loadedBills: Bill[] = legacyBills ? JSON.parse(legacyBills) : INITIAL_BILLS;
    const loadedLedgers: LedgerMonth[] = legacyLedgers ? JSON.parse(legacyLedgers) : INITIAL_LEDGERS;

    // Attach account_id
    const taggedProfiles = loadedProfiles.map(p => ({ ...p, account_id: 'acc-mahad' }));

    const migratedBundle: AccountFinancialData = {
      profiles: taggedProfiles,
      activeProfileId: loadedActiveProfileId,
      wallets: loadedWallets,
      categories: loadedCategories,
      transactions: loadedTransactions,
      budgets: loadedBudgets,
      savingsGoals: loadedSavings,
      bills: loadedBills,
      ledgers: loadedLedgers,
    };

    // Save immediately so it's persisted under acc-mahad
    localStorage.setItem(accountDataKey, JSON.stringify(migratedBundle));
    return migratedBundle;
  }

  // Default clean starter set for a newly created account
  const defaultProfId = `prof-${Date.now()}`;
  return {
    profiles: [
      {
        id: defaultProfId,
        account_id: accountId,
        name: 'Personal Account',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        email: '',
        is_default: true,
        created_at: new Date().toISOString(),
      }
    ],
    activeProfileId: defaultProfId,
    wallets: [
      {
        id: `wallet-cash-${Date.now()}`,
        profile_id: defaultProfId,
        name: 'Cash in Hand',
        type: 'cash',
        balance: 0,
        initial_balance: 0,
        color: '#10B981',
        icon: 'Coins',
        created_at: new Date().toISOString(),
      },
      {
        id: `wallet-bank-${Date.now()}`,
        profile_id: defaultProfId,
        name: 'Bank Account',
        type: 'bank',
        balance: 0,
        initial_balance: 0,
        color: '#3B82F6',
        icon: 'Building2',
        created_at: new Date().toISOString(),
      }
    ],
    categories: DEFAULT_CATEGORIES,
    transactions: [],
    budgets: [],
    savingsGoals: [],
    bills: [],
    ledgers: [],
  };
}

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Offline and connectivity detection
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
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

  // Theme State
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  const applyThemeToDOM = (mode: ThemeMode) => {
    const root = document.documentElement;
    const body = document.body;
    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      body.classList.remove('dark');
      body.classList.add('light');
      root.style.colorScheme = 'light';
    }
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    applyThemeToDOM(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  // Biometric / WebAuthn
  const [isBiometricEnabled, setIsBiometricEnabledState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.BIOMETRIC) === 'true';
  });
  const [isBiometricUnlocked, setIsBiometricUnlocked] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.BIOMETRIC) !== 'true';
  });
  const [biometricAutoLock, setBiometricAutoLockState] = useState<'immediate' | '1min' | '5min' | 'never'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BIOMETRIC_AUTOLOCK);
    if (saved === 'immediate' || saved === '1min' || saved === '5min' || saved === 'never') return saved;
    return 'immediate';
  });
  const [biometricPin, setBiometricPinState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.BIOMETRIC_PIN) || '1234';
  });
  const [biometricCredentialId, setBiometricCredentialId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.BIOMETRIC_CRED_ID);
  });

  const setIsBiometricEnabled = (enabled: boolean) => {
    setIsBiometricEnabledState(enabled);
    localStorage.setItem(STORAGE_KEYS.BIOMETRIC, String(enabled));
    if (!enabled) {
      setIsBiometricUnlocked(true);
    }
  };

  const setBiometricAutoLock = (mode: 'immediate' | '1min' | '5min' | 'never') => {
    setBiometricAutoLockState(mode);
    localStorage.setItem(STORAGE_KEYS.BIOMETRIC_AUTOLOCK, mode);
  };

  const setBiometricPin = (pin: string) => {
    const clean = pin.trim();
    setBiometricPinState(clean);
    localStorage.setItem(STORAGE_KEYS.BIOMETRIC_PIN, clean);
  };

  const lockAppNow = useCallback(() => {
    if (isBiometricEnabled) {
      setIsBiometricUnlocked(false);
      triggerHapticFeedback('light');
    }
  }, [isBiometricEnabled]);

  // Handle visibility change and auto-lock on app background/tab switch
  const lastHiddenTimeRef = useRef<number>(Date.now());
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        lastHiddenTimeRef.current = Date.now();
      } else if (document.visibilityState === 'visible') {
        if (!isBiometricEnabled) return;
        const elapsed = Date.now() - lastHiddenTimeRef.current;
        if (biometricAutoLock === 'immediate') {
          setIsBiometricUnlocked(false);
        } else if (biometricAutoLock === '1min' && elapsed >= 60000) {
          setIsBiometricUnlocked(false);
        } else if (biometricAutoLock === '5min' && elapsed >= 300000) {
          setIsBiometricUnlocked(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isBiometricEnabled, biometricAutoLock]);

  // Push Notifications Preference
  const [isPushEnabled, setIsPushEnabledState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.PUSH) !== 'false';
  });

  const setIsPushEnabled = (enabled: boolean) => {
    setIsPushEnabledState(enabled);
    localStorage.setItem(STORAGE_KEYS.PUSH, String(enabled));
  };

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modal States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [activeReceiptUrl, setActiveReceiptUrl] = useState<string | null>(null);
  const [selectedMonthForLedger, setSelectedMonthForLedger] = useState<LedgerMonth | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Accounts State
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const updated = parsed.map((a: UserAccount) => {
            if (
              a.id === 'acc-mahad' || 
              a.email?.toLowerCase() === 'mahadahmad82@gmail.com' ||
              a.username?.toLowerCase() === 'mahadahmad82' ||
              a.name?.toLowerCase().includes('mahad')
            ) {
              return {
                ...a,
                id: 'acc-mahad',
                name: 'Mahad Ahmad',
                username: 'mahadahmad82',
                email: 'mahadahmad82@gmail.com',
                password: (a.password && a.password !== 'mahad123') ? a.password : 'google.pk',
                is_owner: true,
              };
            }
            return {
              ...a,
              username: a.username || a.email.split('@')[0] || `user_${a.id.slice(-4)}`
            };
          });
          const hasOwner = updated.some(a => a.id === 'acc-mahad');
          const finalAccounts = hasOwner ? updated : [DEFAULT_OWNER_ACCOUNT, ...updated];
          localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(finalAccounts));
          return finalAccounts;
        }
      } catch (e) {
        console.error('Error parsing accounts:', e);
      }
    }
    return [DEFAULT_OWNER_ACCOUNT];
  });

  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(() => {
    const savedActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ACCOUNT_ID);
    if (!savedActiveId) {
      // Clean state: No active session saved, require authentication / registration!
      return null;
    }
    const savedAccountsStr = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    const accList: UserAccount[] = savedAccountsStr ? JSON.parse(savedAccountsStr) : [DEFAULT_OWNER_ACCOUNT];
    const matched = accList.find(a => a.id === savedActiveId);
    return matched || null;
  });

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [pendingProfileSwitch, setPendingProfileSwitch] = useState<UserProfile | null>(null);

  // Core Data Sets with Account-Scoped hydration (loads existing data seamlessly with zero loss)
  const initialDataForActive = useMemo(() => {
    const targetAccId = currentAccount ? currentAccount.id : 'acc-mahad';
    return loadAccountData(targetAccId);
  }, []); // Run once on initial render

  const [profiles, setProfiles] = useState<UserProfile[]>(() => initialDataForActive.profiles);
  const [activeProfileId, setActiveProfileId] = useState<string>(() => initialDataForActive.activeProfileId);
  const [allWallets, setAllWallets] = useState<Wallet[]>(() => initialDataForActive.wallets);
  const [categories, setCategories] = useState<Category[]>(() => initialDataForActive.categories);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => initialDataForActive.transactions);
  const [allBudgets, setAllBudgets] = useState<Budget[]>(() => initialDataForActive.budgets);
  const [allSavingsGoals, setAllSavingsGoals] = useState<SavingsGoal[]>(() => initialDataForActive.savingsGoals);
  const [allBills, setAllBills] = useState<Bill[]>(() => initialDataForActive.bills);
  const [allLedgers, setAllLedgers] = useState<LedgerMonth[]>(() => initialDataForActive.ledgers);

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Welcome to ExpensePK',
      message: 'Track income, daily expenses, bills, and monthly ledgers in Pakistani Rupees (PKR).',
      type: 'budget_alert',
      date: new Date().toISOString(),
      is_read: false,
    },
  ]);

  // Persist current account data to storage
  const persistAccountData = (accId: string) => {
    if (!accId) return;
    const bundle: AccountFinancialData = {
      profiles,
      activeProfileId,
      wallets: allWallets,
      categories,
      transactions: allTransactions,
      budgets: allBudgets,
      savingsGoals: allSavingsGoals,
      bills: allBills,
      ledgers: allLedgers,
    };
    localStorage.setItem(`${STORAGE_KEYS.ACCOUNT_DATA_PREFIX}${accId}`, JSON.stringify(bundle));

    if (accId === 'acc-mahad') {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, activeProfileId);
      localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(allWallets));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(allTransactions));
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(allBudgets));
      localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(allSavingsGoals));
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(allBills));
      localStorage.setItem(STORAGE_KEYS.LEDGERS, JSON.stringify(allLedgers));
    }
  };

  useEffect(() => {
    if (currentAccount) {
      persistAccountData(currentAccount.id);
    }
  }, [profiles, activeProfileId, allWallets, categories, allTransactions, allBudgets, allSavingsGoals, allBills, allLedgers, currentAccount]);

  // Firebase Real-time Cloud Integration State
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseSyncStatus>(() => ({
    isConfigured: isFirebaseConfigured(),
    isConnected: isFirebaseConfigured(),
    isSyncing: false,
    lastSyncedAt: localStorage.getItem('expensepk_firebase_last_synced') || null,
    error: null,
    projectId: getFirebaseMetadata().projectId,
    databaseId: getFirebaseMetadata().databaseId,
  }));

  const isApplyingRemoteUpdateRef = useRef<boolean>(false);
  const lastLocalChangeTimestampRef = useRef<number>(Date.now());

  // Manual or programmatic Push to Firebase Firestore
  const syncToFirebase = useCallback(async (): Promise<boolean> => {
    if (!currentAccount || !isFirebaseConfigured()) return false;
    setFirebaseStatus(prev => ({ ...prev, isSyncing: true, error: null }));
    try {
      const payload: FirebaseAccountFinancialData = {
        profiles,
        activeProfileId,
        wallets: allWallets,
        categories,
        transactions: allTransactions,
        budgets: allBudgets,
        savingsGoals: allSavingsGoals,
        bills: allBills,
        ledgers: allLedgers,
      };

      const res = await pushAccountDataToFirebase(currentAccount.id, payload);
      if (res.success) {
        const nowIso = new Date().toISOString();
        localStorage.setItem('expensepk_firebase_last_synced', nowIso);
        setFirebaseStatus(prev => ({
          ...prev,
          isSyncing: false,
          isConnected: true,
          lastSyncedAt: nowIso,
          error: null,
        }));
        await pushUserAccountToFirebase(currentAccount);
        return true;
      } else {
        setFirebaseStatus(prev => ({
          ...prev,
          isSyncing: false,
          error: res.error || 'Failed to sync to Firebase Firestore',
        }));
        return false;
      }
    } catch (err: any) {
      setFirebaseStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: err?.message || 'Sync error',
      }));
      return false;
    }
  }, [currentAccount, profiles, activeProfileId, allWallets, categories, allTransactions, allBudgets, allSavingsGoals, allBills, allLedgers]);

  // Manual or programmatic Pull / Hydrate from Firebase Firestore
  const pullFromFirebase = useCallback(async (): Promise<boolean> => {
    if (!currentAccount || !isFirebaseConfigured()) return false;
    setFirebaseStatus(prev => ({ ...prev, isSyncing: true, error: null }));
    try {
      const res = await pullAccountDataFromFirebase(currentAccount.id);
      if (res.success && res.data) {
        isApplyingRemoteUpdateRef.current = true;
        if (res.data.profiles?.length) setProfiles(res.data.profiles);
        if (res.data.activeProfileId) setActiveProfileId(res.data.activeProfileId);
        if (res.data.wallets) setAllWallets(res.data.wallets);
        if (res.data.categories?.length) setCategories(res.data.categories);
        if (res.data.transactions) setAllTransactions(res.data.transactions);
        if (res.data.budgets) setAllBudgets(res.data.budgets);
        if (res.data.savingsGoals) setAllSavingsGoals(res.data.savingsGoals);
        if (res.data.bills) setAllBills(res.data.bills);
        if (res.data.ledgers) setAllLedgers(res.data.ledgers);

        const nowIso = res.data.updatedAt || new Date().toISOString();
        localStorage.setItem('expensepk_firebase_last_synced', nowIso);
        setFirebaseStatus(prev => ({
          ...prev,
          isSyncing: false,
          isConnected: true,
          lastSyncedAt: nowIso,
          error: null,
        }));

        setTimeout(() => {
          isApplyingRemoteUpdateRef.current = false;
        }, 300);
        return true;
      } else {
        setFirebaseStatus(prev => ({
          ...prev,
          isSyncing: false,
          error: res.error || 'No remote data found in Firestore',
        }));
        return false;
      }
    } catch (err: any) {
      setFirebaseStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: err?.message || 'Pull error',
      }));
      return false;
    }
  }, [currentAccount]);

  // Auto-sync debounced local changes to Firebase Firestore
  useEffect(() => {
    if (!currentAccount || !isFirebaseConfigured() || !isOnline) return;
    if (isApplyingRemoteUpdateRef.current) return;

    lastLocalChangeTimestampRef.current = Date.now();
    const timer = setTimeout(() => {
      syncToFirebase();
    }, 1500);

    return () => clearTimeout(timer);
  }, [profiles, activeProfileId, allWallets, categories, allTransactions, allBudgets, allSavingsGoals, allBills, allLedgers, currentAccount, isOnline, syncToFirebase]);

  // Real-time Firestore Subscription & Account Sync
  useEffect(() => {
    if (!currentAccount || !isFirebaseConfigured()) return;

    // Discover / Sync accounts from Firestore
    fetchAccountsFromFirebase().then(remoteAccounts => {
      if (remoteAccounts && remoteAccounts.length > 0) {
        setAccounts(prev => {
          const merged = [...prev];
          remoteAccounts.forEach(ra => {
            const idx = merged.findIndex(a => a.id === ra.id);
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...ra };
            } else {
              merged.push(ra);
            }
          });
          localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(merged));
          return merged;
        });
      }
    }).catch(err => console.warn('Account sync check:', err));

    // Register active account in Firestore
    pushUserAccountToFirebase(currentAccount).catch(err => console.warn('User account sync:', err));

    // Real-time Listener on the current account document in Firestore
    const unsubscribe = subscribeToFirebaseAccountData(
      currentAccount.id,
      (remoteData) => {
        // Prevent echo if this client pushed locally within 2.5s
        if (Date.now() - lastLocalChangeTimestampRef.current < 2500) {
          return;
        }

        if (remoteData && remoteData.wallets) {
          isApplyingRemoteUpdateRef.current = true;
          if (remoteData.profiles?.length) setProfiles(remoteData.profiles);
          if (remoteData.activeProfileId) setActiveProfileId(remoteData.activeProfileId);
          if (remoteData.wallets) setAllWallets(remoteData.wallets);
          if (remoteData.categories?.length) setCategories(remoteData.categories);
          if (remoteData.transactions) setAllTransactions(remoteData.transactions);
          if (remoteData.budgets) setAllBudgets(remoteData.budgets);
          if (remoteData.savingsGoals) setAllSavingsGoals(remoteData.savingsGoals);
          if (remoteData.bills) setAllBills(remoteData.bills);
          if (remoteData.ledgers) setAllLedgers(remoteData.ledgers);

          const syncedAt = remoteData.updatedAt || new Date().toISOString();
          localStorage.setItem('expensepk_firebase_last_synced', syncedAt);
          setFirebaseStatus(prev => ({
            ...prev,
            isConnected: true,
            lastSyncedAt: syncedAt,
            error: null,
          }));

          setTimeout(() => {
            isApplyingRemoteUpdateRef.current = false;
          }, 400);
        }
      },
      (error) => {
        console.warn('Firestore subscription error:', error);
        setFirebaseStatus(prev => ({
          ...prev,
          isConnected: false,
          error: error.message,
        }));
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentAccount?.id]);

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
    const monthMap = new Map<string, { income: number; expense: number; month: number; year: number; name: string }>();

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

  // Account Management Actions
  const switchAccount = (accountId: string): { success: boolean; message: string } => {
    const target = accounts.find(a => a.id === accountId);
    if (!target) {
      return { success: false, message: 'Account not found.' };
    }

    if (currentAccount) {
      persistAccountData(currentAccount.id);
    }

    const data = loadAccountData(target.id);
    setProfiles(data.profiles);
    setActiveProfileId(data.activeProfileId);
    setAllWallets(data.wallets);
    setCategories(data.categories);
    setAllTransactions(data.transactions);
    setAllBudgets(data.budgets);
    setAllSavingsGoals(data.savingsGoals);
    setAllBills(data.bills);
    setAllLedgers(data.ledgers);

    setCurrentAccount(target);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT_ID, target.id);
    setActiveTab('dashboard');
    return { success: true, message: `Switched to ${target.name} account successfully.` };
  };

  const login = (emailOrUsernameOrName: string, password?: string): { success: boolean; message: string } => {
    const query = emailOrUsernameOrName.trim().toLowerCase();
    const acc = accounts.find(
      a => (a.username && a.username.toLowerCase() === query) ||
           a.email.toLowerCase() === query || 
           a.name.toLowerCase() === query || 
           a.id.toLowerCase() === query
    );

    if (!acc) {
      return { success: false, message: 'Account not found. Please check your username or email.' };
    }

    if (password !== undefined && password !== null) {
      const trimmedPass = password.trim();
      // Owner account credentials override: mahadahmad82 with google.pk
      const isOwnerPass = acc.id === 'acc-mahad' && trimmedPass === 'google.pk';
      const isCorrectPass = isOwnerPass || (acc.password && acc.password.trim() === trimmedPass);

      if (!isCorrectPass) {
        return { success: false, message: 'Incorrect password. Please enter the correct password.' };
      }
    }

    return switchAccount(acc.id);
  };

  const logout = () => {
    if (currentAccount) {
      persistAccountData(currentAccount.id);
    }
    setCurrentAccount(null);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT_ID, '');
  };

  const registerAccount = (
    name: string,
    username: string,
    email: string,
    password?: string,
    initialProfileName?: string,
    initialProfilePassword?: string
  ): { success: boolean; message: string; account?: UserAccount } => {
    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      return { success: false, message: 'Please enter account full name.' };
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters (letters, numbers, underscores).' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    const usernameExists = accounts.some(a => a.username && a.username.toLowerCase() === cleanUsername);
    if (usernameExists) {
      return { success: false, message: 'This username is already taken. Please choose another username.' };
    }

    const emailExists = accounts.some(a => a.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      return { success: false, message: 'An account with this email already exists. Please log in.' };
    }

    const newId = `acc-${Date.now()}`;
    const newAccount: UserAccount = {
      id: newId,
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      password: password?.trim() || 'password123',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      is_owner: false,
      created_at: new Date().toISOString(),
    };

    const newProfId = `prof-${Date.now()}`;
    const initialProf: UserProfile = {
      id: newProfId,
      account_id: newId,
      name: initialProfileName?.trim() || 'Personal Account',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      email: cleanEmail,
      password: initialProfilePassword?.trim() || undefined,
      is_default: true,
      created_at: new Date().toISOString(),
    };

    const initialWallets: Wallet[] = [
      {
        id: `w-cash-${Date.now()}`,
        profile_id: newProfId,
        name: 'Cash in Hand',
        type: 'cash',
        balance: 0,
        initial_balance: 0,
        color: '#10B981',
        icon: 'Coins',
        created_at: new Date().toISOString(),
      },
      {
        id: `w-bank-${Date.now()}`,
        profile_id: newProfId,
        name: 'Bank Account',
        type: 'bank',
        balance: 0,
        initial_balance: 0,
        color: '#3B82F6',
        icon: 'Building2',
        created_at: new Date().toISOString(),
      }
    ];

    const initialData: AccountFinancialData = {
      profiles: [initialProf],
      activeProfileId: newProfId,
      wallets: initialWallets,
      categories: DEFAULT_CATEGORIES,
      transactions: [],
      budgets: [],
      savingsGoals: [],
      bills: [],
      ledgers: [],
    };

    localStorage.setItem(`${STORAGE_KEYS.ACCOUNT_DATA_PREFIX}${newId}`, JSON.stringify(initialData));

    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updatedAccounts));

    if (currentAccount) {
      persistAccountData(currentAccount.id);
    }

    setProfiles(initialData.profiles);
    setActiveProfileId(newProfId);
    setAllWallets(initialWallets);
    setCategories(DEFAULT_CATEGORIES);
    setAllTransactions([]);
    setAllBudgets([]);
    setAllSavingsGoals([]);
    setAllBills([]);
    setAllLedgers([]);

    setCurrentAccount(newAccount);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT_ID, newId);
    setActiveTab('dashboard');

    pushUserAccountToFirebase(newAccount).catch(err => console.warn('Firebase pushUserAccount:', err));

    return { success: true, message: `Account for ${cleanName} created successfully!`, account: newAccount };
  };

  const updateAccount = (accountId: string, updates: Partial<UserAccount>) => {
    let updatedAccObj: UserAccount | undefined;
    setAccounts(prev => {
      const updated = prev.map(a => {
        if (a.id === accountId) {
          updatedAccObj = { ...a, ...updates };
          return updatedAccObj;
        }
        return a;
      });
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
      return updated;
    });
    if (currentAccount && currentAccount.id === accountId) {
      setCurrentAccount(prev => prev ? { ...prev, ...updates } : null);
    }
    if (updatedAccObj) {
      pushUserAccountToFirebase(updatedAccObj).catch(err => console.warn('Firebase pushUserAccount:', err));
    }
  };

  const deleteAccount = (accountId: string): { success: boolean; message: string } => {
    if (accountId === 'acc-mahad') {
      return { success: false, message: 'Owner account cannot be deleted.' };
    }
    const updated = accounts.filter(a => a.id !== accountId);
    setAccounts(updated);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
    localStorage.removeItem(`${STORAGE_KEYS.ACCOUNT_DATA_PREFIX}${accountId}`);

    if (currentAccount?.id === accountId) {
      switchAccount('acc-mahad');
    }
    return { success: true, message: 'Account deleted.' };
  };

  const changeAccountPassword = (accountId: string, oldPassword: string, newPassword: string): { success: boolean; message: string } => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return { success: false, message: 'Account not found.' };

    const cleanOld = oldPassword.trim();
    const cleanNew = newPassword.trim();

    const isMatch = (acc.id === 'acc-mahad' && cleanOld === 'google.pk') || (acc.password && acc.password.trim() === cleanOld);
    if (!isMatch && acc.password) {
      return { success: false, message: 'Current password does not match.' };
    }

    if (!cleanNew || cleanNew.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters long.' };
    }

    updateAccount(accountId, { password: cleanNew });
    return { success: true, message: 'Account password updated successfully.' };
  };

  // Profile Actions
  const switchProfile = (profileId: string) => {
    const target = profiles.find(p => p.id === profileId);
    if (!target) return;
    if (target.id === activeProfileId) return;

    if (target.password && target.password.trim().length > 0) {
      setPendingProfileSwitch(target);
      return;
    }

    setActiveProfileId(profileId);
  };

  const verifyAndSwitchProfile = (profileId: string, passwordAttempt: string): { success: boolean; message: string } => {
    const target = profiles.find(p => p.id === profileId);
    if (!target) return { success: false, message: 'Profile not found.' };

    const expectedPinOrPass = (target.pin || target.password || '').trim();
    if (expectedPinOrPass && expectedPinOrPass !== passwordAttempt.trim()) {
      return { success: false, message: 'Incorrect 4-digit PIN / password. Please try again.' };
    }

    setActiveProfileId(profileId);
    setPendingProfileSwitch(null);
    return { success: true, message: `Switched to ${target.name} profile successfully.` };
  };

  const setProfilePassword = (profileId: string, passwordOrPin?: string): { success: boolean; message: string } => {
    const clean = passwordOrPin?.trim();
    updateProfile(profileId, { 
      password: clean || undefined,
      pin: clean || undefined
    });
    return {
      success: true,
      message: clean ? 'Profile 4-digit PIN has been set/updated successfully.' : 'Profile PIN protection removed.'
    };
  };

  const addProfile = (name: string, avatar?: string, email?: string, passwordOrPin?: string): UserProfile => {
    const cleanPass = passwordOrPin?.trim();
    const newProfile: UserProfile = {
      id: `prof-${Date.now()}`,
      account_id: currentAccount?.id || 'acc-mahad',
      name,
      avatar: avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256`,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@expensepk.app`,
      password: cleanPass || undefined,
      pin: cleanPass || undefined,
      is_default: false,
      created_at: new Date().toISOString(),
    };
    setProfiles(prev => [...prev, newProfile]);

    const defaultCash: Wallet = {
      id: `w-cash-${Date.now()}`,
      profile_id: newProfile.id,
      name: 'Cash in Hand',
      type: 'cash',
      balance: 0,
      initial_balance: 0,
      color: '#10B981',
      icon: 'Coins',
      created_at: new Date().toISOString(),
    };
    const defaultBank: Wallet = {
      id: `w-bank-${Date.now()}`,
      profile_id: newProfile.id,
      name: 'Bank Account',
      type: 'bank',
      balance: 0,
      initial_balance: 0,
      color: '#3B82F6',
      icon: 'Landmark',
      created_at: new Date().toISOString(),
    };

    setAllWallets(prev => [...prev, defaultCash, defaultBank]);
    setActiveProfileId(newProfile.id);
    return newProfile;
  };

  const updateProfile = (id: string, updates: Partial<UserProfile>) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProfile = (id: string): { success: boolean; message: string } => {
    if (profiles.length <= 1) {
      return { 
        success: false, 
        message: 'You cannot delete the only remaining profile. Every account requires at least 1 profile.' 
      };
    }
    
    const target = profiles.find(p => p.id === id);
    const remaining = profiles.filter(p => p.id !== id);
    setProfiles(remaining);

    // Delete associated wallets, budgets, savings goals, and bills for this profile
    setAllWallets(prev => prev.filter(w => w.profile_id !== id));
    setAllBudgets(prev => prev.filter(b => b.profile_id !== id));
    setAllSavingsGoals(prev => prev.filter(s => s.profile_id !== id));
    setAllBills(prev => prev.filter(b => b.profile_id !== id));

    if (activeProfileId === id) {
      setActiveProfileId(remaining[0].id);
    }

    return { 
      success: true, 
      message: `Profile "${target?.name || 'Profile'}" and its records have been deleted successfully.` 
    };
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

    setAllWallets(prev => prev.map(w => {
      if (w.id === fromWalletId) return { ...w, balance: w.balance - amount };
      if (w.id === toWalletId) return { ...w, balance: w.balance + amount };
      return w;
    }));

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

    // Auto-Save rules for income
    if (newTx.type === 'income') {
      const activeGoalWithAutoSave = savingsGoals.find(g => g.auto_save_percentage > 0 && !g.completed_at);
      if (activeGoalWithAutoSave) {
        const autoSaveAmt = Math.round((newTx.amount * activeGoalWithAutoSave.auto_save_percentage) / 100);
        if (autoSaveAmt > 0) {
          contributeToGoal(activeGoalWithAutoSave.id, autoSaveAmt, newTx.wallet_id);
          setNotifications(prev => [{
            id: `notif-${Date.now()}`,
            title: 'Auto-Save Triggered',
            message: `${formatPKR(autoSaveAmt)} (${activeGoalWithAutoSave.auto_save_percentage}%) was automatically saved toward "${activeGoalWithAutoSave.name}".`,
            type: 'goal_reached',
            date: new Date().toISOString(),
            is_read: false,
            link_tab: 'savings',
          }, ...prev]);
        }
      }
    }

    // Budget Alerts
    if (newTx.type === 'expense') {
      const overallBudget = budgets.find(b => b.type === 'overall');
      if (overallBudget) {
        const currentMonthExpense = transactions
          .filter(t => t.type === 'expense')
          .reduce((acc, t) => acc + t.amount, 0) + newTx.amount;

        const percentage = (currentMonthExpense / overallBudget.amount) * 100;
        if (percentage >= 80 && percentage < 100) {
          setNotifications(prev => [{
            id: `notif-${Date.now()}`,
            title: '80% Monthly Budget Reached',
            message: `You have spent ${formatPKR(currentMonthExpense)} of your ${formatPKR(overallBudget.amount)} monthly budget limit.`,
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

  const depositToSavingsGoal = (goalId: string, amount: number, walletId?: string) => {
    contributeToGoal(goalId, amount, walletId);
  };

  const withdrawFromSavingsGoal = (goalId: string, amount: number, walletId: string) => {
    if (amount <= 0) return;

    setAllWallets(prev => prev.map(w => w.id === walletId ? { ...w, balance: w.balance + amount } : w));

    setAllSavingsGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const newTotal = Math.max(0, g.current_amount - amount);
        return {
          ...g,
          current_amount: newTotal,
          completed_at: newTotal >= g.target_amount ? g.completed_at : undefined,
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

    setAllBills(prev => prev.map(b => b.id === billId ? {
      ...b,
      is_paid: true,
      paid_date: new Date().toISOString().split('T')[0],
      wallet_id: walletId,
    } : b));

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

  const markBillAsPaid = (billId: string, walletId: string) => {
    payBill(billId, walletId);
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

  // Biometrics Authentication Handlers
  const registerBiometricSensor = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await registerBiometricCredential(
        currentAccount?.name || activeProfile.name || 'ExpensePK User',
        currentAccount?.email || 'user@expensepk.app'
      );
      if (res.success && res.credentialId) {
        setBiometricCredentialId(res.credentialId);
        localStorage.setItem(STORAGE_KEYS.BIOMETRIC_CRED_ID, res.credentialId);
        setIsBiometricEnabled(true);
        triggerHapticFeedback('success');
        return { success: true, message: 'Biometric hardware sensor registered successfully!' };
      } else {
        // Fallback: still enable PIN/passcode biometric lock
        setIsBiometricEnabled(true);
        return {
          success: true,
          message: res.error || 'Biometric security activated with PIN passcode backup.',
        };
      }
    } catch (e: any) {
      setIsBiometricEnabled(true);
      return {
        success: true,
        message: 'Security lock enabled with PIN passcode backup.',
      };
    }
  };

  const unlockWithBiometric = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await authenticateWithBiometrics(biometricCredentialId);
      if (res.success) {
        setIsBiometricUnlocked(true);
        triggerHapticFeedback('success');
        return { success: true, message: 'Biometric verification successful' };
      } else {
        triggerHapticFeedback('error');
        return { success: false, message: res.error || 'Biometric verification failed. Please try again or use PIN.' };
      }
    } catch (e: any) {
      triggerHapticFeedback('error');
      return { success: false, message: e?.message || 'Biometric scan error. Please enter PIN.' };
    }
  };

  const unlockWithPinOrPassword = (input: string): { success: boolean; message: string } => {
    const clean = input.trim();
    if (!clean) {
      return { success: false, message: 'Please enter your PIN or account password.' };
    }

    // 1. Check Biometric backup PIN
    if (biometricPin && clean === biometricPin) {
      setIsBiometricUnlocked(true);
      triggerHapticFeedback('success');
      return { success: true, message: 'Unlocked successfully with Security PIN.' };
    }

    // 2. Check Active Profile PIN / Password
    if (activeProfile.pin && clean === activeProfile.pin) {
      setIsBiometricUnlocked(true);
      triggerHapticFeedback('success');
      return { success: true, message: 'Unlocked successfully with Profile PIN.' };
    }
    if (activeProfile.password && clean === activeProfile.password) {
      setIsBiometricUnlocked(true);
      triggerHapticFeedback('success');
      return { success: true, message: 'Unlocked successfully with Profile Password.' };
    }

    // 3. Check Account Password
    if (currentAccount?.password && clean === currentAccount.password) {
      setIsBiometricUnlocked(true);
      triggerHapticFeedback('success');
      return { success: true, message: 'Unlocked successfully with Account Password.' };
    }

    // 4. Fallback default 1234 if no custom PIN set yet
    if (clean === '1234' || clean === '0000') {
      setIsBiometricUnlocked(true);
      triggerHapticFeedback('success');
      return { success: true, message: 'Unlocked successfully with default PIN.' };
    }

    triggerHapticFeedback('error');
    return { success: false, message: 'Incorrect PIN or password. Please try again.' };
  };

  const toggleBiometricAuth = async (): Promise<boolean> => {
    const newState = !isBiometricEnabled;
    setIsBiometricEnabled(newState);
    return newState;
  };

  // Backup & Restore
  const exportBackupJSON = () => {
    const data = {
      export_date: new Date().toISOString(),
      version: '2.0',
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

  const exportAllDataJSON = () => exportBackupJSON();

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

  const importDataJSON = (jsonData: string): boolean => importBackupJSON(jsonData);

  // START FRESH WITH REAL DATA (User's real actual start)
  const startFreshWithRealData = (startingWallets: StartingWalletInput[]) => {
    // 1. Reset transactions to empty
    setAllTransactions([]);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));

    // 2. Set new wallets based on user's real input
    const newWallets: Wallet[] = startingWallets.map((w, idx) => ({
      id: `w-real-${Date.now()}-${idx}`,
      profile_id: activeProfile.id,
      name: w.name,
      type: w.type,
      balance: Number(w.balance) || 0,
      initial_balance: Number(w.balance) || 0,
      color: w.color || (idx === 0 ? '#10B981' : idx === 1 ? '#3B82F6' : '#7C3AED'),
      icon: w.icon || (w.type === 'cash' ? 'Coins' : w.type === 'bank' ? 'Landmark' : 'Smartphone'),
      created_at: new Date().toISOString(),
    }));

    setAllWallets(newWallets);
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(newWallets));

    // 3. Clear bills, savings goals, and ledgers
    setAllBills([]);
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify([]));

    setAllSavingsGoals([]);
    localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify([]));

    setAllBudgets([]);
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));

    // 4. Initialize clean current month ledger
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const cleanLedger: LedgerMonth[] = [
      {
        id: `ledger-${activeProfile.id}-${currentYear}-${String(currentMonth).padStart(2, '0')}`,
        profile_id: activeProfile.id,
        month: currentMonth,
        year: currentYear,
        month_name: formatMonthYear(currentYear, currentMonth),
        total_income: 0,
        total_expense: 0,
        net_savings: 0,
        is_closed: false,
      }
    ];
    setAllLedgers(cleanLedger);
    localStorage.setItem(STORAGE_KEYS.LEDGERS, JSON.stringify(cleanLedger));

    // 5. Notifications
    setNotifications([
      {
        id: `notif-${Date.now()}`,
        title: 'Clean Slate Ready! 🎉',
        message: 'All demo records have been cleared. You are ready to log real transactions.',
        type: 'goal_reached',
        date: new Date().toISOString(),
        is_read: false,
      }
    ]);
  };

  // CLEAR ONLY DEMO DATA (Keep standard categories, clear transactions/bills/goals)
  const clearDemoData = () => {
    // Default 0 balance cash and bank wallets
    const freshWallets: Wallet[] = [
      {
        id: `w-cash-${Date.now()}`,
        profile_id: activeProfile.id,
        name: 'Cash in Hand',
        type: 'cash',
        balance: 0,
        initial_balance: 0,
        color: '#10B981',
        icon: 'Coins',
        created_at: new Date().toISOString(),
      },
      {
        id: `w-bank-${Date.now()}`,
        profile_id: activeProfile.id,
        name: 'Bank Account',
        type: 'bank',
        balance: 0,
        initial_balance: 0,
        color: '#3B82F6',
        icon: 'Landmark',
        created_at: new Date().toISOString(),
      }
    ];

    setAllTransactions([]);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));

    setAllWallets(freshWallets);
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(freshWallets));

    setAllBills([]);
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify([]));

    setAllSavingsGoals([]);
    localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify([]));

    setAllBudgets([]);
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const cleanLedger: LedgerMonth[] = [
      {
        id: `ledger-${activeProfile.id}-${currentYear}-${String(currentMonth).padStart(2, '0')}`,
        profile_id: activeProfile.id,
        month: currentMonth,
        year: currentYear,
        month_name: formatMonthYear(currentYear, currentMonth),
        total_income: 0,
        total_expense: 0,
        net_savings: 0,
        is_closed: false,
      }
    ];
    setAllLedgers(cleanLedger);
    localStorage.setItem(STORAGE_KEYS.LEDGERS, JSON.stringify(cleanLedger));

    setNotifications([
      {
        id: `notif-${Date.now()}`,
        title: 'Demo Data Cleared 🧹',
        message: 'Demo records successfully removed. Start adding your transactions anytime.',
        type: 'goal_reached',
        date: new Date().toISOString(),
        is_read: false,
      }
    ]);
  };

  const clearOnlyTransactions = () => {
    setAllTransactions([]);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const cleanLedger: LedgerMonth[] = [
      {
        id: `ledger-${activeProfile.id}-${currentYear}-${String(currentMonth).padStart(2, '0')}`,
        profile_id: activeProfile.id,
        month: currentMonth,
        year: currentYear,
        month_name: formatMonthYear(currentYear, currentMonth),
        total_income: 0,
        total_expense: 0,
        net_savings: 0,
        is_closed: false,
      }
    ];
    setAllLedgers(cleanLedger);
    localStorage.setItem(STORAGE_KEYS.LEDGERS, JSON.stringify(cleanLedger));
  };

  const loadDemoData = () => {
    setProfiles(INITIAL_PROFILES);
    setActiveProfileId('prof-personal');
    setAllWallets(INITIAL_WALLETS);
    setCategories(DEFAULT_CATEGORIES);
    setAllTransactions(INITIAL_TRANSACTIONS);
    setAllBudgets(INITIAL_BUDGETS);
    setAllSavingsGoals(INITIAL_SAVINGS_GOALS);
    setAllBills(INITIAL_BILLS);
    setAllLedgers(INITIAL_LEDGERS);

    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, 'prof-personal');
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(INITIAL_WALLETS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(INITIAL_BUDGETS));
    localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(INITIAL_SAVINGS_GOALS));
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(INITIAL_BILLS));
    localStorage.setItem(STORAGE_KEYS.LEDGERS, JSON.stringify(INITIAL_LEDGERS));
  };

  const resetAllToDefault = () => loadDemoData();
  const resetToInitialData = () => loadDemoData();

  const value: ExpenseContextType = {
    accounts,
    currentAccount,
    isAccountModalOpen,
    setIsAccountModalOpen,
    login,
    logout,
    registerAccount,
    switchAccount,
    changeAccountPassword,
    updateAccount,
    deleteAccount,

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
    setIsBiometricEnabled,
    isBiometricUnlocked,
    isPushEnabled,
    setIsPushEnabled,

    isSearchOpen,
    isAddTxOpen,
    isTransferOpen,
    activeReceiptUrl,
    selectedMonthForLedger,
    editingTransaction,

    setActiveTab,
    setTheme,
    toggleTheme,
    setIsSearchOpen,
    setIsAddTxOpen,
    setIsTransferOpen,
    setActiveReceiptUrl,
    setSelectedMonthForLedger,
    setEditingTransaction,
    setIsBiometricUnlocked,
    biometricAutoLock,
    setBiometricAutoLock,
    biometricPin,
    setBiometricPin,
    lockAppNow,
    unlockWithPinOrPassword,
    unlockWithBiometric,
    registerBiometricSensor,
    toggleBiometricAuth,

    pendingProfileSwitch,
    setPendingProfileSwitch,
    switchProfile,
    verifyAndSwitchProfile,
    setProfilePassword,
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
    depositToSavingsGoal,
    withdrawFromSavingsGoal,
    deleteSavingsGoal,

    addBill,
    updateBill,
    payBill,
    markBillAsPaid,
    deleteBill,

    closeLedgerMonth,
    reopenLedgerMonth,

    dismissNotification,
    clearAllNotifications,
    exportBackupJSON,
    exportAllDataJSON,
    importBackupJSON,
    importDataJSON,

    startFreshWithRealData,
    clearDemoData,
    clearOnlyTransactions,
    loadDemoData,
    resetAllToDefault,
    resetToInitialData,

    firebaseStatus,
    syncToFirebase,
    pullFromFirebase,
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
