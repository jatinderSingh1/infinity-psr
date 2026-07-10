"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Contact {
  id: string;
  firstName: string;
  lastName: string | null;
  company: string | null;
}

interface Industry {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
}

interface Deal {
  id: string;
  title: string;
  stage: string;
  value: number | null;
  currency: string;
  priority: string;
  notes: string | null;
  contact: Contact;
  industry: Industry;
}

interface DealBoardProps {
  initialDeals: Deal[];
  industries: Industry[];
  contacts: Contact[];
  industrySlug: string;
}

const STAGES = [
  { key: "LEAD", label: "Lead", color: "#6b7280" },
  { key: "CONTACTED", label: "Contacted", color: "#3b82f6" },
  { key: "PROPOSAL", label: "Proposal", color: "#8b5cf6" },
  { key: "NEGOTIATION", label: "Negotiation", color: "#f59e0b" },
  { key: "WON", label: "Won", color: "#10b981" },
  { key: "LOST", label: "Lost", color: "#ef4444" },
];

const CURRENCIES = ["CAD", "USD", "INR", "GBP", "EUR", "AED", "SGD", "AUD"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

function formatValue(value: number | null, currency: string) {
  if (!value) return null;
  const symbols: Record<string, string> = {
    CAD: "$", USD: "US$", INR: "₹", GBP: "£", EUR: "€", AED: "AED ", SGD: "S$", AUD: "A$",
  };
  return `${symbols[currency] ?? currency + " "}${value.toLocaleString()}`;
}

export function DealBoard({ initialDeals, industries, contacts, industrySlug }: DealBoardProps) {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [showForm, setShowForm] = useState(false);
  const [filterIndustry, setFilterIndustry] = useState(industrySlug);
  const [form, setForm] = useState({
    title: "",
    contactId: "",
    industryId: "",
    value: "",
    currency: "CAD",
    stage: "LEAD",
    priority: "MEDIUM",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const filtered = filterIndustry
    ? deals.filter((d) => d.industry.slug === filterIndustry)
    : deals;

  const moveStage = async (dealId: string, stage: string) => {
    const res = await fetch(`/api/deals/${dealId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    const updated = await res.json();
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: updated.stage } : d)));
  };

  const deleteDeal = async (dealId: string) => {
    await fetch(`/api/deals/${dealId}`, { method: "DELETE" });
    setDeals((prev) => prev.filter((d) => d.id !== dealId));
  };

  const addDeal = async () => {
    if (!form.title || !form.contactId || !form.industryId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: form.value ? parseFloat(form.value) : undefined,
        }),
      });
      const deal = await res.json();
      setDeals((prev) => [deal, ...prev]);
      setForm({ title: "", contactId: "", industryId: "", value: "", currency: "CAD", stage: "LEAD", priority: "MEDIUM", notes: "" });
      setShowForm(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const stageTotal = (stageKey: string) => {
    const stageDeals = filtered.filter((d) => d.stage === stageKey);
    const total = stageDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);
    return { count: stageDeals.length, total };
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <select
          value={filterIndustry}
          onChange={(e) => setFilterIndustry(e.target.value)}
          className="border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
        >
          <option value="">All Industries</option>
          {industries.map((ind) => (
            <option key={ind.slug} value={ind.slug}>
              {ind.icon} {ind.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          {showForm ? "Cancel" : "+ New Deal"}
        </button>
        <div className="ml-auto text-sm text-zinc-500">
          {filtered.length} deals · Total: {filtered.reduce((s, d) => s + (d.value ?? 0), 0).toLocaleString()}
        </div>
      </div>

      {/* New Deal Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm mb-5">
          <h3 className="font-semibold text-zinc-900 mb-4">New Deal</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div className="col-span-2 md:col-span-3">
              <label className="text-xs text-zinc-500 mb-1 block">Deal Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Bulk textile order - Q3 2026"
                className="w-full border border-zinc-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Contact *</label>
              <select
                value={form.contactId}
                onChange={(e) => setForm((f) => ({ ...f, contactId: e.target.value }))}
                className="w-full border border-zinc-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300"
              >
                <option value="">Select contact…</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}{c.company ? ` (${c.company})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Industry *</label>
              <select
                value={form.industryId}
                onChange={(e) => setForm((f) => ({ ...f, industryId: e.target.value }))}
                className="w-full border border-zinc-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300"
              >
                <option value="">Select industry…</option>
                {industries.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.icon} {ind.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Stage</label>
              <select
                value={form.stage}
                onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}
                className="w-full border border-zinc-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300"
              >
                {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Value</label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder="0"
                className="w-full border border-zinc-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                className="w-full border border-zinc-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                className="w-full border border-zinc-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300"
              >
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addDeal}
              disabled={saving || !form.title || !form.contactId || !form.industryId}
              className="bg-zinc-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Adding…" : "Add Deal"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-zinc-500 hover:text-zinc-900 text-sm px-3 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6">
        {STAGES.map((stage) => {
          const stageDeals = filtered.filter((d) => d.stage === stage.key);
          const { total } = stageTotal(stage.key);
          return (
            <div key={stage.key} className="flex-shrink-0 w-64">
              {/* Column header */}
              <div
                className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg"
                style={{ backgroundColor: stage.color + "15" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-sm font-semibold text-zinc-800">{stage.label}</span>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: stage.color }}
                >
                  {stageDeals.length}
                </span>
              </div>
              {total > 0 && (
                <p className="text-xs text-zinc-400 mb-2 px-1">
                  Total: {total.toLocaleString()}
                </p>
              )}
              <div className="flex flex-col gap-3">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-white rounded-xl border border-zinc-100 p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm text-zinc-900 leading-tight">{deal.title}</p>
                      <button
                        onClick={() => deleteDeal(deal.id)}
                        className="text-zinc-200 hover:text-red-400 transition-colors ml-1 text-base flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                    <Link
                      href={`/crm/contacts/${deal.contact.id}`}
                      className="text-xs text-zinc-500 hover:text-zinc-800 block"
                    >
                      {deal.contact.firstName} {deal.contact.lastName}
                      {deal.contact.company && ` · ${deal.contact.company}`}
                    </Link>
                    {deal.value && (
                      <p className="text-sm font-semibold text-zinc-800 mt-2">
                        {formatValue(deal.value, deal.currency)}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-2">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded text-white font-medium"
                        style={{ backgroundColor: deal.industry.color ?? "#6b7280" }}
                      >
                        {deal.industry.icon}
                      </span>
                      {deal.priority === "HIGH" && (
                        <span className="text-xs text-red-500 font-medium">🔴 High</span>
                      )}
                    </div>
                    {/* Stage movement */}
                    <div className="mt-3 flex gap-1 flex-wrap">
                      {STAGES.filter((s) => s.key !== stage.key).map((s) => (
                        <button
                          key={s.key}
                          onClick={() => moveStage(deal.id, s.key)}
                          className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-100 text-zinc-400 hover:border-zinc-300 hover:text-zinc-700 transition-colors"
                        >
                          → {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {stageDeals.length === 0 && (
                  <div className="border-2 border-dashed border-zinc-100 rounded-xl p-5 text-center text-xs text-zinc-300">
                    No deals
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
