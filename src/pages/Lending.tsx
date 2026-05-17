import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { HandCoins, Shield, TrendingUp, AlertTriangle } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";

const LENDING_MARKETS = [
  { token: "USDC", supplyAPY: 4.2, borrowAPR: 6.8, totalSupply: 8500000, totalBorrow: 5200000, collateralFactor: 85, logo: "U" },
  { token: "EURC", supplyAPY: 3.8, borrowAPR: 5.9, totalSupply: 3200000, totalBorrow: 1800000, collateralFactor: 80, logo: "E" },
  { token: "WETH", supplyAPY: 2.1, borrowAPR: 4.5, totalSupply: 12000000, totalBorrow: 7500000, collateralFactor: 75, logo: "W" },
  { token: "WBTC", supplyAPY: 1.8, borrowAPR: 3.9, totalSupply: 25000000, totalBorrow: 15000000, collateralFactor: 70, logo: "B" },
];

export default function Lending() {
  const { t } = useTranslation();
  const { isConnected, connect } = useWallet();
  const [activeTab, setActiveTab] = useState<"supply" | "borrow">("supply");
  const [selectedMarket, setSelectedMarket] = useState<number | null>(null);
  const [amount, setAmount] = useState("");

  useEffect(() => { document.title = "Lending | NabCex"; }, []);

  const formatVal = (val: number) => val >= 1000000 ? `$${(val / 1000000).toFixed(2)}M` : `$${(val / 1000).toFixed(1)}K`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("lending.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("lending.subtitle")}</p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Net Worth", value: "$0.00", icon: HandCoins },
          { label: t("lending.supply"), value: "$0.00", icon: TrendingUp },
          { label: t("lending.borrow"), value: "$0.00", icon: HandCoins },
          { label: t("lending.healthFactor"), value: "---", icon: Shield },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 w-fit">
        {(["supply", "borrow"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab === "supply" ? t("lending.supply") : t("lending.borrow")}
          </button>
        ))}
      </div>

      {/* Markets Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-500 uppercase">
          <span>Asset</span>
          <span className="text-right">{activeTab === "supply" ? t("lending.supplyAPY") : t("lending.borrowAPR")}</span>
          <span className="text-right hidden sm:block">Total {activeTab === "supply" ? "Supply" : "Borrow"}</span>
          <span className="text-right">{t("lending.collateralFactor")}</span>
          <span className="text-right">Action</span>
        </div>
        {LENDING_MARKETS.map((market, idx) => (
          <div key={idx}>
            <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => setSelectedMarket(selectedMarket === idx ? null : idx)}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 font-bold">{market.logo}</div>
                <span className="font-medium text-gray-900 dark:text-white">{market.token}</span>
              </div>
              <span className="text-right text-green-500 font-medium self-center">
                {activeTab === "supply" ? `${market.supplyAPY}%` : `${market.borrowAPR}%`}
              </span>
              <span className="text-right text-gray-600 dark:text-gray-400 text-sm self-center hidden sm:block">
                {formatVal(activeTab === "supply" ? market.totalSupply : market.totalBorrow)}
              </span>
              <span className="text-right text-gray-600 dark:text-gray-400 text-sm self-center">{market.collateralFactor}%</span>
              <div className="text-right self-center">
                <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "supply" ? "bg-brand-500/10 text-brand-500 hover:bg-brand-500/20" : "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                }`}>
                  {activeTab === "supply" ? t("lending.supply") : t("lending.borrow")}
                </button>
              </div>
            </div>

            {selectedMarket === idx && (
              <div className="px-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-2 mb-3 text-xs text-amber-500">
                    <AlertTriangle size={12} /> {t("common.testnet")} — no real assets at risk
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`${t("common.enterAmount")} ${market.token}`}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 mb-3"
                  />
                  {!isConnected ? (
                    <button onClick={connect} className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold hover:from-brand-600 hover:to-brand-700 transition-all">
                      {t("common.connectWallet")}
                    </button>
                  ) : (
                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold hover:from-brand-600 hover:to-brand-700 transition-all">
                      {activeTab === "supply" ? t("lending.supply") : t("lending.borrow")} {market.token}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
