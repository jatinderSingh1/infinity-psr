import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ContactTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; typeSlug: string }>;
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const { slug, typeSlug } = await params;
  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";

  const industry = await prisma.industry.findUnique({ where: { slug } });
  if (!industry) notFound();

  const contactType = await prisma.contactType.findUnique({
    where: { industryId_slug: { industryId: industry.id, slug: typeSlug } },
  });
  if (!contactType) notFound();

  const contacts = await prisma.contact.findMany({
    where: {
      AND: [
        { roles: { some: { contactTypeId: contactType.id } } },
        search
          ? {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { company: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
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

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE: "#059669",
    INACTIVE: "#6b7280",
    LEAD: "#4f46e5",
    PROSPECT: "#d97706",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
        <Link href={`/crm/industries/${slug}`} className="hover:text-zinc-700">
          {industry.icon} {industry.name}
        </Link>
        <span>/</span>
        <span className="text-zinc-700">{contactType.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            {contactType.name}
            <span className="ml-2 text-sm font-normal text-zinc-400">in {industry.name}</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">{contacts.length} contact{contacts.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href={`/crm/contacts/new?industryId=${industry.id}&typeId=${contactType.id}`}
          className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          + Add {contactType.name}
        </Link>
      </div>

      {/* Search / Filter */}
      <form method="GET" className="flex gap-3 mb-5 flex-wrap">
        <input
          name="search"
          defaultValue={search}
          placeholder={`Search ${contactType.name}s…`}
          className="flex-1 min-w-48 border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
        />
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
        {(search || status) && (
          <Link
            href={`/crm/industries/${slug}/${typeSlug}`}
            className="border border-zinc-200 text-zinc-600 px-4 py-2 rounded-lg text-sm hover:bg-zinc-50 transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {contacts.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-zinc-400 text-sm mb-2">No {contactType.name}s found</p>
            <Link
              href={`/crm/contacts/new?industryId=${industry.id}&typeId=${contactType.id}`}
              className="text-sm text-zinc-900 font-medium underline"
            >
              Add first {contactType.name}
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Company</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Contact</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Also in</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {contacts.map((c) => {
                const otherRoles = c.roles.filter((r) => r.industry.name !== industry.name);
                return (
                  <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: STATUS_COLORS[c.status] ?? "#6b7280" }}
                        >
                          {c.firstName[0]}{c.lastName?.[0] ?? ""}
                        </div>
                        <Link
                          href={`/crm/contacts/${c.id}`}
                          className="font-medium text-zinc-900 hover:underline"
                        >
                          {c.firstName} {c.lastName}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-zinc-600">{c.company ?? "—"}</td>
                    <td className="px-5 py-3 text-zinc-600">{c.email ?? c.phone ?? "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {otherRoles.map((r) => (
                          <span
                            key={r.id}
                            className="px-1.5 py-0.5 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: r.industry.color ?? "#6b7280" }}
                          >
                            {r.industry.icon} {r.contactType.name}
                          </span>
                        ))}
                        {otherRoles.length === 0 && <span className="text-zinc-300">—</span>}
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
