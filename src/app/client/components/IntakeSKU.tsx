"use client";

import React, { useState, useMemo } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Layers,
  Warehouse,
  TrendingUp,
  X,
  Edit2,
  Trash2,
} from "lucide-react";

// Mock Initial Data
const initialSkus = [
  {
    id: "SKU-001",
    name: "Marketing Kit Box",
    category: "Event Materials",
    stock: 120,
    location: "A-12 Shelf",
  },
  {
    id: "SKU-002",
    name: "Branded T-Shirts",
    category: "Apparel",
    stock: 45,
    location: "B-05 Rack",
  },
  {
    id: "SKU-003",
    name: "Presentation Stand",
    category: "Equipment",
    stock: 15, // Triggering low stock alert (< 20)
    location: "C-02 Zone",
  },
];

export default function IntakeSKU() {
  const [skus, setSkus] = useState(initialSkus);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State for new SKU
  const [newSku, setNewSku] = useState({
    name: "",
    category: "General",
    stock: "",
    location: "",
  });

  // Dynamic Metrics Calculation
  const totalSkus = skus.length;
  const totalStock = skus.reduce((acc, curr) => acc + Number(curr.stock), 0);
  const lowStockAlerts = skus.filter((sku) => sku.stock < 20).length;

  // Filtered List based on search
  const filteredSkus = useMemo(() => {
    return skus.filter(
      (sku) =>
        sku.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [skus, searchTerm]);

  // Handle Form Submission
  const handleAddSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku.name || !newSku.stock) return;

    const formattedSku = {
      id: `SKU-00${skus.length + 1}`,
      name: newSku.name,
      category: newSku.category,
      stock: parseInt(newSku.stock, 10),
      location: newSku.location || "N/A",
    };

    setSkus([formattedSku, ...skus]);
    setIsModalOpen(false);
    setNewSku({ name: "", category: "General", stock: "", location: "" });
  };

  // Delete Action
  const handleDelete = (id: string) => {
    setSkus(skus.filter((item) => item.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-screen">
      
      {/* HEADER CARD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                Intake & SKU Inventory
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Manage warehouse stock, locations, and inventory flow seamlessly.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold shadow-sm shadow-blue-100 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          Add New SKU
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">Total SKUs</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{totalSkus}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">Total Stock Units</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{totalStock}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Warehouse className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">Low Stock Alerts</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{lowStockAlerts}</h3>
          </div>
          <div className={`p-3 rounded-xl ${lowStockAlerts > 0 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-slate-50 text-slate-400"}`}>
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* CONTROLS (SEARCH & FILTER) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center shadow-sm">
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-50 transition-all rounded-xl px-3.5 py-1.5 flex-1 w-full">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search SKU name, ID, category, or location..."
            className="w-full outline-none text-sm bg-transparent text-slate-800 placeholder-slate-400 py-1"
          />
        </div>

        <button className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-slate-50 active:bg-slate-100 transition">
          <Filter className="h-4 w-4" />
          Filter options
        </button>
      </div>

      {/* INVENTORY TABLE CARD */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Inventory List</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredSkus.length} of {totalSkus} available products
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-50/70 text-slate-500 tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="p-4 pl-6">Product Details / SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Warehouse Location</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSkus.length > 0 ? (
                filteredSkus.map((sku) => (
                  <tr key={sku.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {sku.name}
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">
                        {sku.id}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 border border-slate-200/60">
                        {sku.category}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-base ${sku.stock < 20 ? "text-rose-600" : "text-slate-800"}`}>
                          {sku.stock}
                        </span>
                        {sku.stock < 20 && (
                          <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold rounded bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
                            Low
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-sm font-medium bg-amber-50 text-amber-800 border border-amber-200/40 px-2 py-0.5 rounded-md">
                        {sku.location}
                      </span>
                    </td>

                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(sku.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                    No matching items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD SKU MODAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl border shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Add New Inventory Item
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSku} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Item Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Premium Tech Backpack"
                  value={newSku.name}
                  onChange={(e) => setNewSku({ ...newSku, name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Category</label>
                  <select
                    value={newSku.category}
                    onChange={(e) => setNewSku({ ...newSku, category: e.target.value })}
                    className="w-full p-2.5 border rounded-xl text-sm bg-white outline-none focus:border-blue-500 transition"
                  >
                    <option value="General">General</option>
                    <option value="Event Materials">Event Materials</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Stock Qty *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newSku.stock}
                    onChange={(e) => setNewSku({ ...newSku, stock: e.target.value })}
                    className="w-full p-2.5 border rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Warehouse Location</label>
                <input
                  type="text"
                  placeholder="e.g., D-04 Rack"
                  value={newSku.location}
                  onChange={(e) => setNewSku({ ...newSku, location: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}