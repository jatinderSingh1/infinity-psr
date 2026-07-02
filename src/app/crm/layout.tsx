import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/crm/Sidebar";

export default async function CRMLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const industries = await prisma.industry.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      contactTypes: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return (
    <div className="min-h-screen flex bg-zinc-100">
      <Sidebar
        industries={industries}
        userName={session.user?.name ?? "User"}
        userEmail={session.user?.email ?? ""}
      />
      <main className="flex-1 overflow-auto bg-zinc-50">{children}</main>
    </div>
  );
}
