"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { card, btnPrimary, btnSecondary, inputCls, labelCls, sectionTitle } from "@/components/crm/ui";
import { round2 } from "@/lib/format";

interface ContactOpt {
  id: string;
  firstName: string;
  lastName: string | null;
  company: string | null;
}

interface ProductOpt {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  unit: string;
}

interface Line {
  key: number;
  productId: string | null;
  title: string;
  quantity: number;
  price: number;
}

export function OrderForm({ contacts, products }: { contacts: ContactOpt[]; products: ProductOpt[] }) {
  const router = useRouter();
  const [contactId, setContactId] = useState("");
  const [contactQuery, setContactQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [discount, setDiscount] = useState("");
  const [taxRate, setTaxRate] = useState("15");
  const [notes, setNotes] = useState("");
  const [markPaid, setMarkPaid] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const keyRef = useState(() => ({ n: 1 }))[0];

  const selectedContact = contacts.find((c) => c.id === contactId);

  const contactMatches = useMemo(() => {
    const q = contactQuery.trim().toLowerCase();
    if (!q) return [];
    return contacts
      .filter((c) =>
        `${c.firstName} ${c.lastName ?? ""} ${c.company ?? ""}`.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [contactQuery, contacts]);

  const productMatches = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => `${p.name} ${p.sku ?? ""}`.toLowerCase().includes(q))
      .slice(0, 6);
  }, [productQuery, products]);

  const addProduct = (p: ProductOpt) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === p.id);
      if (existing) {
        return prev.map((l) => (l.productId === p.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { key: keyRef.n++, productId: p.id, title: p.name, quantity: 1, price: p.price }];
    });
    setProductQuery("");
  };

  const addCustom = () => {
    setLines((prev) => [...prev, { key: keyRef.n++, productId: null, title: "", quantity: 1, price: 0 }]);
  };

  const setLine = (key: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const removeLine = (key: number) => setLines((prev) => prev.filter((l) => l.key !== key));

  const subtotal = round2(lines.reduce((s, l) => s + (l.quantity || 0) * (l.price || 0), 0));
  const disc = Math.min(Number(discount) || 0, subtotal);
  const tax = round2((subtotal - disc) * ((Number(taxRate) || 0) / 100));
  const total = round2(subtotal - disc + tax);

  const canSubmit = contactId && lines.length > 0 && lines.every((l) => l.title.trim() && l.quantity > 0);

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          items: lines.map((l) => ({ productId: l.productId, title: l.title, quantity: l.quantity, price: l.price })),
          discount: disc,
          taxRate: Number(taxRate) || 0,
          notes,
          markPaid,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create order");
      router.push(`/crm/orders/${data.id}`);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Left: items */}
      <div className="md:col-span-2 space-y-4">
        <div className={`${card} p-4`}>
          <h2 className={`${sectionTitle} mb-3`}>Products</h2>
          <div className="relative">
            <input
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              placeholder="Search products to add…"
              className={inputCls}
            />
            {productMatches.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-[#e3e3e3] rounded-xl shadow-lg overflow-hidden">
                {productMatches.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addProduct(p)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-[13px] hover:bg-[#f4f4f4] cursor-pointer"
                  >
                    <span>
                      <span className="font-medium text-[#1a1a1a]">{p.name}</span>
                      {p.sku && <span className="text-[#8a8a8a] ml-1.5 text-xs">{p.sku}</span>}
                    </span>
                    <span className="text-[#616161]">
                      ${p.price.toFixed(2)} · {p.stock} {p.unit}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" onClick={addCustom} className="text-[13px] text-[#005bd3] hover:underline mt-2 cursor-pointer">
            + Add custom item
          </button>

          {lines.length > 0 && (
            <div className="mt-4 border border-[#ebebeb] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#fafafa] border-b border-[#ebebeb]">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#616161]">Item</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#616161] w-20">Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#616161] w-28">Price</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-[#616161] w-24">Total</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f1f1]">
                  {lines.map((l) => (
                    <tr key={l.key}>
                      <td className="px-3 py-2">
                        {l.productId ? (
                          <span className="text-[13px] font-medium text-[#1a1a1a]">{l.title}</span>
                        ) : (
                          <input
                            value={l.title}
                            onChange={(e) => setLine(l.key, { title: e.target.value })}
                            placeholder="Item name…"
                            className={`${inputCls} py-1.5`}
                          />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={l.quantity}
                          onChange={(e) => setLine(l.key, { quantity: Number(e.target.value) })}
                          className={`${inputCls} py-1.5`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={l.price}
                          onChange={(e) => setLine(l.key, { price: Number(e.target.value) })}
                          className={`${inputCls} py-1.5`}
                        />
                      </td>
                      <td className="px-3 py-2 text-right text-[13px] font-medium">
                        ${round2((l.quantity || 0) * (l.price || 0)).toFixed(2)}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(l.key)}
                          className="text-[#8a8a8a] hover:text-[#8e1f0b] cursor-pointer"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={`${card} p-4`}>
          <h2 className={`${sectionTitle} mb-3`}>Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Internal notes about this order…"
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      {/* Right: customer + totals */}
      <div className="space-y-4">
        <div className={`${card} p-4`}>
          <h2 className={`${sectionTitle} mb-3`}>Customer</h2>
          {selectedContact ? (
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-semibold text-[#1a1a1a]">
                  {selectedContact.firstName} {selectedContact.lastName}
                </p>
                {selectedContact.company && (
                  <p className="text-xs text-[#8a8a8a]">{selectedContact.company}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => { setContactId(""); setContactQuery(""); }}
                className="text-xs text-[#005bd3] hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                value={contactQuery}
                onChange={(e) => setContactQuery(e.target.value)}
                placeholder="Search contacts…"
                className={inputCls}
              />
              {contactMatches.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-[#e3e3e3] rounded-xl shadow-lg overflow-hidden">
                  {contactMatches.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setContactId(c.id); setContactQuery(""); }}
                      className="w-full px-3 py-2 text-left text-[13px] hover:bg-[#f4f4f4] cursor-pointer"
                    >
                      <span className="font-medium text-[#1a1a1a]">{c.firstName} {c.lastName}</span>
                      {c.company && <span className="block text-xs text-[#8a8a8a]">{c.company}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`${card} p-4 space-y-2.5`}>
          <h2 className={sectionTitle}>Summary</h2>
          <div className="flex justify-between text-[13px] text-[#303030]">
            <span>Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <span className="text-[#303030]">Discount</span>
            <div className="relative w-28">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a8a8a] text-xs">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0.00"
                className={`${inputCls} pl-6 py-1.5`}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <span className="text-[#303030]">Tax %</span>
            <div className="w-28">
              <input
                type="number"
                min="0"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className={`${inputCls} py-1.5`}
              />
            </div>
          </div>
          <div className="flex justify-between text-[13px] text-[#616161]">
            <span>Tax amount</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-[#1a1a1a] pt-2 border-t border-[#ebebeb]">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <label className="flex items-center gap-2 text-[13px] text-[#303030] pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={markPaid}
              onChange={(e) => setMarkPaid(e.target.checked)}
              className="rounded"
            />
            Mark as paid
          </label>

          {error && <p className="text-[13px] text-[#8e1f0b]">{error}</p>}

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit || saving}
            className={`${btnPrimary} w-full mt-1`}
          >
            {saving ? "Creating…" : "Create order"}
          </button>
          <button type="button" onClick={() => router.back()} className={`${btnSecondary} w-full`}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
