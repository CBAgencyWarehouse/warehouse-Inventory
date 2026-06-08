"use client";

import React, { useState, useEffect } from "react";
import { Truck, CheckCircle, XCircle, Package, Loader2, AlertCircle, MapPin, FileText, Hash, Calendar } from "lucide-react";

type RequestType = {
  id: string;
  orderNumber: number | string; // Added to match backend order tracking field
  eventName: string;
  status: "PENDING" | "APPROVED" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
  eventDate: string;
  shipToAddress: string;
  returnAddress: string;
  specialInstructions?: string | null;
  client?: {
    name?: string;
    email: string;
    companyName?: string;
  };
  items: {
    id: string;
    quantity: number;
    inventory: {
      id: string;
      name: string;
      sku: string;
      bin: string;
      condition: string;
      images: string[];
    };
  }[];
};

export default function ShippingRequests({ mode = "cb-approve" }) {
  const [requests, setRequests] = useState<RequestType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1️⃣ Real-time orders fetch effect
  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const res = await fetch("/api/orders"); 
        const json = await res.json();

        if (json.success) {
          setRequests(json.data || []);
        } else {
          throw new Error(json.message || "Failed to load orders.");
        }
      } catch (err: any) {
        console.error("Fetch orders error:", err);
        setError(err.message || "Something went wrong while loading data.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  // 2️⃣ Live Action State Updating handler
  const updateStatus = async (id: string, databaseStatus: RequestType["status"]) => {
    setLoadingId(id);
    try {
      const response = await fetch("/api/orders/shipping/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: databaseStatus }),
      });

      const resJson = await response.json();

      if (resJson.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: databaseStatus } : r))
        );
      } else {
        alert(resJson.message || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      alert("Network communication error.");
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadgeStyles = (status: RequestType["status"]) => {
    switch (status) {
      case "PENDING": return "bg-yellow-50 text-yellow-700 border-yellow-200 text-amber-700 bg-amber-50 border-amber-200";
      case "APPROVED": return "bg-blue-50 text-blue-700 border-blue-200";
      case "DISPATCHED": return "bg-purple-50 text-purple-700 border-purple-200";
      case "DELIVERED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CANCELLED": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-slate-50 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center flex-col gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
        <p className="text-sm text-slate-500">Loading shipping workflows...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Shipping Requests ({mode === "cb-approve" ? "CB Review" : "Client View"})
        </h1>
        <p className="text-sm text-slate-500">
          Approve, reject, pack and process client shipment orders dynamically
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* LIST */}
      <div className="space-y-6">
        {requests.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl text-slate-400 bg-slate-50/50">
            No active shipping orders found in database.
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-5 border-slate-200"
            >
              {/* TOP ROW: Order Number, Event Title & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-4 border-slate-100">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Highlighting the Order Number prominently */}
                    <div className="flex items-center gap-1 bg-slate-900 text-white px-3 py-1 rounded-md font-mono font-bold text-sm tracking-wide shadow-xs">
                      <Hash className="h-3.5 w-3.5 text-slate-400" />
                      ORDER-{req.orderNumber || req.id.slice(0, 8).toUpperCase()}
                    </div>

                    {/* Styled Status Badge */}
                    <span className={`text-xs px-2.5 py-1 font-semibold border rounded-full uppercase tracking-wider ${getStatusBadgeStyles(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  
                  {/* Context-aware Event Heading */}
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Requested For Event</p>
                    <p className="font-extrabold text-slate-900 text-xl tracking-tight">{req.eventName}</p>
                  </div>
                  
                  {req.client && (
                    <p className="text-sm text-indigo-600 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      Client: {req.client.name || req.client.email} {req.client.companyName ? `(${req.client.companyName})` : ''}
                    </p>
                  )}
                </div>

                {/* ACTIONS CONTROLLER */}
                {mode === "cb-approve" && (
                  <div className="flex items-center gap-2 self-end sm:self-start shrink-0 pt-2 sm:pt-0">
                    {req.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => updateStatus(req.id, "APPROVED")}
                          disabled={loadingId === req.id}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                        >
                          {loadingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          Approve Shipping
                        </button>

                        <button
                          onClick={() => updateStatus(req.id, "CANCELLED")}
                          disabled={loadingId === req.id}
                          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </>
                    )}

                    {req.status === "APPROVED" && (
                      <button
                        onClick={() => updateStatus(req.id, "DISPATCHED")}
                        disabled={loadingId === req.id}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {loadingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
                        Dispatch Order
                      </button>
                    )}

                    {req.status === "DISPATCHED" && (
                      <button
                        onClick={() => updateStatus(req.id, "DELIVERED")}
                        disabled={loadingId === req.id}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {loadingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                        Mark Delivered
                      </button>
                    )}

                    {req.status === "DELIVERED" && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs">
                        <CheckCircle className="h-4 w-4 text-emerald-600" /> Completed & Delivered
                      </span>
                    )}

                    {req.status === "CANCELLED" && (
                      <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs">
                        <XCircle className="h-4 w-4 text-red-600" /> Order Cancelled
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* MIDDLE CONTENT: Dates, Addresses & Special Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl text-sm border border-slate-150">
                {/* Logistics Info Column 1 */}
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2 text-slate-600">
                    <Calendar className="h-4 w-4 mt-0.5 shrink-0 text-slate-500" />
                    <div>
                      <p className="font-bold text-slate-800 text-xs uppercase tracking-wider">Target Event Date</p>
                      <p className="text-slate-700 font-semibold mt-0.5">{new Date(req.eventDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                    </div>
                  </div>
                  <div className="pt-1 text-[11px] text-slate-400 font-mono">
                    System DB Key: <span className="text-slate-500 font-semibold">{req.id}</span>
                  </div>
                </div>

                {/* Logistics Info Column 2 (Addresses) */}
                <div className="space-y-2.5 md:border-l md:pl-4 border-slate-200">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
                    <div>
                      <p className="font-bold text-slate-800 text-xs uppercase tracking-wider">Ship To Location</p>
                      <p className="text-slate-600 text-xs mt-0.5 font-medium leading-relaxed">{req.shipToAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
                    <div>
                      <p className="font-bold text-slate-800 text-xs uppercase tracking-wider">Return Warehouse Address</p>
                      <p className="text-slate-600 text-xs mt-0.5 font-medium leading-relaxed">{req.returnAddress}</p>
                    </div>
                  </div>
                </div>
                
                {/* Logistics Info Column 3 (Instructions) */}
                <div className="md:border-l md:pl-4 border-slate-200">
                  <div className="flex items-start gap-2 text-slate-600 h-full">
                    <FileText className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-xs uppercase tracking-wider">Special Instructions</p>
                      {req.specialInstructions ? (
                        <p className="text-slate-600 text-xs mt-1 italic bg-white p-2 border rounded-md border-slate-200 block">
                          "{req.specialInstructions}"
                        </p>
                      ) : (
                        <p className="text-slate-400 text-xs mt-1 italic">No special instructions provided.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: Ordered Items Grid with Images */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                  <p className="text-xs font-extrabold text-slate-500 tracking-wider uppercase">
                    Items Manifest ({req.items?.length || 0})
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {req.items?.map((item) => {
                    const inv = item.inventory;
                    const hasImage = inv?.images && inv.images.length > 0;
                    const imageUrl = hasImage ? inv.images[0] : null;

                    return (
                      <div 
                        key={item.id} 
                        className="flex items-center gap-3 p-3 bg-slate-50/40 border border-slate-200 rounded-xl hover:bg-white hover:border-slate-300 transition-all shadow-2xs"
                      >
                        {/* Image Box */}
                        <div className="h-16 w-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center text-slate-400 shadow-2xs">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={inv?.name} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 stroke-1 text-slate-400" />
                          )}
                        </div>

                        {/* Inventory Details */}
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <p className="text-sm font-bold text-slate-800 truncate" title={inv?.name}>
                            {inv?.name || "Unknown Item"}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono tracking-tight">
                            SKU: <span className="font-semibold text-slate-700">{inv?.sku || "N/A"}</span> | Bin: <span className="font-semibold text-slate-700">{inv?.bin || "N/A"}</span>
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md font-semibold">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">
                              {inv?.condition || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}