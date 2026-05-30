import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const [clients, candidates, jobs, placements] = await Promise.all([
    prisma.client.count(),
    prisma.candidate.count(),
    prisma.jobOrder.count({ where: { status: "OPEN" } }),
    prisma.application.count({ where: { stage: "PLACED" } }),
  ]);

  const stats = [
    { label: "Total Clients", value: clients, color: "bg-blue-50 border-blue-100", text: "text-blue-700" },
    { label: "Candidates", value: candidates, color: "bg-violet-50 border-violet-100", text: "text-violet-700" },
    { label: "Open Roles", value: jobs, color: "bg-amber-50 border-amber-100", text: "text-amber-700" },
    { label: "Placements", value: placements, color: "bg-green-50 border-green-100", text: "text-green-700" },
  ];

  const recentJobs = await prisma.jobOrder.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { client: true, _count: { select: { applications: true } } },
  });

  const statusColor: Record<string, string> = {
    OPEN: "bg-green-100 text-green-700",
    ON_HOLD: "bg-amber-100 text-amber-700",
    FILLED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">Dashboard</h1>
        <p className="text-zinc-500 text-sm">Welcome back</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.color} p-5`}>
            <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-sm text-zinc-600 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <Link href="/crm/clients/new" className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors">
          + New Client
        </Link>
        <Link href="/crm/candidates/new" className="bg-white border border-zinc-200 text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">
          + New Candidate
        </Link>
        <Link href="/crm/jobs/new" className="bg-white border border-zinc-200 text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">
          + New Job Order
        </Link>
      </div>

      {/* Recent Jobs */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900">Recent Job Orders</h2>
          <Link href="/crm/jobs" className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">View all →</Link>
        </div>
        {recentJobs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-zinc-400 text-sm">No job orders yet.</p>
            <Link href="/crm/jobs/new" className="text-sm text-zinc-900 font-medium underline mt-2 block">Create your first job order</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-zinc-100">
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Role</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Client</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Applicants</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job) => (
                <tr key={job.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-zinc-900">{job.title}</td>
                  <td className="px-6 py-3 text-zinc-600">{job.client.name}</td>
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
