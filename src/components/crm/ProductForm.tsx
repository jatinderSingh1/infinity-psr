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
    image?: string | null;
    category: string | null;
    price: number;
    cost: number | null;
    stock: number;
    lowStockAt: number;
    unit: string;
    industryId: string | null;
    isActive: boolean;
    isPublic?: boolean;
    showPrice?: boolean;
  };
}

// Downscale to max 800px and re-encode as JPEG so uploads stay small
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const max = 800;
      let { width, height } = img;
      if (width > max || height > max) {
        const scale = Math.min(max / width, max / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

export function ProductForm({ industries, initialData }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    sku: initialData?.sku ?? "",
    description: initialData?.description ?? "",
    image: initialData?.image ?? "",
    category: initialData?.category ?? "",
    price: initialData?.price?.toString() ?? "",
    cost: initialData?.cost?.toString() ?? "",
    stock: initialData?.stock?.toString() ?? "0",
    lowStockAt: initialData?.lowStockAt?.toString() ?? "5",
    unit: initialData?.unit ?? "pcs",
    industryId: initialData?.industryId ?? "",
    isActive: initialData?.isActive ?? true,
    isPublic: initialData?.isPublic ?? false,
    showPrice: initialData?.showPrice ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const price = Number(form.price) || 0;
  const cost = Number(form.cost) || 0;
  const margin = price > 0 && cost > 0 ? (((price - cost) / price) * 100).toFixed(1) : null;

  const set = (key: keyof typeof form, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, WebP…)");
      return;
    }
    try {
      const dataUrl = await compressImage(file);
      set("image", dataUrl);
      setError("");
    } catch {
      setError("Could not process that image — try a different file.");
    }
  };

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
            <h2 className={`${sectionTitle} mb-3`}>Media</h2>
            {form.image ? (
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image}
                  alt="Product"
                  className="w-32 h-32 rounded-xl object-cover border border-[#e3e3e3]"
                />
                <div className="flex flex-col gap-2">
                  <label className={`${btnSecondary} cursor-pointer`}>
                    Replace image
                    <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => set("image", "")}
                    className={btnDanger}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#d4d4d4] rounded-xl py-8 cursor-pointer hover:border-[#8a8a8a] hover:bg-[#fafafa] transition-colors">
                <span className="text-2xl">🖼️</span>
                <span className="text-[13px] font-medium text-[#005bd3]">Upload image</span>
                <span className="text-xs text-[#8a8a8a]">JPG, PNG or WebP — resized automatically</span>
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            )}
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
            <h2 className={sectionTitle}>Online store</h2>
            <label className="flex items-center gap-2 text-[13px] text-[#303030] cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => set("isPublic", e.target.checked)}
                className="rounded"
              />
              Show in online store
            </label>
            {form.isPublic && (
              <label className="flex items-center gap-2 text-[13px] text-[#303030] cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showPrice}
                  onChange={(e) => set("showPrice", e.target.checked)}
                  className="rounded"
                />
                Show price (unchecked = "Contact for price")
              </label>
            )}
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
