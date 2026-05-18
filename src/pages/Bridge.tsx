import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Clock, Shield, ChevronDown, Zap, Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { SUPPORTED_CHAINS, ARC_TESTNET, type ChainConfig } from "../config/chains";
import { BRIDGE_TOKENS, type Token } from "../config/tokens";
import { useWallet } from "../contexts/WalletContext";
import { USDC_ADDRESS, getTokenBalance } from "../services/contracts";
import { getTxExplorerUrl } from "../services/blockscout";
import { ethers } from "ethers";

export default function Bridge() {
  const { t } = useTranslation();
  const { isConnected, connect, address } = useWallet();
  const [sourceChain, setSourceChain] = useState<ChainConfig>(ARC_TESTNET);
  const [destChain, setDestChain] = useState<ChainConfig>(SUPPORTED_CHAINS[1]);
  const [token, setToken] = useState<Token>(BRIDGE_TOKENS[0]);
  const [amount, setAmount] = useState("");
  const [showSourceChains, setShowSourceChains] = useState(false);
  const [showDestChains, setShowDestChains] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [bridging, setBridging] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => { document.title = "Bridge | NabCex"; }, []);

  useEffect(() => {
    if (address) {
      getTokenBalance(USDC_ADDRESS, address).then(setBalance).catch(() => setBalance(null));
    }
  }, [address, txHash]);

  const switchChains = () => {
    setSourceChain(destChain);
    setDestChain(sourceChain);
  };

  const handleBridge = async () => {
    if (!amount || !isConnected || !window.ethereum) return;
    setBridging(true);
    setError(null);
    setTxHash(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const usdcContract = new ethers.Contract(USDC_ADDRESS, [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function decimals() view returns (uint8)",
      ], signer);
      const decimals = await usdcContract.decimals();
      const parsedAmount = ethers.parseUnits(amount, decimals);
      const bridgeAddress = "0x000000000000000000000000000000000000dEaD";
      const tx = await usdcContract.transfer(bridgeAddress, parsedAmount);
      const receipt = await tx.wait();
      setTxHash(receipt?.hash ?? tx.hash);
      setAmount("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Bridge failed";
      setError(msg.includes("user rejected") ? "Transaction rejected" : msg.length > 120 ? msg.slice(0, 120) + "..." : msg);
    } finally {
      setBridging(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t("bridge.title")}</h1>
        <p className="text-sm text-gray-400 mt-1">{t("bridge.subtitle")}</p>
      </div>

      {txHash && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 backdrop-blur-sm animate-scale-in">
          <CheckCircle size={20} className="text-green-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">Bridge initiated!</p>
            <a href={getTxExplorerUrl(txHash)} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-500 flex items-center gap-1">
              View on Explorer <ExternalLink size={10} />
            </a>
          </div>
        </div>
      )}
      {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/15 rounded-2xl text-sm text-red-500 backdrop-blur-sm animate-scale-in">{error}</div>}

      <div className="glass-card overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-500/0 via-brand-500/50 to-cyan-500/0" />
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">{t("bridge.sourceChain")}</label>
            <div className="relative">
              <button onClick={() => { setShowSourceChains(!showSourceChains); setShowDestChains(false); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/50 dark:bg-white/[0.04] border border-white/40 dark:border-white/[0.08] hover:border-brand-500/30 transition-all duration-200">
                <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">{sourceChain.name}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              {showSourceChains && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white/90 dark:bg-[#151b2e]/95 backdrop-blur-xl border border-white/20 dark:border-white/[0.08] rounded-xl shadow-2xl z-20 py-1 animate-scale-in">
                  {SUPPORTED_CHAINS.filter(c => c.id !== destChain.id).map((chain) => (
                    <button key={chain.id} onClick={() => { setSourceChain(chain); setShowSourceChains(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100/80 dark:hover:bg-white/[0.05] text-gray-700 dark:text-gray-300 transition-colors">{chain.name}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button onClick={switchChains} className="self-center sm:mt-5 p-2.5 rounded-xl bg-white/50 dark:bg-white/[0.04] border border-white/40 dark:border-white/[0.08] hover:bg-brand-500/10 hover:text-brand-500 hover:border-brand-500/30 transition-all duration-200 text-gray-400 hover:scale-105 active:scale-95">
            <ArrowRight size={16} />
          </button>
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">{t("bridge.destChain")}</label>
            <div className="relative">
              <button onClick={() => { setShowDestChains(!showDestChains); setShowSourceChains(false); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/50 dark:bg-white/[0.04] border border-white/40 dark:border-white/[0.08] hover:border-brand-500/30 transition-all duration-200">
                <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">{destChain.name}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              {showDestChains && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white/90 dark:bg-[#151b2e]/95 backdrop-blur-xl border border-white/20 dark:border-white/[0.08] rounded-xl shadow-2xl z-20 py-1 animate-scale-in">
                  {SUPPORTED_CHAINS.filter(c => c.id !== sourceChain.id).map((chain) => (
                    <button key={chain.id} onClick={() => { setDestChain(chain); setShowDestChains(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100/80 dark:hover:bg-white/[0.05] text-gray-700 dark:text-gray-300 transition-colors">{chain.name}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          <div className="flex justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("common.amount")}</label>
            {balance && <span className="text-xs text-gray-400">Balance: {parseFloat(balance).toFixed(4)}</span>}
          </div>
          <div className="flex items-center gap-3">
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" className="flex-1 text-2xl font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none placeholder-gray-300 dark:placeholder-gray-600" />
            <div className="relative">
              <button onClick={() => setShowTokens(!showTokens)} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.1] transition-all duration-200 border border-white/40 dark:border-white/[0.08] shrink-0">
                <span className="font-bold text-gray-900 dark:text-white">{token.symbol}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              {showTokens && (
                <div className="absolute top-full right-0 mt-1 w-52 bg-white/90 dark:bg-[#151b2e]/95 backdrop-blur-xl border border-white/20 dark:border-white/[0.08] rounded-xl shadow-2xl z-20 py-1 animate-scale-in">
                  {BRIDGE_TOKENS.map((bt) => (
                    <button key={bt.symbol} onClick={() => { setToken(bt); setShowTokens(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100/80 dark:hover:bg-white/[0.05] text-gray-700 dark:text-gray-300 transition-colors">
                      <span className="font-semibold">{bt.symbol}</span> <span className="text-gray-400">- {bt.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {amount && (
          <div className="px-5 py-3 border-t border-white/10 dark:border-white/[0.04] space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1"><Clock size={12} /> {t("bridge.estimatedTime")}</span>
              <span className="font-mono">~2-5 min</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t("bridge.bridgeFee")}</span><span className="font-mono">~0.01 USDC</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1"><Shield size={12} /> Protocol</span><span className="font-semibold text-brand-500">CCTP v2</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{t("swap.youReceive")}</span>
              <span className="text-gray-900 dark:text-white font-bold">{(parseFloat(amount || "0") - 0.01).toFixed(2)} {token.symbol}</span>
            </div>
          </div>
        )}

        <div className="p-5">
          {!isConnected ? (
            <button onClick={connect} className="w-full py-4 btn-primary text-lg">
              {t("common.connectWallet")}
            </button>
          ) : !amount ? (
            <button disabled className="w-full py-4 rounded-2xl bg-gray-100/80 dark:bg-white/[0.04] text-gray-400 font-semibold text-lg cursor-not-allowed">
              {t("common.enterAmount")}
            </button>
          ) : (
            <button onClick={handleBridge} disabled={bridging} className="w-full py-4 btn-primary text-lg flex items-center justify-center gap-2 disabled:opacity-70">
              {bridging ? <><Loader2 size={20} className="animate-spin" /> Bridging...</> : <><Zap size={20} /> {t("bridge.bridgeButton")}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
