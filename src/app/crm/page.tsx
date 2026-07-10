import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { fmtMoney } from "@/lib/format";
import {
  Badge,
  PaymentBadge,
  contactStatusTone,
  PageHeader,
  card,
  cardPad,
  sectionTitle,
  btnPrimary,
  btnSecondary,
} from "@/components/crm/ui";

const ACTIVITY_ICONS: Record<string, string> = {
  NOTE: "📝",
  CALL: "📞",
  EMAIL: "✉️",
  MEETING: "🤝",
  TASK: "✔️",
};

export default async function DashboardPage() {
  const session = await auth();
  const firstName = (session?.user?.name ?? "there").split(" ")[0];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const [
    totalContacts,
    activeDeals,
    monthOrders,
    outstandingAgg,
    overdueFollowUps,
    recentOrders,
    recentActivities,
    industries,
    productsForStock,
    recentContacts,
  ] = await Promise.all([
    prisma.contact.count(),
    prisma.deal.count({ where: { stage: { notIn: ["WON", "LOST"] } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: monthStart }, status: { not: "CANCELLED" } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" }, paymentStatus: { in: ["UNPAID", "PARTIAL"] } },
      _sum: { total: true, amountPaid: true },
    }),
    prisma.contact.findMany({
      where: { followUpDate: { lte: now } },
      orderBy: { followUpDate: "asc" },
      take: 5,
      select: { id: true, firstName: true, lastName: true, followUpDate: true, followUpNote: true },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { contact: { select: { firstName: true, lastName: true } } },
    }),
    prisma.activity.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { contact: { select: { id: true, firstName: true, lastName: true } } },
    }),
    prisma.industry.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: { _count: { select: { roles: true } } },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { stock: "asc" },
      take: 25,
      select: { id: true, name: true, stock: true, lowStockAt: true, unit: true },
    }),
    prisma.contact.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { roles: { include: { industry: true, contactType: true }, take: 2 } },
    }),
  ]);

  const lowStock = productsForStock.filter((p) => p.stock <= p.lowStockAt).slice(0, 5);
  const outstanding = (outstandingAgg._sum.total ?? 0) - (outstandingAgg._sum.amountPaid ?? 0);

  const stats = [
    { label: "Revenue this month", value: fmtMoney(monthOrders._sum.total ?? 0) },
    { label: "Orders this month", value: String(monthOrders._count) },
    { label: "Outstanding balance", value: fmtMoney(outstanding), critical: outstanding > 0 },
    { label: "Active deals", value: String(activeDeals) },
  ];

  return (
    <div className="p-5 max-w-[1050px] mx-auto">
      <PageHeader
        title={`${greeting}, ${firstName}`}
        subtitle={now.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })}
        actions={
          <>
            <Link href="/crm/contacts/new" className={btnSecondary}>Add contact</Link>
            <Link href="/crm/orders/new" className={btnPrimary}>Create order</Link>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {stats.map((s) => (
          <div key={s.label} className={cardPad}>
            <p className="text-xs text-[#616161] font-medium mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${s.critical ? "text-[#8e1f0b]" : "text-[#1a1a1a]"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Overdue follow-ups */}
      {overdueFollowUps.length > 0 && (
        <div className="bg-[#fff8db] border border-[#ffe27a] rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#f5e9b8] flex items-center gap-2">
            <span>⏰</span>
            <h2 className="text-[13px] font-semibold text-[#4f4700]">
              Overdue follow-ups ({overdueFollowUps.length})
            </h2>
          </div>
          <div className="divide-y divide-[#f5e9b8]">
            {overdueFollowUps.map((c) => {
              const daysAgo = Math.floor((Date.now() - new Date(c.followUpDate!).getTime()) / 86400000);
              return (
                <div key={c.id} className="px-4 py-2.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <Link href={`/crm/contacts/${c.id}`} className="text-[13px] font-medium text-[#4f4700] hover:underline">
                      {c.firstName} {c.lastName}
                    </Link>
                    {c.followUpNote && <p className="text-xs text-[#8a6116] truncate">{c.followUpNote}</p>}
                  </div>
                  <span className="text-xs text-[#8a6116] flex-shrink-0">
                    {daysAgo === 0 ? "due today" : `${daysAgo}d overdue`}
                  </span>
                  <Link href={`/crm/contacts/${c.id}/edit`} className="text-xs text-[#4f4700] underline flex-shrink-0">
                    Update
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Low stock */}
      {lowStock.length > 0 && (
        <div className="bg-[#fff0f0] border border-[#f3c7c5] rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#f3d9d8] flex items-center gap-2">
            <span>📉</span>
            <h2 className="text-[13px] font-semibold text-[#8e1f0b]">Low stock ({lowStock.length})</h2>
          </div>
          <div className="divide-y divide-[#f3d9d8]">
            {lowStock.map((p) => (
              <div key={p.id} className="px-4 py-2.5 flex items-center gap-3">
                <Link href={`/crm/products/${p.id}/edit`} className="flex-1 text-[13px] font-medium text-[#8e1f0b] hover:underline truncate">
                  {p.name}
                </Link>
                <span className="text-xs text-[#b83a30]">
                  {p.stock <= 0 ? "Out of stock" : `${p.stock} ${p.unit} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className={`${card} overflow-hidden`}>
          <div className="px-4 py-3 border-b border-[#ebebeb] flex items-center justify-between">
            <h2 className={sectionTitle}>Recent orders</h2>
            <Link href="/crm/orders" className="text-xs text-[#005bd3] hover:underline">View all →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] text-[#8a8a8a] mb-2">No orders yet</p>
              <Link href="/crm/orders/new" className="text-[13px] text-[#005bd3] hover:underline font-medium">
                Create your first order
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#f1f1f1]">
              {recentOrders.map((o) => (
                <Link key={o.id} href={`/crm/orders/${o.id}`} className="px-4 py-2.5 flex items-center gap-3 hover:bg-[#fafafa] transition-colors">
                  <span className="text-[13px] font-semibold text-[#1a1a1a] w-14">#{o.number}</span>
                  <span className="flex-1 text-[13px] text-[#303030] truncate">
                    {o.contact.firstName} {o.contact.lastName}
                  </span>
                  <PaymentBadge status={o.paymentStatus} />
                  <span className="text-[13px] font-medium w-20 text-right">{fmtMoney(o.total, o.currency)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className={`${card} overflow-hidden`}>
          <div className="px-4 py-3 border-b border-[#ebebeb] flex items-center justify-between">
            <h2 className={sectionTitle}>Recent activity</h2>
            <Link href="/crm/activities" className="text-xs text-[#005bd3] hover:underline">All →</Link>
          </div>
          {recentActivities.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-[#8a8a8a]">No activity yet</p>
          ) : (
            <div className="divide-y divide-[#f1f1f1]">
              {recentActivities.map((act) => (
                <div key={act.id} className="px-4 py-2.5 flex items-start gap-2.5">
                  <span className="text-base mt-0.5">{ACTIVITY_ICONS[act.type] ?? "📝"}</span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#1a1a1a] truncate">{act.title}</p>
                    <Link href={`/crm/contacts/${act.contact.id}`} className="text-xs text-[#8a8a8a] hover:underline">
                      {act.contact.firstName} {act.contact.lastName}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Industries */}
      <div className={`${card} overflow-hidden mb-4`}>
        <div className="px-4 py-3 border-b border-[#ebebeb] flex items-center justify-between">
          <h2 className={sectionTitle}>Industries</h2>
          <Link href="/crm/settings/industries" className="text-xs text-[#005bd3] hover:underline">Manage →</Link>
        </div>
        <div className="p-3 grid grid-cols-2 md:grid-cols-3 gap-2">
          {industries.map((ind) => (
            <Link
              key={ind.id}
              href={`/crm/industries/${ind.slug}`}
              className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-[#f7f7f7] transition-colors border border-[#f1f1f1]"
            >
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{ backgroundColor: ind.color ? ind.color + "20" : "#f4f4f5" }}
              >
                {ind.icon ?? "📁"}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#1a1a1a] truncate">{ind.name}</p>
                <p className="text-xs text-[#8a8a8a]">{ind._count.roles} contacts</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent contacts */}
      <div className={`${card} overflow-hidden`}>
        <div className="px-4 py-3 border-b border-[#ebebeb] flex items-center justify-between">
          <h2 className={sectionTitle}>Recent contacts</h2>
          <Link href="/crm/contacts" className="text-xs text-[#005bd3] hover:underline">View all →</Link>
        </div>
        {recentContacts.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-[13px] text-[#8a8a8a] mb-2">No contacts yet</p>
            <Link href="/crm/contacts/new" className="text-[13px] text-[#005bd3] hover:underline font-medium">
              Add your first contact
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f1f1]">
            {recentContacts.map((c) => (
              <div key={c.id} className="px-4 py-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#e3e3e3] flex items-center justify-center text-xs font-bold text-[#303030] flex-shrink-0">
                  {c.firstName[0]}{c.lastName?.[0] ?? ""}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/crm/contacts/${c.id}`} className="text-[13px] font-medium text-[#1a1a1a] hover:underline">
                    {c.firstName} {c.lastName}
                  </Link>
                  <p className="text-xs text-[#8a8a8a] truncate">{c.company ?? c.email ?? c.phone ?? "—"}</p>
                </div>
                <div className="flex gap-1 flex-wrap justify-end items-center">
                  {c.roles.map((r) => (
                    <span
                      key={r.id}
                      className="px-1.5 py-0.5 rounded text-[11px] font-medium text-white"
                      style={{ backgroundColor: r.industry.color ?? "#6b7280" }}
                    >
                      {r.contactType.name}
                    </span>
                  ))}
                  <Badge tone={contactStatusTone(c.status)}>{c.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
