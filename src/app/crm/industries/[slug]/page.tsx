import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const industry = await prisma.industry.findUnique({
    where: { slug },
    include: {
      contactTypes: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        include: { _count: { select: { roles: true } } },
      },
      _count: { select: { roles: true } },
    },
  });

  if (!industry) notFound();

  const recentContacts = await prisma.contact.findMany({
    where: { roles: { some: { industryId: industry.id } } },
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      roles: {
        where: { industryId: industry.id },
        include: { contactType: { select: { name: true } } },
      },
    },
  });

  const statusColors: Record<string, string> = {
    ACTIVE: "#059669",
    INACTIVE: "#6b7280",
    LEAD: "#4f46e5",
    PROSPECT: "#d97706",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div
        className="rounded-2xl p-6 mb-6 flex items-center gap-4"
        style={{ backgroundColor: industry.color ? industry.color + "15" : "#f4f4f5", borderLeft: `4px solid ${industry.color ?? "#6b7280"}` }}
      >
        <span className="text-4xl">{industry.icon ?? "📁"}</span>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-zinc-900">{industry.name}</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{industry.description}</p>
          <p className="text-sm font-medium mt-1" style={{ color: industry.color ?? "#6b7280" }}>
            {industry._count.roles} contact{industry._count.roles !== 1 ? "s" : ""} in this industry
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/crm/contacts/new?industryId=${industry.id}`}
            className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            + Add Contact
          </Link>
          <Link
            href={`/crm/settings/contact-types/${slug}`}
            className="border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors bg-white"
          >
            Manage Types
          </Link>
        </div>
      </div>

      {/* Contact Type Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {industry.contactTypes.map((ct) => (
          <Link
            key={ct.id}
            href={`/crm/industries/${slug}/${ct.slug}`}
            className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-zinc-800 text-sm">{ct.name}</p>
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: industry.color ?? "#6b7280" }}
              />
            </div>
            <p className="text-2xl font-bold text-zinc-900">{ct._count.roles}</p>
            <p className="text-xs text-zinc-400 mt-0.5">contacts</p>
          </Link>
        ))}
        <Link
          href={`/crm/settings/contact-types/${slug}`}
          className="bg-white rounded-xl border-2 border-dashed border-zinc-200 p-4 hover:border-zinc-300 transition-all flex flex-col items-center justify-center gap-2 text-center"
        >
          <span className="text-2xl text-zinc-300">+</span>
          <p className="text-xs text-zinc-400">Add contact type</p>
        </Link>
      </div>

      {/* Recent Contacts */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900">Recent Contacts</h2>
          <Link
            href={`/crm/contacts?industry=${slug}`}
            className="text-xs text-zinc-400 hover:text-zinc-900"
          >
            View all →
          </Link>
        </div>
        {recentContacts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-zinc-400 text-sm mb-3">No contacts yet in {industry.name}</p>
            <Link
              href={`/crm/contacts/new?industryId=${industry.id}`}
              className="text-sm text-zinc-900 font-medium underline"
            >
              Add first contact
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
                  <p className="text-xs text-zinc-400">{c.company ?? c.email ?? c.phone ?? "—"}</p>
                </div>
                <div className="flex gap-1">
                  {c.roles.map((r) => (
                    <span
                      key={r.id}
                      className="px-2 py-0.5 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: industry.color ?? "#6b7280" }}
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
    </div>
  );
}
