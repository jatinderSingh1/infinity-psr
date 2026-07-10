"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface ContactType {
  id: string;
  name: string;
  slug: string;
}

interface Industry {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  contactTypes: ContactType[];
}

interface SidebarProps {
  industries: Industry[];
  open: boolean;
  onClose: () => void;
}

const MAIN_NAV = [
  { href: "/crm", icon: "🏠", label: "Home", exact: true },
  { href: "/crm/orders", icon: "🧾", label: "Orders" },
  { href: "/crm/products", icon: "📦", label: "Products" },
  { href: "/crm/contacts", icon: "👥", label: "Contacts" },
  { href: "/crm/pipeline", icon: "📊", label: "Pipeline" },
  { href: "/crm/activities", icon: "📋", label: "Activities" },
  { href: "/crm/reports", icon: "📈", label: "Reports" },
];

export function Sidebar({ industries, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    industries.forEach((ind) => {
      if (pathname.startsWith(`/crm/industries/${ind.slug}`)) init[ind.slug] = true;
    });
    return init;
  });

  const toggle = (slug: string) =>
    setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));

  const itemCls = (active: boolean) =>
    `flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13px] transition-colors ${
      active
        ? "bg-white text-[#1a1a1a] font-semibold shadow-sm"
        : "text-[#4a4a4a] font-medium hover:bg-[#e3e3e3]"
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div className="fixed inset-0 top-14 bg-black/30 z-30 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed md:sticky top-14 z-30 h-[calc(100vh-3.5rem)] w-60 bg-[#ebebeb] flex flex-col flex-shrink-0 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
          {MAIN_NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={onClose} className={itemCls(active)}>
                <span className="w-5 text-center text-[15px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Industries */}
          <p className="text-[11px] font-semibold text-[#8a8a8a] px-2 mt-4 mb-1 uppercase tracking-wider">
            Industries
          </p>
          {industries.map((ind) => {
            const parentActive = pathname.startsWith(`/crm/industries/${ind.slug}`);
            const isExpanded = expanded[ind.slug] ?? parentActive;
            return (
              <div key={ind.id}>
                <div className="flex items-center">
                  <Link
                    href={`/crm/industries/${ind.slug}`}
                    onClick={onClose}
                    className={`flex-1 min-w-0 ${itemCls(parentActive)}`}
                  >
                    <span className="w-5 text-center text-[15px]">{ind.icon ?? "📁"}</span>
                    <span className="truncate">{ind.name}</span>
                  </Link>
                  {ind.contactTypes.length > 0 && (
                    <button
                      onClick={() => toggle(ind.slug)}
                      className="p-1 text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors text-[10px] w-6 flex-shrink-0 cursor-pointer"
                    >
                      {isExpanded ? "▼" : "▶"}
                    </button>
                  )}
                </div>
                {isExpanded && ind.contactTypes.length > 0 && (
                  <div className="ml-[26px] pl-2 border-l border-[#d4d4d4] flex flex-col gap-0.5 my-0.5">
                    {ind.contactTypes.map((ct) => {
                      const href = `/crm/industries/${ind.slug}/${ct.slug}`;
                      const active = pathname === href;
                      return (
                        <Link
                          key={ct.id}
                          href={href}
                          onClick={onClose}
                          className={`px-2 py-1 rounded-md text-xs transition-colors ${
                            active
                              ? "bg-white text-[#1a1a1a] font-semibold shadow-sm"
                              : "text-[#616161] hover:bg-[#e3e3e3]"
                          }`}
                        >
                          {ct.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Settings pinned bottom */}
        <div className="px-3 py-3 border-t border-[#dedede]">
          <Link
            href="/crm/settings"
            onClick={onClose}
            className={itemCls(pathname.startsWith("/crm/settings"))}
          >
            <span className="w-5 text-center text-[15px]">⚙️</span>
            <span>Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
