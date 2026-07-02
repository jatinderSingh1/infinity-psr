import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, value, currency, stage, priority, notes, closingDate } = body;

  const deal = await prisma.deal.update({
    where: { id },
    data: {
      title,
      value: value !== undefined ? parseFloat(value) : undefined,
      currency,
      stage,
      priority,
      notes,
      closingDate: closingDate ? new Date(closingDate) : null,
    },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
      industry: { select: { id: true, name: true, color: true, icon: true } },
    },
  });

  return NextResponse.json(deal);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.deal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
