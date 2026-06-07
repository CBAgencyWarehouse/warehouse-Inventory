"use client";

import React, { useState } from "react";
import { Truck, CheckCircle, XCircle, Package, Loader2 } from "lucide-react";

type Request = {
  id: string;
  eventName: string;
  status: "Pending" | "Approved" | "Rejected" | "Packed" | "Shipped";
  items: number;
  eventDate: string;
};

const dummyRequests: Request[] = [
  {
    id: "REQ-1001",
    eventName: "Experian Annual Event",
    status: "Pending",
    items: 12,
    eventDate: "2026-06-15",
  },
  {
    id: "REQ-1002",
    eventName: "Corporate Meetup",
    status: "Approved",
    items: 5,
    eventDate: "2026-06-18",
  },
];

export default function ShippingRequests({ mode = "cb-approve" }) {
  const [requests, setRequests] = useState<Request[]>(dummyRequests);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: Request["status"]) => {
    setLoadingId(id);

    try {
      await fetch("/api/shipping/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusColor = (status: Request["status"]) => {
    switch (status) {
      case "Pending":
        return "text-yellow-500";
      case "Approved":
        return "text-blue-500";
      case "Rejected":
        return "text-red-500";
      case "Packed":
        return "text-purple-500";
      case "Shipped":
        return "text-emerald-500";
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Shipping Requests (CB Review)
        </h1>
        <p className="text-sm text-slate-500">
          Approve, reject, pack and process client shipment orders
        </p>
      </div>

      {/* LIST */}
      <div className="space-y-4">

        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-white border rounded-xl p-4 flex items-center justify-between"
          >

            {/* LEFT INFO */}
            <div>
              <p className="font-semibold text-slate-800">{req.eventName}</p>
              <p className="text-sm text-slate-500">
                ID: {req.id} • Items: {req.items} • Date: {req.eventDate}
              </p>

              <p className={`text-sm mt-1 ${getStatusColor(req.status)}`}>
                Status: {req.status}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-2">

              {req.status === "Pending" && (
                <>
                  <button
                    onClick={() => updateStatus(req.id, "Approved")}
                    disabled={loadingId === req.id}
                    className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    {loadingId === req.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Approve
                  </button>

                  <button
                    onClick={() => updateStatus(req.id, "Rejected")}
                    className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </>
              )}

              {req.status === "Approved" && (
                <button
                  onClick={() => updateStatus(req.id, "Packed")}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  <Package className="h-4 w-4" />
                  Mark Packed
                </button>
              )}

              {req.status === "Packed" && (
                <button
                  onClick={() => updateStatus(req.id, "Shipped")}
                  className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  <Truck className="h-4 w-4" />
                  Ship Order
                </button>
              )}

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}