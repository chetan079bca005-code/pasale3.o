import React from 'react';
import { Card } from '../ui/Card';
import { FiAlertTriangle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../utils/i18n';
import { FiArrowRight } from 'react-icons/fi';

interface LowStockItem {
  id: string;
  name: string;
  minStock: number;
  current: number;
}

interface LowStockAlertProps {
  items: LowStockItem[];
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({ items }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="p-3 sm:p-4 lg:p-6 h-full flex flex-col" noPadding>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
            <FiAlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">
              Low Stock
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
              Attention required
            </p>
          </div>
        </div>
        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] sm:text-xs font-semibold rounded-full">
          {items.length} ITEMS
        </span>
      </div>

      <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto scrollbar-none">
        {items.map((item) => {
          const isCritical = item.current === 0;
          return (
            <div
              key={item.id}
              onClick={() => navigate('/inventory')}
              className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate mr-2">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] sm:text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Min: {item.minStock}
                </span>
                <span
                  className={`font-bold ${
                    isCritical
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`}
                >
                  {item.current} UNITS
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate('/inventory')}
        className="mt-3 sm:mt-4 w-full flex items-center justify-center gap-1.5 sm:gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs sm:text-sm transition-colors py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
      >
        View Full Inventory
        <FiArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </Card>
  );
};

