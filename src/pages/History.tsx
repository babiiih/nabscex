import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Clock, ExternalLink, ArrowLeftRight, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";
import { getAddressTransactions, formatTxType, formatTimestamp, weiToUsdc, getTxExplorerUrl, type EtherscanTx } from "../services/blockscout";

export default function History() {
  const { t } = useTranslation();
  const { isConnected, connect, address } = useWallet();
  const [transactions, setTransactions] = useState<EtherscanTx[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => { document.title = "History | NabCex"; }, []);

  const fetchTxs = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const txs = await getAddressTransactions(address, page, 25);
      setTransactions(txs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [address, page]);

  useEffect(() => { fetchTxs(); }, [fetchTxs]);

  const statusBadge = (tx: EtherscanTx) => {
    if (tx.txreceipt_status === "1" && tx.isError === "0") {
      return <span className="flex items-center gap-1 text-xs text-green-500"><CheckCircle size={12} /> {t("history.completed")}</span>;
    } else if (tx.isError === "1") {
      return <span className="flex items-center gap-1 text-xs text-red-500"><XCircle size={12} /> {t("history.failed")}</span>;
    }
    return <span className="flex items-center gap-1 text-xs text-amber-500"><Loader2 size={12} className="animate-spin" /> {t("history.pending")}</span>;
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto animate-slide-up">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t("history.title")}</h1>
          <p className="text-sm text-gray-400 mt-1">{t("history.subtitle")}</p>
        </div>
        <div className="glass-card p-12 text-center">
          <Clock size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-400 mb-4">{t("common.walletNotConnected")}</p>
          <button onClick={connect} className="px-6 py-3 btn-primary">
            {t("common.connectWallet")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t("history.title")}</h1>
          <p className="text-sm text-gray-400 mt-1">
            Synced with{" "}
            <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-400">testnet.arcscan.app</a>
          </p>
        </div>
        <button onClick={fetchTxs} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/[0.04] backdrop-blur-sm border border-white/20 dark:border-white/[0.06] text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/[0.07] transition-all duration-200 text-sm">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error && <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/15 text-red-500 text-sm">{error}</div>}

      <div className="glass-card overflow-hidden">
        <div className="hidden lg:grid grid-cols-7 gap-4 px-6 py-3 border-b border-white/10 dark:border-white/[0.04] text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          <span>{t("history.type")}</span><span>From</span><span>To</span>
          <span className="text-right">Value</span><span className="text-right">Gas</span>
          <span className="text-right">{t("history.status")}</span><span className="text-right">{t("history.txHash")}</span>
        </div>

        {loading && transactions.length === 0 ? (
          <div className="p-12 text-center">
            <Loader2 size={32} className="animate-spin mx-auto text-brand-500 mb-4" />
            <p className="text-gray-400">Loading transactions from Arc Testnet...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <Clock size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-400">No transactions found for this address</p>
          </div>
        ) : (
          transactions.map((tx, idx) => (
            <div key={idx} className="grid grid-cols-1 lg:grid-cols-7 gap-2 lg:gap-4 px-6 py-4 border-b border-gray-100/50 dark:border-white/[0.04] last:border-0 hover:bg-white/40 dark:hover:bg-white/[0.03] transition-all duration-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-brand-500/15 to-cyan-500/10">
                  <ArrowLeftRight size={14} className="text-brand-500" />
                </div>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">{formatTxType(tx)}</span>
              </div>
              <div className="text-sm text-gray-500 self-center truncate font-mono" title={tx.from}>
                {tx.from.slice(0, 8)}...{tx.from.slice(-4)}
              </div>
              <div className="text-sm text-gray-500 self-center truncate font-mono" title={tx.to}>
                {tx.to ? `${tx.to.slice(0, 8)}...${tx.to.slice(-4)}` : "Contract"}
              </div>
              <div className="text-right text-sm font-bold text-gray-900 dark:text-white self-center">
                {tx.value !== "0" ? weiToUsdc(tx.value, 18) : "0"}
              </div>
              <div className="text-right text-xs text-gray-400 self-center font-mono">{Number(tx.gasUsed).toLocaleString()}</div>
              <div className="text-right self-center">{statusBadge(tx)}</div>
              <div className="text-right self-center">
                <a href={getTxExplorerUrl(tx.hash)} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-400 text-xs flex items-center justify-end gap-1 font-mono">
                  {tx.hash.slice(0, 8)}...{tx.hash.slice(-4)} <ExternalLink size={10} />
                </a>
              </div>
              <div className="lg:hidden text-xs text-gray-400 mt-1">{formatTimestamp(tx.timeStamp)}</div>
            </div>
          ))
        )}
      </div>

      {transactions.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1 || loading}
            className="px-4 py-2 rounded-xl bg-white/60 dark:bg-white/[0.04] backdrop-blur-sm border border-white/20 dark:border-white/[0.06] text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/[0.07] transition-all duration-200 text-sm disabled:opacity-50">
            Previous
          </button>
          <span className="text-sm text-gray-400">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={transactions.length < 25 || loading}
            className="px-4 py-2 rounded-xl bg-white/60 dark:bg-white/[0.04] backdrop-blur-sm border border-white/20 dark:border-white/[0.06] text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/[0.07] transition-all duration-200 text-sm disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
