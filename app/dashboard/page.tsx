"use client";
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Truck, 
  Clock, 
  FileText, 
  Layers, 
  Plus, 
  Search, 
  Bell, 
  Sliders,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Loader2
} from 'lucide-react';

// Mock Data for the Dashboard
const stats = [
  { id: 1, name: 'Total SKU Stock', value: '1,248', icon: Layers, change: '+12 this week', changeType: 'positive' },
  { id: 2, name: 'Pending Pull Requests', value: '14', icon: Clock, change: '4 requires Rush Fee', changeType: 'warning' },
  { id: 3, name: 'Active Shipments', value: '28', icon: Truck, change: '12 Experian Events', changeType: 'neutral' },
  { id: 4, name: 'Uninvoiced Orders', value: '$2,380', icon: FileText, change: 'Manual review pending', changeType: 'billing' },
];

const recentRequests = [
  {
    id: "ORD-2026-089",
    client: "Experian Team Alpha",
    event: "Annual Tech Summit",
    shipDate: "June 18, 2026",
    status: "Pending Pull",
    items: 24,
    type: "Standard"
  },
  {
    id: "ORD-2026-090",
    client: "Experian HR Dept",
    event: "Houston Job Fair",
    shipDate: "June 08, 2026",
    status: "Rush Order",
    items: 7,
    type: "Rush ($50 Fee)"
  },
  {
    id: "ORD-2026-091",
    client: "Experian Marketing",
    event: "CB Warehouse Return",
    shipDate: "June 03, 2026",
    status: "Processing Return",
    items: 15,
    type: "Round-Trip"
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // 1. ہٹ کریں ہمارے بنائے ہوئے آؤٹ API روٹ کو جو کوکیز صاف کرے گا
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear server cookies');
      }
      
      // 2. لوکل اسٹوریج کو بھی کلین کر دیں
      localStorage.removeItem('userData'); 
      localStorage.removeItem('userToken');
      
      // 3. پریمیم فیل کے لیے ہلکا سا ڈیلے
      await new Promise((resolve) => setTimeout(resolve, 600));

      // 4. لاگ ان پیج پر ری ڈائریکٹ اور ریفریش تاکہ اسٹیٹ فریش ہو جائے
      router.push('/auth/login'); 
      router.refresh(); 
      
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      
      {/* 1. SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col justify-between hidden md:flex border-r border-slate-800">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <span className="text-white font-bold text-lg tracking-tight block">CB Core</span>
                <span className="text-xs text-slate-500 font-medium">Inventory Ecosystem</span>
              </div>
            </div>
          </div>
          
          <nav className="p-4 space-y-1.5">
            <p className="px-3 text-xxs font-semibold uppercase tracking-wider text-slate-600 mb-2">Operations</p>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800 text-white font-medium text-sm transition-all">
              <Layers className="h-4 w-4 text-blue-500" /> Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/60 hover:text-slate-200 font-medium text-sm transition-all">
              <Package className="h-4 w-4" /> Intake & SKUs
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/60 hover:text-slate-200 font-medium text-sm transition-all">
              <Truck className="h-4 w-4" /> Shipping Requests
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/60 hover:text-slate-200 font-medium text-sm transition-all">
              <Clock className="h-4 w-4" /> Returns & Audits
            </a>

            <p className="px-3 text-xxs font-semibold uppercase tracking-wider text-slate-600 mt-6 mb-2">Finance & Billing</p>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/60 hover:text-slate-200 font-medium text-sm transition-all">
              <FileText className="h-4 w-4" /> Manual Invoicing
            </a>
          </nav>
        </div>

        {/* PROFILE SECTION WITH LOGOUT */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-800/30 transition-all group">
            
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                CL
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-slate-200 truncate">Chynell L.</p>
                <p className="text-xs text-slate-500 truncate">Admin / Marketing</p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`p-2 rounded-lg transition-all ${
                isLoggingOut 
                  ? 'text-slate-600 bg-slate-800 cursor-not-allowed' 
                  : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
              }`}
              title="Log out"
              aria-label="Log out"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin text-rose-400" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </button>

          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER */}
        <header className="h-20 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 md:px-8 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search inventory, SKU, bin locations or event requests..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-blue-600/10 transition-all">
              <Plus className="h-4 w-4" /> New Intake
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTAINER */}
        <div className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto">
          
          {/* WELCOME BANNER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fulfillment Control Center</h1>
              <p className="text-sm text-slate-500 mt-1">Hey Chynell, here is the real-time status of Experian warehouse operations and custom flow pipeline.</p>
            </div>
            <div className="flex items-center gap-2.5 self-start md:self-center bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-xl text-xs font-medium">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Accounting Sync: Manual invoicing toggle is active for custom event pricing.</span>
            </div>
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.id} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">{stat.name}</span>
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-700">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                    <p className={`text-xs font-medium mt-1 ${
                      stat.changeType === 'positive' ? 'text-emerald-600' :
                      stat.changeType === 'warning' ? 'text-amber-600' :
                      stat.changeType === 'billing' ? 'text-blue-600' : 'text-slate-500'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TWO COLUMN WORKFLOW SECTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT: SHIPPING REQUESTS & FULFILLMENT PIPELINE */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Experian Event Requests</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Submitted via CB Client Portal (Requires 2-week notice buffer)</p>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                  <Sliders className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Event & Client</th>
                      <th className="py-3.5 px-4">Ship Date</th>
                      <th className="py-3.5 px-4">Items</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {recentRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-slate-50/40 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-900">{request.event}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>{request.client}</span>
                            <span className="inline-block h-1 w-1 bg-slate-300 rounded-full"></span>
                            <span className="font-mono text-slate-500">{request.id}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600 font-medium">{request.shipDate}</td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200/60 rounded-lg font-medium text-xs text-slate-700">
                            {request.items} items
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            request.status === 'Rush Order' 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200/60' 
                              : request.status === 'Processing Return'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              request.status === 'Rush Order' ? 'bg-rose-500' : request.status === 'Processing Return' ? 'bg-amber-500' : 'bg-blue-500'
                            }`}></span>
                            {request.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-all">
                            Process Pull
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT: SMART QUICK-BILLING & LOGISTICS TOOLS */}
            <div className="space-y-6">
              
              {/* BILLING SIMULATOR */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute right-[-20px] top-[-20px] h-32 w-32 bg-blue-600/10 rounded-full blur-2xl"></div>
                
                <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400" /> CB Billing Matrix Helper
                </h3>
                <p className="text-xs text-slate-400 mt-1">Quick estimate builder before routing to manual invoicing software.</p>
                
                <div className="mt-5 space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Base Round-Trip Fee:</span>
                    <span className="font-semibold text-slate-200">$170.00</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Rush Window Fee:</span>
                    <span className="font-semibold text-amber-400">+$50.00</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Est. Pull Rate Layer:</span>
                    <span className="font-semibold text-slate-200">Minimal Asset Rates</span>
                  </div>
                  <div className="h-px bg-slate-800 my-2"></div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-300">Suggested Invoice:</span>
                    <span className="font-bold text-emerald-400">$220.00 + pull</span>
                  </div>
                </div>

                <button className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all">
                  Copy Invoice Line Items
                </button>
              </div>

              {/* WAREHOUSE MAPPING */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Warehouse Map Status</h3>
                  <p className="text-xs text-slate-400">Physical layout mapping logs</p>
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Storage Unit 3048-3059</p>
                      <p className="text-xxs text-slate-400">1019 W Dallas St, Houston</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">84% Full</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">CB Office HQ Hub</p>
                      <p className="text-xxs text-slate-400">9894 Bissonnet St, Ste 908</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Optimal</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

    </div>
  );
}