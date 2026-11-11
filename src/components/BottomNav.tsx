import React from 'react';
import { Wheat, Flame, Kanban, QrCode, ArrowUpDown } from 'lucide-react';
import { NavTab } from './Sidebar';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQRScanner: () => void;
  onOpenStockMovement: () => void;
  roastQueueCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenQRScanner,
  onOpenStockMovement,
  roastQueueCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#16120f]/95 backdrop-blur-xl border-t border-[#31251e] z-40 px-2 py-2 flex items-center justify-around no-print shadow-2xl">
      <button
        onClick={() => onSelectTab('pipeline')}
        className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer min-w-[56px] ${
          activeTab === 'pipeline'
            ? 'text-[#e07a48] bg-[#e07a48]/10'
            : 'text-[#8c7b6f] hover:text-[#f5ece5]'
        }`}
      >
        <Kanban className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-medium tracking-tight">Pipeline</span>
        {roastQueueCount > 0 && (
          <span className="absolute top-1 right-2 w-4 h-4 bg-[#e07a48] text-white text-[9px] font-bold rounded-full flex items-center justify-center font-mono">
            {roastQueueCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onSelectTab('green_beans')}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer min-w-[56px] ${
          activeTab === 'green_beans'
            ? 'text-[#e07a48] bg-[#e07a48]/10'
            : 'text-[#8c7b6f] hover:text-[#f5ece5]'
        }`}
      >
        <Wheat className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-medium tracking-tight">Green</span>
      </button>

      {/* Primary Center Floating Touch Button: Camera Scanner */}
      <button
        onClick={onOpenQRScanner}
        className="btn-crema flex flex-col items-center justify-center -mt-6 text-white rounded-full p-3.5 shadow-xl border-2 border-[#16120f] transition-transform active:scale-95 cursor-pointer"
        title="Open QR Camera Scanner"
      >
        <QrCode className="w-6 h-6" />
      </button>

      <button
        onClick={() => onSelectTab('roasted_beans')}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer min-w-[56px] ${
          activeTab === 'roasted_beans'
            ? 'text-[#e07a48] bg-[#e07a48]/10'
            : 'text-[#8c7b6f] hover:text-[#f5ece5]'
        }`}
      >
        <Flame className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-medium tracking-tight">Roasted</span>
      </button>

      <button
        onClick={onOpenStockMovement}
        className="flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer min-w-[56px] text-[#8c7b6f] hover:text-[#f5ece5]"
      >
        <ArrowUpDown className="w-5 h-5 mb-1 text-sky-400" />
        <span className="text-[10px] font-medium tracking-tight">Stock Log</span>
      </button>
    </nav>
  );
};
