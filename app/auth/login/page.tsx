// app/login/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Package, ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState<'client' | 'warehouse'>('client');
  
  // فارم اسٹیٹس
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // لاگ ان سبمٹ ہینڈلر
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid email or password.");
      } else {
        // لاگ ان کامیاب ہونے پر ڈیش بورڈ پر بھیجیں
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError("Failed to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* LEFT SIDE: PREMIUM BRANDING & WORKFLOW INFOGRAPHIC */}
      <div className="md:w-1/2 bg-slate-900 text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Abstract Background Light */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        {/* Top Logo Area */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight block">CB Core</span>
            <span className="text-xs text-slate-400">Inventory & Fulfillment</span>
          </div>
        </div>

        {/* Center Content / Workflow Value Proposition */}
        <div className="my-auto py-12 relative z-10 max-w-md">
          <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-full uppercase tracking-wider">
            Enterprise Logistics
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-4 leading-tight">
            Centralized Asset Management Platform.
          </h1>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Streamlining inventory intake, 2-week event buffers, round-trip tracking, and automated fulfillment workflows for Experian teams.
          </p>

          {/* Quick Checklist */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Real-time Zoho System Mapping Replacement</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Instant Event Portal Requests & Cart Pulls</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Text */}
        <div className="text-xs text-slate-500 relative z-10">
          &copy; 2026 CB Logistics Ecosystem. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: CLEAN LOGIN FORM */}
      <div className="flex-1 bg-white p-8 md:p-16 flex items-center justify-center">
        <div className="w-full max-w-sm space-y-8">
          
          {/* Header Description */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-sm text-slate-500 mt-1.5">Sign in to manage your events or track assets.</p>
          </div>

          {/* ROLE SELECTOR TABS (Experian vs Warehouse Admin) */}
          <div className="p-1 bg-slate-100 border border-slate-200/60 rounded-xl flex">
            <button
              type="button"
              onClick={() => setRole('client')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                role === 'client' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Experian Client
            </button>
            <button
              type="button"
              onClick={() => setRole('warehouse')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                role === 'warehouse' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              CB Warehouse / Admin
            </button>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* FORM */}
          <form className="space-y-5" onSubmit={handleLoginSubmit}>
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Username / Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'client' ? 'yourname@experian.com' : 'admin@cb.com'} 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 block">Password</label>
                <a href="#" className="text-xs font-medium text-blue-600 hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center">
              <input 
                id="remember-me" 
                type="checkbox" 
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded-md accent-blue-600"
              />
              <label htmlFor="remember-me" className="ml-2 text-xs text-slate-600 font-medium cursor-pointer select-none">
                Keep me logged in
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-blue-600/10 flex items-center justify-center gap-2 group transition-all mt-2 disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In to Dashboard"}
              {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
            </button>
          </form>

          {/* SIGN UP REDIRECT LINK */}
          <div className="text-center pt-1 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              New to the platform?{" "}
              <Link 
                href="/auth/signup" 
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors ml-1 inline-flex items-center gap-0.5"
              >
                Activate Account
              </Link>
            </p>
          </div>

          {/* Experian Setup Notice */}
          {role === 'client' && (
            <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl mt-4">
              <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
                <strong>New Experian User?</strong> Code BLK will register you directly. Click the <strong>Activate Account</strong> link above with your pre-generated email to get started.
              </p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}