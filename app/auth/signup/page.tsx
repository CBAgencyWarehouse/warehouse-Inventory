// app/signup/page.tsx
"use client";

import React, { useState } from 'react';
import { Package, ShieldCheck, Lock, Mail, Building, User, ArrowRight, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  
  // FORM STATES
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // UTILITY STATES
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // VALIDATE STEP 1 BEFORE MOVING FORWARD
  const handleNextStep = () => {
    setError('');
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all security fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setStep(2);
  };

  // FINAL SUBMIT HANDLER
  const handleActivationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, companyName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        // کامیابی کی صورت میں لاگ ان پیج پر بھیج دیں
        window.location.href = '/auth/login';
      }
    } catch (err) {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* LEFT SIDE: INVITATION ONBOARDING INFO */}
      <div className="md:w-1/2 bg-slate-900 text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Abstract Decorative Gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

        {/* Brand Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight block">CB Core</span>
            <span className="text-xs text-slate-400">Inventory Ecosystem</span>
          </div>
        </div>

        {/* Middle Value Text */}
        <div className="my-auto py-12 relative z-10 max-w-md">
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-wider">
            Secure Invitation Setup
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-4 leading-tight">
            Activate Your Portal Account.
          </h1>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Welcome to the CB Inventory Ecosystem. Once your account activation is complete, you will gain full visibility into active warehouse assets, round-trip booking rates, and the 2-week event cart system.
          </p>

          {/* Expectations List */}
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3.5 text-sm text-slate-300">
              <div className="p-1 bg-slate-800 border border-slate-700 rounded-lg text-blue-400 mt-0.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-200 text-xs">Verify Pre-Registered Email</p>
                <p className="text-xxs text-slate-400 mt-0.5">Your email must match the account created by Code BLK.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3.5 text-sm text-slate-300">
              <div className="p-1 bg-slate-800 border border-slate-700 rounded-lg text-blue-400 mt-0.5">
                <Package className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-200 text-xs">Access the Event Cart</p>
                <p className="text-xxs text-slate-400 mt-0.5">Instantly select items, add to cart, and provide shipping schedules.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-500 relative z-10">
          &copy; 2026 CB Logistics Ecosystem. Verified Enterprise Flow.
        </div>
      </div>

      {/* RIGHT SIDE: INTERACTIVE ACTIVATION FORM */}
      <div className="flex-1 bg-white p-8 md:p-16 flex items-center justify-center">
        <div className="w-full max-w-sm space-y-8">
          
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Account Activation</h2>
            <p className="text-sm text-slate-500 mt-1.5">
              {step === 1 ? "Step 1: Link your pre-generated credentials" : "Step 2: Complete your organization profile"}
            </p>
            
            {/* Visual Step Indicator Progress Bar */}
            <div className="w-full bg-slate-100 h-1 mt-4 rounded-full overflow-hidden flex gap-1">
              <div className="bg-blue-600 flex-1 h-full"></div>
              <div className={`flex-1 h-full transition-all duration-300 ${step === 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            </div>
          </div>

          {/* ERROR CALLOUT */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-xl">
              {error}
            </div>
          )}

          {/* THE FORM */}
          <form className="space-y-5" onSubmit={handleActivationSubmit}>
            
            {step === 1 ? (
              /* STEP 1 FIELDS: CREDENTIALS SETUP */
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Username / Pre-Registered Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="username@experian.com" 
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Create Secure Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-900"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-blue-600/10 flex items-center justify-center gap-2 group transition-all mt-4"
                >
                  Continue to Profile
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </>
            ) : (
              /* STEP 2 FIELDS: COMPANY INFO */
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe" 
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Company / Division Name</label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Experian Marketing / HR" 
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <input 
                    id="terms" 
                    type="checkbox" 
                    className="h-4 w-4 text-blue-600 border-slate-300 rounded accent-blue-600 cursor-pointer"
                    required
                  />
                  <label htmlFor="terms" className="text-xs text-slate-600 font-medium cursor-pointer select-none">
                    I agree to the 2-week advance request policy.
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-blue-600/10 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      "Complete Setup"
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Bottom Redirect */}
          <div className="text-center">
            <p className="text-xs text-slate-500">
              Already activated your account?{" "}
              <a href="/auth/login" className="font-bold text-blue-600 hover:underline">
                Sign In
              </a>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}