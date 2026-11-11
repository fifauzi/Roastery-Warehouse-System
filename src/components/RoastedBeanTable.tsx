import React, { useState } from 'react';
import { RoastedBean, UserProfile } from '../types';
import { getRestingBadge } from '../services/db';
import { QrCode, ArrowUpRight, Flame, Plus, Sparkles } from 'lucide-react';

interface RoastedBeanTableProps {
  roastedBeans: RoastedBean[];
  currentUser: UserProfile;
  searchQuery: string;
  onOpenQRLabel: (bean: RoastedBean) => void;
  onLogNewRoastBatch: () => void;
  onQuickStockOut: (bean: RoastedBean) => void;
}

export const RoastedBeanTable: React.FC<RoastedBeanTableProps> = ({
  roastedBeans,
  searchQuery,
  onOpenQRLabel,
  onLogNewRoastBatch,
  onQuickStockOut,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Resting' | 'Ready'>('All');

  const filtered = roastedBeans.filter((item) => {
    const matchesQuery =
      item.beanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.roasterMachine || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.flavorNotes.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));

    const badge = getRestingBadge(item.roastDate);
    const isResting = badge.days <= 5;
    const isReady = badge.days >= 6;

    if (statusFilter === 'Resting') return matchesQuery && isResting;
    if (statusFilter === 'Ready') return matchesQuery && isReady;
    return matchesQuery;
  });

  return (
    <div className="space-y-4">
      {/* Header and Segmented Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#f5ece5] flex items-center gap-2">
            Roasted Bean Batches & Degassing Racks
            <span className="text-xs font-mono font-normal text-[#8c7b6f]">
              ({filtered.length} active batches)
            </span>
          </h2>
          <p className="text-xs text-[#a69588]">
            Automated resting day calculation, weight loss % verification, and thermal sticker generation.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Segmented Filter Control pill */}
          <div className="inline-flex items-center bg-[#1f1713] border border-[#382b22] rounded-full p-1">
            {(['All', 'Ready', 'Resting'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setStatusFilter(mode)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === mode
                    ? 'bg-[#3b2e25] text-[#f5ece5] font-semibold shadow-sm'
                    : 'text-[#8c7b6f] hover:text-[#f5ece5]'
                }`}
              >
                {mode === 'All' ? 'All Batches' : mode === 'Ready' ? 'Ready (7+ Days)' : 'Resting (1-5 Days)'}
              </button>
            ))}
          </div>

          <button
            onClick={onLogNewRoastBatch}
            className="btn-crema flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Log Roast Batch</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181310]/90 text-[#8c7b6f] font-medium border-b border-[#31251e]">
              <tr>
                <th className="py-3 px-4">Batch # & Profile</th>
                <th className="py-3 px-3">Roast Date & Degassing Status</th>
                <th className="py-3 px-3">Machine & Yield</th>
                <th className="py-3 px-3">Weight Loss %</th>
                <th className="py-3 px-3 text-right">Remaining Stock</th>
                <th className="py-3 px-4 text-center">Thermal QR</th>
                <th className="py-3 px-3 text-right">Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d221b] font-sans">
              {filtered.map((batch) => {
                const restingInfo = getRestingBadge(batch.roastDate);
                const isResting = restingInfo.days <= 5;

                return (
                  <tr
                    key={batch.id}
                    className="hover:bg-[#281f18]/60 transition-colors group"
                  >
                    {/* Batch Number & Profile */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-[#e07a48]">
                            {batch.batchNumber}
                          </span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#291f19] border border-[#3d2e24] text-[#c4b5a9]">
                            {batch.roastLevel}
                          </span>
                        </div>
                        <span className="text-[#f5ece5] font-semibold text-sm">
                          {batch.beanName}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-[#8c7b6f] flex-wrap mt-0.5">
                          {batch.flavorNotes.map((note, i) => (
                            <React.Fragment key={note}>
                              {i > 0 && <span className="opacity-40">·</span>}
                              <span>{note}</span>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* Roast Date & Resting Status Badge */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1 items-start">
                        <div className="flex items-center gap-1 font-mono text-[#d9cdc3]">
                          <span>{batch.roastDate}</span>
                        </div>
                        <div
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-medium font-mono ${
                            isResting
                              ? 'text-amber-300 border-amber-700/60 bg-amber-950/40'
                              : 'text-emerald-300 border-emerald-700/60 bg-emerald-950/40'
                          }`}
                          title={restingInfo.description}
                        >
                          {isResting ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          ) : (
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                          )}
                          <span>{restingInfo.statusText}</span>
                        </div>
                      </div>
                    </td>

                    {/* Machine & Yield */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="text-[#e8ded6] font-medium">{batch.roasterMachine || 'Giesen Drum'}</span>
                        <span className="text-[11px] text-[#8c7b6f]">
                          Roaster: {(batch.roasterName || 'Staff').split(' ')[0]}
                        </span>
                        <span className="text-[10px] text-[#736357] font-mono">
                          {batch.greenWeightKg}kg green → {batch.roastedWeightKg}kg roasted
                        </span>
                      </div>
                    </td>

                    {/* Weight Loss % */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-semibold tabular-nums text-[#e8ded6]">
                          {batch.weightLossPercentage}%
                        </span>
                        <span className="text-[10px] text-[#736357]">
                          Spec: 14.5% - 16.5%
                        </span>
                      </div>
                    </td>

                    {/* Available Stock */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-sm font-bold tabular-nums text-[#e07a48]">
                            {batch.stockKg.toFixed(2)}
                          </span>
                          <span className="text-[#8c7b6f] text-[11px]">kg</span>
                        </div>
                        <span className="text-[10px] text-[#736357]">
                          {Math.floor(batch.stockKg * 4)} × 250g bags
                        </span>
                      </div>
                    </td>

                    {/* Thermal QR Sticker Action */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onOpenQRLabel(batch)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#f5ece5] bg-[#271e18] hover:bg-[#332720] border border-[#3d2e24] rounded-full transition-colors cursor-pointer"
                        title="Open 80mm Thermal Sticker Label"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#e07a48]" />
                        <span>Print Sticker</span>
                      </button>
                    </td>

                    {/* Quick Dispatch Out */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onQuickStockOut(batch)}
                        className="p-1.5 rounded-lg bg-[#271e18] hover:bg-[#332720] text-[#c4b5a9] border border-[#3d2e24] transition-colors cursor-pointer"
                        title="Dispatch stock to bar or packaging"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-[#8c7b6f] text-xs">
            No roasted batches match the current filter or search criteria.
          </div>
        )}
      </div>
    </div>
  );
};
