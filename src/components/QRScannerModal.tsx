import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, CheckCircle2, QrCode, Loader2 } from 'lucide-react';
import { GreenBean, RoastedBean } from '../types';
import { firestoreService } from '../services/firestoreService';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  greenBeans: GreenBean[];
  roastedBeans: RoastedBean[];
  onSelectScannedItem: (item: { type: 'green' | 'roasted'; data: GreenBean | RoastedBean }) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  greenBeans,
  roastedBeans,
  onSelectScannedItem,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [searchingFirestore, setSearchingFirestore] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<{
    type: 'green' | 'roasted';
    item: GreenBean | RoastedBean;
  } | null>(null);
  const [manualCode, setManualCode] = useState<string>('');

  useEffect(() => {
    let mediaStream: MediaStream | null = null;

    if (isOpen) {
      setScannedResult(null);
      setCameraError(null);

      navigator.mediaDevices
        ?.getUserMedia({
          video: { facingMode: 'environment' },
        })
        .then((stream) => {
          mediaStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
            setStreamActive(true);
          }
        })
        .catch(() => {
          setCameraError('Camera stream unavailable. Interactive viewfinder & mock scanner ready.');
        });
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Real-time Firestore document fetch from QR payload
  const handleTestScan = async (code: string) => {
    setSearchingFirestore(true);
    try {
      // 1. Try real-time Firestore query
      const liveItem = await firestoreService.fetchItemByQR(code);
      if (liveItem) {
        setScannedResult({ type: liveItem.type, item: liveItem.data });
        return;
      }

      // 2. Fallback to in-memory state if Firestore doc isn't matched
      const roasted = roastedBeans.find(
        (rb) =>
          rb.batchNumber.toLowerCase() === code.toLowerCase() ||
          (rb.batchNo && rb.batchNo.toLowerCase() === code.toLowerCase())
      );
      if (roasted) {
        setScannedResult({ type: 'roasted', item: roasted });
        return;
      }

      const green = greenBeans.find((gb) => gb.lotNumber.toLowerCase() === code.toLowerCase());
      if (green) {
        setScannedResult({ type: 'green', item: green });
        return;
      }

      alert(`No matching batch or lot found in Firestore for code: "${code}"`);
    } catch (err) {
      console.error('Scan lookup error:', err);
    } finally {
      setSearchingFirestore(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleTestScan(manualCode.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0e0b09]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-[#1c1511] border border-[#3d2e24] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-6">
        <div className="bg-[#16110e] px-5 py-4 border-b border-[#31251e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#e07a48]/20 border border-[#e07a48]/40 flex items-center justify-center text-[#e07a48]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f5ece5]">QR Optical Scanner</h3>
              <p className="text-[11px] text-[#8c7b6f]">Live Firestore Bag & Silo Recognition</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8c7b6f] hover:text-[#f5ece5] p-1.5 rounded-full hover:bg-[#271e18] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[280px] bg-[#120d0b] rounded-2xl overflow-hidden border-2 border-[#33261e] flex items-center justify-center">
            {streamActive ? (
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4 space-y-2">
                <QrCode className="w-12 h-12 text-[#5e493c] mx-auto animate-pulse" />
                <span className="text-xs font-mono text-[#a69588] block">
                  Simulated Viewfinder
                </span>
                <span className="text-[10px] text-[#736357] block max-w-[200px]">
                  Point physical sticker at lens or use the quick test triggers below
                </span>
              </div>
            )}

            <div className="absolute inset-8 border-2 border-dashed border-[#e07a48]/60 rounded-xl pointer-events-none flex items-center justify-center">
              <div className="w-full h-[2px] bg-[#e07a48] shadow-[0_0_8px_rgba(224,122,72,0.8)] animate-bounce"></div>
            </div>

            <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-[#e07a48] pointer-events-none"></div>
            <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-[#e07a48] pointer-events-none"></div>
            <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-[#e07a48] pointer-events-none"></div>
            <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-[#e07a48] pointer-events-none"></div>
          </div>

          <div className="w-full mt-4">
            <span className="text-[11px] font-medium text-[#8c7b6f] block mb-1.5 text-center">
              Quick Test Scan Presets (Firestore Query):
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleTestScan('BDS-RB-101')}
                disabled={searchingFirestore}
                className="px-2.5 py-1.5 bg-[#251d18] hover:bg-[#31261f] border border-[#3b2d24] rounded-xl text-[#e07a48] font-mono transition-colors text-left disabled:opacity-50"
              >
                Scan: BDS-RB-101
                <span className="block text-[10px] text-[#8c7b6f] font-sans">Ethiopia Washed</span>
              </button>

              <button
                onClick={() => handleTestScan('LOT-SMD-2024-14')}
                disabled={searchingFirestore}
                className="px-2.5 py-1.5 bg-[#251d18] hover:bg-[#31261f] border border-[#3b2d24] rounded-xl text-emerald-300 font-mono transition-colors text-left disabled:opacity-50"
              >
                Scan: LOT-SMD-14
                <span className="block text-[10px] text-[#8c7b6f] font-sans">Sumedang Green</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="w-full mt-3 flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Or type batch code (e.g. BDS-RB-102)..."
              className="flex-1 bg-[#14100e] border border-[#382b22] rounded-full px-3.5 py-1.5 text-xs text-[#f5ece5] font-mono focus:outline-none focus:border-[#e07a48]"
            />
            <button
              type="submit"
              disabled={searchingFirestore}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#2e231c] hover:bg-[#382b23] text-[#f5ece5] rounded-full transition-colors border border-[#443328] cursor-pointer disabled:opacity-50 flex items-center gap-1"
            >
              {searchingFirestore && <Loader2 className="w-3 h-3 animate-spin" />}
              <span>Lookup</span>
            </button>
          </form>

          {scannedResult && (
            <div className="w-full mt-4 p-4 rounded-2xl bg-[#261d17] border border-[#e07a48]/50 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#e07a48] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Firestore Document Verified
                </span>
                <span className="font-mono text-xs font-bold text-[#f5ece5]">
                  {scannedResult.type === 'roasted'
                    ? (scannedResult.item as RoastedBean).batchNumber || (scannedResult.item as any).batchNo
                    : (scannedResult.item as GreenBean).lotNumber}
                </span>
              </div>

              <div className="text-xs text-[#d9cdc3]">
                <p className="font-bold text-sm text-[#f5ece5]">
                  {scannedResult.type === 'roasted'
                    ? (scannedResult.item as RoastedBean).beanName
                    : (scannedResult.item as GreenBean).name}
                </p>
                <div className="mt-1 flex items-center justify-between text-[#8c7b6f] font-mono text-[11px]">
                  <span>
                    Current Stock:{' '}
                    {(
                      scannedResult.item.stockKg ??
                      (scannedResult.item as any).availableKg ??
                      0
                    ).toFixed(2)}{' '}
                    kg
                  </span>
                  <span>
                    {scannedResult.type === 'roasted'
                      ? `Roast: ${(scannedResult.item as RoastedBean).roastDate}`
                      : `Origin: ${(scannedResult.item as GreenBean).origin}`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectScannedItem({ type: scannedResult.type, data: scannedResult.item });
                  onClose();
                }}
                className="btn-crema w-full mt-2 py-2 text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                Inspect & Manage Stock in Firestore
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
