import React from 'react';
import {
  LayoutDashboard,
  Kanban,
  Wheat,
  Flame,
  ListOrdered,
  Package,
  History,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile } from '../types';

export type NavTab =
  | 'overview'
  | 'pipeline'
  | 'green_beans'
  | 'roasted_beans'
  | 'roast_queue'
  | 'packaging'
  | 'transactions'
  | 'surat_jalan'
  | 'executive_admin';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: UserProfile;
  roastQueueCount: number;
  lowStockCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  roastQueueCount,
  lowStockCount,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'pipeline',
      label: 'Roast Pipeline Board',
      icon: <Kanban className="w-4 h-4" />,
      badge: roastQueueCount > 0 ? roastQueueCount : undefined,
      badgeColor: 'bg-[#e07a48]/20 text-[#e07a48] border border-[#e07a48]/30',
    },
    {
      id: 'green_beans',
      label: 'Green Bean Warehouse',
      icon: <Wheat className="w-4 h-4" />,
    },
    {
      id: 'roasted_beans',
      label: 'Roasted Batches & Silos',
      icon: <Flame className="w-4 h-4" />,
    },
    {
      id: 'roast_queue',
      label: 'Roast Queue Requests',
      icon: <ListOrdered className="w-4 h-4" />,
      badge: roastQueueCount > 0 ? roastQueueCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'packaging',
      label: 'Packaging & Supplies',
      icon: <Package className="w-4 h-4" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    },
    {
      id: 'surat_jalan',
      label: 'Surat Jalan Dispatch',
      icon: <Truck className="w-4 h-4" />,
    },
    {
      id: 'transactions',
      label: 'Stock Audit Ledger',
      icon: <History className="w-4 h-4" />,
    },
    {
      id: 'executive_admin',
      label: 'Admin & Valuation',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 overflow-y-auto border-r border-amber-900/30 bg-[#16120f]/95 flex flex-col justify-between flex-none z-30 no-print scrollbar-thin scrollbar-thumb-amber-950">
      <div className="p-3">
        <div className="px-3 py-2 text-[10px] font-mono tracking-wider text-[#8c7b6f] uppercase">
          Roastery Navigation
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer text-left relative overflow-hidden ${
                  isActive
                    ? 'bg-[#2b2019] text-[#f5ece5] border border-[#60a5fa]/50 font-semibold shadow-[0_0_15px_rgba(96,165,250,0.15)]'
                    : 'text-[#a69588] hover:bg-[#221a15] hover:text-[#f5ece5]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-[#60a5fa] to-[#38bdf8] rounded-r shadow-[0_0_8px_#60a5fa]" />
                )}
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-[#60a5fa]' : 'text-[#8c7b6f]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Facility Footer Metadata in warm dark glass */}
      <div className="p-3 border-t border-[#31251e] text-[11px] text-[#8c7b6f]">
        <div className="px-2.5 py-2 rounded-xl bg-[#1d1612] border border-[#362920] space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[#8c7b6f]">Roastery Drum:</span>
            <span className="text-[#f5ece5] font-mono font-medium">Giesen W6A Artisan</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8c7b6f]">Resting Climate:</span>
            <span className="text-emerald-400 font-mono">21.8°C / 58% RH</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-[#2c2018]">
            <span className="text-[#8c7b6f]">Operator:</span>
            <span className="text-[#e07a48] font-mono truncate max-w-[90px]">{currentUser.name}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
