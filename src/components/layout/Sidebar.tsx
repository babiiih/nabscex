import { useTranslation } from "react-i18next";
import { useLocation, Link } from "react-router-dom";
import {
  ArrowLeftRight,
  GitBranch,
  Droplets,
  Landmark,
  HandCoins,
  Sprout,
  Rocket,
  BarChart3,
  Clock,
  Settings,
  Droplet,
  Zap,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { path: "/", icon: ArrowLeftRight, labelKey: "nav.swap" },
  { path: "/bridge", icon: GitBranch, labelKey: "nav.bridge" },
  { path: "/pool", icon: Droplets, labelKey: "nav.pool" },
  { path: "/staking", icon: Landmark, labelKey: "nav.staking" },
  { path: "/lending", icon: HandCoins, labelKey: "nav.lending" },
  { path: "/farming", icon: Sprout, labelKey: "nav.farming" },
  { path: "/launchpad", icon: Rocket, labelKey: "nav.launchpad" },
  { divider: true },
  { path: "/dashboard", icon: BarChart3, labelKey: "nav.dashboard" },
  { path: "/history", icon: Clock, labelKey: "nav.history" },
  { path: "/faucet", icon: Droplet, labelKey: "nav.faucet" },
  { divider: true },
  { path: "/admin", icon: Settings, labelKey: "nav.admin" },
] as const;

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-16 left-0 bottom-0 z-40 w-72 bg-white/80 dark:bg-[#0d1224]/90 backdrop-blur-2xl border-r border-white/20 dark:border-white/[0.06] transform transition-transform duration-300 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col h-full p-5 gap-1 overflow-y-auto scrollbar-hide">
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-3">DeFi</p>
          {navItems.map((item, idx) => {
            if ("divider" in item) {
              return (
                <div key={`d-${idx}`} className="my-3">
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/[0.06] to-transparent" />
                  {idx === 7 && <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-3 px-3">Analytics</p>}
                  {idx === 10 && <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-3 px-3">System</p>}
                </div>
              );
            }
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? "bg-gradient-to-r from-brand-500/15 to-cyan-500/10 text-brand-500 dark:text-brand-400 shadow-sm shadow-brand-500/10"
                    : "text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-brand-400 to-cyan-500" />
                )}
                <div className={`p-1 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-brand-500/10"
                    : "group-hover:bg-gray-100 dark:group-hover:bg-white/[0.04]"
                }`}>
                  <Icon size={16} />
                </div>
                {t(item.labelKey)}
              </Link>
            );
          })}

          <div className="mt-auto pt-4">
            <div className="px-4 py-3.5 rounded-xl bg-gradient-to-br from-brand-500/10 via-cyan-500/5 to-purple-500/5 border border-brand-500/15 dark:border-brand-500/10 relative overflow-hidden">
              <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-brand-500/10 blur-xl" />
              <div className="flex items-center gap-2 mb-2">
                <Zap size={12} className="text-brand-500" />
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">Arc Testnet</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Chain ID</p>
                <p className="text-[10px] font-mono text-gray-600 dark:text-gray-300">5042002</p>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Gas Token</p>
                <p className="text-[10px] font-mono text-gray-600 dark:text-gray-300">USDC</p>
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
