import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Clock, Shield, ChevronDown, Zap } from "lucide-react";
import { SUPPORTED_CHAINS, ARC_TESTNET, type ChainConfig } from "../config/chains";
import { BRIDGE_TOKENS, type Token } from "../config/tokens";
import { useWallet } from "../contexts/WalletContext";

export default function Bridge() {
  const { t } = useTranslation();
  const { isConnected, connect } = useWallet();
  const [sourceChain, setSourceChain] = useState<ChainConfig>(ARC_TESTNET);
  const [destChain, setDestChain] = useState<ChainConfig>(SUPPORTED_CHAINS[1]);
  const [token, setToken] = useState<Token>(BRIDGE_TOKENS[0]);
  const [amount, setAmount] = useState("");
  const [showSourceChains, setShowSourceChains] = useState(false);
  const [showDestChains, setShowDestChains] = useState(false);
  const [showTokens, setShowTokens] = useState(false);

  useEffect(() => { document.title = "Bridge | NabCex"; }, []);

  const switchChains = () => {
    setSourceChain(destChain);
    setDestChain(sourceChain);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("bridge.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("bridge.subtitle")}</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
        {/* Chain Selection */}
        <div className="p-4 flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">{t("bridge.sourceChain")}</label>
            <div className="relative">
              <button
                onClick={() => { setShowSourceChains(!showSourceChains); setShowDestChains(false); }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brand-500/50 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white text-sm">{sourceChain.name}</span>
                <ChevronDown size={16} className="text-gray-500" />
              </button>
              {showSourceChains && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 py-1">
                  {SUPPORTED_CHAINS.filter(c => c.id !== destChain.id).map((chain) => (
                    <button key={chain.id} onClick={() => { setSourceChain(chain); setShowSourceChains(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {chain.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button onClick={switchChains} className="mt-5 p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-brand-500/10 hover:text-brand-500 transition-colors text-gray-500">
            <ArrowRight size={18} />
          </button>

          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">{t("bridge.destChain")}</label>
            <div className="relative">
              <button
                onClick={() => { setShowDestChains(!showDestChains); setShowSourceChains(false); }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brand-500/50 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white text-sm">{destChain.name}</span>
                <ChevronDown size={16} className="text-gray-500" />
              </button>
              {showDestChains && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 py-1">
                  {SUPPORTED_CHAINS.filter(c => c.id !== sourceChain.id).map((chain) => (
                    <button key={chain.id} onClick={() => { setDestChain(chain); setShowDestChains(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {chain.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Token & Amount */}
        <div className="px-4 pb-4">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">{t("common.amount")}</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 text-2xl font-semibold bg-transparent text-gray-900 dark:text-white focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
            />
            <div className="relative">
              <button
                onClick={() => setShowTokens(!showTokens)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-white">{token.symbol}</span>
                <ChevronDown size={16} className="text-gray-500" />
              </button>
              {showTokens && (
                <div className="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 py-1">
                  {BRIDGE_TOKENS.map((t) => (
                    <button key={t.symbol} onClick={() => { setToken(t); setShowTokens(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {t.symbol} - {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bridge Info */}
        {amount && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1"><Clock size={12} /> {t("bridge.estimatedTime")}</span>
              <span>~2-5 minutes</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t("bridge.bridgeFee")}</span>
              <span>~0.01 USDC</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1"><Shield size={12} /> Protocol</span>
              <span>CCTP v2</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{t("swap.youReceive")}</span>
              <span className="text-gray-900 dark:text-white font-medium">{(parseFloat(amount || "0") - 0.01).toFixed(2)} {token.symbol}</span>
            </div>
          </div>
        )}

        {/* Button */}
        <div className="p-4">
          {!isConnected ? (
            <button onClick={connect} className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-lg hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg shadow-brand-500/25">
              {t("common.connectWallet")}
            </button>
          ) : !amount ? (
            <button disabled className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 font-semibold text-lg cursor-not-allowed">
              {t("common.enterAmount")}
            </button>
          ) : (
            <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-lg hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2">
              <Zap size={20} />
              {t("bridge.bridgeButton")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
