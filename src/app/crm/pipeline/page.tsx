import { prisma } from "@/lib/prisma";

const STAGES = [
  { key: "APPLIED", label: "Applied" },
  { key: "SCREENED", label: "Screened" },
  { key: "INTERVIEWED", label: "Interviewed" },
  { key: "OFFER_SENT", label: "Offer Sent" },
  { key: "PLACED", label: "Placed" },
] as const;

export default async function PipelinePage() {
  const applications = await prisma.application.findMany({
    where: { stage: { not: "REJECTED" } },
    include: {
      candidate: true,
      jobOrder: { include: { client: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const byStage = Object.fromEntries(
    STAGES.map((s) => [s.key, applications.filter((a) => a.stage === s.key)])
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1">Pipeline</h1>
      <p className="text-zinc-500 text-sm mb-8">{applications.length} active applications</p>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const cards = byStage[stage.key] ?? [];
          return (
            <div key={stage.key} className="flex-shrink-0 w-64">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-zinc-700">{stage.label}</h2>
                <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">
                  {cards.length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {cards.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-xl border border-zinc-100 p-4 shadow-sm"
                  >
                    <p className="font-medium text-sm">
                      {app.candidate.firstName} {app.candidate.lastName}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">{app.jobOrder.title}</p>
                    <p className="text-xs text-zinc-400">{app.jobOrder.client.name}</p>
                    {app.notes && (
                      <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{app.notes}</p>
                    )}
                  </div>
                ))}
                {cards.length === 0 && (
                  <div className="border-2 border-dashed border-zinc-100 rounded-xl p-4 text-center text-xs text-zinc-300">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
