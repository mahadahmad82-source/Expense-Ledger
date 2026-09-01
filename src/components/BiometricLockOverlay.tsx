import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Fingerprint, Lock, ShieldCheck, KeyRound } from 'lucide-react';

export const BiometricLockOverlay: React.FC = () => {
  const { isBiometricEnabled, isBiometricUnlocked, setIsBiometricUnlocked, activeProfile } = useExpense();
  const [isVerifying, setIsVerifying] = useState(false);
  const [pin, setPin] = useState('');
  const [usePinMode, setUsePinMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isBiometricEnabled || isBiometricUnlocked) return null;

  const handleBiometricAuth = async () => {
    setIsVerifying(true);
    setErrorMsg('');

    // Check if WebAuthn / PublicKeyCredential is supported
    if (window.PublicKeyCredential) {
      try {
        // Simulate or invoke WebAuthn challenge
        await new Promise(res => setTimeout(res, 800));
        setIsBiometricUnlocked(true);
        return;
      } catch (err) {
        console.warn('WebAuthn prompt error', err);
      }
    }

    // Fallback simulation
    setTimeout(() => {
      setIsVerifying(false);
      setIsBiometricUnlocked(true);
    }, 700);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length >= 4) {
      setIsBiometricUnlocked(true);
    } else {
      setErrorMsg('Please enter a 4-digit security PIN (default: any 4 digits)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-3xl p-4">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-purple-500/30 p-8 text-center shadow-2xl animate-in zoom-in-95">
        
        {/* Profile Avatar */}
        <div className="relative mx-auto mb-4 h-20 w-20">
          <img
            src={activeProfile.avatar}
            alt={activeProfile.name}
            className="h-full w-full rounded-full object-cover ring-4 ring-purple-500/50 shadow-xl"
          />
          <div className="absolute -bottom-1 -right-1 rounded-full bg-purple-600 p-1.5 text-white shadow-md">
            <Lock className="h-4 w-4" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-0.5">Welcome Back</h3>
        <p className="text-xs text-purple-300 font-medium mb-6">{activeProfile.name}</p>

        {errorMsg && (
          <p className="mb-4 text-xs font-semibold text-rose-400 bg-rose-500/10 py-1.5 px-3 rounded-xl border border-rose-500/20">
            {errorMsg}
          </p>
        )}

        {!usePinMode ? (
          <div className="space-y-6">
            <button
              id="biometric-scan-btn"
              onClick={handleBiometricAuth}
              disabled={isVerifying}
              className="group mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600/30 via-indigo-600/30 to-cyan-500/30 border-2 border-purple-500/50 p-4 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Fingerprint className={`h-12 w-12 text-purple-400 group-hover:text-cyan-300 transition-colors ${isVerifying ? 'animate-pulse text-cyan-400' : ''}`} />
            </button>

            <p className="text-xs text-slate-400">
              {isVerifying ? 'Scanning Fingerprint / Face ID...' : 'Touch fingerprint sensor or click to unlock'}
            </p>

            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setUsePinMode(true)}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                Unlock using PIN passcode instead
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-2">Enter 4-digit PIN</label>
              <input
                type="password"
                maxLength={6}
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full text-center tracking-widest text-2xl font-bold rounded-2xl bg-white/5 border border-white/20 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUsePinMode(false)}
                className="flex-1 rounded-2xl bg-white/10 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/15"
              >
                Back to Biometrics
              </button>
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-500 shadow-lg shadow-purple-600/30"
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
