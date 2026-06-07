"use client";

import React, { useState } from "react";
import {
  Package,
  Truck,
  Clock,
  FileText,
  Layers,
  LogOut,
  Loader2,
  CheckCircle,
} from "lucide-react";

import DashboardContent from "@/src/app/team/DashboardContent"; //overview
import ShippingRequests from "@/src/app/team/ShippingRequests"; // approved shipping
import IntakeSKU from "@/src/app/team/IntakeSKU";  //inventory intake
import ReturnsAudits from "@/src/app/team/ReturnsAudits"; // return verification 
import Invoice from "@/src/app/team/Invoice"; //billing logs

export default function CBPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });

      localStorage.removeItem("userData");
      localStorage.removeItem("userToken");

      await new Promise((r) => setTimeout(r, 500));

      window.location.href = "/auth/login";
    } catch (err) {
      console.error(err);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col justify-between">

        {/* TOP */}
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-600 rounded-lg text-white">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-white font-bold">CB Warehouse</p>
                <p className="text-xs text-slate-500">Operations Panel</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">

            <button onClick={() => setActivePage("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                activePage === "dashboard" ? "bg-slate-800 text-white" : "hover:bg-slate-800/60"
              }`}>
              <Layers className="h-4 w-4" />
              Overview
            </button>

            <button onClick={() => setActivePage("intake")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                activePage === "intake" ? "bg-slate-800 text-white" : "hover:bg-slate-800/60"
              }`}>
              <Package className="h-4 w-4" />
              Inventory Intake
            </button>

            <button onClick={() => setActivePage("shipping")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                activePage === "shipping" ? "bg-slate-800 text-white" : "hover:bg-slate-800/60"
              }`}>
              <Truck className="h-4 w-4" />
              Approve Shipping
            </button>

            <button onClick={() => setActivePage("returns")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                activePage === "returns" ? "bg-slate-800 text-white" : "hover:bg-slate-800/60"
              }`}>
              <Clock className="h-4 w-4" />
              Returns Verification
            </button>

            <button onClick={() => setActivePage("billing")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                activePage === "billing" ? "bg-slate-800 text-white" : "hover:bg-slate-800/60"
              }`}>
              <FileText className="h-4 w-4" />
              Billing Logs
            </button>

          </nav>
        </div>

        {/* USER */}
        <div className="p-4 border-t border-slate-800 flex justify-between">
          <div>
            <p className="text-white text-sm">CB Team</p>
            <p className="text-xs text-slate-500">Warehouse Staff</p>
          </div>

          <button onClick={handleLogout}>
            {isLoggingOut ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6">

        {activePage === "dashboard" && <DashboardContent />}

        {activePage === "intake" && <IntakeSKU />}

        {activePage === "shipping" && <ShippingRequests />}

        {activePage === "returns" && <ReturnsAudits />}

        {activePage === "billing" && <Invoice />}

      </main>

    </div>
  );
}