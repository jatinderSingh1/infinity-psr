import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/crm/AdminShell";

export default async function CRMLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const industries = await prisma.industry.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      color: true,
      contactTypes: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return (
    <AdminShell
      industries={industries}
      userName={session.user?.name ?? "User"}
      userEmail={session.user?.email ?? ""}
    >
      {children}
    </AdminShell>
  );
}
