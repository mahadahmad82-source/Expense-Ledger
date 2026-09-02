import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  UserPlus,
  KeyRound,
  AlertCircle,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { accounts, login, registerAccount } = useExpense();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state - completely clean and secure
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regProfileName, setRegProfileName] = useState('Personal');
  const [regProfilePin, setRegProfilePin] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your username or email address.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }
    const res = login(loginIdentifier.trim(), loginPassword);
    if (!res.success) {
      setLoginError(res.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const cleanUsername = regUsername.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');

    if (!regName.trim()) {
      setRegError('Please enter your full name.');
      return;
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      setRegError('Username must be at least 3 characters long (letters, numbers, underscores).');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Please enter a valid email address.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setRegError('Password must be at least 4 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please re-enter.');
      return;
    }
    if (regProfilePin && !/^\d{4}$/.test(regProfilePin.trim())) {
      setRegError('Profile PIN must be exactly 4 digits (e.g. 1234), or left empty.');
      return;
    }

    const res = registerAccount(
      regName.trim(),
      cleanUsername,
      regEmail.trim(),
      regPassword,
      regProfileName.trim() || 'Personal',
      regProfilePin.trim() || undefined
    );
    if (!res.success) {
      setRegError(res.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-[#0a0514] dark:text-white flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden font-sans selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* Background ambient light orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-150px] left-[-100px] w-[500px] h-[500px] bg-purple-500/15 dark:bg-purple-600/25 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-150px] right-[-50px] w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        
        {/* App Branding Header */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center h-20 w-20 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/40 ring-2 ring-purple-500/30 mb-3 group hover:scale-105 transition-transform bg-slate-900">
            <img
              src="/app-icon.png"
              alt="ExpensePK Logo"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-display">
            Expense<span className="text-purple-600 dark:text-purple-400">PK</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Personal & Multi-Profile Financial Tracker in Pakistani Rupees (PKR)
          </p>
        </div>

        {/* Main Card Container */}
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-2xl backdrop-blur-2xl">
          
          {/* Tab Selector: Login vs Register */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 mb-6">
            <button
              id="login-tab-btn"
              type="button"
              onClick={() => {
                setActiveTab('login');
                setLoginError(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'login'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              id="register-tab-btn"
              type="button"
              onClick={() => {
                setActiveTab('register');
                setRegError(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'register'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              
              {/* Optional Quick Account Selector (Only fills username/email, password remains private) */}
              {accounts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5 px-0.5">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Accounts on this device
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {accounts.map(acc => (
                      <div
                        key={acc.id}
                        onClick={() => {
                          setLoginIdentifier(acc.username || acc.email);
                          setLoginPassword('');
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          loginIdentifier.toLowerCase() === (acc.username || '').toLowerCase() ||
                          loginIdentifier.toLowerCase() === acc.email.toLowerCase()
                            ? 'bg-purple-50 dark:bg-purple-600/20 border-purple-500 text-purple-700 dark:text-white font-semibold'
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img src={acc.avatar} alt={acc.name} className="h-6 w-6 rounded-lg object-cover" />
                          <div className="truncate text-left">
                            <span className="truncate font-semibold">{acc.name}</span>
                            {acc.username && (
                              <span className="text-[10px] text-purple-600 dark:text-purple-300 block font-mono">@{acc.username}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400">Select</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5 pt-1">
                {loginError && (
                  <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="login-identifier-input"
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Enter username or email"
                      className="w-full rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="login-password-input"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="w-full rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="submit-login-btn"
                  type="submit"
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] py-3 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all"
                >
                  <Lock className="h-4 w-4" />
                  <span>Log In to Account</span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setRegError(null);
                    }}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
                  >
                    Don't have an account? Create one now
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: CREATE NEW ACCOUNT (REGISTER) */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                <span className="font-bold text-purple-700 dark:text-purple-300">Dedicated Account Sandbox:</span> Your data is completely separate and private. You can create multiple profiles with custom 4-digit PIN locks inside your account.
              </div>

              {regError && (
                <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>{regError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="reg-name-input"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Ali Khan"
                    className="w-full rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">@</span>
                  <input
                    id="reg-username-input"
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. alikhan22"
                    className="w-full rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 pl-8 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Unique handle for logging in</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="reg-email-input"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. alikhan@example.com"
                    className="w-full rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password-input"
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 4 chars"
                      className="w-full rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="reg-confirm-password-input"
                      type={showRegPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Starter Profile Options */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    First Profile Name
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="reg-profile-name-input"
                      type="text"
                      value={regProfileName}
                      onChange={(e) => setRegProfileName(e.target.value)}
                      placeholder="Personal"
                      className="w-full rounded-2xl bg-white dark:bg-[#0a0514] border border-slate-200 dark:border-white/10 pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>4-Digit Profile PIN (Optional)</span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-normal">Lock profile with 4-digit code</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="reg-profile-pin-input"
                      type="password"
                      maxLength={4}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={regProfilePin}
                      onChange={(e) => setRegProfilePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="e.g. 1234 (optional)"
                      className="w-full rounded-2xl bg-white dark:bg-[#0a0514] border border-slate-200 dark:border-white/10 pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono tracking-widest"
                    />
                  </div>
                </div>
              </div>

              <button
                id="submit-register-btn"
                type="submit"
                className="w-full mt-3 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create Account & Start</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setLoginError(null);
                  }}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Security / Privacy Footer */}
        <div className="text-center mt-5 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 inline" />
            <span>Encrypted local storage with separate multi-user database sandboxes</span>
          </p>
        </div>

      </div>
    </div>
  );
};
