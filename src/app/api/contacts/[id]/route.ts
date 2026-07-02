import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { arrWrite } from "@/lib/utils";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      roles: {
        include: {
          industry: true,
          contactType: true,
        },
      },
      activities: { orderBy: { createdAt: "desc" } },
      deals: {
        include: { industry: { select: { name: true, color: true, icon: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(contact);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const {
    firstName,
    lastName,
    email,
    phone,
    phone2,
    company,
    jobTitle,
    address,
    city,
    state,
    country,
    website,
    instagram,
    linkedIn,
    currency,
    notes,
    tags,
    status,
    roles,
  } = body;

  const contact = await prisma.contact.update({
    where: { id },
    data: {
      firstName,
      lastName,
      email,
      phone,
      phone2,
      company,
      jobTitle,
      address,
      city,
      state,
      country,
      website,
      instagram,
      linkedIn,
      currency,
      notes,
      tags: arrWrite(tags ?? []),
      status,
    },
  });

  // Replace roles
  if (roles !== undefined) {
    await prisma.contactRole.deleteMany({ where: { contactId: id } });
    if (roles.length > 0) {
      await prisma.contactRole.createMany({
        data: roles.map((r: { industryId: string; contactTypeId: string; notes?: string }) => ({
          contactId: id,
          industryId: r.industryId,
          contactTypeId: r.contactTypeId,
          notes: r.notes,
        })),
        skipDuplicates: true,
      });
    }
  }

  return NextResponse.json(contact);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.contact.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
