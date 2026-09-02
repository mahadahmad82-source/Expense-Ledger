import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  Sparkles,
  KeyRound,
  Check,
  AlertCircle,
  Users
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { accounts, login, registerAccount, theme } = useExpense();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('mahadahmad82');
  const [loginPassword, setLoginPassword] = useState('google.pk');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regProfileName, setRegProfileName] = useState('Personal Account');
  const [regProfilePassword, setRegProfilePassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Quick login handler
  const handleQuickLogin = (identifier: string, pass?: string) => {
    setLoginError(null);
    const res = login(identifier, pass || 'google.pk');
    if (!res.success) {
      setLoginError(res.message);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your username or email address.');
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

    const res = registerAccount(
      regName.trim(),
      cleanUsername,
      regEmail.trim(),
      regPassword,
      regProfileName.trim() || 'Personal Account',
      regProfilePassword.trim() || undefined
    );
    if (!res.success) {
      setRegError(res.message);
    }
  };

  // Find owner account if present
  const ownerAccount = accounts.find(a => a.is_owner || a.id === 'acc-mahad');

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-[#0a0514] dark:text-white flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden font-sans selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* Background ambient light orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-150px] left-[-100px] w-[500px] h-[500px] bg-purple-500/20 dark:bg-purple-600/30 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-150px] right-[-50px] w-[500px] h-[500px] bg-blue-500/15 dark:bg-blue-600/25 rounded-full blur-[140px]" />
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
            Smart Financial Ledger & Multi-Account System in PKR
          </p>
          <p className="text-[11px] text-purple-600 dark:text-purple-300 font-medium mt-0.5">
            Track your expenses, income, and budgets securely and effortlessly
          </p>
        </div>

        {/* Card Container */}
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
              Log In
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
            <div className="space-y-5">
              
              {/* Featured: Mahad Ahmad (Owner Account) 1-Click Fast Login */}
              {ownerAccount && (
                <div className="rounded-2xl bg-gradient-to-r from-purple-500/15 to-blue-500/15 border border-purple-500/30 p-3.5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                        Owner Account
                      </span>
                    </div>
                    <span className="rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 text-[9px] font-bold border border-purple-500/30">
                      Data Preserved
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={ownerAccount.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={ownerAccount.name}
                      className="h-11 w-11 rounded-xl object-cover ring-2 ring-purple-500/40 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {ownerAccount.name}
                        </h4>
                      </div>
                      <p className="text-[11px] font-mono text-purple-600 dark:text-purple-300 font-semibold truncate">
                        @{ownerAccount.username || 'mahadahmad82'}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {ownerAccount.email}
                      </p>
                    </div>
                    <button
                      id="owner-quick-login-btn"
                      type="button"
                      onClick={() => handleQuickLogin(ownerAccount.username || 'mahadahmad82', ownerAccount.password || 'google.pk')}
                      className="shrink-0 flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white px-3 py-2 text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
                    >
                      <span>Log In</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-purple-500/20 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>Credentials: <code className="font-mono text-purple-600 dark:text-purple-400 font-bold">mahadahmad82</code> / <code className="font-mono text-purple-600 dark:text-purple-400 font-bold">google.pk</code></span>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginIdentifier('mahadahmad82');
                        setLoginPassword('google.pk');
                      }}
                      className="text-purple-600 dark:text-purple-300 hover:underline font-semibold"
                    >
                      Fill Form
                    </button>
                  </div>
                </div>
              )}

              {/* Other saved accounts selector (if multiple exist) */}
              {accounts.length > 1 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5 px-0.5">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Saved Accounts on this Device ({accounts.length})
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {accounts.map(acc => (
                      <div
                        key={acc.id}
                        onClick={() => {
                          setLoginIdentifier(acc.username || acc.email);
                          if (acc.password) setLoginPassword(acc.password);
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
                          {acc.is_owner && (
                            <span className="text-[9px] bg-purple-500/20 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 rounded font-bold">
                              Owner
                            </span>
                          )}
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
                  <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
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
                      placeholder="Username (e.g. mahadahmad82) or email"
                      className="w-full rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Owner: google.pk
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="login-password-input"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password (e.g. google.pk)"
                      className="w-full rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      required
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
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-[0.98] py-3 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all"
                >
                  <Lock className="h-4 w-4" />
                  <span>Log In to Account</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: CREATE NEW ACCOUNT (REGISTER) */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                <span className="font-bold text-purple-700 dark:text-purple-300">Independent Account System:</span> Each account is fully isolated. Profiles are created inside accounts and can optionally be password protected.
              </div>

              {regError && (
                <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
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
                    placeholder="e.g. Ali Hassan"
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
                    placeholder="e.g. alihassan88"
                    className="w-full rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 pl-8 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Unique login handle (minimum 3 characters)</p>
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
                    placeholder="e.g. ali@example.com"
                    className="w-full rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Account Password
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

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Profile Name
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="reg-profile-name-input"
                      type="text"
                      value={regProfileName}
                      onChange={(e) => setRegProfileName(e.target.value)}
                      placeholder="Personal Account"
                      className="w-full rounded-2xl bg-white dark:bg-[#0a0514] border border-slate-200 dark:border-white/10 pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Profile Password (Optional)</span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-normal">Extra profile protection</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="reg-profile-password-input"
                      type={showProfilePassword ? 'text' : 'password'}
                      value={regProfilePassword}
                      onChange={(e) => setRegProfilePassword(e.target.value)}
                      placeholder="Leave blank for no password"
                      className="w-full rounded-2xl bg-white dark:bg-[#0a0514] border border-slate-200 dark:border-white/10 pl-10 pr-10 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowProfilePassword(!showProfilePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      {showProfilePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                id="submit-register-btn"
                type="submit"
                className="w-full mt-3 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-[0.98] py-3 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create & Login to Account</span>
              </button>
            </form>
          )}

        </div>

        {/* Footer Notes */}
        <div className="text-center mt-5 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
          <p>
            <span className="font-semibold text-purple-600 dark:text-purple-400">ExpensePK</span> supports offline storage and multi-account isolation.
          </p>
          <p className="text-[10px] text-slate-400">
            Mahad Ahmad is designated as the Owner Account with all past records preserved.
          </p>
        </div>

      </div>
    </div>
  );
};
