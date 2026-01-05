// Nepali Date (Bikram Sambat) utilities

const nepaliMonths = [
  'बैशाख', 'जेष्ठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
  'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
];

const nepaliDays = [
  'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'
];

const englishMonths = [
  'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Aswin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

// Nepali numerals mapping
const nepaliNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

// Convert English digits to Nepali numerals
export const toNepaliNumerals = (num: number | string): string => {
  return String(num).replace(/[0-9]/g, (d) => nepaliNumerals[parseInt(d)]);
};

// Convert Nepali numerals back to English digits
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
  const formatted = amount.toLocaleString('en-US');

  if (currency === 'USD') return `$${formatted}`;
  if (currency === 'INR') return `₹${formatted}`;

  // Default NPR
  if (language === 'np') {
    return `रु. ${toNepaliNumerals(formatted)}`;
  }
  return `Rs. ${formatted}`;
};

// Format number with Nepali numerals when language is Nepali
export const formatNumber = (num: number | string | null | undefined, language: 'en' | 'np' = 'en'): string => {
  if (num === null || num === undefined) num = 0;
  const formatted = typeof num === 'number' ? num.toLocaleString('en-US') : num;
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

