import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const industries = await prisma.industry.findMany({
    orderBy: { order: "asc" },
    include: {
      contactTypes: { orderBy: { order: "asc" } },
      _count: { select: { roles: true } },
    },
  });

  return NextResponse.json(industries);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, icon, color, description } = body;

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const slug = toSlug(name);
  const existing = await prisma.industry.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "An industry with this name already exists" }, { status: 409 });
  }

  const maxOrder = await prisma.industry.aggregate({ _max: { order: true } });
  const order = (maxOrder._max.order ?? 0) + 1;

  const industry = await prisma.industry.create({
    data: { name, slug, icon, color, description, order },
  });

  return NextResponse.json(industry, { status: 201 });
}
