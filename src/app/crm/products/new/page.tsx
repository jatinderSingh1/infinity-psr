import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ProductForm } from "@/components/crm/ProductForm";

export default async function NewProductPage() {
  const industries = await prisma.industry.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { id: true, name: true, icon: true },
  });

  return (
    <div className="p-5 max-w-[950px] mx-auto">
      <div className="flex items-center gap-2 text-[13px] text-[#8a8a8a] mb-3">
        <Link href="/crm/products" className="hover:text-[#1a1a1a]">← Products</Link>
      </div>
      <h1 className="text-xl font-bold text-[#1a1a1a] mb-4">Add product</h1>
      <ProductForm industries={industries} />
    </div>
  );
}
