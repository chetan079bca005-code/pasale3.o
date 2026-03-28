import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useSettingsStore } from './store/settingsStore';
import { useThemeStore } from './store/themeStore';
import { useLanguageStore } from './store/languageStore';
import { ThemeProvider } from './components/layout/ThemeProvider';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { AppLockScreen } from './components/layout/AppLockScreen';
import { settingsApi } from './utils/api';

// Pages
import WelcomePage from './app/welcome/page';
import LoginPage from './app/login/page';
import SignupPage from './app/signup/page';
import ForgotPasswordPage from './app/forgot-password/page';
import BusinessTypePage from './app/business-type/page';
import PersonalVerificationPage from './app/personal-verification/page';
import VerifyBusinessPage from './app/verify-business/page';
import DashboardLayout from './app/dashboard/layout';
import DashboardPage from './app/dashboard/page';
import TransactionsPage from './app/transactions/page';
import PartiesPage from './app/parties/page';

import ExpenseMonitoringPage from './app/expense-monitoring/page';
import NotificationsPage from './app/notifications/page';
import SettingsPage from './app/settings/page';
import InventoryPage from './app/inventory/page';
import ReportsPage from './app/reports/page';
import BillingPage from './app/billing/page';
import KPIDetailPage from './app/dashboard/kpi/[type]/page';
import TransactionDetailPage from './app/transactions/detail';
import TodaysSalesPage from './app/dashboard/todays-sales/page';
import LedgerPage from './app/ledger/[partyId]/page';
import PartyDetailPage from './app/parties/[partyId]/page';
import ProfilePage from './app/profile/page';
import ReportDetailPage from './app/reports/[reportType]/page.tsx';
import InventoryDetailPage from './app/inventory/[productId]/page.tsx';

// Route Guards - Public routes (welcome, login, forgot-password)
const PublicRoute = () => {
  return <Outlet />;
};

const OnboardingRoute = () => {
  const { isAuthenticated, onboardingComplete } = useAuthStore();
  if (!isAuthenticated) {
    // Save the current path for redirect after login
    const currentPath = window.location.pathname;
    if (currentPath !== '/welcome' && currentPath !== '/login') {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }
    return <Navigate to="/welcome" />;
  }
  if (onboardingComplete) {
    return <Navigate to="/dashboard" />;
  }
  return <Outlet />;
};

const ProtectedRoute = () => {
  const { isAuthenticated, onboardingComplete } = useAuthStore();
  if (!isAuthenticated) {
    // Save the current path for redirect after login
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/welcome') {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }
    return <Navigate to="/login" />;
  }
  if (!onboardingComplete) {
    return <Navigate to="/business-type" />;
  }
  return <Outlet />;
};

function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const { isAuthenticated } = useAuthStore();
  const {
    general,
    updateGeneralSettings,
    updateBusinessProfile,
    updatePartySettings,
    updateInventorySettings,
    updateTransactionSettings,
    updateInvoicePrintSettings,
  } = useSettingsStore();
  const { setTheme } = useThemeStore();
  const { setLanguage } = useLanguageStore();
  const [isAppUnlocked, setIsAppUnlocked] = React.useState(() => {
    return sessionStorage.getItem('app-unlocked') === 'true';
  });
  const settingsLoadedRef = React.useRef(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (!general.appLock) {
      setIsAppUnlocked(true);
      sessionStorage.setItem('app-unlocked', 'true');
      return;
    }
    const unlocked = sessionStorage.getItem('app-unlocked') === 'true';
    setIsAppUnlocked(unlocked);
  }, [general.appLock]);

  React.useEffect(() => {
    if (!isAuthenticated || settingsLoadedRef.current) {
      return;
    }
    settingsLoadedRef.current = true;
    const loadSettings = async () => {
      try {
        const data = await settingsApi.get();
        if (data.general) {
          updateGeneralSettings(data.general as any);
          if (data.general.appearance) setTheme(data.general.appearance as any);
          if (data.general.language) setLanguage(data.general.language as any);
        }
        if (data.business_profile) updateBusinessProfile(data.business_profile as any);
        if (data.feature_settings) {
          const fs = data.feature_settings;
          if (fs.parties) updatePartySettings(fs.parties as any);
          if (fs.inventory) updateInventorySettings(fs.inventory as any);
          if (fs.transactions) updateTransactionSettings(fs.transactions as any);
          if (fs.invoicePrint) updateInvoicePrintSettings(fs.invoicePrint as any);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
        settingsLoadedRef.current = false;
      }
    };
    loadSettings();
  }, [
    isAuthenticated,
    setLanguage,
    setTheme,
    updateBusinessProfile,
    updateGeneralSettings,
    updateInventorySettings,
    updateInvoicePrintSettings,
    updatePartySettings,
    updateTransactionSettings,
  ]);

  return (
    <ThemeProvider>
      {isLoading && <LoadingScreen />}
      <AppLockScreen
        isOpen={isAuthenticated && general.appLock && !isAppUnlocked}
        pin={general.appLockPin || ''}
        onUnlock={() => {
          setIsAppUnlocked(true);
          sessionStorage.setItem('app-unlocked', 'true');
        }}
      />
      <Routes>
        {/* Public pages - accessible without login */}
        <Route element={<PublicRoute />}>
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Onboarding-only pages */}
        <Route element={<OnboardingRoute />}>
          <Route path="/business-type" element={<BusinessTypePage />} />
          <Route path="/personal-verification" element={<PersonalVerificationPage />} />
          <Route path="/business-verification" element={<VerifyBusinessPage />} />
        </Route>
        
        {/* Protected app */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/transactions/:id" element={<TransactionDetailPage />} />
            <Route path="/parties" element={<PartiesPage />} />
            <Route path="/parties/:partyId" element={<PartyDetailPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/expense-monitoring" element={<ExpenseMonitoringPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory/:productId" element={<InventoryDetailPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:reportType" element={<ReportDetailPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/dashboard/kpi/:type" element={<KPIDetailPage />} />
            <Route path="/dashboard/todays-sales" element={<TodaysSalesPage />} />
            <Route path="/ledger/:partyId" element={<LedgerPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/welcome" />} />
        <Route path="*" element={<Navigate to="/welcome" />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;

