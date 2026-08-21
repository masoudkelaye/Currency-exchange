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
  source: "live" | "bonbast" | "official" | "bonbast-live";
  rateDate: string;
}

const TOMAN_TO_RIAL = 10;
const FETCH_TIMEOUT = 7000;
const CACHE_KEY = "bonbast_rates_v3";
const CACHE_MAX_AGE = 90 * 1000;

// آدرس endpoint خودت که scrape.py/serve.py روی سرور Oracle سرو می‌کنه.
// می‌تونی موقع build با VITE_LIVE_RATES_URL بازنویسیش کنی، مثلاً:
//   VITE_LIVE_RATES_URL=https://your-domain.com/bonbast/rates.json
const LIVE_SERVER_URL =
  import.meta.env.VITE_LIVE_RATES_URL || "http://YOUR_SERVER_IP:8787/rates.json";

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
//  LIVE (own Oracle server, scrape.py + serve.py)
// ══════════════════════════════════════════════════════════
function normalizeToRial(rates: Record<string, CurrencyRate>): Record<string, CurrencyRate> {
  // اگر USD شبیه تومان باشد (بازار آزاد فعلی معمولاً > 200_000 ریال)، همه را ×۱۰ کن
  const usd = rates.USD?.sellRial;
  if (usd && usd > 0 && usd < 200_000) {
    const out: Record<string, CurrencyRate> = {};
    for (const [k, v] of Object.entries(rates)) {
      out[k] = {
        ...v,
        sellRial: v.sellRial * TOMAN_TO_RIAL,
        buyRial: v.buyRial * TOMAN_TO_RIAL,
      };
    }
    return out;
  }
  return rates;
}

function normalizeGoldToRial(gold: Record<string, GoldRate>): Record<string, GoldRate> {
  const sample = Object.values(gold)[0]?.sellRial;
  // سکه امامی معمولاً چند ده میلیون ریال است؛ اگر خیلی کوچک بود ×۱۰
  if (sample && sample > 0 && sample < 5_000_000) {
    const out: Record<string, GoldRate> = {};
    for (const [k, v] of Object.entries(gold)) {
      out[k] = {
        ...v,
        sellRial: v.sellRial * TOMAN_TO_RIAL,
        buyRial: v.buyRial * TOMAN_TO_RIAL,
      };
    }
    return out;
  }
  return gold;
}

async function fetchFromLiveServer(): Promise<RatesData | null> {
  if (!LIVE_SERVER_URL || LIVE_SERVER_URL.includes("YOUR_SERVER_IP")) return null;
  try {
    const json = await fetchJSON(LIVE_SERVER_URL, 20000);
    if (!json?.rates?.USD || !json?.rates?.EUR) return null;

    const rates = normalizeToRial(json.rates as Record<string, CurrencyRate>);
    const gold = normalizeGoldToRial((json.gold ?? {}) as Record<string, GoldRate>);

    // اطمینان از اینکه EUR و USD منطقی‌اند (EUR معمولاً ~1.05–1.2 برابر USD به ریال)
    const usd = rates.USD?.sellRial ?? 0;
    const eur = rates.EUR?.sellRial ?? 0;
    if (usd > 0 && eur > 0) {
      const ratio = eur / usd;
      // اگر EUR خیلی غیرمنطقی بود (مثلاً به‌اشتباه همان عدد تومان/واحد اشتباه)، از مقیاس USD استفاده کن
      if (ratio < 0.5 || ratio > 2.5) {
        // احتمالاً EUR به واحد اشتباه است؛ دست نزن ولی لاگ کن
        console.warn("Suspicious EUR/USD ratio from live server:", ratio);
      }
    }

    const fetchedAt = new Date(json.fetchedAt ?? Date.now());
    const rateDate =
      (typeof json.rateDate === "string" && json.rateDate) ||
      (Number.isFinite(fetchedAt.getTime())
        ? `${fetchedAt.getFullYear()}-${String(fetchedAt.getMonth() + 1).padStart(2, "0")}-${String(fetchedAt.getDate()).padStart(2, "0")}`
        : new Date().toISOString().split("T")[0]);

    return {
      rates,
      gold,
      fetchedAt,
      source: "bonbast-live",
      rateDate,
    };
  } catch { return null; }
}

// ══════════════════════════════════════════════════════════
//  BONBAST ARCHIVE (from bonbast.com via GitHub)
// ══════════════════════════════════════════════════════════
function parseBonbastDay(json: Record<string, unknown>): RatesData | null {
  const dates = Object.keys(json).sort().reverse();
  if (dates.length === 0) return null;

  const latestDate = dates[0];
  const dayData = json[latestDate] as Record<string, { sell?: number; buy?: number }> | undefined;
  if (!dayData?.usd?.sell) return null;

  const rates: Record<string, CurrencyRate> = {};
  const gold: Record<string, GoldRate> = {};

  for (const [code, val] of Object.entries(dayData)) {
    const v = val as { sell?: number; buy?: number };
    if (!v.sell) continue;

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

  if (!rates.USD || !rates.EUR) return null;
  return { rates, gold, fetchedAt: new Date(), source: "bonbast", rateDate: latestDate };
}

async function fetchFromBonbast(): Promise<RatesData | null> {
  // هر دو CDN به‌صورت موازی؛ هر کدام زودتر جواب درست داد برنده است
  const urls = [
    "https://cdn.jsdelivr.net/gh/SamadiPour/rial-exchange-rates-archive@data/gregorian_7days.min.json",
    "https://fastly.jsdelivr.net/gh/SamadiPour/rial-exchange-rates-archive@data/gregorian_7days.min.json",
    "https://raw.githubusercontent.com/SamadiPour/rial-exchange-rates-archive/data/gregorian_7days.min.json",
  ];

  const controllers: AbortController[] = [];

  try {
    const result = await new Promise<RatesData | null>((resolve) => {
      let pending = urls.length;
      let done = false;

      urls.forEach((url) => {
        const ctrl = new AbortController();
        controllers.push(ctrl);
        const timer = setTimeout(() => ctrl.abort(), 6000);

        fetch(url, { signal: ctrl.signal })
          .then((res) => {
            if (!res.ok) throw new Error(res.statusText);
            return res.json();
          })
          .then((json) => {
            if (done || !json || typeof json !== "object") return;
            const parsed = parseBonbastDay(json as Record<string, unknown>);
            if (parsed) {
              done = true;
              controllers.forEach((c) => c.abort());
              resolve(parsed);
            }
          })
          .catch(() => {})
          .finally(() => {
            clearTimeout(timer);
            pending -= 1;
            if (pending === 0 && !done) resolve(null);
          });
      });
    });

    return result;
  } catch {
    return null;
  }
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
//  ARCHIVE (for Archive tab + Graph tab)
// ══════════════════════════════════════════════════════════
export interface ArchiveDayData {
  date: string; // YYYY-MM-DD
  rates: Record<string, { sell: number; buy: number }>; // Toman
}

const archiveMonthCache = new Map<string, ArchiveDayData[]>();

async function fetchMonthArchive(year: number, month: number): Promise<ArchiveDayData[]> {
  const cacheKey = `${year}-${month}`;
  if (archiveMonthCache.has(cacheKey)) return archiveMonthCache.get(cacheKey)!;

  const mm = String(month).padStart(2, "0");
  const urls = [
    `https://cdn.jsdelivr.net/gh/SamadiPour/rial-exchange-rates-archive@main/gregorian/${year}/${mm}/full`,
    `https://raw.githubusercontent.com/SamadiPour/rial-exchange-rates-archive/main/gregorian/${year}/${mm}/full`,
  ];

  for (const url of urls) {
    try {
      const json = await fetchJSON(url);
      if (!json || typeof json !== "object") continue;

      const days: ArchiveDayData[] = [];
      for (const [date, dayData] of Object.entries(json as Record<string, unknown>)) {
        const rates: Record<string, { sell: number; buy: number }> = {};
        for (const [code, val] of Object.entries(dayData as Record<string, unknown>)) {
          const v = val as { sell?: number; buy?: number };
          if (v?.sell) rates[code.toUpperCase()] = { sell: v.sell, buy: v.buy ?? v.sell };
        }
        days.push({ date, rates });
      }
      archiveMonthCache.set(cacheKey, days);
      return days;
    } catch { continue; }
  }
  return [];
}


/** آرشیو بین دو تاریخ (شامل هر دو طرف)، قیمت‌ها به تومان. */
export async function fetchArchiveByDates(fromDate: string, toDate: string): Promise<ArchiveDayData[]> {
  if (!fromDate || !toDate) return [];
  const start = new Date(fromDate + "T00:00:00Z");
  const end = new Date(toDate + "T00:00:00Z");
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];

  const months = new Set<string>();
  const cur = new Date(start);
  while (cur <= end) {
    months.add(`${cur.getUTCFullYear()}-${cur.getUTCMonth() + 1}`);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  const results = await Promise.all(
    Array.from(months).map((m) => {
      const [y, mo] = m.split("-").map(Number);
      return fetchMonthArchive(y, mo);
    })
  );

  const all = results.flat();
  const fromStr = fromDate;
  const toStr = toDate;
  const filtered = all.filter((d) => d.date >= fromStr && d.date <= toStr);
  const seen = new Set<string>();
  const deduped = filtered.filter((d) => (seen.has(d.date) ? false : (seen.add(d.date), true)));
  deduped.sort((a, b) => (a.date < b.date ? 1 : -1));
  return deduped;
}

/** آخرین N روز آرشیو رو برمی‌گردونه (جدیدترین اول)، قیمت‌ها به تومان. */
export async function fetchArchiveRange(days: number): Promise<ArchiveDayData[]> {
  const now = new Date();
  const months = new Set<string>();
  for (let i = 0; i <= days + 3; i += 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    months.add(`${d.getFullYear()}-${d.getMonth() + 1}`);
  }

  const results = await Promise.all(
    Array.from(months).map((m) => {
      const [y, mo] = m.split("-").map(Number);
      return fetchMonthArchive(y, mo);
    })
  );

  const all = results.flat();
  const seen = new Set<string>();
  const deduped = all.filter((d) => (seen.has(d.date) ? false : (seen.add(d.date), true)));
  deduped.sort((a, b) => (a.date < b.date ? 1 : -1));
  return deduped.slice(0, days);
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
  const liveWinsRef = useRef(false);

  const fetchRates = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    liveWinsRef.current = false;
    try {
      setError(null);

      const livePromise = fetchFromLiveServer().then((live) => {
        if (live) {
          liveWinsRef.current = true;
          setData(live);
          saveCache(live);
          setCountdown(refreshInterval / 1000);
          setLoading(false);
        }
        return live;
      });

      // بک‌آپ موازی با live — زودتر که رسید نشان داده می‌شود؛ اگر بعداً live آمد جایگزین می‌شود
      const backupPromise = (async () => {
        const bonbast = await fetchFromBonbast();
        if (bonbast) return bonbast;
        return await fetchFromOpenEr();
      })().then((backup) => {
        if (backup && !liveWinsRef.current) {
          setData(backup);
          saveCache(backup);
          setCountdown(refreshInterval / 1000);
          setLoading(false);
        }
        return backup;
      });

      const [live, backup] = await Promise.all([livePromise, backupPromise]);

      if (!live && !backup) {
        throw new Error("All sources failed");
      }
      // اگر فقط backup بود و هنوز set نشده (نادر)، دوباره set کن
      if (!live && backup && !liveWinsRef.current) {
        setData(backup);
        saveCache(backup);
        setCountdown(refreshInterval / 1000);
      }
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

  const getRatePair = useCallback(
    (sym: string): { buy: number; sell: number } | null => {
      const r = data?.rates?.[sym];
      return r ? { buy: r.buyRial, sell: r.sellRial } : null;
    }, [data]
  );

  return useMemo(() => ({
    data, loading, error, countdown, fetchRates, convert, getRateInRial, getRatePair,
  }), [data, loading, error, countdown, fetchRates, convert, getRateInRial, getRatePair]);
}
