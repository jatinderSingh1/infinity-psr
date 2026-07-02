import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { asArr } from "@/lib/utils";

export default async function CandidatesPage() {
  const candidates = await prisma.candidate.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Candidates</h1>
          <p className="text-zinc-500 text-sm">{candidates.length} total</p>
        </div>
        <Link
          href="/crm/candidates/new"
          className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          + Add Candidate
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
        {candidates.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-zinc-400 text-sm">No candidates yet.</p>
            <Link href="/crm/candidates/new" className="text-sm text-zinc-900 font-medium underline mt-2 block">
              Add your first candidate.
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-zinc-100">
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Current Role</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Industry</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Skills</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Applications</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-3">
                    <Link href={`/crm/candidates/${c.id}`} className="font-medium text-zinc-900 hover:underline">
                      {c.firstName} {c.lastName}
                    </Link>
                    <p className="text-xs text-zinc-400 mt-0.5">{c.email}</p>
                  </td>
                  <td className="px-6 py-3 text-zinc-600">
                    {c.currentTitle ?? "—"}
                    {c.currentCompany && <span className="text-zinc-400"> · {c.currentCompany}</span>}
                  </td>
                  <td className="px-6 py-3 text-zinc-600">{c.industry ?? "—"}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {asArr(c.skills).slice(0, 3).map((s) => (
                        <span key={s} className="bg-zinc-100 text-zinc-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                      {asArr(c.skills).length > 3 && (
                        <span className="text-zinc-400 text-xs">+{asArr(c.skills).length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-zinc-600">{c._count.applications}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
