"use client";

import React, { useState } from "react";
import { FileText, DollarSign, Send, Loader2, CheckCircle } from "lucide-react";

type InvoiceItem = {
  id: string;
  client: string;
  eventName: string;
  amount: number;
  status: "Pending" | "Sent" | "Paid";
  date: string;
};

const dummyInvoices: InvoiceItem[] = [
  {
    id: "INV-1001",
    client: "Experian",
    eventName: "Annual Event",
    amount: 340,
    status: "Pending",
    date: "2026-06-05",
  },
  {
    id: "INV-1002",
    client: "Experian",
    eventName: "Corporate Meetup",
    amount: 170,
    status: "Paid",
    date: "2026-06-01",
  },
];

export default function Invoice() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(dummyInvoices);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: InvoiceItem["status"]) => {
    setLoadingId(id);

    try {
      await fetch("/api/invoice/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const getColor = (status: InvoiceItem["status"]) => {
    switch (status) {
      case "Pending":
        return "text-yellow-500";
      case "Sent":
        return "text-blue-500";
      case "Paid":
        return "text-emerald-500";
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Billing & Invoices
        </h1>
        <p className="text-sm text-slate-500">
          Manage round-trip fees, shipping charges, and additional labor costs
        </p>
      </div>

      {/* LIST */}
      <div className="space-y-4">

        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="bg-white border rounded-xl p-4 flex items-center justify-between"
          >

            {/* LEFT INFO */}
            <div>
              <p className="font-semibold text-slate-800">
                {inv.client} — {inv.eventName}
              </p>

              <p className="text-sm text-slate-500">
                ID: {inv.id} • Date: {inv.date}
              </p>

              <p className="flex items-center gap-1 mt-1 text-slate-700">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                {inv.amount}
              </p>

              <p className={`text-sm mt-1 ${getColor(inv.status)}`}>
                Status: {inv.status}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-2">

              {inv.status === "Pending" && (
                <button
                  onClick={() => updateStatus(inv.id, "Sent")}
                  disabled={loadingId === inv.id}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  {loadingId === inv.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send Invoice
                </button>
              )}

              {inv.status === "Sent" && (
                <button
                  onClick={() => updateStatus(inv.id, "Paid")}
                  className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark Paid
                </button>
              )}

              {inv.status === "Paid" && (
                <span className="text-emerald-600 text-sm font-medium">
                  Completed
                </span>
              )}

            </div>
          </div>
        ))}

      </div>

    </div>
  );
}