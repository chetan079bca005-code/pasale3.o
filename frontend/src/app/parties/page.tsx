import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { formatDate } from '../../utils/nepaliDate';
import { useTranslation } from '../../utils/i18n';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AddPartyDialog } from '../../components/parties/AddPartyDialog';
import {
  FiUsers,
  FiPhone,
  FiMail,
  FiPlus,
  FiSearch,
  FiFilter,
  FiMapPin,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiUser,
  FiTruck,
  FiFileText,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCreditCard,
  FiPrinter,
  FiDownload,
  FiX,
  FiCalendar,
  FiActivity,
  FiPackage,
} from 'react-icons/fi';

type TabType = 'all' | 'customers' | 'suppliers';

export default function PartiesPage() {
  const { t, c, n, d, language } = useTranslation();
  const navigate = useNavigate();
  const { parties, transactions } = useDataStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [sortBy, setSortBy] = useState<'name' | 'balance' | 'recent'>('name');

  const filtered = useMemo(() => {
    let result = parties.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (activeTab === 'customers') {
      result = result.filter((p) => p.type === 'customer');
    } else if (activeTab === 'suppliers') {
      result = result.filter((p) => p.type === 'supplier');
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'balance':
          return Math.abs(b.balance) - Math.abs(a.balance);
        case 'recent':
          const aDate = getLastTransactionDate(a.id);
          const bDate = getLastTransactionDate(b.id);
          return (bDate?.getTime() || 0) - (aDate?.getTime() || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [parties, searchQuery, activeTab, sortBy]);

  const customers = parties.filter((p) => p.type === 'customer');
  const suppliers = parties.filter((p) => p.type === 'supplier');

  const getPartyBalance = (partyId: string) => {
    return transactions
      .filter((t) => t.partyId === partyId)
      .reduce((balance, t) => {
        if (t.type === 'selling') {
          return balance + t.amount;
        } else if (t.type === 'purchase') {
          return balance - t.amount;
        }
        return balance;
      }, 0);
  };

  const getLastTransactionDate = (partyId: string): Date | null => {
    const partyTxns = transactions
      .filter((t) => t.partyId === partyId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return partyTxns.length > 0 ? new Date(partyTxns[0].date) : null;
  };

  const totalReceivable = parties.reduce((sum, p) => sum + Math.max(0, getPartyBalance(p.id)), 0);
  const totalPayable = parties.reduce((sum, p) => sum + Math.abs(Math.min(0, getPartyBalance(p.id))), 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-x-hidden pb-20 sm:pb-6">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 flex flex-col">
        {/* Page Header Component */}
        <PageHeader
          title={`${t('parties.title')} (${n(parties.length)})`}
          subtitle={t('parties.description')}
          icon={<FiUsers className="w-6 h-6" />}
          actions={
            <Button
              size="sm"
              onClick={() => setShowAddDialog(true)}
              className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 text-xs sm:text-sm"
            >
              <FiPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              {t('parties.addParty')}
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card
            onClick={() => navigate('/parties')}
            className="group relative p-3 sm:p-4 lg:p-5 border-l-4 border-l-blue-500 hover:border-l-blue-600 cursor-pointer bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent to-blue-50/50 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110">
                    <FiUsers className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 hidden sm:inline">{t('parties.totalParties')}</span>
                </div>
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-0.5 sm:mb-1 transition-transform duration-300 group-hover:scale-105 origin-left">{n(parties.length)}</p>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium">
                <span>{n(customers.length)} {t('parties.customers')}</span>
                <span>{n(suppliers.length)} {t('parties.suppliers')}</span>
              </div>
            </div>
          </Card>

          <Card
            onClick={() => navigate('/dashboard/kpi/receivable')}
            className="group relative p-3 sm:p-4 lg:p-5 border-l-4 border-l-emerald-500 hover:border-l-emerald-600 cursor-pointer bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent to-emerald-50/50 dark:to-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-transform duration-300 group-hover:scale-110">
                    <FiArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 hidden sm:inline">{t('parties.totalReceivable')}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 hidden sm:block">
                  <FiArrowUpRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-0.5 sm:mb-1 transition-transform duration-300 group-hover:scale-105 origin-left truncate">{c(totalReceivable)}</p>
              <p className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-1.5">
                <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-[10px] sm:text-xs">↑</span>
                <span className="hidden sm:inline">{t('parties.amountToCollect')}</span>
                <span className="sm:hidden">To collect</span>
              </p>
            </div>
          </Card>

          <Card
            onClick={() => navigate('/dashboard/kpi/payable')}
            className="group relative p-3 sm:p-4 lg:p-5 border-l-4 border-l-red-500 hover:border-l-red-600 cursor-pointer bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent to-red-50/50 dark:to-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 transition-transform duration-300 group-hover:scale-110">
                    <FiArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 hidden sm:inline">{t('parties.totalPayable')}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 hidden sm:block">
                  <FiArrowUpRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-0.5 sm:mb-1 transition-transform duration-300 group-hover:scale-105 origin-left truncate">{c(totalPayable)}</p>
              <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-1.5">
                <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-100 dark:bg-red-900/30 text-[10px] sm:text-xs">↓</span>
                <span className="hidden sm:inline">{t('parties.amountToPay')}</span>
                <span className="sm:hidden">To pay</span>
              </p>
            </div>
          </Card>

          <Card
            onClick={() => navigate('/dashboard/kpi/balance')}
            className="group relative p-3 sm:p-4 lg:p-5 border-l-4 border-l-purple-500 hover:border-l-purple-600 cursor-pointer bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent to-purple-50/50 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 transition-transform duration-300 group-hover:scale-110">
                    <FiActivity className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 hidden sm:inline">{t('parties.netPosition')}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 hidden sm:block">
                  <FiArrowUpRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-0.5 sm:mb-1 transition-transform duration-300 group-hover:scale-105 origin-left truncate">{c(totalReceivable - totalPayable)}</p>
              <p className={`text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-1.5 ${totalReceivable - totalPayable >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                <span className={`inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[10px] sm:text-xs ${totalReceivable - totalPayable >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  {totalReceivable - totalPayable >= 0 ? '↑' : '↓'}
                </span>
                {totalReceivable - totalPayable >= 0 ? t('parties.positive') : t('parties.negative')}
              </p>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-3 sm:p-4 mb-4 sm:mb-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'all' as TabType, label: t('common.all'), icon: FiUsers, count: parties.length },
              { id: 'customers' as TabType, label: t('parties.customers'), icon: FiUser, count: customers.length, color: 'text-blue-600' },
              { id: 'suppliers' as TabType, label: t('parties.suppliers'), icon: FiTruck, count: suppliers.length, color: 'text-purple-600' },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all ${activeTab === tab.id
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab !== tab.id ? tab.color : ''}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${activeTab === tab.id
                    ? 'bg-white/20 text-white dark:bg-gray-900/20 dark:text-gray-900'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                    {n(tab.count)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
              <FiSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('parties.searchPlaceholder')}
                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 rounded-lg sm:rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'balance' | 'recent')}
              className="px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="name">{t('parties.sortByName')}</option>
              <option value="balance">{t('parties.sortByBalance')}</option>
              <option value="recent">{t('parties.sortByRecent')}</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="border-2 text-xs sm:text-sm"
            >
              <FiFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">{t('common.clear')}</span>
              <span className="sm:hidden">Clear</span>
            </Button>
          </div>
        </Card>


        {/* Parties Grid */}
        {filtered.length === 0 ? (
          <Card className="p-8 sm:p-12 lg:p-16 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FiUsers className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2">
              {searchQuery ? t('parties.noSearchResults') : t('parties.noParties')}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
              {searchQuery ? t('parties.tryDifferentSearch') : t('parties.addFirstParty')}
            </p>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <FiPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              {t('parties.addParty')}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {filtered.map((party) => {
              const balance = getPartyBalance(party.id) || party.balance;
              const lastTxDate = getLastTransactionDate(party.id);

              return (
                <Card
                  key={party.id}
                  className="p-3 sm:p-4 lg:p-5 hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-blue-500/30"
                  onClick={() => navigate(`/parties/${party.id}`)}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Avatar */}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-base sm:text-lg lg:text-xl font-bold text-white shrink-0 ${party.type === 'customer'
                      ? 'bg-linear-to-br from-blue-400 to-blue-600'
                      : 'bg-linear-to-br from-purple-400 to-purple-600'
                      }`}>
                      {party.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                          {party.name}
                        </h3>
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium shrink-0 ${party.type === 'customer'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          }`}>
                          {party.type === 'customer' ? t('parties.customer') : t('parties.supplier')}
                        </span>
                      </div>

                      {party.phone && (
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                          <FiPhone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {party.phone}
                        </p>
                      )}

                      {party.email && (
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 sm:gap-1.5 truncate">
                          <FiMail className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {party.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">{t('parties.balance')}</p>
                      <p className={`text-base sm:text-lg font-bold ${balance > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : balance < 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                        }`}>
                        {c(Math.abs(balance))}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        {balance > 0 ? t('parties.toReceive') : balance < 0 ? t('parties.toPay') : t('parties.settled')}
                      </p>
                    </div>

                    {lastTxDate && (
                      <div className="text-right">
                        <p className="text-[10px] sm:text-xs text-gray-400">{t('parties.lastTransaction')}</p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(lastTxDate.toISOString(), language)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-2 sm:mt-3 flex gap-1.5 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-[10px] sm:text-xs py-1.5 sm:py-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/billing?partyId=${party.id}`);
                      }}
                    >
                      <FiPrinter className="w-3 h-3 mr-0.5 sm:mr-1" />
                      <span className="hidden sm:inline">{t('billing.createBill')}</span>
                      <span className="sm:hidden">Bill</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-[10px] sm:text-xs py-1.5 sm:py-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/ledger/${party.id}`);
                      }}
                    >
                      <FiFileText className="w-3 h-3 mr-0.5 sm:mr-1" />
                      <span className="hidden sm:inline">{t('parties.viewLedger')}</span>
                      <span className="sm:hidden">Ledger</span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {showAddDialog && <AddPartyDialog onClose={() => setShowAddDialog(false)} />}
      </div>
    </div>
  );
}
