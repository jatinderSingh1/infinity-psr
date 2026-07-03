import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchMode } from "@/lib/utils";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) return NextResponse.json({ contacts: [], deals: [] });

  const [contacts, deals] = await Promise.all([
    prisma.contact.findMany({
      where: {
        OR: [
          { firstName: { contains: q, ...searchMode() } },
          { lastName: { contains: q, ...searchMode() } },
          { email: { contains: q, ...searchMode() } },
          { company: { contains: q, ...searchMode() } },
          { phone: { contains: q, ...searchMode() } },
        ],
      },
      take: 10,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        company: true,
        phone: true,
        status: true,
      },
    }),
    prisma.deal.findMany({
      where: { title: { contains: q, ...searchMode() } },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        industry: { select: { name: true, color: true, icon: true } },
      },
    }),
  ]);

  return NextResponse.json({ contacts, deals });
}
