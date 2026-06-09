"use client";

import { useEffect, useState } from "react";
import { Package, User, Shield, Inbox, Loader2 } from "lucide-react";

export default function InventoryList() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/dashboard/inventory")
      .then((res) => res.json())
      .then((data) => {
        setInventory(data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Beautiful Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading inventory ledger...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h2 className="font-semibold text-slate-900 text-lg tracking-tight">
            Complete Inventory Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stock levels, client assignments, and logs.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100">
          {inventory.length} Items Total
        </div>
      </div>

      {/* Table & Empty State Handling */}
      <div className="overflow-x-auto">
        {inventory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
              <Inbox className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No inventory found</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Your ledger is currently empty. Items will appear here once they are added.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-600 font-medium tracking-wide text-[13px]">
                <th className="px-6 py-3.5">SKU</th>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5 text-center">Qty</th>
                <th className="px-6 py-3.5">Client Details</th>
                <th className="px-6 py-3.5">CB Team Log</th>
                <th className="px-6 py-3.5 text-right">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {inventory.map((item: any) => {
                // Dynamic Badge for Stock Quantity
                const isOutOfStock = item.quantity <= 0;
                const isLowStock = item.quantity > 0 && item.quantity <= 5;

                return (
                  <tr
                    key={item.inventoryId}
                    className="hover:bg-slate-50/80 transition-colors duration-150 ease-in-out"
                  >
                    {/* SKU */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200/60">
                        {item.sku}
                      </span>
                    </td>

                    {/* Product Name */}
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 border border-blue-100/50">
                          <Package className="h-4 w-4" />
                        </div>
                        <span className="truncate max-w-[180px]">{item.productName}</span>
                      </div>
                    </td>

                    {/* Quantity with Custom Badges */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center font-bold px-2.5 py-1 rounded-full text-xs min-w-[45px] ${
                          isOutOfStock
                            ? "bg-rose-50 text-rose-700 border border-rose-100"
                            : isLowStock
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        }`}
                      >
                        {item.quantity}
                      </span>
                    </td>

                    {/* Client & Client ID Grouped together for a cleaner look */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <User className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{item.clientName || "N/A"}</span>
                        </div>
                        {item.clientId && (
                          <span className="font-mono text-[11px] text-slate-400 pl-5">
                            ID: {item.clientId}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* CB Team & CB ID Grouped */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Shield className="h-3.5 w-3.5 text-purple-600" />
                          <span>{item.createdByName || "System"}</span>
                        </div>
                        {item.createdById && (
                          <span className="font-mono text-[11px] text-slate-400 pl-5">
                            ID: {item.createdById}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 text-right text-slate-500 text-xs font-medium">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}