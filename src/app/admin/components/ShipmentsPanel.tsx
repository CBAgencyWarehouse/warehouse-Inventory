"use client";

import React, { useEffect, useState } from "react";
import { 
  Truck, Package, User, Calendar, RefreshCcw, Layers, Loader2, ArrowUpRight, Search, X 
} from "lucide-react";

type Shipment = any;

// Helper function to get status colors dynamically
const getStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || "";
  if (s.includes("deliver") || s.includes("success") || s.includes("complete")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }
  if (s.includes("pend") || s.includes("process") || s.includes("hold")) {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }
  if (s.includes("ship") || s.includes("transit") || s.includes("route")) {
    return "bg-blue-50 text-blue-700 border-blue-100";
  }
  return "bg-slate-50 text-slate-600 border-slate-100";
};

export default function ShipmentsPanel() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); // 👈 Search state add ki hai
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await fetch("/api/users/dashboard/shipments", {
          credentials: "include",
        });

        const data = await res.json();

        if (data.success) {
          setShipments(data.data);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  // ─── Search Filter Logic ───────────────────
  // Yeh Order Number, Event Name, Client Name, Product Name aur SKU par search chalayega
  const filteredShipments = shipments.filter((order) => {
    const query = searchQuery.toLowerCase();
    
    const matchesOrderMeta = 
      order.orderNumber?.toString().toLowerCase().includes(query) ||
      order.eventName?.toLowerCase().includes(query) ||
      order.client?.name?.toLowerCase().includes(query);

    const matchesProducts = order.items?.some((item: any) => 
      item.inventory?.name?.toLowerCase().includes(query) ||
      item.inventory?.sku?.toLowerCase().includes(query)
    );

    return matchesOrderMeta || matchesProducts;
  });

  // Premium Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading shipment manifests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto p-1">
      
      {/* Header Stat Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Shipment Manifests
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Track outbound orders, client allocations, and return logs.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 flex items-center gap-3 self-start sm:self-center">
          <Layers className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">
            {shipments.length} Total Orders
          </span>
        </div>
      </div>

      {/* ─── Search Bar Section ─── */}
      <div className="flex items-center bg-white border border-slate-200/80 rounded-xl px-3 py-2.5 w-full max-w-md shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
        <Search className="h-4 w-4 text-slate-400 mr-2.5 shrink-0" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Product, SKU, Order # or Event..."
          className="text-sm bg-transparent outline-none w-full text-slate-700 placeholder:text-slate-400"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")} 
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100 transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Shipments Loop */}
      <div className="space-y-4">
        {filteredShipments.map((order) => (
          <div 
            key={order.id} 
            className="group relative bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all duration-200"
          >
            {/* ORDER HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-50">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                    #{order.orderNumber}
                  </span>
                  <h4 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition flex items-center gap-1">
                    {order.eventName}
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-blue-500 transition-all" />
                  </h4>
                </div>

                {/* Client Info Subtitle */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <User className="h-3 w-3 text-slate-400" />
                  <span className="font-medium text-slate-700">{order.client?.name || "Anonymous Client"}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400">{order.client?.email}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="self-start sm:self-center">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusBadge(order.status)}`}>
                  {order.status || "Unknown Status"}
                </span>
              </div>
            </div>

            {/* ITEMS LIST AREA */}
            <div className="mt-4 space-y-2.5">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block pl-1">Line Items</span>
              
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-100/70 p-3 rounded-xl transition"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-white border border-slate-200/60 text-slate-500 rounded-lg shrink-0 mt-0.5 shadow-sm">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-xs sm:text-sm">
                        {item.inventory?.name || "Unnamed Product"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-slate-400">
                        <span>SKU: <span className="text-slate-600">{item.inventory?.sku || "N/A"}</span></span>
                        <span>|</span>
                        <span>BIN: <span className="text-slate-600 font-bold">{item.inventory?.bin || "N/A"}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="self-end sm:self-center font-medium text-xs bg-white px-2.5 py-1 rounded-md border border-slate-100 shadow-sm text-slate-700">
                    Qty: <span className="font-bold text-slate-900">{item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* FOOTER METADATA (Returns & Dates) */}
            <div className="mt-4 pt-3 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              
              {/* Returns Badge */}
              <div>
                {order.returns?.length > 0 ? (
                  <div className="inline-flex items-center gap-1.5 font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                    <RefreshCcw className="h-3 w-3" />
                    <span>Returns: {order.returns.length} Reverse Log(s)</span>
                  </div>
                ) : (
                  <span className="text-slate-400 text-[11px]">No active return logs</span>
                )}
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-1 text-slate-400 font-medium text-[11px]">
                <Calendar className="h-3 w-3 text-slate-300" />
                <span>Created:</span>
                <span className="text-slate-500">
                  {new Date(order.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

            </div>

          </div>
        ))}

        {/* Empty / No Results Found State */}
        {filteredShipments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100 text-center p-6 shadow-sm">
            <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
              <Search className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">No shipments matched</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Aapki search query <span className="font-semibold text-slate-600">"{searchQuery}"</span> ke mutabik koi result nahi mila. Dobara check karein.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}