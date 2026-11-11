import React, { useState, useEffect } from 'react';
import { GreenBean, RoastedBean, UserProfile } from '../types';
import { getRestingBadge } from '../services/db';
import { Flame, X, Calculator, Sparkles, Check, AlertCircle } from 'lucide-react';

interface RoastBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  greenBeans: GreenBean[];
  initialGreenBeanId?: string;
  initialTargetKg?: number;
  currentUser: UserProfile;
  onSubmit: (batchData: {
    greenBeanId: string;
    beanName: string;
    roastDate: string;
    roastLevel: RoastedBean['roastLevel'];
    greenWeightKg: number;
    roastedWeightKg: number;
    roasterMachine: string;
    roasterName: string;
    flavorNotes: string[];
    notes?: string;
  }) => void;
}

export const RoastBatchModal: React.FC<RoastBatchModalProps> = ({
  isOpen,
  onClose,
  greenBeans,
  initialGreenBeanId,
  initialTargetKg,
  currentUser,
  onSubmit,
}) => {
  const [selectedBeanId, setSelectedBeanId] = useState<string>(
    initialGreenBeanId || (greenBeans[0]?.id ?? '')
  );
  const [roastDate, setRoastDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [roastLevel, setRoastLevel] = useState<RoastedBean['roastLevel']>('Medium-Light');
  const [roasterMachine, setRoasterMachine] = useState<string>('Giesen W6A Artisan');
  const [greenWeightKg, setGreenWeightKg] = useState<number>(initialTargetKg ? Math.round(initialTargetKg * 1.18) : 12.0);
  const [roastedWeightKg, setRoastedWeightKg] = useState<number>(initialTargetKg || 10.15);
  const [flavorNotesInput, setFlavorNotesInput] = useState<string>('Jasmine Floral, Peach, Brown Sugar');
  const [notes, setNotes] = useState<string>('Clean profile, first crack 09:15 @ 195°C.');

  useEffect(() => {
    if (initialGreenBeanId) {
      setSelectedBeanId(initialGreenBeanId);
    }
    if (initialTargetKg) {
      setRoastedWeightKg(initialTargetKg);
      setGreenWeightKg(Number((initialTargetKg / 0.845).toFixed(2)));
    }
  }, [initialGreenBeanId, initialTargetKg]);

  if (!isOpen) return null;

  const selectedBean = greenBeans.find((b) => b.id === selectedBeanId);

  const weightLossPct =
    greenWeightKg > 0 && roastedWeightKg > 0
      ? Number((((greenWeightKg - roastedWeightKg) / greenWeightKg) * 100).toFixed(2))
      : 0;

  const restingInfo = getRestingBadge(roastDate);
  const isGreenWeightValid = greenWeightKg > 0 && (selectedBean ? selectedBean.stockKg >= greenWeightKg : true);
  const isYieldValid = roastedWeightKg > 0 && roastedWeightKg < greenWeightKg;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBean || !isGreenWeightValid || !isYieldValid) return;

    const notesArray = flavorNotesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSubmit({
      greenBeanId: selectedBean.id,
      beanName: selectedBean.name,
      roastDate,
      roastLevel,
      greenWeightKg: Number(greenWeightKg),
      roastedWeightKg: Number(roastedWeightKg),
      roasterMachine,
      roasterName: currentUser.name,
      flavorNotes: notesArray.length > 0 ? notesArray : ['Artisan Specialty Profile'],
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0e0b09]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-[#1c1511] border border-[#3d2e24] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-[#16110e] border-b border-[#31251e] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#e07a48]/20 border border-[#e07a48]/40 flex items-center justify-center text-[#e07a48]">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f5ece5]">Log Roast Batch</h3>
              <p className="text-xs text-[#8c7b6f]">
                Record green coffee intake, roast loss %, and generate batch QR label
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8c7b6f] hover:text-[#f5ece5] p-1.5 rounded-full hover:bg-[#271e18] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Select Green Bean Lot */}
          <div>
            <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
              Select Green Bean Lot from Warehouse
            </label>
            <select
              value={selectedBeanId}
              onChange={(e) => setSelectedBeanId(e.target.value)}
              className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5] focus:outline-none focus:border-[#e07a48]"
            >
              {greenBeans.map((bean) => (
                <option key={bean.id} value={bean.id}>
                  {bean.name} ({bean.lotNumber}) — Available: {bean.stockKg.toFixed(1)} kg
                </option>
              ))}
            </select>
            {selectedBean && (
              <div className="mt-1 flex items-center justify-between text-[11px] text-[#8c7b6f]">
                <span>Origin: {selectedBean.origin} ({selectedBean.process})</span>
                <span className="font-mono">Current Stock: {selectedBean.stockKg.toFixed(1)} kg</span>
              </div>
            )}
          </div>

          {/* Machine & Roast Level Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
                Roast Machine
              </label>
              <select
                value={roasterMachine}
                onChange={(e) => setRoasterMachine(e.target.value)}
                className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5] focus:outline-none focus:border-[#e07a48]"
              >
                <option value="Giesen W6A Artisan">Giesen W6A Artisan (Drum Roaster)</option>
                <option value="Probat Probatone 12">Probat Probatone 12 (Batch Master)</option>
                <option value="Aillio Bullet R1 V2">Aillio Bullet R1 V2 (Sample Roaster)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
                Roast Level / Profile
              </label>
              <select
                value={roastLevel}
                onChange={(e) => setRoastLevel(e.target.value as RoastedBean['roastLevel'])}
                className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5] focus:outline-none focus:border-[#e07a48]"
              >
                <option value="Light">Light (Nordic Filter)</option>
                <option value="Medium-Light">Medium-Light (Filter / Omni)</option>
                <option value="Medium">Medium (Modern Espresso)</option>
                <option value="Medium-Dark">Medium-Dark (Classic Milk-Based)</option>
                <option value="Omni">Omni Roast</option>
                <option value="Espresso">Espresso Profile</option>
              </select>
            </div>
          </div>

          {/* Green Weight vs Roasted Weight calculation card */}
          <div className="bg-[#17120e] border border-[#33261e] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#f5ece5] flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-[#e07a48]" />
                Weight Loss & Yield Calculation
              </span>
              <span className="text-[10px] text-[#8c7b6f]">
                Formula: ((Green - Roasted) / Green) × 100
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#8c7b6f] mb-1">
                  Green Bean Input (kg)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  value={greenWeightKg}
                  onChange={(e) => setGreenWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#201813] border border-[#3d2e24] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#f5ece5] focus:outline-none focus:border-[#e07a48]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#8c7b6f] mb-1">
                  Roasted Result (kg)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  value={roastedWeightKg}
                  onChange={(e) => setRoastedWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#201813] border border-[#3d2e24] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#e07a48] focus:outline-none focus:border-[#e07a48]"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#2e221b] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#8c7b6f] block">Calculated Weight Loss:</span>
                <span
                  className={`font-mono text-base font-bold tabular-nums ${
                    weightLossPct >= 13 && weightLossPct <= 18
                      ? 'text-emerald-400'
                      : 'text-[#e07a48]'
                  }`}
                >
                  {weightLossPct}%
                </span>
                <span className="text-[10px] text-[#736357] ml-1">
                  {weightLossPct >= 13 && weightLossPct <= 18 ? '(Standard Spec)' : '(Check moisture/profile)'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-[#8c7b6f] block">Resting Days Status:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${
                    restingInfo.days <= 5
                      ? 'text-amber-300 border-amber-700/60 bg-amber-950/40'
                      : 'text-emerald-300 border-emerald-700/60 bg-emerald-950/40'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  {restingInfo.statusText}
                </span>
              </div>
            </div>
          </div>

          {/* Roast Date */}
          <div>
            <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
              Roast Date
            </label>
            <input
              type="date"
              value={roastDate}
              onChange={(e) => setRoastDate(e.target.value)}
              className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5] focus:outline-none focus:border-[#e07a48] font-mono"
            />
          </div>

          {/* Flavor Notes */}
          <div>
            <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
              Flavor Notes (comma-separated)
            </label>
            <input
              type="text"
              value={flavorNotesInput}
              onChange={(e) => setFlavorNotesInput(e.target.value)}
              placeholder="e.g. Jasmine Floral, Bergamot, Honey, Peach"
              className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5] focus:outline-none focus:border-[#e07a48]"
            />
          </div>

          {/* Roasting Notes */}
          <div>
            <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
              Roaster Artisan Notes / Roast Curve Comments
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Charge temperature, first crack time, drop temperature, DTR %..."
              className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5] focus:outline-none focus:border-[#e07a48] resize-none"
            />
          </div>

          {selectedBean && selectedBean.stockKg < greenWeightKg && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>
                Green bean shortage: You requested {greenWeightKg}kg, but only {selectedBean.stockKg.toFixed(1)}kg is available.
              </span>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-3 border-t border-[#31251e] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#8c7b6f] hover:text-[#f5ece5] hover:bg-[#251d18] rounded-full transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isGreenWeightValid || !isYieldValid}
              className="btn-crema flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-full transition-colors shadow-sm cursor-pointer disabled:opacity-40"
            >
              <Check className="w-4 h-4" />
              <span>Save Batch & Print QR Label</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
