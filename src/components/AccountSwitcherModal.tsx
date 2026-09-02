import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import {
  X,
  User,
  Users,
  Check,
  Plus,
  LogOut,
  ShieldCheck,
  ArrowRight,
  Mail,
  KeyRound,
  Trash2,
  Lock
} from 'lucide-react';
import { UserAccount } from '../types';
import { ChangeAccountPasswordModal } from './ChangeAccountPasswordModal';

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({ isOpen, onClose }) => {
  const {
    accounts,
    currentAccount,
    switchAccount,
    logout,
    registerAccount,
    deleteAccount,
  } = useExpense();

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileName, setProfileName] = useState('Personal Account');
  const [profilePassword, setProfilePassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [accountToChangePassword, setAccountToChangePassword] = useState<UserAccount | null>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) {
      setError('Please provide both name and email.');
      return;
    }
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '') || name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const res = registerAccount(
      name.trim(),
      cleanUsername,
      email.trim(),
      password,
      profileName.trim() || 'Personal Account',
      profilePassword.trim() || undefined
    );
    if (res.success) {
      setIsCreating(false);
      setName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setProfilePassword('');
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0e0720] border border-slate-200 dark:border-white/10 p-6 shadow-2xl backdrop-blur-2xl text-slate-900 dark:text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Account Management & Switching
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch accounts or add a new independent account
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isCreating ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Select an account to switch to. Each account maintains its own separate profiles, wallets, categories, and transactions:
            </p>

            {/* List of Accounts */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {accounts.map((acc) => {
                const isActive = currentAccount?.id === acc.id;

                return (
                  <div
                    key={acc.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-purple-50 dark:bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/30 shadow-md'
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div
                      onClick={() => {
                        if (!isActive) {
                          switchAccount(acc.id);
                          onClose();
                        }
                      }}
                      className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                    >
                      <img
                        src={acc.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={acc.name}
                        className="h-10 w-10 rounded-xl object-cover ring-1 ring-purple-400/30 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {acc.name}
                          </p>
                          {acc.is_owner && (
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                              Owner Account
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {acc.username ? `@${acc.username}` : acc.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAccountToChangePassword(acc);
                        }}
                        title={`Change password for ${acc.name}`}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>

                      {isActive ? (
                        <span className="flex items-center gap-1 rounded-xl bg-purple-600 text-white px-2.5 py-1 text-[11px] font-bold">
                          <Check className="h-3.5 w-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            switchAccount(acc.id);
                            onClose();
                          }}
                          className="flex items-center gap-1 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-purple-600 hover:text-white px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          <span>Switch</span>
                        </button>
                      )}

                      {!acc.is_owner && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete account ${acc.name}? All its data will be removed.`)) {
                              deleteAccount(acc.id);
                            }
                          }}
                          title="Delete secondary account"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions: Add New Account or Log Out */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-2xl bg-purple-600/15 hover:bg-purple-600/25 text-purple-700 dark:text-purple-300 border border-purple-500/30 px-4 py-2.5 text-xs font-bold transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Account</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/25 px-4 py-2.5 text-xs font-bold transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out of Account</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-3.5">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Create New Independent Account
            </h4>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-300 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hassan Raza"
                className="w-full rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Username (for Login)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-500">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                  placeholder="e.g. hassan_pk"
                  className="w-full rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 pl-7 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. hassan@example.com"
                className="w-full rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Account password"
                className="w-full rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                required
              />
            </div>

            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/20 space-y-2.5">
              <div>
                <label className="block text-xs font-semibold text-purple-900 dark:text-purple-200 mb-1">
                  Initial Profile Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Personal Account"
                  className="w-full rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-500/30 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-900 dark:text-purple-200 mb-1">
                  Profile Password (Optional)
                </label>
                <input
                  type="password"
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                  placeholder="Leave empty if no lock needed"
                  className="w-full rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-500/30 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-2xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Back to Accounts
              </button>
              <button
                type="submit"
                className="rounded-2xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/30"
              >
                Create & Switch
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Change Password Modal */}
      <ChangeAccountPasswordModal
        isOpen={!!accountToChangePassword}
        onClose={() => setAccountToChangePassword(null)}
        account={accountToChangePassword}
      />
    </div>
  );
};
