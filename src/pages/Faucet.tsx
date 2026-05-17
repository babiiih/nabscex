import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Droplet, ExternalLink, Gift, Info, ArrowRight } from "lucide-react";
import { FAUCET_URL } from "../config/chains";

const FAUCET_TOKENS = [
  { name: "USDC on Arc Testnet", symbol: "USDC", amount: "20 USDC", description: "Native gas token on Arc. Required for all transactions.", color: "brand" },
  { name: "EURC on Arc Testnet", symbol: "EURC", amount: "20 EURC", description: "Euro-denominated stablecoin for FX and payments.", color: "blue" },
];

const STEPS = [
  { step: 1, title: "Visit Circle Faucet", desc: "Go to faucet.circle.com and select Arc Testnet" },
  { step: 2, title: "Enter Wallet Address", desc: "Paste your wallet address in the form" },
  { step: 3, title: "Claim Tokens", desc: "Click send to receive 20 USDC or EURC" },
  { step: 4, title: "Start Trading", desc: "Use your testnet tokens on NabCex" },
];

export default function Faucet() {
  const { t } = useTranslation();

  useEffect(() => { document.title = "Faucet | NabCex"; }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("faucet.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("faucet.subtitle")}</p>
      </div>

      {/* Main CTA */}
      <div className="bg-gradient-to-br from-brand-500/10 to-brand-600/5 border border-brand-500/20 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center shrink-0">
            <Droplet size={28} className="text-brand-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Circle Testnet Faucet</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Get free testnet USDC and EURC tokens on Arc Testnet to start testing DeFi features on NabCex. 
              Limit: one request per token per network every 2 hours.
            </p>
            <a
              href={FAUCET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg shadow-brand-500/25"
            >
              <Gift size={18} />
              {t("faucet.circleLink")}
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Available Tokens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {FAUCET_TOKENS.map((token, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-${token.color}-500/10 flex items-center justify-center text-${token.color}-500 font-bold`}>
                {token.symbol[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{token.name}</p>
                <p className="text-xs text-gray-500">{token.amount} per claim</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">{token.description}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Info size={18} className="text-brand-500" /> How to get testnet tokens
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step, idx) => (
            <div key={idx} className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">{step.step}</div>
                {idx < STEPS.length - 1 && <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 hidden lg:block" />}
              </div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">{step.title}</p>
              <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
