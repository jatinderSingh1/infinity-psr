"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Client = { id: string; name: string };

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [reqInput, setReqInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    clientId: "",
    description: "",
    requirements: [] as string[],
    salary: "",
    location: "",
    status: "OPEN",
  });

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients);
  }, []);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addReq() {
    const r = reqInput.trim();
    if (r && !form.requirements.includes(r)) {
      setForm((f) => ({ ...f, requirements: [...f.requirements, r] }));
    }
    setReqInput("");
  }

  function removeReq(req: string) {
    setForm((f) => ({ ...f, requirements: f.requirements.filter((r) => r !== req) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/crm/jobs");
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
        <Link href="/crm/jobs" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          ← Back to Job Orders
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 mt-4 mb-1">New Job Order</h1>
        <p className="text-zinc-500 text-sm">Create a new role to fill</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-8 flex flex-col gap-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Job Title <span className="text-red-500">*</span></label>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
            placeholder="Senior Software Engineer"
            className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Client & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Client <span className="text-red-500">*</span></label>
            <select
              value={form.clientId}
              onChange={(e) => set("clientId", e.target.value)}
              required
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors bg-white"
            >
              <option value="" disabled>Select a client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {clients.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No clients yet. <Link href="/crm/clients/new" className="underline">Add one first.</Link>
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Status</label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors bg-white"
            >
              <option value="OPEN">Open</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="FILLED">Filled</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Salary & Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Salary / Range</label>
            <input
              value={form.salary}
              onChange={(e) => set("salary", e.target.value)}
              placeholder="$90k – $120k"
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Location</label>
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Toronto, ON / Remote"
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={4}
            placeholder="Role overview, responsibilities..."
            className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors resize-none"
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Requirements</label>
          <div className="flex gap-2 mb-3 flex-wrap">
            {form.requirements.map((r) => (
              <span key={r} className="flex items-center gap-1.5 bg-zinc-100 text-zinc-700 text-xs font-medium px-3 py-1.5 rounded-full">
                {r}
                <button type="button" onClick={() => removeReq(r)} className="text-zinc-400 hover:text-zinc-700 transition-colors">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={reqInput}
              onChange={(e) => setReqInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addReq())}
              placeholder="e.g. 5+ years experience"
              className="flex-1 border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors"
            />
            <button
              type="button"
              onClick={addReq}
              className="bg-zinc-100 text-zinc-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              Add
            </button>
          </div>
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
            {loading ? "Saving…" : "Save Job Order"}
          </button>
          <Link
            href="/crm/jobs"
            className="border border-zinc-200 text-zinc-600 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
