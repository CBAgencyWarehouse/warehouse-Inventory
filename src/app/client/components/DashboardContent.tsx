"use client";

import React from "react";

export default function DashboardContent() {
  return (
    <div className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          Fulfillment Control Center
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time warehouse operations dashboard overview
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-sm text-slate-500">Total SKU Stock</p>
          <h2 className="text-2xl font-bold text-slate-900">1,248</h2>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-sm text-slate-500">Pending Requests</p>
          <h2 className="text-2xl font-bold text-amber-600">14</h2>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-sm text-slate-500">Active Shipments</p>
          <h2 className="text-2xl font-bold text-blue-600">28</h2>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-sm text-slate-500">Uninvoiced Orders</p>
          <h2 className="text-2xl font-bold text-rose-600">$2,380</h2>
        </div>

      </div>

      {/* TABLE SECTION */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-lg font-bold mb-4">Recent Requests</h2>

        <div className="space-y-3 text-sm text-slate-600">
          <p>ORD-2026-089 — Experian Tech Summit</p>
          <p>ORD-2026-090 — Houston Job Fair</p>
          <p>ORD-2026-091 — Warehouse Return</p>
        </div>
      </div>

    </div>
  );
}