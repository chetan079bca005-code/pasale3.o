import React, { useState } from 'react';
import { useDataStore, Party } from '../../store/dataStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import {
  FiX,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiTag,
  FiCheckCircle,
  FiAlertCircle,
  FiTruck,
  FiShoppingBag,
  FiCreditCard,
  FiCalendar,
  FiFileText,
  FiHash,
  FiGlobe,
  FiHome,
  FiBriefcase,
} from 'react-icons/fi';
import { NepaliRupeeIcon } from '../ui/NepaliRupeeIcon';
import { useTranslation } from '../../utils/i18n';

interface AddPartyDialogProps {
  onClose: () => void;
  initialData?: Party;
  isEdit?: boolean;
  defaultType?: 'customer' | 'supplier';
}

export const AddPartyDialog: React.FC<AddPartyDialogProps> = ({
  onClose,
  initialData,
  isEdit = false,
  defaultType,
}) => {
  const { t } = useTranslation();
  const { addParty, updateParty } = useDataStore();

  // Common fields
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: (initialData?.type || defaultType || 'customer') as 'customer' | 'supplier',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    // Customer specific
    customerCode: '',
    dateOfBirth: '',
    anniversary: '',
    loyaltyPoints: '0',
    preferredPayment: 'cash' as 'cash' | 'credit' | 'upi' | 'bank',
    referredBy: '',
    // Supplier specific
    supplierCode: '',
    companyName: '',
    gstNumber: '',
    panNumber: '',
    bankName: '',
    bankAccount: '',
    ifscCode: '',
    paymentTerms: 'net30',
    leadTime: '',
    minOrderValue: '',
    // Common additional
    openingBalance: '0',
    creditLimit: '',
    notes: '',
    city: '',
    state: '',
    pincode: '',
    country: 'Nepal',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'financial' | 'additional'>('basic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError(t('validation.required') + ': ' + t('name'));
      return;
    }

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      setError(t('validation.invalidPhone'));
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError(t('validation.invalidEmail'));
      return;
    }

    if (isEdit && initialData) {
      const updatedParty: Party = {
        ...initialData,
        name: formData.name.trim(),
        type: formData.type,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
      };
      updateParty(updatedParty);
    } else {
      const newParty: Party = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        type: formData.type,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        balance: parseFloat(formData.openingBalance) || 0,
      };
      addParty(newParty);
    }

    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const isCustomer = formData.type === 'customer';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-3xl p-0 max-h-[95vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div
          className={`bg-linear-to-r ${
            isCustomer ? 'from-blue-500 to-blue-600' : 'from-purple-500 to-purple-600'
          } p-6 text-white`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                {isCustomer ? (
                  <FiUser className="w-7 h-7" />
                ) : (
                  <FiTruck className="w-7 h-7" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isEdit
                    ? t('editParty')
                    : isCustomer
                    ? t('addCustomer')
                    : t('addSupplier')}
                </h2>
                <p className={`${isCustomer ? 'text-blue-100' : 'text-purple-100'} text-sm`}>
                  {isCustomer ? t('customerDesc') : t('supplierDesc')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {success && (
          <div className="m-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 flex items-center gap-3 animate-in slide-in-from-top-2">
            <FiCheckCircle className="w-5 h-5" />
            <span className="font-medium">
              {t('partySuccess').replace('{action}', isEdit ? t('updated') : t('added'))}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Party Type Selection */}
          {!isEdit && !defaultType && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                <FiTag className="w-4 h-4 inline mr-2" />
                {t('type')} *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'customer' })}
                  className={`p-5 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    formData.type === 'customer'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-lg scale-[1.02]'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      formData.type === 'customer'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    <FiUser className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-gray-900 dark:text-gray-100 block">
                      👤 {t('customer')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('buyFromYou')}
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'supplier' })}
                  className={`p-5 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    formData.type === 'supplier'
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 shadow-lg scale-[1.02]'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-purple-400'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      formData.type === 'supplier'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    <FiTruck className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-gray-900 dark:text-gray-100 block">
                      🏢 {t('supplier')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('youBuyFrom')}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <div className="flex gap-1">
              {(['basic', 'financial', 'additional'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? `${
                          isCustomer
                            ? 'border-blue-500 text-blue-600'
                            : 'border-purple-500 text-purple-600'
                        }`
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab === 'basic' && '📋 ' + t('basicInfo')}
                  {tab === 'financial' && '💰 ' + t('financialInfo')}
                  {tab === 'additional' && '📝 ' + t('additionalInfo')}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <>
                {/* Name and Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <FiUser className="w-4 h-4 inline mr-2" />
                      {isCustomer ? t('customerName') : t('supplierName')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('enterName')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <FiHash className="w-4 h-4 inline mr-2" />
                      {isCustomer ? t('customerCode') : t('supplierCode')}
                    </label>
                    <input
                      type="text"
                      value={isCustomer ? formData.customerCode : formData.supplierCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [isCustomer ? 'customerCode' : 'supplierCode']: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={isCustomer ? 'CUST-001' : 'SUP-001'}
                    />
                  </div>
                </div>

                {/* Supplier: Company Name */}
                {!isCustomer && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <FiBriefcase className="w-4 h-4 inline mr-2" />
                      {t('companyName')}
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('companyNamePlaceholder')}
                    />
                  </div>
                )}

                {/* Phone and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <FiPhone className="w-4 h-4 inline mr-2" />
                      {t('phone')}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="9812345678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <FiMail className="w-4 h-4 inline mr-2" />
                      {t('email')}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                {/* Customer: Date of Birth and Anniversary */}
                {isCustomer && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        <FiCalendar className="w-4 h-4 inline mr-2" />
                        {t('dateOfBirth')}
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        <FiCalendar className="w-4 h-4 inline mr-2" />
                        {t('anniversary')}
                      </label>
                      <input
                        type="date"
                        value={formData.anniversary}
                        onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
                        className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Supplier: GST and PAN */}
                {!isCustomer && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        <FiFileText className="w-4 h-4 inline mr-2" />
                        {t('gstNumber')}
                      </label>
                      <input
                        type="text"
                        value={formData.gstNumber}
                        onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                        className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="GST Number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        <FiFileText className="w-4 h-4 inline mr-2" />
                        {t('panNumber')}
                      </label>
                      <input
                        type="text"
                        value={formData.panNumber}
                        onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                        className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="PAN Number"
                      />
                    </div>
                  </div>
                )}

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    <FiMapPin className="w-4 h-4 inline mr-2" />
                    {t('address')}
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                    placeholder={t('enterAddress')}
                  />
                </div>

                {/* City, State, Pincode */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <FiHome className="w-4 h-4 inline mr-2" />
                      {t('common.city')}
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Kathmandu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      {t('common.state')}
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Bagmati"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      {t('common.pincode')}
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="44600"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Financial Info Tab */}
            {activeTab === 'financial' && (
              <>
                {/* Opening Balance and Credit Limit */}
                <div
                  className={`${
                    isCustomer ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-purple-50 dark:bg-purple-900/20'
                  } p-6 rounded-xl border ${
                    isCustomer
                      ? 'border-blue-200 dark:border-blue-800'
                      : 'border-purple-200 dark:border-purple-800'
                  }`}
                >
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <NepaliRupeeIcon className="w-5 h-5" />
                    {t('balanceInfo')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        {t('ledger.openingBalance')}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                          रु.
                        </span>
                        <input
                          type="number"
                          value={formData.openingBalance}
                          onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {isCustomer ? t('amountOwed') : t('amountYouOwe')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        {t('creditLimit')}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                          रु.
                        </span>
                        <input
                          type="number"
                          value={formData.creditLimit}
                          onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={t('optional')}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer: Payment Preference and Loyalty */}
                {isCustomer && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        <FiCreditCard className="w-4 h-4 inline mr-2" />
                        {t('preferredPayment')}
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['cash', 'credit', 'upi', 'bank'] as const).map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setFormData({ ...formData, preferredPayment: method })}
                            className={`p-3 rounded-xl border-2 font-medium capitalize transition-all ${
                              formData.preferredPayment === method
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {method === 'upi' ? 'UPI' : method}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        ⭐ {t('loyaltyPoints')}
                      </label>
                      <input
                        type="number"
                        value={formData.loyaltyPoints}
                        onChange={(e) => setFormData({ ...formData, loyaltyPoints: e.target.value })}
                        className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}

                {/* Supplier: Bank Details */}
                {!isCustomer && (
                  <>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        🏦 {t('bankDetails')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                            {t('bankName')}
                          </label>
                          <input
                            type="text"
                            value={formData.bankName}
                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Bank Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                            {t('accountNumber')}
                          </label>
                          <input
                            type="text"
                            value={formData.bankAccount}
                            onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                            className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Account Number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                            {t('ifscCode')}
                          </label>
                          <input
                            type="text"
                            value={formData.ifscCode}
                            onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                            className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="IFSC Code"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                          {t('paymentTerms')}
                        </label>
                        <select
                          value={formData.paymentTerms}
                          onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                          className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="immediate">Immediate</option>
                          <option value="net15">Net 15 Days</option>
                          <option value="net30">Net 30 Days</option>
                          <option value="net45">Net 45 Days</option>
                          <option value="net60">Net 60 Days</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                          {t('leadTime')}
                        </label>
                        <input
                          type="text"
                          value={formData.leadTime}
                          onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
                          className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 7 days"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                          {t('minOrderValue')}
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                            रु.
                          </span>
                          <input
                            type="number"
                            value={formData.minOrderValue}
                            onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Additional Info Tab */}
            {activeTab === 'additional' && (
              <>
                {/* Customer: Referred By */}
                {isCustomer && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      👥 {t('referredBy')}
                    </label>
                    <input
                      type="text"
                      value={formData.referredBy}
                      onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('referredByPlaceholder')}
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    📝 {t('notesOptional')}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                    placeholder={t('addNotes')}
                  />
                </div>
              </>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-3">
                <FiAlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Button
              type="submit"
              className={`flex-1 bg-linear-to-r ${
                isCustomer
                  ? 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  : 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
              } text-white font-bold py-3`}
            >
              {isEdit ? (
                <>
                  <FiCheckCircle className="w-5 h-5 mr-2" />
                  {t('updateParty')}
                </>
              ) : (
                <>
                  <FiUser className="w-5 h-5 mr-2" />
                  {isCustomer ? t('addCustomer') : t('addSupplier')}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="px-8 border-2">
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

