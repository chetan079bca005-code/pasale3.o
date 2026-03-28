import React, { useState, useEffect } from 'react';
import { FiX, FiPrinter, FiDownload } from 'react-icons/fi';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Transaction, useDataStore } from '../../store/dataStore';
import { useLanguageStore } from '../../store/languageStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useBusinessStore } from '../../store/businessStore';
import { formatCurrency, formatDateString } from '../../utils/nepaliDate';

interface InvoiceDetailProps {
  invoice: Transaction | null;
  onClose: () => void;
  onUpdate?: () => void;  // Callback to refresh parent
}

export const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoice, onClose, onUpdate }) => {
  const { language } = useLanguageStore();
  const { updateTransaction, transactions } = useDataStore();
  const { featureSettings, businessProfile } = useSettingsStore();
  const { businessName, panNumber } = useBusinessStore();
  const invoicePrint = featureSettings.invoicePrint;
  const transactionSettings = featureSettings.transactions;
  
  // Get the latest version of the invoice from transactions
  const currentInvoice = invoice ? transactions.find(t => t.id === invoice.id) || invoice : null;
  const [isPaid, setIsPaid] = useState(currentInvoice?.description?.includes('[PAID]') || false);

  // Update isPaid when currentInvoice changes
  useEffect(() => {
    if (currentInvoice) {
      setIsPaid(currentInvoice.description?.includes('[PAID]') || false);
    }
  }, [currentInvoice]);

  if (!currentInvoice) return null;

  const handlePrint = () => {
    const printableEl = document.querySelector('.printable');
    if (!printableEl) return;

    // Remove any existing print container
    const existing = document.querySelector('.print-container');
    if (existing) existing.remove();

    // Create print container as a direct child of <body>
    const container = document.createElement('div');
    container.className = 'print-container';
    container.setAttribute('data-paper', invoicePrint.paperSize);

    // Clone the printable content (skip the modal header & action buttons which have no-print/print:hidden)
    const contentEl = printableEl.querySelector('.invoice-print-content');
    if (contentEl) {
      container.innerHTML = contentEl.innerHTML;
    } else {
      container.innerHTML = printableEl.innerHTML;
    }

    // Inject a <style> for @page size directly into the container
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @media print {
        @page { size: ${printPageSize}; margin: ${printMargin}; }
      }
      .print-container {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
        line-height: 1.6;
        padding: 15mm;
        box-sizing: border-box;
      }
      .print-container[data-paper='thermal'] {
        width: 80mm;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        padding: 3mm;
        line-height: 1.4;
      }
      .print-container[data-paper='A5'] { width: 148mm; padding: 12mm; }
      .print-container[data-paper='A4'] { width: 210mm; padding: 15mm; }
    `;
    container.prepend(styleEl);

    document.body.appendChild(container);

    // Print after a short delay to ensure rendering
    setTimeout(() => {
      window.print();
    }, 150);

    // Cleanup after print dialog closes
    const cleanup = () => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
  };

  const handleDownloadPDF = () => {
    alert('PDF download functionality would be implemented here');
  };

  const handleMarkAsPaid = () => {
    if (isPaid) return;
    
    // Update the transaction with [PAID] marker
    const currentDesc = currentInvoice.description || '';
    const newDescription = currentDesc.includes('[PAID]') ? currentDesc : `[PAID] ${currentDesc}`;
    
    updateTransaction(currentInvoice.id, {
      description: newDescription,
    });
    
    setIsPaid(true);
    
    // Call onUpdate callback to refresh parent component
    if (onUpdate) {
      onUpdate();
    }
  };

  // Calculate totals
  const items = currentInvoice.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const tax = subtotal * 0.13; // 13% VAT
  const grandTotal = subtotal + tax;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Unpaid':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getInvoiceStatus = (): 'Paid' | 'Unpaid' | 'Overdue' => {
    if (isPaid || currentInvoice.description?.includes('[PAID]')) return 'Paid';
    
    const invoiceDate = new Date(currentInvoice.date);
    const daysDiff = Math.floor((new Date().getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 30) return 'Overdue';
    return 'Unpaid';
  };

  const isThermal = invoicePrint.paperSize === 'thermal';

  const paperWidthClass = isThermal
    ? 'max-w-sm'
    : invoicePrint.paperSize === 'A5'
      ? 'max-w-lg'
      : 'max-w-2xl';

  const contentPaddingClass = isThermal
    ? 'p-4'
    : invoicePrint.paperSize === 'A5'
      ? 'p-5'
      : 'p-6';

  const tableTextClass = isThermal ? 'text-xs' : 'text-sm';

  const printPageSize = isThermal
    ? '80mm auto'
    : invoicePrint.paperSize === 'A5'
      ? '148mm 210mm'
      : '210mm 297mm';

  const printMargin = isThermal ? '0' : '10mm';

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:static print:bg-transparent print:p-0"
    >
      <style>{`
        @media print {
          @page { size: ${printPageSize}; margin: ${printMargin}; }
          .printable[data-paper='thermal'] { width: 80mm !important; margin: 0 auto; color: black; background: white; padding: 4mm !important; }
          .printable[data-paper='A5'] { width: 148mm; margin: 0 auto; }
          .printable[data-paper='A4'] { width: 210mm; margin: 0 auto; }
          .printable[data-paper='thermal'] * { border-color: #000 !important; color: #000 !important; }
        }
      `}</style>
      <div
        className={`bg-white dark:bg-gray-900 rounded-xl ${paperWidthClass} w-full max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:rounded-none print:shadow-none shadow-2xl printable relative`}
        data-paper={invoicePrint.paperSize}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center print:hidden z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Invoice Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="invoice-print-content">
        {isThermal ? (
          <div className="p-4 font-mono text-sm text-black bg-white select-text w-full max-w-[80mm] mx-auto print:max-w-full">
            {/* THERMAL PRINT LAYOUT */}
            <div className="text-center mb-4 leading-tight">
              {invoicePrint.showLogo && businessProfile.businessLogo && (
                <img src={businessProfile.businessLogo} alt="Logo" className="w-12 h-12 object-contain mx-auto mb-2 grayscale" />
              )}
              {invoicePrint.showBusinessDetails && (
                <>
                  <h2 className="font-bold text-lg">{businessProfile.businessName || businessName || 'Store Name'}</h2>
                   {businessProfile.streetAddress && <p className="text-xs mt-1">{businessProfile.streetAddress}</p>}
                   {businessProfile.businessContactNumber && <p className="text-xs">Ph: {businessProfile.businessContactNumber}</p>}
                   {(businessProfile.registrationNumber || panNumber) && <p className="text-xs">PAN: {businessProfile.registrationNumber || panNumber}</p>}
                </>
              )}
            </div>
            
            <div className="border-t border-dashed border-gray-500 my-2"></div>
            
            <div className="text-xs mb-2 leading-relaxed">
              <div className="flex justify-between"><span className="font-semibold">Receipt No:</span> <span>{currentInvoice.id}</span></div>
              <div className="flex justify-between"><span className="font-semibold">Date:</span> <span>{formatDateString(currentInvoice.date, language)}</span></div>
              {invoicePrint.showCustomerDetails && (
                 <div className="flex justify-between"><span className="font-semibold">Customer:</span> <span>{currentInvoice.partyName || 'Walk-in'}</span></div>
              )}
              {invoicePrint.showPaymentInfo && (
                <div className="flex justify-between"><span className="font-semibold">Status:</span> <span>{getInvoiceStatus()}</span></div>
              )}
            </div>

            <div className="border-t border-dashed border-gray-500 my-2"></div>

            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-dashed border-gray-500">
                  <th className="text-left font-semibold py-1">Item</th>
                  <th className="text-center font-semibold py-1 w-8">Qty</th>
                  <th className="text-right font-semibold py-1 w-16">Amt</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-2">No items in this invoice</td></tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={index}>
                      <td className="py-1 pr-1">{item.name}</td>
                      <td className="text-center py-1">{item.quantity}</td>
                      <td className="text-right py-1">{formatCurrency(item.total, language)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="border-t border-dashed border-gray-500 my-2"></div>

            <div className="text-xs space-y-1 text-right">
              <div className="flex justify-between"><span>Subtotal:</span> <span>{formatCurrency(subtotal, language)}</span></div>
              <div className="flex justify-between"><span>VAT (13%):</span> <span>{formatCurrency(tax, language)}</span></div>
              <div className="border-t border-dashed border-gray-500 my-1"></div>
              <div className="flex justify-between font-bold text-sm"><span>Total:</span> <span>{formatCurrency(grandTotal, language)}</span></div>
            </div>

            {transactionSettings.showSignature && (
              <div className="mt-8 mb-4">
                <div className="border-t border-dashed border-gray-500 mx-auto w-32 pt-1 text-center text-xs">
                  Signature
                </div>
              </div>
            )}

            {invoicePrint.footerText && (
              <>
                <div className="border-t border-dashed border-gray-500 my-2"></div>
                <div className="text-center text-xs mt-2 font-semibold pb-2">
                  {invoicePrint.footerText}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className={`${contentPaddingClass} space-y-6`}>
            {/* Invoice Header */}
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 print:grid-cols-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Invoice ID</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{currentInvoice.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Issue Date</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {formatDateString(currentInvoice.date, language)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(getInvoiceStatus())}`}>
                  {getInvoiceStatus()}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {formatDateString(new Date(new Date(currentInvoice.date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), language)}
                </p>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Party / Business Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {invoicePrint.showBusinessDetails && (
                <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3 mb-2">
                    {invoicePrint.showLogo && businessProfile.businessLogo && (
                      <img src={businessProfile.businessLogo} alt="Logo" className="w-10 h-10 object-contain rounded" />
                    )}
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Business Information</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Name: {businessProfile.businessName || businessName || '—'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">PAN: {businessProfile.registrationNumber || panNumber || '—'}</p>
                  {businessProfile.businessContactNumber && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {businessProfile.businessContactNumber}</p>
                  )}
                  {businessProfile.businessEmail && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email: {businessProfile.businessEmail}</p>
                  )}
                </Card>
              )}
              {invoicePrint.showCustomerDetails && (
                <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Client Information</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Name: {currentInvoice.partyName || 'Walk-in Customer'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Invoice ID: {currentInvoice.id}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date: {formatDateString(currentInvoice.date, language)}</p>
                </Card>
              )}
              {invoicePrint.showPaymentInfo && (
                <Card className="p-4 bg-gray-50 dark:bg-gray-800/50 w-full md:col-span-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Invoice Summary</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Items: {items.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount: {formatCurrency(currentInvoice.amount, language)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status: {getInvoiceStatus()}</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className={`px-4 py-2 text-left ${tableTextClass} font-semibold text-gray-700 dark:text-gray-300`}>Item Description</th>
                    <th className={`px-4 py-2 text-center ${tableTextClass} font-semibold text-gray-700 dark:text-gray-300`}>Quantity</th>
                    <th className={`px-4 py-2 text-right ${tableTextClass} font-semibold text-gray-700 dark:text-gray-300`}>Unit Price</th>
                    <th className={`px-4 py-2 text-right ${tableTextClass} font-semibold text-gray-700 dark:text-gray-300`}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={`px-4 py-3 text-center text-gray-500 dark:text-gray-400 ${tableTextClass}`}>
                        No items in this invoice
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                        <td className={`px-4 py-3 ${tableTextClass} text-gray-900 dark:text-gray-100`}>{item.name}</td>
                        <td className={`px-4 py-3 text-center ${tableTextClass} text-gray-900 dark:text-gray-100`}>{item.quantity}</td>
                        <td className={`px-4 py-3 text-right ${tableTextClass} text-gray-900 dark:text-gray-100`}>
                          {formatCurrency(item.price, language)}
                        </td>
                        <td className={`px-4 py-3 text-right ${tableTextClass} font-semibold text-gray-900 dark:text-gray-100`}>
                          {formatCurrency(item.total, language)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div />
              <Card className="p-4 space-y-3 md:col-span-2 lg:col-span-1 lg:col-start-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(subtotal, language)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">VAT (13%)</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(tax, language)}</span>
                </div>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-gray-100">Total</span>
                  <span className="text-blue-600 dark:text-blue-400">{formatCurrency(grandTotal, language)}</span>
                </div>
              </Card>
            </div>

            {/* Notes */}
            <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentInvoice.description?.replace('[PAID]', '').trim() || transactionSettings.defaultNotes || 'No additional notes'}
              </p>
            </Card>

            {transactionSettings.showSignature && (
              <div className="pt-6">
                <div className="w-48 border-t border-gray-300 dark:border-gray-700 pt-2 text-sm text-gray-600 dark:text-gray-400">
                  Authorized Signature
                </div>
              </div>
            )}

            {invoicePrint.footerText && (
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 pt-4">
                {invoicePrint.footerText}
              </p>
            )}
          </div>
        )}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3 print:hidden z-10">
          <Button variant="outline" onClick={handlePrint}>
            <FiPrinter className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <FiDownload className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button
            onClick={handleMarkAsPaid}
            disabled={isPaid}
            className={isPaid ? 'opacity-50 cursor-not-allowed' : 'bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white'}
          >
            {isPaid ? '✓ Paid' : 'Mark as Paid'}
          </Button>
        </div>
      </div>
    </div>
  );
};
