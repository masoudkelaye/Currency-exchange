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
  exchangeTab: string;
  ratesTab: string;
  archiveTab: string;
  graphTab: string;
  tehranTime: string;
  localTime: string;
  showInToman: string;
  showInRial: string;
  rialUnit: string;
  tomanUnit: string;
  archiveTitle: string;
  archiveSubtitle: string;
  archiveDate: string;
  graphTitle: string;
  graphSubtitle: string;
  graphSelectCurrency: string;
  graphRange7: string;
  graphRange30: string;
  graphRange90: string;
  archiveLoading: string;
  archiveError: string;
  showMore: string;
  showLess: string;
  aboutTab: string;
  aboutTitle: string;
  aboutBody: string;
  contactTitle: string;
  feedbackTitle: string;
  feedbackPlaceholder: string;
  feedbackSend: string;
  feedbackThanks: string;
  dateFrom: string;
  dateTo: string;
  dateApply: string;
  dateCustom: string;
  phoneLabel: string;
  emailLabel: string;
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
    converter: "تبدیل ارز",
    perUnit: "هر واحد",
    sell: "فروش",
    buy: "خرید",
    rateDate: "تاریخ نرخ",
    liveNow: "زنده",
    exchangeTab: "تبدیل ارز",
    ratesTab: "نرخ ارزها",
    archiveTab: "آرشیو",
    graphTab: "نمودار",
    tehranTime: "ساعت ایران",
    localTime: "ساعت محلی",
    showInToman: "نمایش به تومان",
    showInRial: "نمایش به ریال",
    rialUnit: "ریال",
    tomanUnit: "تومان",
    archiveTitle: "آرشیو نرخ ارز",
    archiveSubtitle: "نرخ‌های تاریخی روزهای گذشته",
    archiveDate: "تاریخ",
    graphTitle: "نمودار نرخ ارز",
    graphSubtitle: "روند تغییرات قیمت در بازه‌ی زمانی",
    graphSelectCurrency: "انتخاب ارز",
    graphRange7: "۷ روز",
    graphRange30: "۳۰ روز",
    graphRange90: "۹۰ روز",
    archiveLoading: "در حال دریافت آرشیو...",
    archiveError: "خطا در دریافت آرشیو",
    showMore: "نمایش بیشتر",
    showLess: "نمایش کمتر",
    aboutTab: "درباره ما",
    aboutTitle: "درباره تبدیل ارز",
    aboutBody: "این برنامه برای نمایش نرخ لحظه‌ای بازار آزاد ایران و تبدیل آسان ارزها ساخته شده است. هدف ما ارائه اطلاعات شفاف و کاربردی برای کاربران فارسی‌زبان است.",
    contactTitle: "تماس با ما",
    feedbackTitle: "انتقادات و پیشنهادات",
    feedbackPlaceholder: "نظر یا پیشنهاد خود را بنویسید...",
    feedbackSend: "ارسال",
    feedbackThanks: "از پیام شما سپاسگزاریم!",
    dateFrom: "از تاریخ",
    dateTo: "تا تاریخ",
    dateApply: "اعمال",
    dateCustom: "بازه دلخواه",
    phoneLabel: "تلفن",
    emailLabel: "ایمیل",
  },
  en: {
    appTitle: "Currency Exchange",
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
    converter: "Exchange",
    perUnit: "per unit",
    sell: "Sell",
    buy: "Buy",
    rateDate: "Rate date",
    liveNow: "Live",
    exchangeTab: "Exchange",
    ratesTab: "Rates",
    archiveTab: "Archive",
    graphTab: "Graph",
    tehranTime: "Tehran Time",
    localTime: "Local Time",
    showInToman: "Show in Toman",
    showInRial: "Show in Rial",
    rialUnit: "Rial",
    tomanUnit: "Toman",
    archiveTitle: "Exchange Rate Archive",
    archiveSubtitle: "Historical rates from previous days",
    archiveDate: "Date",
    graphTitle: "Exchange Rate Graph",
    graphSubtitle: "Price trend over a time range",
    graphSelectCurrency: "Select currency",
    graphRange7: "7 Days",
    graphRange30: "30 Days",
    graphRange90: "90 Days",
    archiveLoading: "Fetching archive...",
    archiveError: "Error fetching archive",
    showMore: "Show more",
    showLess: "Show less",
    aboutTab: "About",
    aboutTitle: "About Currency Exchange",
    aboutBody: "This app shows Iran free-market exchange rates and makes currency conversion simple. Our goal is clear, practical information for everyday users.",
    contactTitle: "Contact Us",
    feedbackTitle: "Feedback",
    feedbackPlaceholder: "Write your feedback or suggestion...",
    feedbackSend: "Send",
    feedbackThanks: "Thank you for your message!",
    dateFrom: "From",
    dateTo: "To",
    dateApply: "Apply",
    dateCustom: "Custom range",
    phoneLabel: "Phone",
    emailLabel: "Email",
  },
};

export interface CurrencyInfo {
  code: string;
  symbol: string;
  nameFa: string;
  nameEn: string;
  flag: string;
  /** ISO 3166-1 alpha-2 for flag images (Windows-safe) */
  country: string;
  isBase?: boolean;
}

export const currencies: CurrencyInfo[] = [
  { code: "IRR", symbol: "﷼",   nameFa: "ریال ایران",         nameEn: "Iranian Rial",       flag: "🇮🇷", country: "ir", isBase: true },
  { code: "USD", symbol: "$",   nameFa: "دلار آمریکا",         nameEn: "US Dollar",          flag: "🇺🇸" , country: "us" },
  { code: "EUR", symbol: "€",   nameFa: "یورو اتحادیه اروپا",  nameEn: "Euro",               flag: "🇪🇺" , country: "eu" },
  { code: "GBP", symbol: "£",   nameFa: "پوند انگلیس",         nameEn: "British Pound",      flag: "🇬🇧" , country: "gb" },
  { code: "CHF", symbol: "CHF", nameFa: "فرانک سوئیس",         nameEn: "Swiss Franc",        flag: "🇨🇭" , country: "ch" },
  { code: "JPY", symbol: "¥",   nameFa: "ین ژاپن",             nameEn: "Japanese Yen",       flag: "🇯🇵" , country: "jp" },
  { code: "CAD", symbol: "C$",  nameFa: "دلار کانادا",         nameEn: "Canadian Dollar",    flag: "🇨🇦" , country: "ca" },
  { code: "AUD", symbol: "A$",  nameFa: "دلار استرالیا",       nameEn: "Australian Dollar",  flag: "🇦🇺" , country: "au" },
  { code: "CNY", symbol: "¥",   nameFa: "یوآن چین",            nameEn: "Chinese Yuan",       flag: "🇨🇳" , country: "cn" },
  { code: "TRY", symbol: "₺",   nameFa: "لیر ترکیه",           nameEn: "Turkish Lira",       flag: "🇹🇷" , country: "tr" },
  { code: "AED", symbol: "د.إ", nameFa: "درهم امارات",         nameEn: "UAE Dirham",         flag: "🇦🇪" , country: "ae" },
  { code: "SEK", symbol: "kr",  nameFa: "کرون سوئد",           nameEn: "Swedish Krona",      flag: "🇸🇪" , country: "se" },
  { code: "NOK", symbol: "kr",  nameFa: "کرون نروژ",           nameEn: "Norwegian Krone",    flag: "🇳🇴" , country: "no" },
  { code: "RUB", symbol: "₽",   nameFa: "روبل روسیه",          nameEn: "Russian Ruble",      flag: "🇷🇺" , country: "ru" },
  { code: "THB", symbol: "฿",   nameFa: "بات تایلند",          nameEn: "Thai Baht",          flag: "🇹🇭" , country: "th" },
  { code: "SGD", symbol: "S$",  nameFa: "دلار سنگاپور",        nameEn: "Singapore Dollar",   flag: "🇸🇬" , country: "sg" },
  { code: "HKD", symbol: "HK$", nameFa: "دلار هنگ‌کنگ",        nameEn: "Hong Kong Dollar",   flag: "🇭🇰" , country: "hk" },
  { code: "AZN", symbol: "₼",   nameFa: "منات آذربایجان",      nameEn: "Azerbaijani Manat",  flag: "🇦🇿" , country: "az" },
  { code: "AMD", symbol: "֏",   nameFa: "درام ارمنستان",       nameEn: "Armenian Dram",      flag: "🇦🇲" , country: "am" },
  { code: "DKK", symbol: "kr",  nameFa: "کرون دانمارک",        nameEn: "Danish Krone",       flag: "🇩🇰" , country: "dk" },
  { code: "SAR", symbol: "﷼",   nameFa: "ریال عربستان",        nameEn: "Saudi Riyal",        flag: "🇸🇦" , country: "sa" },
  { code: "INR", symbol: "₹",   nameFa: "روپیه هند",           nameEn: "Indian Rupee",       flag: "🇮🇳" , country: "in" },
  { code: "MYR", symbol: "RM",  nameFa: "رینگیت مالزی",        nameEn: "Malaysian Ringgit",  flag: "🇲🇾" , country: "my" },
  { code: "AFN", symbol: "؋",   nameFa: "افغانی افغانستان",    nameEn: "Afghan Afghani",     flag: "🇦🇫" , country: "af" },
  { code: "KWD", symbol: "د.ك", nameFa: "دینار کویت",          nameEn: "Kuwaiti Dinar",      flag: "🇰🇼" , country: "kw" },
  { code: "IQD", symbol: "ع.د", nameFa: "دینار عراق",          nameEn: "Iraqi Dinar",        flag: "🇮🇶" , country: "iq" },
  { code: "BHD", symbol: ".د.ب", nameFa: "دینار بحرین",        nameEn: "Bahraini Dinar",     flag: "🇧🇭" , country: "bh" },
  { code: "OMR", symbol: "﷼",   nameFa: "ریال عمان",           nameEn: "Omani Rial",         flag: "🇴🇲" , country: "om" },
  { code: "QAR", symbol: "﷼",   nameFa: "ریال قطر",            nameEn: "Qatari Riyal",       flag: "🇶🇦" , country: "qa" },
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
