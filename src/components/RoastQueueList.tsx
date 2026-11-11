import React, { useState } from 'react';
import { RoastRequest, RoastRequestStatus, UserProfile } from '../types';
import { Flame, Clock, CheckCircle2, Play, Plus } from 'lucide-react';

interface RoastQueueListProps {
  requests: RoastRequest[];
  currentUser: UserProfile;
  onUpdateStatus: (id: string, status: RoastRequestStatus) => void;
  onFulfillWithBatch: (request: RoastRequest) => void;
  onCreateNewRequest: () => void;
}

export const RoastQueueList: React.FC<RoastQueueListProps> = ({
  requests,
  currentUser,
  onUpdateStatus,
  onFulfillWithBatch,
  onCreateNewRequest,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  const filtered = requests.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const priorityBadge = (priority: RoastRequest['priority']) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60 font-bold uppercase">
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60 font-medium uppercase">
            High
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#271e18] text-[#8c7b6f] border border-[#3b2d23] uppercase">
            Normal
          </span>
        );
    }
  };

  const statusBadge = (status: RoastRequestStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-medium">
            <Clock className="w-3 h-3" />
            Pending Queue
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 text-[11px] text-sky-300 bg-sky-500/10 border border-sky-500/30 px-2.5 py-0.5 rounded-full font-medium">
            <Play className="w-3 h-3" />
            In Roaster
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[11px] text-[#8c7b6f] bg-[#251d18] px-2 py-0.5 rounded-full">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#f5ece5] flex items-center gap-2">
            Roast Request Queue
            <span className="text-xs font-mono font-normal text-[#8c7b6f]">
              ({requests.filter((r) => r.status !== 'completed').length} active requests)
            </span>
          </h2>
          <p className="text-xs text-[#a69588]">
            Internal café replenishment & wholesale client orders waiting for roasting schedule.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Tabs pill */}
          <div className="inline-flex items-center bg-[#1f1713] border border-[#382b22] rounded-full p-1">
            {(['all', 'pending', 'in_progress', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                  filter === tab
                    ? 'bg-[#3b2e25] text-[#f5ece5] font-semibold shadow-sm'
                    : 'text-[#8c7b6f] hover:text-[#f5ece5]'
                }`}
              >
                {tab === 'all'
                  ? 'All'
                  : tab === 'pending'
                  ? 'Pending'
                  : tab === 'in_progress'
                  ? 'Roasting'
                  : 'Done'}
              </button>
            ))}
          </div>

          <button
            onClick={onCreateNewRequest}
            className="btn-crema flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Roast Request</span>
          </button>
        </div>
      </div>

      {/* Queue Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((req) => (
          <div
            key={req.id}
            className="glass-card rounded-2xl p-4 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {statusBadge(req.status)}
                  {priorityBadge(req.priority)}
                </div>
                <span className="font-mono text-[11px] text-[#8c7b6f]">
                  {req.requestedAt}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#f5ece5]">
                {req.greenBeanName}
              </h3>

              <div className="mt-2 space-y-1 text-xs text-[#d9cdc3]">
                <div className="flex items-center justify-between py-0.5 border-b border-[#2d221c]">
                  <span className="text-[#8c7b6f]">Target Roasted Weight:</span>
                  <span className="font-mono font-bold text-[#e07a48] text-sm">
                    {req.targetRoastedKg} kg
                  </span>
                </div>
                <div className="flex items-center justify-between py-0.5 border-b border-[#2d221c]">
                  <span className="text-[#8c7b6f]">Desired Roast Profile:</span>
                  <span className="font-medium text-[#f5ece5]">{req.roastProfile}</span>
                </div>
                <div className="flex items-center justify-between py-0.5 border-b border-[#2d221c]">
                  <span className="text-[#8c7b6f]">Destination:</span>
                  <span className="text-[#e8ded6] font-medium">{req.destinationOutlet}</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#8c7b6f]">Requested By:</span>
                  <span className="text-[#c4b5a9]">{req.requestedBy}</span>
                </div>
              </div>

              {req.notes && (
                <div className="mt-2.5 p-2 bg-[#1b1410] border border-[#33261e] rounded-xl text-[11px] text-[#a69588] italic">
                  "{req.notes}"
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="mt-4 pt-3 border-t border-[#31251e] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {req.status === 'pending' && (
                  <button
                    onClick={() => onUpdateStatus(req.id, 'in_progress')}
                    className="px-3 py-1 text-xs bg-[#271e18] hover:bg-[#332720] text-[#f5ece5] border border-[#3d2e24] rounded-lg transition-colors cursor-pointer"
                  >
                    Set Roasting
                  </button>
                )}
                {req.status === 'in_progress' && (
                  <button
                    onClick={() => onUpdateStatus(req.id, 'completed')}
                    className="px-3 py-1 text-xs bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 rounded-lg transition-colors cursor-pointer"
                  >
                    Mark Done
                  </button>
                )}
              </div>

              {/* Fulfill via Roast Batch Modal */}
              {req.status !== 'completed' && (
                <button
                  onClick={() => onFulfillWithBatch(req)}
                  className="btn-crema flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Log Roast Batch</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center text-[#8c7b6f] text-xs glass-panel rounded-2xl">
          No roast requests in this queue view. Click "Create Roast Request" to add one.
        </div>
      )}
    </div>
  );
};
