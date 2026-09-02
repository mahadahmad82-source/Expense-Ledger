/**
 * Types and interfaces for Smart Expense Tracker PWA (PKR)
 */

export type TransactionType = 'expense' | 'income' | 'transfer';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';
export type WalletType = 'cash' | 'bank' | 'easypaisa' | 'jazzcash' | 'credit_card' | 'savings' | 'crypto' | 'custom';
export type BudgetType = 'overall' | 'category' | 'wallet';
export type ThemeMode = 'dark' | 'light' | 'system';

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  avatar?: string;
  is_owner?: boolean;
  phone?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  account_id?: string;
  name: string;
  avatar: string;
  email?: string;
  password?: string;
  pin?: string;
  is_default?: boolean;
  created_at: string;
}

export interface Wallet {
  id: string;
  profile_id: string;
  name: string;
  type: WalletType;
  balance: number;
  initial_balance: number;
  color: string;
  icon: string;
  account_number?: string;
  created_at: string;
}

export interface Category {
  id: string;
  profile_id?: string; // null for system defaults or specific to profile
  name: string;
  type: 'expense' | 'income';
  color: string;
  icon: string;
  is_custom?: boolean;
}

export interface Transaction {
  id: string;
  profile_id: string;
  wallet_id: string;
  category_id: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO date string YYYY-MM-DD
  note?: string;
  receipt_url?: string;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  to_wallet_id?: string; // For transfers
  created_at: string;
}

export interface Budget {
  id: string;
  profile_id: string;
  type: BudgetType;
  target_id?: string; // category_id or wallet_id if type != overall
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  start_date: string;
  alert_threshold: number; // e.g. 80 (80%)
}

export interface SavingsGoal {
  id: string;
  profile_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  icon: string;
  color: string;
  auto_save_percentage: number; // e.g. 10 for 10%
  completed_at?: string;
  notes?: string;
}

export interface Bill {
  id: string;
  profile_id: string;
  title: string;
  amount: number;
  category_id: string;
  due_date: string;
  is_recurring: boolean;
  recurrence_pattern: 'monthly' | 'quarterly' | 'yearly' | 'none';
  is_paid: boolean;
  paid_date?: string;
  wallet_id?: string;
  created_at: string;
}

export interface LedgerMonth {
  id: string;
  profile_id: string;
  month: number; // 1-12
  year: number;
  month_name: string;
  total_income: number;
  total_expense: number;
  net_savings: number;
  is_closed: boolean;
  closed_at?: string;
}

export interface SmartTip {
  id: string;
  type: 'alert' | 'savings' | 'insight' | 'pkr_tip';
  title: string;
  description: string;
  impact_pkr?: number;
  category?: string;
  action_label?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'bill_due' | 'budget_alert' | 'goal_reached' | 'system';
  date: string;
  is_read: boolean;
  link_tab?: string;
}

export type ActiveTab = 
  | 'dashboard' 
  | 'transactions' 
  | 'ledgers' 
  | 'budgets' 
  | 'savings' 
  | 'bills' 
  | 'analytics' 
  | 'planning' 
  | 'tips' 
  | 'settings';
