import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { HandCoins, Shield, TrendingUp, AlertTriangle, Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";
import { getTokenBalance, USDC_ADDRESS, EURC_ADDRESS } from "../services/contracts";
import { getTxExplorerUrl } from "../services/blockscout";
import { ethers } from "ethers";

const LENDING_MARKETS = [
  { token: "USDC", address: USDC_ADDRESS, supplyAPY: 4.2, borrowAPR: 6.8, totalSupply: 8500000, totalBorrow: 5200000, collateralFactor: 85, logo: "U" },
  { token: "EURC", address: EURC_ADDRESS, supplyAPY: 3.8, borrowAPR: 5.9, totalSupply: 3200000, totalBorrow: 1800000, collateralFactor: 80, logo: "E" },
  { token: "WETH", address: "0x0000000000000000000000000000000000000000", supplyAPY: 2.1, borrowAPR: 4.5, totalSupply: 12000000, totalBorrow: 7500000, collateralFactor: 75, logo: "W" },
  { token: "WBTC", address: "0x0000000000000000000000000000000000000000", supplyAPY: 1.8, borrowAPR: 3.9, totalSupply: 25000000, totalBorrow: 15000000, collateralFactor: 70, logo: "B" },
];

export default function Lending() {
  const { t } = useTranslation();
  const { isConnected, connect, address } = useWallet();
  const [activeTab, setActiveTab] = useState<"supply" | "borrow">("supply");
  const [selectedMarket, setSelectedMarket] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => { document.title = "Lending | NabCex"; }, []);

  useEffect(() => {
    if (address && selectedMarket !== null) {
      const market = LENDING_MARKETS[selectedMarket];
      if (market.address !== "0x0000000000000000000000000000000000000000") {
        getTokenBalance(market.address, address).then(setBalance).catch(() => setBalance(null));
      }
    }
  }, [address, selectedMarket, txHash]);

  const handleSupplyOrBorrow = async (marketIdx: number) => {
    if (!amount || !isConnected || !window.ethereum) return;
    const market = LENDING_MARKETS[marketIdx];
    if (market.address === "0x0000000000000000000000000000000000000000") {
      setError("This token is not yet available on Arc Testnet");
      return;
    }
    setProcessing(true);
    setError(null);
    setTxHash(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(market.address, [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function decimals() view returns (uint8)",
      ], signer);
      const decimals = await tokenContract.decimals();
      const parsedAmount = ethers.parseUnits(amount, decimals);
      const lendingAddress = "0x000000000000000000000000000000000000dEaD";
      const tx = await tokenContract.transfer(lendingAddress, parsedAmount);
      const receipt = await tx.wait();
      setTxHash(receipt?.hash ?? tx.hash);
      setAmount("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      setError(msg.includes("user rejected") ? "Transaction rejected" : msg.length > 120 ? msg.slice(0, 120) + "..." : msg);
    } finally {
      setProcessing(false);
    }
  };

  const formatVal = (val: number) => val >= 1000000 ? `$${(val / 1000000).toFixed(2)}M` : `$${(val / 1000).toFixed(1)}K`;

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t("lending.title")}</h1>
        <p className="text-sm text-gray-400 mt-1">{t("lending.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Net Worth", value: "$0.00", icon: HandCoins },
          { label: t("lending.supply"), value: "$0.00", icon: TrendingUp },
          { label: t("lending.borrow"), value: "$0.00", icon: HandCoins },
          { label: t("lending.healthFactor"), value: "---", icon: Shield },
        ].map((s, i) => (
          <div key={i} className="glass-card-hover p-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 p-1 bg-gray-100/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-xl mb-6 w-fit">
        {(["supply", "borrow"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            {tab === "supply" ? t("lending.supply") : t("lending.borrow")}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-white/10 dark:border-white/[0.04] text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          <span>Asset</span>
          <span className="text-right">{activeTab === "supply" ? t("lending.supplyAPY") : t("lending.borrowAPR")}</span>
          <span className="text-right hidden sm:block">Total {activeTab === "supply" ? "Supply" : "Borrow"}</span>
          <span className="text-right">{t("lending.collateralFactor")}</span>
          <span className="text-right">Action</span>
        </div>
        {LENDING_MARKETS.map((market, idx) => (
          <div key={idx}>
            <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-100/50 dark:border-white/[0.04] last:border-0 hover:bg-white/40 dark:hover:bg-white/[0.03] transition-all duration-200 cursor-pointer" onClick={() => setSelectedMarket(selectedMarket === idx ? null : idx)}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500/15 to-cyan-500/10 flex items-center justify-center text-brand-500 font-bold">{market.logo}</div>
                <span className="font-semibold text-gray-900 dark:text-white">{market.token}</span>
              </div>
              <span className="text-right text-green-500 font-bold self-center">
                {activeTab === "supply" ? `${market.supplyAPY}%` : `${market.borrowAPR}%`}
              </span>
              <span className="text-right text-gray-500 text-sm self-center hidden sm:block font-mono">
                {formatVal(activeTab === "supply" ? market.totalSupply : market.totalBorrow)}
              </span>
              <span className="text-right text-gray-500 text-sm self-center font-mono">{market.collateralFactor}%</span>
              <div className="text-right self-center">
                <button className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                  activeTab === "supply" ? "bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 border-brand-500/15" : "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/15"
                }`}>
                  {activeTab === "supply" ? t("lending.supply") : t("lending.borrow")}
                </button>
              </div>
            </div>

            {selectedMarket === idx && (
              <div className="px-6 pb-4 border-b border-white/10 dark:border-white/[0.04] animate-scale-in">
                <div className="p-4 bg-white/40 dark:bg-white/[0.02] rounded-xl border border-white/20 dark:border-white/[0.06]">
                  {txHash && (
                    <div className="mb-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                      <CheckCircle size={16} className="text-green-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-green-700 dark:text-green-400">{activeTab === "supply" ? "Supplied" : "Borrowed"} successfully!</p>
                        <a href={getTxExplorerUrl(txHash)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-green-600 hover:text-green-500 flex items-center gap-1">View on Explorer <ExternalLink size={10} /></a>
                      </div>
                    </div>
                  )}
                  {error && <div className="mb-3 p-3 bg-red-500/10 border border-red-500/15 rounded-xl text-xs text-red-500">{error}</div>}
                  <div className="flex items-center gap-2 mb-3 text-xs text-amber-500 bg-amber-500/10 rounded-lg p-2 border border-amber-500/15">
                    <AlertTriangle size={12} /> {t("common.testnet")} — no real assets at risk
                  </div>
                  <div className="flex justify-between mb-1.5">
                    {balance && <span className="text-xs text-gray-400">Balance: {parseFloat(balance).toFixed(4)}</span>}
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`${t("common.enterAmount")} ${market.token}`}
                    className="input-modern mb-3"
                  />
                  {!isConnected ? (
                    <button onClick={connect} className="w-full py-3 btn-primary">
                      {t("common.connectWallet")}
                    </button>
                  ) : (
                    <button onClick={() => handleSupplyOrBorrow(idx)} disabled={processing || !amount} className="w-full py-3 btn-primary flex items-center justify-center gap-2 disabled:opacity-70">
                      {processing ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : `${activeTab === "supply" ? t("lending.supply") : t("lending.borrow")} ${market.token}`}
                    </button>
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
