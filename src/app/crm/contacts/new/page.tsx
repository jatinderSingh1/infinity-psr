import { prisma } from "@/lib/prisma";
import { ContactForm } from "@/components/crm/ContactForm";

export default async function NewContactPage({
  searchParams,
}: {
  searchParams: Promise<{ industryId?: string; typeId?: string }>;
}) {
  const sp = await searchParams;

  const industries = await prisma.industry.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      contactTypes: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">New Contact</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Fill in the details below</p>
      </div>
      <ContactForm
        industries={industries}
        defaultIndustryId={sp.industryId}
        defaultTypeId={sp.typeId}
      />
    </div>
  );
}
