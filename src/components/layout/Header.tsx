import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X, Moon, Sun, Globe, Wallet, ChevronDown, ExternalLink, Copy, LogOut, Mail } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useWallet } from "../../contexts/WalletContext";
import { shortenAddress } from "../../hooks/useTokenPrice";
import { ARC_TESTNET, ARC_EXPLORER } from "../../config/chains";
import ConnectModal from "../common/ConnectModal";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { address, email, balance, chainId, isConnected, isConnecting, loginMethod, disconnect, switchToArc } = useWallet();
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const isOnArc = chainId === ARC_TESTNET.id;

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("nabcex-lang", lang);
    setLangMenuOpen(false);
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/70 dark:bg-[#0d1224]/80 backdrop-blur-2xl border-b border-white/20 dark:border-white/[0.06]">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-white/[0.05] transition-all duration-200"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <span className="text-white font-extrabold text-sm">N</span>
            </div>
            <span className="text-lg font-extrabold gradient-text hidden sm:inline">
              NabCex
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 font-semibold border border-brand-500/15">
              {t("common.testnet")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => { setLangMenuOpen(!langMenuOpen); setWalletMenuOpen(false); }}
              className="p-2.5 rounded-xl hover:bg-gray-100/80 dark:hover:bg-white/[0.05] transition-all duration-200 text-gray-500 dark:text-gray-400"
            >
              <Globe size={18} />
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white/90 dark:bg-[#151b2e]/95 backdrop-blur-xl border border-white/20 dark:border-white/[0.08] rounded-xl shadow-2xl py-1.5 z-50 animate-scale-in">
                <button onClick={() => changeLanguage("en")} className={`w-full text-left px-4 py-2.5 text-sm transition-colors rounded-lg mx-auto hover:bg-gray-100/80 dark:hover:bg-white/[0.05] ${i18n.language === "en" ? "text-brand-500 font-semibold" : "text-gray-700 dark:text-gray-300"}`}>
                  English
                </button>
                <button onClick={() => changeLanguage("id")} className={`w-full text-left px-4 py-2.5 text-sm transition-colors rounded-lg hover:bg-gray-100/80 dark:hover:bg-white/[0.05] ${i18n.language === "id" ? "text-brand-500 font-semibold" : "text-gray-700 dark:text-gray-300"}`}>
                  Indonesia
                </button>
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-gray-100/80 dark:hover:bg-white/[0.05] transition-all duration-200 text-gray-500 dark:text-gray-400"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isConnected && !isOnArc && (
            <button
              onClick={switchToArc}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-semibold border border-amber-500/15 hover:bg-amber-500/20 transition-all duration-200"
            >
              Switch to Arc
            </button>
          )}

          {isConnected && address ? (
            <div className="relative">
              <button
                onClick={() => { setWalletMenuOpen(!walletMenuOpen); setLangMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/50 dark:bg-white/[0.05] border border-white/30 dark:border-white/[0.08] hover:bg-white/80 dark:hover:bg-white/[0.08] transition-all duration-200 backdrop-blur-sm"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-cyan-500 shadow-sm shadow-brand-500/30 flex items-center justify-center">
                  {loginMethod === "email" ? <Mail size={12} className="text-white" /> : null}
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white hidden sm:inline">
                  {email || shortenAddress(address)}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              {walletMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white/90 dark:bg-[#151b2e]/95 backdrop-blur-xl border border-white/20 dark:border-white/[0.08] rounded-2xl shadow-2xl py-2 z-50 animate-scale-in">
                  {email && (
                    <div className="px-5 py-2 border-b border-gray-100/50 dark:border-white/[0.06]">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{email}</p>
                    </div>
                  )}
                  <div className="px-5 py-3 border-b border-gray-100/50 dark:border-white/[0.06]">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t("common.balance")}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{parseFloat(balance).toFixed(4)} <span className="text-sm text-gray-400">USDC</span></p>
                  </div>
                  <div className="py-1">
                    <button onClick={copyAddress} className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-white/[0.05] transition-colors">
                      <Copy size={15} /> {t("common.copyAddress")}
                    </button>
                    <a href={`${ARC_EXPLORER}/address/${address}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-white/[0.05] transition-colors">
                      <ExternalLink size={15} /> {t("common.viewOnExplorer")}
                    </a>
                  </div>
                  <div className="border-t border-gray-100/50 dark:border-white/[0.06] pt-1">
                    <button onClick={() => { disconnect(); setWalletMenuOpen(false); }} className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                      <LogOut size={15} /> {t("common.disconnect")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setConnectModalOpen(true)}
              disabled={isConnecting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 text-white font-semibold text-sm transition-all duration-300 disabled:opacity-50 shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.98]"
            >
              <Wallet size={16} />
              <span className="hidden sm:inline">{isConnecting ? t("common.loading") : t("common.connect")}</span>
            </button>
          )}
        </div>
      </div>

      <ConnectModal isOpen={connectModalOpen} onClose={() => setConnectModalOpen(false)} />
    </header>
  );
}
