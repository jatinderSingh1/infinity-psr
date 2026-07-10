import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fmtMoney, fmtDateTime, round2 } from "@/lib/format";
import { PaymentBadge, FulfillmentBadge, card, sectionTitle } from "@/components/crm/ui";
import { OrderActions } from "@/components/crm/OrderActions";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      contact: {
        select: { id: true, firstName: true, lastName: true, company: true, email: true, phone: true, city: true, country: true },
      },
    },
  });

  if (!order) notFound();

  const productIds = order.items.map((i) => i.productId).filter(Boolean) as string[];
  const withImages = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds }, image: { not: null } },
        select: { id: true },
      })
    : [];
  const imageIds = new Set(withImages.map((p) => p.id));

  const balance = round2(order.total - order.amountPaid);
  const c = order.contact;

  return (
    <div className="p-5 max-w-[1050px] mx-auto">
      <div className="flex items-center gap-2 text-[13px] text-[#8a8a8a] mb-3">
        <Link href="/crm/orders" className="hover:text-[#1a1a1a]">← Orders</Link>
      </div>

      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-[#1a1a1a]">Order #{order.number}</h1>
            <PaymentBadge status={order.paymentStatus} />
            <FulfillmentBadge status={order.status} />
          </div>
          <p className="text-[13px] text-[#616161] mt-0.5">{fmtDateTime(order.createdAt)}</p>
        </div>
        <OrderActions
          id={order.id}
          status={order.status}
          paymentStatus={order.paymentStatus}
          total={order.total}
          amountPaid={order.amountPaid}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          <div className={`${card} overflow-hidden`}>
            <div className="px-4 py-3 border-b border-[#ebebeb]">
              <h2 className={sectionTitle}>Items ({order.items.length})</h2>
            </div>
            <div className="divide-y divide-[#f1f1f1]">
              {order.items.map((it) => (
                <div key={it.id} className="px-4 py-3 flex items-center gap-3">
                  {it.productId && imageIds.has(it.productId) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/products/${it.productId}/image`}
                      alt=""
                      loading="lazy"
                      className="w-9 h-9 rounded-lg object-cover border border-[#e3e3e3] flex-shrink-0"
                    />
                  ) : (
                    <span className="w-9 h-9 rounded-lg bg-[#f1f1f1] border border-[#e3e3e3] flex items-center justify-center text-base flex-shrink-0">
                      📦
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1a1a1a]">{it.title}</p>
                    <p className="text-xs text-[#8a8a8a]">
                      {fmtMoney(it.price, order.currency)} × {it.quantity}
                    </p>
                  </div>
                  <p className="text-[13px] font-medium text-[#1a1a1a]">{fmtMoney(it.total, order.currency)}</p>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="border-t border-[#ebebeb] bg-[#fafafa] px-4 py-3 space-y-1.5">
              <div className="flex justify-between text-[13px] text-[#303030]">
                <span>Subtotal</span>
                <span>{fmtMoney(order.subtotal, order.currency)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[13px] text-[#303030]">
                  <span>Discount</span>
                  <span>−{fmtMoney(order.discount, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-[13px] text-[#303030]">
                <span>Tax ({order.taxRate}%)</span>
                <span>{fmtMoney(order.tax, order.currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#1a1a1a] pt-1.5 border-t border-[#ebebeb]">
                <span>Total</span>
                <span>{fmtMoney(order.total, order.currency)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-[#303030]">
                <span>Paid</span>
                <span>{fmtMoney(order.amountPaid, order.currency)}</span>
              </div>
              {balance > 0 && order.status !== "CANCELLED" && (
                <div className="flex justify-between text-[13px] font-semibold text-[#8e1f0b]">
                  <span>Balance due</span>
                  <span>{fmtMoney(balance, order.currency)}</span>
                </div>
              )}
            </div>
          </div>

          {order.notes && (
            <div className={`${card} p-4`}>
              <h2 className={`${sectionTitle} mb-2`}>Notes</h2>
              <p className="text-[13px] text-[#303030] whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Customer */}
        <div className="space-y-4">
          <div className={`${card} p-4`}>
            <h2 className={`${sectionTitle} mb-3`}>Customer</h2>
            <Link href={`/crm/contacts/${c.id}`} className="text-[13px] font-semibold text-[#005bd3] hover:underline">
              {c.firstName} {c.lastName}
            </Link>
            {c.company && <p className="text-[13px] text-[#616161]">{c.company}</p>}
            {(c.city || c.country) && (
              <p className="text-xs text-[#8a8a8a] mt-0.5">
                {[c.city, c.country].filter(Boolean).join(", ")}
              </p>
            )}
            <div className="mt-3 space-y-1.5">
              {c.email && (
                <a href={`mailto:${c.email}`} className="block text-[13px] text-[#005bd3] hover:underline truncate">
                  ✉ {c.email}
                </a>
              )}
              {c.phone && (
                <div className="flex items-center gap-2">
                  <a href={`tel:${c.phone}`} className="text-[13px] text-[#005bd3] hover:underline">
                    📞 {c.phone}
                  </a>
                  <a
                    href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-[#affebf] text-[#014b40] px-1.5 py-0.5 rounded font-medium hover:opacity-80"
                  >
                    WA
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
