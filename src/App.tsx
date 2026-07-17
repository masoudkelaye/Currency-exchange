import { useState, useEffect } from "react";
import { type Lang, translations, currencies, getCurrencyName, type CurrencyInfo } from "./i18n";
import { useExchangeRates } from "./useExchangeRates";

/* ── helpers ─────────────────────────────────────────────── */
function fmtNum(n: number, maxDec = 2): string {
  if (n === 0) return "0";
  if (Math.abs(n) >= 1_000)
    return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (Math.abs(n) >= 1)
    return n.toLocaleString("en-US", { maximumFractionDigits: maxDec });
  if (Math.abs(n) >= 0.001)
    return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
  return n.toLocaleString("en-US", { maximumFractionDigits: 10 });
}

function fmtRial(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/* ── currency card ───────────────────────────────────────── */
function CurrencyCard({
  currency, isSelected, onClick, lang, price,
}: {
  currency: CurrencyInfo; isSelected: boolean;
  onClick: () => void; lang: Lang; price: string | null;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer w-full
        ${isSelected
          ? "bg-primary-600/20 border-primary-500/60 shadow-lg shadow-primary-500/10 ring-1 ring-primary-500/30"
          : "bg-slate-800/40 border-slate-700/40 hover:bg-slate-700/40 hover:border-slate-600/60"
        }`}
    >
      <span className="text-xl leading-none shrink-0">{currency.flag}</span>
      <div className="flex flex-col flex-1 min-w-0 text-start">
        <span className={`text-[12.5px] font-semibold truncate ${isSelected ? "text-primary-300" : "text-white"}`}>
          {getCurrencyName(currency, lang)}
        </span>
        <span className="text-[10px] text-slate-500 leading-tight">{currency.code}</span>
      </div>
      {price && (
        <span className="text-[10px] text-slate-400 font-mono shrink-0 leading-none" dir="ltr">
          {price}
        </span>
      )}
      {isSelected && (
        <div className="absolute top-1.5 ltr:right-1.5 rtl:left-1.5 w-1.5 h-1.5 rounded-full bg-primary-400" />
      )}
    </button>
  );
}

/* ── rate card (for live table) ───────────────────────────── */
function RateCard({
  currency, rialPrice, updateTime, lang, t,
}: {
  currency: CurrencyInfo; rialPrice: number | null;
  updateTime: string; lang: Lang; t: (typeof translations)["fa"];
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-colors">
      <span className="text-2xl leading-none shrink-0">{currency.flag}</span>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[13px] text-white font-semibold truncate">
          {getCurrencyName(currency, lang)}
        </span>
        <span className="text-[10px] text-slate-500">{currency.code} • {currency.symbol}</span>
      </div>
      <div className="flex flex-col items-end shrink-0" dir="ltr">
        <span className="text-[14px] md:text-[15px] text-emerald-400 font-bold font-mono tabular-nums leading-tight">
          {rialPrice !== null ? fmtRial(rialPrice) : "—"}
        </span>
        <span className="text-[9px] text-slate-600 leading-tight mt-0.5">
          {currency.apiDivisor
            ? `${t.perUnits} ${currency.apiDivisor} ${lang === "fa" ? "واحد" : "units"}`
            : t.perUnit}
          {" • "}{updateTime}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  const [lang, setLang] = useState<Lang>("fa");
  const [fromCurrency, setFromCurrency] = useState<CurrencyInfo>(currencies[0]);
  const [toCurrency, setToCurrency]     = useState<CurrencyInfo>(currencies[1]);
  const [amount, setAmount] = useState("10000000");

  const t     = translations[lang];
  const isRtl = lang === "fa";
  const { data, loading, error, countdown, fetchRates, convert, getRateInRial } =
    useExchangeRates(30_000);

  const numericAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const result = convert(
    numericAmount,
    fromCurrency.apiSymbol, toCurrency.apiSymbol,
    fromCurrency.apiDivisor, toCurrency.apiDivisor,
  );

  const handleSwap = () => {
    const tmp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(tmp);
    if (result !== null && result > 0)
      setAmount(result >= 1 ? Math.round(result).toString() : result.toFixed(6));
  };

  useEffect(() => {
    document.documentElement.dir  = isRtl ? "rtl" : "ltr";
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
            <button
              onClick={() => setLang(lang === "fa" ? "en" : "fa")}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-slate-300 hover:text-white hover:border-slate-500 transition-all cursor-pointer"
            >
              {lang === "fa" ? "🇬🇧 English" : "🇮🇷 فارسی"}
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full pulse-dot ${data?.source === "free-market" ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className={`text-xs font-medium ${data?.source === "free-market" ? "text-emerald-400" : "text-amber-400"}`}>
                {data?.source === "free-market"
                  ? t.freeMarket
                  : (lang === "fa" ? "نرخ رسمی" : "Official Rate")}
              </span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1">💱 {t.appTitle}</h1>
          <p className="text-slate-400 text-sm">{t.appSubtitle}</p>
          {data?.source === "official" && (
            <p className="text-[11px] text-amber-500/70 mt-2 max-w-md mx-auto">
              {lang === "fa"
                ? "⚠️ نمایش نرخ رسمی بانک مرکزی (محدودیت دسترسی به API بازار آزاد)"
                : "⚠️ Displaying official central-bank rate (free-market API unavailable)"}
            </p>
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

            {/* ═══════════════════════════════════════════════
                1) CONVERTER  (top)
               ═══════════════════════════════════════════════ */}
            <section className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 md:p-6 shadow-xl shadow-black/20">
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-5">
                <span className="text-lg">🔄</span>
                {t.converter}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-5">

                {/* ── FROM ── */}
                <div className="space-y-3">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-600/30 text-primary-400 flex items-center justify-center text-[10px] font-bold">۱</span>
                    {t.from}
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {currencies.map((c) => {
                      const rialPrice = c.isBase ? null : getRateInRial(c.apiSymbol, c.apiDivisor);
                      const tag = rialPrice
                        ? `${fmtRial(c.apiDivisor ? rialPrice * c.apiDivisor : rialPrice)} ﷼`
                        : null;
                      return (
                        <CurrencyCard key={c.code} currency={c}
                          isSelected={fromCurrency.code === c.code}
                          onClick={() => setFromCurrency(c)}
                          lang={lang} price={tag} />
                      );
                    })}
                  </div>

                  {/* amount input */}
                  <div className="relative mt-1">
                    <input type="text" inputMode="decimal" value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                      placeholder={t.enterAmount}
                      className="w-full bg-slate-900/60 border border-slate-600/50 rounded-xl px-4 py-3.5 text-lg text-white font-semibold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all"
                      dir="ltr" />
                    <span className="absolute top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none"
                      style={{ right: 16 }}>
                      {fromCurrency.code}
                    </span>
                  </div>
                </div>

                {/* ── SWAP ── */}
                <div className="flex items-center justify-center lg:pt-10">
                  <button onClick={handleSwap} title={t.swap}
                    className="group p-3.5 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 rounded-full shadow-lg shadow-primary-600/20 transition-all duration-200 cursor-pointer active:scale-90 lg:rotate-0 rotate-90">
                    <svg className="w-5 h-5 text-white transition-transform group-hover:rotate-180 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </button>
                </div>

                {/* ── TO ── */}
                <div className="space-y-3">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-[10px] font-bold">۲</span>
                    {t.to}
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {currencies.map((c) => {
                      const rialPrice = c.isBase ? null : getRateInRial(c.apiSymbol, c.apiDivisor);
                      const tag = rialPrice
                        ? `${fmtRial(c.apiDivisor ? rialPrice * c.apiDivisor : rialPrice)} ﷼`
                        : null;
                      return (
                        <CurrencyCard key={c.code} currency={c}
                          isSelected={toCurrency.code === c.code}
                          onClick={() => setToCurrency(c)}
                          lang={lang} price={tag} />
                      );
                    })}
                  </div>

                  {/* result box */}
                  <div className="mt-1 bg-gradient-to-br from-emerald-900/30 to-emerald-800/10 border border-emerald-700/30 rounded-xl px-4 py-3.5">
                    <div className="text-[11px] text-emerald-500/80 uppercase tracking-wider font-medium mb-1">
                      {t.result}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl md:text-3xl font-bold text-white font-mono" dir="ltr">
                        {result !== null ? fmtNum(result, 4) : "—"}
                      </span>
                      <span className="text-sm text-slate-400">{toCurrency.code}</span>
                    </div>
                    {result !== null && fromCurrency.code !== toCurrency.code && (
                      <div className="mt-2 text-[11px] text-slate-500" dir="ltr">
                        1 {fromCurrency.code} ={" "}
                        {fmtNum(
                          convert(1, fromCurrency.apiSymbol, toCurrency.apiSymbol,
                            fromCurrency.apiDivisor, toCurrency.apiDivisor) ?? 0, 6,
                        )}{" "}
                        {toCurrency.code}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════
                2) LIVE RATES  (bottom — two-column grid)
               ═══════════════════════════════════════════════ */}
            <section className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
              {/* header bar */}
              <div className="px-5 py-3.5 border-b border-slate-700/40 flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  {t.liveRates}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {loading && (
                    <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full spin-slow" />
                  )}
                  <button onClick={fetchRates}
                    className="text-primary-400 hover:text-primary-300 transition-colors cursor-pointer flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <span>{t.autoRefresh} <strong className="text-white">{countdown}</strong> {t.seconds}</span>
                </div>
              </div>

              {/* two-column grid of rate cards */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {currencies.filter((c) => !c.isBase).map((c) => {
                  const rate = data.rates[c.apiSymbol];
                  const rialPrice  = rate ? rate.sellRial : null;
                  const updateTime = rate?.lastUpdate?.split(" ")[1] ?? "—";

                  return (
                    <RateCard
                      key={c.code}
                      currency={c}
                      rialPrice={rialPrice}
                      updateTime={updateTime}
                      lang={lang}
                      t={t}
                    />
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
