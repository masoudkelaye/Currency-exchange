export type Lang = "fa" | "en";

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  from: string;
  amount: string;
  autoRefresh: string;
  seconds: string;
  loading: string;
  error: string;
  retry: string;
  liveRates: string;
  goldRates: string;
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
  sell: string;
  buy: string;
  rateDate: string;
  liveNow: string;
}

export const translations: Record<Lang, Translations> = {
  fa: {
    appTitle: "تبدیل ارز",
    appSubtitle: "نرخ لحظه‌ای بازار آزاد ایران",
    from: "مبدأ ارز",
    amount: "مبلغ",
    autoRefresh: "بروزرسانی خودکار تا",
    seconds: "ثانیه",
    loading: "در حال دریافت نرخ‌های بازار آزاد...",
    error: "خطا در دریافت اطلاعات",
    retry: "تلاش مجدد",
    liveRates: "نرخ لحظه‌ای ارزها",
    goldRates: "سکه و طلا",
    poweredBy: "نرخ بازار آزاد ایران",
    enterAmount: "مبلغ را وارد کنید...",
    freeMarket: "بازار آزاد",
    officialRate: "نرخ رسمی",
    officialWarn: "⚠️ نمایش نرخ رسمی بانک مرکزی (دسترسی به نرخ بازار آزاد میسر نشد)",
    currency: "ارز",
    priceInRial: "قیمت (ریال)",
    lastUpdate: "بروزرسانی",
    converter: "مبدل ارز",
    perUnit: "هر واحد",
    sell: "فروش",
    buy: "خرید",
    rateDate: "تاریخ نرخ",
    liveNow: "زنده",
  },
  en: {
    appTitle: "Currency Converter",
    appSubtitle: "Iran Free Market Live Rates",
    from: "From Currency",
    amount: "Amount",
    autoRefresh: "Auto-refresh in",
    seconds: "sec",
    loading: "Fetching free market rates...",
    error: "Error fetching data",
    retry: "Retry",
    liveRates: "Live Currency Rates",
    goldRates: "Gold & Coins",
    poweredBy: "Iran's free market rates",
    enterAmount: "Enter amount...",
    freeMarket: "Free Market",
    officialRate: "Official Rate",
    officialWarn: "⚠️ Showing official central-bank rate (free-market API unavailable)",
    currency: "Currency",
    priceInRial: "Price (Rial)",
    lastUpdate: "Updated",
    converter: "Converter",
    perUnit: "per unit",
    sell: "Sell",
    buy: "Buy",
    rateDate: "Rate date",
    liveNow: "Live",
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

export interface GoldItem {
  code: string;
  nameFa: string;
  nameEn: string;
  icon: string;
}

export const goldItems: GoldItem[] = [
  { code: "emami1",   nameFa: "سکه امامی",       nameEn: "Emami Gold Coin",   icon: "🥇" },
  { code: "azadi1",   nameFa: "سکه بهار آزادی",  nameEn: "Azadi Gold Coin",   icon: "🪙" },
  { code: "azadi1_2", nameFa: "نیم سکه",          nameEn: "Half Azadi Coin",   icon: "🪙" },
  { code: "azadi1_4", nameFa: "ربع سکه",          nameEn: "Quarter Azadi Coin", icon: "🪙" },
  { code: "azadi1g",  nameFa: "سکه گرمی",         nameEn: "Gerami Coin",       icon: "✨" },
];

export function getCurrencyName(c: CurrencyInfo, lang: Lang): string {
  return lang === "fa" ? c.nameFa : c.nameEn;
}

export function getGoldName(g: GoldItem, lang: Lang): string {
  return lang === "fa" ? g.nameFa : g.nameEn;
}
