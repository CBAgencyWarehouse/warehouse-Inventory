"use client";

import React from "react";
import { Package, Truck, Clock, AlertTriangle, CheckCircle } from "lucide-react";

export default function DashboardContent() {
  const stats = [
    {
      title: "Total Items",
      value: "1,248",
      icon: Package,
      color: "text-blue-500",
    },
    {
      title: "Pending Shipments",
      value: "34",
      icon: Truck,
      color: "text-orange-500",
    },
    {
      title: "Active Requests",
      value: "18",
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      title: "Issues / Alerts",
      value: "5",
      icon: AlertTriangle,
      color: "text-red-500",
    },
  ];

  const activities = [
    "Shipment #1024 approved",
    "Item SKU-778 added to bin A-12",
    "Return verified for Event: Experian",
    "Rush request processed (2 items)",
  ];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Warehouse Overview
        </h1>
        <p className="text-sm text-slate-500">
          Real-time inventory & operations summary
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((item, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between">
              <item.icon className={`h-6 w-6 ${item.color}`} />
              <span className="text-xl font-bold text-slate-800">
                {item.value}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-2">{item.title}</p>
          </div>
        ))}
      </div>

      {/* MIDDLE SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* QUICK ACTIONS */}
        <div className="bg-white p-5 rounded-xl border">
          <h2 className="font-semibold text-slate-800 mb-3">
            Quick Actions
          </h2>

          <div className="space-y-2 text-sm">
            <button className="w-full text-left px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200">
              View Pending Shipping Requests
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200">
              Check Inventory Intake Queue
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200">
              Review Return Verifications
            </button>
          </div>
        </div>

        {/* ACTIVITY */}
        <div className="bg-white p-5 rounded-xl border">
          <h2 className="font-semibold text-slate-800 mb-3">
            Recent Activity
          </h2>

          <ul className="space-y-3 text-sm text-slate-600">
            {activities.map((a, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                {a}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}