export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  explorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  logo: string;
  isTestnet: boolean;
}

export const ARC_TESTNET: ChainConfig = {
  id: 5042002,
  name: "Arc Testnet",
  rpcUrl: "https://rpc.testnet.arc.network",
  explorer: "https://testnet.arcscan.app",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  logo: "/chains/arc.svg",
  isTestnet: true,
};

export const ETHEREUM_SEPOLIA: ChainConfig = {
  id: 11155111,
  name: "Ethereum Sepolia",
  rpcUrl: "https://rpc.sepolia.org",
  explorer: "https://sepolia.etherscan.io",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  logo: "/chains/eth.svg",
  isTestnet: true,
};

export const ARBITRUM_SEPOLIA: ChainConfig = {
  id: 421614,
  name: "Arbitrum Sepolia",
  rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
  explorer: "https://sepolia.arbiscan.io",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  logo: "/chains/arb.svg",
  isTestnet: true,
};

export const BASE_SEPOLIA: ChainConfig = {
  id: 84532,
  name: "Base Sepolia",
  rpcUrl: "https://sepolia.base.org",
  explorer: "https://sepolia.basescan.org",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  logo: "/chains/base.svg",
  isTestnet: true,
};

export const SUPPORTED_CHAINS: ChainConfig[] = [
  ARC_TESTNET,
  ETHEREUM_SEPOLIA,
  ARBITRUM_SEPOLIA,
  BASE_SEPOLIA,
];

export const DEFAULT_CHAIN = ARC_TESTNET;

export const FAUCET_URL = "https://faucet.circle.com/";
export const ARC_EXPLORER = "https://testnet.arcscan.app";
