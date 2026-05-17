import { ethers } from "ethers";

export const SWAP_CONTRACT = "0x0F0201622F5a9AEd4Db7149b3767605cF7A2D66B";
export const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
export const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";
export const USYC_ADDRESS = "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C";
export const WUSDC_ADDRESS = "0x911b4000D3422F482F4062a913885f7b035382Df";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
];

const SWAP_ABI = [
  "function swapUSDCForEURC(uint256 usdcAmount)",
  "function swapEURCForUSDC(uint256 eurcAmount)",
  "function exchangeRateUint() view returns (uint256)",
  "function USDC() view returns (address)",
  "function EURC() view returns (address)",
];

const STAKING_ABI = [
  "function stake(uint256 amount) payable",
  "function unstake(uint256 amount)",
  "function claimRewards()",
  "function getStakedBalance(address account) view returns (uint256)",
  "function getRewards(address account) view returns (uint256)",
];

function getSigner(): ethers.Signer {
  if (!window.ethereum) throw new Error("No wallet connected");
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner() as unknown as ethers.Signer;
}

function getProvider(): ethers.BrowserProvider {
  if (!window.ethereum) throw new Error("No wallet connected");
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
  const provider = getProvider();
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const balance = await contract.balanceOf(userAddress);
  const decimals = await contract.decimals();
  return ethers.formatUnits(balance, decimals);
}

export async function getTokenDecimals(tokenAddress: string): Promise<number> {
  const provider = getProvider();
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  return Number(await contract.decimals());
}

export async function approveToken(
  tokenAddress: string,
  spenderAddress: string,
  amount: string,
  decimals: number
): Promise<ethers.TransactionResponse> {
  const signer = await getSigner();
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const parsedAmount = ethers.parseUnits(amount, decimals);
  return contract.approve(spenderAddress, parsedAmount);
}

export async function checkAllowance(
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string
): Promise<bigint> {
  const provider = getProvider();
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  return contract.allowance(ownerAddress, spenderAddress);
}

export async function swapUSDCForEURC(amount: string): Promise<ethers.TransactionResponse> {
  const signer = await getSigner();
  const signerAddress = await (signer as ethers.Signer & { getAddress(): Promise<string> }).getAddress();
  const decimals = await getTokenDecimals(USDC_ADDRESS);
  const parsedAmount = ethers.parseUnits(amount, decimals);

  const allowance = await checkAllowance(USDC_ADDRESS, signerAddress, SWAP_CONTRACT);
  if (allowance < parsedAmount) {
    const approveTx = await approveToken(USDC_ADDRESS, SWAP_CONTRACT, amount, decimals);
    await approveTx.wait();
  }

  const contract = new ethers.Contract(SWAP_CONTRACT, SWAP_ABI, signer);
  return contract.swapUSDCForEURC(parsedAmount);
}

export async function swapEURCForUSDC(amount: string): Promise<ethers.TransactionResponse> {
  const signer = await getSigner();
  const signerAddress = await (signer as ethers.Signer & { getAddress(): Promise<string> }).getAddress();
  const decimals = await getTokenDecimals(EURC_ADDRESS);
  const parsedAmount = ethers.parseUnits(amount, decimals);

  const allowance = await checkAllowance(EURC_ADDRESS, signerAddress, SWAP_CONTRACT);
  if (allowance < parsedAmount) {
    const approveTx = await approveToken(EURC_ADDRESS, SWAP_CONTRACT, amount, decimals);
    await approveTx.wait();
  }

  const contract = new ethers.Contract(SWAP_CONTRACT, SWAP_ABI, signer);
  return contract.swapEURCForUSDC(parsedAmount);
}

export async function getExchangeRate(): Promise<string> {
  const provider = getProvider();
  const contract = new ethers.Contract(SWAP_CONTRACT, SWAP_ABI, provider);
  const rate = await contract.exchangeRateUint();
  return ethers.formatUnits(rate, 6);
}

export async function transferToken(
  tokenAddress: string,
  toAddress: string,
  amount: string,
  decimals: number
): Promise<ethers.TransactionResponse> {
  const signer = await getSigner();
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const parsedAmount = ethers.parseUnits(amount, decimals);
  return contract.transfer(toAddress, parsedAmount);
}

export async function sendNativeToken(
  toAddress: string,
  amount: string
): Promise<ethers.TransactionResponse> {
  const signer = await getSigner();
  return (signer as ethers.Signer & { sendTransaction(tx: ethers.TransactionRequest): Promise<ethers.TransactionResponse> }).sendTransaction({
    to: toAddress,
    value: ethers.parseUnits(amount, 18),
  });
}

export { ERC20_ABI, SWAP_ABI, STAKING_ABI };
