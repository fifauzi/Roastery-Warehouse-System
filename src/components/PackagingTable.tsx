import React, { useState } from 'react';
import { PackagingItem, UserProfile } from '../types';
import { AlertTriangle, Plus, Minus } from 'lucide-react';

interface PackagingTableProps {
  packagingItems: PackagingItem[];
  currentUser: UserProfile;
  searchQuery: string;
  onStockChange: (item: PackagingItem, delta: number) => void;
}

export const PackagingTable: React.FC<PackagingTableProps> = ({
  packagingItems,
  searchQuery,
  onStockChange,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const filtered = packagingItems.filter((item) => {
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesQuery && matchesCat;
  });

  const categories = ['All', 'Bags', 'Labels', 'Drinkware', 'Shipping'];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#f5ece5] flex items-center gap-2">
            Packaging, Stickers & Bar Supplies
            <span className="text-xs font-mono font-normal text-[#8c7b6f]">
              ({filtered.length} SKUs)
            </span>
          </h2>
          <p className="text-xs text-[#a69588]">
            Monitor coffee packaging bags, degassing valves, brand gold stickers, and takeaway cups.
          </p>
        </div>

        {/* Category Tabs Pill */}
        <div className="inline-flex items-center bg-[#1f1713] border border-[#382b22] rounded-full p-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-[#3b2e25] text-[#f5ece5] font-semibold shadow-sm'
                  : 'text-[#8c7b6f] hover:text-[#f5ece5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Cards with rounded-2xl glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((item) => {
          const isLowStock = item.currentStock <= item.minThreshold;
          const isCritical = item.currentStock <= item.minThreshold * 0.5;

          return (
            <div
              key={item.id}
              className={`glass-card rounded-2xl p-4 flex flex-col justify-between transition-all ${
                isCritical
                  ? 'border-rose-500/50 bg-[#251717]/90'
                  : isLowStock
                  ? 'border-amber-500/40 bg-[#261d17]/90'
                  : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[10px] text-[#e07a48] bg-[#291f18] px-2 py-0.5 rounded-full border border-[#423226]">
                    {item.sku}
                  </span>
                  <span className="text-[11px] text-[#8c7b6f] font-medium">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-[#f5ece5] leading-snug">
                  {item.name}
                </h3>
                <span className="text-[11px] text-[#8c7b6f] block mt-1">
                  Supplier: {item.supplier}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-[#31251e]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`font-mono text-xl font-bold tabular-nums ${
                          isLowStock ? 'text-rose-400' : 'text-[#f5ece5]'
                        }`}
                      >
                        {item.currentStock.toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs text-[#8c7b6f]">{item.unit}</span>
                    </div>
                    {isLowStock ? (
                      <span className="text-[10px] text-rose-400 flex items-center gap-1 font-medium mt-0.5">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        Re-order (Min {item.minThreshold} {item.unit})
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#736357] mt-0.5 block">
                        Safety threshold: {item.minThreshold} {item.unit}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono text-[#d9cdc3] block">
                      Rp {item.costPerUnit.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-[#736357] block">per {item.unit}</span>
                  </div>
                </div>

                {/* Quick Touch Increment/Decrement buttons */}
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => onStockChange(item, -50)}
                    disabled={item.currentStock <= 0}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[#251d18] hover:bg-[#31261f] disabled:opacity-30 text-[#c4b5a9] border border-[#3d2e24] rounded-lg transition-colors cursor-pointer"
                    title="Deduct 50 units"
                  >
                    <Minus className="w-3 h-3 text-rose-400" />
                    <span>-50</span>
                  </button>

                  <button
                    onClick={() => onStockChange(item, -10)}
                    disabled={item.currentStock <= 0}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-[#251d18] hover:bg-[#31261f] disabled:opacity-30 text-[#c4b5a9] border border-[#3d2e24] rounded-lg transition-colors cursor-pointer"
                    title="Deduct 10 units"
                  >
                    <Minus className="w-3 h-3 text-rose-400" />
                    <span>-10</span>
                  </button>

                  <button
                    onClick={() => onStockChange(item, 50)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[#e07a48]/20 hover:bg-[#e07a48]/30 text-[#e07a48] border border-[#e07a48]/30 rounded-lg transition-colors cursor-pointer"
                    title="Receive shipment (+50 units)"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+50</span>
                  </button>

                  <button
                    onClick={() => onStockChange(item, 250)}
                    className="btn-crema flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    title="Receive carton/batch (+250 units)"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+250</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
