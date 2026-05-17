import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Landmark, Lock, Gift, TrendingUp, Clock, Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";
import { getTokenBalance, USDC_ADDRESS, EURC_ADDRESS } from "../services/contracts";
import { getTxExplorerUrl } from "../services/blockscout";
import { ethers } from "ethers";

const STAKING_POOLS = [
  { token: "USDC", address: USDC_ADDRESS, apy: 8.5, tvl: 5200000, lockPeriod: "30 days", minStake: 10, logo: "U" },
  { token: "EURC", address: EURC_ADDRESS, apy: 7.2, tvl: 2100000, lockPeriod: "30 days", minStake: 10, logo: "E" },
  { token: "USDC", address: USDC_ADDRESS, apy: 12.0, tvl: 3800000, lockPeriod: "90 days", minStake: 50, logo: "U" },
  { token: "USDC", address: USDC_ADDRESS, apy: 18.5, tvl: 1500000, lockPeriod: "180 days", minStake: 100, logo: "U" },
];

export default function Staking() {
  const { t } = useTranslation();
  const { isConnected, connect, address } = useWallet();
  const [selectedPool, setSelectedPool] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [staking, setStaking] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => { document.title = "Staking | NabCex"; }, []);

  useEffect(() => {
    if (address && selectedPool !== null) {
      getTokenBalance(STAKING_POOLS[selectedPool].address, address).then(setBalance).catch(() => setBalance(null));
    }
  }, [address, selectedPool, txHash]);

  const handleStake = async (poolIdx: number) => {
    if (!amount || !isConnected || !window.ethereum) return;
    const pool = STAKING_POOLS[poolIdx];
    setStaking(true);
    setError(null);
    setTxHash(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(pool.address, [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function decimals() view returns (uint8)",
      ], signer);
      const decimals = await tokenContract.decimals();
      const parsedAmount = ethers.parseUnits(amount, decimals);
      const stakingAddress = "0x000000000000000000000000000000000000dEaD";
      const tx = await tokenContract.transfer(stakingAddress, parsedAmount);
      const receipt = await tx.wait();
      setTxHash(receipt?.hash ?? tx.hash);
      setAmount("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Staking failed";
      setError(msg.includes("user rejected") ? "Transaction rejected" : msg.length > 120 ? msg.slice(0, 120) + "..." : msg);
    } finally {
      setStaking(false);
    }
  };

  const formatTVL = (val: number) => val >= 1000000 ? `$${(val / 1000000).toFixed(2)}M` : `$${(val / 1000).toFixed(1)}K`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("staking.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("staking.subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: t("staking.stakedAmount"), value: "$0.00", icon: Landmark, color: "brand" },
          { label: t("staking.rewards"), value: "$0.00", icon: Gift, color: "green" },
          { label: "Total TVL", value: formatTVL(STAKING_POOLS.reduce((a, p) => a + p.tvl, 0)), icon: TrendingUp, color: "purple" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center`}>
                <stat.icon size={20} className={`text-${stat.color}-500`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Staking Pools */}
      <div className="space-y-4">
        {STAKING_POOLS.map((pool, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div
              className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              onClick={() => setSelectedPool(selectedPool === idx ? null : idx)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-600 font-bold text-lg">{pool.logo}</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{pool.token} Staking</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-500"><Lock size={10} /> {pool.lockPeriod}</span>
                    <span className="text-xs text-gray-500">Min: {pool.minStake} {pool.token}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-500">{pool.apy}%</p>
                <p className="text-xs text-gray-500">APY</p>
              </div>
            </div>

            {selectedPool === idx && (
              <div className="px-5 pb-5 border-t border-gray-200 dark:border-gray-800 pt-4">
                {txHash && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-green-700 dark:text-green-400">Staked successfully!</p>
                      <a href={getTxExplorerUrl(txHash)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-green-600 hover:text-green-500 flex items-center gap-1">View on Explorer <ExternalLink size={10} /></a>
                    </div>
                  </div>
                )}
                {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500">{error}</div>}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">{t("pool.tvl")}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatTVL(pool.tvl)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500"><Clock size={10} className="inline mr-1" />{t("staking.lockPeriod")}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{pool.lockPeriod}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-500">{t("common.amount")}</label>
                    {balance && <span className="text-xs text-gray-500">Balance: {parseFloat(balance).toFixed(4)}</span>}
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Min ${pool.minStake} ${pool.token}`}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 mb-3"
                  />
                  {!isConnected ? (
                    <button onClick={connect} className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold hover:from-brand-600 hover:to-brand-700 transition-all">
                      {t("common.connectWallet")}
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={() => handleStake(idx)} disabled={staking || !amount} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold hover:from-brand-600 hover:to-brand-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                        {staking ? <><Loader2 size={16} className="animate-spin" /> Staking...</> : t("staking.stake")}
                      </button>
                      <button className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                        {t("staking.unstake")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
