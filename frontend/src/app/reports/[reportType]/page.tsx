import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../../utils/i18n';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PageHeader } from '../../../components/layout/PageHeader';
import { exportToWord, exportToExcel, exportToPDF, exportToHTML } from '../../../utils/exportUtils';
import { formatDateString, formatTransactionDate } from '../../../utils/nepaliDate';
import {
  FiArrowLeft,
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
  FiPrinter,
  FiDownload,
  FiUsers,
  FiActivity,
  FiBarChart2,
  FiCreditCard,
  FiPercent,
  FiTarget,
  FiAward,
  FiShoppingCart,
  FiTruck,
  FiBox,
  FiRefreshCw,
  FiShare2,
  FiMail,
  FiFileText,
  FiPackage,
} from 'react-icons/fi';
import { NepaliRupeeIcon } from '../../../components/ui/NepaliRupeeIcon';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';

type ReportType = 'profit_loss' | 'balance_sheet' | 'cash_flow' | 'sales' | 'expenses' | 'tax' | 'inventory' | 'party';

export default function ReportDetailPage() {
  const { t, n, c, language } = useTranslation();
  const navigate = useNavigate();
  const { reportType } = useParams<{ reportType: ReportType }>();
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportNotes, setReportNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [quickDateRange, setQuickDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const locale = language === 'np' ? 'ne-NP' : 'en-US';

  // Update date range when quick date range changes
  useEffect(() => {
    const today = new Date();
    let startDate: Date;

    switch (quickDateRange) {
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'quarter':
        const currentQuarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), currentQuarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
  }, [quickDateRange]);

  const generateChartData = (period: 'daily' | 'weekly' | 'monthly') => {
    const dataPoints = period === 'daily' ? 7 : period === 'weekly' ? 4 : 12;
    const baseMultiplier = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;

    return Array.from({ length: dataPoints }).map((_, i) => {
      const d = new Date();
      if (period === 'daily') {
        d.setDate(d.getDate() - (dataPoints - 1 - i));
      } else if (period === 'weekly') {
        d.setDate(d.getDate() - (dataPoints - 1 - i) * 7);
      } else {
        d.setMonth(d.getMonth() - (dataPoints - 1 - i));
      }

      const label = period === 'daily'
        ? d.toLocaleDateString(locale, { weekday: 'short' })
        : period === 'weekly'
          ? `W${dataPoints - i}`
          : d.toLocaleDateString(locale, { month: 'short' });

      return {
        date: label,
        sales: Math.floor(Math.random() * 50000 * baseMultiplier) + 10000 * baseMultiplier,
        expenses: Math.floor(Math.random() * 30000 * baseMultiplier) + 5000 * baseMultiplier,
        profit: Math.floor(Math.random() * 20000 * baseMultiplier) + 5000 * baseMultiplier,
      };
    });
  };

  const chartData = useMemo(() => generateChartData(chartPeriod), [chartPeriod, language]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsRefreshing(false);
  };

  const reportCards = [
    { id: 'profit_loss', title: t('reports.profitLoss'), description: t('reports.profitLossDesc'), icon: FiPieChart },
    { id: 'balance_sheet', title: t('reports.balanceSheet'), description: t('reports.balanceSheetDesc'), icon: FiActivity },
    { id: 'cash_flow', title: t('reports.cashFlow'), description: t('reports.cashFlowDesc'), icon: NepaliRupeeIcon },
    { id: 'sales', title: t('reports.salesReport'), description: t('reports.salesReportDesc'), icon: FiTrendingUp },
    { id: 'expenses', title: t('reports.expenseReport'), description: t('reports.expenseReportDesc'), icon: FiTrendingDown },
    { id: 'tax', title: t('reports.taxSummary'), description: t('reports.taxSummaryDesc'), icon: FiPercent },
    { id: 'party', title: t('reports.partyLedger'), description: t('reports.partyLedgerDesc'), icon: FiUsers },
    { id: 'inventory', title: t('reports.inventoryValuation'), description: t('reports.inventoryValuationDesc'), icon: FiPackage },
  ];

  const report = reportCards.find(c => c.id === reportType);
  const Icon = report?.icon;

  const handlePrint = () => {
    const reportTitle = report?.title || 'Business Report';
    const { summaryCards, chartTitle } = getReportSummary(reportType);

    const formattedStats = summaryCards.map(card => ({
      label: card.label,
      value: card.isCurrency === false ? String(card.value) : c(typeof card.value === 'number' ? card.value : 0),
      change: card.change
    }));

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitle} - Pasale Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; }
          .header h1 { font-size: 28px; color: #1e40af; margin-bottom: 8px; }
          .header p { color: #64748b; font-size: 14px; }
          .date-range { background: #f8fafc; padding: 12px 20px; border-radius: 8px; margin-bottom: 24px; text-align: center; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }
          .stat-card { background: #f8fafc; border-left: 4px solid #3B82F6; padding: 16px; border-radius: 8px; }
          .stat-card.green { border-color: #10B981; }
          .stat-card.red { border-color: #EF4444; }
          .stat-card.purple { border-color: #8B5CF6; }
          .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #1e293b; }
          .stat-change { font-size: 12px; margin-top: 4px; }
          .stat-change.positive { color: #10B981; }
          .stat-change.negative { color: #EF4444; }
          .table-section { margin-top: 30px; }
          .table-section h3 { font-size: 18px; color: #1e293b; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background: #f8fafc; font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; }
          td { font-size: 14px; }
          .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${reportTitle}</h1>
          <p>Pasale Business Management</p>
        </div>
        <div class="date-range">
          <strong>Report Period:</strong> ${dateRange.startDate} to ${dateRange.endDate}
        </div>
        <div class="stats-grid">
          ${formattedStats.map((stat, idx) => `
            <div class="stat-card ${idx === 1 ? 'green' : idx === 2 ? 'red' : idx === 3 ? 'purple' : ''}">
              <div class="stat-label">${stat.label}</div>
              <div class="stat-value">${stat.value}</div>
              <div class="stat-change ${stat.change.startsWith('+') ? 'positive' : 'negative'}">${stat.change}</div>
            </div>
          `).join('')}
        </div>
        <div class="footer">
          <p>Generated on ${formatTransactionDate(new Date().toISOString(), language)} | Pasale Business Management System</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const getReportSummary = (type: ReportType | undefined) => {
    let summaryCards: any[] = [];
    let chartTitle = '';

    switch (type) {
      case 'profit_loss':
        summaryCards = [
          { label: t('reports.totalRevenue'), value: 524000, icon: FiTrendingUp, color: 'from-blue-500 to-blue-600', change: '+15.3%' },
          { label: t('reports.totalExpenses'), value: 342000, icon: FiTrendingDown, color: 'from-red-500 to-red-600', change: '+8.2%' },
          { label: t('reports.grossProfit'), value: 182000, icon: NepaliRupeeIcon, color: 'from-emerald-500 to-emerald-600', change: '+22.1%' },
          { label: t('reports.netMargin'), value: '34.7%', icon: FiPercent, color: 'from-purple-500 to-purple-600', change: '+2.4%', isCurrency: false },
        ];
        chartTitle = t('reports.revenueVsExpenses');
        break;
      case 'sales':
        summaryCards = [
          { label: t('reports.totalSales'), value: 450000, icon: FiShoppingCart, color: 'from-blue-500 to-blue-600', change: '+22.1%' },
          { label: t('reports.orderCount'), value: 324, icon: FiBox, color: 'from-emerald-500 to-emerald-600', change: '+18', isCurrency: false },
          { label: t('reports.avgOrderValue'), value: 1389, icon: FiTarget, color: 'from-purple-500 to-purple-600', change: '+5.2%' },
          { label: t('reports.topCategory'), value: 'Electronics', icon: FiAward, color: 'from-amber-500 to-amber-600', change: '45%', isCurrency: false },
        ];
        chartTitle = t('reports.salesTrend');
        break;
      case 'expenses':
        summaryCards = [
          { label: t('reports.totalExpenses'), value: 268000, icon: FiCreditCard, color: 'from-red-500 to-red-600', change: '-5.4%' },
          { label: t('reports.operatingCosts'), value: 145000, icon: FiActivity, color: 'from-orange-500 to-orange-600', change: '-3.2%' },
          { label: t('reports.purchases'), value: 98000, icon: FiTruck, color: 'from-blue-500 to-blue-600', change: '-8.1%' },
          { label: t('reports.otherExpenses'), value: 25000, icon: FiFileText, color: 'from-purple-500 to-purple-600', change: '+2.5%' },
        ];
        chartTitle = t('reports.expenseBreakdown');
        break;
      case 'inventory':
        summaryCards = [
          { label: t('reports.totalStockValue'), value: 1250000, icon: FiPackage, color: 'from-teal-500 to-teal-600', change: '+6.8%' },
          { label: t('reports.totalItems'), value: 456, icon: FiBox, color: 'from-blue-500 to-blue-600', change: '+24', isCurrency: false },
          { label: t('reports.lowStockItems'), value: 12, icon: FiActivity, color: 'from-amber-500 to-amber-600', change: '-3', isCurrency: false },
          { label: t('reports.outOfStock'), value: 5, icon: FiTrendingDown, color: 'from-red-500 to-red-600', change: '+2', isCurrency: false },
        ];
        chartTitle = t('reports.inventoryAnalysis');
        break;
      default:
        summaryCards = [
          { label: t('reports.totalRevenue'), value: 524000, icon: FiBarChart2, color: 'from-blue-500 to-blue-600', change: '+12.5%' },
          { label: t('reports.grossProfit'), value: 182000, icon: FiActivity, color: 'from-emerald-500 to-emerald-600', change: '+8.3%' },
          { label: t('reports.totalExpenses'), value: 268000, icon: FiTrendingDown, color: 'from-red-500 to-red-600', change: '-5.4%' },
          { label: t('reports.netMargin'), value: '34.7%', icon: FiTarget, color: 'from-purple-500 to-purple-600', change: '+2.1%', isCurrency: false },
        ];
        chartTitle = t('reports.overview') || 'Business Overview';
    }
    return { summaryCards, chartTitle };
  };

  const handleDownload = (format: 'word' | 'excel' | 'pdf' | 'html') => {
    const reportTitle = report?.title || 'Business Report';
    const { summaryCards, chartTitle } = getReportSummary(reportType);

    const formattedStats = summaryCards.map(card => ({
      label: card.label,
      value: card.isCurrency === false ? String(card.value) : c(typeof card.value === 'number' ? card.value : 0),
      change: card.change
    }));

    const sampleTableData = {
      title: t('reports.detailedBreakdown') || 'Detailed Breakdown',
      headers: [t('reports.date') || 'Date', t('reports.descriptionCol') || 'Description', t('reports.category') || 'Category', t('reports.amount') || 'Amount', t('reports.status') || 'Status'],
      rows: [1, 2, 3, 4, 5].map(i => [
        formatDateString(new Date(Date.now() - i * 86400000).toISOString(), language),
        `Transaction #${n(1000 + i)}`,
        t('reports.sales') || 'Sales',
        c(1500 * i),
        t('reports.completed') || 'Completed'
      ])
    };

    const reportData = {
      title: reportTitle || 'Report',
      dateRange: dateRange,
      stats: formattedStats,
      chartTitle: chartTitle,
      tables: [sampleTableData],
      companyName: 'Pasale Business Management',
      companyAddress: '',
      companyPhone: '',
      companyEmail: ''
    };

    if (format === 'word') {
      exportToWord(reportData);
    } else if (format === 'excel') {
      exportToExcel(reportData);
    } else if (format === 'pdf') {
      exportToPDF(reportData);
    } else if (format === 'html') {
      exportToHTML(reportData);
    }
  };

  const handleShare = async () => {
    const reportName = report?.title || 'Report';
    const shareData = {
      title: reportName,
      text: `${reportName} - ${dateRange.startDate} to ${dateRange.endDate}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Share was cancelled by user
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert(t('linkCopied') || 'Link copied to clipboard!');
    }
  };

  const handleEmail = async () => {
    try {
      const reportName = report?.title || 'Report';
      const subject = encodeURIComponent(`${reportName} - ${dateRange.startDate} to ${dateRange.endDate}`);
      const body = encodeURIComponent(`Please find the attached ${reportName} report.\n\nDate Range: ${dateRange.startDate} to ${dateRange.endDate}\n\nGenerated from Pasale Business Management\n${formatDateString(new Date().toISOString(), language)}`);

      window.location.href = `mailto:?subject=${subject}&body=${body}`;

      setTimeout(() => {
        handleDownload('pdf');
      }, 500);
    } catch {
      alert('Please open your email client manually to send the report.');
    }
  };

  const pieData = [
    { name: t('electronics'), value: 35, color: '#3B82F6' },
    { name: t('accessories'), value: 25, color: '#10B981' },
    { name: t('services'), value: 25, color: '#F59E0B' },
    { name: t('others'), value: 15, color: '#8B5CF6' },
  ];

  const { summaryCards, chartTitle } = getReportSummary(reportType);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-1600px mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
        {/* Report Header */}
        <div className="mb-4 sm:mb-6">
          <PageHeader
            title={report?.title || 'Report'}
            subtitle={report?.description}
            icon={Icon ? <Icon className="w-full h-full" /> : undefined}
            actions={
              <Button
                variant="ghost"
                onClick={() => navigate('/reports')}
                size="sm"
              >
                <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('common.back')}
              </Button>
            }
          />
        </div>

        <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Date Filters */}
          <Card className="p-3 sm:p-4 print:hidden">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Quick Date Range */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setQuickDateRange(range)}
                    className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${quickDateRange === range
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                  >
                    {range === 'week' ? t('common.thisWeek') : range === 'month' ? t('common.thisMonth') : range === 'quarter' ? t('reports.thisQuarter') : t('common.thisYear')}
                  </button>
                ))}
              </div>

              {/* Custom Date Range & Actions */}
              <div className="flex flex-col sm:flex-row lg:items-end gap-3">
                {/* Date Inputs */}
                <div className="flex items-end gap-2 sm:gap-3 flex-1">
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">{t('reports.startDate')}</label>
                    <Input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">{t('reports.endDate')}</label>
                    <Input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="shrink-0 hidden sm:flex"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <FiRefreshCw className={`w-4 h-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden lg:inline">{t('reports.refresh') || t('common.refresh')}</span>
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 sm:gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                  <Button
                    variant="outline"
                    className="sm:hidden"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>

                  <Button variant="outline" size="sm" className="sm:size-auto" onClick={handlePrint} title="Print Report">
                    <FiPrinter className="w-4 h-4" />
                  </Button>

                  {/* Download Dropdown */}
                  <div className="relative group/download">
                    <Button variant="outline" size="sm" className="sm:size-auto" title={t('reports.download') || 'Download'}>
                      <FiDownload className="w-4 h-4" />
                    </Button>
                    <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 shadow-xl rounded-xl opacity-0 invisible group-hover/download:opacity-100 group-hover/download:visible transition-all duration-200 z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('reports.exportAs') || 'Export As'}</p>
                      </div>
                      <button
                        onClick={() => handleDownload('html')}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 border-b border-gray-100 dark:border-gray-700 transition-colors"
                      >
                        <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs">🌐</span>
                        <span>HTML Report</span>
                      </button>
                      <button
                        onClick={() => handleDownload('pdf')}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/30 border-b border-gray-100 dark:border-gray-700 transition-colors"
                      >
                        <span className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 text-xs">📄</span>
                        <span>PDF (Print)</span>
                      </button>
                      <button
                        onClick={() => handleDownload('word')}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-b border-gray-100 dark:border-gray-700 transition-colors"
                      >
                        <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs">📝</span>
                        <span>Word (.docx)</span>
                      </button>
                      <button
                        onClick={() => handleDownload('excel')}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                      >
                        <span className="w-6 h-6 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 text-xs">📊</span>
                        <span>Excel (.xlsx)</span>
                      </button>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="sm:size-auto" onClick={handleShare} title={t('reports.share') || 'Share'}>
                    <FiShare2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="sm:size-auto" onClick={handleEmail} title={t('reports.email') || 'Email'}>
                    <FiMail className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {summaryCards.map((card, idx) => {
              const CardIcon = card.icon;
              const colorMap: Record<string, { border: string; bg: string; text: string; gradient: string }> = {
                'from-blue-500 to-blue-600': { border: 'border-l-blue-500 hover:border-l-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', gradient: 'to-blue-50/50 dark:to-blue-900/20' },
                'from-emerald-500 to-emerald-600': { border: 'border-l-emerald-500 hover:border-l-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', gradient: 'to-emerald-50/50 dark:to-emerald-900/20' },
                'from-red-500 to-red-600': { border: 'border-l-red-500 hover:border-l-red-600', bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', gradient: 'to-red-50/50 dark:to-red-900/20' },
                'from-purple-500 to-purple-600': { border: 'border-l-purple-500 hover:border-l-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', gradient: 'to-purple-50/50 dark:to-purple-900/20' },
                'from-amber-500 to-amber-600': { border: 'border-l-amber-500 hover:border-l-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', gradient: 'to-amber-50/50 dark:to-amber-900/20' },
                'from-teal-500 to-teal-600': { border: 'border-l-teal-500 hover:border-l-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400', gradient: 'to-teal-50/50 dark:to-teal-900/20' },
                'from-orange-500 to-orange-600': { border: 'border-l-orange-500 hover:border-l-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', gradient: 'to-orange-50/50 dark:to-orange-900/20' },
              };
              const colors = colorMap[card.color] || colorMap['from-blue-500 to-blue-600'];
              return (
                <Card
                  key={idx}
                  className={`group relative p-2.5 sm:p-3 border-l-3 ${colors.border} cursor-pointer bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 hover:scale-[1.01] transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden rounded-lg`}
                >
                  <div className={`absolute inset-0 bg-linear-to-r from-transparent ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 ${colors.bg} rounded-md sm:rounded-lg flex items-center justify-center ${colors.text} transition-transform duration-300 group-hover:scale-110`}>
                        <CardIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <span className={`text-[9px] sm:text-xs font-medium px-1.5 py-0.5 rounded-full ${card.change.startsWith('+') ? `${colors.bg} ${colors.text}` : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                        {card.change}
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs font-medium mb-0.5 truncate">{card.label}</p>
                    <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 transition-transform duration-300 group-hover:scale-105 origin-left truncate">
                      {card.isCurrency === false ? card.value : c(typeof card.value === 'number' ? card.value : 0)}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Chart */}
            <Card className="p-3 sm:p-6 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">{chartTitle}</h3>
                <div className="flex gap-1 sm:gap-2">
                  <button
                    onClick={() => setChartPeriod('daily')}
                    className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-lg transition-all ${chartPeriod === 'daily'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    {t('reports.daily')}
                  </button>
                  <button
                    onClick={() => setChartPeriod('weekly')}
                    className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-lg transition-all ${chartPeriod === 'weekly'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    {t('reports.weekly')}
                  </button>
                  <button
                    onClick={() => setChartPeriod('monthly')}
                    className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-lg transition-all ${chartPeriod === 'monthly'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    {t('reports.monthly')}
                  </button>
                </div>
              </div>
              <div className="h-52 sm:h-64 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                        padding: '12px'
                      }}
                      formatter={(value: number) => [c(value), '']}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                    <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Pie Chart */}
            <Card className="p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">{t('reports.distribution')}</h3>
              <div className="h-52 sm:h-64 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name} ${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Detailed Breakdown Table */}
          <Card className="p-3 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">{t('reports.detailedBreakdown') || 'Detailed Breakdown'}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload('excel')}>
                  <FiDownload className="w-4 h-4 mr-2" />
                  {t('common.export') || 'Export'}
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reports.date') || 'Date'}</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reports.descriptionCol') || 'Description'}</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reports.category') || 'Category'}</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reports.amount') || 'Amount'}</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reports.status') || 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {chartData.slice(0, 7).map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{item.date}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {reportType === 'sales' ? `${t('reports.sales') || 'Sales'} #${1000 + idx}` : 
                         reportType === 'expenses' ? `${t('reports.expenses') || 'Expense'} #${2000 + idx}` :
                         `${t('transactions.title') || 'Transaction'} #${3000 + idx}`}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                          {pieData[idx % pieData.length].name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                        {c(item.sales)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          {t('reports.completed') || 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {chartData.length > 7 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  {t('common.viewAll') || 'View All'} ({chartData.length})
                </Button>
              </div>
            )}
          </Card>

          {/* Report Notes */}
          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">{t('reports.reportNotes')}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingNotes(!isEditingNotes)}
              >
                {isEditingNotes ? t('common.save') : t('common.edit')}
              </Button>
            </div>
            {isEditingNotes ? (
              <textarea
                className="w-full p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl text-sm dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-blue-500"
                rows={3}
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder={t('reports.addNotesPlaceholder')}
              />
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {reportNotes || t('reports.noNotesAdded')}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
