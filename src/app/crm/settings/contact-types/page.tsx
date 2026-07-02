import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ContactTypesPage() {
  const industries = await prisma.industry.findMany({
    orderBy: { order: "asc" },
    include: {
      contactTypes: { orderBy: { order: "asc" }, include: { _count: { select: { roles: true } } } },
    },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Contact Types</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Select an industry to manage its contact types
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {industries.map((ind) => (
          <Link
            key={ind.id}
            href={`/crm/settings/contact-types/${ind.slug}`}
            className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: ind.color ? ind.color + "20" : "#f4f4f5" }}
              >
                {ind.icon ?? "📁"}
              </span>
              <div>
                <p className="font-semibold text-zinc-900">{ind.name}</p>
                <p className="text-xs text-zinc-400">{ind.contactTypes.length} types</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ind.contactTypes.map((ct) => (
                <span
                  key={ct.id}
                  className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                  style={{ backgroundColor: ind.color ?? "#6b7280" }}
                >
                  {ct.name} ({ct._count.roles})
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
