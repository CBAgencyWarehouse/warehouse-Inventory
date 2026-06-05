"use client";

import React, { useState } from "react";
import {
  Users, Search, Filter, Plus, ChevronRight, Mail,
  Phone, MapPin, Package, Truck, Clock, CheckCircle2,
  AlertTriangle, MoreHorizontal, ArrowUpRight, X,
  Calendar, DollarSign, RotateCcw, FileText, Eye,
  Building2, Badge
} from "lucide-react";
import AddClient from "./addClient";

// ─── Types ────────────────────────────────────────────────────────────────────
type ClientStatus = "Active" | "Inactive" | "Pending Setup";

type ClientShipment = {
  id: string;
  event: string;
  shipDate: string;
  status: "Confirmed" | "Pending" | "In Transit" | "Returned" | "Overdue";
  items: number;
  fee: string;
};

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: ClientStatus;
  joinDate: string;
  totalShipments: number;
  activeShipments: number;
  totalSpend: string;
  lastActivity: string;
  shipments: ClientShipment[];
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CLIENTS: Client[] = [
  {
    id: "CLT-001",
    name: "Ali Rahman",
    email: "ali.rahman@experian.com",
    phone: "+1 (713) 555-0191",
    company: "Experian",
    status: "Active",
    joinDate: "2025-03-15",
    totalShipments: 8,
    activeShipments: 1,
    totalSpend: "$1,870",
    lastActivity: "2 hours ago",
    shipments: [
      { id: "SHP-001", event: "Houston Sales Summit", shipDate: "2026-06-10", status: "Confirmed", items: 14, fee: "$170" },
      { id: "SHP-007", event: "Spring Brand Activation", shipDate: "2026-03-20", status: "Returned", items: 10, fee: "$170" },
    ],
  },
  {
    id: "CLT-002",
    name: "Sara Malik",
    email: "sara.malik@experian.com",
    phone: "+1 (713) 555-0284",
    company: "Experian",
    status: "Active",
    joinDate: "2025-04-02",
    totalShipments: 5,
    activeShipments: 1,
    totalSpend: "$1,190",
    lastActivity: "6 hours ago",
    shipments: [
      { id: "SHP-002", event: "Dallas Brand Expo", shipDate: "2026-06-07", status: "In Transit", items: 6, fee: "$340" },
      { id: "SHP-009", event: "Houston Tech Forum", shipDate: "2026-04-10", status: "Returned", items: 8, fee: "$170" },
    ],
  },
  {
    id: "CLT-003",
    name: "John Lee",
    email: "john.lee@experian.com",
    phone: "+1 (512) 555-0347",
    company: "Experian",
    status: "Active",
    joinDate: "2025-05-10",
    totalShipments: 3,
    activeShipments: 1,
    totalSpend: "$850",
    lastActivity: "1 day ago",
    shipments: [
      { id: "SHP-003", event: "Austin Tech Week", shipDate: "2026-06-15", status: "Pending", items: 22, fee: "$510" },
    ],
  },
  {
    id: "CLT-004",
    name: "Maria Cruz",
    email: "maria.cruz@experian.com",
    phone: "+1 (305) 555-0412",
    company: "Experian",
    status: "Active",
    joinDate: "2025-02-20",
    totalShipments: 12,
    activeShipments: 0,
    totalSpend: "$3,240",
    lastActivity: "3 days ago",
    shipments: [
      { id: "SHP-004", event: "Miami Finance Forum", shipDate: "2026-05-28", status: "Returned", items: 9, fee: "$170" },
      { id: "SHP-006", event: "Orlando Sales Kickoff", shipDate: "2026-04-05", status: "Returned", items: 15, fee: "$255" },
    ],
  },
  {
    id: "CLT-005",
    name: "David Kim",
    email: "david.kim@experian.com",
    phone: "+1 (212) 555-0563",
    company: "Experian",
    status: "Active",
    joinDate: "2025-06-01",
    totalShipments: 4,
    activeShipments: 1,
    totalSpend: "$960",
    lastActivity: "2 days ago",
    shipments: [
      { id: "SHP-005", event: "NYC Data Conference", shipDate: "2026-05-20", status: "Overdue", items: 5, fee: "$220" },
    ],
  },
  {
    id: "CLT-006",
    name: "Priya Nair",
    email: "priya.nair@experian.com",
    phone: "+1 (415) 555-0672",
    company: "Experian",
    status: "Pending Setup",
    joinDate: "2026-06-01",
    totalShipments: 0,
    activeShipments: 0,
    totalSpend: "$0",
    lastActivity: "Just registered",
    shipments: [],
  },
  {
    id: "CLT-007",
    name: "Tom Nguyen",
    email: "tom.nguyen@experian.com",
    phone: "+1 (214) 555-0783",
    company: "Experian",
    status: "Inactive",
    joinDate: "2025-01-10",
    totalShipments: 2,
    activeShipments: 0,
    totalSpend: "$340",
    lastActivity: "4 months ago",
    shipments: [
      { id: "SHP-010", event: "Dallas Expo 2025", shipDate: "2025-11-15", status: "Returned", items: 7, fee: "$170" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusBadge: Record<ClientStatus, string> = {
  "Active":        "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Inactive":      "bg-slate-100  text-slate-500  border border-slate-200",
  "Pending Setup": "bg-amber-50   text-amber-700  border border-amber-200",
};

const shipmentBadge: Record<ClientShipment["status"], string> = {
  "Confirmed":  "bg-emerald-50 text-emerald-700",
  "Pending":    "bg-amber-50   text-amber-700",
  "In Transit": "bg-blue-50    text-blue-700",
  "Returned":   "bg-slate-100  text-slate-500",
  "Overdue":    "bg-red-50     text-red-700",
};

const initials = (name: string) =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

const avatarColor = (id: string) => {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-teal-100 text-teal-700",
    "bg-indigo-100 text-indigo-700",
  ];
  const idx = parseInt(id.replace("CLT-", ""), 10) % colors.length;
  return colors[idx];
};

// ─── Drawer Component ─────────────────────────────────────────────────────────
function ClientDrawer({ client, onClose }: { client: Client; onClose: () => void }) {
  
  


  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${avatarColor(client.id)}`}>
              {initials(client.name)}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{client.name}</p>
              <p className="text-xs text-slate-400">{client.id} · {client.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusBadge[client.status]}`}>
              {client.status}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Contact Info */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Contact Info</p>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-700">{client.email}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-700">{client.phone}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-700">{client.company}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-700">Joined {client.joinDate}</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
              <p className="text-lg font-bold text-blue-700">{client.totalShipments}</p>
              <p className="text-[10px] text-blue-500 font-medium mt-0.5">Total Shipments</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
              <p className="text-lg font-bold text-emerald-700">{client.activeShipments}</p>
              <p className="text-[10px] text-emerald-500 font-medium mt-0.5">Active Now</p>
            </div>
            <div className="p-3 bg-violet-50 rounded-xl border border-violet-100 text-center">
              <p className="text-lg font-bold text-violet-700">{client.totalSpend}</p>
              <p className="text-[10px] text-violet-500 font-medium mt-0.5">Total Spend</p>
            </div>
          </div>

          {/* Shipment History */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Shipment History</p>
            {client.shipments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Truck className="h-8 w-8 text-slate-200 mb-2" />
                <p className="text-xs text-slate-400">No shipments yet</p>
                <p className="text-[10px] text-slate-300 mt-0.5">Client has not submitted any requests</p>
              </div>
            ) : (
              <div className="space-y-2">
                {client.shipments.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-semibold text-slate-800 truncate">{s.event}</p>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span className="font-mono">{s.id}</span>
                        <span>·</span>
                        <span>{s.shipDate}</span>
                        <span>·</span>
                        <span>{s.items} items</span>
                        <span>·</span>
                        <span className="font-semibold text-slate-600">{s.fee}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0 ${shipmentBadge[s.status]}`}>
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all">
              <Plus className="h-3.5 w-3.5" /> Create Shipment for Client
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all">
              <Mail className="h-3.5 w-3.5" /> Send Email
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ClientsPanel() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | ClientStatus>("All");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);

  const filtered = CLIENTS.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    All: CLIENTS.length,
    Active: CLIENTS.filter(c => c.status === "Active").length,
    Inactive: CLIENTS.filter(c => c.status === "Inactive").length,
    "Pending Setup": CLIENTS.filter(c => c.status === "Pending Setup").length,
  };

  return (
    <div className="space-y-6">

      {/* Drawer */}
      {selectedClient && (
        <ClientDrawer client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">All Clients</h3>
          <p className="text-xs text-slate-400 mt-0.5">{CLIENTS.length} registered Experian contacts</p>
        </div>
        <button
  onClick={() => setShowAddClient(true)}
  className="flex items-center gap-1.5 text-xs text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl transition-all font-semibold"
>
  <Plus className="h-3.5 w-3.5" /> Add Client
</button>{showAddClient && (
  <AddClient
    onClose={() => setShowAddClient(false)}
    onSuccess={() => {
      // optional: refresh data later
      setShowAddClient(false);
    }}
  />
)}
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
          {(["All", "Active", "Inactive", "Pending Setup"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                filterStatus === s
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {s}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                filterStatus === s ? "bg-slate-100 text-slate-600" : "bg-slate-200 text-slate-500"
              }`}>
                {counts[s]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, ID..."
            className="pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 w-56 text-slate-900 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-400 bg-slate-50 border-b border-slate-100">
              <th className="px-5 py-3.5 font-semibold">Client</th>
              <th className="px-3 py-3.5 font-semibold">Contact</th>
              <th className="px-3 py-3.5 font-semibold">Shipments</th>
              <th className="px-3 py-3.5 font-semibold">Active</th>
              <th className="px-3 py-3.5 font-semibold">Total Spend</th>
              <th className="px-3 py-3.5 font-semibold">Last Activity</th>
              <th className="px-3 py-3.5 font-semibold">Status</th>
              <th className="px-3 py-3.5 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center">
                  <Users className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No clients found</p>
                </td>
              </tr>
            ) : (
              filtered.map(client => (
                <tr
                  key={client.id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-all cursor-pointer"
                  onClick={() => setSelectedClient(client)}
                >
                  {/* Avatar + Name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(client.id)}`}>
                        {initials(client.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{client.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{client.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Mail className="h-3 w-3 shrink-0 text-slate-300" />
                      <span className="truncate max-w-[160px]">{client.email}</span>
                    </div>
                  </td>

                  {/* Total shipments */}
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-3 w-3 text-slate-300" />
                      <span className="font-semibold text-slate-700">{client.totalShipments}</span>
                    </div>
                  </td>

                  {/* Active */}
                  <td className="px-3 py-4">
                    {client.activeShipments > 0 ? (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-semibold border border-blue-100">
                        {client.activeShipments} active
                      </span>
                    ) : (
                      <span className="text-slate-300 text-[10px]">—</span>
                    )}
                  </td>

                  {/* Spend */}
                  <td className="px-3 py-4 font-semibold text-slate-700">{client.totalSpend}</td>

                  {/* Last Activity */}
                  <td className="px-3 py-4 text-slate-400">{client.lastActivity}</td>

                  {/* Status */}
                  <td className="px-3 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusBadge[client.status]}`}>
                      {client.status}
                    </span>
                  </td>

                  {/* View */}
                  <td className="px-3 py-4" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-600 font-semibold transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] text-slate-400">
            Showing {filtered.length} of {CLIENTS.length} clients
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Active
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block ml-2"></span> Pending
            <span className="w-2 h-2 rounded-full bg-slate-300 inline-block ml-2"></span> Inactive
          </div>
        </div>
      </div>
    </div>
  );
}