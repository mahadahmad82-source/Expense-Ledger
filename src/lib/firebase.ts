import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  getDocs,
  Unsubscribe 
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import type { UserAccount, UserProfile, Wallet, Category, Transaction, Budget, SavingsGoal, Bill, LedgerMonth } from '../types';
import rawConfig from '../../firebase-applet-config.json';

export interface FirebaseAccountFinancialData {
  profiles: UserProfile[];
  activeProfileId: string;
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  bills: Bill[];
  ledgers: LedgerMonth[];
  updatedAt?: string;
  deviceId?: string;
}

export interface FirebaseSyncStatus {
  isConfigured: boolean;
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
  projectId: string;
  databaseId: string;
}

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (firebaseApp) return firebaseApp;
  try {
    if (rawConfig && rawConfig.projectId && rawConfig.apiKey) {
      if (getApps().length > 0) {
        firebaseApp = getApp();
      } else {
        firebaseApp = initializeApp(rawConfig);
      }
      return firebaseApp;
    }
  } catch (err) {
    console.error('Error initializing Firebase App:', err);
  }
  return null;
}

export function getFirebaseFirestore(): Firestore | null {
  if (firestoreDb) return firestoreDb;
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    const dbId = rawConfig.firestoreDatabaseId || '(default)';
    firestoreDb = getFirestore(app, dbId);
    return firestoreDb;
  } catch (err) {
    console.error('Error getting Firestore instance:', err);
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  if (firebaseAuth) return firebaseAuth;
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    firebaseAuth = getAuth(app);
    return firebaseAuth;
  } catch (err) {
    console.error('Error getting Firebase Auth:', err);
    return null;
  }
}

export function isFirebaseConfigured(): boolean {
  return Boolean(rawConfig && rawConfig.projectId && rawConfig.apiKey);
}

export function getFirebaseMetadata() {
  return {
    projectId: rawConfig.projectId || '',
    databaseId: rawConfig.firestoreDatabaseId || '(default)',
    appId: rawConfig.appId || '',
  };
}

/**
 * Recursively remove all `undefined` values from an object/array so Firestore setDoc never fails
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined || data === null) {
    return (data === undefined ? null : data) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    if (data instanceof Date) {
      return data.toISOString() as unknown as T;
    }
    const cleanObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleanObj[key] = sanitizeForFirestore(value);
      }
    }
    return cleanObj as T;
  }
  return data;
}

/**
 * Save / Push account financial data to Firebase Firestore
 */
export async function pushAccountDataToFirebase(
  accountId: string,
  data: FirebaseAccountFinancialData
): Promise<{ success: boolean; error?: string }> {
  const db = getFirebaseFirestore();
  if (!db) {
    return { success: false, error: 'Firebase Firestore is not initialized.' };
  }

  try {
    const cleanAccountId = accountId || 'acc-mahad';
    const docRef = doc(db, 'accountData', cleanAccountId);
    
    // Sanitize any undefined values before sending to Firestore
    const rawPayload = {
      accountId: cleanAccountId,
      updatedAt: new Date().toISOString(),
      profiles: data.profiles || [],
      activeProfileId: data.activeProfileId || '',
      wallets: data.wallets || [],
      categories: data.categories || [],
      transactions: data.transactions || [],
      budgets: data.budgets || [],
      savingsGoals: data.savingsGoals || [],
      bills: data.bills || [],
      ledgers: data.ledgers || [],
    };

    // Deep clean all undefined fields recursively and safely
    const payload = JSON.parse(JSON.stringify(sanitizeForFirestore(rawPayload)));

    await setDoc(docRef, payload, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.error('Failed to push data to Firebase:', err);
    return { success: false, error: err?.message || 'Error pushing to Firestore' };
  }
}

/**
 * Fetch / Pull account financial data from Firebase Firestore
 */
export async function pullAccountDataFromFirebase(
  accountId: string
): Promise<{ success: boolean; data?: FirebaseAccountFinancialData; error?: string }> {
  const db = getFirebaseFirestore();
  if (!db) {
    return { success: false, error: 'Firebase Firestore is not initialized.' };
  }

  try {
    const cleanAccountId = accountId || 'acc-mahad';
    const docRef = doc(db, 'accountData', cleanAccountId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const raw = snap.data() as any;
      const parsed: FirebaseAccountFinancialData = {
        profiles: raw.profiles || [],
        activeProfileId: raw.activeProfileId || '',
        wallets: raw.wallets || [],
        categories: raw.categories || [],
        transactions: raw.transactions || [],
        budgets: raw.budgets || [],
        savingsGoals: raw.savingsGoals || [],
        bills: raw.bills || [],
        ledgers: raw.ledgers || [],
        updatedAt: raw.updatedAt,
      };
      return { success: true, data: parsed };
    } else {
      return { success: false, error: 'No data document found in Firebase yet.' };
    }
  } catch (err: any) {
    console.error('Failed to pull data from Firebase:', err);
    return { success: false, error: err?.message || 'Error pulling from Firestore' };
  }
}

/**
 * Subscribe to real-time changes on an account's data in Firestore
 */
export function subscribeToFirebaseAccountData(
  accountId: string,
  onUpdate: (data: FirebaseAccountFinancialData) => void,
  onError?: (err: Error) => void
): Unsubscribe | null {
  const db = getFirebaseFirestore();
  if (!db) return null;

  try {
    const cleanAccountId = accountId || 'acc-mahad';
    const docRef = doc(db, 'accountData', cleanAccountId);

    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const raw = docSnap.data() as any;
          const parsed: FirebaseAccountFinancialData = {
            profiles: raw.profiles || [],
            activeProfileId: raw.activeProfileId || '',
            wallets: raw.wallets || [],
            categories: raw.categories || [],
            transactions: raw.transactions || [],
            budgets: raw.budgets || [],
            savingsGoals: raw.savingsGoals || [],
            bills: raw.bills || [],
            ledgers: raw.ledgers || [],
            updatedAt: raw.updatedAt,
          };
          onUpdate(parsed);
        }
      },
      (error) => {
        console.warn('Firebase onSnapshot error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn('Error setting up Firebase snapshot listener:', err);
    return null;
  }
}

/**
 * Push user account credentials / profile record to Firebase
 */
export async function pushUserAccountToFirebase(account: UserAccount): Promise<void> {
  const db = getFirebaseFirestore();
  if (!db || !account.id) return;

  try {
    const docRef = doc(db, 'accounts', account.id);
    const rawAccount = {
      ...account,
      syncedAt: new Date().toISOString()
    };
    const cleanAccount = JSON.parse(JSON.stringify(sanitizeForFirestore(rawAccount)));
    await setDoc(docRef, cleanAccount, { merge: true });
  } catch (err) {
    console.error('Failed to push user account to Firebase:', err);
  }
}

/**
 * Fetch all registered accounts from Firebase Firestore
 */
export async function fetchAccountsFromFirebase(): Promise<UserAccount[]> {
  const db = getFirebaseFirestore();
  if (!db) return [];

  try {
    const colRef = collection(db, 'accounts');
    const snap = await getDocs(colRef);
    const accounts: UserAccount[] = [];
    snap.forEach((d) => {
      const data = d.data() as UserAccount;
      if (data && data.id) {
        accounts.push(data);
      }
    });
    return accounts;
  } catch (err) {
    console.warn('Failed to fetch accounts from Firebase:', err);
    return [];
  }
}
