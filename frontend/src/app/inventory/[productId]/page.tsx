import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../../utils/i18n';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PageHeader } from '../../../components/layout/PageHeader';
import { apiClient } from '../../../utils/apiClient';
import { useSettingsStore } from '../../../store/settingsStore';
import {
  FiArrowLeft,
  FiPackage,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw,
} from 'react-icons/fi';

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  costPrice?: number;
  image: string | null;
  sku?: string;
  description?: string;
  category?: string;
  status: 'active' | 'inactive';
  minStock?: number;
  unit?: string;
}

interface StockMovement {
  id: string;
  productId: string;
  date: string;
  change: number;
  notes?: string;
  staff?: string;
  type: 'in' | 'out' | 'adjustment';
}

export default function InventoryDetailPage() {
  const { t, n, c, d } = useTranslation();
  const { featureSettings } = useSettingsStore();
  const inventorySettings = featureSettings.inventory;
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdjustStock, setShowAdjustStock] = useState(false);
  const [adjustData, setAdjustData] = useState({ type: 'in' as 'in' | 'out', change: '', notes: '' });

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.get(`/products/?id=${productId}`);
        if (data && data.length > 0) {
          setProduct(data[0]);
        } else {
          navigate('/inventory');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/inventory');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, navigate]);

  const selectedMovements = useMemo(
    () => movements.filter((m) => m.productId === productId),
    [movements, productId]
  );

  const handleAdjustStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !adjustData.change || !product) return;

    const changeAmount = adjustData.type === 'in' ? Number(adjustData.change) : -Number(adjustData.change);
    const newQuantity = product.quantity + changeAmount;

    if (newQuantity < 0) {
      alert(t('inventory.insufficientStock'));
      return;
    }

    try {
      await apiClient.put(`/products/?id=${productId}`, { quantity: newQuantity });

      setProduct({ ...product, quantity: newQuantity });
      setMovements([
        ...movements,
        { id: `m-${Date.now()}`, productId, date: new Date().toISOString(), change: changeAmount, notes: adjustData.notes || 'Manual adjustment', staff: 'Admin', type: adjustData.type },
      ]);
      setShowAdjustStock(false);
      setAdjustData({ type: 'in', change: '', notes: '' });
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert(t('inventory.errorAdjustingStock'));
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    
    if (confirm(t('inventory.deleteItemConfirm'))) {
      try {
        await apiClient.delete(`/products/?id=${productId}`);
        navigate('/inventory');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert(t('inventory.errorDeletingProduct'));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <FiRefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">{t('inventory.productNotFound')}</p>
          <Button onClick={() => navigate('/inventory')} className="mt-4">
            <FiArrowLeft className="w-4 h-4 mr-2" />
            {t('inventory.backToInventory')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <PageHeader
            title={product.name}
            subtitle={inventorySettings.enableSKU ? `SKU: ${product.sku || 'N/A'}` : undefined}
            icon={<FiPackage className="w-full h-full" />}
            actions={
              <Button
                variant="ghost"
                onClick={() => navigate('/inventory')}
                size="sm"
              >
                <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('common.back')}
              </Button>
            }
          />
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Product Info Card */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <FiPackage className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{product.name}</h2>
                {inventorySettings.enableSKU && (
                  <p className="text-gray-500 dark:text-gray-400 font-mono mb-2">{product.sku}</p>
                )}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${product.status === 'active'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                  {product.status === 'active' ? <FiCheck className="w-3 h-3" /> : <FiX className="w-3 h-3" />}
                  {product.status === 'active' ? t('inventory.active') : t('inventory.inactive')}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">{t('inventory.currentStock')}</p>
                <p className={`text-2xl font-bold ${product.quantity === 0 ? 'text-red-600' : product.quantity <= (product.minStock || 5) ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                  {n(product.quantity)} {product.unit || 'pcs'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">{t('inventory.sellingPrice')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{c(product.price)}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">{t('inventory.costPrice')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{c(product.costPrice || product.price)}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">{t('inventory.stockValue')}</p>
                <p className="text-2xl font-bold text-emerald-600">{c(product.price * product.quantity)}</p>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('common.description')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{product.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setShowAdjustStock(true)}>
                <FiRefreshCw className="w-4 h-4 mr-2" />
                {t('inventory.adjustStock')}
              </Button>
              <Button variant="outline" onClick={() => navigate(`/inventory?edit=${productId}`)}>
                <FiEdit2 className="w-4 h-4 mr-2" />
                {t('inventory.editProduct')}
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleDelete}
              >
                <FiTrash2 className="w-4 h-4 mr-2" />
                {t('common.delete')}
              </Button>
            </div>
          </Card>

          {/* Stock Movement History */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('inventory.stockMovementHistory')}</h3>
            {selectedMovements.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('inventory.noStockMovements')}</p>
            ) : (
              <div className="space-y-2">
                {selectedMovements.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.change >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                        }`}>
                        {m.change >= 0 ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{m.notes}</p>
                        <p className="text-xs text-gray-500">{d(m.date)}</p>
                      </div>
                    </div>
                    <span className={`font-bold ${m.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {m.change >= 0 ? '+' : ''}{n(m.change)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Adjust Stock Modal */}
        {showAdjustStock && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t('inventory.adjustStock')}: {product.name}
              </h3>
              <form onSubmit={handleAdjustStockSubmit} className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                  <p className="text-sm text-gray-500 mb-1">{t('inventory.currentQuantity')}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{n(product.quantity)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustData({ ...adjustData, type: 'in' })}
                    className={`flex-1 p-3 rounded-xl font-semibold transition-colors ${adjustData.type === 'in'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                  >
                    <FiTrendingUp className="w-5 h-5 mx-auto mb-1" />
                    {t('inventory.stockIn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustData({ ...adjustData, type: 'out' })}
                    className={`flex-1 p-3 rounded-xl font-semibold transition-colors ${adjustData.type === 'out'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                  >
                    <FiTrendingDown className="w-5 h-5 mx-auto mb-1" />
                    {t('inventory.stockOut')}
                  </button>
                </div>
                <Input
                  label={t('inventory.quantity')}
                  type="number"
                  value={adjustData.change}
                  onChange={(e) => setAdjustData({ ...adjustData, change: e.target.value })}
                  placeholder="Enter quantity"
                  required
                  min="1"
                />
                <Input
                  label={t('inventory.reasonNotes')}
                  value={adjustData.notes}
                  onChange={(e) => setAdjustData({ ...adjustData, notes: e.target.value })}
                  placeholder="e.g., Received from supplier, Sold to customer..."
                />
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAdjustStock(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" className="flex-1">
                    {t('inventory.saveAdjustment')}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
