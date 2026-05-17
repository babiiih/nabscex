const BASE = "https://testnet.arcscan.app/api";
const V2 = "https://testnet.arcscan.app/api/v2";

export interface BlockscoutTx {
  hash: string;
  from: { hash: string; name?: string | null };
  to: { hash: string; name?: string | null } | null;
  value: string;
  fee: { value: string };
  gas_used: string;
  gas_price: string;
  status: string;
  result: string;
  timestamp: string;
  method: string | null;
  decoded_input: { method_call: string; method_id: string } | null;
  block_number: number;
  transaction_types: string[];
  token_transfers: TokenTransfer[] | null;
}

export interface TokenTransfer {
  from: { hash: string };
  to: { hash: string };
  token: { address: string; symbol: string; name: string; decimals: string; type: string };
  total: { value: string; decimals: string };
}

export interface NetworkStats {
  total_transactions: string;
  total_addresses: string;
  total_blocks: string;
  transactions_today: string;
  gas_prices: { slow: number; average: number; fast: number };
  gas_used_today: string;
  network_utilization_percentage: number;
}

export interface EtherscanTx {
  hash: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  isError: string;
  timeStamp: string;
  methodId: string;
  input: string;
  blockNumber: string;
  nonce: string;
  txreceipt_status: string;
}

export async function getNetworkStats(): Promise<NetworkStats> {
  const res = await fetch(`${V2}/stats`);
  if (!res.ok) throw new Error("Failed to fetch network stats");
  return res.json();
}

export async function getRecentTransactions(limit = 20): Promise<BlockscoutTx[]> {
  const res = await fetch(`${V2}/transactions?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  const data = await res.json();
  return data.items || [];
}

export async function getAddressTransactions(address: string, page = 1, offset = 20): Promise<EtherscanTx[]> {
  const res = await fetch(
    `${BASE}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&page=${page}&offset=${offset}`
  );
  if (!res.ok) throw new Error("Failed to fetch address transactions");
  const data = await res.json();
  return data.result || [];
}

export async function getAddressTokenTransfers(address: string, page = 1, offset = 20): Promise<EtherscanTx[]> {
  const res = await fetch(
    `${BASE}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=desc&page=${page}&offset=${offset}`
  );
  if (!res.ok) throw new Error("Failed to fetch token transfers");
  const data = await res.json();
  return data.result || [];
}

export async function getAddressBalance(address: string): Promise<string> {
  const res = await fetch(`${BASE}?module=account&action=balance&address=${address}`);
  if (!res.ok) throw new Error("Failed to fetch balance");
  const data = await res.json();
  return data.result || "0";
}

export async function getTokenBalance(address: string, contractAddress: string): Promise<string> {
  const res = await fetch(
    `${BASE}?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${address}`
  );
  if (!res.ok) throw new Error("Failed to fetch token balance");
  const data = await res.json();
  return data.result || "0";
}

export function getTxExplorerUrl(hash: string): string {
  return `https://testnet.arcscan.app/tx/${hash}`;
}

export function getAddressExplorerUrl(address: string): string {
  return `https://testnet.arcscan.app/address/${address}`;
}

export function formatTxType(tx: EtherscanTx): string {
  const method = tx.methodId;
  if (method === "0xa9059cbb") return "Transfer";
  if (method === "0x095ea7b3") return "Approve";
  if (method === "0x23b872dd") return "TransferFrom";
  if (method === "0x42966c68") return "Burn";
  if (method === "0x40c10f19") return "Mint";
  if (method === "0x") return "Transfer";
  return "Contract Call";
}

export function formatTimestamp(ts: string): string {
  const date = new Date(Number(ts) * 1000);
  return date.toLocaleString();
}

export function weiToUsdc(wei: string, decimals = 6): string {
  const val = BigInt(wei);
  const div = BigInt(10 ** decimals);
  const whole = val / div;
  const frac = val % div;
  const fracStr = frac.toString().padStart(decimals, "0").slice(0, 4);
  return `${whole}.${fracStr}`;
}
