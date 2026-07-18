import { useState, useEffect, useRef } from "react";
import { type Lang, translations, currencies, getCurrencyName, type CurrencyInfo } from "./i18n";
import { useExchangeRates } from "./useExchangeRates";

/* ── helpers ──────────────────────────────────────────── */
function fmt(n: number): string {
  if (n === 0) return "0";
  if (Math.abs(n) >= 1_000)
    return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (Math.abs(n) >= 1)
    return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (Math.abs(n) >= 0.001)
    return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
  return n.toLocaleString("en-US", { maximumFractionDigits: 10 });
}

function fmtRial(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/* ── dropdown selector ────────────────────────────────── */
function CurrencyDropdown({
  selected, onSelect, lang,
}: {
  selected: CurrencyInfo;
  onSelect: (c: CurrencyInfo) => void;
  lang: Lang;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 bg-slate-800/80 border border-slate-600/50 rounded-xl px-4 py-3 text-white hover:border-primary-400/50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/40"
      >
        <span className="text-2xl">{selected.flag}</span>
        <div className="flex flex-col items-start flex-1">
          <span className="font-semibold text-sm">{getCurrencyName(selected, lang)}</span>
          <span className="text-xs text-slate-400">{selected.code}</span>
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 w-full bg-slate-800 border border-slate-600/50 rounded-xl shadow-2xl shadow-black/50 overflow-hidden fade-in">
          <div className="max-h-72 overflow-y-auto">
            {currencies.map((c) => (
              <button key={c.code}
                onClick={() => { onSelect(c); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700/50 transition-colors cursor-pointer text-start
                  ${c.code === selected.code ? "bg-primary-600/20" : ""}`}
              >
                <span className="text-xl">{c.flag}</span>
                <div className="flex flex-col flex-1">
                  <span className="text-sm text-white font-medium">{getCurrencyName(c, lang)}</span>
                  <span className="text-xs text-slate-400">{c.code}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════ */
export default function App() {
  const [lang, setLang] = useState<Lang>("fa");
  const [fromCurrency, setFromCurrency] = useState<CurrencyInfo>(currencies[0]); // IRR
  const [amount, setAmount] = useState("10000000");

  const t = translations[lang];
  const isRtl = lang === "fa";
  const { data, loading, error, countdown, fetchRates, convert, getRateInRial } =
    useExchangeRates(30_000);

  const numericAmount = parseFloat(amount.replace(/,/g, "")) || 0;

  // Convert to all OTHER currencies
  const targetCurrencies = currencies.filter((c) => c.code !== fromCurrency.code);

  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  return (
    <div className="min-h-screen font-vazir" dir={isRtl ? "rtl" : "ltr"}>
      {/* background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary-600/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-primary-400/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 md:py-8">

        {/* ── HEADER ── */}
        <header className="text-center mb-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setLang(lang === "fa" ? "en" : "fa")}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-slate-300 hover:text-white hover:border-slate-500 transition-all cursor-pointer">
              {lang === "fa" ? "🇬🇧 English" : "🇮🇷 فارسی"}
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full pulse-dot ${data?.source === "official" ? "bg-amber-400" : "bg-emerald-400"}`} />
              <span className={`text-xs font-medium ${data?.source === "official" ? "text-amber-400" : "text-emerald-400"}`}>
                {data?.source === "official" ? t.officialRate : t.freeMarket}
              </span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1">💱 {t.appTitle}</h1>
          <p className="text-slate-400 text-sm">{t.appSubtitle}</p>
          {data?.source === "official" && (
            <p className="text-[11px] text-amber-500/70 mt-2 max-w-md mx-auto">{t.officialWarn}</p>
          )}
        </header>

        {/* ── ERROR ── */}
        {error && !data && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-6 text-center mb-6 fade-in">
            <p className="text-red-300 mb-3">{t.error}</p>
            <button onClick={fetchRates}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
              {t.retry}
            </button>
          </div>
        )}

        {/* ── LOADING ── */}
        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-20 fade-in">
            <div className="w-12 h-12 border-3 border-primary-500 border-t-transparent rounded-full spin-slow mb-4" />
            <p className="text-slate-400">{t.loading}</p>
          </div>
        )}

        {data && (
          <div className="fade-in space-y-5">

            {/* ═══════════════════════════════════════════
                1) CONVERTER — dropdown + amount + all results
               ═══════════════════════════════════════════ */}
            <section className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 md:p-6 shadow-xl shadow-black/20">
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-5">
                <span className="text-lg">🔄</span>{t.converter}
              </h2>

              {/* top row: dropdown + amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {/* from currency dropdown */}
                <div>
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">{t.from}</label>
                  <CurrencyDropdown selected={fromCurrency} onSelect={setFromCurrency} lang={lang} />
                </div>
                {/* amount */}
                <div>
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">{t.amount}</label>
                  <div className="relative">
                    <input type="text" inputMode="decimal" value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                      placeholder={t.enterAmount}
                      className="w-full bg-slate-900/60 border border-slate-600/50 rounded-xl px-4 py-3 text-lg text-white font-semibold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all"
                      dir="ltr" />
                    <span className="absolute top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none" style={{ right: 16 }}>
                      {fromCurrency.code}
                    </span>
                  </div>
                </div>
              </div>

              {/* converted results — all currencies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {targetCurrencies.map((c) => {
                  const result = convert(numericAmount, fromCurrency.code, c.code);
                  return (
                    <div key={c.code}
                      className="flex items-center gap-3 px-4 py-3 bg-slate-900/40 border border-slate-700/30 rounded-xl hover:border-slate-600/60 transition-colors">
                      <span className="text-2xl leading-none shrink-0">{c.flag}</span>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[13px] text-white font-semibold truncate">{getCurrencyName(c, lang)}</span>
                        <span className="text-[10px] text-slate-500">{c.code}</span>
                      </div>
                      <div className="flex flex-col items-end shrink-0" dir="ltr">
                        <span className="text-[15px] md:text-base text-emerald-400 font-bold font-mono tabular-nums leading-tight">
                          {result !== null ? fmt(result) : "—"}
                        </span>
                        <span className="text-[10px] text-slate-500">{c.symbol}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ═══════════════════════════════════════════
                2) LIVE RATES TABLE — two-column
               ═══════════════════════════════════════════ */}
            <section className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
              <div className="px-5 py-3.5 border-b border-slate-700/40 flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-lg">📊</span>{t.liveRates}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {loading && <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full spin-slow" />}
                  <button onClick={fetchRates}
                    className="text-primary-400 hover:text-primary-300 transition-colors cursor-pointer">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <span>{t.autoRefresh} <strong className="text-white">{countdown}</strong> {t.seconds}</span>
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {currencies.filter((c) => !c.isBase).map((c) => {
                  const rial = getRateInRial(c.code);
                  const updateStr = data.rates[c.code]?.lastUpdate?.split(" ")[1]
                    ?? data.rates[c.code]?.lastUpdate?.substring(0, 10) ?? "—";

                  return (
                    <div key={c.code}
                      className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                      <span className="text-2xl leading-none shrink-0">{c.flag}</span>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[13px] text-white font-semibold truncate">{getCurrencyName(c, lang)}</span>
                        <span className="text-[10px] text-slate-500">{c.code} • {c.symbol}</span>
                      </div>
                      <div className="flex flex-col items-end shrink-0" dir="ltr">
                        <span className="text-[14px] md:text-[15px] text-emerald-400 font-bold font-mono tabular-nums leading-tight">
                          {rial !== null ? fmtRial(rial) : "—"}
                        </span>
                        <span className="text-[9px] text-slate-600 leading-tight mt-0.5">
                          {t.perUnit} • {updateStr}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* footer */}
            <footer className="text-center text-xs text-slate-600 py-2">
              <p>{t.poweredBy}</p>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
