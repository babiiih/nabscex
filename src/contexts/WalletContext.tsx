import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { ethers } from "ethers";
import { Web3Auth, WEB3AUTH_NETWORK } from "@web3auth/modal";
import { ARC_TESTNET } from "../config/chains";

const WEB3AUTH_CLIENT_ID = import.meta.env.VITE_WEB3AUTH_CLIENT_ID || "";

interface WalletContextType {
  address: string | null;
  email: string | null;
  balance: string;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  loginMethod: "wallet" | "email" | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connect: () => Promise<void>;
  connectWithEmail: () => Promise<void>;
  disconnect: () => void;
  switchToArc: () => Promise<void>;
  web3authReady: boolean;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  email: null,
  balance: "0",
  chainId: null,
  isConnected: false,
  isConnecting: false,
  loginMethod: null,
  provider: null,
  signer: null,
  connect: async () => {},
  connectWithEmail: async () => {},
  disconnect: () => {},
  switchToArc: async () => {},
  web3authReady: false,
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [balance, setBalance] = useState("0");
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"wallet" | "email" | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [web3authReady, setWeb3authReady] = useState(false);
  const web3authRef = useRef<Web3Auth | null>(null);

  useEffect(() => {
    if (!WEB3AUTH_CLIENT_ID) return;
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId: WEB3AUTH_CLIENT_ID,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        });
        await web3auth.init();
        web3authRef.current = web3auth;
        setWeb3authReady(true);

        if (web3auth.connected && web3auth.provider) {
          const prov = new ethers.BrowserProvider(web3auth.provider);
          const sign = await prov.getSigner();
          const addr = await sign.getAddress();
          const network = await prov.getNetwork();
          setProvider(prov);
          setSigner(sign);
          setAddress(addr);
          setChainId(Number(network.chainId));
          setLoginMethod("email");
          try {
            const userInfo = await web3auth.getUserInfo();
            if (userInfo.email) setEmail(userInfo.email);
          } catch {
            // user info not available
          }
          try {
            const bal = await prov.getBalance(addr);
            setBalance(ethers.formatUnits(bal, 18));
          } catch {
            setBalance("0");
          }
        }
      } catch (err) {
        console.error("Web3Auth init error:", err);
      }
    };
    init();
  }, []);

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
      setLoginMethod("wallet");
      setEmail(null);
      await fetchBalance(accounts[0], prov);
    } catch (err) {
      console.error("Failed to connect wallet:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [fetchBalance]);

  const connectWithEmail = useCallback(async () => {
    const web3auth = web3authRef.current;
    if (!web3auth) {
      console.error("Web3Auth not initialized. Set VITE_WEB3AUTH_CLIENT_ID env variable.");
      return;
    }
    setIsConnecting(true);
    try {
      const web3authProvider = await web3auth.connect();
      if (!web3authProvider) throw new Error("No provider from Web3Auth");
      const prov = new ethers.BrowserProvider(web3authProvider);
      const sign = await prov.getSigner();
      const addr = await sign.getAddress();
      const network = await prov.getNetwork();
      setProvider(prov);
      setSigner(sign);
      setAddress(addr);
      setChainId(Number(network.chainId));
      setLoginMethod("email");
      try {
        const userInfo = await web3auth.getUserInfo();
        if (userInfo.email) setEmail(userInfo.email);
      } catch {
        // user info not available
      }
      await fetchBalance(addr, prov);
    } catch (err) {
      console.error("Failed to connect with email:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [fetchBalance]);

  const disconnect = useCallback(async () => {
    if (loginMethod === "email" && web3authRef.current?.connected) {
      try {
        await web3authRef.current.logout();
      } catch (err) {
        console.error("Web3Auth logout error:", err);
      }
    }
    setAddress(null);
    setEmail(null);
    setBalance("0");
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setLoginMethod(null);
  }, [loginMethod]);

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
    if (!window.ethereum || loginMethod === "email") return;
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
  }, [address, provider, disconnect, fetchBalance, loginMethod]);

  useEffect(() => {
    if (web3authRef.current?.connected) return;
    const autoConnect = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = (await window.ethereum.request({ method: "eth_accounts" })) as string[];
          if (accounts.length > 0) {
            await connect();
          }
        } catch {
          // auto-connect failed silently
        }
      }
    };
    autoConnect();
  }, [connect]);

  return (
    <WalletContext.Provider
      value={{
        address,
        email,
        balance,
        chainId,
        isConnected: !!address,
        isConnecting,
        loginMethod,
        provider,
        signer,
        connect,
        connectWithEmail,
        disconnect,
        switchToArc,
        web3authReady,
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
