"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Activity {
  id: string;
  type: string;
  title: string;
  body: string | null;
  createdAt: string | Date;
}

interface Deal {
  id: string;
  title: string;
  stage: string;
  value: number | null;
  currency: string;
  industry: { name: string; color: string | null; icon: string | null };
}

interface Industry {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
}

interface Props {
  contact: { id: string; activities: Activity[]; deals: Deal[] };
  industries: Industry[];
}

const ACTIVITY_ICONS: Record<string, string> = {
  NOTE: "📝",
  CALL: "📞",
  EMAIL: "✉️",
  MEETING: "🤝",
  TASK: "✔️",
};

const STAGE_COLORS: Record<string, string> = {
  LEAD: "#6b7280",
  CONTACTED: "#3b82f6",
  PROPOSAL: "#8b5cf6",
  NEGOTIATION: "#f59e0b",
  WON: "#10b981",
  LOST: "#ef4444",
};

export function ContactDetailClient({ contact, industries }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"activity" | "deals">("activity");
  const [activities, setActivities] = useState<Activity[]>(contact.activities);
  const [deals, setDeals] = useState<Deal[]>(contact.deals);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showDealForm, setShowDealForm] = useState(false);
  const [actForm, setActForm] = useState({ type: "NOTE", title: "", body: "" });
  const [dealForm, setDealForm] = useState({
    title: "",
    industryId: "",
    value: "",
    currency: "CAD",
    stage: "LEAD",
    priority: "MEDIUM",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const addActivity = async () => {
    if (!actForm.title) return;
    setSaving(true);
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: contact.id, ...actForm }),
      });
      const act = await res.json();
      setActivities((prev) => [act, ...prev]);
      setActForm({ type: "NOTE", title: "", body: "" });
      setShowActivityForm(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const deleteActivity = async (id: string) => {
    await fetch(`/api/activities/${id}`, { method: "DELETE" });
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const addDeal = async () => {
    if (!dealForm.title || !dealForm.industryId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: contact.id, ...dealForm }),
      });
      const deal = await res.json();
      setDeals((prev) => [deal, ...prev]);
      setDealForm({ title: "", industryId: "", value: "", currency: "CAD", stage: "LEAD", priority: "MEDIUM", notes: "" });
      setShowDealForm(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const moveDealStage = async (dealId: string, stage: string) => {
    const res = await fetch(`/api/deals/${dealId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    const updated = await res.json();
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: updated.stage } : d)));
  };

  const STAGES = ["LEAD", "CONTACTED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white rounded-xl border border-zinc-200 p-1 shadow-sm">
        {[
          { key: "activity", label: `Activity (${activities.length})` },
          { key: "deals", label: `Deals (${deals.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as "activity" | "deals")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t.key ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Activity Tab */}
      {tab === "activity" && (
        <div className="space-y-4">
          {/* Add Activity */}
          {!showActivityForm ? (
            <button
              onClick={() => setShowActivityForm(true)}
              className="w-full bg-white border border-dashed border-zinc-300 rounded-xl p-4 text-sm text-zinc-400 hover:text-zinc-700 hover:border-zinc-400 transition-colors"
            >
              + Log activity (note, call, email, meeting…)
            </button>
          ) : (
            <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Type</label>
                  <select
                    value={actForm.type}
                    onChange={(e) => setActForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full border border-zinc-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  >
                    {["NOTE", "CALL", "EMAIL", "MEETING", "TASK"].map((t) => (
                      <option key={t} value={t}>{ACTIVITY_ICONS[t]} {t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Title *</label>
                  <input
                    value={actForm.title}
                    onChange={(e) => setActForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Quick summary…"
                    className="w-full border border-zinc-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  />
                </div>
              </div>
              <textarea
                value={actForm.body}
                onChange={(e) => setActForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="Details (optional)…"
                rows={2}
                className="w-full border border-zinc-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300 resize-none mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={addActivity}
                  disabled={saving || !actForm.title}
                  className="bg-zinc-900 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setShowActivityForm(false)}
                  className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Activity List */}
          {activities.length === 0 ? (
            <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center text-zinc-400 text-sm shadow-sm">
              No activities yet
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm divide-y divide-zinc-50">
              {activities.map((act) => (
                <div key={act.id} className="px-5 py-4 flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{ACTIVITY_ICONS[act.type] ?? "📝"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800">{act.title}</p>
                    {act.body && <p className="text-sm text-zinc-500 mt-0.5">{act.body}</p>}
                    <p className="text-xs text-zinc-400 mt-1">
                      {new Date(act.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteActivity(act.id)}
                    className="text-zinc-300 hover:text-red-400 transition-colors text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deals Tab */}
      {tab === "deals" && (
        <div className="space-y-4">
          {!showDealForm ? (
            <button
              onClick={() => setShowDealForm(true)}
              className="w-full bg-white border border-dashed border-zinc-300 rounded-xl p-4 text-sm text-zinc-400 hover:text-zinc-700 hover:border-zinc-400 transition-colors"
            >
              + Add deal / opportunity
            </button>
          ) : (
            <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="col-span-2">
                  <label className="text-xs text-zinc-500 mb-1 block">Deal Title *</label>
                  <input
                    value={dealForm.title}
                    onChange={(e) => setDealForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Wholesale textile order Q3"
                    className="w-full border border-zinc-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Industry *</label>
                  <select
                    value={dealForm.industryId}
                    onChange={(e) => setDealForm((f) => ({ ...f, industryId: e.target.value }))}
                    className="w-full border border-zinc-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  >
                    <option value="">Select…</option>
                    {industries.map((ind) => (
                      <option key={ind.id} value={ind.id}>{ind.icon} {ind.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Stage</label>
                  <select
                    value={dealForm.stage}
                    onChange={(e) => setDealForm((f) => ({ ...f, stage: e.target.value }))}
                    className="w-full border border-zinc-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  >
                    {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Value</label>
                  <input
                    type="number"
                    value={dealForm.value}
                    onChange={(e) => setDealForm((f) => ({ ...f, value: e.target.value }))}
                    placeholder="0"
                    className="w-full border border-zinc-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Currency</label>
                  <select
                    value={dealForm.currency}
                    onChange={(e) => setDealForm((f) => ({ ...f, currency: e.target.value }))}
                    className="w-full border border-zinc-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  >
                    {["CAD", "USD", "INR", "GBP", "EUR", "AED"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={addDeal}
                  disabled={saving || !dealForm.title || !dealForm.industryId}
                  className="bg-zinc-900 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving…" : "Add Deal"}
                </button>
                <button
                  onClick={() => setShowDealForm(false)}
                  className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {deals.length === 0 ? (
            <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center text-zinc-400 text-sm shadow-sm">
              No deals yet
            </div>
          ) : (
            <div className="space-y-3">
              {deals.map((deal) => (
                <div key={deal.id} className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-zinc-900">{deal.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-xs px-1.5 py-0.5 rounded text-white font-medium"
                          style={{ backgroundColor: deal.industry.color ?? "#6b7280" }}
                        >
                          {deal.industry.icon} {deal.industry.name}
                        </span>
                        {deal.value && (
                          <span className="text-xs text-zinc-500">
                            {deal.value.toLocaleString()} {deal.currency}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-full font-medium text-white"
                      style={{ backgroundColor: STAGE_COLORS[deal.stage] ?? "#6b7280" }}
                    >
                      {deal.stage}
                    </span>
                  </div>
                  {/* Stage mover */}
                  <div className="flex gap-1 flex-wrap">
                    {STAGES.map((s) => (
                      <button
                        key={s}
                        onClick={() => moveDealStage(deal.id, s)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          deal.stage === s
                            ? "bg-zinc-900 text-white"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
