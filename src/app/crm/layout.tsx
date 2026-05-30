import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";

const navItems = [
  { href: "/crm", label: "Dashboard", icon: "⊞" },
  { href: "/crm/clients", label: "Clients", icon: "🏢" },
  { href: "/crm/candidates", label: "Candidates", icon: "👤" },
  { href: "/crm/jobs", label: "Job Orders", icon: "📋" },
  { href: "/crm/pipeline", label: "Pipeline", icon: "⬡" },
];

export default async function CRMLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex bg-zinc-100">
      {/* Sidebar */}
      <aside className="w-60 bg-zinc-900 flex flex-col flex-shrink-0">
        <div className="px-6 py-6 border-b border-zinc-800">
          <span className="font-bold text-white tracking-tight">INFINITY PSR</span>
          <p className="text-xs text-zinc-500 mt-0.5">CRM Portal</p>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-5 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 mb-3 truncate">{session.user?.name}</p>
          <p className="text-xs text-zinc-600 mb-3 truncate">{session.user?.email}</p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="text-xs text-zinc-500 hover:text-white transition-colors">
              Sign out →
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-zinc-50">{children}</main>
    </div>
  );
}
