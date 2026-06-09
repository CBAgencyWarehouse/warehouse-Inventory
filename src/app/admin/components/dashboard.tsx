"use client";

import React, { useEffect, useState } from "react";
import {
  Package, Truck, Clock, DollarSign, ArrowUpRight, 
  AlertTriangle, MapPin, ChevronRight, RefreshCw, 
  Box, RotateCcw, FileText, Plus, Eye
} from "lucide-react";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function AdminDashboardContent({ onNavigate }: DashboardProps) {
  const [localSearch, setLocalSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalItems: 0,
    activeShipments: 0,
    pendingRequests: 0,
    monthlyRevenue: "$0",
  });
  const [shipments, setShipments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/users/dashboard/admin-data", { 
          method: "GET",
          credentials: "include"
        });
        
        const json = await res.json();
        
        if (json.success && json.data) {
          setStats(json.data.stats);
          setShipments(json.data.shipments || []);
          setActivities(json.data.activities || []);
          setInventory(json.data.inventory || []);
        }
      } catch (err) {
        console.error("Failed to sync warehouse data matrices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ─── 🔒 FIXED SEARCH FILTER (SAFE FROM NUMBERS & NULLS) ───
  const filteredShipments = shipments.filter(s => {
    const query = localSearch.toLowerCase();
    
    // orderNumber को सुरक्षित रूप से String में कन्वर्ट करके चेक कर रहे हैं
    const orderNumStr = s.orderNumber !== undefined && s.orderNumber !== null ? String(s.orderNumber) : "";
    const clientStr = s.client || "";
    const eventStr = s.event || "";

    return (
      orderNumStr.toLowerCase().includes(query) ||
      clientStr.toLowerCase().includes(query) ||
      eventStr.toLowerCase().includes(query)
    );
  });

  const statusStyles: Record<string, string> = {
    APPROVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
    DISPATCHED: "bg-blue-50 text-blue-700 border border-blue-200",
    DELIVERED: "bg-slate-100 text-slate-600 border border-slate-200",
    CANCELLED: "bg-red-50 text-red-700 border border-red-200",
  };

  const activityIcon: Record<string, { icon: React.ElementType; color: string }> = {
    request: { icon: FileText, color: "text-blue-500 bg-blue-50" },
    intake: { icon: Box, color: "text-emerald-500 bg-emerald-50" },
    pull: { icon: Truck, color: "text-violet-500 bg-violet-50" },
    return: { icon: RotateCcw, color: "text-amber-500 bg-amber-50" },
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <RefreshCw className="h-8 w-8 animate-spin text-slate-700" />
        <p className="text-xs font-bold tracking-wider text-slate-400 uppercase animate-pulse">
          Syncing Prisma Ledger Data...
        </p>
      </div>
    );
  }

  return (
    <div className="font-sans space-y-8">
      
      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: "Total Inventory Items", value: stats.totalItems, change: "Live stock count", up: true, icon: Box, bg: "bg-blue-50 text-blue-600 border-blue-100" },
          { title: "Active Shipments", value: stats.activeShipments, change: "In active transit", up: true, icon: Truck, bg: "bg-emerald-50 text-emerald-600 border-emerald-100" },
          { title: "Pending Requests", value: stats.pendingRequests, change: "Requires review", up: false, icon: Clock, bg: "bg-amber-50 text-amber-600 border-amber-100" },
          { title: "Monthly Revenue", value: stats.monthlyRevenue, change: "+8.2% vs last month", up: true, icon: DollarSign, bg: "bg-violet-50 text-violet-600 border-violet-100" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-slate-500">{s.title}</p>
                <div className={`p-2 rounded-lg border ${s.bg}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
              </p>
              <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-medium ${s.up ? "text-emerald-600" : "text-amber-600"}`}>
                {s.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {s.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── RUSH NOTICE ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-800">2-Week Advance Rule Active</p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            All shipping requests must be submitted <strong>at least 14 days</strong> before ship-out.
            Rush fee: <strong className="text-amber-900">+$50</strong> (under 2 weeks) · Super rush: <strong className="text-amber-900">+$100</strong> (1–3 days notice).
          </p>
        </div>
      </div>

      {/* ── GRID SECTION: ACTIVE SHIPMENTS + ACTIVITIES ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Active Shipments Table Card */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-800">Active Shipments Queue</h3>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Filter grid..."
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 w-36 text-slate-900"
              />
              <button onClick={() => onNavigate("shipments")} className="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-all font-semibold">
                <Plus className="h-3 w-3" /> New Request
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-400 bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 font-semibold">Order ID / Client</th>
                  <th className="px-3 py-3 font-semibold">Target Event</th>
                  <th className="px-3 py-3 font-semibold">Ship Date</th>
                  <th className="px-3 py-3 font-semibold">Total Items</th>
                  <th className="px-3 py-3 font-semibold">Status Matrix</th>
                  <th className="px-3 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">No active shipments matching parameters.</td>
                  </tr>
                ) : (
                  filteredShipments.map(row => (
                    <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-all">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-800">#{row.orderNumber || (row.id && row.id.substring(0, 8)) || "N/A"}</p>
                        <p className="text-slate-400 text-[10px] mt-0.5 font-medium">{row.client}</p>
                      </td>
                      <td className="px-3 py-3.5 text-slate-700 font-semibold truncate max-w-[165px]">{row.event}</td>
                      <td className="px-3 py-3.5 text-slate-500 font-medium">
                        {row.shipDate ? new Date(row.shipDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-3 py-3.5 text-slate-800 font-bold">{row.itemsCount}</td>
                      <td className="px-3 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${statusStyles[row.status] || "bg-gray-100 text-gray-700"}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <button onClick={() => onNavigate("shipments")} className="text-slate-400 hover:text-blue-600 transition-colors">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800">Operational Logs</h3>
          </div>
          <div className="p-3 space-y-1 flex-1 overflow-y-auto max-h-[350px]">
            {activities.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-8 font-medium">No ledger movements logs available.</p>
            ) : (
              activities.map((a, i) => {
                const config = activityIcon[a.type] || { icon: FileText, color: "text-gray-500 bg-gray-50" };
                const AIcon = config.icon;
                return (
                  <div key={a.id || i} className="flex gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all">
                    <div className={`p-1.5 rounded-lg shrink-0 h-8 w-8 flex items-center justify-center ${config.color}`}>
                      <AIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                     <p className="text-xs font-bold text-slate-700 leading-snug">
  {a.action || "No action"}
</p>

<p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
  {a.user || "System"}
</p>

<p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
  {a.time || "N/A"}
</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* ── LIVE INVENTORY LEDGER CARD ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800">Current Inventory Snapshot</h3>
            <span className="ml-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold">
              {inventory.length} SKUs Listed
            </span>
          </div>
          <button onClick={() => onNavigate("inventory")} className="flex items-center gap-1.5 text-xs text-white bg-slate-800 hover:bg-slate-900 px-3 py-1.5 rounded-lg transition-all font-semibold">
            <Plus className="h-3 w-3" /> Managed Ledger
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-400 bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 font-semibold">SKU Code</th>
                <th className="px-3 py-3 font-semibold">Asset Name</th>
                <th className="px-3 py-3 font-semibold">Available Qty</th>
                <th className="px-3 py-3 font-semibold">Bin Location</th>
                <th className="px-3 py-3 font-semibold">Warehouse Facility</th>
                <th className="px-3 py-3 font-semibold">Last Synced</th>
                <th className="px-3 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">Inventory Matrix Empty. Log intake first.</td>
                </tr>
              ) : (
                inventory.map(row => (
                  <tr key={row.sku} className="border-b border-slate-50 hover:bg-slate-50/60 transition-all">
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-600 uppercase">{row.sku}</td>
                    <td className="px-3 py-3.5 font-semibold text-slate-800">{row.name}</td>
                    <td className={`px-3 py-3.5 font-bold ${row.qty === 0 ? "text-red-500" : "text-slate-800"}`}>
                      {row.qty === 0 ? "Out of Stock" : row.qty}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded font-mono text-[10px] font-semibold">{row.bin}</span>
                    </td>
                    <td className="px-3 py-3.5 text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-blue-400 shrink-0" />
                        <span>{row.location}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-slate-400 font-medium">
                      {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-3 py-3.5">
                      <button onClick={() => onNavigate("inventory")} className="text-slate-400 hover:text-blue-600 transition-colors">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── REFERENCE PRICING MATRIX ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <DollarSign className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-800">Logistics Cost Reference Sheet</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: "Round-Trip Fee", amount: "$170", note: "Per event — standard" },
            { label: "Extra Labor", amount: "$85/hr", note: "If pulling exceeds 2 hrs" },
            { label: "Rush Request", amount: "+$50", note: "Notice under 14 days" },
            { label: "Super Rush", amount: "+$100", note: "1–3 days window notice" },
            { label: "Dedicated Freight", amount: "Custom", note: "Quoted per box truck scale" },
          ].map((p, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-lg font-bold text-slate-900">{p.amount}</p>
              <p className="text-xs font-bold text-slate-700 mt-1">{p.label}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{p.note}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}