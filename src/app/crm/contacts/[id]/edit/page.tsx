import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/crm/ContactForm";
import Link from "next/link";
import { asArr } from "@/lib/utils";

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [contact, industries] = await Promise.all([
    prisma.contact.findUnique({
      where: { id },
      include: {
        roles: { select: { industryId: true, contactTypeId: true, notes: true } },
      },
    }),
    prisma.industry.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: { contactTypes: { where: { isActive: true }, orderBy: { order: "asc" } } },
    }),
  ]);

  if (!contact) notFound();

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
        <Link href="/crm/contacts" className="hover:text-zinc-700">Contacts</Link>
        <span>/</span>
        <Link href={`/crm/contacts/${id}`} className="hover:text-zinc-700">{contact.firstName} {contact.lastName}</Link>
        <span>/</span>
        <span className="text-zinc-700">Edit</span>
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Edit Contact</h1>
      </div>
      <ContactForm industries={industries} initialData={{ ...contact, tags: asArr(contact.tags) }} />
    </div>
  );
}
