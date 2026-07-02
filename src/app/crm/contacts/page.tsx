import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { asArr } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#059669",
  INACTIVE: "#6b7280",
  LEAD: "#4f46e5",
  PROSPECT: "#d97706",
};

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
      _count: { select: { activities: true, deals: true } },
    },
  });

  const industries = await prisma.industry.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { slug: true, name: true, icon: true },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Contacts</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{contacts.length} result{contacts.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/crm/contacts/new"
          className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          + Add Contact
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 mb-6 flex-wrap">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search name, email, company…"
          className="flex-1 min-w-48 border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
        />
        <select
          name="industry"
          defaultValue={industrySlug}
          className="border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
        >
          <option value="">All Industries</option>
          {industries.map((ind) => (
            <option key={ind.slug} value={ind.slug}>
              {ind.icon} {ind.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status}
          className="border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="LEAD">Lead</option>
          <option value="PROSPECT">Prospect</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <button
          type="submit"
          className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          Filter
        </button>
        {(search || industrySlug || status) && (
          <Link
            href="/crm/contacts"
            className="border border-zinc-200 text-zinc-600 px-4 py-2 rounded-lg text-sm hover:bg-zinc-50 transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {contacts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-zinc-400 text-sm mb-3">No contacts found</p>
            <Link
              href="/crm/contacts/new"
              className="text-sm text-zinc-900 font-medium underline"
            >
              Add your first contact
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="border-b border-zinc-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Company</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Contact</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Roles</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: STATUS_COLORS[c.status] ?? "#6b7280" }}
                        >
                          {c.firstName[0]}{c.lastName?.[0] ?? ""}
                        </div>
                        <div>
                          <Link
                            href={`/crm/contacts/${c.id}`}
                            className="font-medium text-zinc-900 hover:underline"
                          >
                            {c.firstName} {c.lastName}
                          </Link>
                          {asArr(c.tags).length > 0 && (
                            <p className="text-xs text-zinc-400">{asArr(c.tags).slice(0, 2).join(", ")}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-zinc-600">{c.company ?? "—"}</td>
                    <td className="px-5 py-3">
                      <p className="text-zinc-600">{c.email ?? c.phone ?? "—"}</p>
                      {c.email && c.phone && (
                        <p className="text-xs text-zinc-400">{c.phone}</p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {c.roles.map((r) => (
                          <span
                            key={r.id}
                            className="px-1.5 py-0.5 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: r.industry.color ?? "#6b7280" }}
                          >
                            {r.industry.icon} {r.contactType.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: STATUS_COLORS[c.status] ?? "#6b7280" }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-zinc-400 text-xs">
                      {c._count.activities} notes · {c._count.deals} deals
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
