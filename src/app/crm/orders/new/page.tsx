import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { OrderForm } from "@/components/crm/OrderForm";

export default async function NewOrderPage() {
  const [contacts, products] = await Promise.all([
    prisma.contact.findMany({
      orderBy: { firstName: "asc" },
      take: 1000,
      select: { id: true, firstName: true, lastName: true, company: true },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      take: 1000,
      select: { id: true, name: true, sku: true, price: true, stock: true, unit: true },
    }),
  ]);

  return (
    <div className="p-5 max-w-[1050px] mx-auto">
      <div className="flex items-center gap-2 text-[13px] text-[#8a8a8a] mb-3">
        <Link href="/crm/orders" className="hover:text-[#1a1a1a]">← Orders</Link>
      </div>
      <h1 className="text-xl font-bold text-[#1a1a1a] mb-4">Create order</h1>
      <OrderForm contacts={contacts} products={products} />
    </div>
  );
}
