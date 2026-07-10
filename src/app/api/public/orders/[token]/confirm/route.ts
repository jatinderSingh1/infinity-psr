import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public: customer confirms their order via the shared invoice link
export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token || token.length < 16) {
    return NextResponse.json({ error: "Invalid link" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { publicToken: token },
    select: { id: true, number: true, status: true, confirmedAt: true, contactId: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status === "CANCELLED") {
    return NextResponse.json({ error: "This order was cancelled" }, { status: 400 });
  }
  if (order.confirmedAt) return NextResponse.json({ ok: true });

  await prisma.order.update({
    where: { id: order.id },
    data: { confirmedAt: new Date() },
  });

  await prisma.activity
    .create({
      data: {
        contactId: order.contactId,
        type: "NOTE",
        title: `Customer confirmed order #${order.number} ✓`,
      },
    })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
