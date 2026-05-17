import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, TrendingUp, Activity, DollarSign, ArrowUpRight, ExternalLink, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useTokenPrices, formatUSD } from "../hooks/useTokenPrice";
import { getNetworkStats, getRecentTransactions, getTxExplorerUrl, type BlockscoutTx, type NetworkStats } from "../services/blockscout";

const CHART_DATA = Array.from({ length: 30 }, (_, i) => ({
  date: `May ${i + 1}`,
  tvl: 12000000 + Math.random() * 3000000 + i * 100000,
  volume: 800000 + Math.random() * 500000,
}));

export default function Dashboard() {
  const { t } = useTranslation();
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d");
  const [netStats, setNetStats] = useState<NetworkStats | null>(null);
  const [recentTxs, setRecentTxs] = useState<BlockscoutTx[]>([]);
  const [loading, setLoading] = useState(true);

  const coingeckoIds = useMemo(() => ["usd-coin", "euro-coin", "ethereum", "bitcoin"], []);
  const { prices } = useTokenPrices(coingeckoIds);

  useEffect(() => { document.title = "Dashboard | NabCex"; }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [stats, txs] = await Promise.all([getNetworkStats(), getRecentTransactions(10)]);
        setNetStats(stats);
        setRecentTxs(txs);
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const topTokens = useMemo(() => [
    { symbol: "USDC", name: "USD Coin", coingeckoId: "usd-coin" },
    { symbol: "EURC", name: "Euro Coin", coingeckoId: "euro-coin" },
    { symbol: "WETH", name: "Wrapped Ether", coingeckoId: "ethereum" },
    { symbol: "WBTC", name: "Wrapped Bitcoin", coingeckoId: "bitcoin" },
  ], []);

  const stats = useMemo(() => [
    { label: t("common.totalValueLocked"), value: netStats ? `${Number(netStats.total_addresses).toLocaleString()} addr` : "...", change: `${netStats?.network_utilization_percentage?.toFixed(1) ?? 0}% util`, up: true, icon: DollarSign },
    { label: t("common.volume24h"), value: netStats ? `${Number(netStats.transactions_today).toLocaleString()} txs` : "...", change: "today", up: true, icon: Activity },
    { label: "Gas Price", value: netStats ? `${netStats.gas_prices.average.toFixed(1)} Gwei` : "...", change: `${netStats?.gas_prices.fast.toFixed(1) ?? 0} fast`, up: true, icon: TrendingUp },
    { label: t("common.transactions"), value: netStats ? Number(netStats.total_transactions).toLocaleString() : "...", change: `${Number(netStats?.total_blocks ?? 0).toLocaleString()} blocks`, up: true, icon: BarChart3 },
  ], [t, netStats]);

  const timeSince = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("dashboard.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Live data from{" "}
          <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-600">testnet.arcscan.app</a>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                <stat.icon size={20} className="text-brand-500" />
              </div>
              <span className="flex items-center gap-0.5 text-xs font-medium text-green-500">
                <ArrowUpRight size={12} /> {stat.change}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{loading ? <Loader2 size={18} className="animate-spin" /> : stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t("common.totalValueLocked")}</h3>
            <div className="flex gap-1">
              {(["7d", "30d", "90d"] as const).map((tf) => (
                <button key={tf} onClick={() => setTimeframe(tf)} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${timeframe === tf ? "bg-brand-500/10 text-brand-500" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} />
              <Tooltip formatter={(value: number) => [formatUSD(value), "TVL"]} contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "12px", fontSize: "12px" }} />
              <Area type="monotone" dataKey="tvl" stroke="#14b8a6" fill="url(#tvlGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t("common.volume24h")}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CHART_DATA}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value: number) => [formatUSD(value), "Volume"]} contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "12px", fontSize: "12px" }} />
              <Bar dataKey="volume" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t("dashboard.topTokens")}</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {topTokens.map((token, idx) => {
              const p = prices[token.coingeckoId];
              return (
                <div key={idx} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-4">{idx + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center text-xs font-bold text-brand-600">{token.symbol[0]}</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{token.symbol}</p>
                      <p className="text-[10px] text-gray-500">{token.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{p ? formatUSD(p.usd) : "..."}</p>
                    <p className={`text-[10px] ${(p?.usd_24h_change ?? 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {p ? `${(p.usd_24h_change ?? 0) >= 0 ? "+" : ""}${(p.usd_24h_change ?? 0).toFixed(2)}%` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t("dashboard.recentTx")}</h3>
            <span className="text-[10px] text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full">LIVE</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading && recentTxs.length === 0 ? (
              <div className="p-8 text-center"><Loader2 size={24} className="animate-spin mx-auto text-brand-500" /></div>
            ) : recentTxs.slice(0, 6).map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-brand-500/10 text-brand-500">
                    {tx.transaction_types?.[0]?.[0]?.toUpperCase() ?? "T"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{tx.transaction_types?.[0] ?? "Transaction"}</p>
                    <p className="text-[10px] text-gray-500">{tx.from.hash.slice(0, 8)}...{tx.to?.hash?.slice(-4) ?? ""}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="text-[10px] text-gray-500">{timeSince(tx.timestamp)}</p>
                  </div>
                  <a href={getTxExplorerUrl(tx.hash)} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-600">
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
