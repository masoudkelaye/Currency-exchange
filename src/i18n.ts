export type Lang = "fa" | "en";

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  from: string;
  amount: string;
  swap: string;
  autoRefresh: string;
  seconds: string;
  loading: string;
  error: string;
  retry: string;
  liveRates: string;
  poweredBy: string;
  enterAmount: string;
  freeMarket: string;
  officialRate: string;
  officialWarn: string;
  currency: string;
  priceInRial: string;
  lastUpdate: string;
  converter: string;
  perUnit: string;
  perUnits: string;
  convertedAmount: string;
  selectCurrency: string;
  search: string;
}

export const translations: Record<Lang, Translations> = {
  fa: {
    appTitle: "تبدیل ارز",
    appSubtitle: "نرخ لحظه‌ای بازار آزاد ایران",
    from: "مبدأ ارز",
    amount: "مبلغ",
    swap: "جابجایی",
    autoRefresh: "بروزرسانی خودکار تا",
    seconds: "ثانیه",
    loading: "در حال دریافت نرخ‌های بازار آزاد...",
    error: "خطا در دریافت اطلاعات",
    retry: "تلاش مجدد",
    liveRates: "نرخ لحظه‌ای ارزها",
    poweredBy: "قیمت‌ها بر اساس بازار آزاد ایران",
    enterAmount: "مبلغ را وارد کنید...",
    freeMarket: "بازار آزاد",
    officialRate: "نرخ رسمی",
    officialWarn: "⚠️ نمایش نرخ رسمی بانک مرکزی (دسترسی به API بازار آزاد میسر نشد)",
    currency: "ارز",
    priceInRial: "قیمت (ریال)",
    lastUpdate: "بروزرسانی",
    converter: "مبدل ارز",
    perUnit: "هر واحد",
    perUnits: "هر",
    convertedAmount: "معادل",
    selectCurrency: "انتخاب ارز",
    search: "جستجو...",
  },
  en: {
    appTitle: "Currency Converter",
    appSubtitle: "Iran Free Market Live Rates",
    from: "From Currency",
    amount: "Amount",
    swap: "Swap",
    autoRefresh: "Auto-refresh in",
    seconds: "sec",
    loading: "Fetching free market rates...",
    error: "Error fetching data",
    retry: "Retry",
    liveRates: "Live Currency Rates",
    poweredBy: "Based on Iran's free market rates",
    enterAmount: "Enter amount...",
    freeMarket: "Free Market",
    officialRate: "Official Rate",
    officialWarn: "⚠️ Showing official central-bank rate (free-market API unavailable)",
    currency: "Currency",
    priceInRial: "Price (Rial)",
    lastUpdate: "Updated",
    converter: "Converter",
    perUnit: "per unit",
    perUnits: "per",
    convertedAmount: "Equivalent",
    selectCurrency: "Select currency",
    search: "Search...",
  },
};

export interface CurrencyInfo {
  code: string;
  symbol: string;
  nameFa: string;
  nameEn: string;
  flag: string;
  isBase?: boolean;
}

export const currencies: CurrencyInfo[] = [
  { code: "IRR", symbol: "﷼", nameFa: "ریال ایران", nameEn: "Iranian Rial", flag: "🇮🇷", isBase: true },
  { code: "USD", symbol: "$", nameFa: "دلار آمریکا", nameEn: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", nameFa: "یورو اتحادیه اروپا", nameEn: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", nameFa: "پوند انگلیس", nameEn: "British Pound", flag: "🇬🇧" },
  { code: "CHF", symbol: "CHF", nameFa: "فرانک سوئیس", nameEn: "Swiss Franc", flag: "🇨🇭" },
  { code: "JPY", symbol: "¥", nameFa: "ین ژاپن", nameEn: "Japanese Yen", flag: "🇯🇵" },
  { code: "CAD", symbol: "C$", nameFa: "دلار کانادا", nameEn: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", nameFa: "دلار استرالیا", nameEn: "Australian Dollar", flag: "🇦🇺" },
  { code: "CNY", symbol: "¥", nameFa: "یوآن چین", nameEn: "Chinese Yuan", flag: "🇨🇳" },
  { code: "TRY", symbol: "₺", nameFa: "لیر ترکیه", nameEn: "Turkish Lira", flag: "🇹🇷" },
  { code: "AED", symbol: "د.إ", nameFa: "درهم امارات", nameEn: "UAE Dirham", flag: "🇦🇪" },
];

export function getCurrencyName(c: CurrencyInfo, lang: Lang): string {
  return lang === "fa" ? c.nameFa : c.nameEn;
}
