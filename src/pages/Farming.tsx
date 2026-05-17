import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sprout, Flame, Zap } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";

const FARMS = [
  { name: "USDC-EURC LP", earned: "0.00", apr: 45.2, tvl: 2800000, multiplier: "2x", deposited: "0.00", logo1: "U", logo2: "E" },
  { name: "USDC-WETH LP", earned: "0.00", apr: 68.5, tvl: 1500000, multiplier: "3x", deposited: "0.00", logo1: "U", logo2: "W" },
  { name: "USDC-WBTC LP", earned: "0.00", apr: 32.8, tvl: 3200000, multiplier: "1.5x", deposited: "0.00", logo1: "U", logo2: "B" },
  { name: "EURC-WETH LP", earned: "0.00", apr: 55.1, tvl: 900000, multiplier: "2.5x", deposited: "0.00", logo1: "E", logo2: "W" },
];

export default function Farming() {
  const { t } = useTranslation();
  const { isConnected, connect } = useWallet();
  const [expandedFarm, setExpandedFarm] = useState<number | null>(null);
  const [amount, setAmount] = useState("");

  useEffect(() => { document.title = "Farming | NabCex"; }, []);

  const formatVal = (val: number) => val >= 1000000 ? `$${(val / 1000000).toFixed(2)}M` : `$${(val / 1000).toFixed(1)}K`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("farming.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("farming.subtitle")}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center"><Sprout size={20} className="text-green-500" /></div>
            <div><p className="text-xs text-gray-500">{t("farming.earned")}</p><p className="text-lg font-bold text-gray-900 dark:text-white">$0.00</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center"><Flame size={20} className="text-orange-500" /></div>
            <div><p className="text-xs text-gray-500">Total Farms</p><p className="text-lg font-bold text-gray-900 dark:text-white">{FARMS.length}</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center"><Zap size={20} className="text-brand-500" /></div>
            <div><p className="text-xs text-gray-500">Total TVL</p><p className="text-lg font-bold text-gray-900 dark:text-white">{formatVal(FARMS.reduce((a, f) => a + f.tvl, 0))}</p></div>
          </div>
        </div>
      </div>

      {/* Farm Cards */}
      <div className="space-y-4">
        {FARMS.map((farm, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div
              className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              onClick={() => setExpandedFarm(expandedFarm === idx ? null : idx)}
            >
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-sm font-bold text-brand-600 border-2 border-white dark:border-gray-900">{farm.logo1}</div>
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-600 border-2 border-white dark:border-gray-900">{farm.logo2}</div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{farm.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 text-[10px] font-medium">{farm.multiplier}</span>
                    <span className="text-xs text-gray-500">{t("pool.tvl")}: {formatVal(farm.tvl)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-500">{farm.apr}%</p>
                <p className="text-xs text-gray-500">APR</p>
              </div>
            </div>

            {expandedFarm === idx && (
              <div className="px-5 pb-5 border-t border-gray-200 dark:border-gray-800 pt-4">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                    <p className="text-xs text-gray-500">{t("farming.earned")}</p>
                    <p className="font-bold text-gray-900 dark:text-white">{farm.earned}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                    <p className="text-xs text-gray-500">{t("farming.deposited") || "Deposited"}</p>
                    <p className="font-bold text-gray-900 dark:text-white">{farm.deposited}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                    <p className="text-xs text-gray-500">{t("farming.multiplier")}</p>
                    <p className="font-bold text-brand-500">{farm.multiplier}</p>
                  </div>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t("common.enterAmount")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 mb-3"
                />
                {!isConnected ? (
                  <button onClick={connect} className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold hover:from-brand-600 hover:to-brand-700 transition-all">
                    {t("common.connectWallet")}
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold hover:from-brand-600 hover:to-brand-700 transition-all">
                      {t("farming.deposit")}
                    </button>
                    <button className="flex-1 py-3 rounded-xl border border-brand-500 text-brand-500 font-semibold hover:bg-brand-500/10 transition-all">
                      {t("farming.harvest")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
