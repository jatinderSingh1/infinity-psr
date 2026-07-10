import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchMode } from "@/lib/utils";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const status = searchParams.get("status") ?? "";

  const products = await prisma.product.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, ...searchMode() } },
                { sku: { contains: search, ...searchMode() } },
                { category: { contains: search, ...searchMode() } },
              ],
            }
          : {},
        category ? { category } : {},
        status === "active" ? { isActive: true } : status === "draft" ? { isActive: false } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { industry: { select: { name: true, icon: true, color: true } } },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, sku, description, category, price, cost, stock, lowStockAt, unit, industryId, isActive } = body;

  if (!name) return NextResponse.json({ error: "Product name is required" }, { status: 400 });

  const product = await prisma.product.create({
    data: {
      name,
      sku: sku || null,
      description: description || null,
      category: category || null,
      price: Number(price) || 0,
      cost: cost !== undefined && cost !== "" && cost !== null ? Number(cost) : null,
      stock: Number(stock) || 0,
      lowStockAt: Number(lowStockAt) || 5,
      unit: unit || "pcs",
      industryId: industryId || null,
      isActive: isActive ?? true,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
