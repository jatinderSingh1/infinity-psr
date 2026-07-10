"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doSignOut } from "@/lib/actions";

interface SearchContact { id: string; firstName: string; lastName: string | null; company: string | null; email: string | null; status: string }
interface SearchDeal { id: string; title: string; stage: string; contact: { firstName: string; lastName: string | null } }
interface SearchProduct { id: string; name: string; sku: string | null; price: number; stock: number }
interface SearchOrder { id: string; number: number; total: number; paymentStatus: string; contact: { firstName: string; lastName: string | null } }
interface Results { contacts: SearchContact[]; deals: SearchDeal[]; products: SearchProduct[]; orders: SearchOrder[] }

export function TopBar({
  userName,
  userEmail,
  onMenuClick,
}: {
  userName: string;
  userEmail: string;
  onMenuClick: () => void;
}) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setUserOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQ("");
      setResults(null);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        setResults(await res.json());
      } finally {
        setLoading(false);
      }
    }, 250);
  }, [q]);

  const go = (href: string) => {
    setSearchOpen(false);
    router.push(href);
  };

  const hasResults =
    results &&
    (results.contacts?.length > 0 ||
      results.deals?.length > 0 ||
      results.products?.length > 0 ||
      results.orders?.length > 0);

  const Group = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="py-1.5">
      <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#8a8a8a]">{label}</p>
      {children}
    </div>
  );

  const rowCls =
    "w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[#f4f4f4] transition-colors cursor-pointer";

  return (
    <>
      <header className="fixed top-0 inset-x-0 h-14 bg-[#1a1a1a] z-40 flex items-center gap-3 px-3">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-zinc-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Menu"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M2 4.5h16v2H2zM2 9h16v2H2zM2 13.5h16v2H2z"/></svg>
        </button>

        {/* Brand */}
        <Link href="/crm" className="flex items-center gap-2 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="h-8 w-auto" />
          <span className="text-white font-bold text-sm tracking-tight hidden sm:block">
            INFINITY AURA
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 flex justify-center px-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full max-w-xl h-8 bg-[#303030] hover:bg-[#3a3a3a] border border-[#4a4a4a] rounded-lg flex items-center gap-2 px-3 text-[13px] text-zinc-400 transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>
            <span className="flex-1 text-left">Search</span>
            <kbd className="hidden sm:flex items-center gap-0.5 text-[11px] text-zinc-500 border border-[#4a4a4a] rounded px-1.5 py-0.5">
              CTRL K
            </kbd>
          </button>
        </div>

        {/* User */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setUserOpen((o) => !o)}
            className="flex items-center gap-2 h-8 bg-[#303030] hover:bg-[#3a3a3a] rounded-lg pl-1.5 pr-2.5 transition-colors cursor-pointer"
          >
            <span className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">
              {userName.slice(0, 2).toUpperCase()}
            </span>
            <span className="text-[13px] text-zinc-200 font-medium hidden sm:block max-w-32 truncate">
              {userName}
            </span>
          </button>

          {userOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
              <div className="absolute right-0 top-10 w-64 bg-white rounded-xl shadow-2xl border border-[#e3e3e3] z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#ebebeb]">
                  <p className="text-[13px] font-semibold text-[#1a1a1a]">{userName}</p>
                  <p className="text-xs text-[#8a8a8a] truncate">{userEmail}</p>
                </div>
                <div className="py-1">
                  <Link href="/crm/settings" onClick={() => setUserOpen(false)} className="block px-4 py-2 text-[13px] text-[#303030] hover:bg-[#f4f4f4]">
                    ⚙️ Settings
                  </Link>
                  <Link href="/crm/settings/users" onClick={() => setUserOpen(false)} className="block px-4 py-2 text-[13px] text-[#303030] hover:bg-[#f4f4f4]">
                    👤 Manage users
                  </Link>
                </div>
                <form action={doSignOut} className="border-t border-[#ebebeb]">
                  <button type="submit" className="w-full text-left px-4 py-2.5 text-[13px] text-[#8e1f0b] hover:bg-[#fff0f0] cursor-pointer">
                    Sign out →
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Command palette */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl mt-[10vh] bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#ebebeb]">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="#8a8a8a"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search contacts, orders, products, deals…"
                className="flex-1 text-sm text-[#1a1a1a] placeholder-[#8a8a8a] focus:outline-none"
              />
              {loading && <span className="text-xs text-[#8a8a8a]">Searching…</span>}
              <kbd className="text-[11px] text-[#8a8a8a] border border-[#d4d4d4] rounded px-1.5 py-0.5">ESC</kbd>
            </div>

            <div className="max-h-[55vh] overflow-y-auto">
              {!hasResults && q.trim().length >= 2 && !loading && (
                <p className="px-4 py-8 text-center text-[13px] text-[#8a8a8a]">No results for "{q}"</p>
              )}
              {!results && q.trim().length < 2 && (
                <p className="px-4 py-8 text-center text-[13px] text-[#8a8a8a]">
                  Type at least 2 characters to search everything…
                </p>
              )}

              {results?.contacts && results.contacts.length > 0 && (
                <Group label="Contacts">
                  {results.contacts.map((c) => (
                    <button key={c.id} className={rowCls} onClick={() => go(`/crm/contacts/${c.id}`)}>
                      <span className="w-7 h-7 rounded-full bg-[#e3e3e3] flex items-center justify-center text-xs font-bold text-[#303030]">
                        {c.firstName[0]}{c.lastName?.[0] ?? ""}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] font-medium text-[#1a1a1a] truncate">
                          {c.firstName} {c.lastName}
                        </span>
                        <span className="block text-xs text-[#8a8a8a] truncate">
                          {c.company ?? c.email ?? ""}
                        </span>
                      </span>
                    </button>
                  ))}
                </Group>
              )}

              {results?.orders && results.orders.length > 0 && (
                <Group label="Orders">
                  {results.orders.map((o) => (
                    <button key={o.id} className={rowCls} onClick={() => go(`/crm/orders/${o.id}`)}>
                      <span className="text-base">🧾</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] font-medium text-[#1a1a1a]">Order #{o.number}</span>
                        <span className="block text-xs text-[#8a8a8a]">
                          {o.contact.firstName} {o.contact.lastName} · ${o.total.toFixed(2)}
                        </span>
                      </span>
                    </button>
                  ))}
                </Group>
              )}

              {results?.products && results.products.length > 0 && (
                <Group label="Products">
                  {results.products.map((p) => (
                    <button key={p.id} className={rowCls} onClick={() => go(`/crm/products/${p.id}/edit`)}>
                      <span className="text-base">📦</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] font-medium text-[#1a1a1a] truncate">{p.name}</span>
                        <span className="block text-xs text-[#8a8a8a]">
                          {p.sku ? `${p.sku} · ` : ""}${p.price.toFixed(2)} · {p.stock} in stock
                        </span>
                      </span>
                    </button>
                  ))}
                </Group>
              )}

              {results?.deals && results.deals.length > 0 && (
                <Group label="Deals">
                  {results.deals.map((d) => (
                    <button key={d.id} className={rowCls} onClick={() => go(`/crm/pipeline`)}>
                      <span className="text-base">📊</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] font-medium text-[#1a1a1a] truncate">{d.title}</span>
                        <span className="block text-xs text-[#8a8a8a]">
                          {d.contact.firstName} {d.contact.lastName} · {d.stage}
                        </span>
                      </span>
                    </button>
                  ))}
                </Group>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
