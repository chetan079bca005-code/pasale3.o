import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BarcodeScanner } from '../../components/scanner/BarcodeScanner';
import { useDataStore } from '../../store/dataStore';
import { useTranslation } from '../../utils/i18n';
import { FiPackage, FiShoppingCart, FiTrash2, FiUser, FiPrinter, FiCheck, FiLoader } from 'react-icons/fi';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

interface ScannedProduct {
  barcode: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku?: string;
  barcode?: string;
}

export default function POSPage() {
  const navigate = useNavigate();
  const { addTransaction, parties } = useDataStore();
  const { t, n, c, language } = useTranslation();

  const [showScanner, setShowScanner] = useState(false);
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [lastScannedBarcode, setLastScannedBarcode] = useState('');
  
  // Products from API
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const customers = parties.filter((p) => p.type === 'customer');

  // Calculate totals
  const subtotal = scannedProducts.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.13; // 13% VAT
  const grandTotal = subtotal + tax;

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('auth_token') || localStorage.getItem('access_token');
  };

  // Fetch products from API
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/products/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const apiProducts = data.results || data || [];
        const transformedProducts: Product[] = apiProducts.map((p: any) => ({
          id: String(p.id),
          name: p.product_name,
          price: parseFloat(p.unit_price),
          quantity: p.quantity,
          sku: p.sku || `SKU-${p.id}`,
          barcode: p.barcode || p.sku || '',
        }));
        setProducts(transformedProducts);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Auto-focus scanner on page load
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Open scanner on F2 key
      if (e.key === 'F2' && !showScanner) {
        setShowScanner(true);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showScanner]);

  const handleBarcodeScanned = (barcode: string) => {
    // Search for product by barcode or SKU in the products from API
    const productInfo = products.find(
      (p) => p.barcode === barcode || p.sku === barcode || p.id === barcode
    );

    if (!productInfo) {
      alert(`Product with barcode ${barcode} not found. Please add the product to inventory first.`);
      return;
    }

    setLastScannedBarcode(barcode);

    // Check if product already scanned
    const existingIndex = scannedProducts.findIndex((p) => p.barcode === barcode);

    if (existingIndex !== -1) {
      // Increase quantity
      const updated = [...scannedProducts];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].price;
      setScannedProducts(updated);
    } else {
      // Add new product
      const newProduct: ScannedProduct = {
        barcode,
        name: productInfo.name,
        price: productInfo.price,
        quantity: 1,
        total: productInfo.price,
      };
      setScannedProducts([...scannedProducts, newProduct]);
    }

    setShowScanner(false);
  };

  const updateQuantity = (barcode: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeProduct(barcode);
      return;
    }

    const updated = scannedProducts.map((p) =>
      p.barcode === barcode
        ? { ...p, quantity: newQuantity, total: newQuantity * p.price }
        : p
    );
    setScannedProducts(updated);
  };

  const removeProduct = (barcode: string) => {
    setScannedProducts(scannedProducts.filter((p) => p.barcode !== barcode));
  };

  const handleCheckout = () => {
    if (scannedProducts.length === 0) {
      alert(t('pos.pleaseAddProduct'));
      return;
    }

    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    // Create transaction
    addTransaction({
      id: invoiceNumber,
      type: 'selling',
      amount: grandTotal,
      date: new Date().toISOString(),
      description: `POS Sale - ${invoiceNumber}`,
      partyId: selectedCustomerId || undefined,
      partyName: selectedCustomer?.name || t('pos.walkInCustomer'),
      items: scannedProducts.map((p) => ({
        id: p.barcode,
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        total: p.total,
      })),
    });

    alert(`${t('pos.saleCompleted')} ${invoiceNumber}`);

    // Reset
    setScannedProducts([]);
    setSelectedCustomerId('');
    setLastScannedBarcode('');
  };

  const handleClearAll = () => {
    if (window.confirm(t('pos.clearAllConfirm'))) {
      setScannedProducts([]);
      setLastScannedBarcode('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <FiShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {t('pos.title')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {t('pos.description')}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/billing')} size="sm">
              {t('pos.backToBilling')}
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('pos.itemsScanned')}</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {n(scannedProducts.reduce((sum, p) => sum + p.quantity, 0))}
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                  <FiShoppingCart className="w-6 h-6" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-green-600 dark:text-green-400">{t('pos.subtotal')}</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {c(subtotal)}
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                  <FiCheck className="w-6 h-6" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-purple-600 dark:text-purple-400">{t('pos.totalIncVat')}</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {c(grandTotal)}
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-500">
                  <FiPrinter className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
          {/* Products List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scan Button */}
            <Card className="p-6 bg-blue-500! border-none">
              <button
                onClick={() => setShowScanner(true)}
                className="w-full py-6 text-xl font-bold bg-white/10 text-white hover:bg-white/20 rounded-lg border-2 border-dashed border-white/30 transition-colors flex flex-col items-center justify-center gap-2"
              >
                <FiPackage className="w-8 h-8 text-white" />
                <span className="text-white">{t('pos.scanBarcodeF2')}</span>
              </button>
            </Card>

            {/* Scanned Products */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {t('pos.scannedProducts')}
                </h2>
                {scannedProducts.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleClearAll} className="text-red-600 border-red-200 hover:bg-red-50">
                    {t('pos.clearAll')}
                  </Button>
                )}
              </div>

              {scannedProducts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                  <FiPackage className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    {t('pos.noProductsScanned')}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    {t('pos.clickScanOrF2')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scannedProducts.map((product) => (
                    <div
                      key={product.barcode}
                      className={`p-4 rounded-lg border transition-all ${lastScannedBarcode === product.barcode
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('pos.scan')}: {product.barcode}
                          </p>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                            {c(product.price)} × {n(product.quantity)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(product.barcode, product.quantity - 1)}
                              className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-bold text-gray-600 dark:text-gray-400"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={product.quantity}
                              onChange={(e) => updateQuantity(product.barcode, parseInt(e.target.value) || 0)}
                              className="w-12 text-center py-1 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                              min="1"
                            />
                            <button
                              onClick={() => updateQuantity(product.barcode, product.quantity + 1)}
                              className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-bold text-gray-600 dark:text-gray-400"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right min-w-20">
                            <p className="font-bold text-gray-900 dark:text-gray-100">
                              {c(product.total)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeProduct(product.barcode)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Checkout Panel */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {t('pos.checkout')}
              </h2>

              {/* Customer Selection */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                  <FiUser className="w-4 h-4" />
                  {t('pos.customerOptional')}
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('pos.walkInCustomer')}</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Totals */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">{t('pos.subtotal')}:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {c(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">{t('pos.vat13')}:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {c(tax)}
                  </span>
                </div>
                <div className="flex justify-between text-2xl font-bold pt-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 -mx-2 border border-gray-100 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-gray-100">{t('pos.total')}:</span>
                  <span className="text-blue-600 dark:text-blue-400">{c(grandTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleCheckout}
                  disabled={scannedProducts.length === 0}
                  className="w-full py-3 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
                >
                  <FiCheck className="w-5 h-5 mr-2" />
                  {t('pos.completeSale')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowScanner(true)}
                  className="w-full py-3"
                >
                  <FiPackage className="w-5 h-5 mr-2" />
                  {t('pos.scanMoreProducts')}
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
