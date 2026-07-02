import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, icon, color, description, isActive, order } = body;

  const industry = await prisma.industry.update({
    where: { id },
    data: { name, icon, color, description, isActive, order },
  });

  return NextResponse.json(industry);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const industry = await prisma.industry.findUnique({ where: { id } });
  if (!industry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (industry.isSystem) {
    return NextResponse.json({ error: "System industries cannot be deleted" }, { status: 403 });
  }

  await prisma.industry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
