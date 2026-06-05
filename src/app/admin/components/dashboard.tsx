"use client";

import React, { useState } from "react";
import {
  Package, Truck, Clock, DollarSign, ArrowUpRight, 
  AlertTriangle, ArrowDownRight, MapPin, ChevronRight, 
  Bell, Search, Filter, Plus, Eye, RefreshCw, Box, RotateCcw, FileText
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type StatCard = { title: string; value: string | number; change: string; up: boolean; icon: React.ElementType; color: string };
type ShipmentRow = { id: string; client: string; event: string; shipDate: string; returnDate: string; status: "Confirmed" | "Pending" | "In Transit" | "Returned" | "Overdue"; items: number; fee: string };
type InventoryRow = { sku: string; name: string; qty: number; bin: string; location: string; condition: "Good" | "Damaged" | "Missing"; lastPulled: string };
type ActivityRow = { id: number; user: string; action: string; time: string; type: "intake" | "pull" | "return" | "request" };

// ─── Static Data ─────────────────────────────────────────────────────────────
const STATS: StatCard[] = [
  { title: "Total Inventory Items", value: 980, change: "+12 this week", up: true, icon: Box, color: "blue" },
  { title: "Active Shipments", value: 45, change: "+3 since yesterday", up: true, icon: Truck, color: "emerald" },
  { title: "Pending Requests", value: 8, change: "2 require 48hr review", up: false, icon: Clock, color: "amber" },
  { title: "Monthly Revenue", value: "$14,620", change: "+8.2% vs last month", up: true, icon: DollarSign, color: "violet" },
];

const SHIPMENTS: ShipmentRow[] = [
  { id: "SHP-001", client: "Experian – Ali Rahman", event: "Houston Sales Summit", shipDate: "2026-06-10", returnDate: "2026-06-18", status: "Confirmed", items: 14, fee: "$170" },
  { id: "SHP-002", client: "Experian – Sara Malik", event: "Dallas Brand Expo", shipDate: "2026-06-07", returnDate: "2026-06-14", status: "In Transit", items: 6, fee: "$340" },
  { id: "SHP-003", client: "Experian – John Lee", event: "Austin Tech Week", shipDate: "2026-06-15", returnDate: "2026-06-22", status: "Pending", items: 22, fee: "$510" },
  { id: "SHP-004", client: "Experian – Maria Cruz", event: "Miami Finance Forum", shipDate: "2026-05-28", returnDate: "2026-06-04", status: "Returned", items: 9, fee: "$170" },
  { id: "SHP-005", client: "Experian – David Kim", event: "NYC Data Conference", shipDate: "2026-05-20", returnDate: "2026-05-30", status: "Overdue", items: 5, fee: "$220" },
];

const INVENTORY: InventoryRow[] = [
  { sku: "EXP-001", name: "Pop-Up Banner 6ft", qty: 24, bin: "A-12", location: "W Dallas St", condition: "Good", lastPulled: "2026-06-01" },
  { sku: "EXP-002", name: "Branded Table Cloth", qty: 18, bin: "B-04", location: "W Dallas St", condition: "Good", lastPulled: "2026-05-28" },
  { sku: "EXP-003", name: "LED Display Stand", qty: 6, bin: "C-07", location: "W Dallas St", condition: "Good", lastPulled: "2026-06-03" },
  { sku: "EXP-004", name: "Promo Bag (Medium)", qty: 200, bin: "D-02", location: "Bissonnet Office", condition: "Good", lastPulled: "2026-05-15" },
  { sku: "EXP-005", name: "Charging Station Unit", qty: 4, bin: "A-18", location: "W Dallas St", condition: "Damaged", lastPulled: "2026-05-30" },
  { sku: "EXP-006", name: "Backdrop Frame 10x8", qty: 3, bin: "E-01", location: "W Dallas St", condition: "Good", lastPulled: "2026-06-02" },
  { sku: "EXP-007", name: "Literature Holder", qty: 0, bin: "B-11", location: "Bissonnet Office", condition: "Missing", lastPulled: "2026-04-20" },
];

const ACTIVITY: ActivityRow[] = [
  { id: 1, user: "Ali Rahman", action: "Submitted shipping request for Houston Summit", time: "2h ago", type: "request" },
  { id: 2, user: "CB Team", action: "Inventory intake logged: 14 items from Experian batch", time: "4h ago", type: "intake" },
  { id: 3, user: "Sara Malik", action: "Confirmed sales order SHP-002 approved", time: "6h ago", type: "request" },
  { id: 4, user: "CB Team", action: "Return processed: SHP-004 — 9 items verified", time: "1d ago", type: "return" },
  { id: 5, user: "CB Team", action: "Pulled 22 items for Austin Tech Week shipment", time: "1d ago", type: "pull" },
  { id: 6, user: "David Kim", action: "Return overdue: SHP-005 — follow-up required", time: "2d ago", type: "return" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const statusStyles: Record<ShipmentRow["status"], string> = {
  Confirmed:   "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Pending:     "bg-amber-50  text-amber-700  border border-amber-200",
  "In Transit":"bg-blue-50  text-blue-700  border border-blue-200",
  Returned:    "bg-slate-100 text-slate-600  border border-slate-200",
  Overdue:     "bg-red-50    text-red-700    border border-red-200",
};

const conditionStyles: Record<InventoryRow["condition"], string> = {
  Good:    "bg-emerald-50 text-emerald-700",
  Damaged: "bg-amber-50  text-amber-700",
  Missing: "bg-red-50    text-red-700",
};

const activityIcon: Record<ActivityRow["type"], { icon: React.ElementType; color: string }> = {
  request: { icon: FileText,    color: "text-blue-500  bg-blue-50" },
  intake:  { icon: Box,         color: "text-emerald-500 bg-emerald-50" }, // Replaced PackageCheck with Box to prevent unused import issues if needed
  pull:    { icon: Truck,       color: "text-violet-500 bg-violet-50" },
  return:  { icon: RotateCcw,   color: "text-amber-500 bg-amber-50" },
};

const colorMap: Record<string, string> = {
  blue:    "bg-blue-50   text-blue-600   border-blue-100",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  amber:   "bg-amber-50  text-amber-600  border-amber-100",
  violet:  "bg-violet-50 text-violet-600 border-violet-100",
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function AdminDashboardContent() {
  const [search, setSearch] = useState("");

  const filteredShipments = SHIPMENTS.filter(s =>
    s.client.toLowerCase().includes(search.toLowerCase()) ||
    s.event.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      
      {/* ── HEADER (Main Area Header Only) ────────────────────────────────── */}
      {/* <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Dashboard</h2>
          <p className="text-xs text-slate-400">CB Logistics — Experian Account</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search shipments..."
              className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 w-52 text-slate-900 placeholder-slate-400"
            />
          </div>
          <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-all">
            <Bell className="h-4 w-4 text-slate-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header> */}

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div className="p-8 space-y-8">

        {/* ── STATS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-medium text-slate-500">{s.title}</p>
                  <div className={`p-2 rounded-lg border ${colorMap[s.color]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${s.up ? "text-emerald-600" : "text-amber-600"}`}>
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
            <p className="text-sm font-semibold text-amber-800">2-Week Advance Rule Active</p>
            <p className="text-xs text-amber-700 mt-0.5">
              All shipping requests must be submitted <strong>at least 14 days</strong> before ship-out.
              Rush fee: <strong>+$50</strong> (under 2 weeks) · Super rush: <strong>+$100</strong> (1–3 days).
              SHP-002 (Dallas, Jun 7) was submitted within the rush window.
            </p>
          </div>
        </div>

        {/* ── TWO COLUMNS: Shipments + Activity ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Shipments Table */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-800">Active Shipments</h3>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all">
                  <Filter className="h-3 w-3" /> Filter
                </button>
                <button className="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-all">
                  <Plus className="h-3 w-3" /> New Request
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-400 bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3 font-semibold">ID / Client</th>
                    <th className="px-3 py-3 font-semibold">Event</th>
                    <th className="px-3 py-3 font-semibold">Ship Date</th>
                    <th className="px-3 py-3 font-semibold">Return</th>
                    <th className="px-3 py-3 font-semibold">Items</th>
                    <th className="px-3 py-3 font-semibold">Fee</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShipments.map(row => (
                    <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-all">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800">{row.id}</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">{row.client}</p>
                      </td>
                      <td className="px-3 py-3.5 text-slate-700 font-medium">{row.event}</td>
                      <td className="px-3 py-3.5 text-slate-500">{row.shipDate}</td>
                      <td className="px-3 py-3.5 text-slate-500">{row.returnDate}</td>
                      <td className="px-3 py-3.5 text-slate-700 font-medium">{row.items}</td>
                      <td className="px-3 py-3.5 text-slate-700 font-semibold">{row.fee}</td>
                      <td className="px-3 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusStyles[row.status]}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <button className="text-slate-400 hover:text-blue-600 transition-colors">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
            </div>
            <div className="p-3 space-y-1">
              {ACTIVITY.map(a => {
                const { icon: AIcon, color } = activityIcon[a.type];
                return (
                  <div key={a.id} className="flex gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all">
                    <div className={`p-1.5 rounded-lg shrink-0 ${color}`}>
                      <AIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700 leading-snug">{a.user}</p>
                      <p className="text-[10px] text-slate-400 leading-snug mt-0.5">{a.action}</p>
                      <p className="text-[10px] text-slate-300 mt-1">{a.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── INVENTORY TABLE ── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-800">Inventory Ledger</h3>
              <span className="ml-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-semibold">
                {INVENTORY.length} SKUs
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 transition-all">
                <ArrowDownRight className="h-3 w-3" /> Export
              </button>
              <button className="flex items-center gap-1.5 text-xs text-white bg-slate-800 hover:bg-slate-900 px-3 py-1.5 rounded-lg transition-all">
                <Plus className="h-3 w-3" /> Log Intake
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-400 bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 font-semibold">SKU</th>
                  <th className="px-3 py-3 font-semibold">Item Name</th>
                  <th className="px-3 py-3 font-semibold">Qty</th>
                  <th className="px-3 py-3 font-semibold">Bin</th>
                  <th className="px-3 py-3 font-semibold">Location</th>
                  <th className="px-3 py-3 font-semibold">Condition</th>
                  <th className="px-3 py-3 font-semibold">Last Pulled</th>
                  <th className="px-3 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {INVENTORY.map(row => (
                  <tr key={row.sku} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-all ${row.condition !== "Good" ? "bg-red-50/30" : ""}`}>
                    <td className="px-5 py-3.5 font-mono text-slate-500">{row.sku}</td>
                    <td className="px-3 py-3.5 font-semibold text-slate-800">{row.name}</td>
                    <td className={`px-3 py-3.5 font-bold ${row.qty === 0 ? "text-red-500" : "text-slate-800"}`}>
                      {row.qty === 0 ? "—" : row.qty}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded font-mono text-[10px]">{row.bin}</span>
                    </td>
                    <td className="px-3 py-3.5 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className={`h-3 w-3 shrink-0 ${row.location.includes("Dallas") ? "text-blue-400" : "text-emerald-400"}`} />
                        <span className="truncate max-w-[120px]">{row.location}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${conditionStyles[row.condition]}`}>
                        {row.condition}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-slate-400">{row.lastPulled}</td>
                    <td className="px-3 py-3.5">
                      <button className="text-slate-400 hover:text-blue-600 transition-colors">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── PRICING REFERENCE ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <DollarSign className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800">Pricing Reference</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Round-Trip Fee", amount: "$170", note: "Per event — standard" },
              { label: "Extra Time", amount: "$85/hr", note: "If pull >2 hrs" },
              { label: "Rush Fee", amount: "+$50", note: "Under 2 weeks" },
              { label: "Super Rush", amount: "+$100", note: "1–3 days notice" },
              { label: "Freight / Box Truck", amount: "Custom", note: "Quoted separately" },
            ].map((p, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-lg font-bold text-slate-900">{p.amount}</p>
                <p className="text-xs font-semibold text-slate-700 mt-1">{p.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{p.note}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}