"use client";

import React, { useEffect, useState } from "react";
import {
  Package, Users, Shield, Truck, BarChart3, LogOut,
  PackageCheck, AlertTriangle, Clock, DollarSign,
  ArrowUpRight, ArrowDownRight, MapPin, ChevronRight,
  Bell, Search, Filter, Plus, Eye, CheckCircle2,
  XCircle, RefreshCw, Warehouse, Calendar, FileText,
  TrendingUp, Box, RotateCcw
} from "lucide-react";
import ClientsPanel from "@/src/app/admin/components/client";
import Dash from "@/src/app/admin/components/dashboard";

// ─── Types ───────────────────────────────────────────────────────────────────
type NavItem = { label: string; icon: React.ElementType; id: string };
type StatCard = { title: string; value: string | number; change: string; up: boolean; icon: React.ElementType; color: string };
type ShipmentRow = { id: string; client: string; event: string; shipDate: string; returnDate: string; status: "Confirmed" | "Pending" | "In Transit" | "Returned" | "Overdue"; items: number; fee: string };
type InventoryRow = { sku: string; name: string; qty: number; bin: string; location: string; condition: "Good" | "Damaged" | "Missing"; lastPulled: string };
type ActivityRow = { id: number; user: string; action: string; time: string; type: "intake" | "pull" | "return" | "request" };

// ─── Static Data ─────────────────────────────────────────────────────────────
const NAV: NavItem[] = [
  { label: "Dashboard", icon: BarChart3, id: "dashboard" },
  { label: "Inventory", icon: Package, id: "inventory" },
  { label: "Shipments", icon: Truck, id: "shipments" },
  { label: "Clients", icon: Users, id: "clients" },
  { label: "Returns", icon: RotateCcw, id: "returns" },
  { label: "Reports", icon: FileText, id: "reports" },
];

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
  Confirmed:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Pending:    "bg-amber-50  text-amber-700  border border-amber-200",
  "In Transit":"bg-blue-50  text-blue-700  border border-blue-200",
  Returned:   "bg-slate-100 text-slate-600  border border-slate-200",
  Overdue:    "bg-red-50    text-red-700    border border-red-200",
};

const conditionStyles: Record<InventoryRow["condition"], string> = {
  Good:    "bg-emerald-50 text-emerald-700",
  Damaged: "bg-amber-50  text-amber-700",
  Missing: "bg-red-50    text-red-700",
};

const activityIcon: Record<ActivityRow["type"], { icon: React.ElementType; color: string }> = {
  request: { icon: FileText,    color: "text-blue-500  bg-blue-50" },
  intake:  { icon: PackageCheck,color: "text-emerald-500 bg-emerald-50" },
  pull:    { icon: Truck,        color: "text-violet-500 bg-violet-50" },
  return:  { icon: RotateCcw,    color: "text-amber-500 bg-amber-50" },
};

const colorMap: Record<string, string> = {
  blue:    "bg-blue-50   text-blue-600   border-blue-100",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  amber:   "bg-amber-50  text-amber-600  border-amber-100",
  violet:  "bg-violet-50 text-violet-600 border-violet-100",
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const handleLogout = async () => {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include", // cookie send کرنے کیلئے
    });

    window.location.href = "/auth/login";
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

  const filteredShipments = SHIPMENTS.filter(s =>
    s.client.toLowerCase().includes(search.toLowerCase()) ||
    s.event.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Dynamic Content Renderer ──────────────────────────────────────────────
  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return <Dash />;
      case "clients":
        return <ClientsPanel />;
      case "inventory":
        return (
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
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold ${conditionStyles[row.condition]}">
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
        //   uiiu
        );
      default:
        return (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500">
            {NAV.find(n => n.id === activeNav)?.label} Content Under Development
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside className="w-60 bg-slate-900 text-white flex flex-col justify-between fixed h-full z-20">
        {/* Logo */}
        <div>
          <div className="px-5 py-5 border-b border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Package className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">CB Core</p>
              <p className="text-[10px] text-slate-400">Admin Control Center</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="px-3 py-4 space-y-0.5">
            {NAV.map(({ label, icon: Icon, id }) => (
              <button
                key={id}
                onClick={() => setActiveNav(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeNav === id
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>

          {/* Locations quick ref */}
          <div className="mx-3 mt-4 p-3 bg-slate-800 rounded-xl border border-slate-700">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Warehouse Locations</p>
            <div className="space-y-2">
              <div className="flex gap-2 items-start">
                <MapPin className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-300 leading-relaxed">1019 W Dallas St, Units 3048–3059, Houston TX 77019</p>
              </div>
              <div className="flex gap-2 items-start">
                <MapPin className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-300 leading-relaxed">9894 Bissonnet St, Ste 908, Houston TX 77036</p>
              </div>
            </div>
          </div>
        </div>

        {/* User + Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || "Admin User"}</p>
              <p className="text-[10px] text-slate-400">{user?.role || "ADMIN"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-xs text-red-400 hover:text-red-300 py-2 rounded-lg hover:bg-slate-800 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <main className="flex-1 ml-60 min-h-screen">

        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {NAV.find(n => n.id === activeNav)?.label ?? "Dashboard"}
            </h2>
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
        </header>

        {/* Dynamic Main Body Content */}
        <div className="p-8 space-y-8">
          {renderContent()}
        </div>

      </main>
    </div>
  );
}