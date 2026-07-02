import { prisma } from "@/lib/prisma";
import { DealBoard } from "@/components/crm/DealBoard";

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string }>;
}) {
  const sp = await searchParams;
  const industrySlug = sp.industry ?? "";

  const [deals, industries, contacts] = await Promise.all([
    prisma.deal.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true } },
        industry: { select: { id: true, name: true, slug: true, color: true, icon: true } },
      },
    }),
    prisma.industry.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true, icon: true, color: true },
    }),
    prisma.contact.findMany({
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true, company: true },
      take: 500,
    }),
  ]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Pipeline</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{deals.length} total deal{deals.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <DealBoard
        initialDeals={deals}
        industries={industries}
        contacts={contacts}
        industrySlug={industrySlug}
      />
    </div>
  );
}
