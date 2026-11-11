import {
  GreenBean,
  RoastedBean,
  PackagingItem,
  RoastRequest,
  InventoryTransaction,
  SuratJalan,
  RoastRequestStatus,
  TransactionType,
} from '../types';
import {
  INITIAL_GREEN_BEANS,
  INITIAL_ROASTED_BEANS,
  INITIAL_PACKAGING,
  INITIAL_ROAST_REQUESTS,
  INITIAL_TRANSACTIONS,
  INITIAL_SURAT_JALAN,
} from './mockData';

const STORAGE_KEYS = {
  GREEN_BEANS: 'bds_roastery_green_beans',
  ROASTED_BEANS: 'bds_roastery_roasted_beans',
  PACKAGING: 'bds_roastery_packaging',
  ROAST_REQUESTS: 'bds_roastery_roast_requests',
  TRANSACTIONS: 'bds_roastery_transactions',
  SURAT_JALAN: 'bds_roastery_surat_jalan',
};

// Safe storage accessors
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Failed reading storage key ${key}, using initial data`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed saving storage key ${key}`, e);
  }
}

export interface RestingStatusInfo {
  days: number;
  statusText: string;
  badgeClass: string; // Tailwind color classes
  description: string;
}

export function calculateRestingDays(roastDateStr: string): number {
  const roastDate = new Date(roastDateStr);
  const today = new Date();
  
  // Set both to midnight for pure calendar day delta
  roastDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - roastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getRestingBadge(roastDateStr: string): RestingStatusInfo {
  const days = calculateRestingDays(roastDateStr);

  if (days === 0) {
    return {
      days,
      statusText: 'Fresh Today',
      badgeClass: 'text-amber-300 border-amber-600/50 bg-amber-950/40',
      description: 'Active heavy degassing (CO2 release). Not ready for brewing.',
    };
  } else if (days <= 5) {
    return {
      days,
      statusText: `Resting (Day ${days})`,
      badgeClass: 'text-amber-400 border-amber-500/40 bg-amber-950/30',
      description: 'Degassing phase (1-5 days). Flavor compounds still stabilizing.',
    };
  } else if (days <= 30) {
    return {
      days,
      statusText: `Ready (Day ${days})`,
      badgeClass: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30',
      description: 'Optimal flavor peak (7-30 days). Ready for espresso bar or packaging.',
    };
  } else {
    return {
      days,
      statusText: `Aged (${days}d)`,
      badgeClass: 'text-stone-400 border-stone-600/40 bg-stone-900/60',
      description: 'Beyond 30 days. Recommended for cold brew extraction.',
    };
  }
}

class RoasteryDatabaseService {
  private listeners: Set<() => void> = new Set();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  // --- GREEN BEANS ---
  public getGreenBeans(): GreenBean[] {
    return loadFromStorage<GreenBean[]>(STORAGE_KEYS.GREEN_BEANS, INITIAL_GREEN_BEANS);
  }

  public addGreenBean(newBean: Omit<GreenBean, 'id' | 'qrPayload'>): GreenBean {
    const list = this.getGreenBeans();
    const id = `gb-${Date.now()}`;
    const qrPayload = JSON.stringify({ type: 'GB', lot: newBean.lotNumber, name: newBean.name, origin: newBean.origin });
    const fullBean: GreenBean = { ...newBean, id, qrPayload };
    const updated = [fullBean, ...list];
    saveToStorage(STORAGE_KEYS.GREEN_BEANS, updated);
    this.notify();
    return fullBean;
  }

  public updateGreenBeanStock(id: string, deltaKg: number, reason: string, user: string): boolean {
    const list = this.getGreenBeans();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) return false;

    const bean = list[idx];
    const newStock = Math.max(0, +(bean.stockKg + deltaKg).toFixed(2));
    list[idx] = { ...bean, stockKg: newStock };
    saveToStorage(STORAGE_KEYS.GREEN_BEANS, list);

    this.logTransaction({
      type: deltaKg > 0 ? 'stock_in' : 'stock_out',
      itemCategory: 'green_bean',
      itemId: id,
      itemName: bean.name,
      batchOrLotNumber: bean.lotNumber,
      quantityChange: deltaKg,
      unit: 'kg',
      performedBy: user,
      reason,
    });

    this.notify();
    return true;
  }

  // --- ROASTED BEANS ---
  public getRoastedBeans(): RoastedBean[] {
    return loadFromStorage<RoastedBean[]>(STORAGE_KEYS.ROASTED_BEANS, INITIAL_ROASTED_BEANS);
  }

  public addRoastedBatch(batch: {
    greenBeanId: string;
    beanName: string;
    roastDate: string;
    roastLevel: RoastedBean['roastLevel'];
    greenWeightKg: number;
    roastedWeightKg: number;
    roasterMachine: string;
    roasterName: string;
    notes?: string;
    flavorNotes?: string[];
  }): RoastedBean {
    const list = this.getRoastedBeans();
    const nextBatchNum = `BDS-RB-${100 + list.length + 1}`;
    const weightLoss = +(((batch.greenWeightKg - batch.roastedWeightKg) / batch.greenWeightKg) * 100).toFixed(2);
    const id = `rb-${Date.now()}`;

    const qrPayload = JSON.stringify({
      batch: nextBatchNum,
      bean: batch.beanName,
      roast: batch.roastDate,
      weight: `${batch.roastedWeightKg}kg`,
      level: batch.roastLevel,
      machine: batch.roasterMachine,
    });

    const newRoastedBatch: RoastedBean = {
      id,
      batchNumber: nextBatchNum,
      greenBeanId: batch.greenBeanId,
      beanName: batch.beanName,
      roastDate: batch.roastDate,
      roastLevel: batch.roastLevel,
      greenWeightKg: batch.greenWeightKg,
      roastedWeightKg: batch.roastedWeightKg,
      weightLossPercentage: weightLoss,
      stockKg: batch.roastedWeightKg,
      roasterMachine: batch.roasterMachine,
      roasterName: batch.roasterName,
      flavorNotes: batch.flavorNotes || ['Balanced Sweetness', 'Clean Finish'],
      qrPayload,
      notes: batch.notes,
    };

    const updated = [newRoastedBatch, ...list];
    saveToStorage(STORAGE_KEYS.ROASTED_BEANS, updated);

    // Deduct green bean inventory
    this.updateGreenBeanStock(
      batch.greenBeanId,
      -batch.greenWeightKg,
      `Consumed in roast batch ${nextBatchNum}`,
      batch.roasterName
    );

    // Log roast in transaction
    this.logTransaction({
      type: 'roast_in',
      itemCategory: 'roasted_bean',
      itemId: id,
      itemName: batch.beanName,
      batchOrLotNumber: nextBatchNum,
      quantityChange: batch.roastedWeightKg,
      unit: 'kg',
      performedBy: batch.roasterName,
      reason: `Roast batch ${nextBatchNum} finalized (${weightLoss}% weight loss)`,
      referenceNumber: nextBatchNum,
    });

    this.notify();
    return newRoastedBatch;
  }

  public updateRoastedBeanStock(id: string, deltaKg: number, reason: string, user: string): boolean {
    const list = this.getRoastedBeans();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) return false;

    const bean = list[idx];
    const newStock = Math.max(0, +(bean.stockKg + deltaKg).toFixed(2));
    list[idx] = { ...bean, stockKg: newStock };
    saveToStorage(STORAGE_KEYS.ROASTED_BEANS, list);

    this.logTransaction({
      type: deltaKg > 0 ? 'stock_in' : 'stock_out',
      itemCategory: 'roasted_bean',
      itemId: id,
      itemName: bean.beanName,
      batchOrLotNumber: bean.batchNumber,
      quantityChange: deltaKg,
      unit: 'kg',
      performedBy: user,
      reason,
    });

    this.notify();
    return true;
  }

  // --- PACKAGING ---
  public getPackaging(): PackagingItem[] {
    return loadFromStorage<PackagingItem[]>(STORAGE_KEYS.PACKAGING, INITIAL_PACKAGING);
  }

  public updatePackagingStock(id: string, deltaQty: number, reason: string, user: string): boolean {
    const list = this.getPackaging();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return false;

    const item = list[idx];
    const newStock = Math.max(0, item.currentStock + deltaQty);
    list[idx] = { ...item, currentStock: newStock };
    saveToStorage(STORAGE_KEYS.PACKAGING, list);

    this.logTransaction({
      type: deltaQty > 0 ? 'stock_in' : 'stock_out',
      itemCategory: 'packaging',
      itemId: id,
      itemName: item.name,
      batchOrLotNumber: item.sku,
      quantityChange: deltaQty,
      unit: item.unit,
      performedBy: user,
      reason,
    });

    this.notify();
    return true;
  }

  // --- ROAST REQUESTS ---
  public getRoastRequests(): RoastRequest[] {
    return loadFromStorage<RoastRequest[]>(STORAGE_KEYS.ROAST_REQUESTS, INITIAL_ROAST_REQUESTS);
  }

  public addRoastRequest(req: Omit<RoastRequest, 'id' | 'requestedAt' | 'status'>): RoastRequest {
    const list = this.getRoastRequests();
    const now = new Date();
    const dateFormatted = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    const fullReq: RoastRequest = {
      ...req,
      id: `req-${Date.now()}`,
      requestedAt: dateFormatted,
      status: 'pending',
    };
    saveToStorage(STORAGE_KEYS.ROAST_REQUESTS, [fullReq, ...list]);
    this.notify();
    return fullReq;
  }

  public updateRoastRequestStatus(id: string, status: RoastRequestStatus): boolean {
    const list = this.getRoastRequests();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return false;

    list[idx] = { ...list[idx], status };
    saveToStorage(STORAGE_KEYS.ROAST_REQUESTS, list);
    this.notify();
    return true;
  }

  // --- TRANSACTIONS ---
  public getTransactions(): InventoryTransaction[] {
    return loadFromStorage<InventoryTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  }

  public logTransaction(data: Omit<InventoryTransaction, 'id' | 'timestamp'>): InventoryTransaction {
    const list = this.getTransactions();
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    const newTx: InventoryTransaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
    };
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, [newTx, ...list]);
    return newTx;
  }

  // --- SURAT JALAN ---
  public getSuratJalans(): SuratJalan[] {
    return loadFromStorage<SuratJalan[]>(STORAGE_KEYS.SURAT_JALAN, INITIAL_SURAT_JALAN);
  }

  public createSuratJalan(data: Omit<SuratJalan, 'id' | 'number'>): SuratJalan {
    const list = this.getSuratJalans();
    const num = `SJ-BDS-2024/XI/${String(100 + list.length + 1).padStart(3, '0')}`;
    const newDoc: SuratJalan = {
      ...data,
      id: `sj-${Date.now()}`,
      number: num,
    };
    saveToStorage(STORAGE_KEYS.SURAT_JALAN, [newDoc, ...list]);
    this.notify();
    return newDoc;
  }

  // --- RESET DEMO DATA ---
  public resetToDemo(): void {
    saveToStorage(STORAGE_KEYS.GREEN_BEANS, INITIAL_GREEN_BEANS);
    saveToStorage(STORAGE_KEYS.ROASTED_BEANS, INITIAL_ROASTED_BEANS);
    saveToStorage(STORAGE_KEYS.PACKAGING, INITIAL_PACKAGING);
    saveToStorage(STORAGE_KEYS.ROAST_REQUESTS, INITIAL_ROAST_REQUESTS);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    saveToStorage(STORAGE_KEYS.SURAT_JALAN, INITIAL_SURAT_JALAN);
    this.notify();
  }
}

export const db = new RoasteryDatabaseService();
