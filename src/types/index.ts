export type Role = 'office_staff' | 'head_roaster' | 'admin' | 'executive_admin';

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  title: string;
  avatarInitials: string;
  email: string;
}

export interface GreenBean {
  id: string;
  lotNumber: string;
  name: string;
  origin: string;
  region?: string;
  process: 'Washed' | 'Natural' | 'Honey' | 'Anaerobic' | 'Wet-Hulled';
  altitude?: string;
  variety?: string;
  stockKg: number;
  minThresholdKg: number;
  reorderLevelKg?: number; // Alias for minThresholdKg
  costPerKg: number; // in IDR
  arrivalDate: string;
  supplier?: string;
  moistureContent: number; // percentage, e.g. 10.8%
  bagCount?: number;
  qrPayload?: string;
  updatedAt?: string;
}

export interface RoastedBean {
  id: string;
  batchNumber: string;
  batchNo?: string; // Alias for batchNumber
  greenBeanId?: string;
  beanName: string;
  roastDate: string; // ISO date string (YYYY-MM-DD)
  roastLevel: 'Light' | 'Medium-Light' | 'Medium' | 'Medium-Dark' | 'Omni' | 'Espresso';
  greenWeightKg: number;
  roastedWeightKg: number;
  yieldKg?: number; // Alias for roastedWeightKg
  weightLossPercentage: number;
  weightLossPercent?: number; // Alias for weightLossPercentage
  stockKg: number;
  availableKg?: number; // Alias for stockKg
  restingStatus?: string;
  roasterMachine?: string;
  roasterName?: string;
  cuppingScore?: number;
  flavorNotes: string[];
  qrPayload?: string;
  notes?: string;
  updatedAt?: string;
}

export interface PackagingItem {
  id: string;
  sku: string;
  name: string;
  category: 'Bags' | 'Valves' | 'Labels' | 'Drinkware' | 'Shipping';
  currentStock: number;
  minThreshold: number;
  unit: string;
  costPerUnit: number; // in IDR
  supplier: string;
  updatedAt?: string;
}

export type RoastRequestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type PriorityLevel = 'normal' | 'high' | 'urgent';

export interface RoastRequest {
  id: string;
  greenBeanId?: string;
  greenBeanName: string;
  beanName?: string; // Alias
  targetRoastedKg: number;
  amountKg?: number; // Alias
  roastProfile: string;
  priority: PriorityLevel;
  destinationOutlet: string;
  requestedBy: string;
  requestedAt: string;
  createdAt?: string; // Alias
  status: RoastRequestStatus;
  notes?: string;
}

export type TransactionType = 'stock_in' | 'stock_out' | 'roast_in' | 'roast_out' | 'qc_waste' | 'adjustment' | 'IN' | 'OUT';

export interface InventoryTransaction {
  id: string;
  timestamp: string;
  type: TransactionType;
  itemCategory?: 'green_bean' | 'roasted_bean' | 'packaging';
  itemType?: string;
  itemId?: string;
  itemName: string;
  batchOrLotNumber?: string;
  quantityChange?: number; // negative for stock out, positive for stock in
  changeKg?: number; // Alias for quantityChange
  unit?: string;
  performedBy?: string;
  handler?: string; // Alias for performedBy
  reason?: string;
  referenceNumber?: string;
}

export interface SuratJalanItem {
  itemName: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface SuratJalan {
  id: string;
  number: string;
  date: string;
  destination: string;
  driverName: string;
  vehiclePlate: string;
  items: SuratJalanItem[];
  createdByName: string;
  status: 'Draft' | 'Dispatched' | 'Delivered';
}
