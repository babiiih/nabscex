import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Clock, ExternalLink, ArrowLeftRight, GitBranch, Droplets, Landmark, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";
import { ARC_EXPLORER } from "../config/chains";

const MOCK_HISTORY = [
  { type: "Swap", from: "USDC", to: "EURC", amount: "1,000", received: "925.50", status: "completed", hash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12", date: "2026-05-17 03:45" },
  { type: "Bridge", from: "USDC", to: "USDC", amount: "5,000", received: "4,999", status: "completed", hash: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234", date: "2026-05-17 03:30" },
  { type: "Swap", from: "WETH", to: "USDC", amount: "0.5", received: "1,625.21", status: "completed", hash: "0x3c4d5e6f7890abcdef1234567890abcdef123456", date: "2026-05-17 03:15" },
  { type: "Add Liquidity", from: "USDC-EURC", to: "", amount: "2,500", received: "LP Tokens", status: "completed", hash: "0x4d5e6f7890abcdef1234567890abcdef12345678", date: "2026-05-17 02:50" },
  { type: "Stake", from: "USDC", to: "", amount: "10,000", received: "", status: "pending", hash: "0x5e6f7890abcdef1234567890abcdef1234567890", date: "2026-05-17 02:30" },
  { type: "Swap", from: "EURC", to: "WBTC", amount: "500", received: "0.0043", status: "failed", hash: "0x6f7890abcdef1234567890abcdef123456789012", date: "2026-05-16 22:10" },
];

const typeIcons: Record<string, typeof ArrowLeftRight> = {
  "Swap": ArrowLeftRight,
  "Bridge": GitBranch,
  "Add Liquidity": Droplets,
  "Stake": Landmark,
};

export default function History() {
  const { t } = useTranslation();
  const { isConnected, connect } = useWallet();

  useEffect(() => { document.title = "History | NabCex"; }, []);

  const statusBadge = (status: string) => {
    switch (status) {
      case "completed": return <span className="flex items-center gap-1 text-xs text-green-500"><CheckCircle size={12} /> {t("history.completed")}</span>;
      case "pending": return <span className="flex items-center gap-1 text-xs text-amber-500"><Loader2 size={12} className="animate-spin" /> {t("history.pending")}</span>;
      case "failed": return <span className="flex items-center gap-1 text-xs text-red-500"><XCircle size={12} /> {t("history.failed")}</span>;
      default: return null;
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("history.title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("history.subtitle")}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <Clock size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 mb-4">{t("common.walletNotConnected")}</p>
          <button onClick={connect} className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold hover:from-brand-600 hover:to-brand-700 transition-all">
            {t("common.connectWallet")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("history.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("history.subtitle")}</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-6 gap-4 px-6 py-3 border-b border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-500 uppercase">
          <span>{t("history.type")}</span>
          <span>Details</span>
          <span className="text-right">{t("common.amount")}</span>
          <span className="text-right">{t("history.status")}</span>
          <span className="text-right">{t("history.date")}</span>
          <span className="text-right">{t("history.txHash")}</span>
        </div>

        {/* Rows */}
        {MOCK_HISTORY.map((tx, idx) => {
          const Icon = typeIcons[tx.type] || ArrowLeftRight;
          return (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-6 gap-2 sm:gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  tx.type === "Swap" ? "bg-blue-500/10" : tx.type === "Bridge" ? "bg-purple-500/10" : tx.type === "Stake" ? "bg-green-500/10" : "bg-brand-500/10"
                }`}>
                  <Icon size={14} className={tx.type === "Swap" ? "text-blue-500" : tx.type === "Bridge" ? "text-purple-500" : tx.type === "Stake" ? "text-green-500" : "text-brand-500"} />
                </div>
                <span className="font-medium text-gray-900 dark:text-white text-sm">{tx.type}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 self-center">
                {tx.from}{tx.to ? ` → ${tx.to}` : ""}
              </div>
              <div className="text-right text-sm font-medium text-gray-900 dark:text-white self-center">{tx.amount}</div>
              <div className="text-right self-center">{statusBadge(tx.status)}</div>
              <div className="text-right text-xs text-gray-500 self-center">{tx.date.split(" ")[1]}</div>
              <div className="text-right self-center">
                <a href={`${ARC_EXPLORER}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-600 text-xs flex items-center justify-end gap-1">
                  {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)} <ExternalLink size={10} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
