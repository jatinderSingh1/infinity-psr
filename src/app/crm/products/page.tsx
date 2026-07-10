import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { fmtMoney } from "@/lib/format";
import { Badge, PageHeader, EmptyState, card, btnPrimary, btnSecondary, inputCls, thCls, tdCls } from "@/components/crm/ui";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const search = sp.search ?? "";
  const category = sp.category ?? "";
  const status = sp.status ?? "";

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { sku: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          category ? { category } : {},
          status === "active" ? { isActive: true } : status === "draft" ? { isActive: false } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { industry: { select: { name: true, icon: true } } },
    }),
    prisma.product.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    }),
  ]);

  return (
    <div className="p-5 max-w-[1050px] mx-auto">
      <PageHeader
        title="Products"
        subtitle={`${products.length} product${products.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/crm/products/new" className={btnPrimary}>
            Add product
          </Link>
        }
      />

      {/* Filters */}
      <form method="GET" className="flex gap-2 mb-4 flex-wrap">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search products, SKU…"
          className={`${inputCls} flex-1 min-w-44 max-w-xs`}
        />
        <select name="category" defaultValue={category} className={`${inputCls} w-auto`}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.category} value={c.category!}>{c.category}</option>
          ))}
        </select>
        <select name="status" defaultValue={status} className={`${inputCls} w-auto`}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
        <button type="submit" className={btnSecondary}>Filter</button>
        {(search || category || status) && (
          <Link href="/crm/products" className={`${btnSecondary} border-transparent shadow-none`}>Clear</Link>
        )}
      </form>

      <div className={`${card} overflow-hidden`}>
        {products.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Add your products"
            text="Track inventory, prices, and costs. Products can be added to orders with one click."
            action={<Link href="/crm/products/new" className={btnPrimary}>Add product</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="border-b border-[#ebebeb] bg-[#fafafa]">
                <tr>
                  <th className={thCls}>Product</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}>Inventory</th>
                  <th className={thCls}>Category</th>
                  <th className={thCls}>Industry</th>
                  <th className={`${thCls} text-right`}>Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f1f1]">
                {products.map((p) => {
                  const low = p.stock <= p.lowStockAt;
                  const out = p.stock <= 0;
                  return (
                    <tr key={p.id} className="hover:bg-[#fafafa] transition-colors">
                      <td className={tdCls}>
                        <Link href={`/crm/products/${p.id}/edit`} className="font-medium text-[#1a1a1a] hover:underline">
                          {p.name}
                        </Link>
                        {p.sku && <p className="text-xs text-[#8a8a8a]">{p.sku}</p>}
                      </td>
                      <td className={tdCls}>
                        {p.isActive ? <Badge tone="success">Active</Badge> : <Badge>Draft</Badge>}
                      </td>
                      <td className={tdCls}>
                        <span className={out ? "text-[#8e1f0b] font-medium" : low ? "text-[#8a6116] font-medium" : ""}>
                          {p.stock} {p.unit} in stock
                        </span>
                        {out ? (
                          <span className="ml-1.5"><Badge tone="critical">Out</Badge></span>
                        ) : low ? (
                          <span className="ml-1.5"><Badge tone="warning">Low</Badge></span>
                        ) : null}
                      </td>
                      <td className={`${tdCls} text-[#616161]`}>{p.category ?? "—"}</td>
                      <td className={`${tdCls} text-[#616161]`}>
                        {p.industry ? `${p.industry.icon ?? ""} ${p.industry.name}` : "—"}
                      </td>
                      <td className={`${tdCls} text-right font-medium`}>{fmtMoney(p.price, p.currency)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
