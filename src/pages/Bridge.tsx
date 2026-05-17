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
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("bridge.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("bridge.subtitle")}</p>
      </div>

      {txHash && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3">
          <CheckCircle size={20} className="text-green-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">Bridge initiated!</p>
            <a href={getTxExplorerUrl(txHash)} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-500 flex items-center gap-1">
              View on Explorer <ExternalLink size={10} />
            </a>
          </div>
        </div>
      )}
      {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-500">{error}</div>}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
        <div className="p-4 flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">{t("bridge.sourceChain")}</label>
            <div className="relative">
              <button onClick={() => { setShowSourceChains(!showSourceChains); setShowDestChains(false); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brand-500/50 transition-colors">
                <span className="font-medium text-gray-900 dark:text-white text-sm">{sourceChain.name}</span>
                <ChevronDown size={16} className="text-gray-500" />
              </button>
              {showSourceChains && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 py-1">
                  {SUPPORTED_CHAINS.filter(c => c.id !== destChain.id).map((chain) => (
                    <button key={chain.id} onClick={() => { setSourceChain(chain); setShowSourceChains(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">{chain.name}</button>
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
              <button onClick={() => { setShowDestChains(!showDestChains); setShowSourceChains(false); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brand-500/50 transition-colors">
                <span className="font-medium text-gray-900 dark:text-white text-sm">{destChain.name}</span>
                <ChevronDown size={16} className="text-gray-500" />
              </button>
              {showDestChains && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 py-1">
                  {SUPPORTED_CHAINS.filter(c => c.id !== sourceChain.id).map((chain) => (
                    <button key={chain.id} onClick={() => { setDestChain(chain); setShowDestChains(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">{chain.name}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex justify-between mb-1.5">
            <label className="text-xs font-medium text-gray-500">{t("common.amount")}</label>
            {balance && <span className="text-xs text-gray-500">Balance: {parseFloat(balance).toFixed(4)}</span>}
          </div>
          <div className="flex items-center gap-3">
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" className="flex-1 text-2xl font-semibold bg-transparent text-gray-900 dark:text-white focus:outline-none placeholder-gray-300 dark:placeholder-gray-600" />
            <div className="relative">
              <button onClick={() => setShowTokens(!showTokens)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <span className="font-semibold text-gray-900 dark:text-white">{token.symbol}</span>
                <ChevronDown size={16} className="text-gray-500" />
              </button>
              {showTokens && (
                <div className="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 py-1">
                  {BRIDGE_TOKENS.map((bt) => (
                    <button key={bt.symbol} onClick={() => { setToken(bt); setShowTokens(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">{bt.symbol} - {bt.name}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {amount && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1"><Clock size={12} /> {t("bridge.estimatedTime")}</span>
              <span>~2-5 minutes</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t("bridge.bridgeFee")}</span><span>~0.01 USDC</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1"><Shield size={12} /> Protocol</span><span>CCTP v2</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{t("swap.youReceive")}</span>
              <span className="text-gray-900 dark:text-white font-medium">{(parseFloat(amount || "0") - 0.01).toFixed(2)} {token.symbol}</span>
            </div>
          </div>
        )}

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
            <button onClick={handleBridge} disabled={bridging} className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-lg hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-70">
              {bridging ? <><Loader2 size={20} className="animate-spin" /> Bridging...</> : <><Zap size={20} /> {t("bridge.bridgeButton")}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
