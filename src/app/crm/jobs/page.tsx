import { prisma } from "@/lib/prisma";
import Link from "next/link";

const statusColor: Record<string, string> = {
  OPEN: "bg-green-100 text-green-700",
  ON_HOLD: "bg-amber-100 text-amber-700",
  FILLED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function JobsPage() {
  const jobs = await prisma.jobOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: true,
      _count: { select: { applications: true } },
    },
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Job Orders</h1>
          <p className="text-zinc-500 text-sm">{jobs.length} total</p>
        </div>
        <Link
          href="/crm/jobs/new"
          className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          + New Job Order
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
        {jobs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-zinc-400 text-sm">No job orders yet.</p>
            <Link href="/crm/jobs/new" className="text-sm text-zinc-900 font-medium underline mt-2 block">
              Create your first job order.
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-zinc-100">
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Role</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Client</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Location</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Applicants</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-3">
                    <Link href={`/crm/jobs/${job.id}`} className="font-medium text-zinc-900 hover:underline">
                      {job.title}
                    </Link>
                    {job.salary && <p className="text-xs text-zinc-400 mt-0.5">{job.salary}</p>}
                  </td>
                  <td className="px-6 py-3 text-zinc-600">{job.client.name}</td>
                  <td className="px-6 py-3 text-zinc-500">{job.location ?? "—"}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[job.status] ?? "bg-zinc-100 text-zinc-600"}`}>
                      {job.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-zinc-600">{job._count.applications}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
