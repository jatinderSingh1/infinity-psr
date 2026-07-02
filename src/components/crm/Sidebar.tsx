"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { doSignOut } from "@/lib/actions";

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
  userName: string;
  userEmail: string;
}

function NavLink({
  href,
  icon,
  label,
  collapsed,
}: {
  href: string;
  icon: string;
  label: string;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const active = href === "/crm" ? pathname === "/crm" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        active ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
      }`}
    >
      <span className="text-base w-5 text-center flex-shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

export function Sidebar({ industries, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    industries.forEach((ind) => {
      if (pathname.startsWith(`/crm/industries/${ind.slug}`)) init[ind.slug] = true;
    });
    return init;
  });

  const toggle = (slug: string) =>
    setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-zinc-900 flex flex-col flex-shrink-0 transition-all duration-200 min-h-screen`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
        {!collapsed && (
          <div>
            <p className="font-bold text-white text-sm tracking-tight">INFINITY PSR</p>
            <p className="text-[11px] text-zinc-500">ERP / CRM</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-zinc-500 hover:text-white transition-colors p-1 ml-auto"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto flex flex-col gap-0.5">
        {/* Core */}
        <NavLink href="/crm" icon="⊞" label="Dashboard" collapsed={collapsed} />
        <NavLink href="/crm/contacts" icon="👥" label="All Contacts" collapsed={collapsed} />

        {/* Industries */}
        {!collapsed && (
          <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold px-3 mt-4 mb-1">
            Industries
          </p>
        )}
        {collapsed && <div className="my-2 border-t border-zinc-800" />}

        {industries.map((ind) => {
          const parentActive = pathname.startsWith(`/crm/industries/${ind.slug}`);
          const isExpanded = expanded[ind.slug] ?? parentActive;

          return (
            <div key={ind.id}>
              <div className="flex items-center gap-1">
                <Link
                  href={`/crm/industries/${ind.slug}`}
                  title={collapsed ? ind.name : undefined}
                  className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors min-w-0 ${
                    parentActive
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center text-sm flex-shrink-0"
                    style={{ backgroundColor: ind.color ? ind.color + "30" : undefined }}
                  >
                    {ind.icon ?? "📁"}
                  </span>
                  {!collapsed && <span className="truncate">{ind.name}</span>}
                </Link>
                {!collapsed && (
                  <button
                    onClick={() => toggle(ind.slug)}
                    className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors flex-shrink-0 text-xs"
                  >
                    {isExpanded ? "▾" : "▸"}
                  </button>
                )}
              </div>

              {!collapsed && isExpanded && ind.contactTypes.length > 0 && (
                <div className="ml-4 mt-0.5 mb-0.5 pl-3 border-l border-zinc-800 flex flex-col gap-0.5">
                  {ind.contactTypes.map((ct) => {
                    const href = `/crm/industries/${ind.slug}/${ct.slug}`;
                    const active = pathname === href;
                    return (
                      <Link
                        key={ct.id}
                        href={href}
                        className={`px-2 py-1.5 rounded text-xs transition-colors ${
                          active
                            ? "bg-zinc-800 text-white"
                            : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
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

        {/* Management */}
        {!collapsed && (
          <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold px-3 mt-4 mb-1">
            Management
          </p>
        )}
        {collapsed && <div className="my-2 border-t border-zinc-800" />}

        <NavLink href="/crm/pipeline" icon="📊" label="Pipeline" collapsed={collapsed} />
        <NavLink href="/crm/activities" icon="📋" label="Activities" collapsed={collapsed} />
        <NavLink href="/crm/settings" icon="⚙️" label="Settings" collapsed={collapsed} />
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-zinc-800">
        {!collapsed && (
          <div className="mb-2">
            <p className="text-xs text-zinc-300 font-medium truncate">{userName}</p>
            <p className="text-xs text-zinc-600 truncate">{userEmail}</p>
          </div>
        )}
        <form action={doSignOut}>
          <button
            type="submit"
            title={collapsed ? "Sign out" : undefined}
            className="text-xs text-zinc-500 hover:text-white transition-colors"
          >
            {collapsed ? "↪" : "Sign out →"}
          </button>
        </form>
      </div>
    </aside>
  );
}
