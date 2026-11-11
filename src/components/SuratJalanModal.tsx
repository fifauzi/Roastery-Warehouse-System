import React, { useState } from 'react';
import { SuratJalan, SuratJalanItem, RoastedBean, PackagingItem, UserProfile } from '../types';
import { Truck, Printer, X, Plus } from 'lucide-react';

interface SuratJalanModalProps {
  isOpen: boolean;
  onClose: () => void;
  suratJalans: SuratJalan[];
  roastedBeans: RoastedBean[];
  packaging: PackagingItem[];
  currentUser: UserProfile;
  onCreateNew: (data: Omit<SuratJalan, 'id' | 'number'>) => void;
}

export const SuratJalanModal: React.FC<SuratJalanModalProps> = ({
  isOpen,
  onClose,
  suratJalans,
  roastedBeans,
  packaging,
  currentUser,
  onCreateNew,
}) => {
  const [selectedSJ, setSelectedSJ] = useState<SuratJalan | null>(
    suratJalans[0] || null
  );
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const [destination, setDestination] = useState<string>(
    'BDS Coffee Outlet Kemang Flagship, Jl. Kemang Timur No. 42'
  );
  const [driverName, setDriverName] = useState<string>('Dedi Supratman (BDS Logistics)');
  const [vehiclePlate, setVehiclePlate] = useState<string>('B 9241 BDS (Van)');
  const [items, setItems] = useState<SuratJalanItem[]>([
    {
      itemName: 'Roasted Coffee - Ethiopia Yirgacheffe Washed',
      batchNumber: 'BDS-RB-101',
      quantity: 5,
      unit: 'kg',
      notes: 'Light roast for manual brew bar',
    },
    {
      itemName: '250g Matte Black Gusset Bags (w/ Valve)',
      batchNumber: 'SKU: BAG-250-BLK',
      quantity: 200,
      unit: 'pcs',
      notes: 'Retail packaging',
    },
  ]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleAddItemRow = () => {
    setItems([
      ...items,
      {
        itemName: 'Roasted Coffee - Colombia Supremo Huila',
        batchNumber: 'BDS-RB-100',
        quantity: 10,
        unit: 'kg',
        notes: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const today = new Date().toISOString().split('T')[0];
    onCreateNew({
      date: today,
      destination,
      driverName,
      vehiclePlate,
      items,
      createdByName: currentUser.name,
      status: 'Dispatched',
    });
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0e0b09]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1c1511] border border-[#3d2e24] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 no-print">
        {/* Header */}
        <div className="bg-[#16110e] px-6 py-4 border-b border-[#31251e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#e07a48]/20 border border-[#e07a48]/40 flex items-center justify-center text-[#e07a48]">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f5ece5]">
                Surat Jalan (Delivery Order) Dispatch
              </h3>
              <p className="text-xs text-[#8c7b6f]">
                Official delivery note & manifest for café outlets and wholesale partners
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

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#a69588]">Select Document:</span>
              <select
                value={selectedSJ?.id}
                onChange={(e) => {
                  const found = suratJalans.find((s) => s.id === e.target.value);
                  if (found) {
                    setSelectedSJ(found);
                    setIsCreating(false);
                  }
                }}
                className="bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-1.5 text-xs text-[#f5ece5] font-mono"
              >
                {suratJalans.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.number} — {s.destination.slice(0, 30)}...
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsCreating(!isCreating)}
              className="btn-crema flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreating ? 'View Existing SJ' : 'Create New Surat Jalan'}</span>
            </button>
          </div>

          {isCreating ? (
            <div className="bg-[#16110e] p-5 rounded-2xl border border-[#33261e] space-y-4">
              <h4 className="text-sm font-bold text-[#f5ece5]">
                New Delivery Manifest Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#8c7b6f] mb-1">
                    Destination Outlet / Client Address
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-[#1e1713] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8c7b6f] mb-1">
                    Driver & Vehicle Plate
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="Driver Name"
                      className="w-1/2 bg-[#1e1713] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5]"
                    />
                    <input
                      type="text"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      placeholder="Plate #"
                      className="w-1/2 bg-[#1e1713] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5] font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#f5ece5]">
                    Dispatched Items Manifest
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-[#e07a48] hover:text-[#f5ece5]"
                  >
                    + Add Item Row
                  </button>
                </div>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center bg-[#1e1713] p-2.5 rounded-xl border border-[#362920] text-xs"
                    >
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].itemName = e.target.value;
                          setItems(updated);
                        }}
                        placeholder="Item name"
                        className="col-span-5 bg-[#14100e] px-2.5 py-1.5 rounded-lg text-[#f5ece5] border border-[#362920]"
                      />
                      <input
                        type="text"
                        value={item.batchNumber}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].batchNumber = e.target.value;
                          setItems(updated);
                        }}
                        placeholder="Batch/SKU"
                        className="col-span-3 bg-[#14100e] px-2.5 py-1.5 rounded-lg text-[#e07a48] font-mono border border-[#362920]"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].quantity = parseFloat(e.target.value) || 0;
                          setItems(updated);
                        }}
                        className="col-span-2 bg-[#14100e] px-2.5 py-1.5 rounded-lg text-[#f5ece5] font-mono border border-[#362920]"
                      />
                      <span className="col-span-1 text-[#8c7b6f] text-xs">{item.unit}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="col-span-1 text-rose-400 hover:text-rose-300 text-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-3.5 py-1.5 text-xs text-[#8c7b6f] hover:text-[#f5ece5]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-crema px-4 py-2 text-xs font-semibold rounded-full"
                >
                  Save & Issue Surat Jalan
                </button>
              </div>
            </div>
          ) : selectedSJ ? (
            <div className="bg-white text-stone-950 p-6 rounded-2xl border border-stone-300 font-sans shadow-md printable-surat-jalan">
              <div className="flex items-start justify-between border-b-2 border-stone-900 pb-4">
                <div>
                  <h2 className="text-xl font-black font-mono tracking-tight text-stone-950 uppercase">
                    BDS COFFEE COMPANY
                  </h2>
                  <p className="text-xs text-stone-600">
                    Roastery & Central Warehouse Division · Jakarta Selatan
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Phone: +62 21 7892 0192 | Email: logistics@bdscoffee.id
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider bg-stone-900 text-white px-2 py-0.5 rounded">
                    SURAT JALAN / DELIVERY NOTE
                  </span>
                  <div className="mt-1 font-mono text-sm font-bold text-stone-900">
                    {selectedSJ.number}
                  </div>
                  <div className="text-xs text-stone-600 font-mono">Date: {selectedSJ.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-b border-stone-200 text-xs">
                <div>
                  <span className="font-bold text-stone-700 block uppercase text-[10px]">
                    Delivered To (Destination):
                  </span>
                  <p className="text-stone-900 font-medium mt-0.5 leading-snug">
                    {selectedSJ.destination}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-stone-700 block uppercase text-[10px]">
                    Logistics / Driver:
                  </span>
                  <p className="text-stone-900 font-medium mt-0.5">
                    {selectedSJ.driverName} ({selectedSJ.vehiclePlate})
                  </p>
                  <span className="text-stone-500 text-[11px] block">
                    Issued by: {selectedSJ.createdByName}
                  </span>
                </div>
              </div>

              <div className="py-3">
                <table className="w-full text-left text-xs border border-stone-300">
                  <thead className="bg-stone-100 border-b border-stone-300 text-stone-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">No.</th>
                      <th className="py-2 px-3">Item Description</th>
                      <th className="py-2 px-3">Batch / Lot #</th>
                      <th className="py-2 px-3 text-right">Quantity</th>
                      <th className="py-2 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {selectedSJ.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-mono text-stone-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-stone-900">
                          {item.itemName}
                        </td>
                        <td className="py-2 px-3 font-mono text-stone-700">
                          {item.batchNumber}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-stone-900 text-right">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2 px-3 text-stone-500 text-[11px]">
                          {item.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-300 text-center text-xs">
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase">Warehouse Officer</span>
                  <div className="h-12 flex items-end justify-center font-bold text-stone-800">
                    ({selectedSJ.createdByName})
                  </div>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase">Delivery Driver</span>
                  <div className="h-12 flex items-end justify-center font-bold text-stone-800">
                    ({selectedSJ.driverName.split(' ')[0]})
                  </div>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase">Store Recipient</span>
                  <div className="h-12 flex items-end justify-center font-bold text-stone-800">
                    (...........................)
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="bg-[#16110e] px-6 py-4 border-t border-[#31251e] flex items-center justify-between">
          <span className="text-xs text-[#8c7b6f]">
            Official delivery document. Click print for physical paperwork.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#8c7b6f] hover:text-[#f5ece5]"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="btn-crema flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-full transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Surat Jalan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
