import {
  collection,
  doc,
  onSnapshot,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, db, COLLECTIONS } from '../firebase';
import {
  GreenBean,
  RoastedBean,
  PackagingItem,
  RoastRequest,
  InventoryTransaction,
  UserProfile,
  Role,
} from '../types';
import {
  INITIAL_GREEN_BEANS,
  INITIAL_ROASTED_BEANS,
  INITIAL_PACKAGING,
  INITIAL_ROAST_REQUESTS,
  INITIAL_TRANSACTIONS,
  DEMO_USERS,
} from './mockData';
import { getRestingBadge } from './db';

export interface FirestoreState {
  greenBeans: GreenBean[];
  roastedBeans: RoastedBean[];
  roastRequests: RoastRequest[];
  transactions: InventoryTransaction[];
  packaging: PackagingItem[];
  currentUser: UserProfile | null;
  loading: boolean;
  error: string | null;
}

class FirestoreService {
  private listeners: (() => void)[] = [];

  /**
   * Seed initial documents if Firestore collection is empty
   */
  public async seedInitialDataIfEmpty(): Promise<void> {
    try {
      const gbSnap = await getDocs(collection(db, COLLECTIONS.GREEN_BEANS));
      if (gbSnap.empty) {
        console.log('Seeding initial green beans into Firestore...');
        for (const gb of INITIAL_GREEN_BEANS) {
          await setDoc(doc(db, COLLECTIONS.GREEN_BEANS, gb.id), {
            ...gb,
            reorderLevelKg: gb.minThresholdKg,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      const rbSnap = await getDocs(collection(db, COLLECTIONS.ROASTED_BEANS));
      if (rbSnap.empty) {
        console.log('Seeding initial roasted beans into Firestore...');
        for (const rb of INITIAL_ROASTED_BEANS) {
          const badge = getRestingBadge(rb.roastDate);
          await setDoc(doc(db, COLLECTIONS.ROASTED_BEANS, rb.id), {
            ...rb,
            batchNo: rb.batchNumber,
            yieldKg: rb.roastedWeightKg,
            weightLossPercent: rb.weightLossPercentage,
            availableKg: rb.stockKg,
            restingStatus: badge.statusText,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      const reqSnap = await getDocs(collection(db, COLLECTIONS.ROAST_REQUESTS));
      if (reqSnap.empty) {
        console.log('Seeding initial roast requests into Firestore...');
        for (const req of INITIAL_ROAST_REQUESTS) {
          await setDoc(doc(db, COLLECTIONS.ROAST_REQUESTS, req.id), {
            ...req,
            beanName: req.greenBeanName,
            amountKg: req.targetRoastedKg,
            createdAt: req.requestedAt,
          });
        }
      }

      const txSnap = await getDocs(collection(db, COLLECTIONS.STOCK_TRANSACTIONS));
      if (txSnap.empty) {
        console.log('Seeding initial stock transactions into Firestore...');
        for (const tx of INITIAL_TRANSACTIONS) {
          await setDoc(doc(db, COLLECTIONS.STOCK_TRANSACTIONS, tx.id), {
            ...tx,
            itemType: tx.itemCategory,
            changeKg: tx.quantityChange,
            type: tx.type === 'stock_in' || tx.type === 'roast_in' ? 'IN' : 'OUT',
            handler: tx.performedBy,
          });
        }
      }

      const pkgSnap = await getDocs(collection(db, COLLECTIONS.PACKAGING));
      if (pkgSnap.empty) {
        for (const pkg of INITIAL_PACKAGING) {
          await setDoc(doc(db, COLLECTIONS.PACKAGING, pkg.id), {
            ...pkg,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      // Seed standard demo profiles into users collection
      for (const usr of DEMO_USERS) {
        await setDoc(doc(db, COLLECTIONS.USERS, usr.id), usr, { merge: true });
      }
    } catch (err) {
      console.warn('Initial seeding encountered an error (check security rules or network)', err);
    }
  }

  /**
   * Set up real-time onSnapshot listener for green beans
   */
  public subscribeGreenBeans(onData: (beans: GreenBean[]) => void): () => void {
    const colRef = collection(db, COLLECTIONS.GREEN_BEANS);
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        const items: GreenBean[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          items.push({
            id: docSnap.id,
            lotNumber: d.lotNumber || `LOT-${docSnap.id.slice(0, 6)}`,
            name: d.name || 'Specialty Coffee',
            origin: d.origin || 'Indonesia',
            region: d.region || '',
            process: d.process || 'Washed',
            altitude: d.altitude || '1,400 MASL',
            variety: d.variety || 'Arabica',
            stockKg: typeof d.stockKg === 'number' ? d.stockKg : 0,
            minThresholdKg: typeof d.minThresholdKg === 'number' ? d.minThresholdKg : (d.reorderLevelKg || 25),
            reorderLevelKg: d.reorderLevelKg || d.minThresholdKg,
            costPerKg: d.costPerKg || 180000,
            arrivalDate: d.arrivalDate || new Date().toISOString().split('T')[0],
            supplier: d.supplier || 'BDS Coffee Direct Trade',
            moistureContent: d.moistureContent || 10.8,
            bagCount: d.bagCount || 1,
            qrPayload: d.qrPayload || JSON.stringify({ type: 'GB', id: docSnap.id, name: d.name }),
            updatedAt: d.updatedAt,
          });
        });
        onData(items);
      },
      (error) => {
        console.error('Error listening to green_beans:', error);
      }
    );
    return unsub;
  }

  /**
   * Set up real-time onSnapshot listener for roasted beans
   */
  public subscribeRoastedBeans(onData: (batches: RoastedBean[]) => void): () => void {
    const colRef = collection(db, COLLECTIONS.ROASTED_BEANS);
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        const items: RoastedBean[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const roastDate = d.roastDate || new Date().toISOString().split('T')[0];
          const badge = getRestingBadge(roastDate);
          items.push({
            id: docSnap.id,
            batchNumber: d.batchNumber || d.batchNo || `BDS-RB-${docSnap.id.slice(0, 4)}`,
            batchNo: d.batchNo || d.batchNumber,
            greenBeanId: d.greenBeanId || '',
            beanName: d.beanName || 'Artisan Roast',
            roastDate,
            roastLevel: d.roastLevel || 'Medium-Light',
            greenWeightKg: typeof d.greenWeightKg === 'number' ? d.greenWeightKg : 12,
            roastedWeightKg: typeof d.roastedWeightKg === 'number' ? d.roastedWeightKg : (d.yieldKg || 10.15),
            yieldKg: d.yieldKg || d.roastedWeightKg,
            weightLossPercentage: typeof d.weightLossPercentage === 'number' ? d.weightLossPercentage : (d.weightLossPercent || 15.4),
            weightLossPercent: d.weightLossPercent || d.weightLossPercentage,
            stockKg: typeof d.stockKg === 'number' ? d.stockKg : (d.availableKg || 10.15),
            availableKg: d.availableKg || d.stockKg,
            restingStatus: d.restingStatus || badge.statusText,
            roasterMachine: d.roasterMachine || 'Giesen W6A Artisan',
            roasterName: d.roasterName || 'Rangga Prawira',
            cuppingScore: d.cuppingScore || 87.5,
            flavorNotes: Array.isArray(d.flavorNotes) ? d.flavorNotes : ['Floral', 'Sweet Clean Finish'],
            qrPayload: d.qrPayload || JSON.stringify({ batch: d.batchNumber || d.batchNo, name: d.beanName }),
            notes: d.notes || '',
            updatedAt: d.updatedAt,
          });
        });
        onData(items);
      },
      (error) => {
        console.error('Error listening to roasted_beans:', error);
      }
    );
    return unsub;
  }

  /**
   * Set up real-time onSnapshot listener for roast requests
   */
  public subscribeRoastRequests(onData: (requests: RoastRequest[]) => void): () => void {
    const colRef = collection(db, COLLECTIONS.ROAST_REQUESTS);
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        const items: RoastRequest[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          items.push({
            id: docSnap.id,
            greenBeanId: d.greenBeanId || '',
            greenBeanName: d.greenBeanName || d.beanName || 'Ethiopia Yirgacheffe Washed',
            beanName: d.beanName || d.greenBeanName,
            targetRoastedKg: typeof d.targetRoastedKg === 'number' ? d.targetRoastedKg : (d.amountKg || 15),
            amountKg: d.amountKg || d.targetRoastedKg,
            roastProfile: d.roastProfile || 'Medium-Light Omni',
            priority: d.priority || 'normal',
            destinationOutlet: d.destinationOutlet || 'BDS Coffee Outlet Bintaro Hub',
            requestedBy: d.requestedBy || 'Farid Fauzi',
            requestedAt: d.requestedAt || d.createdAt || new Date().toISOString().split('T')[0],
            createdAt: d.createdAt || d.requestedAt,
            status: d.status || 'pending',
            notes: d.notes || '',
          });
        });
        onData(items);
      },
      (error) => {
        console.error('Error listening to roast_requests:', error);
      }
    );
    return unsub;
  }

  /**
   * Set up real-time onSnapshot listener for stock transactions
   */
  public subscribeTransactions(onData: (txs: InventoryTransaction[]) => void): () => void {
    const colRef = collection(db, COLLECTIONS.STOCK_TRANSACTIONS);
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        const items: InventoryTransaction[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          items.push({
            id: docSnap.id,
            timestamp: d.timestamp || new Date().toISOString(),
            type: d.type || 'IN',
            itemCategory: d.itemCategory || (d.itemType === 'green_bean' ? 'green_bean' : 'roasted_bean'),
            itemType: d.itemType,
            itemId: d.itemId,
            itemName: d.itemName || 'Specialty Coffee',
            batchOrLotNumber: d.batchOrLotNumber || '',
            quantityChange: typeof d.quantityChange === 'number' ? d.quantityChange : (d.changeKg || 0),
            changeKg: d.changeKg || d.quantityChange,
            unit: d.unit || 'kg',
            performedBy: d.performedBy || d.handler || 'Staff',
            handler: d.handler || d.performedBy,
            reason: d.reason || '',
            referenceNumber: d.referenceNumber || '',
          });
        });
        // Sort descending by timestamp
        items.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        onData(items);
      },
      (error) => {
        console.error('Error listening to stock_transactions:', error);
      }
    );
    return unsub;
  }

  /**
   * Set up real-time onSnapshot listener for packaging items
   */
  public subscribePackaging(onData: (packaging: PackagingItem[]) => void): () => void {
    const colRef = collection(db, COLLECTIONS.PACKAGING);
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        const items: PackagingItem[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          items.push({
            id: docSnap.id,
            sku: d.sku || `SKU-${docSnap.id.slice(0, 4)}`,
            name: d.name || 'Packaging Item',
            category: d.category || 'Bags',
            currentStock: typeof d.currentStock === 'number' ? d.currentStock : 500,
            minThreshold: typeof d.minThreshold === 'number' ? d.minThreshold : 100,
            unit: d.unit || 'pcs',
            costPerUnit: d.costPerUnit || 3500,
            supplier: d.supplier || 'BDS Packaging Supplier',
            updatedAt: d.updatedAt,
          });
        });
        onData(items);
      },
      (error) => {
        console.error('Error listening to packaging:', error);
      }
    );
    return unsub;
  }

  /**
   * Update Green Bean Stock in Firestore & log transaction
   */
  public async updateGreenBeanStock(
    id: string,
    deltaKg: number,
    reason: string,
    handler: string
  ): Promise<void> {
    const ref = doc(db, COLLECTIONS.GREEN_BEANS, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error(`Green bean ${id} not found in Firestore`);

    const currentStock = snap.data().stockKg || 0;
    const beanName = snap.data().name || 'Green Bean';
    const lotNumber = snap.data().lotNumber || '';
    const newStock = Math.max(0, Number((currentStock + deltaKg).toFixed(2)));

    await updateDoc(ref, {
      stockKg: newStock,
      updatedAt: new Date().toISOString(),
    });

    // Log to stock_transactions in Firestore
    await addDoc(collection(db, COLLECTIONS.STOCK_TRANSACTIONS), {
      timestamp: `${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().slice(0, 5)}`,
      type: deltaKg > 0 ? 'IN' : 'OUT',
      itemType: 'green_bean',
      itemName: beanName,
      batchOrLotNumber: lotNumber,
      changeKg: deltaKg,
      quantityChange: deltaKg,
      unit: 'kg',
      handler,
      performedBy: handler,
      reason,
      createdAt: serverTimestamp(),
    });
  }

  /**
   * Update Roasted Bean Stock in Firestore & log transaction
   */
  public async updateRoastedBeanStock(
    id: string,
    deltaKg: number,
    reason: string,
    handler: string
  ): Promise<void> {
    const ref = doc(db, COLLECTIONS.ROASTED_BEANS, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error(`Roasted bean ${id} not found in Firestore`);

    const currentStock = snap.data().stockKg || snap.data().availableKg || 0;
    const beanName = snap.data().beanName || 'Roasted Bean';
    const batchNumber = snap.data().batchNumber || snap.data().batchNo || '';
    const newStock = Math.max(0, Number((currentStock + deltaKg).toFixed(2)));

    await updateDoc(ref, {
      stockKg: newStock,
      availableKg: newStock,
      updatedAt: new Date().toISOString(),
    });

    await addDoc(collection(db, COLLECTIONS.STOCK_TRANSACTIONS), {
      timestamp: `${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().slice(0, 5)}`,
      type: deltaKg > 0 ? 'IN' : 'OUT',
      itemType: 'roasted_bean',
      itemName: beanName,
      batchOrLotNumber: batchNumber,
      changeKg: deltaKg,
      quantityChange: deltaKg,
      unit: 'kg',
      handler,
      performedBy: handler,
      reason,
      createdAt: serverTimestamp(),
    });
  }

  /**
   * Log a new roast batch in Firestore (Rangga):
   * 1. Decrements green_beans stock
   * 2. Calculates weight loss %
   * 3. addDoc to roasted_beans
   * 4. Logs roast_in and roast_out transactions
   */
  public async logRoastBatch(batchData: {
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
  }): Promise<RoastedBean> {
    const weightLossPercent = Number(
      (((batchData.greenWeightKg - batchData.roastedWeightKg) / batchData.greenWeightKg) * 100).toFixed(2)
    );
    const restingBadge = getRestingBadge(batchData.roastDate);
    const batchNo = `BDS-RB-${Math.floor(100 + Math.random() * 900)}`;

    const qrPayload = JSON.stringify({
      batch: batchNo,
      bean: batchData.beanName,
      roast: batchData.roastDate,
      weight: `${batchData.roastedWeightKg}kg`,
      level: batchData.roastLevel,
      machine: batchData.roasterMachine,
    });

    // 1. Decrement green bean stock
    await this.updateGreenBeanStock(
      batchData.greenBeanId,
      -batchData.greenWeightKg,
      `Consumed for roast batch ${batchNo}`,
      batchData.roasterName
    );

    // 2. Add to roasted_beans in Firestore
    const docRef = await addDoc(collection(db, COLLECTIONS.ROASTED_BEANS), {
      batchNo,
      batchNumber: batchNo,
      greenBeanId: batchData.greenBeanId,
      beanName: batchData.beanName,
      roastDate: batchData.roastDate,
      roastLevel: batchData.roastLevel,
      greenWeightKg: batchData.greenWeightKg,
      roastedWeightKg: batchData.roastedWeightKg,
      yieldKg: batchData.roastedWeightKg,
      weightLossPercentage: weightLossPercent,
      weightLossPercent,
      stockKg: batchData.roastedWeightKg,
      availableKg: batchData.roastedWeightKg,
      restingStatus: restingBadge.statusText,
      roasterMachine: batchData.roasterMachine,
      roasterName: batchData.roasterName,
      flavorNotes: batchData.flavorNotes,
      qrPayload,
      notes: batchData.notes || '',
      createdAt: serverTimestamp(),
      updatedAt: new Date().toISOString(),
    });

    // 3. Log roasted batch creation transaction
    await addDoc(collection(db, COLLECTIONS.STOCK_TRANSACTIONS), {
      timestamp: `${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().slice(0, 5)}`,
      type: 'IN',
      itemType: 'roasted_bean',
      itemName: batchData.beanName,
      batchOrLotNumber: batchNo,
      changeKg: batchData.roastedWeightKg,
      quantityChange: batchData.roastedWeightKg,
      unit: 'kg',
      handler: batchData.roasterName,
      performedBy: batchData.roasterName,
      reason: `Roast batch ${batchNo} completed (${weightLossPercent}% weight loss)`,
      referenceNumber: batchNo,
      createdAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      batchNumber: batchNo,
      batchNo,
      greenBeanId: batchData.greenBeanId,
      beanName: batchData.beanName,
      roastDate: batchData.roastDate,
      roastLevel: batchData.roastLevel,
      greenWeightKg: batchData.greenWeightKg,
      roastedWeightKg: batchData.roastedWeightKg,
      yieldKg: batchData.roastedWeightKg,
      weightLossPercentage: weightLossPercent,
      weightLossPercent,
      stockKg: batchData.roastedWeightKg,
      availableKg: batchData.roastedWeightKg,
      restingStatus: restingBadge.statusText,
      roasterMachine: batchData.roasterMachine,
      roasterName: batchData.roasterName,
      flavorNotes: batchData.flavorNotes,
      qrPayload,
      notes: batchData.notes,
    };
  }

  /**
   * Create a new roast request in Firestore
   */
  public async createRoastRequest(req: {
    greenBeanId: string;
    greenBeanName: string;
    targetRoastedKg: number;
    roastProfile: string;
    priority: any;
    destinationOutlet: string;
    requestedBy: string;
    notes?: string;
  }): Promise<void> {
    const now = new Date();
    const dateFormatted = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    await addDoc(collection(db, COLLECTIONS.ROAST_REQUESTS), {
      ...req,
      beanName: req.greenBeanName,
      amountKg: req.targetRoastedKg,
      status: 'pending',
      requestedAt: dateFormatted,
      createdAt: dateFormatted,
      serverTime: serverTimestamp(),
    });
  }

  /**
   * Update roast request status in Firestore
   */
  public async updateRoastRequestStatus(id: string, status: string): Promise<void> {
    const ref = doc(db, COLLECTIONS.ROAST_REQUESTS, id);
    await updateDoc(ref, {
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Add new green bean harvest lot to Firestore
   */
  public async addGreenBean(newBean: Omit<GreenBean, 'id' | 'qrPayload'>): Promise<GreenBean> {
    const qrPayload = JSON.stringify({ type: 'GB', lot: newBean.lotNumber, name: newBean.name, origin: newBean.origin });
    const docRef = await addDoc(collection(db, COLLECTIONS.GREEN_BEANS), {
      ...newBean,
      reorderLevelKg: newBean.minThresholdKg,
      qrPayload,
      updatedAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
    });

    // Log inbound transaction
    await addDoc(collection(db, COLLECTIONS.STOCK_TRANSACTIONS), {
      timestamp: `${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().slice(0, 5)}`,
      type: 'IN',
      itemType: 'green_bean',
      itemName: newBean.name,
      batchOrLotNumber: newBean.lotNumber,
      changeKg: newBean.stockKg,
      quantityChange: newBean.stockKg,
      unit: 'kg',
      handler: newBean.supplier || 'Warehouse Staff',
      performedBy: 'Warehouse Staff',
      reason: `New lot arrival registered: ${newBean.lotNumber}`,
      createdAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      ...newBean,
      qrPayload,
    };
  }

  /**
   * Look up document by QR code or batch/lot string
   */
  public async fetchItemByQR(codeOrPayload: string): Promise<{ type: 'green' | 'roasted'; data: any } | null> {
    try {
      let code = codeOrPayload;
      try {
        const parsed = JSON.parse(codeOrPayload);
        if (parsed.batch) code = parsed.batch;
        else if (parsed.lot) code = parsed.lot;
        else if (parsed.id) code = parsed.id;
      } catch (e) {
        // Raw string
      }

      // Check roasted beans
      const rbSnap = await getDocs(collection(db, COLLECTIONS.ROASTED_BEANS));
      for (const d of rbSnap.docs) {
        const data = d.data();
        if (
          d.id.toLowerCase() === code.toLowerCase() ||
          (data.batchNo && data.batchNo.toLowerCase() === code.toLowerCase()) ||
          (data.batchNumber && data.batchNumber.toLowerCase() === code.toLowerCase())
        ) {
          return { type: 'roasted', data: { id: d.id, ...data } };
        }
      }

      // Check green beans
      const gbSnap = await getDocs(collection(db, COLLECTIONS.GREEN_BEANS));
      for (const d of gbSnap.docs) {
        const data = d.data();
        if (
          d.id.toLowerCase() === code.toLowerCase() ||
          (data.lotNumber && data.lotNumber.toLowerCase() === code.toLowerCase())
        ) {
          return { type: 'green', data: { id: d.id, ...data } };
        }
      }

      return null;
    } catch (err) {
      console.error('Error fetching item by QR:', err);
      return null;
    }
  }

  // --- AUTHENTICATION ---
  /**
   * Track Firebase Auth state & fetch user role from Firestore users collection
   */
  public subscribeAuth(onUserChange: (userProfile: UserProfile | null, rawUser: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (rawUser) => {
      if (!rawUser) {
        onUserChange(null, null);
        return;
      }

      try {
        const userDocRef = doc(db, COLLECTIONS.USERS, rawUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          onUserChange(
            {
              id: rawUser.uid,
              name: data.name || rawUser.displayName || rawUser.email?.split('@')[0] || 'Coffee Operator',
              role: (data.role as Role) || 'office_staff',
              title: data.title || 'Roastery Operator',
              avatarInitials: data.avatarInitials || (rawUser.email ? rawUser.email.slice(0, 2).toUpperCase() : 'CO'),
              email: rawUser.email || '',
            },
            rawUser
          );
        } else {
          // If no doc yet, default role based on email or create one
          let role: Role = 'office_staff';
          let title = 'Warehouse & Inventory Officer';
          if (rawUser.email?.includes('rangga') || rawUser.email?.includes('roaster')) {
            role = 'head_roaster';
            title = 'Head Roaster & Quality Director';
          } else if (rawUser.email?.includes('rafi') || rawUser.email?.includes('admin')) {
            role = 'admin';
            title = 'Executive Admin & Finance Lead';
          }

          const newProfile: UserProfile = {
            id: rawUser.uid,
            name: rawUser.displayName || rawUser.email?.split('@')[0] || 'Coffee Operator',
            role,
            title,
            avatarInitials: (rawUser.email ? rawUser.email.slice(0, 2).toUpperCase() : 'CO'),
            email: rawUser.email || '',
          };

          await setDoc(userDocRef, newProfile, { merge: true });
          onUserChange(newProfile, rawUser);
        }
      } catch (err) {
        console.warn('Could not read user profile from Firestore, using auth fallback', err);
        onUserChange(
          {
            id: rawUser.uid,
            name: rawUser.displayName || rawUser.email?.split('@')[0] || 'Coffee Operator',
            role: 'office_staff',
            title: 'Warehouse Officer',
            avatarInitials: 'CO',
            email: rawUser.email || '',
          },
          rawUser
        );
      }
    });
  }

  public async signIn(email: string, pass: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  }

  public async signUp(email: string, pass: string, name: string, role: Role): Promise<User> {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const userDocRef = doc(db, COLLECTIONS.USERS, cred.user.uid);
    await setDoc(userDocRef, {
      id: cred.user.uid,
      name,
      role,
      title: role === 'head_roaster' ? 'Head Roaster' : role === 'admin' ? 'Executive Admin' : 'Warehouse Officer',
      avatarInitials: name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      email,
      createdAt: serverTimestamp(),
    });
    return cred.user;
  }

  public async signOut(): Promise<void> {
    await signOut(auth);
  }
}

export const firestoreService = new FirestoreService();
