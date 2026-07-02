import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, industryId } = body;

  if (!name || !industryId) {
    return NextResponse.json({ error: "Name and industryId are required" }, { status: 400 });
  }

  const slug = toSlug(name);
  const maxOrder = await prisma.contactType.aggregate({
    where: { industryId },
    _max: { order: true },
  });

  const ct = await prisma.contactType.create({
    data: {
      name,
      slug,
      industryId,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  return NextResponse.json(ct, { status: 201 });
}
