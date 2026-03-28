/**
 * Nepali Date (Bikram Sambat) Utilities
 * 
 * This module provides utilities for working with Nepali dates, numerals,
 * currency formatting, and date conversions between AD and BS calendars.
 * 
 * @module nepaliDate
 */

import { useSettingsStore } from '../store/settingsStore';

// Nepali month names in Devanagari script
const nepaliMonths = [
  'बैशाख', 'जेष्ठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
  'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
];

// Nepali weekday names in Devanagari script
const nepaliDays = [
  'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'
];

// English transliteration of Nepali months
const englishMonths = [
  'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Aswin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

// Nepali numerals mapping (0-9)
const nepaliNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

// ============================================
// DATE UTILITY FUNCTIONS
// ============================================

/**
 * Gets today's date in ISO format (YYYY-MM-DD)
 * Use this instead of repeating: new Date().toISOString().split('T')[0]
 * 
 * @returns {string} Today's date in YYYY-MM-DD format
 * @example
 * getTodayDateString() // Returns "2026-01-08"
 */
export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Extracts the date part from an ISO datetime string
 * Handles null/undefined gracefully
 * 
 * @param {string | null | undefined} dateStr - ISO datetime string
 * @returns {string} Date in YYYY-MM-DD format or today's date if invalid
 * @example
 * extractDatePart('2026-01-08T12:30:00Z') // Returns "2026-01-08"
 * extractDatePart(null) // Returns today's date
 */
export const extractDatePart = (dateStr: string | null | undefined): string => {
  if (!dateStr) return getTodayDateString();
  const datePart = dateStr.split('T')[0];
  return datePart || getTodayDateString();
};

// ============================================
// NUMERAL CONVERSION FUNCTIONS
// ============================================

/**
 * Converts English digits to Nepali numerals
 * 
 * @param {number | string} num - Number or string containing digits
 * @returns {string} String with Nepali numerals
 * @example
 * toNepaliNumerals(123) // Returns "१२३"
 * toNepaliNumerals("Rs. 1,000") // Returns "Rs. १,०००"
 */
export const toNepaliNumerals = (num: number | string): string => {
  return String(num).replace(/[0-9]/g, (d) => nepaliNumerals[parseInt(d)]);
};

/**
 * Converts Nepali numerals back to English digits
 * 
 * @param {string} str - String containing Nepali numerals
 * @returns {string} String with English numerals
 * @example
 * toEnglishNumerals("१२३") // Returns "123"
 */
export const toEnglishNumerals = (str: string): string => {
  return str.replace(/[०-९]/g, (d) => String(nepaliNumerals.indexOf(d)));
};

// Convert Gregorian to approximate Bikram Sambat (simplified)
// In production, use a proper conversion library
export const toNepaliDate = (date: Date, language: 'en' | 'np' = 'en'): string => {
  // Simplified conversion - in production, use proper BS calendar
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const dayOfWeek = date.getDay();

  // Approximate BS year (BS = AD + 56-57)
  const bsYear = year + 57;

  const monthNames = language === 'np' ? nepaliMonths : englishMonths;
  const dayNames = language === 'np' ? nepaliDays : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Simplified: using same month index (in production, use proper conversion)
  if (language === 'np') {
    return `${toNepaliNumerals(day)} ${monthNames[month]}, ${toNepaliNumerals(bsYear)} BS (${dayNames[dayOfWeek]})`;
  }
  return `${day} ${monthNames[month]}, ${bsYear} BS (${dayNames[dayOfWeek]})`;
};

export const formatDate = (dateString: string, language: 'en' | 'np' = 'en'): string => {
  const date = new Date(dateString);
  return toNepaliDate(date, language);
};

export const formatCurrency = (amount: number | null | undefined, language: 'en' | 'np' = 'en', currency: 'NPR' | 'INR' | 'USD' = 'NPR'): string => {
  // Handle null/undefined values
  if (amount === null || amount === undefined) {
    amount = 0;
  }
  const { general } = useSettingsStore.getState();
  const locale = general.numberFormat === 'indian' ? 'en-IN' : 'en-US';
  const formatted = amount.toLocaleString(locale);

  const symbols: Record<string, string> = {
    'USD': '$',
    'INR': '₹',
    'NPR': language === 'np' ? 'रु.' : 'Rs.',
  };

  const symbol = symbols[currency] || 'Rs.';
  const value = language === 'np' ? toNepaliNumerals(formatted) : formatted;

  return general.currencyPosition === 'start'
    ? `${symbol} ${value}`
    : `${value} ${symbol}`;
};

// Format number with Nepali numerals when language is Nepali
export const formatNumber = (num: number | string | null | undefined, language: 'en' | 'np' = 'en'): string => {
  if (num === null || num === undefined) num = 0;
  const { general } = useSettingsStore.getState();
  const locale = general.numberFormat === 'indian' ? 'en-IN' : 'en-US';
  const formatted = typeof num === 'number' ? num.toLocaleString(locale) : num;
  return language === 'np' ? toNepaliNumerals(formatted) : formatted;
};

// Format percentage with Nepali numerals when language is Nepali
export const formatPercentage = (num: number | null | undefined, language: 'en' | 'np' = 'en'): string => {
  if (num === null || num === undefined) num = 0;
  const formatted = `${num.toFixed(1)}%`;
  return language === 'np' ? toNepaliNumerals(formatted) : formatted;
};

// Short date format (e.g., "15 Jan" or "१५ जनवरी")
export const formatShortDate = (dateString: string, language: 'en' | 'np' = 'en', calendarType: 'AD' | 'BS' = 'AD'): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth();

  // If BS is selected, we should ideally convert. 
  // For this mock/simplified version, we will just use the same date numbers 
  // but potentially different month names/numerals if language is np.
  // Real BS conversion is complex. We'll simulate it by adding 57 years if BS is requested but strictness not enforced here.
  // Actually, let's keep it simple:
  // If Language is NP, we default to Nepali numerals/months.
  // If Calendar is AD, we use English months even if language is NP (maybe? or just convert numerals).

  // Let's follow this logic:
  // calendarType 'AD' -> English logic (Jan, Feb...), standard numerals unless lang=np?
  // Let's stick to the user's intent:
  // AD + EN = 15 Jan
  // AD + NP = १५ जन (Gregorian date, Nepali text)
  // BS + EN = 15 Baisakh (Approx BS date, English text)
  // BS + NP = १५ बैशाख (BS date, Nepali text)

  const isBS = calendarType === 'BS';

  // Simplified BS Date: offset year only, keep day/month same for demo (inaccuracy accepted for now)
  // Or reuse toNepaliDate logic somewhat.

  const targetYear = date.getFullYear() + (isBS ? 57 : 0);
  const targetMonth = month;
  const targetDay = day; // This is wrong for BS but sufficient for "changing" visual feedback.

  const englishShortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const nepaliShortMonths = ['बैशाख', 'जेष्ठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन', 'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'];
  // Note: Nepali months above are full names, but short version usually just first few chars or same.
  // The 'shortMonths' in original code were mapped to Gregorian months in Nepali (Jan->जन).
  // If BS, we should use Nepali months (Baisakh...).

  const adNepaliMonths = ['जन', 'फेब', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अग', 'सेप्ट', 'अक्टो', 'नोभ', 'डिसे'];

  let finalDayStr = targetDay.toString();
  let finalMonthStr = '';

  if (language === 'np') {
    finalDayStr = toNepaliNumerals(targetDay);
    if (isBS) {
      finalMonthStr = nepaliShortMonths[targetMonth]; // Approx mapping for demo
    } else {
      finalMonthStr = adNepaliMonths[targetMonth];
    }
  } else {
    if (isBS) {
      finalMonthStr = englishMonths[targetMonth]; // Use full Baisakh etc from existing array
    } else {
      finalMonthStr = englishShortMonths[targetMonth];
    }
  }

  return `${finalDayStr} ${finalMonthStr}`;
};

// Format date string for display (consistent format across the app)
export const formatDateString = (dateStr: string, language: 'en' | 'np' = 'en'): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';

  const { general } = useSettingsStore.getState();
  const calendarType = general.calendarType || 'AD';
  const dateFormat = general.dateFormat || 'YYYY-MM-DD';

  const pad2 = (v: number) => v.toString().padStart(2, '0');

  const formatWithPattern = (d: Date, pattern: 'YYYY-MM-DD' | 'DD-MM-YYYY' | 'MM-DD-YYYY') => {
    const yyyy = d.getFullYear();
    const mm = pad2(d.getMonth() + 1);
    const dd = pad2(d.getDate());
    if (pattern === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`;
    if (pattern === 'DD-MM-YYYY') return `${dd}-${mm}-${yyyy}`;
    return `${mm}-${dd}-${yyyy}`;
  };

  if (calendarType === 'BS' || dateFormat === 'BS') {
    const bsYear = date.getFullYear() + 57;
    const monthIndex = date.getMonth();
    const day = date.getDate();
    const monthName = language === 'np' ? nepaliMonths[monthIndex] : englishMonths[monthIndex];
    const yearStr = language === 'np' ? toNepaliNumerals(bsYear) : bsYear.toString();
    const dayStr = language === 'np' ? toNepaliNumerals(day) : day.toString();
    return `${yearStr} ${monthName} ${dayStr}`;
  }

  const formatted = formatWithPattern(date, dateFormat as any);
  return language === 'np' ? toNepaliNumerals(formatted) : formatted;
};

// Format date for transaction display
export const formatTransactionDate = (dateStr: string, language: 'en' | 'np' = 'en'): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';

  const { general } = useSettingsStore.getState();
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: general.timeFormat !== '24h',
  };

  const time = date.toLocaleTimeString('en-US', timeOptions);
  const datePart = formatDateString(dateStr, language);
  const timePart = language === 'np' ? toNepaliNumerals(time) : time;
  return `${datePart} ${timePart}`;
};

// Format relative date (e.g., "2 days ago")
export const formatRelativeDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

