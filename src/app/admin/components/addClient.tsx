"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

export default function AddClient({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    companyName: "",
    // password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to create client");
        return;
      }

      alert("Client created successfully");

      onSuccess?.();
      onClose();
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-xl relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-slate-400 hover:text-slate-900"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h2 className="text-base font-bold mb-4 text-slate-900">
          Add New Client
        </h2>

        {/* Inputs */}
        <div className="space-y-3">
          <input
            name="name"
            placeholder="Name"
            onChange={handleChange}
            className="w-full border border-slate-200 p-2 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full border border-slate-200 p-2 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />

          {/* <input
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
            className="w-full border border-slate-200 p-2 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          /> */}

          <input
            name="companyName"
            placeholder="Company"
            onChange={handleChange}
            className="w-full border border-slate-200 p-2 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />

          {/* <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full border border-slate-200 p-2 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          /> */}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-xs transition-all"
        >
          {loading ? "Creating..." : "Create Client"}
        </button>
      </div>
    </div>
  );
}