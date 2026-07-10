import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { fmtMoney } from "@/lib/format";
import { PageHeader, card, cardPad, sectionTitle, Badge } from "@/components/crm/ui";

export default async function ReportsPage() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [orders, revenueAgg, topProducts, topCustomersRaw, dealStats] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo }, status: { not: "CANCELLED" } },
      select: { total: true, amountPaid: true, createdAt: true },
    }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { total: true, amountPaid: true },
      _count: true,
    }),
    prisma.orderItem.groupBy({
      by: ["title"],
      where: { order: { status: { not: "CANCELLED" } } },
      _sum: { total: true, quantity: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
    prisma.order.groupBy({
      by: ["contactId"],
      where: { status: { not: "CANCELLED" } },
      _sum: { total: true },
      _count: true,
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
    prisma.deal.groupBy({
      by: ["stage"],
      _count: true,
      _sum: { value: true },
    }),
  ]);

  // Resolve top-customer names
  const customerIds = topCustomersRaw.map((t) => t.contactId);
  const customers = customerIds.length
    ? await prisma.contact.findMany({
        where: { id: { in: customerIds } },
        select: { id: true, firstName: true, lastName: true, company: true },
      })
    : [];
  const topCustomers = topCustomersRaw.map((t) => ({
    ...t,
    contact: customers.find((c) => c.id === t.contactId),
  }));

  // Monthly buckets (last 6 months)
  const months: { label: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleDateString("en-CA", { month: "short" }),
      total: 0,
    });
  }
  for (const o of orders) {
    const d = new Date(o.createdAt);
    const idx = 5 - ((now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()));
    if (idx >= 0 && idx < 6) months[idx].total += o.total;
  }
  const maxMonth = Math.max(...months.map((m) => m.total), 1);

  const totalRevenue = revenueAgg._sum.total ?? 0;
  const collected = revenueAgg._sum.amountPaid ?? 0;
  const outstanding = totalRevenue - collected;
  const orderCount = revenueAgg._count;
  const avgOrder = orderCount > 0 ? totalRevenue / orderCount : 0;

  const won = dealStats.find((d) => d.stage === "WON");
  const lost = dealStats.find((d) => d.stage === "LOST");
  const openDeals = dealStats.filter((d) => d.stage !== "WON" && d.stage !== "LOST");
  const openCount = openDeals.reduce((s, d) => s + d._count, 0);
  const openValue = openDeals.reduce((s, d) => s + (d._sum.value ?? 0), 0);
  const wonCount = won?._count ?? 0;
  const lostCount = lost?._count ?? 0;
  const conversion = wonCount + lostCount > 0 ? Math.round((wonCount / (wonCount + lostCount)) * 100) : null;

  const stats = [
    { label: "Total revenue", value: fmtMoney(totalRevenue) },
    { label: "Collected", value: fmtMoney(collected) },
    { label: "Outstanding", value: fmtMoney(outstanding), critical: outstanding > 0 },
    { label: "Avg. order value", value: fmtMoney(avgOrder) },
  ];

  return (
    <div className="p-5 max-w-[1050px] mx-auto">
      <PageHeader title="Reports" subtitle="Revenue, products, customers, and pipeline performance" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {stats.map((s) => (
          <div key={s.label} className={cardPad}>
            <p className="text-xs text-[#616161] font-medium mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${s.critical ? "text-[#8e1f0b]" : "text-[#1a1a1a]"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className={`${card} p-4 mb-4`}>
        <h2 className={`${sectionTitle} mb-4`}>Revenue — last 6 months</h2>
        <div className="flex items-end gap-3 h-44">
          {months.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[11px] text-[#616161] font-medium">
                {m.total > 0 ? fmtMoney(m.total) : ""}
              </span>
              <div
                className="w-full max-w-16 bg-[#1a1a1a] rounded-t-md transition-all hover:bg-[#303030]"
                style={{ height: `${Math.max((m.total / maxMonth) * 100, m.total > 0 ? 4 : 1)}%` }}
                title={`${m.label}: ${fmtMoney(m.total)}`}
              />
              <span className="text-[11px] text-[#8a8a8a]">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Top products */}
        <div className={`${card} overflow-hidden`}>
          <div className="px-4 py-3 border-b border-[#ebebeb]">
            <h2 className={sectionTitle}>Top products</h2>
          </div>
          {topProducts.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-[#8a8a8a]">No sales yet</p>
          ) : (
            <div className="divide-y divide-[#f1f1f1]">
              {topProducts.map((p, i) => (
                <div key={p.title} className="px-4 py-2.5 flex items-center gap-3">
                  <span className="w-5 text-[13px] text-[#8a8a8a] font-medium">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1a1a1a] truncate">{p.title}</p>
                    <p className="text-xs text-[#8a8a8a]">{p._sum.quantity ?? 0} sold</p>
                  </div>
                  <span className="text-[13px] font-semibold">{fmtMoney(p._sum.total ?? 0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top customers */}
        <div className={`${card} overflow-hidden`}>
          <div className="px-4 py-3 border-b border-[#ebebeb]">
            <h2 className={sectionTitle}>Top customers</h2>
          </div>
          {topCustomers.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-[#8a8a8a]">No orders yet</p>
          ) : (
            <div className="divide-y divide-[#f1f1f1]">
              {topCustomers.map((t, i) => (
                <div key={t.contactId} className="px-4 py-2.5 flex items-center gap-3">
                  <span className="w-5 text-[13px] text-[#8a8a8a] font-medium">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <Link href={`/crm/contacts/${t.contactId}`} className="text-[13px] font-medium text-[#1a1a1a] hover:underline truncate block">
                      {t.contact ? `${t.contact.firstName} ${t.contact.lastName ?? ""}` : "Unknown"}
                    </Link>
                    <p className="text-xs text-[#8a8a8a]">{t._count} order{t._count !== 1 ? "s" : ""}</p>
                  </div>
                  <span className="text-[13px] font-semibold">{fmtMoney(t._sum.total ?? 0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pipeline */}
      <div className={`${card} p-4`}>
        <h2 className={`${sectionTitle} mb-3`}>Pipeline</h2>
        <div className="flex items-center gap-4 flex-wrap text-[13px]">
          <div>
            <span className="text-[#616161]">Open deals: </span>
            <span className="font-semibold">{openCount}</span>
            <span className="text-[#8a8a8a]"> ({fmtMoney(openValue)})</span>
          </div>
          <div>
            <span className="text-[#616161]">Won: </span>
            <Badge tone="success">{wonCount} — {fmtMoney(won?._sum.value ?? 0)}</Badge>
          </div>
          <div>
            <span className="text-[#616161]">Lost: </span>
            <Badge tone="critical">{lostCount}</Badge>
          </div>
          {conversion !== null && (
            <div>
              <span className="text-[#616161]">Win rate: </span>
              <span className="font-semibold">{conversion}%</span>
            </div>
          )}
          <Link href="/crm/pipeline" className="text-[#005bd3] hover:underline ml-auto">
            View pipeline →
          </Link>
        </div>
      </div>
    </div>
  );
}
