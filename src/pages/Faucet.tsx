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
    <div className="max-w-3xl mx-auto animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t("faucet.title")}</h1>
        <p className="text-sm text-gray-400 mt-1">{t("faucet.subtitle")}</p>
      </div>

      <div className="glass-card overflow-hidden relative p-6 mb-6">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-500/0 via-brand-500/50 to-cyan-500/0" />
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/20 to-cyan-500/10 flex items-center justify-center shrink-0">
            <Droplet size={28} className="text-brand-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Circle Testnet Faucet</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Get free testnet USDC and EURC tokens on Arc Testnet to start testing DeFi features on NabCex. 
              Limit: one request per token per network every 2 hours.
            </p>
            <a
              href={FAUCET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 btn-primary shadow-lg shadow-brand-500/25"
            >
              <Gift size={18} />
              {t("faucet.circleLink")}
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {FAUCET_TOKENS.map((token, idx) => (
          <div key={idx} className="glass-card-hover p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-${token.color}-500/10 flex items-center justify-center text-${token.color}-500 font-bold`}>
                {token.symbol[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{token.name}</p>
                <p className="text-xs text-gray-400">{token.amount} per claim</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">{token.description}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Info size={18} className="text-brand-500" /> How to get testnet tokens
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step, idx) => (
            <div key={idx} className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-brand-500/20">{step.step}</div>
                {idx < STEPS.length - 1 && <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 hidden lg:block" />}
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{step.title}</p>
              <p className="text-xs text-gray-400 mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
