import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const industrySlug = searchParams.get("industry") ?? "";

  const deals = await prisma.deal.findMany({
    where: industrySlug ? { industry: { slug: industrySlug } } : {},
    orderBy: { createdAt: "desc" },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true, company: true } },
      industry: { select: { id: true, name: true, slug: true, color: true, icon: true } },
    },
  });

  return NextResponse.json(deals);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, contactId, industryId, value, currency, stage, priority, notes, closingDate } = body;

  if (!title || !contactId || !industryId) {
    return NextResponse.json({ error: "title, contactId, industryId are required" }, { status: 400 });
  }

  const deal = await prisma.deal.create({
    data: {
      title,
      contactId,
      industryId,
      value: value ? parseFloat(value) : undefined,
      currency: currency ?? "CAD",
      stage: stage ?? "LEAD",
      priority: priority ?? "MEDIUM",
      notes,
      closingDate: closingDate ? new Date(closingDate) : undefined,
    },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
      industry: { select: { id: true, name: true, color: true, icon: true } },
    },
  });

  return NextResponse.json(deal, { status: 201 });
}
