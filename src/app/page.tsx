import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getStoreSettings } from "@/lib/store";
import { fmtMoney } from "@/lib/format";
import { StoreHeader, StoreFooter } from "@/components/store/StoreShell";

export const dynamic = "force-dynamic";

export default async function StorefrontPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const category = sp.category ?? "";

  const [settings, products, categoriesRaw, withImages] = await Promise.all([
    getStoreSettings(),
    prisma.product.findMany({
      where: {
        isActive: true,
        isPublic: true,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { category: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        currency: true,
        showPrice: true,
        stock: true,
      },
    }),
    prisma.product.findMany({
      where: { isActive: true, isPublic: true, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    }),
    prisma.product.findMany({
      where: { isActive: true, isPublic: true, image: { not: null } },
      select: { id: true },
    }),
  ]);

  const imageIds = new Set(withImages.map((p) => p.id));
  const categories = categoriesRaw.map((c) => c.category!).sort();

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] flex flex-col">
      <StoreHeader storeName={settings.storeName} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4">
        {/* Hero */}
        <section className="text-center pt-12 pb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{settings.storeName}</h1>
          {settings.tagline && <p className="text-[#616161] max-w-xl mx-auto">{settings.tagline}</p>}
        </section>

        {/* Search + categories */}
        <section className="mb-8">
          <form method="GET" className="max-w-lg mx-auto mb-4 flex gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search products…"
              className="flex-1 border border-[#d4d4d4] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30 focus:border-[#005bd3]"
            />
            {category && <input type="hidden" name="category" value={category} />}
            <button type="submit" className="bg-[#1a1a1a] text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-[#303030] transition-colors cursor-pointer">
              Search
            </button>
          </form>
          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-center">
              <Link
                href={q ? `/?q=${encodeURIComponent(q)}` : "/"}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${
                  !category
                    ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                    : "bg-white text-[#303030] border-[#d4d4d4] hover:border-[#8a8a8a]"
                }`}
              >
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c}
                  href={`/?category=${encodeURIComponent(c)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${
                    category === c
                      ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                      : "bg-white text-[#303030] border-[#d4d4d4] hover:border-[#8a8a8a]"
                  }`}
                >
                  {c}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Product grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🛍️</p>
            <p className="font-semibold mb-1">
              {q || category ? "No products match your search" : "Our catalog is coming soon"}
            </p>
            <p className="text-sm text-[#616161] mb-4">
              {q || category ? (
                <Link href="/" className="text-[#005bd3] hover:underline">Clear search</Link>
              ) : (
                "In the meantime, reach out — we probably have what you need."
              )}
            </p>
            <Link
              href="/contact"
              className="inline-block bg-[#1a1a1a] text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-[#303030] transition-colors"
            >
              Get in touch
            </Link>
          </div>
        ) : (
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/p/${p.id}`}
                className="group border border-[#ebebeb] rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#d4d4d4] transition-all bg-white"
              >
                <div className="aspect-square bg-[#f7f7f7] flex items-center justify-center overflow-hidden">
                  {imageIds.has(p.id) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/public/product-image/${p.id}`}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-4xl opacity-40">🛍️</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-[#1a1a1a] leading-snug line-clamp-2">{p.name}</p>
                  <p className="text-sm mt-1">
                    {p.showPrice ? (
                      <span className="font-semibold">{fmtMoney(p.price, p.currency)}</span>
                    ) : (
                      <span className="text-[#616161]">Contact for price</span>
                    )}
                  </p>
                  {p.stock <= 0 && (
                    <p className="text-xs text-[#8e1f0b] mt-0.5">Out of stock</p>
                  )}
                </div>
              </Link>
            ))}
          </section>
        )}

        {/* About */}
        {settings.about && (
          <section className="border-t border-[#ebebeb] py-10 text-center">
            <h2 className="font-bold text-lg mb-2">About us</h2>
            <p className="text-sm text-[#616161] max-w-2xl mx-auto whitespace-pre-wrap">{settings.about}</p>
          </section>
        )}
      </main>

      <StoreFooter storeName={settings.storeName} email={settings.email} />
    </div>
  );
}
