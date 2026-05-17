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
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-16 left-0 bottom-0 z-40 w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col h-full p-4 gap-1 overflow-y-auto">
          {navItems.map((item, idx) => {
            if ("divider" in item) {
              return <div key={`d-${idx}`} className="h-px bg-gray-200 dark:bg-gray-800 my-2" />;
            }
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-500/10 text-brand-500 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Icon size={18} />
                {t(item.labelKey)}
              </Link>
            );
          })}

          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="px-3 py-3 rounded-xl bg-gradient-to-br from-brand-500/10 to-brand-600/5 border border-brand-500/20">
              <p className="text-xs font-medium text-brand-600 dark:text-brand-400">Arc Testnet</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Chain ID: 5042002</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Gas: USDC</p>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
