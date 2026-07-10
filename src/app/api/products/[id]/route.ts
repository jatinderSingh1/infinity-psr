import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { industry: { select: { name: true, icon: true } } },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, sku, description, category, price, cost, stock, lowStockAt, unit, industryId, isActive } = body;

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(sku !== undefined ? { sku: sku || null } : {}),
      ...(description !== undefined ? { description: description || null } : {}),
      ...(category !== undefined ? { category: category || null } : {}),
      ...(price !== undefined ? { price: Number(price) || 0 } : {}),
      ...(cost !== undefined ? { cost: cost === "" || cost === null ? null : Number(cost) } : {}),
      ...(stock !== undefined ? { stock: Number(stock) || 0 } : {}),
      ...(lowStockAt !== undefined ? { lowStockAt: Number(lowStockAt) || 0 } : {}),
      ...(unit !== undefined ? { unit: unit || "pcs" } : {}),
      ...(industryId !== undefined ? { industryId: industryId || null } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
