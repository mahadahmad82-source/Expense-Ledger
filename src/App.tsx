import React from 'react';
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

// Views
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
  const { activeTab } = useExpense();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
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
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0514] text-white flex flex-col selection:bg-purple-500/30 selection:text-purple-200 font-sans antialiased relative overflow-x-hidden">
      
      {/* Sleek Interface Ambient Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-150px] right-[-50px] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-[45%] left-[25%] w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* Top Navbar */}
      <Navbar />

      {/* Main Body with Desktop Sidebar + View Container */}
      <div className="relative z-10 flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Dynamic View Container */}
        <main className="flex-1 w-full min-w-0">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Interactive Global Modals & Overlays */}
      <AddTransactionModal />
      <TransferModal />
      <GlobalSearchModal />
      <ReceiptViewerModal />
      <PWAInstallBanner />
      <BiometricLockOverlay />
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
