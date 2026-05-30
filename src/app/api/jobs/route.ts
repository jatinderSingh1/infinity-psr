import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, clientId, description, requirements, salary, location, status } = body;

  if (!title || !clientId) {
    return NextResponse.json({ error: "Title and client are required." }, { status: 400 });
  }

  const job = await prisma.jobOrder.create({
    data: { title, clientId, description, requirements: requirements ?? [], salary, location, status },
  });

  return NextResponse.json(job, { status: 201 });
}
