"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface ContactResult {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  company: string | null;
  phone: string | null;
  status: string;
}

interface DealResult {
  id: string;
  title: string;
  stage: string;
  value: number | null;
  currency: string;
  contact: { id: string; firstName: string; lastName: string | null };
  industry: { name: string; color: string | null; icon: string | null };
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#059669",
  INACTIVE: "#6b7280",
  LEAD: "#4f46e5",
  PROSPECT: "#d97706",
};

const STAGE_COLORS: Record<string, string> = {
  LEAD: "#6b7280",
  CONTACTED: "#3b82f6",
  PROPOSAL: "#8b5cf6",
  NEGOTIATION: "#f59e0b",
  WON: "#10b981",
  LOST: "#ef4444",
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [contacts, setContacts] = useState<ContactResult[]>([]);
  const [deals, setDeals] = useState<DealResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setContacts([]);
      setDeals([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setContacts(data.contacts ?? []);
        setDeals(data.deals ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  const hasResults = contacts.length > 0 || deals.length > 0;
  const searched = query.trim().length >= 2;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Search</h1>

      <div className="relative mb-8">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">🔍</span>
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search contacts, companies, phone numbers, deals…"
          className="w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-300 shadow-sm"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">Searching…</span>
        )}
      </div>

      {searched && !loading && !hasResults && (
        <p className="text-zinc-400 text-sm text-center py-12">No results for "{query}"</p>
      )}

      {contacts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
            Contacts ({contacts.length})
          </h2>
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm divide-y divide-zinc-50">
            {contacts.map((c) => (
              <Link
                key={c.id}
                href={`/crm/contacts/${c.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[c.status] ?? "#6b7280" }}
                >
                  {c.firstName[0]}{c.lastName?.[0] ?? ""}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-900">
                    {c.firstName} {c.lastName}
                  </p>
                  <p className="text-sm text-zinc-400 truncate">
                    {[c.company, c.email, c.phone].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white font-medium flex-shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[c.status] ?? "#6b7280" }}
                >
                  {c.status}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {deals.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
            Deals ({deals.length})
          </h2>
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm divide-y divide-zinc-50">
            {deals.map((d) => (
              <Link
                key={d.id}
                href={`/crm/pipeline`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors"
              >
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: d.industry.color ? d.industry.color + "25" : "#f4f4f5" }}
                >
                  {d.industry.icon ?? "📁"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-900">{d.title}</p>
                  <p className="text-sm text-zinc-400">
                    {d.contact.firstName} {d.contact.lastName} · {d.industry.name}
                    {d.value ? ` · ${d.value.toLocaleString()} ${d.currency}` : ""}
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white font-medium flex-shrink-0"
                  style={{ backgroundColor: STAGE_COLORS[d.stage] ?? "#6b7280" }}
                >
                  {d.stage}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
