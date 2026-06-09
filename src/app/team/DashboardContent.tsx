"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Truck,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Activity,
  ArrowUpRight,
  ClipboardList,
  RefreshCw,
} from "lucide-react";

type DashboardContentProps = {
  onNavigate: (targetPage: string) => void;
};

export default function DashboardPage({ onNavigate }: DashboardContentProps) {
  const router = useRouter();

  const [stats, setStats] = useState({
    totalItems: 0,
    pendingOrders: 0,
    activeReturns: 0,
    issues: 0,
  });

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // FETCH DASHBOARD STATS
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/inventory/dashboard/stats", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchStats();
  }, []);

  // FETCH ACTIVITIES
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch("/api/inventory/dashboard/activity", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setActivities(data.data);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  // FUNCTIONAL QUICK ACTIONS MATRIX
  const quickActions = [
    {
      label: "View Pending Shipping Requests",
      route: "/dashboard/orders?status=PENDING",
      id: "pending_shipments",
      badge: stats.pendingOrders, // Dynamic badge from state
      icon: Truck,
      bgIcon: "bg-orange-50 text-orange-600 border-orange-100",
    },
    {
      label: "Check Inventory Intake Queue",
      route: "/dashboard/inventory/intake",
      id: "inventory_intake",
      badge: null,
      icon: ClipboardList,
      bgIcon: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      label: "Review Return Verifications",
      route: "/dashboard/returns?status=PENDING",
      id: "return_verifications",
      badge: stats.activeReturns, // Dynamic badge from state
      icon: RefreshCw,
      bgIcon: "bg-amber-50 text-amber-600 border-amber-100",
    },
  ];

  // Router handler with visual loader feedback
  const handleActionClick = async (route: string, id: string) => {
    setActionLoading(id);
    router.push(route);
    // Note: Next.js pre-fetches, context routing handles state transitions swiftly.
  };

  const getActivityIcon = (activity: any) => {
    if (activity.type === "ORDER") {
      switch (activity.status) {
        case "APPROVED":
          return (
            <div className="p-1.5 bg-green-50 rounded-lg text-green-600 border border-green-100">
              <CheckCircle className="h-4 w-4 stroke-[2.5]" />
            </div>
          );
        case "PENDING":
          return (
            <div className="p-1.5 bg-orange-50 rounded-lg text-orange-600 border border-orange-100">
              <Clock className="h-4 w-4 stroke-[2.5]" />
            </div>
          );
        default:
          return (
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
              <Truck className="h-4 w-4 stroke-[2.5]" />
            </div>
          );
      }
    }
    return (
      <div className="p-1.5 bg-gray-50 rounded-lg text-gray-600 border border-gray-100">
        <Activity className="h-4 w-4 stroke-[2.5]" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 sm:p-8 space-y-8 max-w-7xl mx-auto antialiased">
      
      {/* HEADER */}
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Warehouse Overview
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Real-time inventory & operations summary
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat Cards Matrix mapping */}
        {[
          { title: "Total Items", value: stats.totalItems, icon: Package, color: "text-blue-600", bg: "bg-blue-50", border: "hover:border-blue-200" },
          { title: "Pending Shipments", value: stats.pendingOrders, icon: Truck, color: "text-orange-600", bg: "bg-orange-50", border: "hover:border-orange-200" },
          { title: "Active Returns", value: stats.activeReturns, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "hover:border-amber-200" },
          { title: "Issues / Alerts", value: stats.issues, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50", border: "hover:border-rose-200" }
        ].map((item, i) => (
          <div
            key={i}
            className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${item.border} flex items-center justify-between group`}
          >
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">{item.title}</p>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{item.value.toLocaleString()}</p>
            </div>
            <div className={`p-3.5 rounded-xl ${item.bg} ${item.color} transition-transform duration-300 group-hover:scale-110`}>
              <item.icon className="h-6 w-6 stroke-[2.25]" />
            </div>
          </div>
        ))}
      </div>

      {/* MIDDLE SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* QUICK ACTIONS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">
              Quick Actions
            </h2>
            <div className="space-y-3">
              {quickActions.map((action) => {
                const ActionIcon = action.icon;
                const isThisLoading = actionLoading === action.id;
                
                return (
                  <button
                    key={action.id}
                    disabled={actionLoading !== null}
                    onClick={() => handleActionClick(action.route, action.id)}
                    className="w-full flex items-center justify-between text-left px-4 py-3.5 bg-gray-50 hover:bg-gray-900 text-gray-700 hover:text-white font-semibold text-sm rounded-xl transition-all duration-200 group border border-gray-100/70 hover:border-transparent disabled:opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg border bg-white group-hover:bg-white/10 group-hover:border-transparent group-hover:text-white transition-colors duration-200`}>
                        <ActionIcon className="h-4 w-4 stroke-[2.25]" />
                      </div>
                      <span>{action.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Dynamic Badge Display */}
                      {action.badge !== null && action.badge > 0 && !isThisLoading && (
                        <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-800 group-hover:bg-white/20 group-hover:text-white font-bold rounded-md transition-colors duration-200">
                          {action.badge}
                        </span>
                      )}
                      {isThisLoading ? (
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">
            Recent Activity
          </h2>

          {loading ? (
            <div className="space-y-3 animate-pulse flex-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No recent activity found.</p>
          ) : (
            <div className="flow-root flex-1">
              <ul className="-mb-8 space-y-4">
                {activities.map((activity, i) => (
                  <li key={activity.id || i} className="flex gap-4 items-start bg-gray-50/60 hover:bg-gray-50 p-3 rounded-xl border border-gray-100/70 transition-colors duration-150">
                    {getActivityIcon(activity)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 capitalize">
                        {activity.text}
                      </p>
                      <p className="text-xs text-gray-500 font-semibold mt-0.5 tracking-wide">
                        {activity.subText}
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="text-[11px] font-medium text-gray-400">
                        {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[9px] text-gray-400 font-bold tracking-tight uppercase">
                        {new Date(activity.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}