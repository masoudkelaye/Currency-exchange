import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { type Lang, type Translations, translations, currencies, getCurrencyName, type CurrencyInfo, goldItems, getGoldName } from "./i18n";
import { useExchangeRates, fetchArchiveRange, fetchArchiveByDates, type ArchiveDayData } from "./useExchangeRates";

type Unit = "rial" | "toman";
type Tab = "exchange" | "rates" | "archive" | "graph" | "about";

/** ارزهای پرکاربرد برای نمایش پیش‌فرض در تب تبدیل */
const POPULAR_CODES = new Set([
  "USD", "EUR", "GBP", "TRY", "AED", "CHF", "CAD", "AUD", "CNY", "JPY", "IRR",
]);

/* ══════════════════════════════════════════════════════════
   HELPERS — defined outside component to avoid re-creation
   ══════════════════════════════════════════════════════════ */

const fmtCache = new Map<string, string>();

function fmt(n: number): string {
  const key = `${n}`;
  if (fmtCache.has(key)) return fmtCache.get(key)!;

  let result: string;
  if (n === 0) result = "0";
  else if (Math.abs(n) >= 1_000)
    result = n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  else if (Math.abs(n) >= 1)
    result = n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  else if (Math.abs(n) >= 0.001)
    result = n.toLocaleString("en-US", { maximumFractionDigits: 6 });
  else
    result = n.toLocaleString("en-US", { maximumFractionDigits: 10 });

  if (fmtCache.size > 500) fmtCache.clear();
  fmtCache.set(key, result);
  return result;
}

function fmtRial(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function addCommas(v: string): string {
  const [intPart, decPart] = v.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
}

function stripCommas(v: string): string {
  return v.replace(/,/g, "");
}

function toDisplay(rialValue: number, unit: Unit): number {
  return unit === "toman" ? rialValue / 10 : rialValue;
}

function irrDisplayName(lang: Lang, unit: Unit): string {
  if (unit === "toman") return lang === "fa" ? "تومان ایران" : "Iranian Toman";
  return lang === "fa" ? "ریال ایران" : "Iranian Rial";
}

const FLAG_CC: Record<string, string> = {
  IRR: "ir", USD: "us", EUR: "eu", GBP: "gb", CHF: "ch", JPY: "jp", CAD: "ca", AUD: "au",
  CNY: "cn", TRY: "tr", AED: "ae", SEK: "se", NOK: "no", RUB: "ru", THB: "th", SGD: "sg",
  HKD: "hk", AZN: "az", AMD: "am", DKK: "dk", SAR: "sa", INR: "in", MYR: "my", AFN: "af",
  KWD: "kw", IQD: "iq", BHD: "bh", OMR: "om", QAR: "qa",
};

/** پرچم تصویری — روی ویندوز به‌جای ایموجی قابل اتکاست */
const FlagImg = memo(function FlagImg({ code, size = 28 }: { code: string; size?: number }) {
  const cc = FLAG_CC[code] ?? (currencies.find((c) => c.code === code)?.country) ?? "un";
  return (
    <img
      src={`https://flagcdn.com/w40/${cc}.png`}
      srcSet={`https://flagcdn.com/w80/${cc}.png 2x`}
      width={size}
      height={Math.round(size * 0.75)}
      alt=""
      className="object-cover rounded-sm shrink-0 inline-block"
      style={{ width: size, height: Math.round(size * 0.75) }}
      loading="lazy"
      decoding="async"
    />
  );
});


/* ══════════════════════════════════════════════════════════
   MEMOIZED COMPONENTS
   ══════════════════════════════════════════════════════════ */

/* ── Currency Dropdown ── */
const CurrencyDropdown = memo(function CurrencyDropdown({
  selected, onSelect, lang, unit,
}: {
  selected: CurrencyInfo;
  onSelect: (c: CurrencyInfo) => void;
  lang: Lang;
  unit: Unit;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const handleSelect = useCallback((c: CurrencyInfo) => {
    onSelect(c);
    setOpen(false);
  }, [onSelect]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 sm:gap-3 bg-slate-800/80 border border-slate-600/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white hover:border-primary-400/50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/40 active:scale-[0.98]"
      >
        <FlagImg code={selected.code} size={28} />
        <div className="flex flex-col items-start flex-1 min-w-0">
          <span className="font-semibold text-xs sm:text-sm truncate w-full">{selected.code === "IRR" ? irrDisplayName(lang, unit) : getCurrencyName(selected, lang)}</span>
          <span className="text-[10px] sm:text-xs text-slate-400">{selected.code === "IRR" && unit === "toman" ? "IRT" : selected.code}</span>
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 w-full bg-slate-800 border border-slate-600/50 rounded-xl shadow-2xl shadow-black/50 overflow-hidden fade-in">
          <div className="max-h-[50vh] overflow-y-auto overscroll-contain">
            {currencies.map((c) => (
              <button key={c.code}
                onClick={() => handleSelect(c)}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 hover:bg-slate-700/50 active:bg-slate-700/70 transition-colors cursor-pointer text-start
                  ${c.code === selected.code ? "bg-primary-600/20" : ""}`}
              >
                <FlagImg code={c.code} size={24} />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs sm:text-sm text-white font-medium truncate">{c.code === "IRR" ? irrDisplayName(lang, unit) : getCurrencyName(c, lang)}</span>
                  <span className="text-[10px] sm:text-xs text-slate-400">{c.code}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

/* ── Result Card (converter output) ── */
const ResultCard = memo(function ResultCard({
  currency, result, lang, unit, t,
}: {
  currency: CurrencyInfo;
  result: number | null;
  lang: Lang;
  unit: Unit;
  t: Translations;
}) {
  const isIrr = currency.code === "IRR";
  const shown = result !== null ? (isIrr ? toDisplay(result, unit) : result) : null;
  return (
    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-900/40 border border-slate-700/30 rounded-xl hover:border-slate-600/60 active:bg-slate-800/50 transition-colors">
      <FlagImg code={currency.code} size={28} />
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[11px] sm:text-[13px] text-white font-semibold truncate">{isIrr ? irrDisplayName(lang, unit) : getCurrencyName(currency, lang)}</span>
        <span className="text-[9px] sm:text-[10px] text-slate-500">{isIrr && unit === "toman" ? "IRT" : currency.code}</span>
      </div>
      <div className="flex flex-col items-end shrink-0" dir="ltr">
        <span className="text-[13px] sm:text-[15px] md:text-base text-emerald-400 font-bold font-mono tabular-nums leading-tight">
          {shown !== null ? fmt(shown) : "—"}
        </span>
        <span className="text-[9px] sm:text-[10px] text-slate-500">
          {isIrr ? (unit === "toman" ? t.tomanUnit : t.rialUnit) : currency.symbol}
        </span>
      </div>
    </div>
  );
});

/* ── Rate Card (buy + sell) ── */
const RateCard = memo(function RateCard({
  currency, buy, sell, lang, unitLabel, t,
}: {
  currency: CurrencyInfo;
  buy: number | null;
  sell: number | null;
  lang: Lang;
  unitLabel: string;
  t: Translations;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:border-slate-600/50 active:bg-slate-700/30 transition-colors">
      <FlagImg code={currency.code} size={28} />
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[11px] sm:text-[13px] text-white font-semibold truncate">{getCurrencyName(currency, lang)}</span>
        <span className="text-[9px] sm:text-[10px] text-slate-500">{currency.code}</span>
      </div>
      <div className="flex flex-col items-end shrink-0 gap-0.5" dir="ltr">
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] sm:text-[9px] text-amber-500/80 font-medium">{t.buy}</span>
          <span className="text-[12px] sm:text-[13px] text-amber-400 font-bold font-mono tabular-nums leading-tight">
            {buy !== null ? fmtRial(buy) : "—"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] sm:text-[9px] text-emerald-500/80 font-medium">{t.sell}</span>
          <span className="text-[13px] sm:text-[14px] text-emerald-400 font-bold font-mono tabular-nums leading-tight">
            {sell !== null ? fmtRial(sell) : "—"}
          </span>
        </div>
        <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight mt-0.5">
          {unitLabel}
        </span>
      </div>
    </div>
  );
});

/* ── Live Clock (Tehran + Local) ── */
const LiveClock = memo(function LiveClock({ lang, t }: { lang: Lang; t: Translations }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const locale = lang === "fa" ? "fa-IR" : "en-US";
  const tehran = useMemo(
    () => now.toLocaleTimeString(locale, { timeZone: "Asia/Tehran", hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    [now, locale]
  );
  const local = useMemo(
    () => now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    [now, locale]
  );
  const localTz = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return ""; }
  }, []);

  return (
    <div className="flex items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1 text-[10px] sm:text-xs text-slate-400 flex-wrap mb-3">
      <span className="flex items-center gap-1">
        <span>🇮🇷</span>{t.tehranTime}:
        <span className="font-mono text-slate-200 tabular-nums" dir="ltr">{tehran}</span>
      </span>
      <span className="text-slate-600 hidden xs:inline">|</span>
      <span className="flex items-center gap-1">
        <span>🌍</span>{t.localTime}:
        <span className="font-mono text-slate-200 tabular-nums" dir="ltr">{local}</span>
        {localTz && <span className="text-slate-600">({localTz})</span>}
      </span>
    </div>
  );
});

/* ── Archive / Graph panel (shared data fetching) ── */
const ArchiveGraphPanel = memo(function ArchiveGraphPanel({
  lang, t, mode, unit,
}: {
  lang: Lang;
  t: Translations;
  mode: "archive" | "graph";
  unit: Unit;
}) {
  const currencyOptions = useMemo(() => currencies.filter((c) => !c.isBase), []);
  const [selectedCode, setSelectedCode] = useState("USD");
  const [range, setRange] = useState<7 | 30 | 90 | "custom">(30);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [days, setDays] = useState<ArchiveDayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      let d: ArchiveDayData[] = [];
      if (range === "custom") {
        if (customFrom && customTo) d = await fetchArchiveByDates(customFrom, customTo);
      } else {
        d = await fetchArchiveRange(range);
      }
      setDays(d);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [range, customFrom, customTo]);

  useEffect(() => {
    if (range === "custom") return; // منتظر دکمه اعمال
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchArchiveRange(range as 7 | 30 | 90)
      .then((d) => { if (!cancelled) { setDays(d); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [range]);

  const rows = useMemo(() => {
    const mult = unit === "toman" ? 1 : 10;
    return days
      .map((d) => {
        const r = d.rates[selectedCode];
        if (!r) return null;
        return { date: d.date, buy: r.buy * mult, sell: r.sell * mult };
      })
      .filter((x): x is { date: string; buy: number; sell: number } => x !== null);
  }, [days, selectedCode, unit]);

  const chartRows = useMemo(() => [...rows].reverse(), [rows]);

  return (
    <section className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl shadow-black/20 fade-in">
      <div className="px-3 sm:px-5 py-3 sm:py-3.5 border-b border-slate-700/40 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span className="text-base sm:text-lg">{mode === "archive" ? "🗂️" : "📈"}</span>
            {mode === "archive" ? t.archiveTitle : t.graphTitle}
          </h2>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
            {mode === "archive" ? t.archiveSubtitle : t.graphSubtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {([7, 30, 90] as const).map((d) => (
            <button key={d} onClick={() => setRange(d)}
              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-colors cursor-pointer ${
                range === d ? "bg-primary-600 text-white" : "bg-slate-700/50 text-slate-300 hover:bg-slate-700/70"
              }`}>
              {d === 7 ? t.graphRange7 : d === 30 ? t.graphRange30 : t.graphRange90}
            </button>
          ))}
          <button onClick={() => setRange("custom")}
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-colors cursor-pointer ${
              range === "custom" ? "bg-primary-600 text-white" : "bg-slate-700/50 text-slate-300 hover:bg-slate-700/70"
            }`}>
            {t.dateCustom}
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {range === "custom" && (
          <div className="flex flex-wrap items-end gap-2 mb-4">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">{t.dateFrom}</label>
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
                className="bg-slate-900/60 border border-slate-600/50 rounded-lg px-2 py-1.5 text-xs text-white" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">{t.dateTo}</label>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
                className="bg-slate-900/60 border border-slate-600/50 rounded-lg px-2 py-1.5 text-xs text-white" />
            </div>
            <button type="button" onClick={loadData}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-600 text-white hover:bg-primary-500 cursor-pointer">
              {t.dateApply}
            </button>
          </div>
        )}

        <label className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
          {t.graphSelectCurrency}
        </label>
        <div className="max-w-xs mb-4">
          <select value={selectedCode} onChange={(e) => setSelectedCode(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-600/50 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 cursor-pointer">
            {currencyOptions.map((c) => (
              <option key={c.code} value={c.code}>{getCurrencyName(c, lang)} ({c.code})</option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full spin-slow" />
          </div>
        )}

        {!loading && error && (
          <p className="text-red-300 text-sm text-center py-8">{t.archiveError}</p>
        )}

        {!loading && !error && rows.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">—</p>
        )}

        {!loading && !error && rows.length > 0 && mode === "graph" && (
          <div className="h-64 sm:h-80" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartRows} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} minTickGap={24} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} domain={["auto", "auto"]} width={70} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Line type="monotone" dataKey="sell" stroke="#34d399" strokeWidth={2} dot={false} name={t.sell} />
                <Line type="monotone" dataKey="buy" stroke="#fbbf24" strokeWidth={2} dot={false} name={t.buy} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {!loading && !error && rows.length > 0 && mode === "archive" && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm" dir="ltr">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700/50">
                  <th className="text-start py-2 px-2 font-medium">{t.archiveDate}</th>
                  <th className="text-end py-2 px-2 font-medium">{t.buy}</th>
                  <th className="text-end py-2 px-2 font-medium">{t.sell}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.date} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="py-1.5 px-2 text-slate-300 font-mono">{r.date}</td>
                    <td className="py-1.5 px-2 text-end text-amber-400 font-mono tabular-nums">{fmtRial(r.buy)}</td>
                    <td className="py-1.5 px-2 text-end text-emerald-400 font-mono tabular-nums">{fmtRial(r.sell)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
});


const FeedbackForm = memo(function FeedbackForm({ t, lang }: { t: Translations; lang: Lang }) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = encodeURIComponent(text.trim());
    if (!body) return;
    const subject = encodeURIComponent(lang === "fa" ? "بازخورد تبدیل ارز" : "Currency Exchange Feedback");
    window.location.href = `mailto:masoud.kelayeh@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  if (sent) {
    return <p className="text-emerald-400 text-sm">{t.feedbackThanks}</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.feedbackPlaceholder}
        rows={4}
        className="w-full bg-slate-900/60 border border-slate-600/50 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 resize-y"
      />
      <button type="submit"
        className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-lg cursor-pointer">
        {t.feedbackSend}
      </button>
    </form>
  );
});

/* ══════════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════════ */
export default function App() {
  const [lang, setLang] = useState<Lang>("fa");
  const [fromCurrency, setFromCurrency] = useState<CurrencyInfo>(currencies[0]);
  const [amount, setAmount] = useState("10,000,000");
  const [unit, setUnit] = useState<Unit>("rial");
  const [tab, setTab] = useState<Tab>(() => {
    try {
      const s = localStorage.getItem("ce_active_tab");
      if (s === "exchange" || s === "rates" || s === "archive" || s === "graph" || s === "about") return s;
    } catch { /* ignore */ }
    return "exchange";
  });
  const [showAllResults, setShowAllResults] = useState(false);

  const t = translations[lang];
  const isRtl = lang === "fa";
  const { data, loading, error, countdown, fetchRates, convert, getRatePair } =
    useExchangeRates(30_000);

  const numericAmount = useMemo(() => parseFloat(stripCommas(amount)) || 0, [amount]);

  const targetCurrencies = useMemo(
    () => currencies.filter((c) => c.code !== fromCurrency.code),
    [fromCurrency.code]
  );

  const displayedTargets = useMemo(() => {
    if (showAllResults) return targetCurrencies;
    const popular = targetCurrencies.filter((c) => POPULAR_CODES.has(c.code));
    return popular.length > 0 ? popular : targetCurrencies.slice(0, 10);
  }, [targetCurrencies, showAllResults]);

  // مبلغ محاسبه‌ای به ریال (وقتی مبدأ IRR است و واحد تومان، ×۱۰)
  const amountForConvert = useMemo(() => {
    if (fromCurrency.code === "IRR" && unit === "toman") {
      return Math.round(numericAmount * 10);
    }
    return numericAmount;
  }, [numericAmount, fromCurrency.code, unit]);

  const conversionResults = useMemo(() => {
    if (!data) return new Map<string, number | null>();
    const results = new Map<string, number | null>();
    for (const c of targetCurrencies) {
      results.set(c.code, convert(amountForConvert, fromCurrency.code, c.code));
    }
    return results;
  }, [data, targetCurrencies, amountForConvert, fromCurrency.code, convert]);

  const rateResults = useMemo(() => {
    const results = new Map<string, { buy: number | null; sell: number | null }>();
    if (!data) return results;
    for (const c of currencies) {
      if (c.isBase) continue;
      const pair = getRatePair(c.code);
      results.set(c.code, {
        buy: pair ? toDisplay(pair.buy, unit) : null,
        sell: pair ? toDisplay(pair.sell, unit) : null,
      });
    }
    return results;
  }, [data, getRatePair, unit]);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = stripCommas(e.target.value).replace(/[^0-9.]/g, "");
    setAmount(addCommas(raw));
  }, []);

  const handleLangToggle = useCallback(() => {
    setLang(l => l === "fa" ? "en" : "fa");
  }, []);

  const handleUnitToggle = useCallback(() => {
    setUnit((u) => {
      const next: Unit = u === "rial" ? "toman" : "rial";
      // فقط باکس مبدأ IRR: ریال→تومان ÷۱۰ و برعکس ×۱۰ (بدون اعشار اضافه)
      if (fromCurrency.code === "IRR") {
        setAmount((prev) => {
          const n = parseFloat(stripCommas(prev)) || 0;
          if (!n) return prev;
          if (next === "toman") {
            // ریال → تومان
            return addCommas(String(Math.floor(n / 10)));
          }
          // تومان → ریال
          return addCommas(String(Math.floor(n * 10)));
        });
      }
      return next;
    });
  }, [fromCurrency.code]);

  const handleCurrencySelect = useCallback((c: CurrencyInfo) => {
    setFromCurrency(c);
  }, []);

  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  useEffect(() => {
    try { localStorage.setItem("ce_active_tab", tab); } catch { /* ignore */ }
  }, [tab]);

  const unitLabel = unit === "toman" ? t.tomanUnit : t.rialUnit;

  return (
    <div className="min-h-[100dvh] font-vazir flex flex-col" dir={isRtl ? "rtl" : "ltr"}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 will-change-transform">
        <div className="absolute -top-32 -right-32 sm:-top-40 sm:-right-40 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 sm:-bottom-40 sm:-left-40 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-primary-400/10 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">

        {/* ── HEADER ── */}
        <header className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button onClick={handleLangToggle}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-xs sm:text-sm text-slate-300 hover:text-white hover:border-slate-500 transition-all cursor-pointer active:scale-95">
                {lang === "fa" ? (
                  <><FlagImg code="USD" size={18} /><span>EN</span></>
                ) : (
                  <><FlagImg code="IRR" size={18} /><span>فا</span></>
                )}
              </button>
              <button onClick={handleUnitToggle}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-xs sm:text-sm text-slate-300 hover:text-white hover:border-slate-500 transition-all cursor-pointer active:scale-95">
                {unit === "rial" ? "🪙 " + t.tomanUnit : "💴 " + t.rialUnit}
              </button>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={`w-2 h-2 rounded-full pulse-dot ${data?.source === "official" ? "bg-amber-400" : "bg-emerald-400"}`} />
              <span className={`text-[10px] sm:text-xs font-medium ${data?.source === "official" ? "text-amber-400" : "text-emerald-400"}`}>
                {data?.source === "official" ? t.officialRate : t.freeMarket}
              </span>
              {(data?.source === "bonbast-live" || data?.source === "live") && (
                <span className="text-[9px] sm:text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/30 rounded px-1.5 py-0.5 animate-pulse">
                  ● {t.liveNow}
                </span>
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-1">💱 {t.appTitle}</h1>
          <p className="text-slate-400 text-xs sm:text-sm mb-2">{t.appSubtitle}</p>

          <LiveClock lang={lang} t={t} />

          {data?.rateDate && (
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1">
              {lang === "fa" ? `📅 تاریخ نرخ: ${data.rateDate}` : `📅 Rate date: ${data.rateDate}`}
              {data.fetchedAt && (data.source === "bonbast-live" || data.source === "live") && (
                <span className="ms-2 text-slate-600" dir="ltr">
                  ({data.fetchedAt.toLocaleTimeString(lang === "fa" ? "fa-IR" : "en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })})
                </span>
              )}
            </p>
          )}
          {data?.source === "official" && (
            <p className="text-[10px] sm:text-[11px] text-amber-500/70 mt-2 max-w-md mx-auto px-2">{t.officialWarn}</p>
          )}

          {/* ── TABS ── */}
          <div className="flex items-center justify-start sm:justify-center gap-2 mt-4 sm:mt-5 overflow-x-auto overscroll-x-contain pb-1 -mx-1 px-1 scrollbar-thin">
            {([
              ["exchange", "🔄", t.exchangeTab],
              ["rates", "📊", t.ratesTab],
              ["archive", "🗂️", t.archiveTab],
              ["graph", "📈", t.graphTab],
              ["about", "ℹ️", t.aboutTab],
            ] as const).map(([id, icon, label]) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer active:scale-95 shrink-0 ${
                  tab === id
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20"
                    : "bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-500"
                }`}>
                <span>{icon}</span>
                <span className="whitespace-nowrap">{label}</span>
              </button>
            ))}
          </div>
        </header>

        {/* ── ERROR ── */}
        {error && !data && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 sm:p-6 text-center mb-4 sm:mb-6 fade-in">
            <p className="text-red-300 mb-3 text-sm">{t.error}</p>
            <button onClick={fetchRates}
              className="px-4 sm:px-5 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
              {t.retry}
            </button>
          </div>
        )}

        {/* ── LOADING ── */}
        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 fade-in">
            <div className="w-10 sm:w-12 h-10 sm:h-12 border-3 border-primary-500 border-t-transparent rounded-full spin-slow mb-4" />
            <p className="text-slate-400 text-sm">{t.loading}</p>
          </div>
        )}

        {data && tab === "exchange" && (
          <div className="fade-in space-y-4 sm:space-y-5">

            {/* ═══════════════════════════════════════════
                EXCHANGE
               ═══════════════════════════════════════════ */}
            <section className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl shadow-black/20">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 mb-4 sm:mb-5">
                <span className="text-base sm:text-lg">🔄</span>{t.converter}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div>
                  <label className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">{t.from}</label>
                  <CurrencyDropdown selected={fromCurrency} onSelect={handleCurrencySelect} lang={lang} unit={unit} />
                </div>
                <div>
                  <label className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
                    {t.amount}{fromCurrency.code === "IRR" ? ` (${unitLabel})` : ""}
                  </label>
                  <div className="relative">
                    <input type="text" inputMode="decimal" value={amount}
                      onChange={handleAmountChange}
                      placeholder={t.enterAmount}
                      className="w-full bg-slate-900/60 border border-slate-600/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-lg text-white font-semibold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all"
                      dir="ltr" />
                    <span className="absolute top-1/2 -translate-y-1/2 text-slate-500 text-[10px] sm:text-xs pointer-events-none ltr:right-3 rtl:right-3 sm:ltr:right-4 sm:rtl:right-4">
                      {fromCurrency.code === "IRR" ? unitLabel : fromCurrency.code}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {displayedTargets.map((c) => (
                  <ResultCard
                    key={c.code}
                    currency={c}
                    result={conversionResults.get(c.code) ?? null}
                    lang={lang}
                    unit={unit}
                    t={t}
                  />
                ))}
              </div>
              {targetCurrencies.length > displayedTargets.length || showAllResults ? (
                <button
                  type="button"
                  onClick={() => setShowAllResults((v) => !v)}
                  className="mt-3 w-full py-2 text-xs sm:text-sm text-primary-400 hover:text-primary-300 transition-colors cursor-pointer"
                >
                  {showAllResults ? t.showLess : `${t.showMore} (${targetCurrencies.length - displayedTargets.length}+)`}
                </button>
              ) : null}
            </section>

            {/* ═══════════════════════════════════════════
                FOOTER
               ═══════════════════════════════════════════ */}
            <footer className="mt-2 text-center py-4 sm:py-5">
              <p className="text-[10px] sm:text-xs text-slate-600">{t.poweredBy}</p>
            </footer>
          </div>
        )}

        {data && tab === "rates" && (
          <div className="fade-in space-y-4 sm:space-y-5">

            {/* ═══════════════════════════════════════════
                LIVE RATES TABLE
               ═══════════════════════════════════════════ */}
            <section className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
              <div className="px-3 sm:px-5 py-3 sm:py-3.5 border-b border-slate-700/40 flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span className="text-base sm:text-lg">📊</span>{t.liveRates}
                </h2>
                <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-400">
                  {loading && <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full spin-slow" />}
                  <button onClick={fetchRates}
                    className="text-primary-400 hover:text-primary-300 active:text-primary-500 transition-colors cursor-pointer p-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <span className="hidden xs:inline">{t.autoRefresh} <strong className="text-white">{countdown}</strong> {t.seconds}</span>
                  <span className="xs:hidden"><strong className="text-white">{countdown}</strong>s</span>
                </div>
              </div>

              <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {currencies.filter((c) => !c.isBase).map((c) => {
                  const rateData = rateResults.get(c.code);
                  return (
                    <RateCard
                      key={c.code}
                      currency={c}
                      buy={rateData?.buy ?? null}
                      sell={rateData?.sell ?? null}
                      lang={lang}
                      unitLabel={unitLabel}
                      t={t}
                    />
                  );
                })}
              </div>
            </section>

            {/* ═══════════════════════════════════════════
                GOLD & COINS
               ═══════════════════════════════════════════ */}
            {(data.source === "bonbast" || data.source === "bonbast-live") && Object.keys(data.gold).length > 0 && (
              <section className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
                <div className="px-3 sm:px-5 py-3 sm:py-3.5 border-b border-slate-700/40">
                  <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span className="text-base sm:text-lg">🪙</span>{t.goldRates}
                  </h2>
                </div>
                <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {goldItems.map((g) => {
                    const rate = data.gold[g.code];
                    if (!rate) return null;
                    const buyShown = toDisplay(rate.buyRial, unit);
                    const sellShown = toDisplay(rate.sellRial, unit);
                    return (
                      <div key={g.code}
                        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-amber-900/10 rounded-xl border border-amber-700/20 hover:border-amber-600/40 transition-colors">
                        <span className="text-xl sm:text-2xl leading-none shrink-0">{g.icon}</span>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-[11px] sm:text-[13px] text-white font-semibold truncate">{getGoldName(g, lang)}</span>
                          <span className="text-[9px] sm:text-[10px] text-slate-500">
                            {t.buy}: <span className="text-slate-400 font-mono" dir="ltr">{fmtRial(buyShown)}</span>
                          </span>
                        </div>
                        <div className="flex flex-col items-end shrink-0" dir="ltr">
                          <span className="text-[13px] sm:text-[14px] md:text-[15px] text-amber-400 font-bold font-mono tabular-nums leading-tight">
                            {fmtRial(sellShown)}
                          </span>
                          <span className="text-[8px] sm:text-[9px] text-slate-600 leading-tight mt-0.5">
                            {unitLabel} · {t.sell}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <p className="text-center text-[10px] sm:text-xs text-slate-600 py-2">{t.poweredBy}</p>
          </div>
        )}

        {data && (tab === "archive" || tab === "graph") && (
          <div className="fade-in">
            <ArchiveGraphPanel
              lang={lang}
              t={t}
              mode={tab === "graph" ? "graph" : "archive"}
              unit={unit}
            />
          </div>
        )}
        {tab === "about" && (
          <div className="fade-in space-y-4 sm:space-y-5">
            <section className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-6 shadow-xl shadow-black/20">
              <h2 className="text-base sm:text-lg font-bold text-white mb-3">{t.aboutTitle}</h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">{t.aboutBody}</p>

              <h3 className="text-sm font-bold text-white mb-2">{t.contactTitle}</h3>
              <div className="space-y-1.5 mb-6 text-sm">
                <p className="text-slate-400">
                  {t.phoneLabel}:{" "}
                  <a href="tel:+4915211981148" dir="ltr" className="text-primary-400 hover:text-primary-300">
                    +49 1521 198 1148
                  </a>
                </p>
                <p className="text-slate-400">
                  {t.emailLabel}:{" "}
                  <a href="mailto:masoud.kelayeh@gmail.com" dir="ltr" className="text-primary-400 hover:text-primary-300">
                    masoud.kelayeh@gmail.com
                  </a>
                </p>
              </div>

              <h3 className="text-sm font-bold text-white mb-2">{t.feedbackTitle}</h3>
              <FeedbackForm t={t} lang={lang} />
            </section>
          </div>
        )}

      </div>
    </div>
  );
}
