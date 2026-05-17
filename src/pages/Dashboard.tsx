import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, TrendingUp, Activity, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useTokenPrices, formatUSD } from "../hooks/useTokenPrice";

const CHART_DATA = Array.from({ length: 30 }, (_, i) => ({
  date: `May ${i + 1}`,
  tvl: 12000000 + Math.random() * 3000000 + i * 100000,
  volume: 800000 + Math.random() * 500000,
  fees: 2400 + Math.random() * 1500,
}));

const TOP_TOKENS_DATA = [
  { symbol: "USDC", name: "USD Coin", price: 1.0, change24h: 0.01, volume: 4500000, tvl: 8200000 },
  { symbol: "EURC", name: "Euro Coin", price: 1.08, change24h: -0.12, volume: 1200000, tvl: 3100000 },
  { symbol: "WETH", name: "Wrapped Ether", price: 3250.42, change24h: 2.35, volume: 2800000, tvl: 5600000 },
  { symbol: "WBTC", name: "Wrapped Bitcoin", price: 104520.18, change24h: 1.87, volume: 3500000, tvl: 9800000 },
];

const RECENT_TXS = [
  { type: "Swap", from: "USDC", to: "EURC", amount: "1,000", time: "2m ago", hash: "0x1a2b...3c4d" },
  { type: "Bridge", from: "USDC", to: "USDC", amount: "5,000", time: "5m ago", hash: "0x2b3c...4d5e" },
  { type: "Add Liquidity", from: "USDC", to: "WETH", amount: "2,500", time: "8m ago", hash: "0x3c4d...5e6f" },
  { type: "Swap", from: "WETH", to: "USDC", amount: "0.5", time: "12m ago", hash: "0x4d5e...6f7g" },
  { type: "Stake", from: "USDC", to: "", amount: "10,000", time: "15m ago", hash: "0x5e6f...7g8h" },
];

export default function Dashboard() {
  const { t } = useTranslation();
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d");

  const coingeckoIds = useMemo(() => ["usd-coin", "euro-coin", "ethereum", "bitcoin"], []);
  useTokenPrices(coingeckoIds);

  useEffect(() => { document.title = "Dashboard | NabCex"; }, []);

  const totalTVL = 26700000;
  const volume24h = 8500000;
  const totalFees = 25500;
  const totalTxs = 145230;

  const stats = [
    { label: t("common.totalValueLocked"), value: formatUSD(totalTVL), change: "+5.2%", up: true, icon: DollarSign },
    { label: t("common.volume24h"), value: formatUSD(volume24h), change: "+12.8%", up: true, icon: Activity },
    { label: "Total Fees", value: formatUSD(totalFees), change: "+3.4%", up: true, icon: TrendingUp },
    { label: t("common.transactions"), value: totalTxs.toLocaleString(), change: "+8.1%", up: true, icon: BarChart3 },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("dashboard.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("dashboard.subtitle")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                <stat.icon size={20} className="text-brand-500" />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? "text-green-500" : "text-red-500"}`}>
                {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.change}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* TVL Chart */}
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

        {/* Volume Chart */}
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

      {/* Top Tokens & Recent TXs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tokens */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t("dashboard.topTokens")}</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {TOP_TOKENS_DATA.map((token, idx) => (
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
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{formatUSD(token.price)}</p>
                  <p className={`text-[10px] ${token.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {token.change24h >= 0 ? "+" : ""}{token.change24h}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t("dashboard.recentTx")}</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {RECENT_TXS.map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    tx.type === "Swap" ? "bg-blue-500/10 text-blue-500" :
                    tx.type === "Bridge" ? "bg-purple-500/10 text-purple-500" :
                    tx.type === "Stake" ? "bg-green-500/10 text-green-500" :
                    "bg-brand-500/10 text-brand-500"
                  }`}>
                    {tx.type[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{tx.type}</p>
                    <p className="text-[10px] text-gray-500">{tx.from}{tx.to ? ` → ${tx.to}` : ""}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{tx.amount}</p>
                  <p className="text-[10px] text-gray-500">{tx.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
