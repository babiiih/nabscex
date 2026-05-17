export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo: string;
  chainId: number;
  coingeckoId?: string;
}

export const ARC_TOKENS: Token[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x3600000000000000000000000000000000000000",
    decimals: 6,
    logo: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
    chainId: 5042002,
    coingeckoId: "usd-coin",
  },
  {
    symbol: "EURC",
    name: "Euro Coin",
    address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
    decimals: 6,
    logo: "https://assets.coingecko.com/coins/images/26045/small/euro-coin.png",
    chainId: 5042002,
    coingeckoId: "euro-coin",
  },
  {
    symbol: "USYC",
    name: "US Yield Coin",
    address: "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C",
    decimals: 6,
    logo: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
    chainId: 5042002,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: "0x0000000000000000000000000000000000000001",
    decimals: 18,
    logo: "https://assets.coingecko.com/coins/images/2518/small/weth.png",
    chainId: 5042002,
    coingeckoId: "ethereum",
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    address: "0x0000000000000000000000000000000000000002",
    decimals: 8,
    logo: "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png",
    chainId: 5042002,
    coingeckoId: "bitcoin",
  },
];

export const BRIDGE_TOKENS: Token[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x3600000000000000000000000000000000000000",
    decimals: 6,
    logo: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
    chainId: 5042002,
    coingeckoId: "usd-coin",
  },
  {
    symbol: "EURC",
    name: "Euro Coin",
    address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
    decimals: 6,
    logo: "https://assets.coingecko.com/coins/images/26045/small/euro-coin.png",
    chainId: 5042002,
    coingeckoId: "euro-coin",
  },
];

export const CONTRACT_ADDRESSES = {
  USDC: "0x3600000000000000000000000000000000000000",
  EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
  USYC: "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C",
  TOKEN_MESSENGER_V2: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
  MESSAGE_TRANSMITTER_V2: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
  GATEWAY_WALLET: "0x0077777d7EBA4688BDeF3E311b846F25870A19B9",
  FX_ESCROW: "0x867650F5eAe8df91445971f14d89fd84F0C9a9f8",
  PERMIT2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
  MULTICALL3: "0xcA11bde05977b3631167028862bE2a173976CA11",
};

export function getTokenBySymbol(symbol: string): Token | undefined {
  return ARC_TOKENS.find((t) => t.symbol === symbol);
}
