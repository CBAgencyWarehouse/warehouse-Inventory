"use client";

import React, { useState } from "react";
import { Clock, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

type ReturnItem = {
  id: string;
  eventName: string;
  receivedDate: string;
  status: "Pending" | "Verified" | "Damaged" | "Missing";
  notes?: string;
};

const dummyReturns: ReturnItem[] = [
  {
    id: "RET-2001",
    eventName: "Experian Annual Event",
    receivedDate: "2026-06-05",
    status: "Pending",
  },
  {
    id: "RET-2002",
    eventName: "Corporate Meetup",
    receivedDate: "2026-06-06",
    status: "Verified",
  },
];

export default function ReturnsAudits() {
  const [returns, setReturns] = useState<ReturnItem[]>(dummyReturns);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: ReturnItem["status"]) => {
    setLoadingId(id);

    try {
      await fetch("/api/returns/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      setReturns((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const getColor = (status: ReturnItem["status"]) => {
    switch (status) {
      case "Pending":
        return "text-yellow-500";
      case "Verified":
        return "text-emerald-500";
      case "Damaged":
        return "text-red-500";
      case "Missing":
        return "text-orange-500";
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Returns & Audit Verification
        </h1>
        <p className="text-sm text-slate-500">
          Verify returned items, check condition, and update inventory status
        </p>
      </div>

      {/* LIST */}
      <div className="space-y-4">

        {returns.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded-xl p-4 flex items-center justify-between"
          >

            {/* LEFT INFO */}
            <div>
              <p className="font-semibold text-slate-800">
                {item.eventName}
              </p>

              <p className="text-sm text-slate-500">
                ID: {item.id} • Received: {item.receivedDate}
              </p>

              <p className={`text-sm mt-1 ${getColor(item.status)}`}>
                Status: {item.status}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-2">

              {item.status === "Pending" && (
                <>
                  <button
                    onClick={() => updateStatus(item.id, "Verified")}
                    disabled={loadingId === item.id}
                    className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    {loadingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Verify
                  </button>

                  <button
                    onClick={() => updateStatus(item.id, "Damaged")}
                    className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    <XCircle className="h-4 w-4" />
                    Damaged
                  </button>

                  <button
                    onClick={() => updateStatus(item.id, "Missing")}
                    className="flex items-center gap-1 bg-orange-600 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Missing
                  </button>
                </>
              )}

              {item.status === "Verified" && (
                <div className="text-sm text-emerald-600 font-medium">
                  Ready for restock
                </div>
              )}

            </div>
          </div>
        ))}

      </div>

    </div>
  );
}