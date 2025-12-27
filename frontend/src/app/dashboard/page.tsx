import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { KPICard } from '../../components/dashboard/KPICard';
import { RevenueChart } from '../../components/dashboard/RevenueChart';
import { LowStockAlert } from '../../components/dashboard/LowStockAlert';
import { Card } from '../../components/ui/Card';
import { useTranslation } from '../../utils/i18n';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t, c, n, language } = useTranslation();
  const { getTotalSales, getTotalReceivable, getTotalPayable, getCashInHand, transactions, expenses } = useDataStore();

  const totalSales = getTotalSales();
  const totalReceivable = getTotalReceivable();
  const totalPayable = getTotalPayable();
  const cashInHand = getCashInHand();
  const netBalance = totalReceivable - totalPayable;

  // Calculate percentage changes (mock - in real app, compare with previous period)
  const salesChange = 12.5;
  const receivableChange = -2.4;
  const payableChange = 5.1;
  const cashChange = 0;
  const balanceChange = 1.2;

  const kpiData = [
    {
      title: t('dashboard.totalSales'),
      value: totalSales,
      change: salesChange,
      changeType: 'positive' as const,
      borderColor: 'green' as const,
      onClick: () => navigate('/dashboard/kpi/sales'),
    },
    {
      title: t('dashboard.totalReceivable'),
      value: totalReceivable,
      change: receivableChange,
      changeType: 'negative' as const,
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
      changeType: 'negative' as const,
      borderColor: 'purple' as const,
      onClick: () => navigate('/dashboard/kpi/cash'),
    },
    {
      title: t('dashboard.netBalance'),
      value: netBalance,
      change: balanceChange,
      changeType: 'positive' as const,
      borderColor: 'orange' as const,
      onClick: () => navigate('/dashboard/kpi/balance'),
    },
  ];

  const today = new Date();

  const isSameDay = (dateStr: string, base: Date) => {
    const d = new Date(dateStr);
    return d.getFullYear() === base.getFullYear() && d.getMonth() === base.getMonth() && d.getDate() === base.getDate();
  };

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

  const lowStockItems = [
    { id: '1', name: 'Wireless Mouse', minStock: 5, current: 2 },
    { id: '2', name: 'USB-C Cable', minStock: 10, current: 1 },
    { id: '3', name: 'Monitor Stand', minStock: 3, current: 0 },
    { id: '4', name: 'Mechanical Keyboard', minStock: 8, current: 3 },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 h-full overflow-hidden flex flex-col">
      {/* Page Header - Interactive Style */}
      <div className="pt-2 sm:pt-4">
        <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30 hover:shadow-lg transition-all duration-300 cursor-default">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              {t('dashboard.title')}
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                {t('dashboard.live') || 'Live'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {t('dashboard.description')}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
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

      {/* Charts Section - Responsive layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 flex-1 min-h-0">
        {/* Revenue Chart - Takes 2 columns on xl */}
        <div className="xl:col-span-2 min-h-[300px] sm:min-h-[350px] lg:min-h-[400px]">
          <RevenueChart
            data={{
              weekly: aggregateByDay,
              monthly: aggregateByMonth,
              yearly: aggregateByYear,
            }}
          />
        </div>
        
        {/* Low Stock Alert - Takes 1 column on xl */}
        <div className="xl:col-span-1 min-h-[250px] sm:min-h-[300px]">
          <LowStockAlert items={lowStockItems} />
        </div>
      </div>
    </div>
  );
}
