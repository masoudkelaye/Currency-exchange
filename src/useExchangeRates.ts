import { useState, useEffect, useCallback, useRef } from "react";

export interface CurrencyRate {
  title?: string;
  symbol: string;
  sellRial: number;   // price in Rial
  lastUpdate: string;
  source: "free-market" | "official";
}

export interface RatesData {
  rates: Record<string, CurrencyRate>;
  fetchedAt: Date;
  source: "free-market" | "official";
}

// Primary: baha24 free-market (تومان, needs conversion to Rial ×10)
const BAHA24_URL = "https://baha24.com/api/v1/price";
const BAHA24_PROXIES = [
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
];

// Fallback: open.er-api.com (official rates, supports CORS)
const OPEN_ER_URL = "https://open.er-api.com/v6/latest/USD";

const TOMAN_TO_RIAL = 10;

async function fetchWithTimeout(url: string, timeout = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function tryFetchBaha24(): Promise<RatesData | null> {
  const urls = [BAHA24_URL, ...BAHA24_PROXIES.map((p) => p(BAHA24_URL))];

  for (const url of urls) {
    try {
      const response = await fetchWithTimeout(url, 8000);
      if (!response.ok) continue;
      const json = await response.json();
      if (!Array.isArray(json)) continue;

      const ratesMap: Record<string, CurrencyRate> = {};
      for (const item of json) {
        if (!item?.symbol || !item?.sell) continue;
        ratesMap[item.symbol] = {
          title: item.title,
          symbol: item.symbol,
          sellRial: parseFloat(item.sell) * TOMAN_TO_RIAL,
          lastUpdate: item.last_update ?? new Date().toISOString(),
          source: "free-market",
        };
      }

      // Validate we got real currency data (not crypto-only)
      if (ratesMap.USD && ratesMap.EUR && ratesMap.GBP) {
        return {
          rates: ratesMap,
          fetchedAt: new Date(),
          source: "free-market",
        };
      }
    } catch {
      // Try next URL
      continue;
    }
  }
  return null;
}

async function fetchFromOpenEr(): Promise<RatesData | null> {
  try {
    const response = await fetchWithTimeout(OPEN_ER_URL, 8000);
    if (!response.ok) return null;
    const json = await response.json();
    if (json.result !== "success" || !json.rates) return null;

    // Convert from "rates per 1 USD" to "Rial per 1 unit of currency"
    // IRR rate from API = Rials per 1 USD
    const irrPerUsd = json.rates.IRR;
    if (!irrPerUsd) return null;

    const ratesMap: Record<string, CurrencyRate> = {};
    const lastUpdate = json.time_last_update_utc ?? new Date().toISOString();

    // For each currency, calculate Rial per 1 unit:
    // If 1 USD = X IRR and 1 USD = Y EUR, then 1 EUR = X/Y IRR
    for (const [code, ratePerUsd] of Object.entries(json.rates)) {
      if (code === "USD") continue;
      ratesMap[code] = {
        symbol: code,
        sellRial: irrPerUsd / (ratePerUsd as number),
        lastUpdate,
        source: "official",
      };
    }

    return {
      rates: ratesMap,
      fetchedAt: new Date(),
      source: "official",
    };
  } catch {
    return null;
  }
}

export function useExchangeRates(refreshInterval: number = 30000) {
  const [data, setData] = useState<RatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(refreshInterval / 1000);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try baha24 first (free market)
      const baha24Data = await tryFetchBaha24();
      if (baha24Data) {
        setData(baha24Data);
        setCountdown(refreshInterval / 1000);
        return;
      }

      // Fallback to open.er-api (official)
      const officialData = await fetchFromOpenEr();
      if (officialData) {
        setData(officialData);
        setCountdown(refreshInterval / 1000);
        return;
      }

      throw new Error("All APIs failed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [refreshInterval]);

  useEffect(() => {
    fetchRates();
    timerRef.current = setInterval(fetchRates, refreshInterval);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? refreshInterval / 1000 : prev - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchRates, refreshInterval]);

  // Price of 1 unit of currency in Rial
  const getRateInRial = useCallback(
    (apiSymbol: string, divisor?: number): number | null => {
      if (!data?.rates) return null;
      const rate = data.rates[apiSymbol];
      if (!rate) return null;
      if (divisor) return rate.sellRial / divisor;
      return rate.sellRial;
    },
    [data]
  );

  // Convert between any two currencies (all via Rial)
  const convert = useCallback(
    (amount: number, fromSymbol: string, toSymbol: string, fromDivisor?: number, toDivisor?: number): number | null => {
      if (!data?.rates) return null;

      if (fromSymbol === "IRR" && toSymbol === "IRR") return amount;

      if (fromSymbol === "IRR") {
        const toRate = data.rates[toSymbol];
        if (!toRate) return null;
        let unitPrice = toRate.sellRial;
        if (toDivisor) unitPrice = unitPrice / toDivisor;
        return amount / unitPrice;
      }

      if (toSymbol === "IRR") {
        const fromRate = data.rates[fromSymbol];
        if (!fromRate) return null;
        let unitPrice = fromRate.sellRial;
        if (fromDivisor) unitPrice = unitPrice / fromDivisor;
        return amount * unitPrice;
      }

      const fromRate = data.rates[fromSymbol];
      const toRate = data.rates[toSymbol];
      if (!fromRate || !toRate) return null;

      let fromUnitPrice = fromRate.sellRial;
      if (fromDivisor) fromUnitPrice = fromUnitPrice / fromDivisor;
      let toUnitPrice = toRate.sellRial;
      if (toDivisor) toUnitPrice = toUnitPrice / toDivisor;

      return (amount * fromUnitPrice) / toUnitPrice;
    },
    [data]
  );

  return { data, loading, error, countdown, fetchRates, convert, getRateInRial };
}
