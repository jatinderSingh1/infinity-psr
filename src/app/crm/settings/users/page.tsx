import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function UsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const roleColors: Record<string, string> = {
    ADMIN: "#4f46e5",
    RECRUITER: "#059669",
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Users</h1>
        <p className="text-zinc-500 text-sm mt-0.5">{users.length} team member{users.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm divide-y divide-zinc-50">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-4 px-5 py-4">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: roleColors[u.role] ?? "#6b7280" }}
            >
              {u.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-zinc-900">{u.name}</p>
                {u.email === session?.user?.email && (
                  <span className="text-xs bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded">You</span>
                )}
              </div>
              <p className="text-sm text-zinc-400">{u.email}</p>
            </div>
            <span
              className="text-xs px-2.5 py-1 rounded-full text-white font-medium"
              style={{ backgroundColor: roleColors[u.role] ?? "#6b7280" }}
            >
              {u.role}
            </span>
            <p className="text-xs text-zinc-400">
              {new Date(u.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-sm text-zinc-500">
        <p className="font-medium text-zinc-700 mb-1">To add new users:</p>
        <p>Run <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs">npm run db:seed</code> to create admin, or use Prisma Studio (<code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs">npm run db:studio</code>) to add users directly.</p>
      </div>
    </div>
  );
}
