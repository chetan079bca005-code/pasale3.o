import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../utils/i18n';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore, type Theme, type BankAccount } from '../../store/settingsStore';
import { useThemeStore } from '../../store/themeStore';
import {
  FiSettings,
  FiUser,
  FiLogOut,
  FiChevronRight,
  FiChevronDown,
  FiX,
  FiBriefcase,
  FiCreditCard,
  FiUsers,
  FiPackage,
  FiFileText,
  FiPrinter,
  FiArrowLeft,
  FiCheck,
  FiTrash2,
  FiEdit2,
  FiArchive,
} from 'react-icons/fi';

type SettingsSection = 'general' | 'my-account' | 'business-profile' | 'subscription' | 'parties' | 'inventory' | 'transactions' | 'invoice-print';

// Nepal Location Data
const provinces = [
  'Koshi Province',
  'Madhesh Province',
  'Bagmati Province',
  'Gandaki Province',
  'Lumbini Province',
  'Karnali Province',
  'Sudurpashchim Province',
];

const districtsByProvince: Record<string, string[]> = {
  'Koshi Province': ['Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga', 'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Terhathum', 'Udayapur'],
  'Madhesh Province': ['Bara', 'Dhanusha', 'Mahottari', 'Parsa', 'Rautahat', 'Saptari', 'Sarlahi', 'Siraha'],
  'Bagmati Province': ['Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchok', 'Lalitpur', 'Makwanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli', 'Sindhupalchok'],
  'Gandaki Province': ['Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi', 'Nawalpur', 'Parbat', 'Syangja', 'Tanahun'],
  'Lumbini Province': ['Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Gulmi', 'Kapilvastu', 'Nawalparasi West', 'Palpa', 'Pyuthan', 'Rolpa', 'Rukum East', 'Rupandehi'],
  'Karnali Province': ['Dailekh', 'Dolpa', 'Humla', 'Jajarkot', 'Jumla', 'Kalikot', 'Mugu', 'Rukum West', 'Salyan', 'Surkhet'],
  'Sudurpashchim Province': ['Achham', 'Baitadi', 'Bajhang', 'Bajura', 'Dadeldhura', 'Darchula', 'Doti', 'Kailali', 'Kanchanpur'],
};

const businessCategories = [
  'Retail',
  'Wholesale',
  'Manufacturing',
  'Services',
  'Food & Beverage',
  'Clothing',
  'Electronics',
  'Pharmacy',
  'Hardware',
  'Grocery',
  'Other',
];

const businessTypes = ['Retailer', 'Wholesaler', 'Manufacturer', 'Distributor', 'Service Provider'];

export default function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userProfile, updateUserProfile, logout } = useAuthStore();
  const {
    general,
    businessProfile,
    featureSettings,
    updateGeneralSettings,
    updateBusinessProfile,
    updatePartySettings,
    updateInventorySettings,
    updateTransactionSettings,
    updateInvoicePrintSettings,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
  } = useSettingsStore();
  const { theme, setTheme } = useThemeStore();

  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [featureSettingsExpanded, setFeatureSettingsExpanded] = useState(false);
  const [success, setSuccess] = useState('');
  const [dangerExpanded, setDangerExpanded] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    branch: '',
    isPrimary: false,
  });

  // Account form state
  const [accountForm, setAccountForm] = useState({
    name: userProfile.name || '',
    phone: userProfile.phone || '',
    email: userProfile.email || '',
    photo: userProfile.photo || null as string | null,
  });

  // Business profile form state
  const [businessForm, setBusinessForm] = useState({
    ...businessProfile,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const businessLogoRef = useRef<HTMLInputElement>(null);

  const showSuccessMessage = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleLogout = () => {
    if (window.confirm(t('settings.logoutConfirm'))) {
      logout();
      navigate('/');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAccountForm({ ...accountForm, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBusinessLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusinessForm({ ...businessForm, businessLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateAccount = () => {
    updateUserProfile({
      name: accountForm.name,
      phone: accountForm.phone,
      email: accountForm.email,
      photo: accountForm.photo,
    });
    showSuccessMessage('Account updated successfully!');
  };

  const handleUpdateBusinessProfile = () => {
    updateBusinessProfile(businessForm);
    showSuccessMessage('Business profile updated successfully!');
  };

  const handleSaveBankAccount = () => {
    if (editingBank) {
      updateBankAccount(editingBank.id, bankForm);
    } else {
      addBankAccount(bankForm);
    }
    setShowBankModal(false);
    setBankForm({ bankName: '', accountNumber: '', accountHolderName: '', branch: '', isPrimary: false });
    setEditingBank(null);
    showSuccessMessage('Bank account saved successfully!');
  };

  const handleEditBank = (bank: BankAccount) => {
    setEditingBank(bank);
    setBankForm({
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      accountHolderName: bank.accountHolderName,
      branch: bank.branch || '',
      isPrimary: bank.isPrimary,
    });
    setShowBankModal(true);
  };

  const handleDeleteBank = (id: string) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      deleteBankAccount(id);
      showSuccessMessage('Bank account deleted successfully!');
    }
  };

  const sidebarItems = [
    { id: 'general' as const, label: 'General', icon: FiSettings },
    { id: 'my-account' as const, label: 'My Account', icon: FiUser },
    { id: 'business-profile' as const, label: 'Business Profile', icon: FiBriefcase },
    { id: 'subscription' as const, label: 'Subscription', icon: FiCreditCard },
  ];

  const featureSettingsItems = [
    { id: 'parties' as const, label: 'Parties', icon: FiUsers },
    { id: 'inventory' as const, label: 'Inventory', icon: FiPackage },
    { id: 'transactions' as const, label: 'Transactions', icon: FiFileText },
    { id: 'invoice-print' as const, label: 'Invoice Print', icon: FiPrinter },
  ];

  // Toggle Switch Component
  const ToggleSwitch = ({ enabled, onChange, label, description }: { enabled: boolean; onChange: (val: boolean) => void; label: string; description?: string }) => (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg">
      <div>
        <p className="text-white font-medium">{label}</p>
        {description && <p className="text-gray-400 text-sm">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-gray-600'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );

  // Render General Settings
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">General Settings</h2>

      {/* Appearance */}
      <Card className="p-4 bg-gray-800/50 border-gray-700">
        <h3 className="text-white font-medium mb-2">Appearance</h3>
        <p className="text-gray-400 text-sm mb-4">To adjust website theme, choose from three preset options</p>
        <div className="flex gap-4">
          {(['light', 'classic', 'dark'] as Theme[]).map((themeOption) => (
            <button
              key={themeOption}
              onClick={() => {
                setTheme(themeOption);
                updateGeneralSettings({ appearance: themeOption });
              }}
              className={`relative rounded-lg overflow-hidden border-2 transition-all ${theme === themeOption ? 'border-emerald-500' : 'border-gray-600 hover:border-gray-500'}`}
            >
              <div className={`w-28 h-20 ${themeOption === 'light' ? 'bg-white' : themeOption === 'classic' ? 'bg-gray-700' : 'bg-gray-900'}`}>
                <div className={`h-4 ${themeOption === 'light' ? 'bg-gray-200' : 'bg-gray-800'}`} />
                <div className="p-2">
                  <div className={`h-2 w-16 rounded ${themeOption === 'light' ? 'bg-gray-300' : 'bg-gray-700'}`} />
                  <div className={`h-2 w-12 rounded mt-1 ${themeOption === 'light' ? 'bg-gray-300' : 'bg-gray-700'}`} />
                </div>
              </div>
              {theme === themeOption && (
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <FiCheck className="w-3 h-3 text-white" />
                </div>
              )}
              <p className={`text-center py-1 text-sm ${themeOption === 'light' ? 'bg-white text-gray-800' : 'bg-gray-800 text-white'}`}>
                {themeOption === 'light' ? 'Light Theme' : themeOption === 'classic' ? 'Classic Theme' : 'Dark Theme'}
              </p>
            </button>
          ))}
        </div>
      </Card>

      {/* Language */}
      <Card className="p-4 bg-gray-800/50 border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium">Language</h3>
            <p className="text-gray-400 text-sm">To adjust language, choose from available options</p>
          </div>
          <select
            value={general.language}
            onChange={(e) => updateGeneralSettings({ language: e.target.value as 'en' | 'np' })}
            className="bg-gray-700 text-white border-gray-600 rounded-lg px-3 py-2"
          >
            <option value="en">🇺🇸 English</option>
            <option value="np">🇳🇵 नेपाली</option>
          </select>
        </div>
      </Card>

      {/* Currency */}
      <Card className="p-4 bg-gray-800/50 border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-white font-medium">Currency</h3>
            <p className="text-gray-400 text-sm">To adjust currency type, choose from available preset options</p>
          </div>
          <select
            value={general.currency}
            onChange={(e) => updateGeneralSettings({ currency: e.target.value as 'NPR' | 'INR' | 'USD' })}
            className="bg-gray-700 text-white border-gray-600 rounded-lg px-3 py-2"
          >
            <option value="NPR">Rs.</option>
            <option value="INR">₹</option>
            <option value="USD">$</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-400">Currency Position</p>
          <select
            value={general.currencyPosition}
            onChange={(e) => updateGeneralSettings({ currencyPosition: e.target.value as 'start' | 'end' })}
            className="bg-gray-700 text-white border-gray-600 rounded-lg px-3 py-2"
          >
            <option value="start">Start</option>
            <option value="end">End</option>
          </select>
        </div>
      </Card>

      {/* Calendar */}
      <Card className="p-4 bg-gray-800/50 border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-white font-medium">Calendar</h3>
            <p className="text-gray-400 text-sm">To adjust calendar type, choose from available options</p>
          </div>
          <div className="flex gap-1 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => updateGeneralSettings({ calendarType: 'AD' })}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${general.calendarType === 'AD' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}
            >
              AD
            </button>
            <button
              onClick={() => updateGeneralSettings({ calendarType: 'BS' })}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${general.calendarType === 'BS' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}
            >
              BS
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-400">Date Format</p>
          <select
            value={general.dateFormat}
            onChange={(e) => updateGeneralSettings({ dateFormat: e.target.value as any })}
            className="bg-gray-700 text-white border-gray-600 rounded-lg px-3 py-2"
          >
            <option value="BS">2082 Pou 17</option>
            <option value="YYYY-MM-DD">2026-01-01</option>
            <option value="DD-MM-YYYY">01-01-2026</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-400">Time Format</p>
          <select
            value={general.timeFormat}
            onChange={(e) => updateGeneralSettings({ timeFormat: e.target.value as '12h' | '24h' })}
            className="bg-gray-700 text-white border-gray-600 rounded-lg px-3 py-2"
          >
            <option value="12h">6:17 AM</option>
            <option value="24h">06:17</option>
          </select>
        </div>
      </Card>

      {/* Number Format */}
      <Card className="p-4 bg-gray-800/50 border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium">Number Format</h3>
            <p className="text-gray-400 text-sm">To adjust number format, choose from two preset options</p>
          </div>
          <select
            value={general.numberFormat}
            onChange={(e) => updateGeneralSettings({ numberFormat: e.target.value as 'international' | 'indian' })}
            className="bg-gray-700 text-white border-gray-600 rounded-lg px-3 py-2"
          >
            <option value="indian">10,00,000</option>
            <option value="international">1,000,000</option>
          </select>
        </div>
      </Card>

      {/* Privacy Mode */}
      <Card className="p-4 bg-gray-800/50 border-gray-700">
        <ToggleSwitch
          enabled={general.privacyMode}
          onChange={(val) => updateGeneralSettings({ privacyMode: val })}
          label="Privacy Mode"
          description="Hides business stats from homepage & item purchase price."
        />
      </Card>

      {/* App Lock */}
      <Card className="p-4 bg-gray-800/50 border-gray-700">
        <ToggleSwitch
          enabled={general.appLock}
          onChange={(val) => updateGeneralSettings({ appLock: val })}
          label="App Lock"
          description="Secure your business access with a lock screen"
        />
      </Card>
    </div>
  );

  // Render My Account Settings
  const renderMyAccountSettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">My Account</h2>

      <Card className="p-6 bg-gray-800/50 border-gray-700">
        <h3 className="text-white font-medium mb-4">Basic Information</h3>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Your Name</label>
              <Input
                value={accountForm.name}
                onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Your Phone Number</label>
              <div className="flex">
                <span className="bg-gray-700 border border-gray-600 border-r-0 rounded-l-lg px-3 py-2 text-gray-400 flex items-center">
                  🇳🇵 +977
                </span>
                <Input
                  value={accountForm.phone}
                  onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white rounded-l-none flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Your Email</label>
              <Input
                type="email"
                value={accountForm.email}
                onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                placeholder="Enter your Email"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Profile Photo */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {accountForm.photo ? (
                <img
                  src={accountForm.photo}
                  alt="Profile"
                  className="w-28 h-28 rounded-lg object-cover bg-gray-700"
                />
              ) : (
                <div className="w-28 h-28 rounded-lg bg-gray-700 flex items-center justify-center">
                  <FiUser className="w-12 h-12 text-gray-500" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              Upload Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
          >
            <FiLogOut className="w-4 h-4" />
            Log Out
          </button>
          <Button onClick={handleUpdateAccount} className="bg-emerald-500 hover:bg-emerald-600">
            Update Account
          </Button>
        </div>
      </Card>
    </div>
  );

  // Render Business Profile Settings
  const renderBusinessProfileSettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Business Profile</h2>

      <Card className="p-6 bg-gray-800/50 border-gray-700">
        {/* Basic Information */}
        <h3 className="text-white font-medium mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="md:col-span-1">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Business Name</label>
                <Input
                  value={businessForm.businessName}
                  onChange={(e) => setBusinessForm({ ...businessForm, businessName: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Business Contact Number</label>
                <Input
                  value={businessForm.businessContactNumber}
                  onChange={(e) => setBusinessForm({ ...businessForm, businessContactNumber: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Business Email</label>
                <Input
                  type="email"
                  value={businessForm.businessEmail}
                  onChange={(e) => setBusinessForm({ ...businessForm, businessEmail: e.target.value })}
                  placeholder="Enter your business email"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Business Category</label>
                  <select
                    value={businessForm.businessCategory}
                    onChange={(e) => setBusinessForm({ ...businessForm, businessCategory: e.target.value })}
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-lg px-3 py-2"
                  >
                    <option value="">Select Category</option>
                    {businessCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Business Type</label>
                  <select
                    value={businessForm.businessType}
                    onChange={(e) => setBusinessForm({ ...businessForm, businessType: e.target.value })}
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-lg px-3 py-2"
                  >
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-start">
            <div className="relative">
              {businessForm.businessLogo ? (
                <img
                  src={businessForm.businessLogo}
                  alt="Business Logo"
                  className="w-28 h-28 rounded-lg object-cover bg-gray-700"
                />
              ) : (
                <div className="w-28 h-28 rounded-lg bg-gray-700 flex items-center justify-center">
                  <FiBriefcase className="w-12 h-12 text-gray-500" />
                </div>
              )}
            </div>
            <button
              onClick={() => businessLogoRef.current?.click()}
              className="mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              Upload Photo
            </button>
            <input
              ref={businessLogoRef}
              type="file"
              accept="image/*"
              onChange={handleBusinessLogoUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Address Information */}
        <h3 className="text-white font-medium mb-4 pt-4 border-t border-gray-700">Address Information</h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Province</label>
            <select
              value={businessForm.province}
              onChange={(e) => setBusinessForm({ ...businessForm, province: e.target.value, district: '', municipality: '' })}
              className="w-full bg-gray-700 text-white border-gray-600 rounded-lg px-3 py-2"
            >
              <option value="">Select Province</option>
              {provinces.map((prov) => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">District</label>
            <select
              value={businessForm.district}
              onChange={(e) => setBusinessForm({ ...businessForm, district: e.target.value })}
              className="w-full bg-gray-700 text-white border-gray-600 rounded-lg px-3 py-2"
              disabled={!businessForm.province}
            >
              <option value="">Select District</option>
              {businessForm.province && districtsByProvince[businessForm.province]?.map((dist) => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Municipality</label>
            <Input
              value={businessForm.municipality}
              onChange={(e) => setBusinessForm({ ...businessForm, municipality: e.target.value })}
              placeholder="Enter municipality"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Street Address</label>
            <Input
              value={businessForm.streetAddress}
              onChange={(e) => setBusinessForm({ ...businessForm, streetAddress: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>

        {/* Financial Information */}
        <h3 className="text-white font-medium mb-4 pt-4 border-t border-gray-700">Financial Information</h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Registration Number</label>
            <Input
              value={businessForm.registrationNumber}
              onChange={(e) => setBusinessForm({ ...businessForm, registrationNumber: e.target.value })}
              placeholder="Enter registration number"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Bank Account</label>
            <button
              onClick={() => setShowBankModal(true)}
              className="w-full bg-gray-700 text-left text-emerald-400 border border-gray-600 rounded-lg px-3 py-2 hover:bg-gray-600 transition-colors flex items-center justify-between"
            >
              <span>Total {businessProfile.bankAccounts.length} Bank Accounts</span>
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleUpdateBusinessProfile} className="bg-emerald-500 hover:bg-emerald-600 px-8">
            Save Details
          </Button>
        </div>

        {/* Danger Area */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={() => setDangerExpanded(!dangerExpanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-gray-400 font-medium">Danger Area</span>
            {dangerExpanded ? <FiChevronDown className="w-4 h-4 text-gray-400" /> : <FiChevronRight className="w-4 h-4 text-gray-400" />}
          </button>

          {dangerExpanded && (
            <div className="mt-4 space-y-3">
              <button className="w-full flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors text-left">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FiFileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Close Fiscal Year</p>
                  <p className="text-gray-400 text-sm">This business will be archived & a new profile will be created by carrying forward old balance as opening balance.</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors text-left">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <FiArchive className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Archive Business Profile</p>
                  <p className="text-gray-400 text-sm">This business profile will be inactive but you will be able to access all data in read-only mode.</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors text-left">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <FiTrash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-red-400 font-medium">Delete Business Profile</p>
                  <p className="text-gray-400 text-sm">Your business profile will be deleted permanently</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  // Render Subscription Settings
  const renderSubscriptionSettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Subscription</h2>

      <Card className="p-6 bg-gray-800/50 border-gray-700">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCreditCard className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Free Plan</h3>
          <p className="text-gray-400 mb-4">You are currently on the free plan</p>
          <div className="bg-gray-700/50 rounded-lg p-4 max-w-md mx-auto mb-6">
            <h4 className="text-white font-medium mb-2">Included Features:</h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>✓ Basic Inventory Management</li>
              <li>✓ Basic Billing & Invoicing</li>
              <li>✓ Basic Reports</li>
              <li>✓ Up to 100 Products</li>
              <li>✓ Up to 50 Parties</li>
            </ul>
          </div>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            Upgrade to Pro
          </Button>
        </div>
      </Card>
    </div>
  );

  // Render Party Settings
  const renderPartySettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Party Settings</h2>

      <Card className="p-4 bg-gray-800/50 border-gray-700 space-y-4">
        <ToggleSwitch
          enabled={featureSettings.parties.partyCategory}
          onChange={(val) => updatePartySettings({ partyCategory: val })}
          label="Party Category"
          description="Enable Party Category to effortlessly manage parties"
        />
        <ToggleSwitch
          enabled={featureSettings.parties.uploadPartyImage}
          onChange={(val) => updatePartySettings({ uploadPartyImage: val })}
          label="Upload Party Image"
          description="Enable party image uploads to recognize parties easily"
        />
      </Card>
    </div>
  );

  // Render Inventory Settings
  const renderInventorySettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Inventory Settings</h2>

      <Card className="p-4 bg-gray-800/50 border-gray-700 space-y-4">
        <ToggleSwitch
          enabled={featureSettings.inventory.enableBarcode}
          onChange={(val) => updateInventorySettings({ enableBarcode: val })}
          label="Enable Barcode"
          description="Scan and manage products using barcodes"
        />
        <ToggleSwitch
          enabled={featureSettings.inventory.enableSKU}
          onChange={(val) => updateInventorySettings({ enableSKU: val })}
          label="Enable SKU"
          description="Use Stock Keeping Units for product identification"
        />
        <ToggleSwitch
          enabled={featureSettings.inventory.lowStockAlert}
          onChange={(val) => updateInventorySettings({ lowStockAlert: val })}
          label="Low Stock Alert"
          description="Get notified when stock falls below threshold"
        />
        {featureSettings.inventory.lowStockAlert && (
          <div className="pl-4">
            <label className="block text-gray-400 text-sm mb-1">Low Stock Threshold</label>
            <Input
              type="number"
              value={featureSettings.inventory.lowStockThreshold}
              onChange={(e) => updateInventorySettings({ lowStockThreshold: parseInt(e.target.value) || 10 })}
              className="bg-gray-700 border-gray-600 text-white w-32"
            />
          </div>
        )}
        <ToggleSwitch
          enabled={featureSettings.inventory.enableCategories}
          onChange={(val) => updateInventorySettings({ enableCategories: val })}
          label="Enable Categories"
          description="Organize products into categories"
        />
        <ToggleSwitch
          enabled={featureSettings.inventory.trackCostPrice}
          onChange={(val) => updateInventorySettings({ trackCostPrice: val })}
          label="Track Cost Price"
          description="Record cost price for profit calculation"
        />
      </Card>
    </div>
  );

  // Render Transaction Settings
  const renderTransactionSettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Transaction Settings</h2>

      <Card className="p-4 bg-gray-800/50 border-gray-700 space-y-4">
        <ToggleSwitch
          enabled={featureSettings.transactions.autoGenerateInvoiceNumber}
          onChange={(val) => updateTransactionSettings({ autoGenerateInvoiceNumber: val })}
          label="Auto-generate Invoice Number"
          description="Automatically generate unique invoice numbers"
        />
        <div className="py-3 px-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Default Payment Method</p>
              <p className="text-gray-400 text-sm">Set the default payment method for transactions</p>
            </div>
            <select
              value={featureSettings.transactions.defaultPaymentMethod}
              onChange={(e) => updateTransactionSettings({ defaultPaymentMethod: e.target.value })}
              className="bg-gray-700 text-white border-gray-600 rounded-lg px-3 py-2"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="credit">Credit</option>
            </select>
          </div>
        </div>
        <ToggleSwitch
          enabled={featureSettings.transactions.enablePaymentReminders}
          onChange={(val) => updateTransactionSettings({ enablePaymentReminders: val })}
          label="Payment Reminders"
          description="Send payment reminders for due invoices"
        />
        {featureSettings.transactions.enablePaymentReminders && (
          <div className="pl-4">
            <label className="block text-gray-400 text-sm mb-1">Reminder Days Before Due</label>
            <Input
              type="number"
              value={featureSettings.transactions.reminderDays}
              onChange={(e) => updateTransactionSettings({ reminderDays: parseInt(e.target.value) || 7 })}
              className="bg-gray-700 border-gray-600 text-white w-32"
            />
          </div>
        )}
        <ToggleSwitch
          enabled={featureSettings.transactions.showSignature}
          onChange={(val) => updateTransactionSettings({ showSignature: val })}
          label="Show Signature"
          description="Display signature field on invoices"
        />
      </Card>
    </div>
  );

  // Render Invoice Print Settings
  const renderInvoicePrintSettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Invoice Print Settings</h2>

      <Card className="p-4 bg-gray-800/50 border-gray-700 space-y-4">
        <div className="py-3 px-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Paper Size</p>
              <p className="text-gray-400 text-sm">Select the default paper size for printing</p>
            </div>
            <select
              value={featureSettings.invoicePrint.paperSize}
              onChange={(e) => updateInvoicePrintSettings({ paperSize: e.target.value as 'A4' | 'A5' | 'thermal' })}
              className="bg-gray-700 text-white border-gray-600 rounded-lg px-3 py-2"
            >
              <option value="A4">A4</option>
              <option value="A5">A5</option>
              <option value="thermal">Thermal (80mm)</option>
            </select>
          </div>
        </div>
        <ToggleSwitch
          enabled={featureSettings.invoicePrint.showLogo}
          onChange={(val) => updateInvoicePrintSettings({ showLogo: val })}
          label="Show Logo"
          description="Display business logo on invoices"
        />
        <ToggleSwitch
          enabled={featureSettings.invoicePrint.showBusinessDetails}
          onChange={(val) => updateInvoicePrintSettings({ showBusinessDetails: val })}
          label="Show Business Details"
          description="Display business name, address, and contact"
        />
        <ToggleSwitch
          enabled={featureSettings.invoicePrint.showCustomerDetails}
          onChange={(val) => updateInvoicePrintSettings({ showCustomerDetails: val })}
          label="Show Customer Details"
          description="Display customer information on invoices"
        />
        <ToggleSwitch
          enabled={featureSettings.invoicePrint.showPaymentInfo}
          onChange={(val) => updateInvoicePrintSettings({ showPaymentInfo: val })}
          label="Show Payment Info"
          description="Display payment details and bank information"
        />
        <div className="py-3 px-4 bg-gray-800/50 rounded-lg">
          <label className="block text-white font-medium mb-1">Footer Text</label>
          <p className="text-gray-400 text-sm mb-2">Custom text to display at the bottom of invoices</p>
          <Input
            value={featureSettings.invoicePrint.footerText}
            onChange={(e) => updateInvoicePrintSettings({ footerText: e.target.value })}
            placeholder="Thank you for your business!"
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
        <div className="py-3 px-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Print Copies</p>
              <p className="text-gray-400 text-sm">Number of copies to print by default</p>
            </div>
            <Input
              type="number"
              min={1}
              max={5}
              value={featureSettings.invoicePrint.printCopies}
              onChange={(e) => updateInvoicePrintSettings({ printCopies: parseInt(e.target.value) || 1 })}
              className="bg-gray-700 border-gray-600 text-white w-20"
            />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'my-account':
        return renderMyAccountSettings();
      case 'business-profile':
        return renderBusinessProfileSettings();
      case 'subscription':
        return renderSubscriptionSettings();
      case 'parties':
        return renderPartySettings();
      case 'inventory':
        return renderInventorySettings();
      case 'transactions':
        return renderTransactionSettings();
      case 'invoice-print':
        return renderInvoicePrintSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Success Message */}
      {success && (
        <div className="fixed top-4 right-4 z-50 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm font-medium animate-in slide-in-from-top duration-300">
          <FiCheck className="inline-block w-4 h-4 mr-2" />
          {success}
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-gray-800/50 border-r border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <h1 className="text-xl font-semibold text-white">Settings</h1>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setFeatureSettingsExpanded(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Feature Settings with submenu */}
            <div>
              <button
                onClick={() => setFeatureSettingsExpanded(!featureSettingsExpanded)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-left ${
                  featureSettingsExpanded || ['parties', 'inventory', 'transactions', 'invoice-print'].includes(activeSection)
                    ? 'bg-gray-700/50 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiSettings className="w-5 h-5" />
                  <span>Feature Settings</span>
                </div>
                {featureSettingsExpanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
              </button>

              {featureSettingsExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {featureSettingsItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left text-sm ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Bank Account Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingBank ? 'Edit Bank Account' : 'Bank Accounts'}
              </h3>
              <button
                onClick={() => {
                  setShowBankModal(false);
                  setEditingBank(null);
                  setBankForm({ bankName: '', accountNumber: '', accountHolderName: '', branch: '', isPrimary: false });
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {!editingBank && businessProfile.bankAccounts.length > 0 && (
              <div className="space-y-2 mb-4">
                {businessProfile.bankAccounts.map((bank) => (
                  <div key={bank.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{bank.bankName}</p>
                      <p className="text-gray-400 text-sm">{bank.accountNumber}</p>
                      {bank.isPrimary && (
                        <span className="text-xs text-emerald-400">Primary Account</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditBank(bank)}
                        className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteBank(bank.id)}
                        className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Bank Name</label>
                <Input
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  placeholder="Enter bank name"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Account Number</label>
                <Input
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  placeholder="Enter account number"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Account Holder Name</label>
                <Input
                  value={bankForm.accountHolderName}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                  placeholder="Enter account holder name"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Branch (Optional)</label>
                <Input
                  value={bankForm.branch}
                  onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })}
                  placeholder="Enter branch name"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={bankForm.isPrimary}
                  onChange={(e) => setBankForm({ ...bankForm, isPrimary: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-emerald-500"
                />
                <label htmlFor="isPrimary" className="text-gray-400 text-sm">Set as primary account</label>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBankModal(false);
                    setEditingBank(null);
                    setBankForm({ bankName: '', accountNumber: '', accountHolderName: '', branch: '', isPrimary: false });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveBankAccount}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  disabled={!bankForm.bankName || !bankForm.accountNumber || !bankForm.accountHolderName}
                >
                  {editingBank ? 'Update' : 'Add Account'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
