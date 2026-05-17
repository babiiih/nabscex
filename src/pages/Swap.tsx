import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDownUp, Settings, Info, ChevronDown, Zap, Loader2, ExternalLink, CheckCircle } from "lucide-react";
import { ARC_TOKENS, type Token } from "../config/tokens";
import { useWallet } from "../contexts/WalletContext";
import { useTokenPrices, formatUSD } from "../hooks/useTokenPrice";
import TokenSelector from "../components/common/TokenSelector";
import { swapUSDCForEURC, swapEURCForUSDC, getExchangeRate, USDC_ADDRESS, EURC_ADDRESS, getTokenBalance } from "../services/contracts";
import { getTxExplorerUrl } from "../services/blockscout";

export default function Swap() {
  const { t } = useTranslation();
  const { isConnected, connect, address } = useWallet();
  const [fromToken, setFromToken] = useState<Token>(ARC_TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(ARC_TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState<"from" | "to" | null>(null);
  const [swapping, setSwapping] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<string | null>(null);
  const [fromBalance, setFromBalance] = useState<string | null>(null);
  const [toBalance, setToBalance] = useState<string | null>(null);

  const coingeckoIds = useMemo(
    () => ARC_TOKENS.filter((t) => t.coingeckoId).map((t) => t.coingeckoId!),
    []
  );
  const { prices } = useTokenPrices(coingeckoIds);

  const fromPrice = fromToken.coingeckoId ? prices[fromToken.coingeckoId]?.usd ?? 0 : 0;
  const toPrice = toToken.coingeckoId ? prices[toToken.coingeckoId]?.usd ?? 0 : 0;

  const isDirectSwapPair = useMemo(() => {
    const fromAddr = fromToken.address.toLowerCase();
    const toAddr = toToken.address.toLowerCase();
    return (fromAddr === USDC_ADDRESS.toLowerCase() && toAddr === EURC_ADDRESS.toLowerCase()) ||
           (fromAddr === EURC_ADDRESS.toLowerCase() && toAddr === USDC_ADDRESS.toLowerCase());
  }, [fromToken, toToken]);

  useEffect(() => {
    if (isDirectSwapPair) {
      getExchangeRate().then(setExchangeRate).catch(() => setExchangeRate(null));
    }
  }, [isDirectSwapPair]);

  useEffect(() => {
    if (address && fromToken.address) {
      getTokenBalance(fromToken.address, address).then(setFromBalance).catch(() => setFromBalance(null));
    }
    if (address && toToken.address) {
      getTokenBalance(toToken.address, address).then(setToBalance).catch(() => setToBalance(null));
    }
  }, [address, fromToken, toToken, txHash]);

  const toAmount = useMemo(() => {
    if (!fromAmount || !fromPrice || !toPrice) return "";
    const result = (parseFloat(fromAmount) * fromPrice) / toPrice;
    return result.toFixed(6);
  }, [fromAmount, fromPrice, toPrice]);

  const priceImpact = useMemo(() => {
    if (!fromAmount) return 0;
    return Math.min(parseFloat(fromAmount) * 0.003, 5);
  }, [fromAmount]);

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
  };

  const handleSwap = async () => {
    if (!fromAmount || !isConnected) return;
    setSwapping(true);
    setError(null);
    setTxHash(null);
    try {
      const fromAddr = fromToken.address.toLowerCase();
      let tx;
      if (fromAddr === USDC_ADDRESS.toLowerCase()) {
        tx = await swapUSDCForEURC(fromAmount);
      } else if (fromAddr === EURC_ADDRESS.toLowerCase()) {
        tx = await swapEURCForUSDC(fromAmount);
      } else {
        throw new Error("This token pair is not yet supported for on-chain swap. Only USDC ↔ EURC is available.");
      }
      const receipt = await tx.wait();
      setTxHash(receipt?.hash ?? tx.hash);
      setFromAmount("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Swap failed";
      if (msg.includes("user rejected")) {
        setError("Transaction rejected by user");
      } else {
        setError(msg.length > 120 ? msg.slice(0, 120) + "..." : msg);
      }
    } finally {
      setSwapping(false);
    }
  };

  useEffect(() => { document.title = "Swap | NabCex"; }, []);

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("swap.title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("swap.subtitle")}</p>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
          <Settings size={20} />
        </button>
      </div>

      {showSettings && (
        <div className="mb-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">{t("common.slippage")}</p>
          <div className="flex gap-2">
            {[0.1, 0.5, 1.0].map((s) => (
              <button key={s} onClick={() => setSlippage(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${slippage === s ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                {s}%
              </button>
            ))}
            <input type="number" value={slippage} onChange={(e) => setSlippage(parseFloat(e.target.value) || 0)} className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500/50" placeholder="0.5" />
          </div>
        </div>
      )}

      {txHash && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3">
          <CheckCircle size={20} className="text-green-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">Swap successful!</p>
            <a href={getTxExplorerUrl(txHash)} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-500 flex items-center gap-1">
              View on Explorer <ExternalLink size={10} />
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-500">{error}</div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between mb-2">
            <label className="text-xs font-medium text-gray-500">{t("swap.youPay")}</label>
            {fromBalance && <span className="text-xs text-gray-500">Balance: {parseFloat(fromBalance).toFixed(4)}</span>}
          </div>
          <div className="flex items-center gap-3">
            <input type="number" value={fromAmount} onChange={(e) => setFromAmount(e.target.value)} placeholder="0.0" className="flex-1 text-3xl font-semibold bg-transparent text-gray-900 dark:text-white focus:outline-none placeholder-gray-300 dark:placeholder-gray-600" />
            <button onClick={() => setSelectorOpen("from")} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0">
              <img src={fromToken.logo} alt={fromToken.symbol} className="w-6 h-6 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <span className="font-semibold text-gray-900 dark:text-white">{fromToken.symbol}</span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
          </div>
          {fromAmount && fromPrice > 0 && <p className="text-xs text-gray-500 mt-2">{formatUSD(parseFloat(fromAmount) * fromPrice)}</p>}
          {fromBalance && (
            <button onClick={() => setFromAmount(fromBalance)} className="text-[10px] text-brand-500 hover:text-brand-600 mt-1">MAX</button>
          )}
        </div>

        <div className="relative h-0">
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <button onClick={switchTokens} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-900 hover:bg-brand-500/10 hover:text-brand-500 transition-colors text-gray-500">
              <ArrowDownUp size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex justify-between mb-2">
            <label className="text-xs font-medium text-gray-500">{t("swap.youReceive")}</label>
            {toBalance && <span className="text-xs text-gray-500">Balance: {parseFloat(toBalance).toFixed(4)}</span>}
          </div>
          <div className="flex items-center gap-3">
            <input type="text" value={toAmount} readOnly placeholder="0.0" className="flex-1 text-3xl font-semibold bg-transparent text-gray-900 dark:text-white focus:outline-none placeholder-gray-300 dark:placeholder-gray-600" />
            <button onClick={() => setSelectorOpen("to")} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shrink-0">
              <img src={toToken.logo} alt={toToken.symbol} className="w-6 h-6 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <span className="font-semibold text-gray-900 dark:text-white">{toToken.symbol}</span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
          </div>
          {toAmount && toPrice > 0 && <p className="text-xs text-gray-500 mt-2">{formatUSD(parseFloat(toAmount) * toPrice)}</p>}
        </div>

        {fromAmount && toAmount && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1"><Info size={12} /> {t("common.rate")}</span>
              <span>1 {fromToken.symbol} = {(fromPrice / toPrice).toFixed(6)} {toToken.symbol}</span>
            </div>
            {exchangeRate && isDirectSwapPair && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>On-chain Rate</span>
                <span className="text-brand-500">{exchangeRate}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t("common.priceImpact")}</span>
              <span className={priceImpact > 3 ? "text-red-500" : "text-green-500"}>{priceImpact.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t("swap.minimumReceived")}</span>
              <span>{(parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6)} {toToken.symbol}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t("common.fee")}</span>
              <span>0.3%</span>
            </div>
            {!isDirectSwapPair && (
              <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 rounded-lg p-2 mt-2">
                <Info size={12} /> Only USDC ↔ EURC swap is available on-chain
              </div>
            )}
          </div>
        )}

        <div className="p-4">
          {!isConnected ? (
            <button onClick={connect} className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-lg hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg shadow-brand-500/25">
              {t("common.connectWallet")}
            </button>
          ) : !fromAmount ? (
            <button disabled className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 font-semibold text-lg cursor-not-allowed">
              {t("common.enterAmount")}
            </button>
          ) : !isDirectSwapPair ? (
            <button disabled className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 font-semibold text-lg cursor-not-allowed">
              Unsupported pair — select USDC ↔ EURC
            </button>
          ) : (
            <button onClick={handleSwap} disabled={swapping} className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-lg hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-70">
              {swapping ? <><Loader2 size={20} className="animate-spin" /> Swapping...</> : <><Zap size={20} /> {t("swap.swapButton")}</>}
            </button>
          )}
        </div>
      </div>

      <TokenSelector
        isOpen={selectorOpen !== null}
        onClose={() => setSelectorOpen(null)}
        onSelect={(token) => {
          if (selectorOpen === "from") setFromToken(token);
          else setToToken(token);
          setSelectorOpen(null);
        }}
        excludeToken={selectorOpen === "from" ? toToken : fromToken}
      />
    </div>
  );
}
