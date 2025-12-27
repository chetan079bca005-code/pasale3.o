import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore, Transaction, Expense, Party } from '../../store/dataStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import {
  FiX,
  FiShoppingCart,
  FiTrendingUp,
  FiTrendingDown,
  FiPlus,
  FiTrash2,
  FiFileText,
  FiUser,
  FiPackage,
  FiCalendar,
  FiPercent,
  FiTag,
  FiCheckCircle,
  FiAlertCircle,
  FiCreditCard,
  FiTruck,
  FiHash,
} from 'react-icons/fi';
import { NepaliRupeeIcon } from '../ui/NepaliRupeeIcon';
import { useTranslation } from '../../utils/i18n';

interface AddNewDialogProps {
  onClose: () => void;
}

type DialogType = 'purchase' | 'selling' | 'expense' | null;
type PaymentStatus = 'paid' | 'partial' | 'unpaid';
type PaymentMethod = 'cash' | 'bank' | 'credit' | 'upi';

interface TransactionItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;
  tax: number;
  total: number;
}

const expenseCategories = [
  { id: 'rent', label: 'Rent', icon: '🏠' },
  { id: 'utilities', label: 'Utilities', icon: '💡' },
  { id: 'salary', label: 'Salary/Wages', icon: '💰' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'office', label: 'Office Supplies', icon: '📎' },
  { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { id: 'marketing', label: 'Marketing', icon: '📢' },
  { id: 'insurance', label: 'Insurance', icon: '🛡️' },
  { id: 'taxes', label: 'Taxes & Fees', icon: '📋' },
  { id: 'other', label: 'Other', icon: '📦' },
];

const units = ['pcs', 'kg', 'ltr', 'mtr', 'box', 'dozen', 'set', 'unit'];

export const AddNewDialog: React.FC<AddNewDialogProps> = ({ onClose }) => {
  const { t, c } = useTranslation();
  const navigate = useNavigate();
  const { addTransaction, addExpense, parties, addParty } = useDataStore();

  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Transaction form state
  const [partyId, setPartyId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<TransactionItem[]>([
    { id: '1', name: '', quantity: 1, unit: 'pcs', rate: 0, discount: 0, tax: 0, total: 0 },
  ]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState('0');
  const [notes, setNotes] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCharges, setShippingCharges] = useState('0');
  const [referenceNumber, setReferenceNumber] = useState('');

  // Quick add party
  const [showAddParty, setShowAddParty] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyPhone, setNewPartyPhone] = useState('');

  // Expense form state
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<PaymentMethod>('cash');
  const [isNecessary, setIsNecessary] = useState(true);
  const [isRecurring, setIsRecurring] = useState(false);
  const [vendor, setVendor] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  // Calculate totals
  const calculateItemTotal = (item: TransactionItem) => {
    const subtotal = item.quantity * item.rate;
    const discountAmount = subtotal * (item.discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (item.tax / 100);
    return afterDiscount + taxAmount;
  };

  const updateItemTotal = (index: number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index].total = calculateItemTotal(updated[index]);
      return updated;
    });
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const totalDiscount = items.reduce(
    (sum, item) => sum + item.quantity * item.rate * (item.discount / 100),
    0
  );
  const totalTax = items.reduce((sum, item) => {
    const afterDiscount = item.quantity * item.rate * (1 - item.discount / 100);
    return sum + afterDiscount * (item.tax / 100);
  }, 0);
  const grandTotal = subtotal - totalDiscount + totalTax + parseFloat(shippingCharges || '0');
  const balanceDue = grandTotal - parseFloat(amountPaid || '0');

  useEffect(() => {
    items.forEach((_, index) => updateItemTotal(index));
  }, [items]);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        name: '',
        quantity: 1,
        unit: 'pcs',
        rate: 0,
        discount: 0,
        tax: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof TransactionItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          updated.total = calculateItemTotal(updated);
          return updated;
        }
        return item;
      })
    );
  };

  const handleAddParty = () => {
    if (!newPartyName.trim()) return;

    const newParty: Party = {
      id: Date.now().toString(),
      name: newPartyName.trim(),
      type: dialogType === 'purchase' ? 'supplier' : 'customer',
      phone: newPartyPhone || undefined,
      balance: 0,
    };
    addParty(newParty);
    setPartyId(newParty.id);
    setShowAddParty(false);
    setNewPartyName('');
    setNewPartyPhone('');
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!partyId) {
      setError(t('validation.required') + ': ' + t('parties.party'));
      return;
    }

    if (items.some((item) => !item.name || item.rate <= 0)) {
      setError(t('validation.required') + ': Item details');
      return;
    }

    const selectedParty = parties.find((p) => p.id === partyId);
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: dialogType!,
      amount: grandTotal,
      date: new Date(transactionDate).toISOString(),
      description: items.map((i) => i.name).join(', '),
      partyId,
      partyName: selectedParty?.name,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.rate,
        total: item.total,
      })),
    };

    addTransaction(transaction);
    setSuccess(true);

    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!expenseCategory || !expenseAmount) {
      setError(t('validation.required'));
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      category: expenseCategory,
      amount: parseFloat(expenseAmount),
      date: new Date(expenseDate).toISOString(),
      description: expenseDescription,
      isNecessary,
    };

    addExpense(expense);
    setSuccess(true);

    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleCreateBill = () => {
    if (!partyId) {
      setError('Please select a party first');
      return;
    }
    navigate(`/billing?partyId=${partyId}`);
    onClose();
  };

  const resetForm = () => {
    setDialogType(null);
    setPartyId('');
    setItems([{ id: '1', name: '', quantity: 1, unit: 'pcs', rate: 0, discount: 0, tax: 0, total: 0 }]);
    setPaymentStatus('unpaid');
    setAmountPaid('0');
    setNotes('');
    setExpenseCategory('');
    setExpenseAmount('');
    setExpenseDescription('');
    setIsNecessary(true);
    setError('');
    setSuccess(false);
  };

  // Type Selection Screen
  if (!dialogType) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <Card className="w-full max-w-lg p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t('addNew.title')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {t('addNew.selectType')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setDialogType('purchase')}
              className="group flex items-center gap-4 p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <FiShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                  {t('addNew.purchase')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('sidebar.recordPurchase')}
                </p>
              </div>
              <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <FiPlus className="w-6 h-6" />
              </div>
            </button>

            <button
              onClick={() => setDialogType('selling')}
              className="group flex items-center gap-4 p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="w-14 h-14 bg-linear-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <FiTrendingUp className="w-7 h-7 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                  {t('addNew.sale')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('sidebar.recordSale')}
                </p>
              </div>
              <div className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <FiPlus className="w-6 h-6" />
              </div>
            </button>

            <button
              onClick={() => setDialogType('expense')}
              className="group flex items-center gap-4 p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="w-14 h-14 bg-linear-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <FiTrendingDown className="w-7 h-7 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                  {t('addNew.expense')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('sidebar.recordExpense')}
                </p>
              </div>
              <div className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <FiPlus className="w-6 h-6" />
              </div>
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Expense Form
  if (dialogType === 'expense') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <Card className="w-full max-w-2xl p-0 max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-linear-to-r from-red-500 to-red-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FiTrendingDown className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{t('sidebar.addExpense')}</h2>
                  <p className="text-red-100 text-sm">{t('expense.trackExpenses')}</p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {success && (
            <div className="m-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 flex items-center gap-3 animate-in slide-in-from-top-2">
              <FiCheckCircle className="w-5 h-5" />
              <span className="font-medium">{t('messages.addSuccess')}</span>
            </div>
          )}

          <form onSubmit={handleExpenseSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                <FiTag className="w-4 h-4 inline mr-2" />
                {t('expense.category')} *
              </label>
              <div className="grid grid-cols-5 gap-2">
                {expenseCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setExpenseCategory(cat.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      expenseCategory === cat.id
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 scale-105'
                        : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{cat.icon}</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  <NepaliRupeeIcon className="w-4 h-4 inline mr-2" />
                  {t('common.amount')} *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    रु.
                  </span>
                  <input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg font-semibold"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  <FiCalendar className="w-4 h-4 inline mr-2" />
                  {t('common.date')} *
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                <FiCreditCard className="w-4 h-4 inline mr-2" />
                {t('billing.paymentMethod')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['cash', 'bank', 'credit', 'upi'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setExpensePaymentMethod(method)}
                    className={`p-3 rounded-xl border-2 font-medium capitalize transition-all ${
                      expensePaymentMethod === method
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {method === 'upi' ? 'UPI' : method}
                  </button>
                ))}
              </div>
            </div>

            {/* Vendor and Receipt */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  <FiUser className="w-4 h-4 inline mr-2" />
                  {t('expense.vendor')}
                </label>
                <input
                  type="text"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={t('expense.vendorPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  <FiHash className="w-4 h-4 inline mr-2" />
                  {t('expense.receiptNumber')}
                </label>
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="REC-001"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                📝 {t('common.description')}
              </label>
              <textarea
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={2}
                placeholder={t('expense.descriptionPlaceholder')}
              />
            </div>

            {/* Checkboxes */}
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNecessary}
                  onChange={(e) => setIsNecessary(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ✓ {t('expense.necessary')}
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  🔄 {t('expense.recurring')}
                </span>
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-3">
                <FiAlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="submit"
                className="flex-1 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3"
              >
                <FiPlus className="w-5 h-5 mr-2" />
                {t('sidebar.addExpense')}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="px-6">
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // Purchase/Sale Form
  const isPurchase = dialogType === 'purchase';
  const colorTheme = isPurchase ? 'blue' : 'green';
  const filteredParties = parties.filter((p) => p.type === (isPurchase ? 'supplier' : 'customer'));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-4xl p-0 max-h-[95vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div
          className={`bg-linear-to-r ${
            isPurchase ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600'
          } p-6 text-white`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                {isPurchase ? (
                  <FiShoppingCart className="w-6 h-6" />
                ) : (
                  <FiTrendingUp className="w-6 h-6" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isPurchase ? t('sidebar.addPurchase') : t('sidebar.addSelling')}
                </h2>
                <p className={`${isPurchase ? 'text-blue-100' : 'text-green-100'} text-sm`}>
                  {isPurchase ? t('addNew.purchaseDesc') : t('addNew.saleDesc')}
                </p>
              </div>
            </div>
            <button
              onClick={resetForm}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {success && (
          <div className="m-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 flex items-center gap-3 animate-in slide-in-from-top-2">
            <FiCheckCircle className="w-5 h-5" />
            <span className="font-medium">{t('messages.addSuccess')}</span>
          </div>
        )}

        <form
          onSubmit={handleTransactionSubmit}
          className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-180px)]"
        >
          {/* Party Selection and Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Party Selection */}
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                <FiUser className="w-4 h-4 inline mr-2" />
                {isPurchase ? t('parties.supplier') : t('parties.customer')} *
              </label>
              {showAddParty ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newPartyName}
                    onChange={(e) => setNewPartyName(e.target.value)}
                    placeholder={t('parties.name')}
                    className="w-full px-3 py-2 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    value={newPartyPhone}
                    onChange={(e) => setNewPartyPhone(e.target.value)}
                    placeholder={t('parties.phone')}
                    className="w-full px-3 py-2 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={handleAddParty} className="flex-1">
                      {t('common.save')}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAddParty(false)}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={partyId}
                    onChange={(e) => setPartyId(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">{t('sidebar.selectParty')}</option>
                    {filteredParties.map((party) => (
                      <option key={party.id} value={party.id}>
                        {party.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddParty(true)}
                    className="p-3 border-2 rounded-xl border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <FiPlus className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Invoice Number */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                <FiFileText className="w-4 h-4 inline mr-2" />
                {t('billing.invoiceNumber')}
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                <FiCalendar className="w-4 h-4 inline mr-2" />
                {t('common.date')} *
              </label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FiPackage className="w-5 h-5" />
                {t('billing.items')}
              </h3>
              <Button type="button" size="sm" variant="outline" onClick={addItem}>
                <FiPlus className="w-4 h-4 mr-1" /> {t('billing.addItem')}
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      {t('billing.itemName')}
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase w-20">
                      {t('common.quantity')}
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase w-20">
                      {t('common.unit')}
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase w-24">
                      {t('common.rate')}
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase w-20">
                      {t('common.discount')} %
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase w-20">
                      {t('common.tax')} %
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase w-28">
                      {t('common.total')}
                    </th>
                    <th className="px-2 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={t('billing.itemName')}
                          required
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          min="1"
                          required
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                          className="w-full px-2 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {units.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                          placeholder="0"
                          required
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.discount}
                          onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.tax}
                          onChange={(e) => updateItem(item.id, 'tax', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          min="0"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-gray-100">
                        {c(item.total)}
                      </td>
                      <td className="px-2 py-2">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals and Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  <FiCreditCard className="w-4 h-4 inline mr-2" />
                  {t('billing.paymentStatus')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['paid', 'partial', 'unpaid'] as PaymentStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setPaymentStatus(status)}
                      className={`p-3 rounded-xl border-2 font-medium capitalize transition-all ${
                        paymentStatus === status
                          ? status === 'paid'
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600'
                            : status === 'partial'
                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600'
                            : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {paymentStatus !== 'unpaid' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      {t('billing.paymentMethod')}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['cash', 'bank', 'credit', 'upi'] as PaymentMethod[]).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`p-2 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                            paymentMethod === method
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
                      {t('billing.amountPaid')}
                    </label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  📝 {t('common.notes')}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                  placeholder={t('billing.notesPlaceholder')}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">
                {t('billing.summary')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('common.subtotal')}</span>
                  <span>{c(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('common.discount')}</span>
                  <span className="text-red-500">-{c(totalDiscount)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('common.tax')}</span>
                  <span>+{c(totalTax)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('billing.shipping')}</span>
                  <span>+{c(parseFloat(shippingCharges || '0'))}</span>
                </div>
                <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100">
                    <span>{t('common.total')}</span>
                    <span>{c(grandTotal)}</span>
                  </div>
                </div>
                {paymentStatus !== 'paid' && (
                  <div
                    className={`flex justify-between font-semibold ${
                      balanceDue > 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    <span>{t('billing.balanceDue')}</span>
                    <span>{c(balanceDue)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-3">
              <FiAlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              className={`flex-1 bg-linear-to-r ${
                isPurchase ? 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' : 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
              } text-white font-bold py-3`}
            >
              <FiPlus className="w-5 h-5 mr-2" />
              {isPurchase ? t('sidebar.addPurchase') : t('sidebar.addSelling')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCreateBill}
              className="px-6 border-2"
              disabled={!partyId}
            >
              <FiFileText className="w-5 h-5 mr-2" />
              {t('billing.createBill')}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm} className="px-6">
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

