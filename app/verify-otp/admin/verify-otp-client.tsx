"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, Mail, ArrowRight } from "lucide-react";

export default function VerifyOtpClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid OTP");
        return;
      }

      router.push("/dashboard/admin");
    } catch (err) {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-600/10 rounded-full flex items-center justify-center">
            <ShieldCheck className="text-blue-600 w-6 h-6" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mt-3">
            Verify Your Account
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            We sent a code to your email
          </p>
        </div>

        {/* Email Box */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 mb-5">
          <Mail className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600 truncate">{email}</span>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-100 p-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-5">

          <div>
            <label className="text-xs font-medium text-slate-600">
              Enter OTP Code
            </label>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="••••••"
              className="mt-2 w-full text-slate-600 text-center tracking-[10px] text-xl font-semibold border border-slate-200 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

        </form>

        {/* Footer */}
        {/* <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            Didn’t receive code?{" "}
            <button className="text-blue-600 font-medium hover:underline">
              Resend OTP
            </button>
          </p>
        </div> */}

      </div>
    </div>
  );
}