import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Rocket, Calendar, Users, Clock } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";

const LAUNCHES = [
  {
    name: "ArcSwap Token",
    symbol: "AST",
    description: "Decentralized exchange governance token for the Arc ecosystem",
    status: "live" as const,
    raised: 450000,
    hardCap: 1000000,
    participants: 1250,
    startDate: "2026-05-15",
    endDate: "2026-05-30",
    price: "0.10 USDC",
    logo: "A",
  },
  {
    name: "StableYield",
    symbol: "SYD",
    description: "Yield optimization protocol for stablecoin holders on Arc",
    status: "upcoming" as const,
    raised: 0,
    hardCap: 500000,
    participants: 0,
    startDate: "2026-06-01",
    endDate: "2026-06-15",
    price: "0.05 USDC",
    logo: "S",
  },
  {
    name: "ArcBridge",
    symbol: "ABR",
    description: "Cross-chain bridge aggregator with optimized routing",
    status: "ended" as const,
    raised: 750000,
    hardCap: 750000,
    participants: 3200,
    startDate: "2026-04-01",
    endDate: "2026-04-15",
    price: "0.08 USDC",
    logo: "B",
  },
];

export default function Launchpad() {
  const { t } = useTranslation();
  const { isConnected, connect } = useWallet();
  const [activeFilter, setActiveFilter] = useState<"all" | "live" | "upcoming" | "ended">("all");
  const [selectedLaunch, setSelectedLaunch] = useState<number | null>(null);
  const [amount, setAmount] = useState("");

  useEffect(() => { document.title = "Launchpad | NabCex"; }, []);

  const filtered = LAUNCHES.filter((l) => activeFilter === "all" || l.status === activeFilter);

  const statusColors = {
    live: "bg-green-500/10 text-green-500 border-green-500/20",
    upcoming: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    ended: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("launchpad.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("launchpad.subtitle")}</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 w-fit">
        {(["all", "live", "upcoming", "ended"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeFilter === f ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {f === "all" ? "All" : t(`launchpad.${f}`)}
          </button>
        ))}
      </div>

      {/* Launch Cards */}
      <div className="space-y-4">
        {filtered.map((launch, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xl">{launch.logo}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{launch.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors[launch.status]} capitalize`}>
                        {t(`launchpad.${launch.status}`)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">${launch.symbol} &middot; {launch.price}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{launch.description}</p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>{t("launchpad.totalRaised")}: ${(launch.raised / 1000).toFixed(0)}K</span>
                  <span>{t("launchpad.hardCap")}: ${(launch.hardCap / 1000).toFixed(0)}K</span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all"
                    style={{ width: `${Math.min((launch.raised / launch.hardCap) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">{((launch.raised / launch.hardCap) * 100).toFixed(1)}%</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                  <Users size={14} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">Participants</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{launch.participants.toLocaleString()}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                  <Calendar size={14} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">Start</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{launch.startDate.split("-").slice(1).join("/")}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                  <Clock size={14} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">End</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{launch.endDate.split("-").slice(1).join("/")}</p>
                </div>
              </div>

              {launch.status === "live" && (
                <div>
                  {selectedLaunch === idx ? (
                    <div className="space-y-3">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount in USDC"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                      />
                      {!isConnected ? (
                        <button onClick={connect} className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold">
                          {t("common.connectWallet")}
                        </button>
                      ) : (
                        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold hover:from-brand-600 hover:to-brand-700 transition-all">
                          {t("launchpad.participate")}
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedLaunch(idx)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold hover:from-brand-600 hover:to-brand-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Rocket size={16} /> {t("launchpad.participate")}
                    </button>
                  )}
                </div>
              )}

              {launch.status === "ended" && (
                <button disabled className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 font-semibold cursor-not-allowed">
                  {t("launchpad.ended")}
                </button>
              )}

              {launch.status === "upcoming" && (
                <button disabled className="w-full py-3 rounded-xl bg-blue-500/10 text-blue-500 font-semibold cursor-not-allowed">
                  {t("launchpad.upcoming")}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
