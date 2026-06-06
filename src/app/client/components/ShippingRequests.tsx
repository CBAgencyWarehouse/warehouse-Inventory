"use client";

import React, { useState, useMemo } from "react";
import {
  Truck,
  Calendar,
  Boxes,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  X,
  MapPin,
  ShieldAlert,
  FileText
} from "lucide-react";

// Experian Pipeline Mock Data
const initialRequests = [
  {
    id: "ORD-2026-089",
    client: "Experian Team Alpha",
    event: "Annual Tech Summit",
    shipDate: "June 18, 2026",
    status: "Pending Pull", 
    itemsCount: 24,
    shippingWindow: "Standard", // > 2 weeks notice
    originFacility: "1019 W Dallas St (Unit 3048-3059)",
    destination: "Los Angeles Convention Center",
    instructions: "Fragile equipment. Wrap premium banners in separate industrial sleeves."
  },
  {
    id: "ORD-2026-090",
    client: "Experian HR Dept",
    event: "Houston Job Fair",
    shipDate: "June 08, 2026", // Less than 2 weeks from current date (June 2026)
    status: "Rush Order",
    itemsCount: 7,
    shippingWindow: "Rush Surcharge (+$50)",
    originFacility: "CB Office - 9894 Bissonnet St",
    destination: "NRG Stadium, Houston, TX",
    instructions: "Super urgent setup. Include return shipping labels inside Box 1."
  },
  {
    id: "ORD-2026-091",
    client: "Experian Marketing",
    event: "Product Launch Event",
    shipDate: "June 09, 2026",
    status: "Super Rush",
    itemsCount: 15,
    shippingWindow: "Super Rush Surcharge (+$100)",
    originFacility: "1019 W Dallas St (Unit 3048-3059)",
    destination: "Marriott Marquis Houston",
    instructions: "Requires 1-3 days express dispatch courier validation."
  },
];

export default function ShippingRequests() {
  const [requests, setRequests] = useState(initialRequests);
  const [activeFilter, setActiveFilter] = useState("All"); // All | Pending Pull | Rush Order | Super Rush
  const [selectedOrder, setSelectedOrder] = useState<typeof initialRequests[0] | null>(null);

  // Filter requests based on pipeline tabs
  const filteredRequests = useMemo(() => {
    if (activeFilter === "All") return requests;
    return requests.filter((req) => req.status === activeFilter);
  }, [requests, activeFilter]);

  // Action Status colors
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Rush Order":
        return "bg-amber-50 text-amber-700 border-amber-200/70";
      case "Super Rush":
        return "bg-rose-50 text-rose-700 border-rose-200/70 animate-pulse";
      case "Dispatched":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/70";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200/70";
    }
  };

  // Process workflow simulation
  const handleApprovePull = (id: string) => {
    setRequests(prev => 
      prev.map(order => order.id === id ? { ...order, status: "Dispatched" } : order)
    );
    setSelectedOrder(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* HEADER WITH CONTEXT */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Experian Event Shipping Gateways
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review timeline constraints, apply automated rush surcharges, and pushing data manifests to Zoho Inventory.
          </p>
        </div>

        {/* PIPELINE FILTERS */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start md:self-center">
          {["All", "Pending Pull", "Rush Order", "Super Rush"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === tab
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/40"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab === "All" ? "All Shipments" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* REQUESTS DATA TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            <tr>
              <th className="p-4 pl-6">Event / Destination Target</th>
              <th className="p-4">Facility Allocation</th>
              <th className="p-4">Est. Ship Date</th>
              <th className="p-4">Quantity Units</th>
              <th className="p-4">Surcharge Window</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6 text-right">Action Gate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredRequests.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                
                {/* Event Name & Client Info */}
                <td className="p-4 pl-6">
                  <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.event}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                    {item.client} • <span className="font-mono font-normal">{item.id}</span>
                  </div>
                </td>

                {/* Facility Allocation */}
                <td className="p-4 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[160px]">{item.originFacility.split("(")[0]}</span>
                  </div>
                </td>

                {/* Date Display */}
                <td className="p-4 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {item.shipDate}
                  </div>
                </td>

                {/* Box Counter */}
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <Boxes className="h-3.5 w-3.5 text-slate-400" />
                    <span>{item.itemsCount} Items Allocated</span>
                  </div>
                </td>

                {/* Surcharge Metrics (2 weeks check rule) */}
                <td className="p-4 text-xs">
                  {item.shippingWindow === "Standard" ? (
                    <span className="text-slate-400 font-medium">Standard Compliance</span>
                  ) : (
                    <span className={`font-bold flex items-center gap-1 ${item.status === "Super Rush" ? "text-rose-600" : "text-amber-600"}`}>
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      {item.shippingWindow}
                    </span>
                  )}
                </td>

                {/* Status Badging */}
                <td className="p-4">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border tracking-wide ${getStatusStyle(item.status)}`}>
                    {item.status}
                  </span>
                </td>

                {/* Direct Action trigger */}
                <td className="p-4 pr-6 text-right">
                  <button 
                    onClick={() => setSelectedOrder(item)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-bold transition-all"
                  >
                    Review Manifest 
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER SLA NOTICES */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
        <ShieldAlert className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span>Warehouse SLA Window Requirement: Response logs & sales order verification schemas must trigger within a 48-hour timeline bracket.</span>
      </div>

      {/* SLIDEOUT MODAL SCREEN FOR MANIFEST REVIEW */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                  {selectedOrder.id}
                </span>
                <h3 className="font-bold text-slate-900 mt-1">Review Shipping Manifest</h3>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Contents */}
            <div className="p-6 space-y-4 text-sm text-slate-600">
              
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Client Department</span>
                  <span className="font-bold text-slate-900">{selectedOrder.client}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Target Event Project</span>
                  <span className="font-bold text-slate-900">{selectedOrder.event}</span>
                </div>
              </div>

              <div className="space-y-2 border-b pb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block">Pickup Origin Warehouse Location</span>
                    <span className="text-slate-800 font-medium">{selectedOrder.originFacility}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <Truck className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block">Destination Ship-To Target Address</span>
                    <span className="text-slate-800 font-medium">{selectedOrder.destination}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-semibold block flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  Special Handling / Assembly Instructions
                </span>
                <p className="mt-1 bg-slate-50 p-3 rounded-xl text-xs border border-slate-100 text-slate-600 italic leading-relaxed">
                  "{selectedOrder.instructions}"
                </p>
              </div>

              {/* Surcharge alert notification banner */}
              {selectedOrder.shippingWindow !== "Standard" && (
                <div className="p-3 bg-amber-50/50 border border-amber-200/50 rounded-xl flex gap-2.5 items-center">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="text-xs text-amber-800 font-medium">
                    This order breaches the 2-week warning timeline. Billed with an automated <b>{selectedOrder.shippingWindow}</b> clause.
                  </span>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition bg-white"
              >
                Close Manifest
              </button>
              
              {selectedOrder.status !== "Dispatched" && (
                <button
                  type="button"
                  onClick={() => handleApprovePull(selectedOrder.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Confirm & Sync to Zoho
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}