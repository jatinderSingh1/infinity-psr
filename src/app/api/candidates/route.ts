import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { firstName, lastName, email, phone, currentTitle, currentCompany, industry, skills, resumeUrl, linkedinUrl, notes } = body;

  if (!firstName || !lastName || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const candidate = await prisma.candidate.create({
    data: { firstName, lastName, email, phone, currentTitle, currentCompany, industry, skills: skills ?? [], resumeUrl, linkedinUrl, notes },
  });

  return NextResponse.json(candidate, { status: 201 });
}
