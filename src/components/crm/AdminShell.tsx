"use client";

import { useState } from "react";
import { TopBar } from "@/components/crm/TopBar";
import { Sidebar } from "@/components/crm/Sidebar";

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

export function AdminShell({
  industries,
  userName,
  userEmail,
  children,
}: {
  industries: Industry[];
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f1f1f1]">
      <TopBar
        userName={userName}
        userEmail={userEmail}
        onMenuClick={() => setNavOpen((o) => !o)}
      />
      <div className="flex pt-14">
        <Sidebar industries={industries} open={navOpen} onClose={() => setNavOpen(false)} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
