import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X, Moon, Sun, Globe, Wallet, ChevronDown, ExternalLink, Copy, LogOut } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useWallet } from "../../contexts/WalletContext";
import { shortenAddress } from "../../hooks/useTokenPrice";
import { ARC_TESTNET, ARC_EXPLORER } from "../../config/chains";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { address, balance, chainId, isConnected, isConnecting, connect, disconnect, switchToArc } = useWallet();
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent hidden sm:inline">
              NabCex
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-500 font-medium border border-brand-500/20">
              {t("common.testnet")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => { setLangMenuOpen(!langMenuOpen); setWalletMenuOpen(false); }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
            >
              <Globe size={18} />
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 z-50">
                <button onClick={() => changeLanguage("en")} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${i18n.language === "en" ? "text-brand-500 font-medium" : "text-gray-700 dark:text-gray-300"}`}>
                  🇺🇸 English
                </button>
                <button onClick={() => changeLanguage("id")} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${i18n.language === "id" ? "text-brand-500 font-medium" : "text-gray-700 dark:text-gray-300"}`}>
                  🇮🇩 Indonesia
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Network Warning */}
          {isConnected && !isOnArc && (
            <button
              onClick={switchToArc}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-medium border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              Switch to Arc
            </button>
          )}

          {/* Wallet */}
          {isConnected && address ? (
            <div className="relative">
              <button
                onClick={() => { setWalletMenuOpen(!walletMenuOpen); setLangMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-400 to-brand-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:inline">
                  {shortenAddress(address)}
                </span>
                <ChevronDown size={14} className="text-gray-500" />
              </button>
              {walletMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500">{t("common.balance")}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{parseFloat(balance).toFixed(4)} USDC</p>
                  </div>
                  <button onClick={copyAddress} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Copy size={16} /> {t("common.copyAddress")}
                  </button>
                  <a href={`${ARC_EXPLORER}/address/${address}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <ExternalLink size={16} /> {t("common.viewOnExplorer")}
                  </a>
                  <button onClick={() => { disconnect(); setWalletMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                    <LogOut size={16} /> {t("common.disconnect")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-medium text-sm hover:from-brand-600 hover:to-brand-700 transition-all disabled:opacity-50 shadow-lg shadow-brand-500/25"
            >
              <Wallet size={16} />
              <span className="hidden sm:inline">{isConnecting ? t("common.loading") : t("common.connectWallet")}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
