import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Settings, Plus, Trash2, Save, Shield, AlertTriangle, Lock } from "lucide-react";
import { ARC_TOKENS } from "../config/tokens";
import { useWallet } from "../contexts/WalletContext";

const ADMIN_WALLET = "0xCCde4A0189384B5188470F15ED2CA83267D04b12";
const ADMIN_EMAIL = "naufalbaliputraa@gmail.com";

interface CustomToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
}

export default function Admin() {
  const { t } = useTranslation();
  const { isConnected, connect, address } = useWallet();
  const [activeTab, setActiveTab] = useState<"tokens" | "fees" | "settings">("tokens");
  const [customTokens, setCustomTokens] = useState<CustomToken[]>([]);
  const [newToken, setNewToken] = useState<CustomToken>({ symbol: "", name: "", address: "", decimals: 18 });
  const [swapFee, setSwapFee] = useState("0.3");
  const [bridgeFee, setBridgeFee] = useState("0.01");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => { document.title = "Admin | NabCex"; }, []);

  const isAdmin = address?.toLowerCase() === ADMIN_WALLET.toLowerCase();

  const addToken = () => {
    if (newToken.symbol && newToken.name && newToken.address) {
      setCustomTokens([...customTokens, newToken]);
      setNewToken({ symbol: "", name: "", address: "", decimals: 18 });
      setShowAddForm(false);
    }
  };

  const removeToken = (idx: number) => {
    setCustomTokens(customTokens.filter((_, i) => i !== idx));
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto animate-slide-up">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t("admin.title")}</h1>
          <p className="text-sm text-gray-400 mt-1">{t("admin.subtitle")}</p>
        </div>
        <div className="glass-card p-12 text-center">
          <Shield size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-400 mb-4">{t("common.walletNotConnected")}</p>
          <button onClick={connect} className="px-6 py-3 btn-primary">
            {t("common.connectWallet")}
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto animate-slide-up">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t("admin.title")}</h1>
          <p className="text-sm text-gray-400 mt-1">{t("admin.subtitle")}</p>
        </div>
        <div className="glass-card p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0" />
          <Lock size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-2">This page is restricted to authorized administrators only.</p>
          <p className="text-xs text-gray-500 font-mono">
            Connected: {address?.slice(0, 8)}...{address?.slice(-4)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Contact <span className="text-brand-500">{ADMIN_EMAIL}</span> for access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t("admin.title")}</h1>
        <p className="text-sm text-gray-400 mt-1">{t("admin.subtitle")}</p>
      </div>

      <div className="flex items-center gap-2 mb-4 text-xs text-amber-500 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/15">
        <AlertTriangle size={14} />
        <span>Testnet only — admin functions are simulated for demonstration purposes</span>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-xl mb-6 w-fit">
        {(["tokens", "fees", "settings"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
            activeTab === tab ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}>
            {tab === "tokens" ? t("admin.tokenList") : tab === "fees" ? t("admin.feeSettings") : t("common.settings")}
          </button>
        ))}
      </div>

      {activeTab === "tokens" && (
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/10 dark:border-white/[0.04]">
            <h3 className="font-bold text-gray-900 dark:text-white">{t("admin.tokenList")}</h3>
            <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-500 text-sm font-semibold hover:bg-brand-500/20 transition-all duration-200 border border-brand-500/15">
              <Plus size={14} /> {t("admin.addToken")}
            </button>
          </div>

          {showAddForm && (
            <div className="p-5 border-b border-white/10 dark:border-white/[0.04] bg-white/40 dark:bg-white/[0.02] animate-scale-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input value={newToken.symbol} onChange={(e) => setNewToken({ ...newToken, symbol: e.target.value })} placeholder="Symbol (e.g. TOKEN)" className="input-modern text-sm" />
                <input value={newToken.name} onChange={(e) => setNewToken({ ...newToken, name: e.target.value })} placeholder="Name (e.g. My Token)" className="input-modern text-sm" />
                <input value={newToken.address} onChange={(e) => setNewToken({ ...newToken, address: e.target.value })} placeholder="Contract Address (0x...)" className="input-modern text-sm" />
                <input type="number" value={newToken.decimals} onChange={(e) => setNewToken({ ...newToken, decimals: parseInt(e.target.value) || 18 })} placeholder="Decimals" className="input-modern text-sm" />
              </div>
              <button onClick={addToken} className="px-4 py-2 btn-primary text-sm flex items-center gap-1.5">
                <Plus size={14} /> {t("admin.addToken")}
              </button>
            </div>
          )}

          <div className="divide-y divide-gray-100/50 dark:divide-white/[0.04]">
            {ARC_TOKENS.map((token, idx) => (
              <div key={idx} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/40 dark:hover:bg-white/[0.03] transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/15 to-cyan-500/10 flex items-center justify-center text-brand-500 font-bold text-xs">{token.symbol[0]}</div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{token.symbol}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{token.address.slice(0, 10)}...{token.address.slice(-6)}</p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Default</span>
              </div>
            ))}
            {customTokens.map((token, idx) => (
              <div key={`custom-${idx}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/40 dark:hover:bg-white/[0.03] transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/15 to-pink-500/10 flex items-center justify-center text-purple-500 font-bold text-xs">{token.symbol[0]}</div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{token.symbol} — {token.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{token.address.slice(0, 10)}...{token.address.slice(-6)}</p>
                  </div>
                </div>
                <button onClick={() => removeToken(idx)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-all duration-200">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "fees" && (
        <div className="glass-card p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings size={18} className="text-brand-500" /> {t("admin.feeSettings")}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Swap Fee (%)</label>
              <input type="number" value={swapFee} onChange={(e) => setSwapFee(e.target.value)} step="0.01" className="input-modern" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Bridge Fee (USDC)</label>
              <input type="number" value={bridgeFee} onChange={(e) => setBridgeFee(e.target.value)} step="0.001" className="input-modern" />
            </div>
            <button className="px-6 py-3 btn-primary flex items-center gap-2">
              <Save size={16} /> {t("admin.updateFee")}
            </button>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="glass-card p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Protocol Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/40 dark:bg-white/[0.03] border border-white/20 dark:border-white/[0.06]">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Maintenance Mode</p>
                <p className="text-xs text-gray-400">Temporarily disable all swaps and bridges</p>
              </div>
              <button className="w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-600 relative transition-all duration-200">
                <div className="w-5 h-5 rounded-full bg-white absolute left-0.5 top-0.5 transition-transform shadow-sm" />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/40 dark:bg-white/[0.03] border border-white/20 dark:border-white/[0.06]">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Max Slippage Override</p>
                <p className="text-xs text-gray-400">Set maximum allowed slippage for all users</p>
              </div>
              <input type="number" defaultValue={5} className="w-20 px-3 py-1.5 rounded-lg border border-white/20 dark:border-white/[0.06] bg-white/50 dark:bg-white/[0.03] text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all duration-200" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/40 dark:bg-white/[0.03] border border-white/20 dark:border-white/[0.06]">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Fee Receiver Address</p>
                <p className="text-xs text-gray-400">Address that receives protocol fees</p>
              </div>
              <input type="text" defaultValue="0x0000...0000" className="w-40 px-3 py-1.5 rounded-lg border border-white/20 dark:border-white/[0.06] bg-white/50 dark:bg-white/[0.03] text-xs font-mono text-center focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all duration-200" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
