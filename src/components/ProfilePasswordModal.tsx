import React, { useState, useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Lock, X, AlertCircle, ShieldCheck, Delete, KeyRound, Eye, EyeOff } from 'lucide-react';

export const ProfilePasswordModal: React.FC = () => {
  const { pendingProfileSwitch, setPendingProfileSwitch, verifyAndSwitchProfile } = useExpense();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [useTextMode, setUseTextMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setPin('');
    setError(null);
    setUseTextMode(false);
    setShowPassword(false);
  }, [pendingProfileSwitch]);

  if (!pendingProfileSwitch) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(null);
      if (newPin.length === 4) {
        // Auto submit
        setTimeout(() => {
          attemptUnlock(newPin);
        }, 100);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  const attemptUnlock = (enteredCode: string) => {
    if (!enteredCode.trim()) {
      setError('Please enter the 4-digit PIN or password.');
      return;
    }

    const res = verifyAndSwitchProfile(pendingProfileSwitch.id, enteredCode);
    if (!res.success) {
      setError(res.message);
      setPin('');
    } else {
      setPin('');
      setError(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    attemptUnlock(pin);
  };

  const handleClose = () => {
    setPin('');
    setError(null);
    setPendingProfileSwitch(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#0e0720] border border-slate-200 dark:border-white/10 p-6 shadow-2xl backdrop-blur-2xl text-slate-900 dark:text-white animate-in zoom-in-95">
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Icon */}
        <div className="text-center mb-4 pt-1">
          <div className="inline-flex items-center justify-center h-13 w-13 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 mb-2">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Enter 4-Digit Profile PIN
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            This profile is protected with a security code
          </p>
        </div>

        {/* Profile preview banner */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/30 mb-4">
          <img
            src={pendingProfileSwitch.avatar}
            alt={pendingProfileSwitch.name}
            className="h-10 w-10 rounded-xl object-cover ring-2 ring-purple-500/40 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {pendingProfileSwitch.name}
            </h4>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 dark:text-purple-300">
              <ShieldCheck className="h-3 w-3" />
              <span>Protected Profile</span>
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 mb-3 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {!useTextMode ? (
          <div>
            {/* 4-Digit PIN Visual Circles / Boxes */}
            <div className="flex justify-center items-center gap-3.5 my-4">
              {[0, 1, 2, 3].map((index) => {
                const isFilled = pin.length > index;
                return (
                  <div
                    key={index}
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-mono font-bold transition-all border ${
                      isFilled
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30 scale-105'
                        : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'
                    }`}
                  >
                    {isFilled ? '•' : ''}
                  </div>
                );
              })}
            </div>

            {/* Hidden Input for physical keyboard typing */}
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPin(clean);
                if (clean.length === 4) {
                  attemptUnlock(clean);
                }
              }}
              autoFocus
              className="sr-only"
            />

            {/* Numeric Keypad for Mobile & Touch */}
            <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto mb-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeyPress(digit)}
                  className="h-12 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-slate-200 dark:border-white/10 text-base font-bold text-slate-800 dark:text-white active:scale-95 transition-all flex items-center justify-center font-mono"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-12 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-500 dark:text-slate-400 active:scale-95 transition-all flex items-center justify-center"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="h-12 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-slate-200 dark:border-white/10 text-base font-bold text-slate-800 dark:text-white active:scale-95 transition-all flex items-center justify-center font-mono"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 active:scale-95 transition-all flex items-center justify-center"
              >
                <Delete className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setUseTextMode(true)}
                className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline"
              >
                Use alphanumeric password
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Profile Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="profile-unlock-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter profile password"
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
                onClick={() => setUseTextMode(false)}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-semibold transition-colors"
              >
                Use 4-Digit PIN
              </button>
              <button
                id="submit-profile-unlock-btn"
                type="submit"
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
              >
                Unlock
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
