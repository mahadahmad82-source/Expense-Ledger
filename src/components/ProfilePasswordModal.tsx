import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Lock, KeyRound, Eye, EyeOff, X, AlertCircle, ShieldCheck } from 'lucide-react';

export const ProfilePasswordModal: React.FC = () => {
  const { pendingProfileSwitch, setPendingProfileSwitch, verifyAndSwitchProfile } = useExpense();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!pendingProfileSwitch) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password.trim()) {
      setError('Please enter the profile password.');
      return;
    }

    const res = verifyAndSwitchProfile(pendingProfileSwitch.id, password);
    if (!res.success) {
      setError(res.message);
    } else {
      setPassword('');
      setError(null);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError(null);
    setPendingProfileSwitch(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#0e0720] border border-slate-200 dark:border-white/10 p-6 shadow-2xl backdrop-blur-2xl text-slate-900 dark:text-white animate-in zoom-in-95">
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Lock Icon & Header */}
        <div className="text-center mb-5 pt-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 mb-3">
            <Lock className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Unlock Profile
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            This profile is protected with a password
          </p>
        </div>

        {/* Profile Card Preview */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/30 mb-4">
          <img
            src={pendingProfileSwitch.avatar}
            alt={pendingProfileSwitch.name}
            className="h-11 w-11 rounded-xl object-cover ring-2 ring-purple-500/40 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {pendingProfileSwitch.name}
            </h4>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 dark:text-purple-300">
              <ShieldCheck className="h-3 w-3" />
              <span>Password Protected</span>
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 mb-3.5 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Enter Profile Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="profile-unlock-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to unlock"
                autoFocus
                className="w-full rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-profile-unlock-btn"
              type="submit"
              className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
            >
              Unlock & Enter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
