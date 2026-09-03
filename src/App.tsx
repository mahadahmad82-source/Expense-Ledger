import React, { useState } from 'react';
import { ExpenseProvider, useExpense } from './context/ExpenseContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { TransferModal } from './components/TransferModal';
import { ReceiptViewerModal } from './components/ReceiptViewerModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { BiometricLockOverlay } from './components/BiometricLockOverlay';
import { StartFreshModal } from './components/StartFreshModal';
import { AccountSwitcherModal } from './components/AccountSwitcherModal';
import { ProfilePasswordModal } from './components/ProfilePasswordModal';
import { BiometricSetupModal } from './components/BiometricSetupModal';

// Views
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { TransactionsView } from './views/TransactionsView';
import { LedgersView } from './views/LedgersView';
import { BudgetsView } from './views/BudgetsView';
import { SavingsView } from './views/SavingsView';
import { BillsView } from './views/BillsView';
import { AnalyticsView } from './views/AnalyticsView';
import { PlanningView } from './views/PlanningView';
import { SmartTipsView } from './views/SmartTipsView';
import { SettingsView } from './views/SettingsView';

const MainAppContent: React.FC = () => {
  const {
    currentAccount,
    isAccountModalOpen,
    setIsAccountModalOpen,
    activeTab,
    theme,
    isBiometricSetupOpen,
    setIsBiometricSetupOpen,
  } = useExpense();
  const [isStartFreshOpen, setIsStartFreshOpen] = useState(false);

  // If no account is logged in, show the Login/Registration page
  if (!currentAccount) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onOpenStartFresh={() => setIsStartFreshOpen(true)} />;
      case 'transactions':
        return <TransactionsView />;
      case 'ledgers':
        return <LedgersView />;
      case 'budgets':
        return <BudgetsView />;
      case 'savings':
        return <SavingsView />;
      case 'bills':
        return <BillsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'planning':
        return <PlanningView />;
      case 'tips':
        return <SmartTipsView />;
      case 'settings':
        return <SettingsView onOpenStartFresh={() => setIsStartFreshOpen(true)} />;
      default:
        return <DashboardView onOpenStartFresh={() => setIsStartFreshOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0a0514] dark:text-white flex flex-col selection:bg-purple-500/30 selection:text-purple-200 font-sans antialiased relative overflow-x-hidden transition-colors duration-200">
      
      {/* Sleek Interface Ambient Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] bg-purple-500/15 dark:bg-purple-600/30 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-150px] right-[-50px] w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[45%] left-[25%] w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* Top Navbar */}
      <Navbar onOpenStartFresh={() => setIsStartFreshOpen(true)} />

      {/* Main Body with Desktop Sidebar + View Container */}
      <div className="relative z-10 flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 gap-6">
        {/* Desktop Sidebar */}
        <Sidebar onOpenStartFresh={() => setIsStartFreshOpen(true)} />

        {/* Dynamic View Container */}
        <main className="flex-1 w-full min-w-0">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenStartFresh={() => setIsStartFreshOpen(true)} />

      {/* Interactive Global Modals & Overlays */}
      <AddTransactionModal />
      <TransferModal />
      <GlobalSearchModal />
      <ReceiptViewerModal />
      <PWAInstallBanner />
      <BiometricLockOverlay />
      <StartFreshModal isOpen={isStartFreshOpen} onClose={() => setIsStartFreshOpen(false)} />
      <AccountSwitcherModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} />
      <ProfilePasswordModal />
      <BiometricSetupModal
        isOpen={isBiometricSetupOpen}
        onClose={() => setIsBiometricSetupOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ExpenseProvider>
      <MainAppContent />
    </ExpenseProvider>
  );
}
