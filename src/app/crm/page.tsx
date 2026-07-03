import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { asArr } from "@/lib/utils";

export default async function DashboardPage() {
  const [totalContacts, totalDeals, activeDeals, wonDeals] = await Promise.all([
    prisma.contact.count(),
    prisma.deal.count(),
    prisma.deal.count({ where: { stage: { notIn: ["WON", "LOST"] } } }),
    prisma.deal.count({ where: { stage: "WON" } }),
  ]);

  const industries = await prisma.industry.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: { _count: { select: { roles: true } } },
  });

  const recentContacts = await prisma.contact.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { roles: { include: { industry: true, contactType: true }, take: 2 } },
  });

  const recentActivities = await prisma.activity.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { contact: { select: { firstName: true, lastName: true } } },
  });

  const overdueFollowUps = await prisma.contact.findMany({
    where: { followUpDate: { lte: new Date() } },
    orderBy: { followUpDate: "asc" },
    take: 8,
    select: { id: true, firstName: true, lastName: true, followUpDate: true, followUpNote: true },
  });

  const wonDealsValue = await prisma.deal.aggregate({
    where: { stage: "WON" },
    _sum: { value: true },
  });

  const stats = [
    { label: "Total Contacts", value: totalContacts, icon: "👥", color: "#4f46e5" },
    { label: "Active Deals", value: activeDeals, icon: "🔄", color: "#059669" },
    { label: "Deals Won", value: wonDeals, icon: "✅", color: "#d97706" },
    { label: "Total Deals", value: totalDeals, icon: "📊", color: "#dc2626" },
  ];

  const activityIcons: Record<string, string> = {
    NOTE: "📝",
    CALL: "📞",
    EMAIL: "✉️",
    MEETING: "🤝",
    TASK: "✔️",
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "#059669",
    INACTIVE: "#6b7280",
    LEAD: "#4f46e5",
    PROSPECT: "#d97706",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Welcome back — here's what's happening</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/crm/contacts/new"
            className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            + Add Contact
          </Link>
          <Link
            href="/crm/pipeline"
            className="border border-zinc-200 bg-white text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            View Pipeline
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
            </div>
            <p className="text-3xl font-bold text-zinc-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Industries breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900">Industries</h2>
            <Link href="/crm/settings/industries" className="text-xs text-zinc-400 hover:text-zinc-900">
              Manage →
            </Link>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2">
            {industries.map((ind) => (
              <Link
                key={ind.id}
                href={`/crm/industries/${ind.slug}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors border border-zinc-100"
              >
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: ind.color ? ind.color + "20" : "#f4f4f5" }}
                >
                  {ind.icon ?? "📁"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-800 truncate">{ind.name}</p>
                  <p className="text-xs text-zinc-400">{ind._count.roles} contacts</p>
                </div>
              </Link>
            ))}
            <Link
              href="/crm/settings/industries"
              className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
            >
              <span className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-lg flex-shrink-0">
                +
              </span>
              <p className="text-sm text-zinc-400">Add industry</p>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900">Recent Activity</h2>
            <Link href="/crm/activities" className="text-xs text-zinc-400 hover:text-zinc-900">
              All →
            </Link>
          </div>
          {recentActivities.length === 0 ? (
            <div className="px-6 py-8 text-center text-zinc-400 text-sm">No activity yet</div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {recentActivities.map((act) => (
                <div key={act.id} className="px-6 py-3 flex items-start gap-3">
                  <span className="text-lg mt-0.5 flex-shrink-0">
                    {activityIcons[act.type] ?? "📝"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-800 truncate">{act.title}</p>
                    <p className="text-xs text-zinc-400">
                      {act.contact.firstName} {act.contact.lastName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overdue Follow-ups */}
      {overdueFollowUps.length > 0 && (
        <div className="bg-red-50 rounded-xl border border-red-200 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-red-100 flex items-center justify-between">
            <h2 className="font-semibold text-red-800">Overdue Follow-ups ({overdueFollowUps.length})</h2>
          </div>
          <div className="divide-y divide-red-100">
            {overdueFollowUps.map((c) => {
              const daysAgo = Math.floor((Date.now() - new Date(c.followUpDate!).getTime()) / 86400000);
              return (
                <div key={c.id} className="px-6 py-3 flex items-center gap-4">
                  <span className="text-xl flex-shrink-0">⏰</span>
                  <div className="flex-1 min-w-0">
                    <a href={`/crm/contacts/${c.id}`} className="text-sm font-medium text-red-900 hover:underline">
                      {c.firstName} {c.lastName}
                    </a>
                    {c.followUpNote && <p className="text-xs text-red-600">{c.followUpNote}</p>}
                  </div>
                  <span className="text-xs text-red-500 flex-shrink-0">
                    {daysAgo === 0 ? "today" : `${daysAgo}d overdue`}
                  </span>
                  <a
                    href={`/crm/contacts/${c.id}/edit`}
                    className="text-xs text-red-600 hover:text-red-900 underline flex-shrink-0"
                  >
                    Update
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Contacts */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900">Recent Contacts</h2>
          <Link href="/crm/contacts" className="text-xs text-zinc-400 hover:text-zinc-900">
            View all →
          </Link>
        </div>
        {recentContacts.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-zinc-400 text-sm mb-2">No contacts yet.</p>
            <Link
              href="/crm/contacts/new"
              className="text-sm text-zinc-900 font-medium underline"
            >
              Add your first contact
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {recentContacts.map((c) => (
              <div key={c.id} className="px-6 py-3 flex items-center gap-4">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: statusColors[c.status] ?? "#6b7280" }}
                >
                  {c.firstName[0]}{c.lastName?.[0] ?? ""}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/crm/contacts/${c.id}`}
                    className="text-sm font-medium text-zinc-900 hover:underline"
                  >
                    {c.firstName} {c.lastName}
                  </Link>
                  <p className="text-xs text-zinc-400 truncate">
                    {c.company ?? c.email ?? c.phone ?? "—"}
                  </p>
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  {c.roles.map((r) => (
                    <span
                      key={r.id}
                      className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: r.industry.color ?? "#6b7280" }}
                    >
                      {r.contactType.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {wonDealsValue._sum.value ? (
        <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <p className="text-sm text-green-700">
            <span className="font-bold">Total pipeline won: </span>
            {wonDealsValue._sum.value?.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
          </p>
        </div>
      ) : null}
    </div>
  );
}
