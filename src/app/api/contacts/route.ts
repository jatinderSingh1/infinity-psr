import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { arrWrite, searchMode } from "@/lib/utils";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const industrySlug = searchParams.get("industry") ?? "";
  const typeSlug = searchParams.get("type") ?? "";
  const status = searchParams.get("status") ?? "";

  const contacts = await prisma.contact.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { firstName: { contains: search, ...searchMode() } },
                { lastName: { contains: search, ...searchMode() } },
                { email: { contains: search, ...searchMode() } },
                { company: { contains: search, ...searchMode() } },
                { phone: { contains: search, ...searchMode() } },
              ],
            }
          : {},
        industrySlug
          ? { roles: { some: { industry: { slug: industrySlug } } } }
          : {},
        typeSlug
          ? { roles: { some: { contactType: { slug: typeSlug } } } }
          : {},
        status ? { status: status as "ACTIVE" | "INACTIVE" | "LEAD" | "PROSPECT" } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      roles: {
        include: {
          industry: { select: { id: true, name: true, slug: true, color: true, icon: true } },
          contactType: { select: { id: true, name: true, slug: true } },
        },
      },
      _count: { select: { activities: true, deals: true } },
    },
  });

  return NextResponse.json(contacts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    followUpDate,
    followUpNote,
    tags,
    status,
    roles,
  } = body;

  if (!firstName) return NextResponse.json({ error: "First name is required" }, { status: 400 });

  const contact = await prisma.contact.create({
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
      currency: currency ?? "INR",
      notes,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      followUpNote: followUpNote ?? null,
      tags: arrWrite(tags ?? []),
      status: status ?? "ACTIVE",
      roles: roles?.length
        ? {
            create: roles.map((r: { industryId: string; contactTypeId: string; notes?: string }) => ({
              industryId: r.industryId,
              contactTypeId: r.contactTypeId,
              notes: r.notes,
            })),
          }
        : undefined,
    },
    include: {
      roles: { include: { industry: true, contactType: true } },
    },
  });

  return NextResponse.json(contact, { status: 201 });
}
