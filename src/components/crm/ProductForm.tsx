"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { card, btnPrimary, btnSecondary, btnDanger, inputCls, labelCls, sectionTitle } from "@/components/crm/ui";

interface Industry {
  id: string;
  name: string;
  icon: string | null;
}

interface ProductFormProps {
  industries: Industry[];
  initialData?: {
    id: string;
    name: string;
    sku: string | null;
    description: string | null;
    category: string | null;
    price: number;
    cost: number | null;
    stock: number;
    lowStockAt: number;
    unit: string;
    industryId: string | null;
    isActive: boolean;
  };
}

export function ProductForm({ industries, initialData }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    sku: initialData?.sku ?? "",
    description: initialData?.description ?? "",
    category: initialData?.category ?? "",
    price: initialData?.price?.toString() ?? "",
    cost: initialData?.cost?.toString() ?? "",
    stock: initialData?.stock?.toString() ?? "0",
    lowStockAt: initialData?.lowStockAt?.toString() ?? "5",
    unit: initialData?.unit ?? "pcs",
    industryId: initialData?.industryId ?? "",
    isActive: initialData?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const price = Number(form.price) || 0;
  const cost = Number(form.cost) || 0;
  const margin = price > 0 && cost > 0 ? (((price - cost) / price) * 100).toFixed(1) : null;

  const set = (key: keyof typeof form, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = isEdit ? `/api/products/${initialData!.id}` : "/api/products";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to save");
      }
      router.push("/crm/products");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${initialData!.name}"? Existing order lines keep their history.`)) return;
    const res = await fetch(`/api/products/${initialData!.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/crm/products");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-[#fedad9] border border-[#e0b3b2] text-[#8e1f0b] px-4 py-3 rounded-xl text-[13px] mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main column */}
        <div className="md:col-span-2 space-y-4">
          <div className={`${card} p-4 space-y-3`}>
            <div>
              <label className={labelCls}>Title *</label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                placeholder="e.g. Leather Wallet — Brown"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>

          <div className={`${card} p-4`}>
            <h2 className={`${sectionTitle} mb-3`}>Pricing</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8a8a] text-[13px]">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="0.00"
                    className={`${inputCls} pl-7`}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Cost per item</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8a8a] text-[13px]">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.cost}
                    onChange={(e) => set("cost", e.target.value)}
                    placeholder="0.00"
                    className={`${inputCls} pl-7`}
                  />
                </div>
              </div>
            </div>
            {margin && (
              <p className="text-xs text-[#616161] mt-2">
                Margin: <span className="font-semibold">{margin}%</span> · Profit:{" "}
                <span className="font-semibold">${(price - cost).toFixed(2)}</span> per item
              </p>
            )}
          </div>

          <div className={`${card} p-4`}>
            <h2 className={`${sectionTitle} mb-3`}>Inventory</h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>In stock</label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Low-stock alert at</label>
                <input
                  type="number"
                  min="0"
                  value={form.lowStockAt}
                  onChange={(e) => set("lowStockAt", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Unit</label>
                <select value={form.unit} onChange={(e) => set("unit", e.target.value)} className={inputCls}>
                  {["pcs", "box", "kg", "m", "set", "pair", "hrs"].map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-4">
          <div className={`${card} p-4`}>
            <h2 className={`${sectionTitle} mb-3`}>Status</h2>
            <select
              value={form.isActive ? "active" : "draft"}
              onChange={(e) => set("isActive", e.target.value === "active")}
              className={inputCls}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className={`${card} p-4 space-y-3`}>
            <h2 className={sectionTitle}>Organization</h2>
            <div>
              <label className={labelCls}>SKU</label>
              <input
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="e.g. WAL-BR-01"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <input
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="e.g. Accessories"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Industry</label>
              <select
                value={form.industryId}
                onChange={(e) => set("industryId", e.target.value)}
                className={inputCls}
              >
                <option value="">None</option>
                {industries.map((ind) => (
                  <option key={ind.id} value={ind.id}>{ind.icon} {ind.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-5 pb-8">
        <button type="submit" disabled={saving || !form.name} className={btnPrimary}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Add product"}
        </button>
        <button type="button" onClick={() => router.back()} className={btnSecondary}>
          Cancel
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete} className={`${btnDanger} ml-auto`}>
            Delete product
          </button>
        )}
      </div>
    </form>
  );
}
