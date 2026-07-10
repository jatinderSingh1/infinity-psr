import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await prisma.storeSetting.findUnique({ where: { id: "store" } });
  return NextResponse.json(
    row ?? { id: "store", storeName: "Infinity Aura", tagline: null, whatsapp: null, email: null, about: null }
  );
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { storeName, tagline, whatsapp, email, about } = body;

  if (!storeName?.trim()) {
    return NextResponse.json({ error: "Store name is required" }, { status: 400 });
  }

  const data = {
    storeName: storeName.trim(),
    tagline: tagline?.trim() || null,
    whatsapp: whatsapp?.trim() || null,
    email: email?.trim() || null,
    about: about?.trim() || null,
  };

  const row = await prisma.storeSetting.upsert({
    where: { id: "store" },
    create: { id: "store", ...data },
    update: data,
  });

  return NextResponse.json(row);
}
