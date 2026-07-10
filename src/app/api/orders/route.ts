import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { round2 } from "@/lib/format";
import { searchMode } from "@/lib/utils";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const payment = searchParams.get("payment") ?? "";
  const status = searchParams.get("status") ?? "";
  const searchNum = parseInt(search, 10);

  const orders = await prisma.order.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                ...(Number.isFinite(searchNum) ? [{ number: searchNum }] : []),
                { contact: { firstName: { contains: search, ...searchMode() } } },
                { contact: { lastName: { contains: search, ...searchMode() } } },
              ],
            }
          : {},
        payment ? { paymentStatus: payment } : {},
        status ? { status } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true, company: true } },
      _count: { select: { items: true } },
    },
  });

  return NextResponse.json(orders);
}

interface LineInput {
  productId?: string | null;
  title: string;
  quantity: number;
  price: number;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { contactId, items, discount, taxRate, notes, markPaid } = body as {
    contactId: string;
    items: LineInput[];
    discount?: number;
    taxRate?: number;
    notes?: string;
    markPaid?: boolean;
  };

  if (!contactId) return NextResponse.json({ error: "Customer is required" }, { status: 400 });
  if (!items?.length) return NextResponse.json({ error: "At least one item is required" }, { status: 400 });

  const cleanItems = items
    .map((it) => ({
      productId: it.productId || null,
      title: (it.title ?? "").trim(),
      quantity: Number(it.quantity) || 0,
      price: Number(it.price) || 0,
    }))
    .filter((it) => it.title && it.quantity > 0);

  if (!cleanItems.length) {
    return NextResponse.json({ error: "Items need a title and a quantity above zero" }, { status: 400 });
  }

  const subtotal = round2(cleanItems.reduce((s, it) => s + it.quantity * it.price, 0));
  const disc = Math.min(round2(Number(discount) || 0), subtotal);
  const rate = Number(taxRate) || 0;
  const tax = round2((subtotal - disc) * (rate / 100));
  const total = round2(subtotal - disc + tax);
  const amountPaid = markPaid ? total : 0;
  const paymentStatus = markPaid ? "PAID" : "UNPAID";

  // Retry on order-number collision (no interactive transaction — pooler-safe)
  let order = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const max = await prisma.order.aggregate({ _max: { number: true } });
    const number = (max._max.number ?? 1000) + 1;
    try {
      order = await prisma.order.create({
        data: {
          number,
          contactId,
          subtotal,
          discount: disc,
          taxRate: rate,
          tax,
          total,
          amountPaid,
          paymentStatus,
          notes: notes || null,
          items: {
            create: cleanItems.map((it) => ({
              productId: it.productId,
              title: it.title,
              quantity: it.quantity,
              price: it.price,
              total: round2(it.quantity * it.price),
            })),
          },
        },
        include: { contact: { select: { firstName: true, lastName: true } } },
      });
      break;
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (code === "P2002" && attempt < 2) continue;
      throw e;
    }
  }

  if (!order) return NextResponse.json({ error: "Could not create order" }, { status: 500 });

  // Decrement stock for product-backed lines
  for (const it of cleanItems) {
    if (it.productId) {
      await prisma.product
        .update({
          where: { id: it.productId },
          data: { stock: { decrement: Math.round(it.quantity) } },
        })
        .catch(() => {});
    }
  }

  // Log on the contact's timeline
  await prisma.activity
    .create({
      data: {
        contactId,
        type: "NOTE",
        title: `Order #${order.number} placed — $${total.toFixed(2)}`,
      },
    })
    .catch(() => {});

  return NextResponse.json(order, { status: 201 });
}
