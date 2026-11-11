import React, { useState } from 'react';
import { GreenBean, UserProfile } from '../types';
import { QrCode, ArrowDownToLine, Flame, AlertCircle, Plus } from 'lucide-react';

interface GreenBeanTableProps {
  greenBeans: GreenBean[];
  currentUser: UserProfile;
  searchQuery: string;
  onOpenQRLabel: (bean: GreenBean) => void;
  onRequestRoast: (bean: GreenBean) => void;
  onQuickStockAdjust: (bean: GreenBean, isStockIn: boolean) => void;
  onAddNewBean: () => void;
}

export const GreenBeanTable: React.FC<GreenBeanTableProps> = ({
  greenBeans,
  searchQuery,
  onOpenQRLabel,
  onRequestRoast,
  onQuickStockAdjust,
  onAddNewBean,
}) => {
  const [processFilter, setProcessFilter] = useState<string>('All');

  const filtered = greenBeans.filter((item) => {
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.variety || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProcess = processFilter === 'All' || item.process === processFilter;
    return matchesQuery && matchesProcess;
  });

  const processes = ['All', 'Washed', 'Natural', 'Anaerobic'];

  return (
    <div className="space-y-4">
      {/* Table Header & Interactive Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#f5ece5] flex items-center gap-2">
            Green Bean Silos & Lots
            <span className="text-xs font-mono font-normal text-[#8c7b6f]">
              ({filtered.length} active lots)
            </span>
          </h2>
          <p className="text-xs text-[#a69588]">
            Raw unroasted specialty coffee stock with moisture monitoring and lot tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Segmented Filter Control in rounded-full pill (as in video) */}
          <div className="inline-flex items-center bg-[#1f1713] border border-[#382b22] rounded-full p-1">
            {processes.map((proc) => (
              <button
                key={proc}
                onClick={() => setProcessFilter(proc)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                  processFilter === proc
                    ? 'bg-[#3b2e25] text-[#f5ece5] font-semibold shadow-sm'
                    : 'text-[#8c7b6f] hover:text-[#f5ece5]'
                }`}
              >
                {proc}
              </button>
            ))}
          </div>

          <button
            onClick={onAddNewBean}
            className="btn-crema flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Inbound Lot</span>
          </button>
        </div>
      </div>

      {/* Main High-Density Table with video's frosted glass styling */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181310]/90 text-[#8c7b6f] font-medium border-b border-[#31251e]">
              <tr>
                <th className="py-3 px-4">Lot # & Bean Name</th>
                <th className="py-3 px-3">Origin / Region</th>
                <th className="py-3 px-3">Process & Altitude</th>
                <th className="py-3 px-3">Moisture</th>
                <th className="py-3 px-3 text-right">Available Stock</th>
                <th className="py-3 px-3 text-right">Unit Cost</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d221b] font-sans">
              {filtered.map((bean) => {
                const isLowStock = bean.stockKg <= bean.minThresholdKg;
                return (
                  <tr
                    key={bean.id}
                    className="hover:bg-[#281f18]/60 transition-colors group"
                  >
                    {/* Lot & Name */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-[11px] text-[#e07a48] font-medium">
                          {bean.lotNumber}
                        </span>
                        <span className="text-[#f5ece5] font-semibold text-sm">
                          {bean.name}
                        </span>
                        <span className="text-[11px] text-[#8c7b6f]">
                          {bean.variety} · {bean.bagCount} bags (Jute/GrainPro)
                        </span>
                      </div>
                    </td>

                    {/* Origin / Region */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="text-[#e8ded6] font-medium">{bean.origin}</span>
                        <span className="text-[11px] text-[#8c7b6f]">{bean.region}</span>
                        <span className="text-[10px] text-[#736357]">Supplied by: {bean.supplier}</span>
                      </div>
                    </td>

                    {/* Process & Altitude */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="text-[#e8ded6] font-medium">{bean.process}</span>
                        <span className="text-[11px] text-[#8c7b6f] font-mono">{bean.altitude}</span>
                      </div>
                    </td>

                    {/* Moisture */}
                    <td className="py-3 px-3">
                      <div className="inline-flex items-center gap-1 font-mono tabular-nums text-[#d9cdc3]">
                        <span>{bean.moistureContent}%</span>
                        {bean.moistureContent > 12.0 ? (
                          <span className="text-[10px] text-rose-400" title="High moisture risk">⚠️</span>
                        ) : (
                          <span className="text-[10px] text-emerald-400">✓</span>
                        )}
                      </div>
                    </td>

                    {/* Available Stock */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                          <span
                            className={`font-mono text-sm font-bold tabular-nums ${
                              isLowStock ? 'text-rose-400' : 'text-[#f5ece5]'
                            }`}
                          >
                            {bean.stockKg.toFixed(1)}
                          </span>
                          <span className="text-[#8c7b6f] text-[11px]">kg</span>
                        </div>
                        {isLowStock ? (
                          <span className="text-[10px] text-rose-400 flex items-center gap-0.5">
                            <AlertCircle className="w-3 h-3" />
                            Below {bean.minThresholdKg}kg min
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#736357]">
                            Min: {bean.minThresholdKg} kg
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Cost Per Kg */}
                    <td className="py-3 px-3 text-right">
                      <span className="font-mono text-[#d9cdc3] tabular-nums">
                        Rp {bean.costPerKg.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-[#736357] block">/ kg</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Request Roast */}
                        <button
                          onClick={() => onRequestRoast(bean)}
                          className="p-1.5 rounded-lg bg-[#e07a48]/15 hover:bg-[#e07a48]/30 text-[#e07a48] border border-[#e07a48]/30 transition-colors cursor-pointer"
                          title="Create Roast Request with this lot"
                        >
                          <Flame className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Stock Log */}
                        <button
                          onClick={() => onQuickStockAdjust(bean, true)}
                          className="p-1.5 rounded-lg bg-[#271e18] hover:bg-[#332720] text-[#c4b5a9] border border-[#3d2e24] transition-colors cursor-pointer"
                          title="Record Stock In / Out"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                        </button>

                        {/* QR Thermal Sticker Preview */}
                        <button
                          onClick={() => onOpenQRLabel(bean)}
                          className="p-1.5 rounded-lg bg-[#271e18] hover:bg-[#332720] text-[#c4b5a9] border border-[#3d2e24] transition-colors cursor-pointer"
                          title="Generate & Print Lot QR Label"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#e07a48]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-[#8c7b6f] text-xs">
            No green coffee lots match your search query. Try clearing the filters.
          </div>
        )}
      </div>
    </div>
  );
};
