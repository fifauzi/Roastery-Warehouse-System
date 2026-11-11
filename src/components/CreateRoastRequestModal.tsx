import React, { useState } from 'react';
import { GreenBean, PriorityLevel, UserProfile } from '../types';
import { Flame, X, Plus } from 'lucide-react';

interface CreateRoastRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  greenBeans: GreenBean[];
  preselectedBeanId?: string;
  currentUser: UserProfile;
  onSubmit: (data: {
    greenBeanId: string;
    greenBeanName: string;
    targetRoastedKg: number;
    roastProfile: string;
    priority: PriorityLevel;
    destinationOutlet: string;
    notes?: string;
  }) => void;
}

export const CreateRoastRequestModal: React.FC<CreateRoastRequestModalProps> = ({
  isOpen,
  onClose,
  greenBeans,
  preselectedBeanId,
  currentUser,
  onSubmit,
}) => {
  const [selectedBeanId, setSelectedBeanId] = useState<string>(
    preselectedBeanId || (greenBeans[0]?.id ?? '')
  );
  const [targetRoastedKg, setTargetRoastedKg] = useState<number>(15);
  const [roastProfile, setRoastProfile] = useState<string>('Espresso (Medium-Dark)');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [destinationOutlet, setDestinationOutlet] = useState<string>(
    'BDS Coffee Outlet Bintaro Hub'
  );
  const [notes, setNotes] = useState<string>('Needed for upcoming weekend espresso bar rush.');

  if (!isOpen) return null;

  const selectedBean = greenBeans.find((b) => b.id === selectedBeanId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBean || targetRoastedKg <= 0) return;

    onSubmit({
      greenBeanId: selectedBean.id,
      greenBeanName: selectedBean.name,
      targetRoastedKg,
      roastProfile,
      priority,
      destinationOutlet,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0e0b09]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-[#1c1511] border border-[#3d2e24] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-6">
        <div className="bg-[#16110e] px-6 py-4 border-b border-[#31251e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#e07a48]/20 border border-[#e07a48]/40 flex items-center justify-center text-[#e07a48]">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f5ece5]">Create Roast Request</h3>
              <p className="text-xs text-[#8c7b6f]">Dispatch request to Head Roaster Queue</p>
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
          <div>
            <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
              Select Green Bean Lot
            </label>
            <select
              value={selectedBeanId}
              onChange={(e) => setSelectedBeanId(e.target.value)}
              className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5] focus:outline-none focus:border-[#e07a48]"
            >
              {greenBeans.map((bean) => (
                <option key={bean.id} value={bean.id}>
                  {bean.name} ({bean.lotNumber}) — In Stock: {bean.stockKg.toFixed(1)} kg
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
                Target Roasted (kg)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={targetRoastedKg}
                onChange={(e) => setTargetRoastedKg(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#e07a48] focus:outline-none focus:border-[#e07a48]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5] focus:outline-none focus:border-[#e07a48] font-semibold"
              >
                <option value="normal">Standard Normal</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Rush</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
              Desired Roast Profile
            </label>
            <select
              value={roastProfile}
              onChange={(e) => setRoastProfile(e.target.value)}
              className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5] focus:outline-none focus:border-[#e07a48]"
            >
              <option value="Light Filter (Nordic)">Light Filter (Nordic V60)</option>
              <option value="Medium-Light Omni">Medium-Light Omni (Filter & Aeropress)</option>
              <option value="Medium (Modern Espresso)">Medium (Modern Espresso)</option>
              <option value="Espresso (Medium-Dark)">Espresso (Medium-Dark Milk Based)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
              Destination Café Outlet / Client
            </label>
            <select
              value={destinationOutlet}
              onChange={(e) => setDestinationOutlet(e.target.value)}
              className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5] focus:outline-none focus:border-[#e07a48]"
            >
              <option value="BDS Coffee Outlet Bintaro Hub">BDS Coffee Outlet Bintaro Hub</option>
              <option value="BDS Coffee Kemang Flagship">BDS Coffee Kemang Flagship</option>
              <option value="BDS Coffee Senopati Micro-bar">BDS Coffee Senopati Micro-bar</option>
              <option value="Wholesale Client: Senopati Roastery Cafe">Wholesale Client: Senopati Roastery Cafe</option>
              <option value="B2B Supply: Hotel Mulia Barista Lounge">B2B Supply: Hotel Mulia Barista Lounge</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
              Order Notes / Delivery Target
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5] focus:outline-none focus:border-[#e07a48] resize-none"
            />
          </div>

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
              className="btn-crema flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-full transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Submit to Roaster Queue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
