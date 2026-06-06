"use client";

import React, { useState, useMemo } from "react";
import { Clock, RotateCcw, CheckCircle, ShieldAlert, Layers } from "lucide-react";

// mock data matching the Experian operations pipeline
const records = [
  {
    id: "RET-001",
    type: "Return",
    item: "Marketing Kit Box",
    reason: "Damaged during shipping - Restock pending evaluation",
    status: "Pending",
    date: "June 10, 2026",
  },
  {
    id: "AUD-002",
    type: "Audit",
    item: "Branded T-Shirts",
    reason: "Routine quarterly stock verification completed",
    status: "Completed",
    date: "June 08, 2026",
  },
  {
    id: "RET-003",
    type: "Return",
    item: "Presentation Stand",
    reason: "Wrong version item dispatched - Return processing",
    status: "In Review",
    date: "June 05, 2026",
  },
];

export default function ReturnsAudits() {
  const [activeFilter, setActiveFilter] = useState("All"); // All | Return | Audit

  // Client Filter Logic
  const filteredRecords = useMemo(() => {
    if (activeFilter === "All") return records;
    return records.filter((rec) => rec.type === activeFilter);
  }, [activeFilter]);

  // Dynamic Styles matching professional slate patterns
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "In Review":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* HEADER SECTION */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <RotateCcw className="h-4 w-4 text-blue-600" />
            Inventory Returns & Audits
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of asset reconciliations, damage reports, and stock integrity checks.
          </p>
        </div>

        {/* INTERACTIVE CONTROLS / TABS */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          {["All", "Return", "Audit"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeFilter === tab
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/40"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab === "All" ? "View All" : `${tab}s`}
            </button>
          ))}
        </div>
      </div>

      {/* CONDITIONAL TABLE SHEET */}
      <div className="overflow-x-auto">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No dynamic records found matching the active filter.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="p-4 pl-6">Record Identifier</th>
                <th className="p-4">Impacted Asset</th>
                <th className="p-4">Log / Reason Details</th>
                <th className="p-4">Logged Date</th>
                <th className="p-4 pr-6 text-right">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                  
                  {/* TYPE & ID BLOCK */}
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      {rec.type === "Return" ? (
                        <RotateCcw className="h-3.5 w-3.5 text-rose-500" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                      <span>{rec.type}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">{rec.id}</div>
                  </td>

                  {/* ITEM */}
                  <td className="p-4 font-medium text-slate-800 vertical-align-middle">
                    {rec.item}
                  </td>

                  {/* REASON */}
                  <td className="p-4 text-slate-500 text-xs max-w-xs truncate md:max-w-md">
                    {rec.reason}
                  </td>

                  {/* DATE */}
                  <td className="p-4 text-slate-500 text-xs whitespace-nowrap">
                    {rec.date}
                  </td>

                  {/* ACTIONS STATUS BADGE */}
                  <td className="p-4 pr-6 text-right">
                    <span
                      className={`inline-block px-2.5 py-1 text-[11px] rounded-full border font-semibold tracking-wide ${getStatusStyle(
                        rec.status
                      )}`}
                    >
                      {rec.status}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* COMPLIANCE FOOTER NOTE */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
        <ShieldAlert className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span>Discrepancy logs are cross-checked automatically against active billing schedules before being archived.</span>
      </div>

    </div>
  );
}