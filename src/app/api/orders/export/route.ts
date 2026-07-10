import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function esc(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    orderBy: { number: "asc" },
    include: {
      contact: { select: { firstName: true, lastName: true, company: true } },
      _count: { select: { items: true } },
    },
  });

  const header = [
    "Order #", "Date", "Customer", "Company", "Status", "Payment Status",
    "Items", "Subtotal", "Discount", "Tax Rate %", "Tax", "Total", "Paid", "Balance", "Currency", "Notes",
  ];

  const rows = orders.map((o) =>
    [
      o.number,
      new Date(o.createdAt).toISOString().split("T")[0],
      `${o.contact.firstName} ${o.contact.lastName ?? ""}`.trim(),
      o.contact.company,
      o.status,
      o.paymentStatus,
      o._count.items,
      o.subtotal.toFixed(2),
      o.discount.toFixed(2),
      o.taxRate,
      o.tax.toFixed(2),
      o.total.toFixed(2),
      o.amountPaid.toFixed(2),
      (o.total - o.amountPaid).toFixed(2),
      o.currency,
      o.notes,
    ].map(esc).join(",")
  );

  const csv = [header.map(esc).join(","), ...rows].join("\r\n");
  const date = new Date().toISOString().split("T")[0];

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${date}.csv"`,
    },
  });
}
