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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("common.selectToken")}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={20} className="text-gray-500" />
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto px-2 pb-4">
          {filtered.map((token) => (
            <button
              key={token.symbol}
              onClick={() => { onSelect(token); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" onError={(e) => { (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect fill="%2314b8a6" width="32" height="32" rx="16"/><text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${token.symbol[0]}</text></svg>`; }} />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">{token.symbol}</p>
                <p className="text-xs text-gray-500">{token.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
