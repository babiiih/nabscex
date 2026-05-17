import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDownUp, Settings, Info, ChevronDown, Zap } from "lucide-react";
import { ARC_TOKENS, type Token } from "../config/tokens";
import { useWallet } from "../contexts/WalletContext";
import { useTokenPrices, formatUSD } from "../hooks/useTokenPrice";
import TokenSelector from "../components/common/TokenSelector";

export default function Swap() {
  const { t } = useTranslation();
  const { isConnected, connect } = useWallet();
  const [fromToken, setFromToken] = useState<Token>(ARC_TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(ARC_TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState<"from" | "to" | null>(null);

  const coingeckoIds = useMemo(
    () => ARC_TOKENS.filter((t) => t.coingeckoId).map((t) => t.coingeckoId!),
    []
  );
  const { prices } = useTokenPrices(coingeckoIds);

  const fromPrice = fromToken.coingeckoId ? prices[fromToken.coingeckoId]?.usd ?? 0 : 0;
  const toPrice = toToken.coingeckoId ? prices[toToken.coingeckoId]?.usd ?? 0 : 0;

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

  useEffect(() => {
    document.title = "Swap | NabCex";
  }, []);

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("swap.title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("swap.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
        >
          <Settings size={20} />
        </button>
      </div>

      {showSettings && (
        <div className="mb-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">{t("common.slippage")}</p>
          <div className="flex gap-2">
            {[0.1, 0.5, 1.0].map((s) => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  slippage === s
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {s}%
              </button>
            ))}
            <input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(parseFloat(e.target.value) || 0)}
              className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              placeholder="0.5"
            />
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
        {/* From */}
        <div className="p-4">
          <label className="text-xs font-medium text-gray-500 mb-2 block">{t("swap.youPay")}</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 text-3xl font-semibold bg-transparent text-gray-900 dark:text-white focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
            />
            <button
              onClick={() => setSelectorOpen("from")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
            >
              <img src={fromToken.logo} alt={fromToken.symbol} className="w-6 h-6 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <span className="font-semibold text-gray-900 dark:text-white">{fromToken.symbol}</span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
          </div>
          {fromAmount && fromPrice > 0 && (
            <p className="text-xs text-gray-500 mt-2">{formatUSD(parseFloat(fromAmount) * fromPrice)}</p>
          )}
        </div>

        {/* Switch Button */}
        <div className="relative h-0">
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <button
              onClick={switchTokens}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-900 hover:bg-brand-500/10 hover:text-brand-500 transition-colors text-gray-500"
            >
              <ArrowDownUp size={18} />
            </button>
          </div>
        </div>

        {/* To */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
          <label className="text-xs font-medium text-gray-500 mb-2 block">{t("swap.youReceive")}</label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={toAmount}
              readOnly
              placeholder="0.0"
              className="flex-1 text-3xl font-semibold bg-transparent text-gray-900 dark:text-white focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
            />
            <button
              onClick={() => setSelectorOpen("to")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shrink-0"
            >
              <img src={toToken.logo} alt={toToken.symbol} className="w-6 h-6 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <span className="font-semibold text-gray-900 dark:text-white">{toToken.symbol}</span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
          </div>
          {toAmount && toPrice > 0 && (
            <p className="text-xs text-gray-500 mt-2">{formatUSD(parseFloat(toAmount) * toPrice)}</p>
          )}
        </div>

        {/* Info */}
        {fromAmount && toAmount && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1"><Info size={12} /> {t("common.rate")}</span>
              <span>1 {fromToken.symbol} = {(fromPrice / toPrice).toFixed(6)} {toToken.symbol}</span>
            </div>
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
          </div>
        )}

        {/* Button */}
        <div className="p-4">
          {!isConnected ? (
            <button
              onClick={connect}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-lg hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg shadow-brand-500/25"
            >
              {t("common.connectWallet")}
            </button>
          ) : !fromAmount ? (
            <button disabled className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 font-semibold text-lg cursor-not-allowed">
              {t("common.enterAmount")}
            </button>
          ) : (
            <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-lg hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2">
              <Zap size={20} />
              {t("swap.swapButton")}
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
