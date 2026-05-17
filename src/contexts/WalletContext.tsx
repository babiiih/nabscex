import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { ethers } from "ethers";
import { ARC_TESTNET } from "../config/chains";

interface WalletContextType {
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToArc: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: "0",
  chainId: null,
  isConnected: false,
  isConnecting: false,
  provider: null,
  signer: null,
  connect: async () => {},
  disconnect: () => {},
  switchToArc: async () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState("0");
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const fetchBalance = useCallback(async (addr: string, prov: ethers.BrowserProvider) => {
    try {
      const bal = await prov.getBalance(addr);
      setBalance(ethers.formatUnits(bal, 18));
    } catch {
      setBalance("0");
    }
  }, []);

  const connect = useCallback(async () => {
    if (typeof window.ethereum === "undefined") {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    setIsConnecting(true);
    try {
      const prov = new ethers.BrowserProvider(window.ethereum);
      const accounts = await prov.send("eth_requestAccounts", []);
      const sign = await prov.getSigner();
      const network = await prov.getNetwork();
      setProvider(prov);
      setSigner(sign);
      setAddress(accounts[0]);
      setChainId(Number(network.chainId));
      await fetchBalance(accounts[0], prov);
    } catch (err) {
      console.error("Failed to connect wallet:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [fetchBalance]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance("0");
    setChainId(null);
    setProvider(null);
    setSigner(null);
  }, []);

  const switchToArc = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${ARC_TESTNET.id.toString(16)}` }],
      });
    } catch (switchError: unknown) {
      const err = switchError as { code?: number };
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${ARC_TESTNET.id.toString(16)}`,
              chainName: ARC_TESTNET.name,
              rpcUrls: [ARC_TESTNET.rpcUrl],
              nativeCurrency: ARC_TESTNET.nativeCurrency,
              blockExplorerUrls: [ARC_TESTNET.explorer],
            },
          ],
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
        if (provider) fetchBalance(accounts[0], provider);
      }
    };
    const handleChainChanged = (...args: unknown[]) => {
      const chainIdHex = args[0] as string;
      setChainId(parseInt(chainIdHex, 16));
      if (address && provider) fetchBalance(address, provider);
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [address, provider, disconnect, fetchBalance]);

  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = (await window.ethereum.request({ method: "eth_accounts" })) as string[];
          if (accounts.length > 0) {
            await connect();
          }
        } catch {}
      }
    };
    autoConnect();
  }, [connect]);

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        chainId,
        isConnected: !!address,
        isConnecting,
        provider,
        signer,
        connect,
        disconnect,
        switchToArc,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}
