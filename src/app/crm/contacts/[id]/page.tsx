import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ContactDetailClient } from "@/components/crm/ContactDetailClient";
import { asArr } from "@/lib/utils";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      roles: {
        include: { industry: true, contactType: true },
      },
      activities: { orderBy: { createdAt: "desc" } },
      deals: {
        include: { industry: { select: { name: true, color: true, icon: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!contact) notFound();

  const industries = await prisma.industry.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: { contactTypes: { where: { isActive: true }, orderBy: { order: "asc" } } },
  });

  const statusColors: Record<string, string> = {
    ACTIVE: "#059669",
    INACTIVE: "#6b7280",
    LEAD: "#4f46e5",
    PROSPECT: "#d97706",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
        <Link href="/crm/contacts" className="hover:text-zinc-700">Contacts</Link>
        <span>/</span>
        <span className="text-zinc-700">{contact.firstName} {contact.lastName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: statusColors[contact.status] ?? "#6b7280" }}
          >
            {contact.firstName[0]}{contact.lastName?.[0] ?? ""}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              {contact.firstName} {contact.lastName}
            </h1>
            <p className="text-zinc-500 text-sm">
              {contact.jobTitle ? `${contact.jobTitle}${contact.company ? " · " + contact.company : ""}` : contact.company ?? ""}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: statusColors[contact.status] ?? "#6b7280" }}
              >
                {contact.status}
              </span>
              {contact.currency && contact.currency !== "INR" && (
                <span className="text-xs text-zinc-400">{contact.currency}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/crm/contacts/${id}/edit`}
            className="border border-zinc-200 bg-white text-zinc-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info */}
        <div className="space-y-4">
          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
            <h2 className="font-semibold text-zinc-900 mb-3 text-sm uppercase tracking-wide">Contact</h2>
            <div className="space-y-2 text-sm">
              {contact.email && (
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">✉</span>
                  <a href={`mailto:${contact.email}`} className="text-zinc-700 hover:underline">{contact.email}</a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">📞</span>
                  <a href={`tel:${contact.phone}`} className="text-zinc-700 hover:underline">{contact.phone}</a>
                </div>
              )}
              {contact.phone2 && (
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">📱</span>
                  <a href={`tel:${contact.phone2}`} className="text-zinc-700 hover:underline">{contact.phone2}</a>
                </div>
              )}
              {contact.website && (
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">🌐</span>
                  <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-zinc-700 hover:underline truncate">{contact.website}</a>
                </div>
              )}
              {contact.instagram && (
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">📷</span>
                  <span className="text-zinc-700">{contact.instagram}</span>
                </div>
              )}
              {contact.linkedIn && (
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">💼</span>
                  <a href={contact.linkedIn} target="_blank" rel="noopener noreferrer" className="text-zinc-700 hover:underline truncate">{contact.linkedIn}</a>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {(contact.city || contact.address || contact.country) && (
            <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
              <h2 className="font-semibold text-zinc-900 mb-3 text-sm uppercase tracking-wide">Location</h2>
              <div className="text-sm text-zinc-600 space-y-1">
                {contact.address && <p>{contact.address}</p>}
                {(contact.city || contact.state) && <p>{[contact.city, contact.state].filter(Boolean).join(", ")}</p>}
                {contact.country && <p>{contact.country}</p>}
              </div>
            </div>
          )}

          {/* Tags */}
          {asArr(contact.tags).length > 0 && (
            <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
              <h2 className="font-semibold text-zinc-900 mb-3 text-sm uppercase tracking-wide">Tags</h2>
              <div className="flex flex-wrap gap-1.5">
                {asArr(contact.tags).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-xs">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
              <h2 className="font-semibold text-zinc-900 mb-3 text-sm uppercase tracking-wide">Notes</h2>
              <p className="text-sm text-zinc-600 whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}

          {/* Roles */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
            <h2 className="font-semibold text-zinc-900 mb-3 text-sm uppercase tracking-wide">Industry Roles</h2>
            {contact.roles.length === 0 ? (
              <p className="text-sm text-zinc-400">No roles assigned</p>
            ) : (
              <div className="space-y-2">
                {contact.roles.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ backgroundColor: r.industry.color ? r.industry.color + "25" : "#f4f4f5" }}
                    >
                      {r.industry.icon ?? "📁"}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-zinc-800">{r.contactType.name}</p>
                      <p className="text-xs text-zinc-400">{r.industry.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Activities + Deals */}
        <div className="lg:col-span-2 space-y-6">
          <ContactDetailClient
            contact={{
              id: contact.id,
              activities: contact.activities,
              deals: contact.deals.map((d) => ({
                id: d.id,
                title: d.title,
                stage: d.stage,
                value: d.value,
                currency: d.currency,
                industry: d.industry,
              })),
            }}
            industries={industries}
          />
        </div>
      </div>
    </div>
  );
}
