import React, { useState } from 'react';
import { GreenBean, RoastedBean, RoastRequest, UserProfile } from '../types';
import { getRestingBadge } from '../services/db';
import {
  Flame,
  Clock,
  Sparkles,
  CheckCircle2,
  Truck,
  Plus,
  QrCode,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface RoastPipelineBoardProps {
  roastRequests: RoastRequest[];
  roastedBeans: RoastedBean[];
  greenBeans: GreenBean[];
  currentUser: UserProfile;
  onOpenRoastModalWithRequest: (req: RoastRequest) => void;
  onOpenQRLabel: (bean: RoastedBean) => void;
  onUpdateQueueStatus: (id: string, status: any) => void;
  onOpenNewRoastModal: () => void;
}

export const RoastPipelineBoard: React.FC<RoastPipelineBoardProps> = ({
  roastRequests,
  roastedBeans,
  greenBeans,
  currentUser,
  onOpenRoastModalWithRequest,
  onOpenQRLabel,
  onUpdateQueueStatus,
  onOpenNewRoastModal,
}) => {
  const [filterProfile, setFilterProfile] = useState<string>('all');

  // Stages matching the video's pipeline columns:
  // 1. Queue (Pending Requests)
  // 2. In Machine (In Progress)
  // 3. Resting / Degassing (Days 1 - 5)
  // 4. Ready for Bar / Retail (Days 6+)
  // 5. Packaged & Dispatched

  const pendingRequests = roastRequests.filter((r) => r.status === 'pending');
  const inMachineRequests = roastRequests.filter((r) => r.status === 'in_progress');
  const restingBatches = roastedBeans.filter((b) => getRestingBadge(b.roastDate).days <= 5);
  const readyBatches = roastedBeans.filter((b) => getRestingBadge(b.roastDate).days > 5);

  return (
    <div className="space-y-4">
      {/* Pipeline Subheader matching video: Title, Counts, and Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#f5ece5]">Roastery Workflow Pipeline</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#2a201a] border border-[#423329] text-[#e07a48]">
              {pendingRequests.length + inMachineRequests.length + roastedBeans.length} Active Items
            </span>
          </div>
          <p className="text-xs text-[#a69588] mt-0.5">
            Stage progression from café replenishment request to roaster drop, degassing racks, and dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="inline-flex items-center bg-[#1f1713] border border-[#382b23] rounded-full p-1 text-xs">
            {['all', 'Espresso', 'Filter', 'Omni'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterProfile(type)}
                className={`px-3 py-1 rounded-full capitalize font-medium transition-colors cursor-pointer ${
                  filterProfile === type
                    ? 'bg-[#3d2e24] text-[#f5ece5] shadow-sm'
                    : 'text-[#8f7e72] hover:text-[#f5ece5]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenNewRoastModal}
            className="btn-crema flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log Batch</span>
          </button>
        </div>
      </div>

      {/* 4 Pipeline Columns matching the video aesthetic */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {/* Column 1: Roast Queue (Pending) */}
        <div className="flex flex-col bg-[#1c1512]/90 border border-[#362a22] rounded-2xl p-3 min-h-[460px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#2d221c] mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              <span className="text-xs font-bold text-[#f5ece5] uppercase tracking-wider font-mono">
                1. Queue Request
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#a69588] bg-[#271d18] px-2 py-0.5 rounded-md border border-[#3b2e25]">
              {pendingRequests.length}
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="glass-card rounded-xl p-3 space-y-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#e07a48] font-bold">REQ #{req.id.slice(-4)}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded ${
                      req.priority === 'urgent'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                        : req.priority === 'high'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        : 'bg-[#291f1a] text-[#a69588]'
                    }`}
                  >
                    {req.priority}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#f5ece5] leading-snug">
                  {req.greenBeanName}
                </h4>

                <div className="flex items-center justify-between text-xs text-[#a69588]">
                  <span>Target:</span>
                  <span className="font-mono font-bold text-[#f5ece5]">{req.targetRoastedKg} kg</span>
                </div>

                <div className="text-[11px] text-[#8c7b6f] truncate">
                  For: {req.destinationOutlet}
                </div>

                <div className="pt-2 border-t border-[#31251e] flex items-center justify-between gap-1">
                  <span className="text-[10px] text-[#8c7b6f] font-mono">{req.roastProfile}</span>
                  <button
                    onClick={() => onOpenRoastModalWithRequest(req)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-[#e07a48] hover:bg-[#d16c3b] rounded-lg shadow-sm"
                  >
                    <Flame className="w-3 h-3" />
                    <span>Roast Now</span>
                  </button>
                </div>
              </div>
            ))}

            {pendingRequests.length === 0 && (
              <div className="h-32 flex items-center justify-center text-center text-xs text-[#6e5e53]">
                No pending requests
              </div>
            )}
          </div>
        </div>

        {/* Column 2: In Roaster Machine */}
        <div className="flex flex-col bg-[#1c1512]/90 border border-[#362a22] rounded-2xl p-3 min-h-[460px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#2d221c] mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>
              <span className="text-xs font-bold text-[#f5ece5] uppercase tracking-wider font-mono">
                2. In Drum Roaster
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#a69588] bg-[#271d18] px-2 py-0.5 rounded-md border border-[#3b2e25]">
              {inMachineRequests.length}
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {inMachineRequests.map((req) => (
              <div
                key={req.id}
                className="glass-card rounded-xl p-3 space-y-2 border-sky-500/30 bg-[#1f2227]/70"
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-sky-300 font-bold">Giesen W6A Artisan</span>
                  <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                    Roasting
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#f5ece5] leading-snug">
                  {req.greenBeanName}
                </h4>

                <div className="flex items-center justify-between text-xs text-[#a69588]">
                  <span>Charge Input:</span>
                  <span className="font-mono text-sky-200 font-bold">~{req.targetRoastedKg * 1.18} kg</span>
                </div>

                <div className="pt-2 border-t border-[#31251e] flex items-center justify-between">
                  <span className="text-[10px] text-sky-400 font-mono">Drop at ~204°C</span>
                  <button
                    onClick={() => onOpenRoastModalWithRequest(req)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm"
                  >
                    <span>Record Drop</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {inMachineRequests.length === 0 && (
              <div className="h-32 flex items-center justify-center text-center text-xs text-[#6e5e53]">
                Roaster idle. Ready for charge.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Resting & Degassing (Days 1–5) */}
        <div className="flex flex-col bg-[#1c1512]/90 border border-[#362a22] rounded-2xl p-3 min-h-[460px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#2d221c] mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              <span className="text-xs font-bold text-[#f5ece5] uppercase tracking-wider font-mono">
                3. Resting (Degas)
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#a69588] bg-[#271d18] px-2 py-0.5 rounded-md border border-[#3b2e25]">
              {restingBatches.length}
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {restingBatches.map((batch) => {
              const badge = getRestingBadge(batch.roastDate);
              return (
                <div
                  key={batch.id}
                  className="glass-card rounded-xl p-3 space-y-2 border-amber-600/30 bg-[#251c16]/90"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-amber-400 font-bold">{batch.batchNumber}</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 font-semibold">
                      {badge.statusText}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#f5ece5] leading-snug">
                    {batch.beanName}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-[#a69588]">
                    <span>Stock Yield:</span>
                    <span className="font-mono font-bold text-[#f5ece5]">{batch.stockKg.toFixed(2)} kg</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#8c7b6f] font-mono">
                    <span>Loss: {batch.weightLossPercentage}%</span>
                    <span>Roast: {batch.roastDate}</span>
                  </div>

                  <div className="pt-2 border-t border-[#31251e] flex items-center justify-between">
                    <span className="text-[10px] text-[#8c7b6f]">{batch.roastLevel}</span>
                    <button
                      onClick={() => onOpenQRLabel(batch)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#f5ece5] bg-[#2d221c] hover:bg-[#382b24] border border-[#44342a] rounded-lg"
                    >
                      <QrCode className="w-3 h-3 text-[#e07a48]" />
                      <span>Sticker</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {restingBatches.length === 0 && (
              <div className="h-32 flex items-center justify-center text-center text-xs text-[#6e5e53]">
                No degassing batches in resting rack
              </div>
            )}
          </div>
        </div>

        {/* Column 4: Ready for Bar & Packaging (Day 6+) */}
        <div className="flex flex-col bg-[#1c1512]/90 border border-[#362a22] rounded-2xl p-3 min-h-[460px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#2d221c] mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="text-xs font-bold text-[#f5ece5] uppercase tracking-wider font-mono">
                4. Ready (Peak Flavor)
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#a69588] bg-[#271d18] px-2 py-0.5 rounded-md border border-[#3b2e25]">
              {readyBatches.length}
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {readyBatches.map((batch) => {
              const badge = getRestingBadge(batch.roastDate);
              return (
                <div
                  key={batch.id}
                  className="glass-card rounded-xl p-3 space-y-2 border-emerald-600/30 bg-[#1c221a]/60"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-emerald-400 font-bold">{batch.batchNumber}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-semibold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                      {badge.statusText}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#f5ece5] leading-snug">
                    {batch.beanName}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-[#a69588]">
                    <span>Available:</span>
                    <span className="font-mono font-bold text-emerald-300">{batch.stockKg.toFixed(2)} kg</span>
                  </div>

                  <div className="text-[11px] text-[#8c7b6f] truncate">
                    Notes: {(batch.flavorNotes || []).slice(0, 2).join(', ')}
                  </div>

                  <div className="pt-2 border-t border-[#31251e] flex items-center justify-between">
                    <button
                      onClick={() => onOpenQRLabel(batch)}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] text-[#a69588] hover:text-[#f5ece5] bg-[#251d18] rounded-lg border border-[#3b2e25]"
                    >
                      <QrCode className="w-3 h-3 text-[#e07a48]" />
                      <span>Label</span>
                    </button>

                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                      Ready for Bar
                    </span>
                  </div>
                </div>
              );
            })}

            {readyBatches.length === 0 && (
              <div className="h-32 flex items-center justify-center text-center text-xs text-[#6e5e53]">
                All batches currently resting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
