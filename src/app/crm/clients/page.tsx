import { prisma } from "@/lib/prisma";
import Link from "next/link";

const statusColor: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PROSPECT: "bg-blue-100 text-blue-700",
  INACTIVE: "bg-zinc-100 text-zinc-500",
};

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { jobOrders: true } } },
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Clients</h1>
          <p className="text-zinc-500 text-sm">{clients.length} total</p>
        </div>
        <Link
          href="/crm/clients/new"
          className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          + Add Client
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
        {clients.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-zinc-400 text-sm">No clients yet.</p>
            <Link href="/crm/clients/new" className="text-sm text-zinc-900 font-medium underline mt-2 block">
              Add your first client.
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-zinc-100">
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Company</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Industry</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Contact</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Jobs</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-3">
                    <Link href={`/crm/clients/${c.id}`} className="font-medium text-zinc-900 hover:underline">
                      {c.name}
                    </Link>
                    <p className="text-xs text-zinc-400 mt-0.5">{c.email}</p>
                  </td>
                  <td className="px-6 py-3 text-zinc-600">{c.industry}</td>
                  <td className="px-6 py-3 text-zinc-600">{c.contactName}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[c.status] ?? "bg-zinc-100 text-zinc-600"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-zinc-600">{c._count.jobOrders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
