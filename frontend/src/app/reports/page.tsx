import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../utils/i18n';
import { Card } from '../../components/ui/Card';
import {
  FiPieChart,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiPercent,
  FiUsers,
  FiPackage,
  FiBarChart2,
  FiChevronRight,
  FiArrowUpRight,
} from 'react-icons/fi';
import { NepaliRupeeIcon } from '../../components/ui/NepaliRupeeIcon';

type ReportType = 'profit_loss' | 'balance_sheet' | 'cash_flow' | 'sales' | 'expenses' | 'tax' | 'inventory' | 'party';

export default function ReportsPage() {
  const { t, n, c } = useTranslation();
  const navigate = useNavigate();

  const reportCards = [
    {
      id: 'profit_loss',
      title: t('reports.profitLoss'),
      description: t('reports.profitLossDesc'),
      icon: FiPieChart,
      stats: { value: c(182000), change: '+12.5%', positive: true }
    },
    {
      id: 'balance_sheet',
      title: t('reports.balanceSheet'),
      description: t('reports.balanceSheetDesc'),
      icon: FiActivity,
      stats: { value: '1.2M', change: '+8.2%', positive: true }
    },
    {
      id: 'cash_flow',
      title: t('reports.cashFlow'),
      description: t('reports.cashFlowDesc'),
      icon: NepaliRupeeIcon,
      stats: { value: c(524000), change: '+15.3%', positive: true }
    },
    {
      id: 'sales',
      title: t('reports.salesReport'),
      description: t('reports.salesReportDesc'),
      icon: FiTrendingUp,
      stats: { value: c(450000), change: '+22.1%', positive: true }
    },
    {
      id: 'expenses',
      title: t('reports.expenseReport'),
      description: t('reports.expenseReportDesc'),
      icon: FiTrendingDown,
      stats: { value: c(268000), change: '-5.4%', positive: false }
    },
    {
      id: 'tax',
      title: t('reports.taxSummary'),
      description: t('reports.taxSummaryDesc'),
      icon: FiPercent,
      stats: { value: c(45600), change: '+3.2%', positive: true }
    },
    {
      id: 'party',
      title: t('reports.partyLedger'),
      description: t('reports.partyLedgerDesc'),
      icon: FiUsers,
      stats: { value: '156', change: '+18', positive: true }
    },
    {
      id: 'inventory',
      title: t('reports.inventoryValuation'),
      description: t('reports.inventoryValuationDesc'),
      icon: FiPackage,
      stats: { value: '1.25M', change: '+6.8%', positive: true }
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-1600px mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-linear-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all duration-300 cursor-default">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
              <FiBarChart2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                {t('reports.businessReports') || 'Business Reports'}
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                  {n(reportCards.length)} {t('reports.reports') || 'Reports'}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {t('reports.reportsDescription') || 'Comprehensive financial analytics and insights'}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <FiArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {reportCards.map((card) => {
            const Icon = card.icon;
            const colorClasses = [
              'border-l-blue-500 hover:border-l-blue-600',
              'border-l-emerald-500 hover:border-l-emerald-600',
              'border-l-purple-500 hover:border-l-purple-600',
              'border-l-amber-500 hover:border-l-amber-600',
              'border-l-red-500 hover:border-l-red-600',
              'border-l-teal-500 hover:border-l-teal-600',
              'border-l-orange-500 hover:border-l-orange-600',
              'border-l-pink-500 hover:border-l-pink-600'
            ];
            const bgClasses = [
              'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
              'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
              'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
              'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
              'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
              'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
              'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
              'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
            ];
            const idx = reportCards.indexOf(card);
            
            return (
              <Card
                key={card.id}
                className={`group relative p-3 sm:p-5 border-l-4 ${colorClasses[idx % colorClasses.length]} cursor-pointer bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden`}
                onClick={() => navigate(`/reports/${card.id}`)}
              >
                <div className="absolute inset-0 bg-linear-to-br from-transparent to-gray-50/50 dark:to-gray-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${bgClasses[idx % bgClasses.length]} flex items-center justify-center mb-3 sm:mb-4 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 transition-colors truncate">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 line-clamp-2">
                    {card.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                      {card.stats.value}
                    </span>
                    <span className={`text-xs sm:text-sm font-medium flex items-center gap-1 ${
                      card.stats.positive 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {card.stats.positive ? (
                        <FiTrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <FiTrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                      {card.stats.change}
                    </span>
                  </div>
                  <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span>{t('reports.viewReport')}</span>
                    <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}


