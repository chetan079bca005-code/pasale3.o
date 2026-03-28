import { useLanguageStore } from '../store/languageStore';
import enTranslations from '../locales/en.json';
import npTranslations from '../locales/np.json';
import { toNepaliNumerals, formatCurrency as formatCurrencyUtil, formatNumber as formatNumberUtil, formatPercentage as formatPercentageUtil, formatDateString, formatTransactionDate } from './nepaliDate';

const translations = {
  en: enTranslations,
  np: npTranslations,
};

import { useSettingsStore } from '../store/settingsStore';

export const useTranslation = () => {
  const { language } = useLanguageStore();
  const { general } = useSettingsStore();

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }

    return value || key;
  };

  // Format number based on current language
  const n = (num: number | string): string => {
    const locale = general.numberFormat === 'indian' ? 'en-IN' : 'en-US';
    const formatted = typeof num === 'number' ? num.toLocaleString(locale) : num;
    return language === 'np' ? toNepaliNumerals(formatted) : formatted;
  };

  // Format currency based on settings and language
  const c = (amount: number | null | undefined): string => {
    return formatCurrencyUtil(amount, language, general.currency);
  };

  // Format percentage based on current language
  const p = (num: number | null | undefined): string => {
    return formatPercentageUtil(num, language);
  };

  // Format date based on settings (calendar type)
  const d = (dateString: string): string => {
    return formatDateString(dateString, language);
  };

  const dt = (dateString: string): string => {
    return formatTransactionDate(dateString, language);
  };

  return { t, n, c, p, d, dt, language };
};


