import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ContactTypesManager } from "@/components/crm/ContactTypesManager";
import Link from "next/link";

export default async function ContactTypesByIndustryPage({
  params,
}: {
  params: Promise<{ industrySlug: string }>;
}) {
  const { industrySlug } = await params;

  const industry = await prisma.industry.findUnique({
    where: { slug: industrySlug },
    include: {
      contactTypes: {
        orderBy: { order: "asc" },
        include: { _count: { select: { roles: true } } },
      },
    },
  });

  if (!industry) notFound();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
        <Link href="/crm/settings/contact-types" className="hover:text-zinc-700">Contact Types</Link>
        <span>/</span>
        <span className="text-zinc-700">{industry.name}</span>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <span
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: industry.color ? industry.color + "20" : "#f4f4f5" }}
        >
          {industry.icon ?? "📁"}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{industry.name}</h1>
          <p className="text-zinc-500 text-sm">Manage contact types for this industry</p>
        </div>
      </div>
      <ContactTypesManager industry={industry} contactTypes={industry.contactTypes} />
    </div>
  );
}
