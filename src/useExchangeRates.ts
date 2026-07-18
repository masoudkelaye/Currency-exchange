import { useState, useEffect, useCallback, useRef, useMemo } from "react";

export interface CurrencyRate {
  symbol: string;
  sellRial: number;
  lastUpdate: string;
  source: "free-market" | "official";
}

export interface RatesData {
  rates: Record<string, CurrencyRate>;
  fetchedAt: Date;
  source: "free-market" | "official";
}

// ── Constants ──
const TOMAN_TO_RIAL = 10;
const FETCH_TIMEOUT = 8000;
const CACHE_KEY = "currency_rates_cache";
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

// ── Helpers ──
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

async function fetchJSON(url: string, timeout = FETCH_TIMEOUT) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { 
      signal: ctrl.signal,
      headers: { "Accept": "application/json" },
    });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

// Archive divisors for currencies given as "per X units"
const ARCHIVE_DIVISORS: Record<string, number> = {
  jpy: 10, amd: 10, iqd: 100,
};

// ── Cache helpers ──
function loadCache(): RatesData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_MAX_AGE) return null;
    return { ...data, fetchedAt: new Date(data.fetchedAt) };
  } catch {
    return null;
  }
}

function saveCache(data: RatesData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // localStorage might be full or disabled
  }
}

// ── Data fetchers ──
async function fetchFromArchive(): Promise<RatesData | null> {
  const base = "https://raw.githubusercontent.com/SamadiPour/rial-exchange-rates-archive/main/gregorian";
  
  for (const dateStr of [todayStr(), yesterdayStr()]) {
    try {
      const json = await fetchJSON(`${base}/${dateStr}`);
      if (!json || typeof json !== "object") continue;

      const rates: Record<string, CurrencyRate> = {};
      for (const [code, val] of Object.entries(json)) {
        const v = val as { sell?: number };
        if (!v.sell) continue;
        const divisor = ARCHIVE_DIVISORS[code] ?? 1;
        rates[code.toUpperCase()] = {
          symbol: code.toUpperCase(),
          sellRial: (v.sell * TOMAN_TO_RIAL) / divisor,
          lastUpdate: dateStr,
          source: "free-market",
        };
      }

      if (rates.USD && rates.EUR) {
        return { rates, fetchedAt: new Date(), source: "free-market" };
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function fetchFromOpenEr(): Promise<RatesData | null> {
  try {
    const json = await fetchJSON("https://open.er-api.com/v6/latest/USD");
    if (json.result !== "success" || !json.rates?.IRR) return null;

    const irrPerUsd = json.rates.IRR as number;
    const ts = json.time_last_update_utc ?? new Date().toISOString();
    const rates: Record<string, CurrencyRate> = {};

    for (const [code, ratePerUsd] of Object.entries(json.rates)) {
      if (code === "USD") continue;
      rates[code] = {
        symbol: code,
        sellRial: irrPerUsd / (ratePerUsd as number),
        lastUpdate: ts,
        source: "official",
      };
    }

    return { rates, fetchedAt: new Date(), source: "official" };
  } catch {
    return null;
  }
}

async function fetchFromBaha24(): Promise<RatesData | null> {
  const direct = "https://baha24.com/api/v1/price";
  const urls = [
    direct,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(direct)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(direct)}`,
  ];

  for (const url of urls) {
    try {
      const json = await fetchJSON(url, 6000);
      if (!Array.isArray(json)) continue;

      const rates: Record<string, CurrencyRate> = {};
      for (const item of json) {
        if (!item?.symbol || !item?.sell) continue;
        const divisor = item.symbol === "JPY" ? 10 : 1;
        rates[item.symbol] = {
          symbol: item.symbol,
          sellRial: (parseFloat(item.sell) * TOMAN_TO_RIAL) / divisor,
          lastUpdate: item.last_update ?? "",
          source: "free-market",
        };
      }

      if (rates.USD && rates.EUR) {
        return { rates, fetchedAt: new Date(), source: "free-market" };
      }
    } catch {
      continue;
    }
  }
  return null;
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

      // Try sources in order of preference
      const baha = await fetchFromBaha24();
      if (baha) {
        setData(baha);
        saveCache(baha);
        setCountdown(refreshInterval / 1000);
        return;
      }

      const archive = await fetchFromArchive();
      if (archive) {
        setData(archive);
        saveCache(archive);
        setCountdown(refreshInterval / 1000);
        return;
      }

      const official = await fetchFromOpenEr();
      if (official) {
        setData(official);
        saveCache(official);
        setCountdown(refreshInterval / 1000);
        return;
      }

      throw new Error("All sources failed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [refreshInterval]);

  useEffect(() => {
    // Only fetch if we don't have cached data
    if (!data) {
      fetchRates();
    } else {
      // Still fetch in background to update
      fetchRates();
    }

    timerRef.current = setInterval(fetchRates, refreshInterval);
    countdownRef.current = setInterval(() => {
      setCountdown((p) => (p <= 1 ? refreshInterval / 1000 : p - 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchRates, refreshInterval]);

  // Memoized conversion function
  const convert = useCallback(
    (amount: number, from: string, to: string): number | null => {
      if (!data?.rates) return null;
      if (from === "IRR" && to === "IRR") return amount;
      if (from === "IRR") {
        const r = data.rates[to];
        return r ? amount / r.sellRial : null;
      }
      if (to === "IRR") {
        const r = data.rates[from];
        return r ? amount * r.sellRial : null;
      }
      const rF = data.rates[from];
      const rT = data.rates[to];
      if (!rF || !rT) return null;
      return (amount * rF.sellRial) / rT.sellRial;
    },
    [data]
  );

  const getRateInRial = useCallback(
    (sym: string): number | null => data?.rates?.[sym]?.sellRial ?? null,
    [data]
  );

  // Return memoized object to prevent unnecessary re-renders
  return useMemo(() => ({
    data,
    loading,
    error,
    countdown,
    fetchRates,
    convert,
    getRateInRial,
  }), [data, loading, error, countdown, fetchRates, convert, getRateInRial]);
}
