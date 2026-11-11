import React, { useEffect, useState } from 'react';
import { generateQRCodeDataUrl } from '../services/qr';
import { Printer, X, Copy, Check, Coffee } from 'lucide-react';

export interface QRLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  code: string;
  beanName: string;
  origin: string;
  processOrLevel: string;
  dateLabel: string;
  dateValue: string;
  weight: string;
  notes?: string;
  rawPayload: string;
}

export const QRLabelModal: React.FC<QRLabelModalProps> = ({
  isOpen,
  onClose,
  title,
  code,
  beanName,
  origin,
  processOrLevel,
  dateLabel,
  dateValue,
  weight,
  notes,
  rawPayload,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (rawPayload) {
      generateQRCodeDataUrl(rawPayload).then(setQrDataUrl);
    }
  }, [rawPayload]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(rawPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0e0b09]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1c1511] border border-[#3d2e24] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-6 no-print">
        {/* Header */}
        <div className="bg-[#16110e] border-b border-[#31251e] px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#f5ece5] flex items-center gap-2">
              <Printer className="w-4 h-4 text-[#e07a48]" />
              Thermal QR Sticker Label Preview
            </h3>
            <p className="text-xs text-[#8c7b6f]">
              Formatted for 80mm x 50mm Direct Thermal adhesive roll printer
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#8c7b6f] hover:text-[#f5ece5] p-1.5 rounded-full hover:bg-[#271e18] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-6 bg-[#120d0b] flex flex-col items-center">
          {/* Printable 80mm Sticker Mockup */}
          <div
            id="printable-label-area"
            className="printable-thermal-label w-full max-w-[340px] bg-white text-stone-950 p-4 rounded-xl shadow-xl border border-stone-300 font-sans select-none"
          >
            {/* Label Brand Header */}
            <div className="border-b-2 border-black pb-2 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Coffee className="w-4 h-4 text-black" />
                <span className="font-extrabold tracking-wider text-xs uppercase font-mono">
                  BDS COFFEE COMPANY
                </span>
              </div>
              <span className="text-[9px] font-mono tracking-tight block uppercase text-stone-600">
                Specialty Roastery & Warehouse HQ · Jakarta
              </span>
            </div>

            {/* Batch / Lot Large Number */}
            <div className="py-2 flex items-center justify-between border-b border-stone-300">
              <div>
                <span className="text-[9px] font-mono uppercase text-stone-500 block">
                  {title}
                </span>
                <span className="font-mono text-base font-extrabold tracking-tight text-black">
                  {code}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono uppercase text-stone-500 block">
                  Net Weight
                </span>
                <span className="font-mono text-sm font-extrabold text-black">
                  {weight}
                </span>
              </div>
            </div>

            {/* Bean Details & QR Split */}
            <div className="py-2.5 flex items-center gap-3 border-b border-stone-300">
              <div className="shrink-0 w-24 h-24 border border-black p-1 bg-white flex items-center justify-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Thermal QR Label"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-100 animate-pulse flex items-center justify-center text-[8px]">
                    Generating...
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div>
                  <span className="text-[8px] font-mono uppercase text-stone-500 block">
                    Coffee Identification
                  </span>
                  <span className="text-xs font-bold leading-tight line-clamp-2 text-black">
                    {beanName}
                  </span>
                </div>

                <div className="text-[10px] space-y-0.5 font-mono text-stone-800">
                  <div className="truncate">
                    <span className="font-semibold">Origin:</span> {origin}
                  </div>
                  <div className="truncate">
                    <span className="font-semibold">Profile:</span> {processOrLevel}
                  </div>
                  <div className="truncate">
                    <span className="font-semibold">{dateLabel}:</span> {dateValue}
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="pt-2 text-center">
              <div className="h-5 flex items-center justify-center gap-[2px] overflow-hidden px-2">
                {[
                  2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 1, 4, 2, 3, 1, 2, 4, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 1, 4
                ].map((w, idx) => (
                  <span
                    key={idx}
                    className="bg-black h-full inline-block"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
              <span className="text-[8px] font-mono tracking-widest text-stone-600 block mt-0.5">
                *{code.replace(/[^A-Z0-9]/gi, '')}*
              </span>
            </div>

            {notes && (
              <div className="mt-1 pt-1 border-t border-stone-200 text-[8px] font-mono text-stone-500 text-center italic truncate">
                {notes}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#16110e] border-t border-[#31251e] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopyPayload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-[#c4b5a9] hover:text-[#f5ece5] bg-[#221a15] hover:bg-[#2c211a] rounded-full transition-colors border border-[#3b2d24] cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Payload!' : 'Copy Raw QR Data'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#8c7b6f] hover:text-[#f5ece5] hover:bg-[#251d18] rounded-full transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="btn-crema flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-full transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sticker Label</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
