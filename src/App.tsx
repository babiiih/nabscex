import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WalletProvider } from "./contexts/WalletContext";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Swap from "./pages/Swap";
import Bridge from "./pages/Bridge";
import Pool from "./pages/Pool";
import Staking from "./pages/Staking";
import Lending from "./pages/Lending";
import Farming from "./pages/Farming";
import Launchpad from "./pages/Launchpad";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Faucet from "./pages/Faucet";
import Admin from "./pages/Admin";
import "./i18n";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <WalletProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="lg:ml-64 pt-6 pb-12 px-4 lg:px-8">
              <Routes>
                <Route path="/" element={<Swap />} />
                <Route path="/bridge" element={<Bridge />} />
                <Route path="/pool" element={<Pool />} />
                <Route path="/staking" element={<Staking />} />
                <Route path="/lending" element={<Lending />} />
                <Route path="/farming" element={<Farming />} />
                <Route path="/launchpad" element={<Launchpad />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/history" element={<History />} />
                <Route path="/faucet" element={<Faucet />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </main>

            <footer className="lg:ml-64 border-t border-gray-200 dark:border-gray-800 py-6 px-4 lg:px-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                    <span className="text-white font-bold text-[10px]">N</span>
                  </div>
                  <span className="text-sm font-semibold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">NabCex</span>
                  <span className="text-xs text-gray-400">Testnet DeFi Platform</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <a href="https://docs.arc.network" target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">Arc Docs</a>
                  <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">Explorer</a>
                  <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">Faucet</a>
                  <span className="text-gray-400">Built on Arc Testnet</span>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </WalletProvider>
    </ThemeProvider>
  );
}
