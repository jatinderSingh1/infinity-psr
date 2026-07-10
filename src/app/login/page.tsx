"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/crm");
    }
  }

  const inputCls =
    "w-full border border-[#b5b5b5] rounded-lg px-3.5 py-2.5 text-sm bg-white text-[#1a1a1a] placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30 focus:border-[#005bd3] transition-shadow";

  return (
    <div className="min-h-screen bg-[#f1f1f1] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="h-12 w-auto" />
          <span className="text-[#1a1a1a] font-bold text-lg tracking-tight">INFINITY AURA</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#e3e3e3] shadow-sm p-7">
          <h1 className="text-lg font-bold text-[#1a1a1a] mb-1">Log in</h1>
          <p className="text-[13px] text-[#616161] mb-6">Continue to your dashboard</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={inputCls}
              />
            </div>
            {error && (
              <div className="bg-[#fedad9] border border-[#e0b3b2] rounded-lg px-3.5 py-2.5">
                <p className="text-[13px] text-[#8e1f0b]">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-[#1a1a1a] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#303030] transition-colors disabled:opacity-50 mt-1 shadow-sm cursor-pointer"
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#8a8a8a] mt-4">ERP / CRM · Internal use only</p>
      </div>
    </div>
  );
}
