import React, { useState } from 'react';
import { GreenBean, RoastedBean, PackagingItem, UserProfile } from '../types';
import { ArrowDownToLine, ArrowUpFromLine, X, Check } from 'lucide-react';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  greenBeans: GreenBean[];
  roastedBeans: RoastedBean[];
  packaging: PackagingItem[];
  preselected?: {
    category: 'green_bean' | 'roasted_bean' | 'packaging';
    id: string;
    isStockIn: boolean;
  };
  onSubmit: (data: {
    category: 'green_bean' | 'roasted_bean' | 'packaging';
    itemId: string;
    deltaQuantity: number;
    reason: string;
  }) => void;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  greenBeans,
  roastedBeans,
  packaging,
  preselected,
  onSubmit,
}) => {
  const [movementType, setMovementType] = useState<'in' | 'out'>(
    preselected?.isStockIn ? 'in' : 'out'
  );
  const [category, setCategory] = useState<'green_bean' | 'roasted_bean' | 'packaging'>(
    preselected?.category || 'roasted_bean'
  );
  const [selectedItemId, setSelectedItemId] = useState<string>(
    preselected?.id ||
      (category === 'green_bean'
        ? greenBeans[0]?.id
        : category === 'roasted_bean'
        ? roastedBeans[0]?.id
        : packaging[0]?.id) ||
      ''
  );
  const [quantity, setQuantity] = useState<number>(5.0);
  const [reason, setReason] = useState<string>('Dispatched to outlet cafe bar');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || quantity <= 0) return;

    const deltaQuantity = movementType === 'in' ? Math.abs(quantity) : -Math.abs(quantity);
    onSubmit({
      category,
      itemId: selectedItemId,
      deltaQuantity,
      reason,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0e0b09]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-[#1c1511] border border-[#3d2e24] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-6">
        <div className="bg-[#16110e] px-6 py-4 border-b border-[#31251e] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#f5ece5] flex items-center gap-2">
              {movementType === 'in' ? (
                <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
              ) : (
                <ArrowUpFromLine className="w-4 h-4 text-sky-400" />
              )}
              Log Inventory Movement
            </h3>
            <p className="text-xs text-[#8c7b6f]">
              Record stock intake or dispatch with automatic audit logging
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#8c7b6f] hover:text-[#f5ece5] p-1.5 rounded-full hover:bg-[#271e18] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#14100e] border border-[#31251e] rounded-full">
            <button
              type="button"
              onClick={() => setMovementType('in')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                movementType === 'in'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-[#8c7b6f] hover:text-[#f5ece5]'
              }`}
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>Stock In (Intake)</span>
            </button>

            <button
              type="button"
              onClick={() => setMovementType('out')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                movementType === 'out'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-[#8c7b6f] hover:text-[#f5ece5]'
              }`}
            >
              <ArrowUpFromLine className="w-3.5 h-3.5" />
              <span>Stock Out (Dispatch)</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
              Item Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'roasted_bean', label: 'Roasted' },
                { id: 'green_bean', label: 'Green' },
                { id: 'packaging', label: 'Packaging' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    const cat = c.id as any;
                    setCategory(cat);
                    if (cat === 'green_bean') setSelectedItemId(greenBeans[0]?.id || '');
                    if (cat === 'roasted_bean') setSelectedItemId(roastedBeans[0]?.id || '');
                    if (cat === 'packaging') setSelectedItemId(packaging[0]?.id || '');
                  }}
                  className={`py-2 text-xs font-medium rounded-xl border text-center transition-colors cursor-pointer ${
                    category === c.id
                      ? 'bg-[#31251e] text-[#f5ece5] border-[#524133] font-bold'
                      : 'bg-[#16110e] text-[#8c7b6f] border-[#2e231b] hover:text-[#f5ece5]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
              Select Specific Item
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5] focus:outline-none focus:border-[#e07a48]"
            >
              {category === 'green_bean' &&
                greenBeans.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.lotNumber}) — Stock: {b.stockKg.toFixed(1)} kg
                  </option>
                ))}
              {category === 'roasted_bean' &&
                roastedBeans.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchNumber}: {b.beanName} ({b.roastLevel}) — Stock: {b.stockKg.toFixed(2)} kg
                  </option>
                ))}
              {category === 'packaging' &&
                packaging.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) — Stock: {p.currentStock} {p.unit}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
              Quantity to {movementType === 'in' ? 'Add' : 'Deduct'} (
              {category === 'packaging' ? 'units' : 'kg'})
            </label>
            <input
              type="number"
              step={category === 'packaging' ? '1' : '0.1'}
              min="0.1"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-base font-mono font-bold text-[#f5ece5] focus:outline-none focus:border-[#e07a48]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
              Operational Reason / Purpose
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5] focus:outline-none focus:border-[#e07a48] mb-2"
            >
              <option value="Dispatched to BDS Bintaro Outlet">Dispatched to BDS Bintaro Outlet</option>
              <option value="Dispatched to BDS Kemang Store">Dispatched to BDS Kemang Store</option>
              <option value="Wholesale B2B Client Fulfillment">Wholesale B2B Client Fulfillment</option>
              <option value="New Supplier Delivery Received">New Supplier Delivery Received</option>
              <option value="Packaging in 250g Retail Bags">Packaging in 250g Retail Bags</option>
              <option value="Cupping Lab & Sensory QC Sample">Cupping Lab & Sensory QC Sample</option>
              <option value="Spillage, Roaster Defect or Waste">Spillage, Roaster Defect or Waste</option>
              <option value="Physical Stocktake Audit Adjustment">Physical Stocktake Audit Adjustment</option>
            </select>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Or write custom reason..."
              className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-1.5 text-xs text-[#f5ece5] focus:outline-none focus:border-[#e07a48]"
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
              className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white rounded-full transition-colors shadow-sm cursor-pointer ${
                movementType === 'in'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-sky-600 hover:bg-sky-500'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Record {movementType === 'in' ? 'Intake' : 'Dispatch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
