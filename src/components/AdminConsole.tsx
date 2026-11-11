import React, { useState } from 'react';
import {
  GreenBean,
  RoastedBean,
  PackagingItem,
  InventoryTransaction,
  UserProfile,
} from '../types';
import { DEMO_USERS } from '../services/mockData';
import {
  TrendingUp,
  AlertTriangle,
  Users,
  History,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

interface AdminConsoleProps {
  greenBeans: GreenBean[];
  roastedBeans: RoastedBean[];
  packaging: PackagingItem[];
  transactions: InventoryTransaction[];
  currentUser: UserProfile;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  greenBeans,
  roastedBeans,
  packaging,
  transactions,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'valuation' | 'audit_log' | 'users'>('valuation');
  const [logFilter, setLogFilter] = useState<string>('all');

  // Calculations
  const greenBeanValuation = greenBeans.reduce(
    (acc, item) => acc + item.stockKg * item.costPerKg,
    0
  );
  const roastedValuation = roastedBeans.reduce(
    (acc, item) => acc + item.stockKg * 260000,
    0
  );
  const packagingValuation = packaging.reduce(
    (acc, item) => acc + item.currentStock * item.costPerUnit,
    0
  );
  const totalValuation = greenBeanValuation + roastedValuation + packagingValuation;

  // Stock alert items
  const lowGreenBeans = greenBeans.filter((b) => b.stockKg <= b.minThresholdKg);
  const lowPackaging = packaging.filter((p) => p.currentStock <= p.minThreshold);

  // Filtered transactions
  const filteredLogs = transactions.filter((t) => {
    if (logFilter === 'all') return true;
    return t.type === logFilter;
  });

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#f5ece5] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Executive Admin & Financial Valuation Console
          </h2>
          <p className="text-xs text-[#a69588]">
            Real-time warehouse valuation, audit trial compliance, and staff RBAC permissions.
          </p>
        </div>

        {/* Tab Switcher in rounded-full pill */}
        <div className="inline-flex items-center bg-[#1f1713] border border-[#382b22] rounded-full p-1">
          <button
            onClick={() => setActiveTab('valuation')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
              activeTab === 'valuation'
                ? 'bg-[#3b2e25] text-[#f5ece5] font-bold shadow-sm'
                : 'text-[#8c7b6f] hover:text-[#f5ece5]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Valuation & Alerts</span>
          </button>
          <button
            onClick={() => setActiveTab('audit_log')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
              activeTab === 'audit_log'
                ? 'bg-[#3b2e25] text-[#f5ece5] font-bold shadow-sm'
                : 'text-[#8c7b6f] hover:text-[#f5ece5]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Ledger</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#3b2e25] text-[#f5ece5] font-bold shadow-sm'
                : 'text-[#8c7b6f] hover:text-[#f5ece5]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff RBAC</span>
          </button>
        </div>
      </div>

      {activeTab === 'valuation' && (
        <div className="space-y-6">
          {/* Top Level Valuation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="glass-card rounded-2xl p-4">
              <span className="text-xs text-[#a69588] block font-medium">
                Total Warehouse Valuation
              </span>
              <div className="mt-2 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                Rp {Math.round(totalValuation).toLocaleString('id-ID')}
              </div>
              <span className="text-[11px] text-[#736357] mt-1 block">
                Green + roasted + packaging
              </span>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <span className="text-xs text-[#a69588] block font-medium">
                Green Coffee Capital
              </span>
              <div className="mt-2 text-xl font-bold font-mono text-[#f5ece5] tabular-nums">
                Rp {Math.round(greenBeanValuation).toLocaleString('id-ID')}
              </div>
              <span className="text-[11px] text-[#8c7b6f] mt-1 block font-mono">
                {greenBeans.reduce((a, b) => a + b.stockKg, 0).toFixed(1)} kg raw stock
              </span>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <span className="text-xs text-[#a69588] block font-medium">
                Roasted Inventory Value
              </span>
              <div className="mt-2 text-xl font-bold font-mono text-[#e07a48] tabular-nums">
                Rp {Math.round(roastedValuation).toLocaleString('id-ID')}
              </div>
              <span className="text-[11px] text-[#8c7b6f] mt-1 block font-mono">
                {roastedBeans.reduce((a, b) => a + b.stockKg, 0).toFixed(2)} kg ready/degassing
              </span>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <span className="text-xs text-[#a69588] block font-medium">
                Packaging Supplies
              </span>
              <div className="mt-2 text-xl font-bold font-mono text-sky-400 tabular-nums">
                Rp {Math.round(packagingValuation).toLocaleString('id-ID')}
              </div>
              <span className="text-[11px] text-[#8c7b6f] mt-1 block">
                {packaging.length} active SKUs
              </span>
            </div>
          </div>

          {/* Low Stock Threshold Alerts Section */}
          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#f5ece5] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Active Stock Alerts (&lt; 10% Safety Threshold Warnings)
              </h3>
              <span className="text-xs font-mono text-rose-400 font-semibold">
                {lowGreenBeans.length + lowPackaging.length} items requiring replenishment
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lowGreenBeans.map((bean) => (
                <div
                  key={bean.id}
                  className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/40 flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-[10px] text-[#e07a48] font-bold">
                      {bean.lotNumber}
                    </span>
                    <h4 className="text-xs font-bold text-[#f5ece5]">{bean.name}</h4>
                    <span className="text-[11px] text-rose-300 font-mono">
                      Current: {bean.stockKg.toFixed(1)}kg (Min: {bean.minThresholdKg}kg)
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      alert(`Purchase order draft sent to supplier ${bean.supplier}`)
                    }
                    className="px-3 py-1 text-xs bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-full transition-colors cursor-pointer"
                  >
                    Generate PO
                  </button>
                </div>
              ))}

              {lowPackaging.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-[10px] text-[#e07a48] font-bold">
                      {item.sku}
                    </span>
                    <h4 className="text-xs font-bold text-[#f5ece5]">{item.name}</h4>
                    <span className="text-[11px] text-amber-300 font-mono">
                      Stock: {item.currentStock} {item.unit} (Min: {item.minThreshold} {item.unit})
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      alert(`Re-order notification triggered for ${item.supplier}`)
                    }
                    className="btn-crema px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer"
                  >
                    Re-Order
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit_log' && (
        <div className="glass-panel rounded-2xl overflow-hidden shadow-sm space-y-3 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#f5ece5]">
                Immutable Inventory Transaction Ledger
              </h3>
              <p className="text-xs text-[#a69588]">
                Audited stock changes, roast completions, barista dispatch orders, and QC waste.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="inline-flex items-center bg-[#1f1713] border border-[#382b22] rounded-full p-1 text-xs">
              {['all', 'stock_in', 'stock_out', 'roast_in', 'roast_out'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setLogFilter(mode)}
                  className={`px-3 py-1 rounded-full capitalize transition-colors ${
                    logFilter === mode
                      ? 'bg-[#3b2e25] text-[#f5ece5] font-bold shadow-sm'
                      : 'text-[#8c7b6f] hover:text-[#f5ece5]'
                  }`}
                >
                  {mode.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181310] text-[#8c7b6f] font-medium border-b border-[#31251e]">
                <tr>
                  <th className="py-2.5 px-3 font-mono">Timestamp</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-right">Delta Qty</th>
                  <th className="py-2.5 px-3">Performed By</th>
                  <th className="py-2.5 px-3">Operational Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d221b] font-sans">
                {filteredLogs.map((tx) => {
                  const qty = tx.quantityChange ?? tx.changeKg ?? 0;
                  const isPositive = qty > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-[#281f18]/60">
                      <td className="py-2.5 px-3 font-mono text-[#8c7b6f] text-[11px] whitespace-nowrap">
                        {tx.timestamp}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            tx.type === 'stock_in' || tx.type === 'roast_in' || tx.type === 'IN'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                              : 'bg-sky-950 text-sky-400 border border-sky-800/50'
                          }`}
                        >
                          {String(tx.type).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#f5ece5]">{tx.itemName}</span>
                          {tx.batchOrLotNumber && (
                            <span className="font-mono text-[10px] text-[#8c7b6f]">
                              Ref: {tx.batchOrLotNumber}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`font-mono font-bold text-sm tabular-nums ${
                            isPositive ? 'text-emerald-400' : 'text-[#f5ece5]'
                          }`}
                        >
                          {isPositive ? `+${qty}` : qty} {tx.unit || 'kg'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#e8ded6]">
                        {tx.performedBy || tx.handler || 'Staff'}
                      </td>
                      <td className="py-2.5 px-3 text-[#a69588] text-[11px]">
                        {tx.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass-panel rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#f5ece5]">
              Role-Based Access Control (RBAC) & Team Profiles
            </h3>
            <p className="text-xs text-[#a69588]">
              Configure fine-grained permissions for warehouse officers, roasters, and finance admins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEMO_USERS.map((usr) => (
              <div
                key={usr.id}
                className="glass-card rounded-2xl p-4 flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-full bg-[#3d2c22] border border-[#5a4233] text-[#e07a48] font-bold flex items-center justify-center text-sm shrink-0">
                  {usr.avatarInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#f5ece5]">{usr.name}</h4>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full uppercase bg-[#241c17] text-[#e07a48] border border-[#3b2d24]">
                      {usr.role.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[#a69588] mt-0.5">{usr.title}</p>
                  <p className="text-[11px] font-mono text-[#736357] mt-0.5">{usr.email}</p>

                  <div className="mt-3 pt-2 border-t border-[#31251e] text-[11px] text-[#a69588] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#e8ded6]">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>
                        {usr.role === 'head_roaster'
                          ? 'Full Roast Queue & Roaster Calibration controls'
                          : usr.role === 'executive_admin'
                          ? 'Full Financial Valuation & Global Audit logs'
                          : 'Warehouse Stock In/Out & Surat Jalan creation'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
