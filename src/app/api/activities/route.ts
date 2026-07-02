import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get("contactId") ?? "";

  const activities = await prisma.activity.findMany({
    where: contactId ? { contactId } : {},
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return NextResponse.json(activities);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { contactId, type, title, body: actBody } = body;

  if (!contactId || !title) {
    return NextResponse.json({ error: "contactId and title are required" }, { status: 400 });
  }

  const activity = await prisma.activity.create({
    data: {
      contactId,
      type: type ?? "NOTE",
      title,
      body: actBody,
    },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return NextResponse.json(activity, { status: 201 });
}
