import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { type Lang, translations, currencies, getCurrencyName, type CurrencyInfo } from "./i18n";
import { useExchangeRates } from "./useExchangeRates";

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
  
  // Keep cache size manageable
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

/* ══════════════════════════════════════════════════════════
   MEMOIZED COMPONENTS
   ══════════════════════════════════════════════════════════ */

/* ── Currency Dropdown ── */
const CurrencyDropdown = memo(function CurrencyDropdown({
  selected, onSelect, lang,
}: {
  selected: CurrencyInfo;
  onSelect: (c: CurrencyInfo) => void;
  lang: Lang;
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
        <span className="text-xl sm:text-2xl">{selected.flag}</span>
        <div className="flex flex-col items-start flex-1 min-w-0">
          <span className="font-semibold text-xs sm:text-sm truncate w-full">{getCurrencyName(selected, lang)}</span>
          <span className="text-[10px] sm:text-xs text-slate-400">{selected.code}</span>
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
                <span className="text-lg sm:text-xl">{c.flag}</span>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs sm:text-sm text-white font-medium truncate">{getCurrencyName(c, lang)}</span>
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

/* ── Result Card ── */
const ResultCard = memo(function ResultCard({
  currency, result, lang,
}: {
  currency: CurrencyInfo;
  result: number | null;
  lang: Lang;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-900/40 border border-slate-700/30 rounded-xl hover:border-slate-600/60 active:bg-slate-800/50 transition-colors">
      <span className="text-xl sm:text-2xl leading-none shrink-0">{currency.flag}</span>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[11px] sm:text-[13px] text-white font-semibold truncate">{getCurrencyName(currency, lang)}</span>
        <span className="text-[9px] sm:text-[10px] text-slate-500">{currency.code}</span>
      </div>
      <div className="flex flex-col items-end shrink-0" dir="ltr">
        <span className="text-[13px] sm:text-[15px] md:text-base text-emerald-400 font-bold font-mono tabular-nums leading-tight">
          {result !== null ? fmt(result) : "—"}
        </span>
        <span className="text-[9px] sm:text-[10px] text-slate-500">{currency.symbol}</span>
      </div>
    </div>
  );
});

/* ── Rate Card ── */
const RateCard = memo(function RateCard({
  currency, rial, updateStr, lang, perUnit,
}: {
  currency: CurrencyInfo;
  rial: number | null;
  updateStr: string;
  lang: Lang;
  perUnit: string;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:border-slate-600/50 active:bg-slate-700/30 transition-colors">
      <span className="text-xl sm:text-2xl leading-none shrink-0">{currency.flag}</span>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[11px] sm:text-[13px] text-white font-semibold truncate">{getCurrencyName(currency, lang)}</span>
        <span className="text-[9px] sm:text-[10px] text-slate-500">{currency.code} • {currency.symbol}</span>
      </div>
      <div className="flex flex-col items-end shrink-0" dir="ltr">
        <span className="text-[13px] sm:text-[14px] md:text-[15px] text-emerald-400 font-bold font-mono tabular-nums leading-tight">
          {rial !== null ? fmtRial(rial) : "—"}
        </span>
        <span className="text-[8px] sm:text-[9px] text-slate-600 leading-tight mt-0.5">
          {perUnit} • {updateStr}
        </span>
      </div>
    </div>
  );
});

/* ══════════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════════ */
export default function App() {
  const [lang, setLang] = useState<Lang>("fa");
  const [fromCurrency, setFromCurrency] = useState<CurrencyInfo>(currencies[0]);
  const [amount, setAmount] = useState("10,000,000");

  const t = translations[lang];
  const isRtl = lang === "fa";
  const { data, loading, error, countdown, fetchRates, convert, getRateInRial } =
    useExchangeRates(30_000);

  // Memoized calculations
  const numericAmount = useMemo(() => parseFloat(stripCommas(amount)) || 0, [amount]);
  
  const targetCurrencies = useMemo(
    () => currencies.filter((c) => c.code !== fromCurrency.code),
    [fromCurrency.code]
  );

  // Memoized conversion results
  const conversionResults = useMemo(() => {
    if (!data) return new Map<string, number | null>();
    const results = new Map<string, number | null>();
    for (const c of targetCurrencies) {
      results.set(c.code, convert(numericAmount, fromCurrency.code, c.code));
    }
    return results;
  }, [data, targetCurrencies, numericAmount, fromCurrency.code, convert]);

  // Memoized rate results
  const rateResults = useMemo(() => {
    if (!data) return new Map<string, { rial: number | null; updateStr: string }>();
    const results = new Map<string, { rial: number | null; updateStr: string }>();
    for (const c of currencies) {
      if (c.isBase) continue;
      const rial = getRateInRial(c.code);
      const updateStr = data.rates[c.code]?.lastUpdate?.split(" ")[1]
        ?? data.rates[c.code]?.lastUpdate?.substring(5, 10) ?? "—";
      results.set(c.code, { rial, updateStr });
    }
    return results;
  }, [data, getRateInRial]);

  // Callbacks
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = stripCommas(e.target.value).replace(/[^0-9.]/g, "");
    setAmount(addCommas(raw));
  }, []);

  const handleLangToggle = useCallback(() => {
    setLang(l => l === "fa" ? "en" : "fa");
  }, []);

  const handleCurrencySelect = useCallback((c: CurrencyInfo) => {
    setFromCurrency(c);
  }, []);

  // Document direction effect
  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  return (
    <div className="min-h-[100dvh] font-vazir flex flex-col" dir={isRtl ? "rtl" : "ltr"}>
      {/* background - using CSS for GPU acceleration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 will-change-transform">
        <div className="absolute -top-32 -right-32 sm:-top-40 sm:-right-40 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 sm:-bottom-40 sm:-left-40 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-primary-400/10 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">

        {/* ── HEADER ── */}
        <header className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <button onClick={handleLangToggle}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-xs sm:text-sm text-slate-300 hover:text-white hover:border-slate-500 transition-all cursor-pointer active:scale-95">
              {lang === "fa" ? "🇬🇧 EN" : "🇮🇷 فا"}
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={`w-2 h-2 rounded-full pulse-dot ${data?.source === "official" ? "bg-amber-400" : "bg-emerald-400"}`} />
              <span className={`text-[10px] sm:text-xs font-medium ${data?.source === "official" ? "text-amber-400" : "text-emerald-400"}`}>
                {data?.source === "official" ? t.officialRate : t.freeMarket}
              </span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-1">💱 {t.appTitle}</h1>
          <p className="text-slate-400 text-xs sm:text-sm">{t.appSubtitle}</p>
          {data?.source === "official" && (
            <p className="text-[10px] sm:text-[11px] text-amber-500/70 mt-2 max-w-md mx-auto px-2">{t.officialWarn}</p>
          )}
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

        {data && (
          <div className="fade-in space-y-4 sm:space-y-5">

            {/* ═══════════════════════════════════════════
                1) CONVERTER
               ═══════════════════════════════════════════ */}
            <section className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl shadow-black/20">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 mb-4 sm:mb-5">
                <span className="text-base sm:text-lg">🔄</span>{t.converter}
              </h2>

              {/* top row: dropdown + amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div>
                  <label className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">{t.from}</label>
                  <CurrencyDropdown selected={fromCurrency} onSelect={handleCurrencySelect} lang={lang} />
                </div>
                <div>
                  <label className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">{t.amount}</label>
                  <div className="relative">
                    <input type="text" inputMode="decimal" value={amount}
                      onChange={handleAmountChange}
                      placeholder={t.enterAmount}
                      className="w-full bg-slate-900/60 border border-slate-600/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-lg text-white font-semibold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all"
                      dir="ltr" />
                    <span className="absolute top-1/2 -translate-y-1/2 text-slate-500 text-[10px] sm:text-xs pointer-events-none ltr:right-3 rtl:right-3 sm:ltr:right-4 sm:rtl:right-4">
                      {fromCurrency.code}
                    </span>
                  </div>
                </div>
              </div>

              {/* converted results */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {targetCurrencies.map((c) => (
                  <ResultCard
                    key={c.code}
                    currency={c}
                    result={conversionResults.get(c.code) ?? null}
                    lang={lang}
                  />
                ))}
              </div>
            </section>

            {/* ═══════════════════════════════════════════
                2) LIVE RATES TABLE
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
                      rial={rateData?.rial ?? null}
                      updateStr={rateData?.updateStr ?? "—"}
                      lang={lang}
                      perUnit={t.perUnit}
                    />
                  );
                })}
              </div>
            </section>

            {/* ═══════════════════════════════════════════
                FOOTER
               ═══════════════════════════════════════════ */}
            <footer className="mt-2 text-center py-4 sm:py-5 space-y-4">
              <p className="text-[10px] sm:text-xs text-slate-600">{t.poweredBy}</p>

              <div className="space-y-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  {lang === "fa" ? "📬 تماس با ما" : "📬 Contact Us"}
                </h3>
                <a href="tel:+4915211981148" dir="ltr"
                  className="block text-slate-400 hover:text-primary-400 transition-colors text-[11px] sm:text-xs">
                  +49 1521 198 1148
                </a>
                <a href="mailto:masoud.kelayeh@gmail.com" dir="ltr"
                  className="block text-slate-400 hover:text-primary-400 transition-colors text-[11px] sm:text-xs">
                  masoud.kelayeh@gmail.com
                </a>
              </div>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
