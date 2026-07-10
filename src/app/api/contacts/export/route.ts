import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { asArr } from "@/lib/utils";

function esc(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      roles: { include: { industry: { select: { name: true } }, contactType: { select: { name: true } } } },
    },
  });

  const header = [
    "First Name", "Last Name", "Email", "Phone", "Phone 2", "Company", "Job Title",
    "Address", "City", "State", "Country", "Website", "Instagram", "LinkedIn",
    "Status", "Tags", "Roles", "Notes", "Created",
  ];

  const rows = contacts.map((c) =>
    [
      c.firstName, c.lastName, c.email, c.phone, c.phone2, c.company, c.jobTitle,
      c.address, c.city, c.state, c.country, c.website, c.instagram, c.linkedIn,
      c.status,
      asArr(c.tags).join("|"),
      c.roles.map((r) => `${r.industry.name}: ${r.contactType.name}`).join("|"),
      c.notes,
      new Date(c.createdAt).toISOString().split("T")[0],
    ].map(esc).join(",")
  );

  const csv = [header.map(esc).join(","), ...rows].join("\r\n");
  const date = new Date().toISOString().split("T")[0];

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contacts-${date}.csv"`,
    },
  });
}
