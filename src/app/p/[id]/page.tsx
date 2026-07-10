import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getStoreSettings, waLink } from "@/lib/store";
import { fmtMoney } from "@/lib/format";
import { StoreHeader, StoreFooter } from "@/components/store/StoreShell";

export const dynamic = "force-dynamic";

export default async function PublicProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [settings, product] = await Promise.all([
    getStoreSettings(),
    prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        currency: true,
        showPrice: true,
        stock: true,
        unit: true,
        image: true,
        isPublic: true,
        isActive: true,
      },
    }),
  ]);

  if (!product || !product.isPublic || !product.isActive) notFound();

  const hasImage = !!product.image;
  const inStock = product.stock > 0;
  const waText = `Hi! I'm interested in "${product.name}"${product.showPrice ? ` (${fmtMoney(product.price, product.currency)})` : ""}. Is it available?`;

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] flex flex-col">
      <StoreHeader storeName={settings.storeName} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <div className="mb-4 text-sm">
          <Link href="/" className="text-[#616161] hover:text-[#1a1a1a]">← Back to shop</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-square bg-[#f7f7f7] rounded-2xl border border-[#ebebeb] flex items-center justify-center overflow-hidden">
            {hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/public/product-image/${product.id}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-6xl opacity-40">🛍️</span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {product.category && (
              <Link
                href={`/?category=${encodeURIComponent(product.category)}`}
                className="text-xs font-medium text-[#005bd3] hover:underline uppercase tracking-wider mb-2"
              >
                {product.category}
              </Link>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">{product.name}</h1>

            <p className="text-xl mb-2">
              {product.showPrice ? (
                <span className="font-bold">{fmtMoney(product.price, product.currency)}</span>
              ) : (
                <span className="text-[#616161]">Contact us for pricing</span>
              )}
            </p>

            <p className={`text-sm mb-5 ${inStock ? "text-[#014b40]" : "text-[#8e1f0b]"}`}>
              {inStock ? "● In stock" : "● Currently out of stock — contact us for availability"}
            </p>

            {product.description && (
              <p className="text-sm text-[#303030] leading-relaxed whitespace-pre-wrap mb-6">
                {product.description}
              </p>
            )}

            <div className="flex flex-col gap-2.5 mt-auto max-w-sm">
              {settings.whatsapp ? (
                <a
                  href={waLink(settings.whatsapp, waText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-xl px-5 py-3 text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  💬 Order on WhatsApp
                </a>
              ) : null}
              <Link
                href={`/contact?product=${encodeURIComponent(product.name)}`}
                className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${
                  settings.whatsapp
                    ? "bg-white border border-[#d4d4d4] text-[#1a1a1a] hover:bg-[#f7f7f7]"
                    : "bg-[#1a1a1a] text-white hover:bg-[#303030]"
                }`}
              >
                ✉️ Send an inquiry
              </Link>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter storeName={settings.storeName} email={settings.email} />
    </div>
  );
}
