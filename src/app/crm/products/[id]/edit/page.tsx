import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductForm } from "@/components/crm/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, industries] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.industry.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true, icon: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <div className="p-5 max-w-[950px] mx-auto">
      <div className="flex items-center gap-2 text-[13px] text-[#8a8a8a] mb-3">
        <Link href="/crm/products" className="hover:text-[#1a1a1a]">← Products</Link>
      </div>
      <h1 className="text-xl font-bold text-[#1a1a1a] mb-4">{product.name}</h1>
      <ProductForm industries={industries} initialData={product} />
    </div>
  );
}
