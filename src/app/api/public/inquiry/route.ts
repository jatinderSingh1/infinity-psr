import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { arrWrite } from "@/lib/utils";

// Public endpoint: website inquiry → creates a Lead contact + activity in the CRM
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { name, email, phone, message, website } = body as Record<string, string>;

  // Honeypot: bots fill every field — real users never see this one
  if (website) return NextResponse.json({ ok: true });

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }
  if (name.length > 120 || email.length > 200 || message.length > 3000) {
    return NextResponse.json({ error: "Message too long." }, { status: 400 });
  }

  const parts = name.trim().split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ") || null;

  // Reuse the contact if this email already exists
  const existing = await prisma.contact.findFirst({
    where: { email: email.trim() },
    select: { id: true },
  });

  const contactId =
    existing?.id ??
    (
      await prisma.contact.create({
        data: {
          firstName,
          lastName,
          email: email.trim(),
          phone: phone?.trim() || null,
          status: "LEAD",
          tags: arrWrite(["website-inquiry"]),
        },
        select: { id: true },
      })
    ).id;

  await prisma.activity.create({
    data: {
      contactId,
      type: "EMAIL",
      title: "Website inquiry",
      body: message.trim().slice(0, 3000),
    },
  });

  return NextResponse.json({ ok: true });
}
