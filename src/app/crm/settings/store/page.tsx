"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { card, btnPrimary, inputCls, labelCls } from "@/components/crm/ui";

export default function StoreSettingsPage() {
  const [form, setForm] = useState({
    storeName: "Infinity Aura",
    tagline: "",
    whatsapp: "",
    email: "",
    about: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/store-settings")
      .then((r) => r.json())
      .then((d) => {
        setForm({
          storeName: d.storeName ?? "Infinity Aura",
          tagline: d.tagline ?? "",
          whatsapp: d.whatsapp ?? "",
          email: d.email ?? "",
          about: d.about ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof typeof form, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setSaved(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setSaved(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 max-w-[750px] mx-auto">
      <div className="flex items-center gap-2 text-[13px] text-[#8a8a8a] mb-3">
        <Link href="/crm/settings" className="hover:text-[#1a1a1a]">← Settings</Link>
      </div>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">Online store</h1>
          <p className="text-[13px] text-[#616161] mt-0.5">
            What customers see on your public shop —{" "}
            <a href="/" target="_blank" className="text-[#005bd3] hover:underline">view store ↗</a>
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-[13px] text-[#8a8a8a] py-8 text-center">Loading…</p>
      ) : (
        <form onSubmit={save} className="space-y-4">
          <div className={`${card} p-4 space-y-3`}>
            <div>
              <label className={labelCls}>Store name *</label>
              <input value={form.storeName} onChange={(e) => set("storeName", e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Tagline</label>
              <input
                value={form.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                placeholder="Quality products & services, across industries"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>About (shown at the bottom of the shop)</label>
              <textarea value={form.about} onChange={(e) => set("about", e.target.value)} rows={3} className={`${inputCls} resize-none`} />
            </div>
          </div>

          <div className={`${card} p-4 space-y-3`}>
            <h2 className="text-[13px] font-semibold text-[#1a1a1a]">Contact channels</h2>
            <div>
              <label className={labelCls}>WhatsApp number (with country code)</label>
              <input
                value={form.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
                placeholder="+1 902 555 0100"
                className={inputCls}
              />
              <p className="text-xs text-[#8a8a8a] mt-1">
                Powers the "Order on WhatsApp" button on every product. Leave blank to hide it.
              </p>
            </div>
            <div>
              <label className={labelCls}>Public email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="hello@infinityaura.com"
                className={inputCls}
              />
            </div>
          </div>

          {error && <p className="text-[13px] text-[#8e1f0b]">{error}</p>}

          <div className="flex items-center gap-3 pb-8">
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? "Saving…" : "Save"}
            </button>
            {saved && <span className="text-[13px] text-[#014b40] font-medium">✓ Saved</span>}
          </div>
        </form>
      )}
    </div>
  );
}
