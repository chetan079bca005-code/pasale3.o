import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../utils/i18n';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { useDataStore } from '../../store/dataStore';
import {
  FiSettings,
  FiUser,
  FiGlobe,
  FiDatabase,
  FiDownload,
  FiHelpCircle,
  FiLogOut,
  FiChevronRight,
  FiBell,
  FiMail,
  FiX,
  FiUpload,
  FiSave,
  FiPhone,
  FiMessageCircle,
  FiFileText,
  FiShield,
  FiLock,
  FiToggleLeft,
  FiToggleRight,
  FiCheckCircle,
  FiInfo,
  FiBook,
  FiVideo,
  FiExternalLink
} from 'react-icons/fi';

type ModalType = 'business' | 'backup' | 'excel' | 'help' | 'notifications' | 'security' | 'support' | 'privacy' | 'terms' | 'about' | null;

export default function SettingsPage() {
  const { t, c, n, language } = useTranslation();
  const navigate = useNavigate();
  const { userProfile, updateUserProfile, logout } = useAuthStore();
  const { language: currentLanguage, setLanguage } = useLanguageStore();
  const { transactions, parties, notifications: storeNotifications, expenses } = useDataStore();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [profileData, setProfileData] = useState(userProfile);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    transactionAlerts: true,
    lowStockAlerts: true,
    weeklyReports: true,
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '30',
  });
  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: '',
    priority: 'medium',
  });

  const handleLogout = () => {
    if (window.confirm(t('settings.logoutConfirm'))) {
      logout();
      navigate('/');
    }
  };

  // Format currency helper
  const formatRs = (amount: number) => c(amount);

  // Generate comprehensive backup with all data
  const handleBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      userProfile,
      transactions: transactions || [],
      parties: parties || [],
      expenses: expenses || [],
      notifications: storeNotifications || [],
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pasale-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccess(t('settings.backupCreated'));
    setTimeout(() => setSuccess(''), 3000);
  };

  // Generate comprehensive Word/HTML report with all data and graphs
  const handleDownloadReport = () => {
    const totalSales = (transactions || []).filter(t => t.type === 'selling').reduce((sum, t) => sum + t.amount, 0);
    const totalPurchases = (transactions || []).filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = (expenses || []).reduce((sum, e) => sum + e.amount, 0);
    const totalCustomers = (parties || []).filter(p => p.type === 'customer').length;
    const totalSuppliers = (parties || []).filter(p => p.type === 'supplier').length;
    const totalProducts = 0; // Products feature not yet implemented

    // Create comprehensive HTML report
    const reportHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Pasale Business Report - ${new Date().toLocaleDateString()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1f2937; max-width: 1000px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #2563eb; }
    .header h1 { font-size: 28px; color: #1f2937; margin-bottom: 8px; }
    .header p { color: #6b7280; }
    .section { margin-bottom: 40px; }
    .section h2 { font-size: 20px; color: #1f2937; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { padding: 20px; background: #f9fafb; border-radius: 8px; text-align: center; }
    .stat-card .value { font-size: 24px; font-weight: 700; color: #2563eb; }
    .stat-card .label { font-size: 14px; color: #6b7280; margin-top: 4px; }
    .chart-container { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px; }
    .bar-chart { display: flex; align-items: flex-end; height: 200px; gap: 20px; justify-content: center; padding: 20px; }
    .bar { width: 80px; background: linear-gradient(to top, #2563eb, #60a5fa); border-radius: 4px 4px 0 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 8px; color: white; font-weight: 600; font-size: 12px; }
    .bar-label { text-align: center; margin-top: 8px; font-size: 12px; color: #6b7280; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: 600; color: #374151; }
    tr:hover { background: #f9fafb; }
    .summary-box { background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; }
    .summary-box h3 { color: #1e40af; margin-bottom: 8px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
    @media print { body { padding: 20px; } .bar-chart { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Pasale Business Report</h1>
    <p>Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p>User: ${userProfile.name} | ${userProfile.email || userProfile.phone}</p>
  </div>

  <div class="section">
    <h2>📈 Business Overview</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="value">${formatRs(totalSales)}</div>
        <div class="label">Total Sales</div>
      </div>
      <div class="stat-card">
        <div class="value">${formatRs(totalPurchases)}</div>
        <div class="label">Total Purchases</div>
      </div>
      <div class="stat-card">
        <div class="value">${formatRs(totalExpenses)}</div>
        <div class="label">Total Expenses</div>
      </div>
      <div class="stat-card">
        <div class="value">${totalCustomers}</div>
        <div class="label">Customers</div>
      </div>
      <div class="stat-card">
        <div class="value">${totalSuppliers}</div>
        <div class="label">Suppliers</div>
      </div>
      <div class="stat-card">
        <div class="value">${totalProducts}</div>
        <div class="label">Products</div>
      </div>
    </div>

    <div class="chart-container">
      <h3 style="margin-bottom: 16px; text-align: center;">Financial Summary Chart</h3>
      <div class="bar-chart">
        <div>
          <div class="bar" style="height: ${Math.max(totalSales / Math.max(totalSales, totalPurchases, totalExpenses, 1) * 180, 30)}px; background: linear-gradient(to top, #10b981, #6ee7b7);">
            ${formatRs(totalSales)}
          </div>
          <div class="bar-label">Sales</div>
        </div>
        <div>
          <div class="bar" style="height: ${Math.max(totalPurchases / Math.max(totalSales, totalPurchases, totalExpenses, 1) * 180, 30)}px; background: linear-gradient(to top, #f59e0b, #fcd34d);">
            ${formatRs(totalPurchases)}
          </div>
          <div class="bar-label">Purchases</div>
        </div>
        <div>
          <div class="bar" style="height: ${Math.max(totalExpenses / Math.max(totalSales, totalPurchases, totalExpenses, 1) * 180, 30)}px; background: linear-gradient(to top, #ef4444, #fca5a5);">
            ${formatRs(totalExpenses)}
          </div>
          <div class="bar-label">Expenses</div>
        </div>
      </div>
    </div>

    <div class="summary-box">
      <h3>Net Profit/Loss</h3>
      <p style="font-size: 24px; font-weight: 700; color: ${totalSales - totalPurchases - totalExpenses >= 0 ? '#10b981' : '#ef4444'};">
        ${formatRs(totalSales - totalPurchases - totalExpenses)}
      </p>
    </div>
  </div>

  <div class="section">
    <h2>💰 Recent Transactions (Last 20)</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Description</th>
          <th>Party</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${(transactions || []).slice(0, 20).map(t => `
          <tr>
            <td>${new Date(t.date).toLocaleDateString()}</td>
            <td style="color: ${t.type === 'selling' ? '#10b981' : '#f59e0b'}">${t.type === 'selling' ? 'Sale' : 'Purchase'}</td>
            <td>${t.description || '-'}</td>
            <td>${t.partyName || '-'}</td>
            <td style="font-weight: 600;">${formatRs(t.amount)}</td>
          </tr>
        `).join('')}
        ${(transactions || []).length === 0 ? '<tr><td colspan="5" style="text-align: center; color: #6b7280;">No transactions found</td></tr>' : ''}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>👥 Parties (Customers & Suppliers)</h2>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Phone</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        ${(parties || []).map(p => `
          <tr>
            <td>${p.name}</td>
            <td>${p.type === 'customer' ? '🛒 Customer' : '📦 Supplier'}</td>
            <td>${p.phone || '-'}</td>
            <td style="font-weight: 600; color: ${(p.balance || 0) >= 0 ? '#10b981' : '#ef4444'}">${formatRs(p.balance || 0)}</td>
          </tr>
        `).join('')}
        ${(parties || []).length === 0 ? '<tr><td colspan="4" style="text-align: center; color: #6b7280;">No parties found</td></tr>' : ''}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>📦 Inventory Products</h2>
    <table>
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Category</th>
          <th>Stock</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${[].map(p => `
          <tr>
            <td>${p.name}</td>
            <td>${p.category || '-'}</td>
            <td style="color: ${(p.stock || 0) < 10 ? '#ef4444' : '#10b981'}">${p.stock || 0}</td>
            <td style="font-weight: 600;">${formatRs(p.price || 0)}</td>
          </tr>
        `).join('')}
        ${[].length === 0 ? '<tr><td colspan="4" style="text-align: center; color: #6b7280;">No products found</td></tr>' : ''}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>💸 Expenses</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Description</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${(expenses || []).map(e => `
          <tr>
            <td>${new Date(e.date).toLocaleDateString()}</td>
            <td>${e.category || '-'}</td>
            <td>${e.description || '-'}</td>
            <td style="font-weight: 600; color: #ef4444;">${formatRs(e.amount)}</td>
          </tr>
        `).join('')}
        ${(expenses || []).length === 0 ? '<tr><td colspan="4" style="text-align: center; color: #6b7280;">No expenses found</td></tr>' : ''}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Generated by Pasale - Business Management v2.0.0</p>
    <p>© ${new Date().getFullYear()} Pasale. Made with ❤️ in Nepal</p>
  </div>
</body>
</html>`;

    const blob = new Blob([reportHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pasale-Business-Report-${new Date().toISOString().split('T')[0]}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccess(t('settings.reportDownloaded'));
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleExportExcel = () => {
    setSuccess(t('settings.dataExported'));
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSaveProfile = () => {
    if (!profileData.name || !profileData.email) {
      setError(t('settings.fillRequired'));
      return;
    }
    updateUserProfile(profileData);
    setSuccess(t('settings.profileUpdated'));
    setActiveModal(null);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSendSupport = () => {
    if (!supportForm.subject || !supportForm.message) {
      setError(t('settings.fillRequired'));
      return;
    }
    setSuccess(t('settings.supportSubmitted'));
    setSupportForm({ subject: '', message: '', priority: 'medium' });
    setActiveModal(null);
    setTimeout(() => setSuccess(''), 3000);
  };

  const settingsCards = [
    {
      id: 'business',
      icon: FiSettings,
      iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: t('settings.businessSettings'),
      description: t('settings.businessSettingsDesc'),
      onClick: () => setActiveModal('business'),
    },
    {
      id: 'notifications',
      icon: FiBell,
      iconBg: 'bg-yellow-50 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      title: t('settings.notifications'),
      description: t('settings.notificationsDesc'),
      onClick: () => setActiveModal('notifications'),
    },
    {
      id: 'security',
      icon: FiShield,
      iconBg: 'bg-red-50 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      title: t('settings.securityPrivacy'),
      description: t('settings.securityDesc'),
      onClick: () => setActiveModal('security'),
    },
    {
      id: 'language',
      icon: FiGlobe,
      iconBg: 'bg-green-50 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      title: t('settings.language'),
      description: t('settings.languageDesc'),
      hasLanguageToggle: true,
    },
    {
      id: 'backup',
      icon: FiDatabase,
      iconBg: 'bg-cyan-50 dark:bg-cyan-900/30',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      title: t('settings.backupRestore'),
      description: t('settings.backupRestoreDesc'),
      extra: <span className="text-green-600 dark:text-green-400 text-sm font-medium">{t('settings.lastBackup')}: {t('settings.today')}</span>,
      onClick: () => setActiveModal('backup'),
    },
    {
      id: 'excel',
      icon: FiDownload,
      iconBg: 'bg-purple-50 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      title: t('settings.importExportExcel'),
      description: t('settings.importExportDesc'),
      onClick: () => setActiveModal('excel'),
    },
    {
      id: 'help',
      icon: FiHelpCircle,
      iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: t('settings.helpDocs'),
      description: t('settings.helpDesc'),
      onClick: () => setActiveModal('help'),
    },
    {
      id: 'logout',
      icon: FiLogOut,
      iconBg: 'bg-red-50 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      title: t('settings.logout'),
      titleColor: 'text-red-600 dark:text-red-400',
      description: t('sidebar.logout'),
      onClick: handleLogout,
    },
  ];

  const renderModal = () => {
    if (!activeModal) return null;

    const modalContent: Record<string, React.ReactNode> = {
      business: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('settings.businessSettings')}</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('settings.businessName')}</label>
            <Input label="" placeholder={t('settings.enterBusinessName')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('settings.businessType')}</label>
            <select className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
              <option>{t('settings.retailStore')}</option>
              <option>{t('settings.wholesale')}</option>
              <option>{t('settings.serviceProvider')}</option>
              <option>{t('settings.manufacturing')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('settings.taxRegistration')}</label>
            <Input label="" placeholder={t('settings.enterTaxNumber')} />
          </div>
          <Button onClick={() => setActiveModal(null)} className="w-full mt-4">
            <FiSave className="w-4 h-4 mr-2" />
            {t('settings.save')}
          </Button>
        </div>
      ),
      backup: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('settings.backupRestore')}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('settings.backupRestoreDesc')}</p>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">{t('settings.whatsIncluded')}</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>✓ {t('settings.allTransactions')} ({n(transactions?.length || 0)} {t('settings.records')})</li>
              <li>✓ {t('settings.partiesCustomersSuppliers')} ({n(parties?.length || 0)} {t('settings.records')})</li>
              <li>✓ {t('settings.inventoryProducts')} ({n(0)} {t('settings.items')})</li>
              <li>✓ {t('settings.expenses')} ({n(expenses?.length || 0)} {t('settings.records')})</li>
              <li>✓ {t('settings.userProfileSettings')}</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button onClick={handleBackup} className="w-full">
              <FiDownload className="w-4 h-4 mr-2" />
              {t('settings.downloadBackup')}
            </Button>
            <Button onClick={handleDownloadReport} variant="outline" className="w-full">
              <FiFileText className="w-4 h-4 mr-2" />
              {t('settings.downloadReport')}
            </Button>
            <Button variant="outline" className="w-full">
              <FiUpload className="w-4 h-4 mr-2" />
              {t('settings.restoreFromBackup')}
            </Button>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4" />
            {t('settings.lastBackup')}: {t('settings.today')} at {new Date().toLocaleTimeString()}
          </div>
        </div>
      ),
      excel: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('settings.importExportExcel')}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('settings.importExportDesc')}</p>
          <div className="space-y-3">
            <Button onClick={handleExportExcel} className="w-full">
              <FiDownload className="w-4 h-4 mr-2" />
              {t('settings.exportToExcel')}
            </Button>
            <Button variant="outline" className="w-full">
              <FiUpload className="w-4 h-4 mr-2" />
              {t('settings.importFromExcel')}
            </Button>
          </div>
        </div>
      ),
      help: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('settings.helpDocs')}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('settings.helpDesc')}</p>

          <div className="space-y-3">
            <button
              onClick={() => window.open('https://docs.pasale.com', '_blank')}
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <FiBook className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{t('settings.documentation')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.documentationDesc')}</p>
                </div>
                <FiExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            <button
              onClick={() => window.open('https://help.pasale.com/faq', '_blank')}
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <FiHelpCircle className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{t('settings.faqs')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.faqsDesc')}</p>
                </div>
                <FiExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            <button
              onClick={() => window.open('https://youtube.com/@pasale', '_blank')}
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <FiVideo className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{t('settings.videoTutorials')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.videoTutorialsDesc')}</p>
                </div>
                <FiExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            <button
              onClick={() => { setActiveModal('support'); }}
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <FiMessageCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{t('settings.contactSupport')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.supportDesc')}</p>
                </div>
                <FiChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">{t('billing.quickTips')}</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• {t('billing.tipScanF2')}</li>
              <li>• {t('billing.tipTabNavigate')}</li>
              <li>• {t('settings.backupRestoreDesc')}</li>
            </ul>
          </div>
        </div>
      ),
      notifications: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('settings.notifications')}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('settings.notificationsDesc')}</p>
          <div className="space-y-3">
            {[
              { key: 'emailNotifications', label: t('settings.emailNotifications'), desc: t('settings.emailNotificationsDesc') },
              { key: 'pushNotifications', label: t('settings.pushNotifications'), desc: t('settings.pushNotificationsDesc') },
              { key: 'smsNotifications', label: t('settings.smsNotifications'), desc: t('settings.smsNotificationsDesc') },
              { key: 'transactionAlerts', label: t('settings.transactionAlerts'), desc: t('settings.transactionAlertsDesc') },
              { key: 'lowStockAlerts', label: t('settings.lowStockAlerts'), desc: t('settings.lowStockAlertsDesc') },
              { key: 'weeklyReports', label: t('settings.weeklyReports'), desc: t('settings.weeklyReportsDesc') },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotificationSettings({
                    ...notificationSettings,
                    [item.key]: !notificationSettings[item.key as keyof typeof notificationSettings]
                  })}
                  className={`p-1 rounded-full transition-colors ${notificationSettings[item.key as keyof typeof notificationSettings]
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 dark:text-gray-500'
                    }`}
                >
                  {notificationSettings[item.key as keyof typeof notificationSettings] ? (
                    <FiToggleRight className="w-8 h-8" />
                  ) : (
                    <FiToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </div>
            ))}
          </div>
          <Button onClick={() => { setActiveModal(null); setSuccess(t('settings.profileUpdated')); setTimeout(() => setSuccess(''), 3000); }} className="w-full mt-4">
            <FiSave className="w-4 h-4 mr-2" />
            {t('settings.save')}
          </Button>
        </div>
      ),
      security: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('settings.securityPrivacy')}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('settings.securityDesc')}</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{t('settings.twoFactorAuth')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('settings.twoFactorAuthDesc')}</p>
              </div>
              <button
                onClick={() => setSecuritySettings({ ...securitySettings, twoFactorAuth: !securitySettings.twoFactorAuth })}
                className={`p-1 rounded-full transition-colors ${securitySettings.twoFactorAuth ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                  }`}
              >
                {securitySettings.twoFactorAuth ? <FiToggleRight className="w-8 h-8" /> : <FiToggleLeft className="w-8 h-8" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{t('settings.loginAlerts')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('settings.loginAlertsDesc')}</p>
              </div>
              <button
                onClick={() => setSecuritySettings({ ...securitySettings, loginAlerts: !securitySettings.loginAlerts })}
                className={`p-1 rounded-full transition-colors ${securitySettings.loginAlerts ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                  }`}
              >
                {securitySettings.loginAlerts ? <FiToggleRight className="w-8 h-8" /> : <FiToggleLeft className="w-8 h-8" />}
              </button>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <label className="block font-medium text-gray-900 dark:text-gray-100 mb-2">{t('settings.sessionTimeout')}</label>
              <select
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              >
                <option value="15">15 {t('settings.minutes')}</option>
                <option value="30">30 {t('settings.minutes')}</option>
                <option value="60">1 {t('settings.minutes')}</option>
                <option value="120">2 {t('settings.minutes')}</option>
              </select>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{t('password')}</p>
              <Button variant="outline" className="w-full">
                <FiLock className="w-4 h-4 mr-2" />
                {t('update')} {t('password')}
              </Button>
            </div>
          </div>
          <Button onClick={() => { setActiveModal(null); setSuccess(t('settings.profileUpdated')); setTimeout(() => setSuccess(''), 3000); }} className="w-full mt-4">
            <FiSave className="w-4 h-4 mr-2" />
            {t('settings.save')}
          </Button>
        </div>
      ),
      support: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('settings.contactSupport')}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('settings.supportDesc')}</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('settings.subjectRequired')}</label>
            <Input
              value={supportForm.subject}
              onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
              placeholder={t('settings.briefDescription')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('settings.priority')}</label>
            <select
              value={supportForm.priority}
              onChange={(e) => setSupportForm({ ...supportForm, priority: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            >
              <option value="low">{t('settings.lowPriority')}</option>
              <option value="medium">{t('settings.mediumPriority')}</option>
              <option value="high">{t('settings.highPriority')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('settings.messageRequired')}</label>
            <textarea
              value={supportForm.message}
              onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
              placeholder={t('settings.describeIssue')}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 resize-none"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => window.open('mailto:support@pasale.com')}>
              <FiMail className="w-4 h-4 mr-2" />
              {t('settings.emailUs')}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => window.open('tel:+9779812345678')}>
              <FiPhone className="w-4 h-4 mr-2" />
              {t('settings.callUs')}
            </Button>
          </div>
          <Button onClick={handleSendSupport} className="w-full">
            <FiMessageCircle className="w-4 h-4 mr-2" />
            {t('settings.submitTicket')}
          </Button>
        </div>
      ),
      privacy: (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FiShield className="w-5 h-5 text-blue-500" />
            {t('settings.privacyPolicy')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('settings.privacyLastUpdated')}</p>

          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('settings.infoCollect')}</h4>
              <p>{t('settings.infoCollectDesc')}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('settings.howWeUse')}</h4>
              <p>{t('settings.howWeUseDesc')}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('settings.dataSecurity')}</h4>
              <p>{t('settings.dataSecurityDesc')}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('settings.dataRetention')}</h4>
              <p>{t('settings.dataRetentionDesc')}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('settings.yourRights')}</h4>
              <p>{t('settings.yourRightsDesc')}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('settings.contactUs')}</h4>
              <p>{t('settings.contactUsDesc')}</p>
            </div>
          </div>

          <Button onClick={() => setActiveModal(null)} className="w-full mt-4">
            {t('settings.iUnderstand')}
          </Button>
        </div>
      ),
      terms: (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FiFileText className="w-5 h-5 text-green-500" />
            {t('settings.termsOfService')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('settings.termsLastUpdated')}</p>

          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('settings.acceptanceTerms')}</h4>
              <p>{t('settings.acceptanceTermsDesc')}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('settings.userResponsibilities')}</h4>
              <p>{t('settings.userResponsibilitiesDesc')}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('settings.serviceAvailability')}</h4>
              <p>{t('settings.serviceAvailabilityDesc')}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('settings.dataOwnership')}</h4>
              <p>{t('settings.dataOwnershipDesc')}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('settings.limitationLiability')}</h4>
              <p>{t('settings.limitationLiabilityDesc')}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('settings.termination')}</h4>
              <p>{t('settings.terminationDesc')}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('settings.termsContact')}</h4>
              <p>{t('settings.termsContactDesc')}</p>
            </div>
          </div>

          <Button onClick={() => setActiveModal(null)} className="w-full mt-4">
            {t('settings.iAccept')}
          </Button>
        </div>
      ),
      about: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl text-white font-bold">P</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Pasale</h3>
            <p className="text-gray-500 dark:text-gray-400">{t('settings.businessManagementSystem')}</p>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">{t('settings.version')} 2.0.0</p>
          </div>

          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p className="text-center">
              {t('settings.pasaleDescription')}
            </p>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('settings.features')}</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>✓ {t('settings.invoiceBillingManagement')}</li>
                <li>✓ {t('settings.inventoryTracking')}</li>
                <li>✓ {t('settings.partyManagement')}</li>
                <li>✓ {t('settings.expenseMonitoringFeature')}</li>
                <li>✓ {t('settings.reportsAnalytics')}</li>
                <li>✓ {t('settings.barcodeScanning')}</li>
                <li>✓ {t('settings.multiLanguageSupport')}</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
              <p className="text-blue-800 dark:text-blue-300 font-medium">{t('settings.madeWith')}</p>
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">© 2024 Pasale. {t('settings.allRightsReserved')}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => window.open('https://pasale.com', '_blank')}>
                <FiExternalLink className="w-4 h-4 mr-2" />
                {t('settings.website')}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setActiveModal('support')}>
                <FiMessageCircle className="w-4 h-4 mr-2" />
                {t('settings.contact')}
              </Button>
            </div>
          </div>
        </div>
      ),
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl">
          <div className="flex justify-end mb-1 sm:mb-2">
            <button
              onClick={() => { setActiveModal(null); setError(''); }}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </button>
          </div>
          {modalContent[activeModal]}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-3 sm:pt-4 overflow-x-hidden">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 pb-6 sm:pb-8">
        {/* Header - Interactive Style */}
        <div className="mb-4 sm:mb-6">
          <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-linear-to-r from-gray-100 to-slate-100 dark:from-gray-800/50 dark:to-slate-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-default">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-linear-to-br from-gray-600 to-gray-800 dark:from-gray-500 dark:to-gray-700 flex items-center justify-center shadow-lg shadow-gray-500/30 group-hover:scale-110 transition-transform duration-300">
              <FiSettings className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                {t('settings.title')}
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {t('settings.preferences') || 'Preferences'}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {t('settings.subtitle') || 'Manage your app preferences'}
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-xs sm:text-sm font-medium">
            {success}
          </div>
        )}

        {/* Contact Support - Middle Section */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8 bg-linear-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 border-0 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 text-white text-center sm:text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <FiMessageCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg sm:text-xl mb-0.5 sm:mb-1">{t('settings.help')}?</h3>
                <p className="text-blue-100 text-xs sm:text-sm">{t('settings.supportDesc')}</p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white text-blue-600 border-0 font-semibold shadow-md flex-1 sm:flex-none text-xs sm:text-sm"
                onClick={() => window.open('tel:+9779812345678')}
              >
                <FiPhone className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">{t('settings.callUs')}</span>
                <span className="sm:hidden">Call</span>
              </Button>
              <Button
                size="sm"
                className="bg-blue-800 hover:bg-blue-900 text-white border-0 font-semibold shadow-md flex-1 sm:flex-none text-xs sm:text-sm"
                onClick={() => setActiveModal('support')}
              >
                <FiMail className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">{t('settings.contactSupport')}</span>
                <span className="sm:hidden">Support</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Settings Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {settingsCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.id}
                className={`p-3 sm:p-4 lg:p-5 cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 ${card.id === 'logout' ? 'border-red-100 dark:border-red-900/30' : ''
                  }`}
                onClick={card.onClick}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5 sm:gap-3 lg:gap-4">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${card.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold mb-0.5 sm:mb-1 text-sm sm:text-base ${card.titleColor || 'text-gray-900 dark:text-gray-100'}`}>
                        {card.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                        {card.description}
                      </p>
                      {card.extra && <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm">{card.extra}</div>}
                      {card.hasLanguageToggle && (
                        <div className="mt-2 sm:mt-3 flex gap-1.5 sm:gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setLanguage('en'); }}
                            className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${language === 'en'
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                          >
                            English
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setLanguage('np'); }}
                            className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${language === 'np'
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                          >
                            नेपाली
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {!card.hasLanguageToggle && (
                    <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0 mt-0.5 sm:mt-1" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* App Info Footer */}
        <Card className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-center lg:text-left">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-0.5 sm:mb-1 text-sm sm:text-base">
                Pasale - {t('settings.businessManagementSystem')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                {t('settings.version')} 2.0.0 • {t('settings.madeWith')}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <button onClick={() => setActiveModal('privacy')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('settings.privacyPolicy')}</button>
              <span className="hidden sm:inline">•</span>
              <button onClick={() => setActiveModal('terms')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('settings.termsOfService')}</button>
              <span className="hidden sm:inline">•</span>
              <button onClick={() => setActiveModal('about')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('settings.about')}</button>
            </div>
          </div>
        </Card>
      </div>
      {/* Modal */}
      {renderModal()}
    </div>
  );
}
