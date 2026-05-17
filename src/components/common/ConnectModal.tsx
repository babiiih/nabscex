import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { X, Wallet, Mail, ArrowRight } from "lucide-react";
import { useWallet } from "../../contexts/WalletContext";

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConnectModal({ isOpen, onClose }: ConnectModalProps) {
  const { t } = useTranslation();
  const { connect, connectWithEmail, isConnecting, web3authReady } = useWallet();

  if (!isOpen) return null;

  const handleWalletConnect = async () => {
    await connect();
    onClose();
  };

  const handleEmailConnect = async () => {
    await connectWithEmail();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="glass-card p-0 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-500/0 via-brand-500/70 to-cyan-500/0" />

          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("connectModal.title")}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {t("connectModal.subtitle")}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-white/[0.05] transition-all duration-200 text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-6 pb-6 space-y-3">
            <button
              onClick={handleWalletConnect}
              disabled={isConnecting}
              className="w-full group relative overflow-hidden rounded-2xl border border-white/20 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.03] hover:bg-white/70 dark:hover:bg-white/[0.06] transition-all duration-300 disabled:opacity-50"
            >
              <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-orange-500/5 to-amber-500/5 dark:from-orange-500/[0.03] dark:to-amber-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-4 p-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                  <Wallet size={24} className="text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("connectModal.wallet")}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {t("connectModal.walletDesc")}
                  </p>
                </div>
                <ArrowRight size={20} className="text-gray-300 dark:text-gray-600 group-hover:text-orange-500 transition-colors shrink-0" />
              </div>
            </button>

            {web3authReady && (
              <button
                onClick={handleEmailConnect}
                disabled={isConnecting}
                className="w-full group relative overflow-hidden rounded-2xl border border-white/20 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.03] hover:bg-white/70 dark:hover:bg-white/[0.06] transition-all duration-300 disabled:opacity-50"
              >
                <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-brand-500/5 to-cyan-500/5 dark:from-brand-500/[0.03] dark:to-cyan-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-4 p-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">
                    <Mail size={24} className="text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {t("connectModal.email")}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {t("connectModal.emailDesc")}
                    </p>
                  </div>
                  <ArrowRight size={20} className="text-gray-300 dark:text-gray-600 group-hover:text-brand-500 transition-colors shrink-0" />
                </div>
              </button>
            )}

            {isConnecting && (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-gray-400">
                <div className="w-4 h-4 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                {t("common.loading")}
              </div>
            )}
          </div>

          <div className="px-6 pb-5">
            <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center leading-relaxed">
              {t("connectModal.terms")}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
