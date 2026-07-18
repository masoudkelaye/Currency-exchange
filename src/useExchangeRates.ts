import { useState, useEffect, useCallback, useRef } from "react";

export interface CurrencyRate {
  symbol: string;
  sellRial: number; // price of 1 unit in Rial
  lastUpdate: string;
  source: "free-market" | "official";
}

export interface RatesData {
  rates: Record<string, CurrencyRate>;
  fetchedAt: Date;
  source: "free-market" | "official";
}

// ── helpers ──────────────────────────────────────────────
const TOMAN_TO_RIAL = 10;

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

async function fetchJSON(url: string, timeout = 10000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

// JPY & AMD & IQD are "per 10/100" in the archive — map divisors
const ARCHIVE_DIVISORS: Record<string, number> = {
  jpy: 10,  // "10 Japanese Yen"
  amd: 10,  // "10 Armenian Dram"
  iqd: 100, // "100 Iraqi Dinar"
};

// ── source 1: SamadiPour GitHub archive (free-market, bonbast) ──
async function fetchFromArchive(): Promise<RatesData | null> {
  const base =
    "https://raw.githubusercontent.com/SamadiPour/rial-exchange-rates-archive/main/gregorian";

  for (const dateStr of [todayStr(), yesterdayStr()]) {
    try {
      const json = await fetchJSON(`${base}/${dateStr}`);
      if (!json || typeof json !== "object") continue;

      const rates: Record<string, CurrencyRate> = {};

      for (const [code, val] of Object.entries(json)) {
        const v = val as { sell?: number; buy?: number; name?: string };
        if (!v.sell) continue;

        // archive prices are in Toman → convert to Rial
        const divisor = ARCHIVE_DIVISORS[code] ?? 1;
        const rialPerUnit = (v.sell * TOMAN_TO_RIAL) / divisor;

        rates[code.toUpperCase()] = {
          symbol: code.toUpperCase(),
          sellRial: rialPerUnit,
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

// ── source 2: open.er-api (official, always works) ──
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

// ── source 3: baha24.com direct + proxies ──
async function fetchFromBaha24(): Promise<RatesData | null> {
  const direct = "https://baha24.com/api/v1/price";
  const urls = [
    direct,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(direct)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(direct)}`,
  ];

  for (const url of urls) {
    try {
      const json = await fetchJSON(url, 8000);
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

// ═══════════════════════════════════════════════════════════
//  Hook
// ═══════════════════════════════════════════════════════════
export function useExchangeRates(refreshInterval = 30_000) {
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

      // 1️⃣ baha24 (live free-market)
      const b = await fetchFromBaha24();
      if (b) { setData(b); setCountdown(refreshInterval / 1000); return; }

      // 2️⃣ GitHub archive (free-market, daily)
      const a = await fetchFromArchive();
      if (a) { setData(a); setCountdown(refreshInterval / 1000); return; }

      // 3️⃣ open.er-api (official)
      const o = await fetchFromOpenEr();
      if (o) { setData(o); setCountdown(refreshInterval / 1000); return; }

      throw new Error("All sources failed");
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
      setCountdown((p) => (p <= 1 ? refreshInterval / 1000 : p - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchRates, refreshInterval]);

  const getRateInRial = useCallback(
    (sym: string): number | null => data?.rates?.[sym]?.sellRial ?? null,
    [data],
  );

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
    [data],
  );

  return { data, loading, error, countdown, fetchRates, convert, getRateInRial };
}
