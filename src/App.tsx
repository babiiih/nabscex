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
          <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0e1a] text-gray-900 dark:text-white transition-colors duration-300 bg-mesh">
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="lg:ml-72 pt-8 pb-16 px-4 lg:px-10 animate-fade-in">
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

            <footer className="lg:ml-72 py-8 px-4 lg:px-10">
              <div className="max-w-6xl mx-auto">
                <div className="h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent mb-8" />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                      <span className="text-white font-bold text-xs">N</span>
                    </div>
                    <span className="text-sm font-bold gradient-text">NabCex</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 font-medium border border-brand-500/20">Testnet</span>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-gray-400">
                    <a href="https://docs.arc.network" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition-colors duration-200">Docs</a>
                    <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition-colors duration-200">Explorer</a>
                    <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition-colors duration-200">Faucet</a>
                    <span className="text-gray-500 dark:text-gray-600">Built on Arc</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </WalletProvider>
    </ThemeProvider>
  );
}
