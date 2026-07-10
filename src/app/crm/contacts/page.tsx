import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { asArr } from "@/lib/utils";
import { Badge, contactStatusTone, PageHeader, EmptyState, card, btnPrimary, btnSecondary, inputCls, thCls, tdCls } from "@/components/crm/ui";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; industry?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const search = sp.search ?? "";
  const industrySlug = sp.industry ?? "";
  const status = sp.status ?? "";

  const contacts = await prisma.contact.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { company: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        industrySlug ? { roles: { some: { industry: { slug: industrySlug } } } } : {},
        status ? { status: status as "ACTIVE" | "INACTIVE" | "LEAD" | "PROSPECT" } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      roles: {
        include: {
          industry: { select: { name: true, color: true, icon: true } },
          contactType: { select: { name: true } },
        },
        take: 3,
      },
      _count: { select: { activities: true, deals: true, orders: true } },
    },
  });

  const industries = await prisma.industry.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { slug: true, name: true, icon: true },
  });

  return (
    <div className="p-5 max-w-[1050px] mx-auto">
      <PageHeader
        title="Contacts"
        subtitle={`${contacts.length} contact${contacts.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Link href="/crm/settings/import" className={btnSecondary}>Import</Link>
            <a href="/api/contacts/export" className={btnSecondary}>Export CSV</a>
            <Link href="/crm/contacts/new" className={btnPrimary}>Add contact</Link>
          </>
        }
      />

      {/* Filters */}
      <form method="GET" className="flex gap-2 mb-4 flex-wrap">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search name, email, company, phone…"
          className={`${inputCls} flex-1 min-w-44 max-w-xs`}
        />
        <select name="industry" defaultValue={industrySlug} className={`${inputCls} w-auto`}>
          <option value="">All industries</option>
          {industries.map((ind) => (
            <option key={ind.slug} value={ind.slug}>{ind.icon} {ind.name}</option>
          ))}
        </select>
        <select name="status" defaultValue={status} className={`${inputCls} w-auto`}>
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="LEAD">Lead</option>
          <option value="PROSPECT">Prospect</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <button type="submit" className={btnSecondary}>Filter</button>
        {(search || industrySlug || status) && (
          <Link href="/crm/contacts" className={`${btnSecondary} border-transparent shadow-none`}>Clear</Link>
        )}
      </form>

      {/* Table */}
      <div className={`${card} overflow-hidden`}>
        {contacts.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No contacts found"
            text="Add contacts one at a time, or import your whole list from a spreadsheet."
            action={
              <div className="flex gap-2 justify-center">
                <Link href="/crm/settings/import" className={btnSecondary}>Import CSV</Link>
                <Link href="/crm/contacts/new" className={btnPrimary}>Add contact</Link>
              </div>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="border-b border-[#ebebeb] bg-[#fafafa]">
                <tr>
                  <th className={thCls}>Name</th>
                  <th className={thCls}>Company</th>
                  <th className={thCls}>Contact</th>
                  <th className={thCls}>Roles</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}>History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f1f1]">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className={tdCls}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#e3e3e3] flex items-center justify-center text-xs font-bold text-[#303030] flex-shrink-0">
                          {c.firstName[0]}{c.lastName?.[0] ?? ""}
                        </div>
                        <div>
                          <Link href={`/crm/contacts/${c.id}`} className="font-medium text-[#1a1a1a] hover:underline">
                            {c.firstName} {c.lastName}
                          </Link>
                          {asArr(c.tags).length > 0 && (
                            <p className="text-xs text-[#8a8a8a]">{asArr(c.tags).slice(0, 2).join(", ")}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={`${tdCls} text-[#616161]`}>{c.company ?? "—"}</td>
                    <td className={tdCls}>
                      <p className="text-[#616161]">{c.email ?? c.phone ?? "—"}</p>
                      {c.email && c.phone && <p className="text-xs text-[#8a8a8a]">{c.phone}</p>}
                    </td>
                    <td className={tdCls}>
                      <div className="flex gap-1 flex-wrap">
                        {c.roles.map((r) => (
                          <span
                            key={r.id}
                            className="px-1.5 py-0.5 rounded text-[11px] font-medium text-white whitespace-nowrap"
                            style={{ backgroundColor: r.industry.color ?? "#6b7280" }}
                          >
                            {r.industry.icon} {r.contactType.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={tdCls}>
                      <Badge tone={contactStatusTone(c.status)}>{c.status}</Badge>
                    </td>
                    <td className={`${tdCls} text-xs text-[#8a8a8a] whitespace-nowrap`}>
                      {c._count.orders} orders · {c._count.deals} deals · {c._count.activities} notes
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
