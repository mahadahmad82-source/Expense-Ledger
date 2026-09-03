import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useExpense } from '../context/ExpenseContext';
import {
  Fingerprint,
  Lock,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  LogOut,
  Delete,
  CheckCircle2,
  HelpCircle,
  Unlock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { checkBiometricSupport, BiometricAvailability } from '../lib/biometrics';

export const BiometricLockOverlay: React.FC = () => {
  const {
    isBiometricEnabled,
    isBiometricUnlocked,
    setIsBiometricUnlocked,
    activeProfile,
    currentAccount,
    unlockWithBiometric,
    unlockWithPinOrPassword,
    disableAndResetBiometrics,
    logout,
  } = useExpense();

  const [isVerifying, setIsVerifying] = useState(false);
  const [pin, setPin] = useState('');
  const [usePinMode, setUsePinMode] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [bioSupport, setBioSupport] = useState<BiometricAvailability | null>(null);
  const [showEmergencyReset, setShowEmergencyReset] = useState(false);

  // Check biometric support on mount
  useEffect(() => {
    let mounted = true;
    checkBiometricSupport().then((info) => {
      if (mounted) setBioSupport(info);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleBiometricAuth = useCallback(async () => {
    if (isVerifying) return;
    setIsVerifying(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await unlockWithBiometric();
      if (res.success) {
        setSuccessMsg('Identity verified! Opening...');
        setTimeout(() => {
          setIsBiometricUnlocked(true);
        }, 300);
      } else {
        setErrorMsg(res.message);
        setUsePinMode(true);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Biometric scan unavailable. Enter PIN.');
      setUsePinMode(true);
    } finally {
      setIsVerifying(false);
    }
  }, [isVerifying, unlockWithBiometric, setIsBiometricUnlocked]);

  // Auto-trigger biometric verification once when overlay displays
  const autoTriggeredRef = useRef(false);
  useEffect(() => {
    if (isBiometricEnabled && !isBiometricUnlocked && !autoTriggeredRef.current && !usePinMode) {
      autoTriggeredRef.current = true;
      const timer = setTimeout(() => {
        handleBiometricAuth();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isBiometricEnabled, isBiometricUnlocked, usePinMode, handleBiometricAuth]);

  // Auto-verify PIN when 4 or more digits are entered
  const submitPin = useCallback(
    (codeToTest: string) => {
      if (!codeToTest.trim()) return;
      const res = unlockWithPinOrPassword(codeToTest);
      if (res.success) {
        setSuccessMsg('Unlocked successfully! Opening...');
        setTimeout(() => {
          setIsBiometricUnlocked(true);
        }, 250);
      } else {
        setErrorMsg(res.message);
        setTimeout(() => {
          setPin('');
        }, 600);
      }
    },
    [unlockWithPinOrPassword, setIsBiometricUnlocked]
  );

  useEffect(() => {
    if (pin.length >= 4) {
      submitPin(pin);
    }
  }, [pin, submitPin]);

  const handleKeypadPress = (val: string) => {
    setErrorMsg('');
    if (val === 'backspace') {
      setPin((prev) => prev.slice(0, -1));
    } else if (val === 'clear') {
      setPin('');
    } else if (pin.length < 6) {
      setPin((prev) => prev + val);
    }
  };

  const handleEmergencyReset = () => {
    disableAndResetBiometrics();
    setShowEmergencyReset(false);
  };

  if (!isBiometricEnabled || isBiometricUnlocked) return null;

  return (
    <div
      id="biometric-lock-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 selection:bg-purple-500/30"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-600/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-slate-900/90 border border-purple-500/30 p-6 sm:p-7 text-center shadow-2xl shadow-purple-950/50 backdrop-blur-3xl animate-in zoom-in-95 duration-200">
        
        {/* Profile Avatar & Lock Status */}
        <div className="relative mx-auto mb-3 h-20 w-20">
          <img
            src={activeProfile.avatar}
            alt={activeProfile.name}
            className="h-full w-full rounded-full object-cover ring-4 ring-purple-500/40 shadow-xl"
          />
          <div className="absolute -bottom-1 -right-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 p-1.5 text-white shadow-lg ring-2 ring-slate-900">
            <Lock className="h-4 w-4" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight">ExpensePK Locked</h3>
        <p className="text-xs text-purple-300 font-medium mt-0.5">
          {activeProfile.name} {currentAccount ? `(@${currentAccount.username})` : ''}
        </p>

        {/* Success / Error Messages */}
        {successMsg && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/15 py-2 px-3 rounded-2xl border border-emerald-500/30 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && !successMsg && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-300 bg-rose-500/15 py-2 px-3 rounded-2xl border border-rose-500/30 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!usePinMode ? (
          /* Biometric Scanner View */
          <div className="mt-5 space-y-5">
            <div className="relative flex items-center justify-center">
              {/* Radar pulse rings */}
              {isVerifying && (
                <>
                  <div className="absolute h-32 w-32 rounded-full border-2 border-purple-500/40 animate-ping opacity-50" />
                  <div className="absolute h-28 w-28 rounded-full border border-cyan-400/40 animate-pulse" />
                </>
              )}

              <button
                id="biometric-scan-button"
                onClick={handleBiometricAuth}
                disabled={isVerifying}
                className="group relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-purple-600/30 via-indigo-600/30 to-cyan-500/20 border-2 border-purple-500/50 p-4 shadow-xl shadow-purple-900/40 hover:scale-105 active:scale-95 transition-all focus:outline-none"
                title="Tap to scan biometric"
              >
                <Fingerprint
                  className={`h-12 w-12 text-purple-400 group-hover:text-cyan-300 transition-colors ${
                    isVerifying ? 'animate-pulse text-cyan-400 scale-110' : ''
                  }`}
                />
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-200">
                {isVerifying ? 'Scanning Fingerprint / Face ID...' : 'Touch Fingerprint / Face ID'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {bioSupport?.hasPlatformSensor
                  ? bioSupport.statusText
                  : 'Tap the sensor button above to unlock'}
              </p>
            </div>

            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <button
                type="button"
                id="use-pin-btn"
                onClick={() => {
                  setErrorMsg('');
                  setUsePinMode(true);
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 py-2 px-3.5 text-xs font-semibold text-purple-300 transition-colors"
              >
                <KeyRound className="h-4 w-4" />
                <span>Unlock with 4-Digit PIN / Password</span>
              </button>
            </div>
          </div>
        ) : (
          /* 4-Digit PIN / Passcode View */
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Enter 4-Digit Security PIN
              </label>

              {/* PIN Dot visualizer */}
              <div className="flex justify-center items-center gap-3 py-1.5">
                {[0, 1, 2, 3].map((idx) => {
                  const filled = pin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`h-4 w-4 rounded-full transition-all duration-200 ${
                        filled
                          ? 'bg-purple-400 scale-110 shadow-lg shadow-purple-500/50'
                          : 'border-2 border-white/30 bg-white/5'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Physical keyboard hidden/text input */}
              <div className="relative max-w-[160px] mx-auto mt-1">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    setPin(clean);
                  }}
                  placeholder="PIN"
                  className="w-full text-center font-mono font-bold tracking-widest text-xs bg-white/5 border border-white/10 rounded-xl px-2 py-1 text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPin ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
              </div>
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-1.5 max-w-[230px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  className="h-10 rounded-2xl bg-white/5 hover:bg-purple-600/20 active:bg-purple-600/40 border border-white/10 text-base font-bold text-white transition-all active:scale-95 flex items-center justify-center font-mono"
                >
                  {digit}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handleKeypadPress('clear')}
                className="h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-slate-400 transition-all flex items-center justify-center"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="h-10 rounded-2xl bg-white/5 hover:bg-purple-600/20 active:bg-purple-600/40 border border-white/10 text-base font-bold text-white transition-all active:scale-95 flex items-center justify-center font-mono"
              >
                0
              </button>

              <button
                type="button"
                onClick={() => handleKeypadPress('backspace')}
                className="h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all flex items-center justify-center active:scale-95"
                title="Backspace"
              >
                <Delete className="h-4 w-4" />
              </button>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setUsePinMode(false);
                }}
                className="text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-1"
              >
                <Fingerprint className="h-3.5 w-3.5 text-purple-400" />
                <span>Use Biometrics</span>
              </button>

              <button
                type="button"
                onClick={() => submitPin(pin || '1234')}
                className="text-[11px] font-bold text-purple-400 hover:text-purple-300"
              >
                Unlock
              </button>
            </div>
          </div>
        )}

        {/* Emergency Bypass / Reset Section */}
        <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
          {!showEmergencyReset ? (
            <button
              type="button"
              onClick={() => setShowEmergencyReset(true)}
              className="text-[11px] font-medium text-purple-400 hover:text-purple-300 underline underline-offset-2 flex items-center justify-center gap-1 mx-auto"
            >
              <HelpCircle className="h-3 w-3" />
              <span>Forgot PIN or Stuck? Emergency Unlock</span>
            </button>
          ) : (
            <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-2xl text-left space-y-2 animate-in fade-in">
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Clicking below will immediately unlock ExpensePK and remove the lock protection so you can reconfigure it properly.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="emergency-unlock-and-reset-btn"
                  onClick={handleEmergencyReset}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-md shadow-purple-600/30 transition-all active:scale-95"
                >
                  <Unlock className="h-3.5 w-3.5" />
                  <span>Unlock & Reset Lock</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmergencyReset(false)}
                  className="py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-[11px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Switch Account / Logout */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Do you want to sign out to the login screen?')) {
                logout();
              }
            }}
            className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-rose-400 transition-colors mx-auto pt-1"
          >
            <LogOut className="h-3 w-3" />
            <span>Switch Account / Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
