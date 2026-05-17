import { useState, useEffect, useCallback } from "react";

interface PriceData {
  [key: string]: { usd: number; usd_24h_change?: number };
}

const CACHE_KEY = "nabcex-prices";
const CACHE_DURATION = 60000;

let cachedData: PriceData | null = null;
let lastFetch = 0;

export function useTokenPrices(coingeckoIds: string[]) {
  const [prices, setPrices] = useState<PriceData>({});
  const [loading, setLoading] = useState(true);

  const fetchPrices = useCallback(async () => {
    const now = Date.now();
    if (cachedData && now - lastFetch < CACHE_DURATION) {
      setPrices(cachedData);
      setLoading(false);
      return;
    }

    try {
      const ids = coingeckoIds.join(",");
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );
      const data: PriceData = await res.json();
      cachedData = data;
      lastFetch = now;
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: now }));
      setPrices(data);
    } catch {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setPrices(parsed.data);
      }
    } finally {
      setLoading(false);
    }
  }, [coingeckoIds]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, CACHE_DURATION);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { prices, loading };
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, decimals = 4): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
