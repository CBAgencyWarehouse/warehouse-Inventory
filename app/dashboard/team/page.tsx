"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Truck,
  Clock,
  FileText,
  Layers,
  LogOut,
  Loader2,
} from "lucide-react";

import DashboardContent from "@/src/app/client/components/DashboardContent";
import ShippingRequests from "@/src/app/client/components/ShippingRequests";
import IntakeSKU from "@/src/app/client/components/IntakeSKU";
import ReturnsAudits from "@/src/app/client/components/ReturnsAudits";
import Invoice from "@/src/app/client/components/Invoice";

export default function Page() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });

      localStorage.removeItem("userData");
      localStorage.removeItem("userToken");

      await new Promise((r) => setTimeout(r, 500));

      router.push("/auth/login");
      router.refresh();
    } catch (err) {
      console.error(err);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col justify-between border-r border-slate-800">

        {/* TOP */}
        <div>

          {/* BRAND */}
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">CB Core</p>
                <p className="text-xs text-slate-500">
                  Inventory System
                </p>
              </div>
            </div>
          </div>

          {/* MENU */}
          <nav className="p-4 space-y-2">

            <p className="text-xs text-slate-600 uppercase px-3 mb-2">
              Operations
            </p>

            {/* DASHBOARD */}
            <button
              onClick={() => setActivePage("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                activePage === "dashboard"
                  ? "bg-slate-800 text-white"
                  : "hover:bg-slate-800/60"
              }`}
            >
              <Layers className="h-4 w-4 text-blue-400" />
              Dashboard
            </button>

            {/* SHIPPING */}
            <button
              onClick={() => setActivePage("sku")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                activePage === "sku"
                  ? "bg-slate-800 text-white"
                  : "hover:bg-slate-800/60"
              }`}
            >
              <Package className="h-4 w-4 text-blue-400" />
              Intake & SKUs
            </button>
            <button
              onClick={() => setActivePage("shipping")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                activePage === "shipping"
                  ? "bg-slate-800 text-white"
                  : "hover:bg-slate-800/60"
              }`}
            >
              <Truck className="h-4 w-4 text-blue-400" />
              Shipping Requests
            </button>

            {/* RETURNS */}
            <button
  onClick={() => setActivePage("returns")}
  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
    activePage === "returns"
      ? "bg-slate-800 text-white"
      : "hover:bg-slate-800/60"
  }`}
>
  <Clock className="h-4 w-4 text-blue-400" />
  Returns & Audits
</button>

            <p className="text-xs text-slate-600 uppercase px-3 mt-6 mb-2">
              Finance
            </p>

            {/* BILLING */}
            <button
  onClick={() => setActivePage("invoice")}
  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
    activePage === "invoice"
      ? "bg-slate-800 text-white"
      : "hover:bg-slate-800/60"
  }`}
>
  <FileText className="h-4 w-4" />
  Invoices
</button>

          </nav>
        </div>

        {/* USER */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              CL
            </div>
            <div>
              <p className="text-sm text-white">Chynell L.</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin text-rose-400" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </button>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 overflow-y-auto">

        {activePage === "dashboard" && <DashboardContent />}

        {activePage === "shipping" && <ShippingRequests />}

         {activePage === "sku" && <IntakeSKU />}

         {activePage === "returns" && <ReturnsAudits />}

         {activePage === "invoice" && <Invoice />}

      </main>

    </div>
  );
}