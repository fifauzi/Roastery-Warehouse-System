import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Coffee, QrCode, Plus, Search, ArrowUpDown, LogOut, LogIn, Cloud } from 'lucide-react';
import { NavTab } from './Sidebar';
import { ElectricNav } from './ElectricNav';

interface HeaderProps {
  currentUser: UserProfile;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenStockMovement: () => void;
  onOpenQRScanner: () => void;
  onOpenCreateRoastRequest: () => void;
  onOpenLogRoastBatch: () => void;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
  lowStockCount: number;
  pendingRequestsCount: number;
  isFirebaseLive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  searchQuery,
  onSearchChange,
  activeTab,
  onSelectTab,
  onOpenStockMovement,
  onOpenQRScanner,
  onOpenCreateRoastRequest,
  onOpenLogRoastBatch,
  onOpenAuthModal,
  onSignOut,
  lowStockCount,
  pendingRequestsCount,
  isFirebaseLive,
}) => {
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);


  return (
    <header className="sticky top-0 z-40 shrink-0 bg-[#16120f]/90 backdrop-blur-xl border-b border-[#31251e] px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4 no-print">
      {/* Left: Brand Wordmark in warm typography */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#e07a48] to-[#99461d] p-[1px] shadow-sm">
          <div className="w-full h-full bg-[#1c1512] rounded-[11px] flex items-center justify-center text-[#e07a48]">
            <Coffee className="w-4 h-4" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-[#f5ece5] font-sans flex items-center gap-1.5">
            BDS Coffee
            <span className="text-[10px] font-mono font-normal text-[#e07a48] bg-[#2a1f19] px-1.5 py-0.2 rounded border border-[#423126]">
              Roastery HQ
            </span>
          </span>
          <span className="text-[10px] text-[#8c7b6f] font-mono tracking-wider flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isFirebaseLive ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            ></span>
            {isFirebaseLive ? 'Firestore Live' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Center: Electric Nav Animation with lerped arc and particle glow */}
      <ElectricNav
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        pendingRequestsCount={pendingRequestsCount}
        lowStockCount={lowStockCount}
      />

      {/* Right Controls: Search, Quick Triggers, Luminous Orange Button, and User Avatar with Auth */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Search Input pill */}
        <div className="relative hidden md:block w-36 lg:w-48">
          <Search className="w-3.5 h-3.5 text-[#8c7b6f] absolute left-2.5 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search batch, lot..."
            className="w-full bg-[#1f1713] border border-[#382b22] rounded-full pl-8 pr-3 py-1.5 text-xs text-[#f5ece5] placeholder-[#736356] focus:outline-none focus:border-[#e07a48]/60 transition-colors"
          />
        </div>

        {/* Quick Scan QR button */}
        <button
          onClick={onOpenQRScanner}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#c4b5a9] bg-[#221a15] hover:bg-[#2b211a] border border-[#3b2d24] rounded-full transition-colors cursor-pointer"
          title="Scan Bag or Batch QR"
        >
          <QrCode className="w-3.5 h-3.5 text-[#e07a48]" />
          <span className="hidden sm:inline">Scan QR</span>
        </button>

        {/* Stock In / Out Log */}
        <button
          onClick={onOpenStockMovement}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#c4b5a9] bg-[#221a15] hover:bg-[#2b211a] border border-[#3b2d24] rounded-full transition-colors cursor-pointer"
          title="Stock In / Out Movement"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
          <span>Stock Log</span>
        </button>

        {/* Luminous Terracotta / Crema Orange Primary Button (Matches video + Deal button) */}
        {currentUser.role === 'head_roaster' ? (
          <button
            onClick={onOpenLogRoastBatch}
            className="btn-crema flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Batch</span>
          </button>
        ) : (
          <button
            onClick={onOpenCreateRoastRequest}
            className="btn-crema flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Roast Req</span>
          </button>
        )}

        {/* User Profile Avatar with Auth dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4a362a] to-[#2b1f18] border border-[#6b5240] flex items-center justify-center text-[#f5ece5] font-bold text-xs shadow-sm cursor-pointer hover:border-[#e07a48] transition-colors"
            title={`${currentUser.name} (${currentUser.title})`}
          >
            {currentUser.avatarInitials}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#1c1511] border border-[#3d2e24] rounded-2xl shadow-2xl p-3 z-50 text-xs space-y-2 animate-in fade-in">
              <div className="pb-2 border-b border-[#2d221c]">
                <span className="font-bold text-[#f5ece5] block truncate">{currentUser.name}</span>
                <span className="text-[11px] text-[#a69588] block truncate">{currentUser.email}</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full uppercase bg-[#281f18] text-[#e07a48] border border-[#3d2e24] mt-1 inline-block">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenAuthModal();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[#f5ece5] hover:bg-[#281f18] transition-colors text-left cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-sky-400" />
                  <span>Switch / Sign In Account</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-rose-300 hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sign Out (Firebase)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
