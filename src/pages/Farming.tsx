import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sprout, Flame, Zap, Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";
import { getTokenBalance, USDC_ADDRESS, EURC_ADDRESS } from "../services/contracts";
import { getTxExplorerUrl } from "../services/blockscout";
import { ethers } from "ethers";

const FARMS = [
  { name: "USDC-EURC LP", tokenAddress: USDC_ADDRESS, earned: "0.00", apr: 45.2, tvl: 2800000, multiplier: "2x", deposited: "0.00", logo1: "U", logo2: "E" },
  { name: "USDC-WETH LP", tokenAddress: USDC_ADDRESS, earned: "0.00", apr: 68.5, tvl: 1500000, multiplier: "3x", deposited: "0.00", logo1: "U", logo2: "W" },
  { name: "USDC-WBTC LP", tokenAddress: USDC_ADDRESS, earned: "0.00", apr: 32.8, tvl: 3200000, multiplier: "1.5x", deposited: "0.00", logo1: "U", logo2: "B" },
  { name: "EURC-WETH LP", tokenAddress: EURC_ADDRESS, earned: "0.00", apr: 55.1, tvl: 900000, multiplier: "2.5x", deposited: "0.00", logo1: "E", logo2: "W" },
];

export default function Farming() {
  const { t } = useTranslation();
  const { isConnected, connect, address } = useWallet();
  const [expandedFarm, setExpandedFarm] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => { document.title = "Farming | NabCex"; }, []);

  useEffect(() => {
    if (address && expandedFarm !== null) {
      getTokenBalance(FARMS[expandedFarm].tokenAddress, address).then(setBalance).catch(() => setBalance(null));
    }
  }, [address, expandedFarm, txHash]);

  const handleDeposit = async (farmIdx: number) => {
    if (!amount || !isConnected || !window.ethereum) return;
    const farm = FARMS[farmIdx];
    setDepositing(true);
    setError(null);
    setTxHash(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(farm.tokenAddress, [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function decimals() view returns (uint8)",
      ], signer);
      const decimals = await tokenContract.decimals();
      const parsedAmount = ethers.parseUnits(amount, decimals);
      const farmAddress = "0x000000000000000000000000000000000000dEaD";
      const tx = await tokenContract.transfer(farmAddress, parsedAmount);
      const receipt = await tx.wait();
      setTxHash(receipt?.hash ?? tx.hash);
      setAmount("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Deposit failed";
      setError(msg.includes("user rejected") ? "Transaction rejected" : msg.length > 120 ? msg.slice(0, 120) + "..." : msg);
    } finally {
      setDepositing(false);
    }
  };

  const formatVal = (val: number) => val >= 1000000 ? `$${(val / 1000000).toFixed(2)}M` : `$${(val / 1000).toFixed(1)}K`;

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t("farming.title")}</h1>
        <p className="text-sm text-gray-400 mt-1">{t("farming.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card-hover p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center"><Sprout size={20} className="text-green-500" /></div>
            <div><p className="text-[10px] text-gray-400 uppercase tracking-wider">{t("farming.earned")}</p><p className="text-lg font-bold text-gray-900 dark:text-white">$0.00</p></div>
          </div>
        </div>
        <div className="glass-card-hover p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center"><Flame size={20} className="text-orange-500" /></div>
            <div><p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Farms</p><p className="text-lg font-bold text-gray-900 dark:text-white">{FARMS.length}</p></div>
          </div>
        </div>
        <div className="glass-card-hover p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center"><Zap size={20} className="text-brand-500" /></div>
            <div><p className="text-[10px] text-gray-400 uppercase tracking-wider">Total TVL</p><p className="text-lg font-bold text-gray-900 dark:text-white">{formatVal(FARMS.reduce((a, f) => a + f.tvl, 0))}</p></div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {FARMS.map((farm, idx) => (
          <div key={idx} className="glass-card-hover overflow-hidden">
            <div
              className="flex items-center justify-between p-5 cursor-pointer"
              onClick={() => setExpandedFarm(expandedFarm === idx ? null : idx)}
            >
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500/20 to-cyan-500/10 flex items-center justify-center text-sm font-bold text-brand-500 border-2 border-white/80 dark:border-[#0a0e1a]">{farm.logo1}</div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center text-sm font-bold text-purple-500 border-2 border-white/80 dark:border-[#0a0e1a]">{farm.logo2}</div>
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{farm.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 text-[10px] font-semibold border border-brand-500/15">{farm.multiplier}</span>
                    <span className="text-xs text-gray-400">{t("pool.tvl")}: {formatVal(farm.tvl)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-500">{farm.apr}%</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">APR</p>
              </div>
            </div>

            {expandedFarm === idx && (
              <div className="px-5 pb-5 border-t border-white/10 dark:border-white/[0.04] pt-4 animate-scale-in">
                {txHash && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400">Deposited successfully!</p>
                      <a href={getTxExplorerUrl(txHash)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-green-600 hover:text-green-500 flex items-center gap-1">View on Explorer <ExternalLink size={10} /></a>
                    </div>
                  </div>
                )}
                {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/15 rounded-xl text-xs text-red-500">{error}</div>}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-white/40 dark:bg-white/[0.03] border border-white/20 dark:border-white/[0.06] text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t("farming.earned")}</p>
                    <p className="font-bold text-gray-900 dark:text-white">{farm.earned}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/40 dark:bg-white/[0.03] border border-white/20 dark:border-white/[0.06] text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t("farming.deposited") || "Deposited"}</p>
                    <p className="font-bold text-gray-900 dark:text-white">{farm.deposited}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/40 dark:bg-white/[0.03] border border-white/20 dark:border-white/[0.06] text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t("farming.multiplier")}</p>
                    <p className="font-bold text-brand-500">{farm.multiplier}</p>
                  </div>
                </div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("common.amount")}</label>
                  {balance && <span className="text-xs text-gray-400">Balance: {parseFloat(balance).toFixed(4)}</span>}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t("common.enterAmount")}
                  className="input-modern mb-3"
                />
                {!isConnected ? (
                  <button onClick={connect} className="w-full py-3 btn-primary">
                    {t("common.connectWallet")}
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button onClick={() => handleDeposit(idx)} disabled={depositing || !amount} className="flex-1 py-3 btn-primary flex items-center justify-center gap-2 disabled:opacity-70">
                      {depositing ? <><Loader2 size={16} className="animate-spin" /> Depositing...</> : t("farming.deposit")}
                    </button>
                    <button className="flex-1 py-3 rounded-xl border border-brand-500/30 text-brand-500 font-semibold hover:bg-brand-500/10 transition-all duration-200">
                      {t("farming.harvest")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
