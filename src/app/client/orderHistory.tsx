"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  AlertCircle,
  FileText
} from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  inventory: {
    name: string;
    sku: string;
  };
}

interface Order {
  id: string;
  eventName: string;
  eventDate: string;
  shipToAddress: string;
  returnAddress: string;
  specialInstructions: string | null;
  status: "PENDING" | "APPROVED" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  items: OrderItem[];
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMyOrders() {
      try {
        setLoading(true);
        const res = await fetch("/api/orders/my-orders");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to fetch orders.");
        }
        setOrders(json.data || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    fetchMyOrders();
  }, []);

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusBadge = (status: Order["status"]) => {
    const styles = {
      PENDING: "bg-amber-50 text-amber-700 border-amber-200",
      APPROVED: "bg-blue-50 text-blue-700 border-blue-200",
      DISPATCHED: "bg-indigo-50 text-indigo-700 border-indigo-200",
      DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
      CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
    };

    const icons = {
      PENDING: <Clock className="h-3.5 w-3.5" />,
      APPROVED: <CheckCircle2 className="h-3.5 w-3.5" />,
      DISPATCHED: <Truck className="h-3.5 w-3.5" />,
      DELIVERED: <CheckCircle2 className="h-3.5 w-3.5" />,
      CANCELLED: <XCircle className="h-3.5 w-3.5" />,
    };

    return (
      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm text-slate-500 font-medium">Loading your event manifests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 p-4 bg-rose-50 rounded-2xl border border-rose-100 max-w-xl mx-auto">
        <AlertCircle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-900">Failed to load orders</h3>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full mx-auto p-4 md:p-6 space-y-4">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Your Logistics Requests</h2>
        <p className="text-xs text-slate-500 mt-0.5">Track status and manifests for your upcoming events.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white text-center py-20 border border-slate-200 rounded-2xl text-slate-400">
          <Package className="h-12 w-12 mx-auto text-slate-300 stroke-1 mb-3" />
          <p className="text-sm font-medium">You haven't submitted any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const totalItemsCount = order.items.reduce((acc, curr) => acc + curr.quantity, 0);

            return (
              <div 
                key={order.id} 
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs hover:border-slate-300 transition-all"
              >
                {/* ORDER ROW CARD HEADER */}
                <div 
                  onClick={() => toggleOrderExpand(order.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none bg-white hover:bg-slate-50/50 transition"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 text-sm truncate">{order.eventName}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" /> 
                        Event Date: {new Date(order.eventDate).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>Requested: {new Date(order.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="text-indigo-600 font-bold">{totalItemsCount} Items</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <span className="text-[10px] text-slate-400 font-mono hidden md:inline">ID: {order.id.slice(0, 8)}...</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </div>

                {/* EXPANDED AREA DETAILS */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 md:p-6 space-y-6 text-xs">
                    
                    {/* ADDRESSES ROUTING GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1.5">
                        <h4 className="font-bold text-slate-700 flex items-center gap-1 uppercase text-[10px] tracking-wider text-slate-400">
                          <MapPin className="h-3.5 w-3.5 text-indigo-500" /> Ship-To Location
                        </h4>
                        <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-line">{order.shipToAddress}</p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1.5">
                        <h4 className="font-bold text-slate-700 flex items-center gap-1 uppercase text-[10px] tracking-wider text-slate-400">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" /> Return Destination
                        </h4>
                        <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-line">{order.returnAddress}</p>
                      </div>
                    </div>

                    {/* SPECIAL HANDLING INSTRUCTIONS */}
                    {order.specialInstructions && (
                      <div className="bg-amber-50/50 border border-amber-200/60 p-3 rounded-xl space-y-1">
                        <h4 className="font-bold text-amber-800 flex items-center gap-1 uppercase text-[10px] tracking-wider">
                          <FileText className="h-3.5 w-3.5" /> Special Handling Notes
                        </h4>
                        <p className="text-amber-900 leading-relaxed font-medium">{order.specialInstructions}</p>
                      </div>
                    )}

                    {/* ITEMS MANIFEST TABLE */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-500 uppercase text-[10px] tracking-wider px-1">Requested Components Matrix</h4>
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">
                              <th className="p-3">Component Name</th>
                              <th className="p-3">SKU Identifier</th>
                              <th className="p-3 text-right">Requested Qty</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {order.items.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/40">
                                <td className="p-3 text-slate-900 font-semibold">{item.inventory?.name || "Unknown Item"}</td>
                                <td className="p-3 font-mono text-slate-500">{item.inventory?.sku || "N/A"}</td>
                                <td className="p-3 text-right font-black text-slate-900">{item.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}