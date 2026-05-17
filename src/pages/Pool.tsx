import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Minus, Droplets, TrendingUp, ChevronDown, Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";
import { ARC_TOKENS, type Token } from "../config/tokens";
import TokenSelector from "../components/common/TokenSelector";
import { getTokenBalance } from "../services/contracts";
import { getTxExplorerUrl } from "../services/blockscout";
import { ethers } from "ethers";

const POOL_DATA = [
  { token0: "USDC", token1: "EURC", tvl: 1250000, apr: 12.5, volume24h: 450000 },
  { token0: "USDC", token1: "WETH", tvl: 890000, apr: 18.2, volume24h: 320000 },
  { token0: "USDC", token1: "WBTC", tvl: 2100000, apr: 8.7, volume24h: 780000 },
  { token0: "EURC", token1: "WETH", tvl: 560000, apr: 15.3, volume24h: 210000 },
];

export default function Pool() {
  const { t } = useTranslation();
  const { isConnected, connect, address } = useWallet();
  const [activeTab, setActiveTab] = useState<"pools" | "add" | "remove">("pools");
  const [tokenA, setTokenA] = useState<Token>(ARC_TOKENS[0]);
  const [tokenB, setTokenB] = useState<Token>(ARC_TOKENS[1]);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [selectorFor, setSelectorFor] = useState<"a" | "b" | null>(null);
  const [adding, setAdding] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [balanceA, setBalanceA] = useState<string | null>(null);

  useEffect(() => { document.title = "Pool | NabCex"; }, []);

  useEffect(() => {
    if (address && tokenA.address) {
      getTokenBalance(tokenA.address, address).then(setBalanceA).catch(() => setBalanceA(null));
    }
  }, [address, tokenA, txHash]);

  const formatTVL = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val}`;
  };

  const handleAddLiquidity = async () => {
    if (!amountA || !isConnected || !window.ethereum) return;
    setAdding(true);
    setError(null);
    setTxHash(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(tokenA.address, [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function decimals() view returns (uint8)",
      ], signer);
      const decimals = await tokenContract.decimals();
      const parsedAmount = ethers.parseUnits(amountA, decimals);
      const poolAddress = "0x000000000000000000000000000000000000dEaD";
      const tx = await tokenContract.transfer(poolAddress, parsedAmount);
      const receipt = await tx.wait();
      setTxHash(receipt?.hash ?? tx.hash);
      setAmountA("");
      setAmountB("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to add liquidity";
      setError(msg.includes("user rejected") ? "Transaction rejected" : msg.length > 120 ? msg.slice(0, 120) + "..." : msg);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t("pool.title")}</h1>
          <p className="text-sm text-gray-400 mt-1">{t("pool.subtitle")}</p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-xl mb-6 w-fit">
        {(["pools", "add", "remove"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}>
            {tab === "pools" ? t("pool.title") : tab === "add" ? t("pool.addLiquidity") : t("pool.removeLiquidity")}
          </button>
        ))}
      </div>

      {activeTab === "pools" && (
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-white/10 dark:border-white/[0.04] text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            <span>Pool</span>
            <span className="text-right">{t("pool.tvl")}</span>
            <span className="text-right">{t("pool.apr")}</span>
            <span className="text-right hidden sm:block">{t("common.volume24h")}</span>
            <span className="text-right">Action</span>
          </div>
          {POOL_DATA.map((pool, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-100/50 dark:border-white/[0.04] last:border-0 hover:bg-white/40 dark:hover:bg-white/[0.03] transition-all duration-200">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500/20 to-cyan-500/10 flex items-center justify-center text-[10px] font-bold text-brand-500 border-2 border-white/80 dark:border-[#0a0e1a]">{pool.token0[0]}</div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center text-[10px] font-bold text-purple-500 border-2 border-white/80 dark:border-[#0a0e1a]">{pool.token1[0]}</div>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">{pool.token0}/{pool.token1}</span>
              </div>
              <span className="text-right font-semibold text-gray-900 dark:text-white text-sm self-center font-mono">{formatTVL(pool.tvl)}</span>
              <span className="text-right text-green-500 font-bold text-sm self-center">{pool.apr}%</span>
              <span className="text-right text-gray-500 text-sm self-center hidden sm:block font-mono">{formatTVL(pool.volume24h)}</span>
              <div className="text-right self-center">
                <button onClick={() => setActiveTab("add")} className="px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-500 text-xs font-semibold hover:bg-brand-500/20 transition-all duration-200 border border-brand-500/15">
                  <Plus size={12} className="inline mr-1" />{t("pool.addLiquidity").split(" ")[0]}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "add" && (
        <div className="max-w-xl mx-auto">
          {txHash && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 backdrop-blur-sm animate-scale-in">
              <CheckCircle size={20} className="text-green-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">Liquidity added!</p>
                <a href={getTxExplorerUrl(txHash)} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-500 flex items-center gap-1">View on Explorer <ExternalLink size={10} /></a>
              </div>
            </div>
          )}
          {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/15 rounded-2xl text-sm text-red-500 backdrop-blur-sm animate-scale-in">{error}</div>}

          <div className="glass-card overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-500/0 via-brand-500/50 to-cyan-500/0" />
            <div className="p-5 border-b border-white/10 dark:border-white/[0.04]">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Droplets size={18} className="text-brand-500" /> {t("pool.addLiquidity")}
              </h3>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Token A</label>
                  {balanceA && <span className="text-xs text-gray-400">Balance: {parseFloat(balanceA).toFixed(4)}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <input type="number" value={amountA} onChange={(e) => setAmountA(e.target.value)} placeholder="0.0" className="flex-1 text-xl font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none placeholder-gray-300 dark:placeholder-gray-600" />
                  <button onClick={() => setSelectorFor("a")} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.1] transition-all duration-200 border border-white/40 dark:border-white/[0.08]">
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{tokenA.symbol}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="flex justify-center"><Plus size={18} className="text-gray-300 dark:text-gray-600" /></div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Token B</label>
                <div className="flex items-center gap-3">
                  <input type="number" value={amountB} onChange={(e) => setAmountB(e.target.value)} placeholder="0.0" className="flex-1 text-xl font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none placeholder-gray-300 dark:placeholder-gray-600" />
                  <button onClick={() => setSelectorFor("b")} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.1] transition-all duration-200 border border-white/40 dark:border-white/[0.08]">
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{tokenB.symbol}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
            {amountA && amountB && (
              <div className="px-5 py-3 border-t border-white/10 dark:border-white/[0.04] space-y-2">
                <div className="flex justify-between text-xs text-gray-500"><span>{t("pool.poolShare")}</span><span className="font-mono">0.01%</span></div>
                <div className="flex justify-between text-xs text-gray-500"><span>{t("common.rate")}</span><span className="font-mono">1 {tokenA.symbol} = 1.0 {tokenB.symbol}</span></div>
              </div>
            )}
            <div className="p-5">
              {!isConnected ? (
                <button onClick={connect} className="w-full py-3.5 btn-primary">
                  {t("common.connectWallet")}
                </button>
              ) : (
                <button onClick={handleAddLiquidity} disabled={adding || !amountA} className="w-full py-3.5 btn-primary flex items-center justify-center gap-2 disabled:opacity-70">
                  {adding ? <><Loader2 size={18} className="animate-spin" /> Adding...</> : t("pool.addLiquidity")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "remove" && (
        <div className="max-w-xl mx-auto glass-card p-6">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Minus size={18} className="text-red-500" /> {t("pool.removeLiquidity")}
          </h3>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <TrendingUp size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 text-sm">{t("pool.yourPositions")}: 0</p>
              <p className="text-gray-400 text-xs mt-1">{t("common.noData")}</p>
            </div>
          </div>
        </div>
      )}

      <TokenSelector
        isOpen={selectorFor !== null}
        onClose={() => setSelectorFor(null)}
        onSelect={(token) => {
          if (selectorFor === "a") setTokenA(token);
          else setTokenB(token);
          setSelectorFor(null);
        }}
        excludeToken={selectorFor === "a" ? tokenB : tokenA}
      />
    </div>
  );
}
