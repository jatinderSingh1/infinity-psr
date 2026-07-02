import { prisma } from "@/lib/prisma";
import { IndustriesManager } from "@/components/crm/IndustriesManager";

export default async function IndustriesSettingsPage() {
  const industries = await prisma.industry.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { roles: true, contactTypes: true } } },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Industries</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Manage the industries in your system. Add new ones or configure existing ones.
        </p>
      </div>
      <IndustriesManager industries={industries} />
    </div>
  );
}
