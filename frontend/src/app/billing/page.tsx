import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../utils/i18n';
import { useDataStore, Transaction } from '../../store/dataStore';
import { useBusinessStore } from '../../store/businessStore';
import { formatCurrency } from '../../utils/nepaliDate';
import { Card } from '../../components/ui/Card';
import { KPICard } from '../../components/dashboard/KPICard';
import { Button } from '../../components/ui/Button';
import { BarcodeScanner } from '../../components/scanner/BarcodeScanner';
import { InvoiceList } from '../../components/billing/InvoiceList';
import { InvoiceDetail } from '../../components/billing/InvoiceDetail';
import {
  FiPlus,
  FiTrash2,
  FiFileText,
  FiPackage,
  FiShoppingCart,
  FiCheck,
  FiZap,
  FiEdit3,
  FiX,
  FiSearch,
  FiGrid,
  FiArrowLeft,
  FiHelpCircle,
  FiShare2,
  FiSave,
  FiDownload,
  FiPrinter,
  FiArrowUpRight,
} from 'react-icons/fi';

interface InvoiceItem {
  id: string;
  description: string;
  barcode?: string;
  quantity: number;
  rate: number;
  discount: number;
  tax: number;
  total: number;
}

// Product database with barcodes for POS scanning
const PRODUCT_DATABASE: Record<string, { name: string; price: number; stock: number }> = {
  '8901234567890': { name: 'Laptop Dell Inspiron 15', price: 65000, stock: 10 },
  '5901234123457': { name: 'Wireless Mouse Logitech', price: 1500, stock: 25 },
  '9876543210123': { name: 'USB-C Cable 2m', price: 500, stock: 50 },
  '1234567890128': { name: 'Monitor LG 24" FHD', price: 18000, stock: 8 },
  '7891011121314': { name: 'Keyboard Mechanical RGB', price: 4500, stock: 15 },
  '4561237890123': { name: 'Webcam HD 1080p', price: 3200, stock: 12 },
  '7654321098765': { name: 'Headphones Wireless', price: 2800, stock: 20 },
  '3216549870123': { name: 'Power Bank 20000mAh', price: 2500, stock: 30 },
  '9517534862013': { name: 'External HDD 1TB', price: 5500, stock: 18 },
  '1592637480123': { name: 'Gaming Mousepad XL', price: 800, stock: 40 },
};

type ViewMode = 'list' | 'create' | 'pos';

const termsOptions = [
  'Net 30 days',
  'Net 15 days',
  'Net 45 days',
  'Net 60 days',
  'Due on Receipt',
];

const taxOptions = [0, 5, 10, 13, 18];

export default function BillingPage() {
  const { t, c, n, language } = useTranslation();
  const { parties, transactions, addTransaction, addParty } = useDataStore();
  const { businessName, ownerName, panNumber } = useBusinessStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Helper function for formatting currency in print templates
  const formatRs = (amount: number) => {
    return language === 'np'
      ? `रु. ${amount.toLocaleString('ne-NP')}`
      : `Rs. ${amount.toLocaleString('en-IN')}`;
  };

  // View state
  const [view, setView] = useState<ViewMode>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, discount: 0, tax: 0, total: 0 },
  ]);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('Net 30 days');

  // POS specific state
  const [showScanner, setShowScanner] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  // Products list for quick selection
  const products = [
    { name: 'Laptop', price: 65000 },
    { name: 'Desktop Computer', price: 55000 },
    { name: 'Monitor', price: 18000 },
    { name: 'Keyboard', price: 2500 },
    { name: 'Mouse', price: 1500 },
    { name: 'USB Cable', price: 500 },
    { name: 'Power Supply', price: 8000 },
    { name: 'Software License', price: 15000 },
    { name: 'Hardware Repair', price: 3000 },
    { name: 'Installation Service', price: 2000 },
    { name: 'Consulting Service', price: 5000 },
    { name: 'Technical Support', price: 1500 },
  ];

  const customers = parties.filter((p) => p.type === 'customer');
  const selectedCustomer = customers.find((c) => c.id === customerId);

  // Get partyId and transactionId from URL params
  useEffect(() => {
    const partyIdParam = searchParams.get('partyId');
    const transactionIdParam = searchParams.get('transactionId');

    if (partyIdParam) {
      setCustomerId(partyIdParam);
      setView('create');
    }

    // If transactionId is provided, auto-populate the form with transaction data
    if (transactionIdParam) {
      const transaction = transactions.find(tx => tx.id === transactionIdParam);
      if (transaction) {
        // Set customer if partyId exists
        if (transaction.partyId) {
          setCustomerId(transaction.partyId);
        }

        // Set invoice date
        setInvoiceDate(transaction.date.split('T')[0]);

        // Set notes/description
        setNotes(transaction.description || '');

        // If transaction has items, populate them
        if (transaction.items && transaction.items.length > 0) {
          const invoiceItems: InvoiceItem[] = transaction.items.map((item, index) => ({
            id: item.id || `${index + 1}`,
            description: item.name,
            quantity: item.quantity,
            rate: item.price,
            discount: 0,
            tax: 13, // Default VAT
            total: item.total || (item.quantity * item.price),
          }));
          setItems(invoiceItems);
        } else {
          // If no items, create a single item from the transaction
          setItems([{
            id: '1',
            description: transaction.description || 'Product/Service',
            quantity: 1,
            rate: transaction.amount,
            discount: 0,
            tax: 0,
            total: transaction.amount,
          }]);
        }

        setView('create');
      }
    }
  }, [searchParams, transactions]);

  // Keyboard shortcut for scanner
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F2' && view !== 'list' && !showScanner) {
        setShowScanner(true);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [view, showScanner]);

  // Calculate item total
  const calculateItemTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.rate;
    const discountAmount = subtotal * (item.discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (item.tax / 100);
    return afterDiscount + taxAmount;
  };

  // Update item and recalculate total
  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          updated.total = calculateItemTotal(updated);
          return updated;
        }
        return item;
      })
    );
  };

  // Add new item row
  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: '',
        quantity: 1,
        rate: 0,
        discount: 0,
        tax: 0,
        total: 0,
      },
    ]);
  };

  // Remove item
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const totalDiscount = items.reduce(
    (sum, item) => sum + item.quantity * item.rate * (item.discount / 100),
    0
  );
  const totalTax = items.reduce((sum, item) => {
    const afterDiscount = item.quantity * item.rate * (1 - item.discount / 100);
    return sum + afterDiscount * (item.tax / 100);
  }, 0);
  const grandTotal = subtotal - totalDiscount + totalTax;

  // Handle barcode scan
  const handleBarcodeScanned = (barcode: string) => {
    const productInfo = PRODUCT_DATABASE[barcode];

    if (!productInfo) {
      alert(`Product with barcode ${barcode} not found in database`);
      return;
    }

    setLastScannedBarcode(barcode);

    const existingIndex = items.findIndex((p) => p.barcode === barcode);

    if (existingIndex !== -1) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = calculateItemTotal(updated[existingIndex]);
      setItems(updated);
    } else {
      const newItem: InvoiceItem = {
        id: barcode,
        barcode,
        description: productInfo.name,
        rate: productInfo.price,
        quantity: 1,
        discount: 0,
        tax: 13,
        total: productInfo.price * 1.13,
      };
      // Replace empty first row or add new
      if (items.length === 1 && !items[0].description) {
        setItems([newItem]);
      } else {
        setItems([...items, newItem]);
      }
    }

    setShowScanner(false);
  };

  // Add quick product for POS
  const addQuickProduct = (product: { name: string; price: number }) => {
    const existingIndex = items.findIndex((p) => p.description === product.name && !p.barcode);

    if (existingIndex !== -1) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = calculateItemTotal(updated[existingIndex]);
      setItems(updated);
    } else {
      const newItem: InvoiceItem = {
        id: Date.now().toString(),
        description: product.name,
        rate: product.price,
        quantity: 1,
        discount: 0,
        tax: 13,
        total: product.price * 1.13,
      };
      if (items.length === 1 && !items[0].description) {
        setItems([newItem]);
      } else {
        setItems([...items, newItem]);
      }
    }
  };

  // Update quantity for POS
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: newQuantity, total: calculateItemTotal({ ...item, quantity: newQuantity }) }
          : item
      )
    );
  };

  // Clear all items
  const clearAll = () => {
    if (items.length > 0 && window.confirm('Clear all items?')) {
      setItems([{ id: '1', description: '', quantity: 1, rate: 0, discount: 0, tax: 0, total: 0 }]);
      setLastScannedBarcode('');
    }
  };

  // Add new customer
  const handleAddCustomer = () => {
    if (!newCustomerName.trim()) return;

    const newCustomer = {
      id: `cust-${Date.now()}`,
      name: newCustomerName,
      phone: newCustomerPhone,
      type: 'customer' as const,
      balance: 0,
    };

    addParty(newCustomer);
    setCustomerId(newCustomer.id);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setShowAddCustomer(false);
  };

  // Save invoice
  const handleSave = (share: boolean = false) => {
    const validItems = items.filter((item) => item.description && item.rate > 0);
    if (validItems.length === 0) {
      alert('Please add at least one item with description and rate');
      return;
    }

    addTransaction({
      id: invoiceNumber,
      type: 'selling',
      amount: grandTotal,
      date: new Date(invoiceDate).toISOString(),
      description: `Invoice ${invoiceNumber}`,
      partyId: customerId || undefined,
      partyName: selectedCustomer?.name || 'Walk-in Customer',
      items: validItems.map((item) => ({
        id: item.id,
        name: item.description,
        quantity: item.quantity,
        price: item.rate,
        total: item.total,
      })),
    });

    if (share) {
      alert(`Invoice ${invoiceNumber} saved and ready to share!`);
    } else {
      alert(`Invoice ${invoiceNumber} saved successfully!`);
    }

    resetForm();
    setView('list');
  };

  const resetForm = () => {
    setItems([{ id: '1', description: '', quantity: 1, rate: 0, discount: 0, tax: 0, total: 0 }]);
    setCustomerId('');
    setInvoiceNumber(`INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`);
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setTerms('Net 30 days');
    setLastScannedBarcode('');
  };

  const handleNewInvoice = () => {
    resetForm();
    setView('create');
  };

  const handleNewPOS = () => {
    resetForm();
    setView('pos');
  };

  const handleViewInvoice = (invoice: Transaction) => {
    setSelectedInvoice(invoice);
  };

  const handleCloseInvoiceDetail = () => {
    setSelectedInvoice(null);
  };

  // Print invoice function
  const handlePrint = () => {
    const validItems = items.filter((item) => item.description && item.rate > 0);
    if (validItems.length === 0) {
      alert('Please add at least one item before printing');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print invoice');
      return;
    }

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1f2937; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .logo { width: 50px; height: 50px; background: #2563eb; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; }
          .invoice-title { text-align: right; }
          .invoice-title h1 { font-size: 28px; color: #1f2937; }
          .invoice-title p { color: #6b7280; font-size: 14px; margin-top: 4px; }
          .business-info { margin-bottom: 20px; }
          .business-info h3 { font-size: 16px; font-weight: 600; }
          .business-info p { color: #6b7280; font-size: 14px; }
          .bill-to { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
          .bill-to h4 { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 8px; }
          .bill-to p { font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #e5e7eb; font-size: 12px; color: #6b7280; text-transform: uppercase; }
          th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: right; }
          td { padding: 12px 8px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
          td:nth-child(2), td:nth-child(3), td:nth-child(4) { text-align: right; }
          .totals { display: flex; justify-content: flex-end; margin-bottom: 30px; }
          .totals-table { width: 250px; }
          .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .totals-row.total { border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 8px; font-size: 18px; font-weight: 700; }
          .notes { margin-bottom: 20px; }
          .notes h4, .terms h4 { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
          .notes p, .terms p { font-size: 14px; color: #4b5563; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">📄</div>
          <div class="invoice-title">
            <h1>INVOICE</h1>
            <p>${invoiceNumber}</p>
            <p>${formatDisplayDate(invoiceDate)}</p>
          </div>
        </div>
        
        <div class="business-info">
          <h3>${businessName || 'Your Business Name'}</h3>
          <p>${ownerName || 'Owner Name'}</p>
          <p>${panNumber ? `PAN: ${panNumber}` : ''}</p>
        </div>
        
        <div class="bill-to">
          <h4>Bill To:</h4>
          <p style="font-weight: 500;">${selectedCustomer?.name || 'Walk-in Customer'}</p>
          <p>${selectedCustomer?.phone || ''}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${validItems.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${formatRs(item.rate)}</td>
                <td>${formatRs(item.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="totals-table">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>${formatRs(subtotal)}</span>
            </div>
            <div class="totals-row">
              <span>Discount:</span>
              <span>${formatRs(totalDiscount)}</span>
            </div>
            <div class="totals-row">
              <span>Tax:</span>
              <span>${formatRs(totalTax)}</span>
            </div>
            <div class="totals-row total">
              <span>Total:</span>
              <span>${formatRs(grandTotal)}</span>
            </div>
          </div>
        </div>
        
        ${notes ? `<div class="notes"><h4>Notes:</h4><p>${notes}</p></div>` : ''}
        <div class="terms"><h4>Terms:</h4><p>${terms}</p></div>
        
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  // Download invoice as PDF (using print to PDF)
  const handleDownload = () => {
    const validItems = items.filter((item) => item.description && item.rate > 0);
    if (validItems.length === 0) {
      alert('Please add at least one item before downloading');
      return;
    }

    // Create a downloadable HTML file
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1f2937; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { width: 50px; height: 50px; background: #2563eb; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; }
    .invoice-title { text-align: right; }
    .invoice-title h1 { font-size: 28px; color: #1f2937; }
    .invoice-title p { color: #6b7280; font-size: 14px; margin-top: 4px; }
    .business-info { margin-bottom: 20px; }
    .business-info h3 { font-size: 16px; font-weight: 600; }
    .business-info p { color: #6b7280; font-size: 14px; }
    .bill-to { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
    .bill-to h4 { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 8px; }
    .bill-to p { font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #e5e7eb; font-size: 12px; color: #6b7280; text-transform: uppercase; }
    th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: right; }
    td { padding: 12px 8px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    td:nth-child(2), td:nth-child(3), td:nth-child(4) { text-align: right; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 30px; }
    .totals-table { width: 250px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .totals-row.total { border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 8px; font-size: 18px; font-weight: 700; }
    .notes { margin-bottom: 20px; }
    .notes h4, .terms h4 { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
    .notes p, .terms p { font-size: 14px; color: #4b5563; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">📄</div>
    <div class="invoice-title">
      <h1>INVOICE</h1>
      <p>${invoiceNumber}</p>
      <p>${formatDisplayDate(invoiceDate)}</p>
    </div>
  </div>
  
  <div class="business-info">
    <h3>${businessName || 'Your Business Name'}</h3>
    <p>${ownerName || 'Owner Name'}</p>
    <p>${panNumber ? `PAN: ${panNumber}` : ''}</p>
  </div>
  
  <div class="bill-to">
    <h4>Bill To:</h4>
    <p style="font-weight: 500;">${selectedCustomer?.name || 'Walk-in Customer'}</p>
    <p>${selectedCustomer?.phone || ''}</p>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Qty</th>
        <th>Rate</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${validItems.map(item => `
        <tr>
          <td>${item.description}</td>
          <td>${item.quantity}</td>
          <td>${formatRs(item.rate)}</td>
          <td>${formatRs(item.total)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="totals">
    <div class="totals-table">
      <div class="totals-row">
        <span>Subtotal:</span>
        <span>${formatRs(subtotal)}</span>
      </div>
      <div class="totals-row">
        <span>Discount:</span>
        <span>${formatRs(totalDiscount)}</span>
      </div>
      <div class="totals-row">
        <span>Tax:</span>
        <span>${formatRs(totalTax)}</span>
      </div>
      <div class="totals-row total">
        <span>Total:</span>
        <span>${formatRs(grandTotal)}</span>
      </div>
    </div>
  </div>
  
  ${notes ? `<div class="notes"><h4>Notes:</h4><p>${notes}</p></div>` : ''}
  <div class="terms"><h4>Terms:</h4><p>${terms}</p></div>
</body>
</html>`;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Invoice downloaded! Open the file in a browser and use "Print > Save as PDF" to convert to PDF.');
  };

  // Filtered products for search
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Invoice List View
  if (view === 'list') {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-4">
          <div className="max-w-1600px mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 pb-6 sm:pb-8">
            {/* Header - Interactive Style */}
            <div className="mb-6 sm:mb-8">
              <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800/30 hover:shadow-lg transition-all duration-300 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <FiFileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    {t('billing.title')}
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                      {t('billing.eBilling') || 'E-Billing'}
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {t('billing.description')}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <FiArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Quick Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Card
                  className="p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 group"
                  onClick={handleNewInvoice}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <FiFileText className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                        {t('billing.createEBilling')}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        {t('billing.professionalInvoice')}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className="p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-green-500 group bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                  onClick={handleNewPOS}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <FiZap className="w-5 h-5 sm:w-7 sm:h-7 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                        {t('billing.quickPOS')}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        {t('billing.quickPOSDescription')}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Invoice List */}
            <InvoiceList onNewInvoice={handleNewInvoice} onViewInvoice={handleViewInvoice} hideHeader />
          </div>
        </div>
        <InvoiceDetail invoice={selectedInvoice} onClose={handleCloseInvoiceDetail} />
      </>
    );
  }

  // POS View
  if (view === 'pos') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-4 pb-6 sm:pb-8">
        <div className="max-w-1600px mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          {/* POS Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <FiZap className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                </div>
                {t('billing.quickPOS')}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('billing.scanProducts')}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setView('create')} size="sm" className="flex-1 sm:flex-none">
                <FiEdit3 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('billing.eBilling')}</span>
              </Button>
              <Button variant="outline" onClick={() => setView('list')} size="sm" className="flex-1 sm:flex-none">
                <FiX className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('billing.cancel')}</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <KPICard
              title={t('billing.items')}
              value={items.filter((i) => i.description).reduce((sum, p) => sum + p.quantity, 0)}
              borderColor="blue"
              onClick={() => navigate('/inventory')}
              icon={<FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />}
            />

            <KPICard
              title={t('billing.subtotal')}
              value={subtotal}
              borderColor="emerald"
              onClick={() => navigate('/transactions')}
              icon={<FiCheck className="w-4 h-4 sm:w-5 sm:h-5" />}
            />

            <KPICard
              title={t('billing.total')}
              value={grandTotal}
              borderColor="purple"
              onClick={() => navigate('/reports')}
              icon={<FiFileText className="w-4 h-4 sm:w-5 sm:h-5" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left: Scan & Products Grid */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {/* Scan Button */}
              <button
                onClick={() => setShowScanner(true)}
                className="w-full p-4 sm:p-6 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-white">
                  <FiPackage className="w-8 h-8 sm:w-10 sm:h-10" />
                  <span className="text-lg sm:text-xl font-bold">{t('billing.scanBarcode')}</span>
                  <span className="text-xs sm:text-sm opacity-80">{t('billing.pressF2')}</span>
                </div>
              </button>

              {/* Product Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder={t('billing.searchProducts')}
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Products Grid */}
              <Card className="p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 sm:mb-3 flex items-center gap-2">
                  <FiGrid className="w-3 h-3 sm:w-4 sm:h-4" />
                  {t('billing.quickAddProducts')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.name}
                      onClick={() => addQuickProduct(product)}
                      className="p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"
                    >
                      <p className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {product.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                        {c(product.price)}
                      </p>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Cart Items */}
              <Card className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    {t('billing.cart')} ({n(items.filter(i => i.description).length)} {t('billing.items').toLowerCase()})
                  </h3>
                  {items.some(i => i.description) && (
                    <button
                      onClick={clearAll}
                      className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      {t('billing.clearAll')}
                    </button>
                  )}
                </div>

                {!items.some(i => i.description) ? (
                  <div className="text-center py-6 sm:py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                    <FiPackage className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2 sm:mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('billing.noItemsInCart')}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('billing.scanOrSelectProducts')}</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 sm:max-h-72 overflow-y-auto">
                    {items.filter(i => i.description).map((item) => (
                      <div
                        key={item.id}
                        className={`p-2.5 sm:p-3 rounded-lg border transition-all ${lastScannedBarcode === item.barcode
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {item.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {c(item.rate)} × {n(item.quantity)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="flex items-center border rounded-lg dark:border-gray-600">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 sm:w-8 sm:h-8 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg"
                              >
                                -
                              </button>
                              <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                                {n(item.quantity)}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 sm:w-8 sm:h-8 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 min-w-14 sm:min-w-20 text-right">
                              {c(item.total)}
                            </span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            >
                              <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right: Checkout */}
            <div className="lg:col-span-1">
              <Card className="p-4 sm:p-6 lg:sticky lg:top-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
                  {t('billing.checkout')}
                </h2>

                {/* Customer Selection */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
                    {t('billing.customerOptional')}
                  </label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('billing.walkInCustomer')}</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Totals */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex justify-between py-1.5 sm:py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('billing.subtotal')}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {c(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 sm:py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('billing.tax')}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {c(totalTax)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base sm:text-xl font-bold pt-2 sm:pt-3 pb-3 sm:pb-4 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 sm:px-4 -mx-2">
                    <span className="text-gray-900 dark:text-gray-100">{t('billing.total')}</span>
                    <span className="text-green-600 dark:text-green-400">
                      {c(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 sm:space-y-3">
                  <Button
                    onClick={() => handleSave(false)}
                    disabled={!items.some(i => i.description)}
                    className="w-full py-2.5 sm:py-3 text-sm sm:text-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
                  >
                    <FiCheck className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    {t('billing.completeSale')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowScanner(true)}
                    className="w-full"
                    size="sm"
                  >
                    <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    {t('billing.scanMore')}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Barcode Scanner Modal */}
        {showScanner && (
          <BarcodeScanner
            onScan={handleBarcodeScanned}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>
    );
  }

  // Create E-Billing View (Like Screenshot)
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="max-w-1600px mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setView('list')}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">{t('billing.createEBilling')}</h1>
          </div>
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-1.5 sm:gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiHelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm hidden sm:inline">{t('billing.help')}</span>
          </button>
        </div>
      </div>

      <div className="max-w-1600px mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Left: Form */}
          <div className="space-y-4 sm:space-y-6">
            {/* Invoice Details */}
            <Card className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">{t('billing.invoiceDetails')}</h2>

              <div className="space-y-3 sm:space-y-4">
                {/* Invoice Number */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    {t('billing.invoiceNumber')}
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Customer */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    {t('billing.customer')}
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t('billing.selectCustomer')}</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddCustomer(true)}
                      className="whitespace-nowrap"
                      size="sm"
                    >
                      <FiPlus className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">{t('billing.addNew')}</span>
                    </Button>
                  </div>
                </div>

                {/* Invoice Date */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    {t('billing.invoiceDate')}
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </Card>

            {/* Items */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">{t('billing.items')}</h2>
                <Button onClick={addItem} size="sm">
                  <FiPlus className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">{t('billing.addItem')}</span>
                </Button>
              </div>

              {/* Items Header - Hidden on mobile */}
              <div className="hidden sm:grid grid-cols-12 gap-2 mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                <div className="col-span-4">{t('billing.item')}</div>
                <div className="col-span-1 text-center">{t('billing.qty')}</div>
                <div className="col-span-2 text-center">{t('billing.rate')}</div>
                <div className="col-span-1 text-center">{t('billing.disc')}</div>
                <div className="col-span-2 text-center">{t('billing.tax')}</div>
                <div className="col-span-1 text-right">{t('billing.total')}</div>
                <div className="col-span-1"></div>
              </div>

              {/* Items Rows - Responsive */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="sm:grid sm:grid-cols-12 gap-2 items-center space-y-2 sm:space-y-0 p-3 sm:p-0 bg-gray-50 dark:bg-gray-800/50 sm:bg-transparent rounded-lg sm:rounded-none">
                    {/* Description */}
                    <div className="sm:col-span-4">
                      <label className="sm:hidden text-xs text-gray-500 mb-1 block">{t('billing.item')}</label>
                      <input
                        type="text"
                        placeholder={t('billing.itemDescription')}
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {/* Qty, Rate, Discount, Tax in grid on mobile */}
                    <div className="grid grid-cols-4 sm:contents gap-2">
                      <div className="sm:col-span-1">
                        <label className="sm:hidden text-xs text-gray-500 mb-1 block">{t('billing.qty')}</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            updateItem(item.id, 'quantity', parseInt(val) || 1);
                          }}
                          className="w-full px-1 py-2 text-sm text-center border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="sm:hidden text-xs text-gray-500 mb-1 block">{t('billing.rate')}</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={item.rate || ''}
                          onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-2 text-sm text-center border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="sm:hidden text-xs text-gray-500 mb-1 block">{t('billing.disc')}</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="0"
                          value={item.discount || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, '');
                            const num = parseFloat(val) || 0;
                            updateItem(item.id, 'discount', Math.min(num, 100));
                          }}
                          className="w-full px-1 py-2 text-sm text-center border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    {/* Tax, Total, Delete */}
                    <div className="flex items-center gap-2 sm:contents">
                      <div className="sm:col-span-2 flex-1 sm:flex-none">
                        <label className="sm:hidden text-xs text-gray-500 mb-1 block">{t('billing.tax')}</label>
                        <select
                          value={item.tax}
                          onChange={(e) => updateItem(item.id, 'tax', parseInt(e.target.value))}
                          className="w-full px-2 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {taxOptions.map((tax) => (
                            <option key={tax} value={tax}>{tax}%</option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-1 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 min-w-16">
                        {c(item.total)}
                      </div>
                      <div className="sm:col-span-1 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          disabled={items.length === 1}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-4 sm:p-6">
              <h2 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">{t('billing.notes')}</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('billing.notesPlaceholder')}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </Card>

            {/* Terms & Conditions */}
            <Card className="p-4 sm:p-6">
              <h2 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">{t('billing.termsConditions')}</h2>
              <select
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {termsOptions.map((term) => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => setView('list')}
                className="px-3 sm:px-4"
                size="sm"
              >
                {t('billing.cancel')}
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                className="px-3 sm:px-4"
                size="sm"
              >
                <FiPrinter className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('billing.print')}</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                className="px-3 sm:px-4"
                size="sm"
              >
                <FiDownload className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('billing.download')}</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSave(true)}
                className="px-3 sm:px-4"
                size="sm"
              >
                <FiShare2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('billing.saveShare')}</span>
              </Button>
              <Button
                onClick={() => handleSave(false)}
                className="px-3 sm:px-4 bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <FiSave className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('billing.save')}</span>
              </Button>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <Card className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 shadow-xl">
              {/* Preview Actions */}
              <div className="flex justify-end gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <button
                  onClick={handlePrint}
                  className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title={t('billing.print')}
                >
                  <FiPrinter className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1.5 sm:p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  title={t('billing.download')}
                >
                  <FiDownload className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Invoice Header */}
              <div className="flex items-start justify-between mb-6 sm:mb-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FiFileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-right">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{t('billing.invoice')}</h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">{invoiceNumber}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{formatDisplayDate(invoiceDate)}</p>
                </div>
              </div>

              {/* Business Info */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">
                  {businessName || t('billing.yourBusinessName')}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {ownerName || t('billing.ownerName')}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {panNumber ? `PAN: ${panNumber}` : '123 Business Street, City'}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  contact@business.com
                </p>
              </div>

              {/* Bill To */}
              <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 sm:mb-2">{t('billing.billTo')}:</h4>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedCustomer?.name || t('billing.customerNameLabel')}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {selectedCustomer?.address || t('billing.customerAddress')}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  City, State ZIP
                </p>
              </div>

              {/* Items Table */}
              <div className="mb-4 sm:mb-6 overflow-x-auto">
                <table className="w-full min-w-280px">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('billing.item')}</th>
                      <th className="text-center py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('billing.qty')}</th>
                      <th className="text-right py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('billing.rate')}</th>
                      <th className="text-right py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('billing.amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.filter(i => i.description || i.rate > 0).length > 0 ? (
                      items.filter(i => i.description || i.rate > 0).map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-2 sm:py-3 text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate max-w-24 sm:max-w-none">
                            {item.description || t('billing.sampleItem')}
                          </td>
                          <td className="py-2 sm:py-3 text-xs sm:text-sm text-center text-gray-600 dark:text-gray-400">
                            {n(item.quantity)}
                          </td>
                          <td className="py-2 sm:py-3 text-xs sm:text-sm text-right text-gray-600 dark:text-gray-400">
                            {c(item.rate)}
                          </td>
                          <td className="py-2 sm:py-3 text-xs sm:text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                            {c(item.total)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-2 sm:py-3 text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                          {t('billing.sampleItem')}
                        </td>
                        <td className="py-2 sm:py-3 text-xs sm:text-sm text-center text-gray-400 dark:text-gray-500">{n(1)}</td>
                        <td className="py-2 sm:py-3 text-xs sm:text-sm text-right text-gray-400 dark:text-gray-500">{c(0)}</td>
                        <td className="py-2 sm:py-3 text-xs sm:text-sm text-right text-gray-400 dark:text-gray-500">{c(0)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-6 sm:mb-8">
                <div className="w-48 sm:w-64 space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{t('billing.subtotal')}:</span>
                    <span className="text-gray-900 dark:text-gray-100">{c(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{t('billing.discount')}:</span>
                    <span className="text-gray-900 dark:text-gray-100">{c(totalDiscount)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{t('billing.tax')}:</span>
                    <span className="text-gray-900 dark:text-gray-100">{c(totalTax)}</span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-gray-100">{t('billing.total')}:</span>
                    <span className="text-gray-900 dark:text-gray-100">{c(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Notes & Terms */}
              {notes && (
                <div className="mb-3 sm:mb-4">
                  <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-0.5 sm:mb-1">{t('billing.notes')}:</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{notes || t('billing.notesPlaceholder')}</p>
                </div>
              )}

              <div>
                <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-0.5 sm:mb-1">{t('billing.termsConditions')}:</h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{terms}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <Card className="w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">{t('billing.addCustomer')}</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('billing.customerName')} *
                </label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder={t('billing.enterCustomerName')}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('billing.phoneNumber')}
                </label>
                <input
                  type="tel"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder={t('billing.enterPhoneNumber')}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
              <Button variant="outline" onClick={() => setShowAddCustomer(false)} size="sm">
                {t('billing.cancel')}
              </Button>
              <Button onClick={handleAddCustomer} disabled={!newCustomerName.trim()} size="sm">
                {t('billing.addCustomer')}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScanned}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <Card className="w-full max-w-lg p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FiHelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                {t('billing.eBillingHelp')}
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-1.5 sm:mb-2">{t('billing.quickTips')}</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>{t('billing.tipScanF2')}</li>
                  <li>{t('billing.tipTabNavigate')}</li>
                  <li>{t('billing.tipLivePreview')}</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2">{t('billing.creatingInvoice')}</h4>
                <ol className="space-y-1.5 sm:space-y-2 list-decimal list-inside">
                  <li><strong>{t('billing.invoiceNumber')}:</strong> {t('billing.tipInvoiceNumber').split(': ')[1]}</li>
                  <li><strong>{t('billing.customer')}:</strong> {t('billing.tipCustomer').split(': ')[1]}</li>
                  <li><strong>{t('billing.invoiceDate')}:</strong> {t('billing.tipDate').split(': ')[1]}</li>
                  <li><strong>{t('billing.items')}:</strong> {t('billing.tipItems').split(': ')[1]}</li>
                  <li><strong>{t('billing.notes')}:</strong> {t('billing.tipNotes').split(': ')[1]}</li>
                  <li><strong>{t('billing.termsConditions')}:</strong> {t('billing.tipTerms').split(': ')[1]}</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2">{t('billing.itemFields')}</h4>
                <ul className="space-y-1">
                  <li><strong>{t('billing.qty')}:</strong> {t('billing.fieldQty').split(': ')[1]}</li>
                  <li><strong>{t('billing.rate')}:</strong> {t('billing.fieldRate').split(': ')[1]}</li>
                  <li><strong>{t('billing.disc')}:</strong> {t('billing.fieldDisc').split(': ')[1]}</li>
                  <li><strong>{t('billing.tax')}:</strong> {t('billing.fieldTax').split(': ')[1]}</li>
                  <li><strong>{t('billing.total')}:</strong> {t('billing.fieldTotal').split(': ')[1]}</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2">{t('billing.savingOptions')}</h4>
                <ul className="space-y-1">
                  <li><strong>{t('billing.save')}:</strong> {t('billing.optionSave').split(': ')[1]}</li>
                  <li><strong>{t('billing.saveShare')}:</strong> {t('billing.optionSaveShare').split(': ')[1]}</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={() => setShowHelp(false)} className="w-full" size="sm">
                {t('billing.gotIt')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
