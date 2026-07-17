export type Lang = "fa" | "en";

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  from: string;
  to: string;
  amount: string;
  result: string;
  swap: string;
  autoRefresh: string;
  seconds: string;
  loading: string;
  error: string;
  retry: string;
  rate: string;
  liveRates: string;
  poweredBy: string;
  enterAmount: string;
  freeMarket: string;
  currency: string;
  priceInRial: string;
  lastUpdate: string;
  converter: string;
  perUnit: string;
  perUnits: string;
}

export const translations: Record<Lang, Translations> = {
  fa: {
    appTitle: "تبدیل ارز",
    appSubtitle: "نرخ لحظه‌ای بازار آزاد ایران",
    from: "از ارز",
    to: "به ارز",
    amount: "مبلغ",
    result: "نتیجه تبدیل",
    swap: "جابجایی",
    autoRefresh: "بروزرسانی خودکار تا",
    seconds: "ثانیه",
    loading: "در حال دریافت نرخ‌های بازار آزاد...",
    error: "خطا در دریافت اطلاعات",
    retry: "تلاش مجدد",
    rate: "نرخ تبدیل",
    liveRates: "نرخ لحظه‌ای ارزها",
    poweredBy: "قیمت‌ها بر اساس بازار آزاد ایران",
    enterAmount: "مبلغ را وارد کنید...",
    freeMarket: "بازار آزاد",
    currency: "ارز",
    priceInRial: "قیمت (ریال)",
    lastUpdate: "بروزرسانی",
    converter: "مبدل ارز",
    perUnit: "هر واحد",
    perUnits: "هر",
  },
  en: {
    appTitle: "Currency Converter",
    appSubtitle: "Iran Free Market Live Rates",
    from: "From",
    to: "To",
    amount: "Amount",
    result: "Result",
    swap: "Swap",
    autoRefresh: "Auto-refresh in",
    seconds: "sec",
    loading: "Fetching free market rates...",
    error: "Error fetching data",
    retry: "Retry",
    rate: "Exchange Rate",
    liveRates: "Live Currency Rates",
    poweredBy: "Based on Iran's free market rates",
    enterAmount: "Enter amount...",
    freeMarket: "Free Market",
    currency: "Currency",
    priceInRial: "Price (Rial)",
    lastUpdate: "Updated",
    converter: "Converter",
    perUnit: "per unit",
    perUnits: "per",
  },
};

export interface CurrencyInfo {
  code: string;
  apiSymbol: string;
  symbol: string;
  nameFa: string;
  nameEn: string;
  flag: string;
  isBase?: boolean;
  apiDivisor?: number;
}

export const currencies: CurrencyInfo[] = [
  { code: "IRR", apiSymbol: "IRR", symbol: "﷼", nameFa: "ریال ایران", nameEn: "Iranian Rial", flag: "🇮🇷", isBase: true },
  { code: "USD", apiSymbol: "USD", symbol: "$", nameFa: "دلار آمریکا", nameEn: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", apiSymbol: "EUR", symbol: "€", nameFa: "یورو اتحادیه اروپا", nameEn: "Euro", flag: "🇪🇺" },
  { code: "GBP", apiSymbol: "GBP", symbol: "£", nameFa: "پوند انگلیس", nameEn: "British Pound", flag: "🇬🇧" },
  { code: "CHF", apiSymbol: "CHF", symbol: "CHF", nameFa: "فرانک سوئیس", nameEn: "Swiss Franc", flag: "🇨🇭" },
  { code: "JPY", apiSymbol: "JPY", symbol: "¥", nameFa: "ین ژاپن", nameEn: "Japanese Yen", flag: "🇯🇵", apiDivisor: 10 },
  { code: "CAD", apiSymbol: "CAD", symbol: "C$", nameFa: "دلار کانادا", nameEn: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", apiSymbol: "AUD", symbol: "A$", nameFa: "دلار استرالیا", nameEn: "Australian Dollar", flag: "🇦🇺" },
  { code: "CNY", apiSymbol: "CNY", symbol: "¥", nameFa: "یوآن چین", nameEn: "Chinese Yuan", flag: "🇨🇳" },
  { code: "TRY", apiSymbol: "TRY", symbol: "₺", nameFa: "لیر ترکیه", nameEn: "Turkish Lira", flag: "🇹🇷" },
  { code: "AED", apiSymbol: "AED", symbol: "د.إ", nameFa: "درهم امارات", nameEn: "UAE Dirham", flag: "🇦🇪" },
];

export function getCurrencyName(currency: CurrencyInfo, lang: Lang): string {
  return lang === "fa" ? currency.nameFa : currency.nameEn;
}
