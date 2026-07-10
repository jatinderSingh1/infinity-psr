import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getStoreSettings } from "@/lib/store";
import { fmtMoney, fmtDate, round2 } from "@/lib/format";
import { ConfirmOrderButton } from "@/components/store/ConfirmOrderButton";

export const dynamic = "force-dynamic";

export default async function PublicInvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token || token.length < 16) notFound();

  const [settings, order] = await Promise.all([
    getStoreSettings(),
    prisma.order.findUnique({
      where: { publicToken: token },
      include: {
        items: true,
        contact: { select: { firstName: true, lastName: true, company: true } },
      },
    }),
  ]);

  if (!order) notFound();

  const balance = round2(order.total - order.amountPaid);
  const cancelled = order.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-[#f1f1f1] text-[#1a1a1a] py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* Branding */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="h-12 w-auto" />
          <span className="font-bold text-lg tracking-tight">{settings.storeName}</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#e3e3e3] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#ebebeb]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#8a8a8a] font-semibold mb-1">Invoice</p>
                <h1 className="text-xl font-bold">Order #{order.number}</h1>
                <p className="text-[13px] text-[#616161] mt-0.5">{fmtDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                {cancelled ? (
                  <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#fedad9] text-[#8e1f0b]">
                    Cancelled
                  </span>
                ) : order.paymentStatus === "PAID" ? (
                  <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#affebf] text-[#014b40]">
                    ✓ Paid
                  </span>
                ) : (
                  <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#ffeb78] text-[#4f4700]">
                    Balance due: {fmtMoney(balance, order.currency)}
                  </span>
                )}
              </div>
            </div>
            <p className="text-[13px] text-[#303030] mt-3">
              Billed to:{" "}
              <span className="font-medium">
                {order.contact.firstName} {order.contact.lastName}
              </span>
              {order.contact.company && <span className="text-[#616161]"> · {order.contact.company}</span>}
            </p>
          </div>

          {/* Items */}
          <div className="divide-y divide-[#f1f1f1]">
            {order.items.map((it) => (
              <div key={it.id} className="px-6 py-3.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{it.title}</p>
                  <p className="text-xs text-[#8a8a8a]">
                    {fmtMoney(it.price, order.currency)} × {it.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium">{fmtMoney(it.total, order.currency)}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="px-6 py-4 bg-[#fafafa] border-t border-[#ebebeb] space-y-1.5">
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
            <div className="flex justify-between text-base font-bold pt-2 border-t border-[#ebebeb]">
              <span>Total</span>
              <span>{fmtMoney(order.total, order.currency)}</span>
            </div>
            {order.amountPaid > 0 && !cancelled && (
              <>
                <div className="flex justify-between text-[13px] text-[#014b40]">
                  <span>Paid</span>
                  <span>{fmtMoney(order.amountPaid, order.currency)}</span>
                </div>
                {balance > 0 && (
                  <div className="flex justify-between text-[13px] font-semibold text-[#8e1f0b]">
                    <span>Balance due</span>
                    <span>{fmtMoney(balance, order.currency)}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Confirm */}
          {!cancelled && (
            <div className="px-6 py-5 border-t border-[#ebebeb] text-center">
              {order.confirmedAt ? (
                <p className="text-sm font-semibold text-[#014b40]">
                  ✓ Confirmed on {fmtDate(order.confirmedAt)} — thank you!
                </p>
              ) : (
                <ConfirmOrderButton token={token} />
              )}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-[#8a8a8a] mt-5">
          Questions about this order?{" "}
          <Link href="/contact" className="underline hover:text-[#1a1a1a]">Contact {settings.storeName}</Link>
        </p>
      </div>
    </div>
  );
}
