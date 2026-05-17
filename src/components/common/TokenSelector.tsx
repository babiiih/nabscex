import { useState } from "react";
import { Search, X } from "lucide-react";
import { ARC_TOKENS, type Token } from "../../config/tokens";
import { useTranslation } from "react-i18next";

interface TokenSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  excludeToken?: Token;
}

export default function TokenSelector({ isOpen, onClose, onSelect, excludeToken }: TokenSelectorProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filtered = ARC_TOKENS.filter(
    (token) =>
      token.symbol !== excludeToken?.symbol &&
      (token.symbol.toLowerCase().includes(search.toLowerCase()) ||
        token.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white/90 dark:bg-[#151b2e]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/[0.08] overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-white/[0.06]">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("common.selectToken")}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-white/[0.06] transition-all duration-200">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t("common.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/20 dark:border-white/[0.06] bg-white/50 dark:bg-white/[0.03] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 backdrop-blur-sm transition-all duration-200"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto px-2 pb-4">
          {filtered.map((token) => (
            <button
              key={token.symbol}
              onClick={() => { onSelect(token); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/60 dark:hover:bg-white/[0.05] transition-all duration-200"
            >
              <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" onError={(e) => { (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect fill="%2314b8a6" width="32" height="32" rx="16"/><text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${token.symbol[0]}</text></svg>`; }} />
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">{token.symbol}</p>
                <p className="text-xs text-gray-400">{token.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
