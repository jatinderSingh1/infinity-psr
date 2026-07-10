import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { round2 } from "@/lib/format";
import { randomBytes } from "crypto";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      contact: { select: { id: true, firstName: true, lastName: true, company: true, email: true, phone: true } },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { action, amount } = body as { action: string; amount?: number };

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "payment") {
    const pay = round2(Number(amount) || 0);
    if (pay <= 0) return NextResponse.json({ error: "Amount must be above zero" }, { status: 400 });
    const newPaid = round2(Math.min(order.amountPaid + pay, order.total));
    const paymentStatus = newPaid >= order.total ? "PAID" : newPaid > 0 ? "PARTIAL" : "UNPAID";
    const updated = await prisma.order.update({
      where: { id },
      data: { amountPaid: newPaid, paymentStatus },
    });
    return NextResponse.json(updated);
  }

  if (action === "fulfill") {
    if (order.status !== "OPEN") {
      return NextResponse.json({ error: "Only open orders can be fulfilled" }, { status: 400 });
    }
    const updated = await prisma.order.update({ where: { id }, data: { status: "FULFILLED" } });
    return NextResponse.json(updated);
  }

  if (action === "cancel") {
    if (order.status === "CANCELLED") {
      return NextResponse.json({ error: "Order is already cancelled" }, { status: 400 });
    }
    // Restock product-backed lines
    for (const it of order.items) {
      if (it.productId) {
        await prisma.product
          .update({
            where: { id: it.productId },
            data: { stock: { increment: Math.round(it.quantity) } },
          })
          .catch(() => {});
      }
    }
    const updated = await prisma.order.update({ where: { id }, data: { status: "CANCELLED" } });
    return NextResponse.json(updated);
  }

  if (action === "share") {
    if (order.publicToken) return NextResponse.json({ token: order.publicToken });
    const token = randomBytes(24).toString("base64url");
    await prisma.order.update({ where: { id }, data: { publicToken: token } });
    return NextResponse.json({ token });
  }

  if (action === "notes") {
    const updated = await prisma.order.update({
      where: { id },
      data: { notes: (body.notes as string) || null },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.status !== "CANCELLED") {
    return NextResponse.json({ error: "Cancel the order before deleting it" }, { status: 400 });
  }
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
