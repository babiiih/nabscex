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
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("pool.title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("pool.subtitle")}</p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 w-fit">
        {(["pools", "add", "remove"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
            {tab === "pools" ? t("pool.title") : tab === "add" ? t("pool.addLiquidity") : t("pool.removeLiquidity")}
          </button>
        ))}
      </div>

      {activeTab === "pools" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-500 uppercase">
            <span>Pool</span>
            <span className="text-right">{t("pool.tvl")}</span>
            <span className="text-right">{t("pool.apr")}</span>
            <span className="text-right hidden sm:block">{t("common.volume24h")}</span>
            <span className="text-right">Action</span>
          </div>
          {POOL_DATA.map((pool, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center text-[10px] font-bold text-brand-600 border-2 border-white dark:border-gray-900">{pool.token0[0]}</div>
                  <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] font-bold text-purple-600 border-2 border-white dark:border-gray-900">{pool.token1[0]}</div>
                </div>
                <span className="font-medium text-gray-900 dark:text-white text-sm">{pool.token0}/{pool.token1}</span>
              </div>
              <span className="text-right font-medium text-gray-900 dark:text-white text-sm self-center">{formatTVL(pool.tvl)}</span>
              <span className="text-right text-green-500 font-medium text-sm self-center">{pool.apr}%</span>
              <span className="text-right text-gray-600 dark:text-gray-400 text-sm self-center hidden sm:block">{formatTVL(pool.volume24h)}</span>
              <div className="text-right self-center">
                <button onClick={() => setActiveTab("add")} className="px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-500 text-xs font-medium hover:bg-brand-500/20 transition-colors">
                  <Plus size={12} className="inline mr-1" />{t("pool.addLiquidity").split(" ")[0]}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "add" && (
        <div className="max-w-lg mx-auto">
          {txHash && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3">
              <CheckCircle size={20} className="text-green-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">Liquidity added!</p>
                <a href={getTxExplorerUrl(txHash)} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-500 flex items-center gap-1">View on Explorer <ExternalLink size={10} /></a>
              </div>
            </div>
          )}
          {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-500">{error}</div>}

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Droplets size={18} className="text-brand-500" /> {t("pool.addLiquidity")}
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-500">Token A</label>
                  {balanceA && <span className="text-xs text-gray-500">Balance: {parseFloat(balanceA).toFixed(4)}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <input type="number" value={amountA} onChange={(e) => setAmountA(e.target.value)} placeholder="0.0" className="flex-1 text-xl font-semibold bg-transparent text-gray-900 dark:text-white focus:outline-none placeholder-gray-300 dark:placeholder-gray-600" />
                  <button onClick={() => setSelectorFor("a")} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{tokenA.symbol}</span>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="flex justify-center"><Plus size={18} className="text-gray-400" /></div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Token B</label>
                <div className="flex items-center gap-3">
                  <input type="number" value={amountB} onChange={(e) => setAmountB(e.target.value)} placeholder="0.0" className="flex-1 text-xl font-semibold bg-transparent text-gray-900 dark:text-white focus:outline-none placeholder-gray-300 dark:placeholder-gray-600" />
                  <button onClick={() => setSelectorFor("b")} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{tokenB.symbol}</span>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
            {amountA && amountB && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
                <div className="flex justify-between text-xs text-gray-500"><span>{t("pool.poolShare")}</span><span>0.01%</span></div>
                <div className="flex justify-between text-xs text-gray-500"><span>{t("common.rate")}</span><span>1 {tokenA.symbol} = 1.0 {tokenB.symbol}</span></div>
              </div>
            )}
            <div className="p-4">
              {!isConnected ? (
                <button onClick={connect} className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg shadow-brand-500/25">
                  {t("common.connectWallet")}
                </button>
              ) : (
                <button onClick={handleAddLiquidity} disabled={adding || !amountA} className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-70">
                  {adding ? <><Loader2 size={18} className="animate-spin" /> Adding...</> : t("pool.addLiquidity")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "remove" && (
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
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
