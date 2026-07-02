import { prisma } from "@/lib/prisma";
import Link from "next/link";

const ACTIVITY_ICONS: Record<string, string> = {
  NOTE: "📝",
  CALL: "📞",
  EMAIL: "✉️",
  MEETING: "🤝",
  TASK: "✔️",
};

const ACTIVITY_COLORS: Record<string, string> = {
  NOTE: "#6b7280",
  CALL: "#059669",
  EMAIL: "#3b82f6",
  MEETING: "#8b5cf6",
  TASK: "#f59e0b",
};

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; contact?: string }>;
}) {
  const sp = await searchParams;
  const type = sp.type ?? "";
  const contactSearch = sp.contact ?? "";

  const activities = await prisma.activity.findMany({
    where: {
      AND: [
        type ? { type: type as "NOTE" | "CALL" | "EMAIL" | "MEETING" | "TASK" } : {},
        contactSearch
          ? {
              contact: {
                OR: [
                  { firstName: { contains: contactSearch, mode: "insensitive" } },
                  { lastName: { contains: contactSearch, mode: "insensitive" } },
                ],
              },
            }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      contact: { select: { id: true, firstName: true, lastName: true, company: true } },
    },
  });

  const grouped = activities.reduce<Record<string, typeof activities>>((acc, act) => {
    const date = new Date(act.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(act);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Activities</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{activities.length} recent activities</p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 mb-6 flex-wrap">
        <input
          name="contact"
          defaultValue={contactSearch}
          placeholder="Filter by contact name…"
          className="flex-1 min-w-40 border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
        />
        <select
          name="type"
          defaultValue={type}
          className="border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
        >
          <option value="">All Types</option>
          {["NOTE", "CALL", "EMAIL", "MEETING", "TASK"].map((t) => (
            <option key={t} value={t}>
              {ACTIVITY_ICONS[t]} {t}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          Filter
        </button>
        {(type || contactSearch) && (
          <Link
            href="/crm/activities"
            className="border border-zinc-200 text-zinc-600 px-4 py-2 rounded-lg text-sm hover:bg-zinc-50 transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Type badges */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["NOTE", "CALL", "EMAIL", "MEETING", "TASK"].map((t) => {
          const count = activities.filter((a) => a.type === t).length;
          return (
            <Link
              key={t}
              href={`/crm/activities?type=${t}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                backgroundColor: type === t ? ACTIVITY_COLORS[t] : ACTIVITY_COLORS[t] + "15",
                color: type === t ? "white" : ACTIVITY_COLORS[t],
              }}
            >
              {ACTIVITY_ICONS[t]} {t} ({count})
            </Link>
          );
        })}
      </div>

      {/* Activity Timeline */}
      {activities.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center shadow-sm">
          <p className="text-zinc-400">No activities found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, acts]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">{date}</p>
              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm divide-y divide-zinc-50">
                {acts.map((act) => (
                  <div key={act.id} className="px-5 py-4 flex items-start gap-4">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: ACTIVITY_COLORS[act.type] + "20" }}
                    >
                      {ACTIVITY_ICONS[act.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-xs font-medium px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: ACTIVITY_COLORS[act.type] + "20",
                            color: ACTIVITY_COLORS[act.type],
                          }}
                        >
                          {act.type}
                        </span>
                        <Link
                          href={`/crm/contacts/${act.contact.id}`}
                          className="text-sm text-zinc-600 hover:text-zinc-900 font-medium"
                        >
                          {act.contact.firstName} {act.contact.lastName}
                          {act.contact.company && ` · ${act.contact.company}`}
                        </Link>
                      </div>
                      <p className="text-sm font-medium text-zinc-900">{act.title}</p>
                      {act.body && (
                        <p className="text-sm text-zinc-500 mt-0.5">{act.body}</p>
                      )}
                      <p className="text-xs text-zinc-400 mt-1">
                        {new Date(act.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
