import React, { useState, useEffect } from 'react';
import {
  GreenBean,
  RoastedBean,
  PackagingItem,
  RoastRequest,
  InventoryTransaction,
  UserProfile,
  SuratJalan,
  PriorityLevel,
  Role,
} from './types';
import { firestoreService } from './services/firestoreService';
import { db as localDbFallback, getRestingBadge } from './services/db';
import { DEMO_USERS, INITIAL_SURAT_JALAN } from './services/mockData';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { StatCard } from './components/StatCard';
import { GreenBeanTable } from './components/GreenBeanTable';
import { RoastedBeanTable } from './components/RoastedBeanTable';
import { PackagingTable } from './components/PackagingTable';
import { RoastQueueList } from './components/RoastQueueList';
import { RoastPipelineBoard } from './components/RoastPipelineBoard';
import { RoastBatchModal } from './components/RoastBatchModal';
import { StockMovementModal } from './components/StockMovementModal';
import { CreateRoastRequestModal } from './components/CreateRoastRequestModal';
import { QRLabelModal } from './components/QRLabelModal';
import { QRScannerModal } from './components/QRScannerModal';
import { SuratJalanModal } from './components/SuratJalanModal';
import { AddGreenBeanModal } from './components/AddGreenBeanModal';
import { AdminConsole } from './components/AdminConsole';
import { AuthModal } from './components/AuthModal';
import {
  Wheat,
  Flame,
  ListOrdered,
  QrCode,
  ArrowUpDown,
  Sparkles,
  TrendingUp,
  Kanban,
  Calendar,
  Loader2,
  CloudCheck,
} from 'lucide-react';

import { LoginScreen } from './components/LoginScreen';

export default function App() {
  // Current active user & Firebase Auth profile (null = unauthenticated)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<'30_days' | '12_weeks' | 'all_time'>('30_days');

  // Real-time Firestore State
  const [greenBeans, setGreenBeans] = useState<GreenBean[]>([]);
  const [roastedBeans, setRoastedBeans] = useState<RoastedBean[]>([]);
  const [packaging, setPackaging] = useState<PackagingItem[]>([]);
  const [roastRequests, setRoastRequests] = useState<RoastRequest[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [suratJalans, setSuratJalans] = useState<SuratJalan[]>(INITIAL_SURAT_JALAN);

  // Status & loading
  const [isFirebaseLive, setIsFirebaseLive] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isActionPending, setIsActionPending] = useState<boolean>(false);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isRoastBatchOpen, setIsRoastBatchOpen] = useState<boolean>(false);
  const [roastBatchPrefill, setRoastBatchPrefill] = useState<{
    greenBeanId?: string;
    targetKg?: number;
  }>({});

  const [isStockMovementOpen, setIsStockMovementOpen] = useState<boolean>(false);
  const [stockMovementPrefill, setStockMovementPrefill] = useState<any>(null);

  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState<boolean>(false);
  const [createRequestPrefillBeanId, setCreateRequestPrefillBeanId] = useState<string | undefined>();

  const [isQRLabelOpen, setIsQRLabelOpen] = useState<boolean>(false);
  const [qrLabelData, setQrLabelData] = useState<any>(null);

  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  const [isSuratJalanOpen, setIsSuratJalanOpen] = useState<boolean>(false);
  const [isAddGreenBeanOpen, setIsAddGreenBeanOpen] = useState<boolean>(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Connect real-time Firestore listeners and Auth on initial mount
  useEffect(() => {
    const handleResize = () => {
      setViewMode(window.innerWidth < 768 ? 'mobile' : 'desktop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // 1. Listen to real Firebase Authentication & User Role from Firestore
    const unsubAuth = firestoreService.subscribeAuth((profile) => {
      setAuthChecked(true);
      setCurrentUser(profile);
      if (profile) {
        if (profile.role === 'head_roaster') {
          setActiveTab('pipeline');
        } else if (profile.role === 'admin' || profile.role === 'executive_admin') {
          setActiveTab('executive_admin');
        } else {
          setActiveTab('overview');
        }
        showToast(`Firebase Auth: Logged in as ${profile.name} (${profile.role.replace('_', ' ')})`);
      }
    });

    // 2. Set up real-time onSnapshot listeners for all Firestore collections
    const unsubGB = firestoreService.subscribeGreenBeans((beans) => {
      if (beans.length > 0) setGreenBeans(beans);
      setIsFirebaseLive(true);
      setInitialLoading(false);
    });

    const unsubRB = firestoreService.subscribeRoastedBeans((batches) => {
      if (batches.length > 0) setRoastedBeans(batches);
    });

    const unsubReq = firestoreService.subscribeRoastRequests((reqs) => {
      if (reqs.length > 0) setRoastRequests(reqs);
    });

    const unsubTx = firestoreService.subscribeTransactions((txs) => {
      if (txs.length > 0) setTransactions(txs);
    });

    const unsubPkg = firestoreService.subscribePackaging((items) => {
      if (items.length > 0) setPackaging(items);
    });

    // 3. Seed initial collections if newly created/empty in Firestore
    firestoreService.seedInitialDataIfEmpty().then(() => {
      setIsFirebaseLive(true);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      unsubAuth();
      unsubGB();
      unsubRB();
      unsubReq();
      unsubTx();
      unsubPkg();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await firestoreService.signOut();
      showToast('Signed out of Firebase Auth.');
    } catch (err: any) {
      showToast(`Sign out error: ${err.message}`);
    }
  };

  // Calculated Metrics
  const totalGreenStockKg = greenBeans.reduce((sum, b) => sum + b.stockKg, 0);
  const totalRoastedStockKg = roastedBeans.reduce((sum, b) => sum + (b.stockKg ?? b.availableKg ?? 0), 0);
  const restingBatchesCount = roastedBeans.filter((b) => getRestingBadge(b.roastDate).days <= 5).length;
  const pendingRequestsCount = roastRequests.filter((r) => r.status === 'pending' || r.status === 'in_progress').length;
  const lowStockCount =
    greenBeans.filter((b) => b.stockKg <= b.minThresholdKg).length +
    packaging.filter((p) => p.currentStock <= p.minThreshold).length;

  const totalValuation =
    greenBeans.reduce((acc, b) => acc + b.stockKg * b.costPerKg, 0) +
    roastedBeans.reduce((acc, b) => acc + (b.stockKg ?? b.availableKg ?? 0) * 260000, 0) +
    packaging.reduce((acc, p) => acc + p.currentStock * p.costPerUnit, 0);

  // Trigger QR Label for Green Bean Lot
  const handleOpenGreenBeanQR = (bean: GreenBean) => {
    setQrLabelData({
      title: 'GREEN COFFEE LOT SILO',
      code: bean.lotNumber,
      beanName: bean.name,
      origin: `${bean.origin} (${bean.region || ''})`,
      processOrLevel: `${bean.process} · ${bean.variety || 'Specialty'}`,
      dateLabel: 'Received',
      dateValue: bean.arrivalDate,
      weight: `${bean.stockKg.toFixed(1)} kg`,
      notes: `Moisture: ${bean.moistureContent}% · ${bean.bagCount || 1} Bags`,
      rawPayload: bean.qrPayload || JSON.stringify({ type: 'GB', lot: bean.lotNumber }),
    });
    setIsQRLabelOpen(true);
  };

  // Trigger QR Label for Roasted Bean Batch
  const handleOpenRoastedBeanQR = (bean: RoastedBean) => {
    const badge = getRestingBadge(bean.roastDate);
    const batchCode = bean.batchNumber || bean.batchNo || 'BDS-RB';
    setQrLabelData({
      title: 'ROASTED BATCH IDENTIFIER',
      code: batchCode,
      beanName: bean.beanName,
      origin: `Roasted on ${bean.roasterMachine || 'Giesen W6A'}`,
      processOrLevel: `${bean.roastLevel} · Loss: ${bean.weightLossPercentage || bean.weightLossPercent || 15.4}%`,
      dateLabel: 'Roast Date',
      dateValue: bean.roastDate,
      weight: `${(bean.stockKg ?? bean.availableKg ?? 0).toFixed(2)} kg`,
      notes: `Degas: ${badge.statusText} · Roaster: ${bean.roasterName || 'Rangga'}`,
      rawPayload: bean.qrPayload || JSON.stringify({ batch: batchCode, bean: bean.beanName }),
    });
    setIsQRLabelOpen(true);
  };

  // FIRESTORE HANDLER: Submit new roast batch (Rangga)
  const handleCreateRoastBatch = async (batchData: any) => {
    setIsActionPending(true);
    try {
      const newBatch = await firestoreService.logRoastBatch(batchData);
      setIsRoastBatchOpen(false);
      showToast(`Roast batch ${newBatch.batchNumber} saved to Firestore! Decremented ${batchData.greenWeightKg}kg green bean.`);
      handleOpenRoastedBeanQR(newBatch);
    } catch (err: any) {
      console.error('Failed to log roast batch:', err);
      showToast(`Firestore Error: ${err.message}`);
    } finally {
      setIsActionPending(false);
    }
  };

  // FIRESTORE HANDLER: Submit stock in / stock out
  const handleStockMovementSubmit = async (data: {
    category: 'green_bean' | 'roasted_bean' | 'packaging';
    itemId: string;
    deltaQuantity: number;
    reason: string;
  }) => {
    setIsActionPending(true);
    const operatorName = currentUser?.name || 'Roastery Staff';
    try {
      if (data.category === 'green_bean') {
        await firestoreService.updateGreenBeanStock(
          data.itemId,
          data.deltaQuantity,
          data.reason,
          operatorName
        );
      } else if (data.category === 'roasted_bean') {
        await firestoreService.updateRoastedBeanStock(
          data.itemId,
          data.deltaQuantity,
          data.reason,
          operatorName
        );
      } else {
        // Fallback for packaging
        localDbFallback.updatePackagingStock(
          data.itemId,
          data.deltaQuantity,
          data.reason,
          operatorName
        );
      }
      showToast(`Firestore updated: ${data.deltaQuantity > 0 ? `+${data.deltaQuantity}` : data.deltaQuantity} logged to stock_transactions`);
    } catch (err: any) {
      console.error('Stock movement error:', err);
      showToast(`Error updating Firestore: ${err.message}`);
    } finally {
      setIsActionPending(false);
    }
  };

  // FIRESTORE HANDLER: Submit roast request
  const handleCreateRoastRequest = async (data: {
    greenBeanId: string;
    greenBeanName: string;
    targetRoastedKg: number;
    roastProfile: string;
    priority: PriorityLevel;
    destinationOutlet: string;
    notes?: string;
  }) => {
    setIsActionPending(true);
    try {
      await firestoreService.createRoastRequest({
        ...data,
        requestedBy: currentUser?.name || 'Roastery Staff',
      });
      showToast(`Roast request for ${data.targetRoastedKg}kg added directly to Firestore roast_requests collection`);
    } catch (err: any) {
      console.error('Error creating roast request:', err);
      showToast(`Firestore Error: ${err.message}`);
    } finally {
      setIsActionPending(false);
    }
  };

  // FIRESTORE HANDLER: Update roast request status
  const handleUpdateQueueStatus = async (id: string, status: any) => {
    try {
      await firestoreService.updateRoastRequestStatus(id, status);
      showToast(`Roast request ${id.slice(-4)} updated to: ${status}`);
    } catch (err: any) {
      showToast(`Error updating request: ${err.message}`);
    }
  };

  // FIRESTORE HANDLER: Add new inbound green bean lot
  const handleAddGreenBean = async (newBean: Omit<GreenBean, 'id' | 'qrPayload'>) => {
    setIsActionPending(true);
    try {
      const created = await firestoreService.addGreenBean(newBean);
      showToast(`Lot ${created.lotNumber} created in Firestore green_beans!`);
      handleOpenGreenBeanQR(created);
    } catch (err: any) {
      showToast(`Error adding green bean: ${err.message}`);
    } finally {
      setIsActionPending(false);
    }
  };

  // 1. Redirection Check: While checking Firebase Auth status on initial load
  if (!authChecked) {
    return (
      <div className="h-screen w-full bg-[#0d0907] flex flex-col items-center justify-center gap-3 font-sans selection:bg-[#0ea5e9]">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#38bdf8] to-[#0284c7] p-[1.5px] shadow-[0_0_25px_rgba(56,189,248,0.4)] flex items-center justify-center animate-pulse">
          <div className="w-full h-full bg-[#110e0c] rounded-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#38bdf8]" />
          </div>
        </div>
        <p className="text-xs font-mono text-[#94a3b8] tracking-wider">
          Connecting BDS Roastery Security...
        </p>
      </div>
    );
  }

  // 2. Redirection Check: If user is logged out, render dedicated LoginScreen
  if (!currentUser) {
    return (
      <>
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#1f1713] text-[#f5ece5] border border-[#e07a48]/50 px-4 py-2.5 rounded-2xl shadow-xl text-xs flex items-center gap-2 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-[#e07a48] animate-ping" />
            <span>{toastMessage}</span>
          </div>
        )}
        <LoginScreen
          onLoginSuccess={(profile, msg) => {
            setCurrentUser(profile);
            showToast(msg);
          }}
        />
      </>
    );
  }

  // 3. User is authenticated: Render Dashboard Layout
  return (
    <div className="h-screen overflow-hidden bg-[#14100e] text-[#f5ece5] flex font-sans selection:bg-[#e07a48] selection:text-white">
      {viewMode === 'desktop' ? (
        /* ================= DESKTOP DASHBOARD VIEW ================= */
        <div className="flex-1 w-full h-screen overflow-hidden flex relative">
          {/* Fixed Non-Scrolling Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            currentUser={currentUser}
            roastQueueCount={pendingRequestsCount}
            lowStockCount={lowStockCount}
          />

          {/* Scrolling Main Content taking up the remaining space */}
          <div className="ml-64 flex-1 h-screen overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-amber-950">
            {/* Main Top Header with Electric Nav */}
            <Header
              currentUser={currentUser}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              onOpenStockMovement={() => {
                setStockMovementPrefill(null);
                setIsStockMovementOpen(true);
              }}
              onOpenQRScanner={() => setIsQRScannerOpen(true)}
              onOpenCreateRoastRequest={() => {
                setCreateRequestPrefillBeanId(undefined);
                setIsCreateRequestOpen(true);
              }}
              onOpenLogRoastBatch={() => {
                setRoastBatchPrefill({});
                setIsRoastBatchOpen(true);
              }}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onSignOut={handleSignOut}
              lowStockCount={lowStockCount}
              pendingRequestsCount={pendingRequestsCount}
              isFirebaseLive={isFirebaseLive}
            />

            {/* Loading banner if connecting initially */}
            {initialLoading && (
              <div className="shrink-0 bg-[#1f1713] border-b border-[#382b22] px-4 py-2 text-xs text-[#a69588] flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e07a48]" />
                <span>Synchronizing with live Firebase Firestore collections...</span>
              </div>
            )}

            <main className="flex-1 p-6 space-y-6">
              {/* Hero Greeting & Status Strip (Matching video frame 00:01) */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#2d221b]">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#a69588] font-mono">
                    <Calendar className="w-3.5 h-3.5 text-[#e07a48]" />
                    <span>Live Roastery · Tuesday, November 11 · Shift 1 Active</span>
                    <span className="text-emerald-400 font-bold ml-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Cloud Synced
                    </span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-[#f5ece5] tracking-tight mt-1">
                    Good morning, {currentUser.name.split(' ')[0]}
                  </h1>
                  <p className="text-xs text-[#8c7b6f] mt-0.5">
                    Warehouse operating at <span className="text-[#e07a48] font-bold">94.2%</span> batch fulfillment efficiency. Real-time Firestore sync enabled.
                  </p>
                </div>

                {/* Period Pills & Quick Actions (Matching top-right of video) */}
                <div className="flex items-center gap-2.5">
                  <div className="inline-flex items-center bg-[#1f1713] border border-[#382b22] rounded-full p-1 text-xs">
                    {(['30_days', '12_weeks', 'all_time'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setPeriodFilter(period)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          periodFilter === period
                            ? 'bg-[#3b2e25] text-[#f5ece5] font-semibold shadow-sm'
                            : 'text-[#8c7b6f] hover:text-[#f5ece5]'
                        }`}
                      >
                        {period === '30_days' ? '30 days' : period === '12_weeks' ? '12 weeks' : 'All time'}
                      </button>
                    ))}
                  </div>

                  {currentUser.role === 'head_roaster' ? (
                    <button
                      onClick={() => {
                        setRoastBatchPrefill({});
                        setIsRoastBatchOpen(true);
                      }}
                      className="btn-crema flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer shadow-md"
                    >
                      <Flame className="w-4 h-4" />
                      <span>+ Log Roast Batch</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setCreateRequestPrefillBeanId(undefined);
                        setIsCreateRequestOpen(true);
                      }}
                      className="btn-crema flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer shadow-md"
                    >
                      <Flame className="w-4 h-4" />
                      <span>+ Create Roast Request</span>
                    </button>
                  )}
                </div>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <StatCard
                  label="Total Green Coffee"
                  value={totalGreenStockKg.toFixed(1)}
                  unit="kg"
                  description={`${greenBeans.length} distinct origin lots`}
                  icon={<Wheat className="w-4 h-4" />}
                  accentColor="amber"
                  onClick={() => setActiveTab('green_beans')}
                />

                <StatCard
                  label="Roasted Ready Stock"
                  value={totalRoastedStockKg.toFixed(1)}
                  unit="kg"
                  description={`${roastedBeans.length} active batches`}
                  icon={<Flame className="w-4 h-4" />}
                  accentColor="emerald"
                  onClick={() => setActiveTab('roasted_beans')}
                />

                <StatCard
                  label="Batches Resting / Degas"
                  value={restingBatchesCount}
                  unit="batches"
                  description="Degassing phase (Days 1–5)"
                  icon={<Sparkles className="w-4 h-4" />}
                  accentColor="amber"
                  onClick={() => setActiveTab('pipeline')}
                />

                <StatCard
                  label="Roast Queue Orders"
                  value={pendingRequestsCount}
                  unit="orders"
                  description="Awaiting roaster schedule"
                  icon={<ListOrdered className="w-4 h-4" />}
                  accentColor="sky"
                  onClick={() => setActiveTab('roast_queue')}
                />

                <StatCard
                  label="Warehouse Asset Capital"
                  value={`Rp ${(totalValuation / 1000000).toFixed(1)}M`}
                  unit=""
                  description="Green + roasted + packaging"
                  icon={<TrendingUp className="w-4 h-4" />}
                  accentColor="stone"
                  onClick={() => setActiveTab('executive_admin')}
                />
              </div>

              {/* View Content depending on active tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Pipeline Quick Spotlight */}
                  <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#e07a48]/20 border border-[#e07a48]/40 flex items-center justify-center text-[#e07a48]">
                        <Kanban className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#f5ece5]">
                          Interactive Roastery Pipeline Board
                        </h3>
                        <p className="text-xs text-[#a69588]">
                          Track green beans through Drum Roaster, Resting degas racks, and final café dispatch.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('pipeline')}
                      className="px-4 py-1.5 text-xs font-semibold bg-[#2e231c] hover:bg-[#382b23] text-[#f5ece5] border border-[#4a382d] rounded-full transition-colors cursor-pointer"
                    >
                      Open Pipeline Board →
                    </button>
                  </div>

                  <RoastedBeanTable
                    roastedBeans={roastedBeans}
                    currentUser={currentUser}
                    searchQuery={searchQuery}
                    onOpenQRLabel={handleOpenRoastedBeanQR}
                    onLogNewRoastBatch={() => {
                      setRoastBatchPrefill({});
                      setIsRoastBatchOpen(true);
                    }}
                    onQuickStockOut={(bean) => {
                      setStockMovementPrefill({
                        category: 'roasted_bean',
                        id: bean.id,
                        isStockIn: false,
                      });
                      setIsStockMovementOpen(true);
                    }}
                  />

                  <GreenBeanTable
                    greenBeans={greenBeans}
                    currentUser={currentUser}
                    searchQuery={searchQuery}
                    onOpenQRLabel={handleOpenGreenBeanQR}
                    onRequestRoast={(bean) => {
                      setCreateRequestPrefillBeanId(bean.id);
                      setIsCreateRequestOpen(true);
                    }}
                    onQuickStockAdjust={(bean, isStockIn) => {
                      setStockMovementPrefill({
                        category: 'green_bean',
                        id: bean.id,
                        isStockIn,
                      });
                      setIsStockMovementOpen(true);
                    }}
                    onAddNewBean={() => setIsAddGreenBeanOpen(true)}
                  />
                </div>
              )}

              {activeTab === 'pipeline' && (
                <RoastPipelineBoard
                  roastRequests={roastRequests}
                  roastedBeans={roastedBeans}
                  greenBeans={greenBeans}
                  currentUser={currentUser}
                  onOpenRoastModalWithRequest={(req) => {
                    setRoastBatchPrefill({
                      greenBeanId: req.greenBeanId,
                      targetKg: req.targetRoastedKg,
                    });
                    setIsRoastBatchOpen(true);
                  }}
                  onOpenQRLabel={handleOpenRoastedBeanQR}
                  onUpdateQueueStatus={handleUpdateQueueStatus}
                  onOpenNewRoastModal={() => {
                    setRoastBatchPrefill({});
                    setIsRoastBatchOpen(true);
                  }}
                />
              )}

              {activeTab === 'green_beans' && (
                <GreenBeanTable
                  greenBeans={greenBeans}
                  currentUser={currentUser}
                  searchQuery={searchQuery}
                  onOpenQRLabel={handleOpenGreenBeanQR}
                  onRequestRoast={(bean) => {
                    setCreateRequestPrefillBeanId(bean.id);
                    setIsCreateRequestOpen(true);
                  }}
                  onQuickStockAdjust={(bean, isStockIn) => {
                    setStockMovementPrefill({
                      category: 'green_bean',
                      id: bean.id,
                      isStockIn,
                    });
                    setIsStockMovementOpen(true);
                  }}
                  onAddNewBean={() => setIsAddGreenBeanOpen(true)}
                />
              )}

              {activeTab === 'roasted_beans' && (
                <RoastedBeanTable
                  roastedBeans={roastedBeans}
                  currentUser={currentUser}
                  searchQuery={searchQuery}
                  onOpenQRLabel={handleOpenRoastedBeanQR}
                  onLogNewRoastBatch={() => {
                    setRoastBatchPrefill({});
                    setIsRoastBatchOpen(true);
                  }}
                  onQuickStockOut={(bean) => {
                    setStockMovementPrefill({
                      category: 'roasted_bean',
                      id: bean.id,
                      isStockIn: false,
                    });
                    setIsStockMovementOpen(true);
                  }}
                />
              )}

              {activeTab === 'roast_queue' && (
                <RoastQueueList
                  requests={roastRequests}
                  currentUser={currentUser}
                  onUpdateStatus={handleUpdateQueueStatus}
                  onFulfillWithBatch={(req) => {
                    setRoastBatchPrefill({
                      greenBeanId: req.greenBeanId,
                      targetKg: req.targetRoastedKg,
                    });
                    setIsRoastBatchOpen(true);
                  }}
                  onCreateNewRequest={() => {
                    setCreateRequestPrefillBeanId(undefined);
                    setIsCreateRequestOpen(true);
                  }}
                />
              )}

              {activeTab === 'packaging' && (
                <PackagingTable
                  packagingItems={packaging}
                  currentUser={currentUser}
                  searchQuery={searchQuery}
                  onStockChange={(item, delta) => {
                    localDbFallback.updatePackagingStock(
                      item.id,
                      delta,
                      delta > 0 ? 'Stock Replenishment Intake' : 'Packaging & Bar Use',
                      currentUser.name
                    );
                    showToast(`${item.name} stock adjusted`);
                  }}
                />
              )}

              {activeTab === 'surat_jalan' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-[#f5ece5]">
                        Surat Jalan & Delivery Dispatches
                      </h2>
                      <p className="text-xs text-[#a69588]">
                        Manage logistics manifests and generate official delivery papers.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsSuratJalanOpen(true)}
                      className="btn-crema px-4 py-2 text-xs font-semibold rounded-full"
                    >
                      Open Surat Jalan Manager
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {suratJalans.map((sj) => (
                      <div
                        key={sj.id}
                        onClick={() => setIsSuratJalanOpen(true)}
                        className="glass-card rounded-2xl p-4 cursor-pointer hover:border-[#e07a48]/60 transition-colors"
                      >
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-mono font-bold text-[#e07a48]">{sj.number}</span>
                          <span className="font-mono text-[#8c7b6f]">{sj.date}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#f5ece5]">{sj.destination}</h4>
                        <p className="text-xs text-[#8c7b6f] mt-1">
                          Driver: {sj.driverName} ({sj.vehiclePlate})
                        </p>
                        <div className="mt-2 pt-2 border-t border-[#31251e] text-[11px] text-[#8c7b6f]">
                          {sj.items.length} item types dispatched
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'transactions' && (
                <AdminConsole
                  greenBeans={greenBeans}
                  roastedBeans={roastedBeans}
                  packaging={packaging}
                  transactions={transactions}
                  currentUser={currentUser}
                />
              )}

              {activeTab === 'executive_admin' && (
                <AdminConsole
                  greenBeans={greenBeans}
                  roastedBeans={roastedBeans}
                  packaging={packaging}
                  transactions={transactions}
                  currentUser={currentUser}
                />
              )}
            </main>
          </div>
        </div>
      ) : (
        /* ================= MOBILE STAFF APP TOUCH VIEW ================= */
        <div className="flex-1 h-screen flex flex-col w-full bg-[#14100e] overflow-hidden">
          <Header
            currentUser={currentUser}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenStockMovement={() => {
              setStockMovementPrefill(null);
              setIsStockMovementOpen(true);
            }}
            onOpenQRScanner={() => setIsQRScannerOpen(true)}
            onOpenCreateRoastRequest={() => {
              setCreateRequestPrefillBeanId(undefined);
              setIsCreateRequestOpen(true);
            }}
            onOpenLogRoastBatch={() => {
              setRoastBatchPrefill({});
              setIsRoastBatchOpen(true);
            }}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onSignOut={handleSignOut}
            lowStockCount={lowStockCount}
            pendingRequestsCount={pendingRequestsCount}
            isFirebaseLive={isFirebaseLive}
          />
          <div className="flex-1 h-full flex flex-col max-w-md mx-auto w-full bg-[#14100e] pb-24 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-950">
            {/* Mobile Header Banner */}
            <div className="p-4 border-b border-[#31251e] bg-[#1a1410]/95 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#e07a48] block">
                    BDS ROASTERY MOBILE · FIRESTORE LIVE
                  </span>
                  <h1 className="text-base font-bold text-[#f5ece5]">
                    {currentUser.name}
                  </h1>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#271d18] text-[#c4b5a9] border border-[#3b2d24]">
                  {currentUser.role === 'head_roaster'
                    ? 'Head Roaster'
                    : currentUser.role === 'admin' || currentUser.role === 'executive_admin'
                    ? 'Admin'
                    : 'Staff'}
                </span>
              </div>

              {/* Big Touch Action Cards */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setIsQRScannerOpen(true)}
                  className="flex items-center gap-2 p-3 bg-[#e07a48]/15 border border-[#e07a48]/30 rounded-2xl text-left active:scale-98 transition-all cursor-pointer"
                >
                  <QrCode className="w-5 h-5 text-[#e07a48] shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-[#e07a48] block">Scan QR</span>
                    <span className="text-[10px] text-[#8c7b6f]">Bag & Silo</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setStockMovementPrefill(null);
                    setIsStockMovementOpen(true);
                  }}
                  className="flex items-center gap-2 p-3 bg-sky-600/15 border border-sky-500/30 rounded-2xl text-left active:scale-98 transition-all cursor-pointer"
                >
                  <ArrowUpDown className="w-5 h-5 text-sky-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-sky-300 block">Stock In/Out</span>
                    <span className="text-[10px] text-[#8c7b6f]">Quick Log</span>
                  </div>
                </button>

                {currentUser.role === 'head_roaster' ? (
                  <button
                    onClick={() => {
                      setRoastBatchPrefill({});
                      setIsRoastBatchOpen(true);
                    }}
                    className="col-span-2 btn-crema flex items-center justify-center gap-2 p-3 text-white font-bold text-xs rounded-2xl cursor-pointer"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Log Roast Batch (Weight Loss & Degas)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setCreateRequestPrefillBeanId(undefined);
                      setIsCreateRequestOpen(true);
                    }}
                    className="col-span-2 btn-crema flex items-center justify-center gap-2 p-3 text-white font-bold text-xs rounded-2xl cursor-pointer"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Create Roast Request</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Content Area */}
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                {(['overview', 'pipeline', 'green_beans', 'roasted_beans', 'packaging'] as const).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap cursor-pointer transition-colors ${
                        activeTab === tab
                          ? 'bg-[#e07a48] text-white font-bold shadow-sm'
                          : 'bg-[#221a15] text-[#8c7b6f] hover:text-[#f5ece5]'
                      }`}
                    >
                      {tab === 'overview'
                        ? 'Overview'
                        : tab === 'pipeline'
                        ? 'Roast Board'
                        : tab === 'green_beans'
                        ? 'Green Coffee'
                        : tab === 'roasted_beans'
                        ? 'Roasted'
                        : 'Packaging'}
                    </button>
                  )
                )}
              </div>

              {activeTab === 'pipeline' && (
                <RoastPipelineBoard
                  roastRequests={roastRequests}
                  roastedBeans={roastedBeans}
                  greenBeans={greenBeans}
                  currentUser={currentUser}
                  onOpenRoastModalWithRequest={(req) => {
                    setRoastBatchPrefill({
                      greenBeanId: req.greenBeanId,
                      targetKg: req.targetRoastedKg,
                    });
                    setIsRoastBatchOpen(true);
                  }}
                  onOpenQRLabel={handleOpenRoastedBeanQR}
                  onUpdateQueueStatus={handleUpdateQueueStatus}
                  onOpenNewRoastModal={() => {
                    setRoastBatchPrefill({});
                    setIsRoastBatchOpen(true);
                  }}
                />
              )}

              {(activeTab === 'green_beans' || activeTab === 'overview') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#d9cdc3]">
                      Green Coffee Silos ({greenBeans.length})
                    </span>
                    <button
                      onClick={() => setIsAddGreenBeanOpen(true)}
                      className="text-xs text-[#e07a48] font-medium"
                    >
                      + Add Lot
                    </button>
                  </div>
                  {greenBeans.map((bean) => (
                    <div
                      key={bean.id}
                      className="glass-card rounded-2xl p-3 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-[#e07a48] font-bold">
                            {bean.lotNumber}
                          </span>
                          <h4 className="text-sm font-bold text-[#f5ece5]">{bean.name}</h4>
                          <span className="text-xs text-[#8c7b6f]">
                            {bean.origin} · {bean.process}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-mono font-bold text-[#f5ece5]">
                            {bean.stockKg.toFixed(1)} kg
                          </span>
                          <span className="text-[10px] text-[#736357] block">
                            Moisture: {bean.moistureContent}%
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#31251e] flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenGreenBeanQR(bean)}
                          className="px-2.5 py-1 text-xs bg-[#241c17] hover:bg-[#31251f] text-[#c4b5a9] rounded-full flex items-center gap-1 border border-[#3d2e24]"
                        >
                          <QrCode className="w-3 h-3 text-[#e07a48]" />
                          <span>QR Label</span>
                        </button>
                        <button
                          onClick={() => {
                            setStockMovementPrefill({
                              category: 'green_bean',
                              id: bean.id,
                              isStockIn: false,
                            });
                            setIsStockMovementOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs bg-[#241c17] hover:bg-[#31251f] text-[#c4b5a9] rounded-full flex items-center gap-1 border border-[#3d2e24]"
                        >
                          <ArrowUpDown className="w-3 h-3 text-sky-400" />
                          <span>Stock</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'roasted_beans' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#d9cdc3]">
                      Roasted Batches ({roastedBeans.length})
                    </span>
                    <button
                      onClick={() => {
                        setRoastBatchPrefill({});
                        setIsRoastBatchOpen(true);
                      }}
                      className="text-xs text-[#e07a48] font-medium"
                    >
                      + Log Batch
                    </button>
                  </div>
                  {roastedBeans.map((batch) => {
                    const badge = getRestingBadge(batch.roastDate);
                    return (
                      <div
                        key={batch.id}
                        className="glass-card rounded-2xl p-3 flex flex-col gap-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono text-[#e07a48] font-bold">
                              {batch.batchNumber || batch.batchNo}
                            </span>
                            <h4 className="text-sm font-bold text-[#f5ece5]">
                              {batch.beanName}
                            </h4>
                            <span className="text-xs text-[#8c7b6f]">
                              {batch.roastLevel} · {batch.roasterMachine}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-mono font-bold text-[#e07a48]">
                              {(batch.stockKg ?? batch.availableKg ?? 0).toFixed(2)} kg
                            </span>
                            <span className="text-[10px] text-[#736357] block font-mono">
                              Loss: {batch.weightLossPercentage || batch.weightLossPercent}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                              badge.days <= 5
                                ? 'text-amber-300 border-amber-700/60 bg-amber-950/40'
                                : 'text-emerald-300 border-emerald-700/60 bg-emerald-950/40'
                            }`}
                          >
                            {badge.statusText}
                          </span>
                          <button
                            onClick={() => handleOpenRoastedBeanQR(batch)}
                            className="px-2.5 py-1 text-xs bg-[#e07a48]/20 text-[#e07a48] border border-[#e07a48]/30 rounded-full flex items-center gap-1"
                          >
                            <QrCode className="w-3 h-3" />
                            <span>Sticker</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'packaging' && (
                <PackagingTable
                  packagingItems={packaging}
                  currentUser={currentUser}
                  searchQuery={searchQuery}
                  onStockChange={(item, delta) => {
                    localDbFallback.updatePackagingStock(
                      item.id,
                      delta,
                      delta > 0 ? 'Stock Replenishment Intake' : 'Packaging & Bar Use',
                      currentUser.name
                    );
                    showToast(`${item.name} stock updated`);
                  }}
                />
              )}
            </div>

            {/* Mobile Bottom Touch Navigation */}
            <BottomNav
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              onOpenQRScanner={() => setIsQRScannerOpen(true)}
              onOpenStockMovement={() => {
                setStockMovementPrefill(null);
                setIsStockMovementOpen(true);
              }}
              roastQueueCount={pendingRequestsCount}
            />
          </div>
        </div>
      )}

      {/* ================= TOAST NOTIFICATION ================= */}
      {toastMessage && (
        <div className="fixed bottom-16 right-4 sm:bottom-6 sm:right-6 z-50 bg-[#1e1713]/95 border border-[#e07a48]/60 text-[#f5ece5] px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs backdrop-blur-md animate-in slide-in-from-bottom duration-200">
          <Sparkles className="w-4 h-4 text-[#e07a48]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= ALL MODALS ================= */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      <RoastBatchModal
        isOpen={isRoastBatchOpen}
        onClose={() => setIsRoastBatchOpen(false)}
        greenBeans={greenBeans}
        initialGreenBeanId={roastBatchPrefill.greenBeanId}
        initialTargetKg={roastBatchPrefill.targetKg}
        currentUser={currentUser}
        onSubmit={handleCreateRoastBatch}
      />

      <StockMovementModal
        isOpen={isStockMovementOpen}
        onClose={() => setIsStockMovementOpen(false)}
        currentUser={currentUser}
        greenBeans={greenBeans}
        roastedBeans={roastedBeans}
        packaging={packaging}
        preselected={stockMovementPrefill}
        onSubmit={handleStockMovementSubmit}
      />

      <CreateRoastRequestModal
        isOpen={isCreateRequestOpen}
        onClose={() => setIsCreateRequestOpen(false)}
        greenBeans={greenBeans}
        preselectedBeanId={createRequestPrefillBeanId}
        currentUser={currentUser}
        onSubmit={handleCreateRoastRequest}
      />

      {qrLabelData && (
        <QRLabelModal
          isOpen={isQRLabelOpen}
          onClose={() => setIsQRLabelOpen(false)}
          title={qrLabelData.title}
          code={qrLabelData.code}
          beanName={qrLabelData.beanName}
          origin={qrLabelData.origin}
          processOrLevel={qrLabelData.processOrLevel}
          dateLabel={qrLabelData.dateLabel}
          dateValue={qrLabelData.dateValue}
          weight={qrLabelData.weight}
          notes={qrLabelData.notes}
          rawPayload={qrLabelData.rawPayload}
        />
      )}

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        greenBeans={greenBeans}
        roastedBeans={roastedBeans}
        onSelectScannedItem={(item) => {
          if (item.type === 'roasted') {
            handleOpenRoastedBeanQR(item.data as RoastedBean);
          } else {
            handleOpenGreenBeanQR(item.data as GreenBean);
          }
        }}
      />

      <SuratJalanModal
        isOpen={isSuratJalanOpen}
        onClose={() => setIsSuratJalanOpen(false)}
        suratJalans={suratJalans}
        roastedBeans={roastedBeans}
        packaging={packaging}
        currentUser={currentUser}
        onCreateNew={(data) => {
          const newDoc = localDbFallback.createSuratJalan(data);
          showToast(`Surat Jalan ${newDoc.number} created and dispatched!`);
        }}
      />

      <AddGreenBeanModal
        isOpen={isAddGreenBeanOpen}
        onClose={() => setIsAddGreenBeanOpen(false)}
        onSubmit={handleAddGreenBean}
      />
    </div>
  );
}
