import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { useBusinessStore } from '../../store/businessStore';
import { KPICard } from '../../components/dashboard/KPICard';
import { RevenueChart } from '../../components/dashboard/RevenueChart';
import { LowStockAlert } from '../../components/dashboard/LowStockAlert';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { useTranslation } from '../../utils/i18n';
import { FiTrendingUp } from 'react-icons/fi';

// API Configuration - Use environment variable or fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const getAuthToken = () => {
  // Check for auth_token (set by login page)
  return localStorage.getItem('auth_token');
};

interface LowStockItem {
  id: string;
  name: string;
  minStock: number;
  current: number;
}

// Helper to calculate percentage change between two periods
const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t, c, n, language } = useTranslation();
  const { getTotalSales, getTotalReceivable, getTotalPayable, getCashInHand, transactions, expenses } = useDataStore();
  const { userProfile } = useAuthStore();
  const { businessName } = useBusinessStore();
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [isLoadingStock, setIsLoadingStock] = useState(true);
  
  // Fetch products and calculate low stock items
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingStock(true);
      
      try {
        const token = getAuthToken();
        
        if (!token) {
          setIsLoadingStock(false);
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/products/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const products = data.results || data || [];
          
          // Filter products with low stock (quantity <= reorder level or <= 10 as default)
          const lowStock = products
            .filter((product: any) => product.quantity <= 10)
            .map((product: any) => ({
              id: String(product.id),
              name: product.product_name,
              minStock: 10, // Default reorder level
              current: product.quantity,
            }));
          
          setLowStockItems(lowStock);
        }
      } catch (err) {
        console.error('Error fetching products for low stock:', err);
      } finally {
        setIsLoadingStock(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Dashboard data from local store (offline-first approach)
  const totalSales = getTotalSales();
  const totalReceivable = getTotalReceivable();
  const totalPayable = getTotalPayable();
  const cashInHand = getCashInHand();
  const netBalance = totalReceivable - totalPayable;

  const today = new Date();

  const isSameDay = (dateStr: string, base: Date) => {
    const d = new Date(dateStr);
    return d.getFullYear() === base.getFullYear() && d.getMonth() === base.getMonth() && d.getDate() === base.getDate();
  };

  // Calculate real percentage changes based on actual data
  const { salesChange, receivableChange, payableChange, cashChange, balanceChange } = useMemo(() => {
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Current month data
    const currentMonthSales = transactions
      .filter((t) => {
        const d = new Date(t.date);
        return t.type === 'selling' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // Previous month data
    const previousMonthSales = transactions
      .filter((t) => {
        const d = new Date(t.date);
        return t.type === 'selling' && d.getMonth() === previousMonth && d.getFullYear() === previousYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate changes - if no previous data, show 0% change
    const salesChange = previousMonthSales > 0 ? calculatePercentageChange(currentMonthSales, previousMonthSales) : 0;
    
    // For receivable, payable, cash, balance - we don't have historical data, so show 0
    // In a real app, you'd track historical snapshots
    return {
      salesChange,
      receivableChange: 0,
      payableChange: 0,
      cashChange: 0,
      balanceChange: 0,
    };
  }, [transactions, today]);

  const kpiData = [
    {
      title: t('dashboard.totalSales'),
      value: totalSales,
      change: salesChange,
      changeType: salesChange >= 0 ? 'positive' as const : 'negative' as const,
      borderColor: 'green' as const,
      onClick: () => navigate('/dashboard/kpi/sales'),
    },
    {
      title: t('dashboard.totalReceivable'),
      value: totalReceivable,
      change: receivableChange,
      changeType: receivableChange >= 0 ? 'positive' as const : 'negative' as const,
      borderColor: 'blue' as const,
      onClick: () => navigate('/dashboard/kpi/receivable'),
    },
    {
      title: t('dashboard.totalPayable'),
      value: totalPayable,
      change: payableChange,
      changeType: 'negative' as const,
      borderColor: 'red' as const,
      onClick: () => navigate('/dashboard/kpi/payable'),
    },
    {
      title: t('dashboard.cashInHand'),
      value: cashInHand,
      change: cashChange,
      changeType: cashChange >= 0 ? 'positive' as const : 'negative' as const,
      borderColor: 'purple' as const,
      onClick: () => navigate('/dashboard/kpi/cash'),
    },
    {
      title: t('dashboard.netBalance'),
      value: netBalance,
      change: balanceChange,
      changeType: netBalance >= 0 ? 'positive' as const : 'negative' as const,
      borderColor: 'orange' as const,
      onClick: () => navigate('/dashboard/kpi/balance'),
    },
  ];

  const todaySales = useMemo(
    () => transactions.filter((t) => t.type === 'selling' && isSameDay(t.date, today)),
    [transactions, today],
  );

  const aggregateByDay = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, idx) => {
      const date = new Date();
      date.setDate(today.getDate() - (6 - idx));
      const label = date.toLocaleDateString('en-US', { weekday: 'short' });
      const salesSum = transactions
        .filter((t) => t.type === 'selling' && isSameDay(t.date, date))
        .reduce((s, t) => s + t.amount, 0);
      const expenseSum =
        transactions.filter((t) => t.type === 'purchase' && isSameDay(t.date, date)).reduce((s, t) => s + t.amount, 0) +
        expenses.filter((e) => isSameDay(e.date, date)).reduce((s, e) => s + e.amount, 0);
      return { name: label, sales: salesSum, expenses: expenseSum };
    });
    return days;
  }, [transactions, expenses, today]);

  const aggregateByMonth = useMemo(() => {
    const months = Array.from({ length: 12 }).map((_, idx) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - idx));
      const m = date.getMonth();
      const y = date.getFullYear();
      const label = date.toLocaleDateString('en-US', { month: 'short' });
      const salesSum = transactions
        .filter((t) => {
          const d = new Date(t.date);
          return t.type === 'selling' && d.getMonth() === m && d.getFullYear() === y;
        })
        .reduce((s, t) => s + t.amount, 0);
      const expenseSum =
        transactions.filter((t) => {
          const d = new Date(t.date);
          return t.type === 'purchase' && d.getMonth() === m && d.getFullYear() === y;
        }).reduce((s, t) => s + t.amount, 0) +
        expenses.filter((e) => {
          const d = new Date(e.date);
          return d.getMonth() === m && d.getFullYear() === y;
        }).reduce((s, e) => s + e.amount, 0);
      return { name: label, sales: salesSum, expenses: expenseSum };
    });
    return months;
  }, [transactions, expenses]);

  const aggregateByYear = useMemo(() => {
    const years = Array.from({ length: 5 }).map((_, idx) => {
      const year = today.getFullYear() - (4 - idx);
      const salesSum = transactions
        .filter((t) => {
          const d = new Date(t.date);
          return t.type === 'selling' && d.getFullYear() === year;
        })
        .reduce((s, t) => s + t.amount, 0);
      const expenseSum =
        transactions.filter((t) => {
          const d = new Date(t.date);
          return t.type === 'purchase' && d.getFullYear() === year;
        }).reduce((s, t) => s + t.amount, 0) +
        expenses.filter((e) => new Date(e.date).getFullYear() === year).reduce((s, e) => s + e.amount, 0);
      return { name: `${year}`, sales: salesSum, expenses: expenseSum };
    });
    return years;
  }, [transactions, expenses, today]);

  const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

  const getUserName = (): string => {
    if (businessName) return businessName;
    if (userProfile?.businessName) return userProfile.businessName;
    if (userProfile?.name) return userProfile.name;
    if (userProfile?.email) return userProfile.email.split('@')[0];
    return 'User';
  };

  return (
    <div className="flex flex-col pb-20 sm:pb-6">
      {/* Page Header with Dynamic Greeting */}
      <PageHeader
        title="Dashboard"
        subtitle={t('dashboard.welcomeBack') || 'Welcome back to your dashboard'}
        icon={<FiTrendingUp className="w-5 h-5" />}
        dynamic={true}
      />

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
          {/* KPI Cards - Professional responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {kpiData.map((kpi, index) => (
              <KPICard
                key={index}
                title={kpi.title}
                value={kpi.value}
                change={kpi.change}
                changeType={kpi.changeType}
                borderColor={kpi.borderColor}
                onClick={kpi.onClick}
              />
            ))}
          </div>

          {/* Charts Section - Professional layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Revenue Chart - Takes 2 columns on lg/xl */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-5">
              <RevenueChart
                data={{
                  weekly: aggregateByDay,
                  monthly: aggregateByMonth,
                  yearly: aggregateByYear,
                }}
              />
            </div>
            
            {/* Low Stock Alert - Takes 1 column on lg/xl */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-5">
              <LowStockAlert items={lowStockItems} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

