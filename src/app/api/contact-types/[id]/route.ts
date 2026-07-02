import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, isActive } = body;

  const ct = await prisma.contactType.update({
    where: { id },
    data: { name, isActive },
  });

  return NextResponse.json(ct);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ct = await prisma.contactType.findUnique({ where: { id } });
  if (!ct) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ct.isSystem) {
    return NextResponse.json({ error: "System types cannot be deleted" }, { status: 403 });
  }

  await prisma.contactType.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
