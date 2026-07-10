import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { fmtMoney, fmtDate } from "@/lib/format";
import { PaymentBadge, FulfillmentBadge, PageHeader, EmptyState, card, btnPrimary, btnSecondary, inputCls, thCls, tdCls } from "@/components/crm/ui";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; payment?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const search = sp.search ?? "";
  const payment = sp.payment ?? "";
  const status = sp.status ?? "";
  const searchNum = parseInt(search, 10);

  const orders = await prisma.order.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                ...(Number.isFinite(searchNum) ? [{ number: searchNum }] : []),
                { contact: { firstName: { contains: search, mode: "insensitive" } } },
                { contact: { lastName: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {},
        payment ? { paymentStatus: payment } : {},
        status ? { status } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      contact: { select: { firstName: true, lastName: true, company: true } },
      _count: { select: { items: true } },
    },
  });

  return (
    <div className="p-5 max-w-[1050px] mx-auto">
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} order${orders.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <a href="/api/orders/export" className={btnSecondary}>Export CSV</a>
            <Link href="/crm/orders/new" className={btnPrimary}>Create order</Link>
          </>
        }
      />

      <form method="GET" className="flex gap-2 mb-4 flex-wrap">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search order # or customer…"
          className={`${inputCls} flex-1 min-w-44 max-w-xs`}
        />
        <select name="payment" defaultValue={payment} className={`${inputCls} w-auto`}>
          <option value="">All payments</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PARTIAL">Partially paid</option>
          <option value="PAID">Paid</option>
        </select>
        <select name="status" defaultValue={status} className={`${inputCls} w-auto`}>
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="FULFILLED">Fulfilled</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button type="submit" className={btnSecondary}>Filter</button>
        {(search || payment || status) && (
          <Link href="/crm/orders" className={`${btnSecondary} border-transparent shadow-none`}>Clear</Link>
        )}
      </form>

      <div className={`${card} overflow-hidden`}>
        {orders.length === 0 ? (
          <EmptyState
            icon="🧾"
            title="Create your first order"
            text="Orders track what you sell — line items, taxes, payments, and fulfillment, all in one place."
            action={<Link href="/crm/orders/new" className={btnPrimary}>Create order</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-[#ebebeb] bg-[#fafafa]">
                <tr>
                  <th className={thCls}>Order</th>
                  <th className={thCls}>Date</th>
                  <th className={thCls}>Customer</th>
                  <th className={thCls}>Payment</th>
                  <th className={thCls}>Fulfillment</th>
                  <th className={thCls}>Items</th>
                  <th className={`${thCls} text-right`}>Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f1f1]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className={tdCls}>
                      <Link href={`/crm/orders/${o.id}`} className="font-semibold text-[#1a1a1a] hover:underline">
                        #{o.number}
                      </Link>
                    </td>
                    <td className={`${tdCls} text-[#616161]`}>{fmtDate(o.createdAt)}</td>
                    <td className={tdCls}>
                      {o.contact.firstName} {o.contact.lastName}
                      {o.contact.company && <p className="text-xs text-[#8a8a8a]">{o.contact.company}</p>}
                    </td>
                    <td className={tdCls}><PaymentBadge status={o.paymentStatus} /></td>
                    <td className={tdCls}><FulfillmentBadge status={o.status} /></td>
                    <td className={`${tdCls} text-[#616161]`}>{o._count.items} item{o._count.items !== 1 ? "s" : ""}</td>
                    <td className={`${tdCls} text-right font-medium`}>{fmtMoney(o.total, o.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
