"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const industries = [
  "Healthcare & Pharmaceuticals",
  "IT & Technology",
  "Banking & Financial Services",
  "Manufacturing",
  "Real Estate",
  "Education",
  "Global Operations (BPO/KPO)",
  "Other",
];

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    industry: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    notes: "",
    status: "PROSPECT",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/crm/clients");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/crm/clients" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          ← Back to Clients
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 mt-4 mb-1">New Client</h1>
        <p className="text-zinc-500 text-sm">Add a new company to your CRM</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-8 flex flex-col gap-6">
        {/* Company name */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Company Name <span className="text-red-500">*</span></label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            placeholder="Acme Corp"
            className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Industry <span className="text-red-500">*</span></label>
          <select
            value={form.industry}
            onChange={(e) => set("industry", e.target.value)}
            required
            className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors bg-white"
          >
            <option value="" disabled>Select an industry</option>
            {industries.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Contact Name <span className="text-red-500">*</span></label>
            <input
              value={form.contactName}
              onChange={(e) => set("contactName", e.target.value)}
              required
              placeholder="Jane Smith"
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Status</label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors bg-white"
            >
              <option value="PROSPECT">Prospect</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
              placeholder="contact@company.com"
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors"
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Website</label>
          <input
            type="url"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            placeholder="https://company.com"
            className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            placeholder="Any additional context..."
            className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-zinc-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save Client"}
          </button>
          <Link
            href="/crm/clients"
            className="border border-zinc-200 text-zinc-600 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
