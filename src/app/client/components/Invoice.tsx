"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  DollarSign,
  Clock,
  Truck,
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  Plus,
  Minus,
  RefreshCw,
  Printer,
} from "lucide-react";

// CONSTANT PRICING RULES FROM EXPERIAN POLICY
const PRICING = {
  roundTripFee: 170,
  rushFee: 50,
  superRushFee: 100,
  extraHourRate: 85,
};

// INITIAL INVENTORY ITEMS AVAILABLE FOR PULL WITH MINIMAL RATES
const AVAILABLE_ITEMS = [
  { id: "item-1", name: "Marketing Kit Box", rate: 15 },
  { id: "item-2", name: "Branded T-Shirts", rate: 5 },
  { id: "item-3", name: "Presentation Stand", rate: 25 },
];

export default function ExperianInvoiceGenerator() {
  // Client & Event Context
  const [clientName, setClientName] = useState("Experian Team Alpha");
  const [eventName, setEventName] = useState("Annual Tech Summit");
  const [eventDate, setEventDate] = useState("2026-06-25"); // Mock future date

  // Interactive Form States
  const [quantities, setQuantities] = useState<Record<string, number>>({
    "item-1": 2, // Default quantities matching your sample
    "item-2": 10,
    "item-3": 0,
  });
  const [rushType, setRushType] = useState("rush"); // normal | rush | super_rush
  const [extraHours, setExtraHours] = useState(2);

  // Handle Qty Changes safely
  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  // Dynamic Calculations based on policy rules
  const invoiceDetails = useMemo(() => {
    // 1. Calculate active items total
    const itemBreakdown = AVAILABLE_ITEMS.map((item) => {
      const qty = quantities[item.id] || 0;
      return {
        ...item,
        qty,
        subtotal: qty * item.rate,
      };
    }).filter((i) => i.qty > 0);

    const itemsTotal = itemBreakdown.reduce((sum, item) => sum + item.subtotal, 0);

    // 2. Determine Rush Fee based on selected speed window
    let currentRushFee = 0;
    if (rushType === "rush") currentRushFee = PRICING.rushFee;
    if (rushType === "super_rush") currentRushFee = PRICING.superRushFee;

    // 3. Extra time beyond 2-hour management time
    const extraHoursCost = extraHours * PRICING.extraHourRate;

    // 4. Final calculation
    const grantTotal = PRICING.roundTripFee + itemsTotal + currentRushFee + extraHoursCost;

    return {
      itemBreakdown,
      itemsTotal,
      rushFee: currentRushFee,
      extraHoursCost,
      total: grantTotal,
    };
  }, [quantities, rushType, extraHours]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen print:bg-white print:p-0">
      
      {/* HEADER SECTION (HIDDEN IN PRINT) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <FileText className="h-5 w-5 text-blue-600" />
            Experian Warehouse Billing Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure dynamic pull rates, shipping rush logic, and generate sales orders.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition shadow-sm active:scale-95"
        >
          <Printer className="h-4 w-4" />
          Print / Save Sales Order
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* INTERACTIVE CONFIGURATOR (HIDDEN IN PRINT) */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h3 className="font-bold text-slate-900 text-md border-b pb-3 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-slate-400" />
              Configure Event & Items
            </h3>

            {/* Meta Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Client Team</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full p-2 border rounded-xl text-sm outline-none focus:border-blue-500 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Event Name</label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full p-2 border rounded-xl text-sm outline-none focus:border-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Dynamic Items Adjuster */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">Select Pull Quantities</label>
              <div className="space-y-2.5">
                {AVAILABLE_ITEMS.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">${item.rate} minimal rate / unit</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white border rounded-lg p-1 shadow-sm">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 transition"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-sm font-bold text-slate-800 w-6 text-center">
                        {quantities[item.id] || 0}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Speed / Timeline */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">Shipping Notice Window</label>
              <div className="grid grid-cols-1 gap-2">
                <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${rushType === "normal" ? "border-blue-500 bg-blue-50/30" : "hover:bg-slate-50"}`}>
                  <input type="radio" name="rush" checked={rushType === "normal"} onChange={() => setRushType("normal")} className="text-blue-600 focus:ring-blue-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Standard (&gt; 2 Weeks Notice)</p>
                    <p className="text-xs text-slate-500">No additional fees apply</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${rushType === "rush" ? "border-amber-500 bg-amber-50/30" : "hover:bg-slate-50"}`}>
                  <input type="radio" name="rush" checked={rushType === "rush"} onChange={() => setRushType("rush")} className="text-amber-600 focus:ring-amber-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 text-amber-800">
                      Rush Request (+${PRICING.rushFee})
                    </p>
                    <p className="text-xs text-slate-500">Shorter than two weeks notice</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${rushType === "super_rush" ? "border-rose-500 bg-rose-50/30" : "hover:bg-slate-50"}`}>
                  <input type="radio" name="rush" checked={rushType === "super_rush"} onChange={() => setRushType("super_rush")} className="text-rose-600 focus:ring-rose-500" />
                  <div>
                    <p className="text-sm font-semibold text-rose-900 flex items-center gap-1.5">
                      Super Rush (+${PRICING.superRushFee})
                    </p>
                    <p className="text-xs text-slate-500">Urgent 1 to 3 days delivery window</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Extra Labor hours */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Additional Processing Management (Hours)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  value={extraHours}
                  onChange={(e) => setExtraHours(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full p-2 border rounded-xl text-sm outline-none focus:border-blue-500 bg-slate-50/50"
                />
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">@ $85/hr flat rate</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Billed only if pull requires more than two hours of warehouse time.</p>
            </div>

          </div>
        </div>

        {/* CLIENT VISUAL LIVE SALES ORDER / INVOICE */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden print:border-none print:shadow-none">
          
          {/* Invoice Visual Branding Header */}
          <div className="p-8 border-b border-slate-100 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded w-max mb-1.5">
                Warehouse Sales Order
              </div>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                CODE BLK <span className="font-light text-slate-400">| Logistics</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Automated Billing Statement & Pull Sheet</p>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-400 space-y-0.5">
              <p className="font-bold text-white">Origin Facility:</p>
              <p>Storage Unit 3048-3059</p>
              <p>1019 W Dallas St, Houston, TX 77019</p>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-600">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                <span><b>Client:</b> {clientName || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                <span><b>Event Project:</b> {eventName || "—"}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <span><b>Est. Dispatch Date:</b> {eventDate || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                <span><b>Service Type:</b> Round-Trip Inbound/Outbound</span>
              </div>
            </div>
          </div>

          {/* Line Item Breakdown Table */}
          <div className="p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Cost Breakdown</h4>
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100">
                  <tr>
                    <th className="p-3.5 pl-4">Billing Line / Item Description</th>
                    <th className="p-3.5 text-center">Qty / Units</th>
                    <th className="p-3.5 text-right pr-4">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  
                  {/* Base Flat Rule Fee */}
                  <tr>
                    <td className="p-3.5 pl-4">
                      <div className="font-semibold text-slate-900">Standard Round-Trip Base Fee</div>
                      <div className="text-xs text-slate-400">Includes 2 hours standard agency management, dispatch out & shelf restock tracking.</div>
                    </td>
                    <td className="p-3.5 text-center font-medium text-slate-400">Flat Rate</td>
                    <td className="p-3.5 text-right pr-4 font-semibold text-slate-900">${PRICING.roundTripFee}.00</td>
                  </tr>

                  {/* Individual Dynamic Pull Fees */}
                  {invoiceDetails.itemBreakdown.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3.5 pl-4">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-400">Minimal pull rate handling asset tracking fee (${item.rate}/each)</div>
                      </td>
                      <td className="p-3.5 text-center font-semibold text-slate-800">{item.qty}</td>
                      <td className="p-3.5 text-right pr-4 font-semibold text-slate-900">${item.subtotal}.00</td>
                    </tr>
                  ))}

                  {/* Dynamic Rush Warnings */}
                  {invoiceDetails.rushFee > 0 && (
                    <tr className="bg-amber-50/40 text-amber-900">
                      <td className="p-3.5 pl-4">
                        <div className="font-semibold flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          Scheduling Notice Surcharge ({rushType.replace("_", " ")})
                        </div>
                        <div className="text-xs text-amber-600/90">Triggered by timeline request metrics smaller than standard 2-week notice window.</div>
                      </td>
                      <td className="p-3.5 text-center font-semibold text-amber-800">1</td>
                      <td className="p-3.5 text-right pr-4 font-semibold">${invoiceDetails.rushFee}.00</td>
                    </tr>
                  )}

                  {/* Additional Labor Surcharge */}
                  {invoiceDetails.extraHoursCost > 0 && (
                    <tr className="bg-rose-50/30 text-rose-900">
                      <td className="p-3.5 pl-4">
                        <div className="font-semibold flex items-center gap-1">
                          <Clock className="h-4 w-4 text-rose-500" />
                          Extended Agency Warehouse Overtime
                        </div>
                        <div className="text-xs text-rose-500/90">Complex or high-volume items requiring extensive packing workflows (${PRICING.extraHourRate}/hr).</div>
                      </td>
                      <td className="p-3.5 text-center font-semibold text-rose-800">{extraHours}h</td>
                      <td className="p-3.5 text-right pr-4 font-semibold">${invoiceDetails.extraHoursCost}.00</td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>

            {/* Total Block Wrapper */}
            <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col items-end gap-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Grand Total</div>
              <div className="text-3xl font-black text-blue-600 tracking-tight">
                ${invoiceDetails.total}.00
              </div>
            </div>
          </div>

          {/* Footer Logistics Disclaimers Policy */}
          <div className="bg-slate-50 border-t border-slate-100 p-6 text-[11px] text-slate-400 space-y-2">
            <p className="font-bold text-slate-500 uppercase tracking-wider">Policy Notes & Compliance:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>All warehouse shipping pulls must be initiated minimum two weeks via the Zoho/CB Portal to avoid expedited processing rush fees.</li>
              <li>Large freight shipments requiring specialized heavy box trucks or complex lift-gate project tracking will receive tailored cost estimations before final dispatch approvals.</li>
              <li>Damaged or unreturned assets upon post-event completion analysis updates will generate independent secondary audit logs.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}