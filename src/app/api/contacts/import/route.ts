import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { arrWrite } from "@/lib/utils";

const VALID_STATUSES = ["ACTIVE", "INACTIVE", "LEAD", "PROSPECT"];

interface ImportRow {
  firstName?: string;
  name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phone2?: string;
  company?: string;
  jobTitle?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  status?: string;
  tags?: string;
  notes?: string;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = (await req.json()) as { rows: ImportRow[] };
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }
  if (rows.length > 100) {
    return NextResponse.json({ error: "Max 100 rows per request — send in chunks" }, { status: 400 });
  }

  // Skip rows whose email already exists
  const emails = rows.map((r) => r.email?.trim()).filter(Boolean) as string[];
  const existing = emails.length
    ? await prisma.contact.findMany({ where: { email: { in: emails } }, select: { email: true } })
    : [];
  const existingEmails = new Set(existing.map((e) => e.email));

  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    let firstName = row.firstName?.trim();
    let lastName = row.lastName?.trim();
    if (!firstName && row.name?.trim()) {
      const parts = row.name.trim().split(/\s+/);
      firstName = parts[0];
      lastName = lastName || parts.slice(1).join(" ") || undefined;
    }
    if (!firstName) {
      skipped++;
      continue;
    }
    const email = row.email?.trim() || null;
    if (email && existingEmails.has(email)) {
      skipped++;
      continue;
    }

    const status = VALID_STATUSES.includes((row.status ?? "").toUpperCase())
      ? (row.status!.toUpperCase() as "ACTIVE" | "INACTIVE" | "LEAD" | "PROSPECT")
      : "ACTIVE";

    const tags = (row.tags ?? "")
      .split(/[|;,]/)
      .map((t) => t.trim())
      .filter(Boolean);

    await prisma.contact.create({
      data: {
        firstName,
        lastName: lastName || null,
        email,
        phone: row.phone?.trim() || null,
        phone2: row.phone2?.trim() || null,
        company: row.company?.trim() || null,
        jobTitle: row.jobTitle?.trim() || null,
        address: row.address?.trim() || null,
        city: row.city?.trim() || null,
        state: row.state?.trim() || null,
        country: row.country?.trim() || null,
        website: row.website?.trim() || null,
        status,
        tags: arrWrite(tags),
      },
    });
    if (email) existingEmails.add(email);
    created++;
  }

  return NextResponse.json({ created, skipped });
}
