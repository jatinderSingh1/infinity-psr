import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clients = await prisma.client.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, industry, contactName, email, phone, website, notes, status } = body;

  if (!name || !industry || !contactName || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: { name, industry, contactName, email, phone, website, notes, status },
  });

  return NextResponse.json(client, { status: 201 });
}
