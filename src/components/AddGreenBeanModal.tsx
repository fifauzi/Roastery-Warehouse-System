import React, { useState } from 'react';
import { GreenBean } from '../types';
import { Wheat, X, Plus } from 'lucide-react';

interface AddGreenBeanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bean: Omit<GreenBean, 'id' | 'qrPayload'>) => void;
}

export const AddGreenBeanModal: React.FC<AddGreenBeanModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState<string>('Panama Geisha Boquete');
  const [lotNumber, setLotNumber] = useState<string>('LOT-PAN-2024-02');
  const [origin, setOrigin] = useState<string>('Panama');
  const [region, setRegion] = useState<string>('Boquete Valley');
  const [process, setProcess] = useState<GreenBean['process']>('Washed');
  const [variety, setVariety] = useState<string>('Geisha');
  const [altitude, setAltitude] = useState<string>('1,700 - 1,900 MASL');
  const [stockKg, setStockKg] = useState<number>(30);
  const [minThresholdKg, setMinThresholdKg] = useState<number>(10);
  const [costPerKg, setCostPerKg] = useState<number>(450000);
  const [supplier, setSupplier] = useState<string>('Hacienda La Esmeralda Direct');
  const [moistureContent, setMoistureContent] = useState<number>(10.4);
  const [bagCount, setBagCount] = useState<number>(1);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || stockKg <= 0) return;

    onSubmit({
      name,
      lotNumber,
      origin,
      region,
      process,
      variety,
      altitude,
      stockKg,
      minThresholdKg,
      costPerKg,
      arrivalDate: new Date().toISOString().split('T')[0],
      supplier,
      moistureContent,
      bagCount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0e0b09]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-[#1c1511] border border-[#3d2e24] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-6">
        <div className="bg-[#16110e] px-6 py-4 border-b border-[#31251e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#e07a48]/20 border border-[#e07a48]/40 flex items-center justify-center text-[#e07a48]">
              <Wheat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f5ece5]">Add Inbound Green Coffee Lot</h3>
              <p className="text-xs text-[#8c7b6f]">Register new harvest arrival into warehouse silos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8c7b6f] hover:text-[#f5ece5] p-1.5 rounded-full hover:bg-[#271e18] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#c4b5a9] font-medium mb-1">Lot Number / Code</label>
              <input
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-[#f5ece5] font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-[#c4b5a9] font-medium mb-1">Coffee Title / Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-[#f5ece5]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#c4b5a9] font-medium mb-1">Origin Country</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-[#f5ece5]"
              />
            </div>
            <div>
              <label className="block text-[#c4b5a9] font-medium mb-1">Region / Farm</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-[#f5ece5]"
              />
            </div>
            <div>
              <label className="block text-[#c4b5a9] font-medium mb-1">Process</label>
              <select
                value={process}
                onChange={(e) => setProcess(e.target.value as GreenBean['process'])}
                className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-[#f5ece5]"
              >
                <option value="Washed">Washed</option>
                <option value="Natural">Natural</option>
                <option value="Honey">Honey</option>
                <option value="Anaerobic">Anaerobic</option>
                <option value="Wet-Hulled">Wet-Hulled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#c4b5a9] font-medium mb-1">Quantity (kg)</label>
              <input
                type="number"
                step="0.5"
                value={stockKg}
                onChange={(e) => setStockKg(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 font-mono font-bold text-[#e07a48]"
                required
              />
            </div>
            <div>
              <label className="block text-[#c4b5a9] font-medium mb-1">Min Threshold (kg)</label>
              <input
                type="number"
                value={minThresholdKg}
                onChange={(e) => setMinThresholdKg(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 font-mono text-[#f5ece5]"
              />
            </div>
            <div>
              <label className="block text-[#c4b5a9] font-medium mb-1">Moisture %</label>
              <input
                type="number"
                step="0.1"
                value={moistureContent}
                onChange={(e) => setMoistureContent(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 font-mono text-[#f5ece5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#c4b5a9] font-medium mb-1">Cost Per Kg (IDR)</label>
              <input
                type="number"
                value={costPerKg}
                onChange={(e) => setCostPerKg(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 font-mono text-[#f5ece5]"
              />
            </div>
            <div>
              <label className="block text-[#c4b5a9] font-medium mb-1">Supplier / Exporter</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-[#f5ece5]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#31251e] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#8c7b6f] hover:text-[#f5ece5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-crema flex items-center gap-1.5 px-5 py-2 font-bold rounded-full shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Save & Register Lot</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
