import { useState, useEffect, useCallback, useRef, useMemo } from "react";

export interface CurrencyRate {
  symbol: string;
  sellRial: number;
  buyRial: number;
  lastUpdate: string;
}

export interface GoldRate {
  code: string;
  sellRial: number;
  buyRial: number;
  lastUpdate: string;
}

export interface RatesData {
  rates: Record<string, CurrencyRate>;
  gold: Record<string, GoldRate>;
  fetchedAt: Date;
  source: "bonbast" | "official";
  rateDate: string;
}

const TOMAN_TO_RIAL = 10;
const FETCH_TIMEOUT = 10000;
const CACHE_KEY = "bonbast_rates_v3";
const CACHE_MAX_AGE = 3 * 60 * 1000;

const ARCHIVE_DIVISORS: Record<string, number> = { jpy: 10, amd: 10, iqd: 100 };
const GOLD_CODES = ["azadi1", "emami1", "azadi1_2", "azadi1_4", "azadi1g"];

function loadCache(): RatesData | null {
  try {
    const c = localStorage.getItem(CACHE_KEY);
    if (!c) return null;
    const { data, ts } = JSON.parse(c);
    if (Date.now() - ts > CACHE_MAX_AGE) return null;
    return { ...data, fetchedAt: new Date(data.fetchedAt) };
  } catch { return null; }
}

function saveCache(data: RatesData) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

async function fetchJSON(url: string, timeout = FETCH_TIMEOUT) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } finally { clearTimeout(id); }
}

// ══════════════════════════════════════════════════════════
//  BONBAST ARCHIVE (from bonbast.com via GitHub)
// ══════════════════════════════════════════════════════════
async function fetchFromBonbast(): Promise<RatesData | null> {
  const urls = [
    "https://cdn.jsdelivr.net/gh/SamadiPour/rial-exchange-rates-archive@data/gregorian_7days.min.json",
    "https://raw.githubusercontent.com/SamadiPour/rial-exchange-rates-archive/data/gregorian_7days.min.json",
  ];

  for (const url of urls) {
    try {
      const json = await fetchJSON(url);
      if (!json || typeof json !== "object") continue;

      const dates = Object.keys(json).sort().reverse();
      if (dates.length === 0) continue;

      const latestDate = dates[0];
      const dayData = json[latestDate];
      if (!dayData?.usd?.sell) continue;

      const rates: Record<string, CurrencyRate> = {};
      const gold: Record<string, GoldRate> = {};

      for (const [code, val] of Object.entries(dayData)) {
        const v = val as { sell?: number; buy?: number };
        if (!v.sell) continue;

        // Gold & coins
        if (GOLD_CODES.includes(code)) {
          gold[code] = {
            code,
            sellRial: v.sell * TOMAN_TO_RIAL,
            buyRial: (v.buy ?? v.sell) * TOMAN_TO_RIAL,
            lastUpdate: latestDate,
          };
          continue;
        }

        const divisor = ARCHIVE_DIVISORS[code] ?? 1;
        rates[code.toUpperCase()] = {
          symbol: code.toUpperCase(),
          sellRial: (v.sell * TOMAN_TO_RIAL) / divisor,
          buyRial: ((v.buy ?? v.sell) * TOMAN_TO_RIAL) / divisor,
          lastUpdate: latestDate,
        };
      }

      if (rates.USD && rates.EUR) {
        return { rates, gold, fetchedAt: new Date(), source: "bonbast", rateDate: latestDate };
      }
    } catch { continue; }
  }
  return null;
}

// ══════════════════════════════════════════════════════════
//  OPEN ER API (official fallback)
// ══════════════════════════════════════════════════════════
async function fetchFromOpenEr(): Promise<RatesData | null> {
  try {
    const json = await fetchJSON("https://open.er-api.com/v6/latest/USD");
    if (json.result !== "success" || !json.rates?.IRR) return null;

    const irrPerUsd = json.rates.IRR as number;
    const ts = json.time_last_update_utc ?? new Date().toISOString();
    const rates: Record<string, CurrencyRate> = {};

    for (const [code, ratePerUsd] of Object.entries(json.rates)) {
      if (code === "USD") continue;
      const rialPrice = irrPerUsd / (ratePerUsd as number);
      rates[code] = { symbol: code, sellRial: rialPrice, buyRial: rialPrice, lastUpdate: ts };
    }

    return { rates, gold: {}, fetchedAt: new Date(), source: "official", rateDate: ts.split("T")[0] };
  } catch { return null; }
}

// ══════════════════════════════════════════════════════════
//  HOOK
// ══════════════════════════════════════════════════════════
export function useExchangeRates(refreshInterval = 30_000) {
  const [data, setData] = useState<RatesData | null>(() => loadCache());
  const [loading, setLoading] = useState(!loadCache());
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(refreshInterval / 1000);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFetchingRef = useRef(false);

  const fetchRates = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      setLoading(true);
      setError(null);

      const bonbast = await fetchFromBonbast();
      if (bonbast) { setData(bonbast); saveCache(bonbast); setCountdown(refreshInterval / 1000); return; }

      const official = await fetchFromOpenEr();
      if (official) { setData(official); saveCache(official); setCountdown(refreshInterval / 1000); return; }

      throw new Error("All sources failed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [refreshInterval]);

  useEffect(() => {
    fetchRates();
    timerRef.current = setInterval(fetchRates, refreshInterval);
    countdownRef.current = setInterval(() => {
      setCountdown((p) => (p <= 1 ? refreshInterval / 1000 : p - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchRates, refreshInterval]);

  const convert = useCallback(
    (amount: number, from: string, to: string): number | null => {
      if (!data?.rates) return null;
      if (from === "IRR" && to === "IRR") return amount;
      if (from === "IRR") { const r = data.rates[to]; return r ? amount / r.sellRial : null; }
      if (to === "IRR") { const r = data.rates[from]; return r ? amount * r.sellRial : null; }
      const rF = data.rates[from], rT = data.rates[to];
      return (rF && rT) ? (amount * rF.sellRial) / rT.sellRial : null;
    }, [data]
  );

  const getRateInRial = useCallback(
    (sym: string): number | null => data?.rates?.[sym]?.sellRial ?? null,
    [data]
  );

  return useMemo(() => ({
    data, loading, error, countdown, fetchRates, convert, getRateInRial,
  }), [data, loading, error, countdown, fetchRates, convert, getRateInRial]);
}
