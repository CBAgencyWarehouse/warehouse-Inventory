"use client";

import React, { useEffect, useState } from "react";
import {
  Users, Search, Mail, Phone, Truck, Calendar, Eye, Plus, X, Building2, Loader2, ShieldCheck, UserCheck
} from "lucide-react";
import AddClient from "./addClient";

// ─── Types ─────────────────────────────
type ClientStatus = "Active" | "Inactive" | "Pending Setup";

type Client = {
  id: string;
  name: string | null;
  email: string;
  phone?: string;
  companyName?: string;
  role: "CLIENT" | "CB";
  createdAt: string;
};

// ─── Helpers ───────────────────────────
const initials = (name: string | null) =>
  (name || "NA")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

// ─── Main Component ────────────────────
export default function ClientsPanel() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);

  // ─── Fetch API ───────────────────────
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("/api/users/dashboard/clients", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setClients(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // ─── Filter ───────────────────────────
  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto p-2">

      {/* ─── Header Section ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Clients Directory
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Manage your network of <span className="font-medium text-slate-700">{clients.length} total users</span> (Clientele & CB Teams)
          </p>
        </div>

        <button
          onClick={() => setShowAddClient(true)}
          className="flex items-center justify-center gap-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition px-4 py-2.5 rounded-xl shadow-sm active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> Add Client
        </button>

        {showAddClient && (
          <AddClient onClose={() => setShowAddClient(false)} onSuccess={() => setShowAddClient(false)} />
        )}
      </div>

      {/* ─── Action Bar (Search) ─── */}
      <div className="flex items-center bg-white border border-slate-200/80 rounded-xl px-3 py-2 w-full max-w-sm shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
        <Search className="h-4 w-4 text-slate-400 mr-2.5 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or user ID..."
          className="text-sm bg-transparent outline-none w-full text-slate-700 placeholder:text-slate-400"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ─── Main Content / Table Area ─── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm text-slate-500 font-medium">Fetching directory records...</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-600 font-medium text-xs tracking-wider uppercase">
                  <th className="px-6 py-4 text-left">Client Profile</th>
                  <th className="px-6 py-4 text-left">Email Address</th>
                  <th className="px-6 py-4 text-left">Role Mapping</th>
                  <th className="px-6 py-4 text-left">Joined On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/60 transition cursor-pointer group"
                    onClick={() => setSelectedClient(c)}
                  >
                    {/* Profile & Name */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-50 to-blue-100/60 text-blue-700 rounded-xl flex items-center justify-center font-bold text-xs border border-blue-200/30">
                          {initials(c.name)}
                        </div>
                        <span className="font-medium text-slate-900 group-hover:text-blue-600 transition">
                          {c.name || "No Name Assigned"}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-3.5">
                      <span className="text-slate-600 font-normal">
                        {c.email}
                      </span>
                    </td>

                    {/* Dynamic Role Badges */}
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                          c.role === "CB"
                            ? "bg-purple-50 text-purple-700 border border-purple-100"
                            : "bg-blue-50 text-blue-700 border border-blue-100"
                        }`}
                      >
                        {c.role === "CB" ? <ShieldCheck className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                        {c.role}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-3.5 text-slate-500 font-medium text-xs">
                      {new Date(c.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Action Icon */}
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-50 border border-slate-100 opacity-0 group-hover:opacity-100 transition duration-150">
                        <Eye className="h-4 w-4 text-slate-500" />
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty State */}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-16 px-4">
                      <div className="max-w-xs mx-auto flex flex-col items-center">
                        <div className="h-10 w-10 bg-slate-50 border rounded-xl flex items-center justify-center text-slate-400 mb-3">
                          <Search className="h-5 w-5" />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800">No records found</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          We couldn't find any clients match matching "{search}". Try checking your spelling.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Premium Side Drawer Modal ─── */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSelectedClient(null)}
          />

          {/* Drawer Sheet */}
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-slate-100">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Client Insights</span>
              <button 
                onClick={() => setSelectedClient(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Body content */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              
              {/* Profile Card Section */}
              <div className="flex items-center gap-4 bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 rounded-2xl border border-slate-100">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm">
                  {initials(selectedClient.name)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{selectedClient.name || "No Name"}</h4>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">ID: {selectedClient.id}</p>
                </div>
              </div>

              {/* Information Grid Cards */}
              <div className="space-y-3">
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Contact Metadata</h5>
                
                {/* Email Box */}
                <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><Mail className="h-4 w-4" /></div>
                  <div className="flex flex-col"><span className="text-slate-400 text-[10px]">Email Address</span><span className="text-xs font-medium text-slate-800">{selectedClient.email}</span></div>
                </div>

                {/* Role Box */}
                <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                    {selectedClient.role === "CB" ? <ShieldCheck className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </div>
                  <div className="flex flex-col"><span className="text-slate-400 text-[10px]">Account Permissions</span><span className="text-xs font-semibold text-slate-800">{selectedClient.role === "CB" ? "Core Executive (CB)" : "Standard Client"}</span></div>
                </div>

                {/* Account Created Box */}
                <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><Calendar className="h-4 w-4" /></div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-[10px]">Registration Timeline</span>
                    <span className="text-xs font-medium text-slate-800">
                      {new Date(selectedClient.createdAt).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Action Inside Drawer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
              <button 
                onClick={() => setSelectedClient(null)} 
                className="w-full text-center py-2 bg-slate-900 text-white font-medium text-xs rounded-xl hover:bg-slate-800 transition"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}