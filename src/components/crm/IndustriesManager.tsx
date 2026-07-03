"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Industry {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  order: number;
  _count: { roles: number; contactTypes: number };
}

const PRESET_COLORS = [
  "#4f46e5", "#059669", "#d97706", "#dc2626", "#7c3aed",
  "#0891b2", "#b45309", "#be185d", "#0f766e", "#c2410c",
  "#1d4ed8", "#15803d", "#92400e", "#6d28d9", "#0369a1",
];

const PRESET_ICONS = ["📁", "👔", "🏠", "🧵", "👟", "✂️", "⌚", "🏺", "🎨", "💼", "🛒", "🏭", "🌿", "🎵", "🍽️"];

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="w-6 h-6 rounded-full border-2 transition-all flex-shrink-0"
          style={{
            backgroundColor: c,
            borderColor: value === c ? "#1f2937" : "transparent",
          }}
        />
      ))}
      <input
        type="color"
        value={value || "#6b7280"}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 rounded cursor-pointer"
        title="Custom color"
      />
    </div>
  );
}

interface InlineFormProps {
  form: { name: string; icon: string; color: string; description: string };
  setForm: React.Dispatch<React.SetStateAction<{ name: string; icon: string; color: string; description: string }>>;
  saving: boolean;
  error: string;
  onSave: () => void;
  onCancel: () => void;
}

function InlineForm({ form, setForm, saving, error, onSave, onCancel }: InlineFormProps) {
  return (
    <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-5 space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Industry Name *</label>
          <input
            autoFocus
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Furniture"
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Description</label>
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Brief description…"
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Icon (emoji)</label>
        <div className="flex items-center gap-3">
          <input
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            className="w-16 border border-zinc-200 rounded px-2 py-1.5 text-center text-xl bg-white focus:outline-none"
          />
          <div className="flex gap-1.5 flex-wrap">
            {PRESET_ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setForm((f) => ({ ...f, icon: ic }))}
                className={`text-xl p-1 rounded transition-colors ${form.icon === ic ? "bg-zinc-200" : "hover:bg-zinc-100"}`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-500 mb-2 block">Color</label>
        <ColorPicker value={form.color} onChange={(c) => setForm((f) => ({ ...f, color: c }))} />
        <div className="mt-2 flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: form.color }}
          >
            {form.icon}
          </span>
          <span className="text-sm font-medium text-zinc-700">{form.name || "Preview"}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={saving || !form.name}
          className="bg-zinc-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="text-zinc-500 hover:text-zinc-900 px-3 py-2 text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function IndustriesManager({ industries: initial }: { industries: Industry[] }) {
  const router = useRouter();
  const [industries, setIndustries] = useState(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", icon: "📁", color: "#4f46e5", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => setForm({ name: "", icon: "📁", color: "#4f46e5", description: "" });

  const startEdit = (ind: Industry) => {
    setEditId(ind.id);
    setForm({ name: ind.name, icon: ind.icon ?? "📁", color: ind.color ?? "#4f46e5", description: ind.description ?? "" });
    setShowAdd(false);
  };

  const cancelEdit = () => { setEditId(null); resetForm(); };

  const addIndustry = async () => {
    if (!form.name) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/industries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed");
      }
      const ind = await res.json();
      setIndustries((prev) => [...prev, { ...ind, _count: { roles: 0, contactTypes: 0 } }]);
      setShowAdd(false);
      resetForm();
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/industries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setIndustries((prev) =>
        prev.map((ind) => (ind.id === id ? { ...ind, ...updated } : ind))
      );
      setEditId(null);
      resetForm();
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ind: Industry) => {
    const res = await fetch(`/api/industries/${ind.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !ind.isActive }),
    });
    const updated = await res.json();
    setIndustries((prev) => prev.map((i) => (i.id === ind.id ? { ...i, isActive: updated.isActive } : i)));
    router.refresh();
  };

  const deleteIndustry = async (ind: Industry) => {
    if (!confirm(`Delete "${ind.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/industries/${ind.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Cannot delete");
      return;
    }
    setIndustries((prev) => prev.filter((i) => i.id !== ind.id));
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Add new */}
      {!showAdd && !editId && (
        <button
          onClick={() => { setShowAdd(true); cancelEdit(); }}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-zinc-300 rounded-xl p-4 text-sm text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <span className="text-lg">+</span> Add New Industry
        </button>
      )}
      {showAdd && (
        <InlineForm
          form={form}
          setForm={setForm}
          saving={saving}
          error={error}
          onSave={addIndustry}
          onCancel={() => { setShowAdd(false); resetForm(); setError(""); }}
        />
      )}

      {/* Industry list */}
      {industries.map((ind) => (
        <div key={ind.id} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          {editId === ind.id ? (
            <div className="p-5">
              <InlineForm
                form={form}
                setForm={setForm}
                saving={saving}
                error={error}
                onSave={() => saveEdit(ind.id)}
                onCancel={cancelEdit}
              />
            </div>
          ) : (
            <div className="flex items-center gap-4 px-5 py-4">
              {/* Color + icon */}
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: ind.color ? ind.color + "20" : "#f4f4f5", border: `2px solid ${ind.color ?? "#e5e7eb"}` }}
              >
                {ind.icon ?? "📁"}
              </span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/crm/industries/${ind.slug}`}
                    className="font-semibold text-zinc-900 hover:underline"
                  >
                    {ind.name}
                  </Link>
                  {ind.isSystem && (
                    <span className="text-xs bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded">System</span>
                  )}
                  {!ind.isActive && (
                    <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded">Hidden</span>
                  )}
                </div>
                {ind.description && (
                  <p className="text-xs text-zinc-400 mt-0.5 truncate">{ind.description}</p>
                )}
                <p className="text-xs text-zinc-400 mt-0.5">
                  {ind._count.roles} contacts · {ind._count.contactTypes} types
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/crm/settings/contact-types/${ind.slug}`}
                  className="text-xs text-zinc-400 hover:text-zinc-700 border border-zinc-200 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Types
                </Link>
                <button
                  onClick={() => startEdit(ind)}
                  className="text-xs text-zinc-400 hover:text-zinc-700 border border-zinc-200 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(ind)}
                  className={`text-xs border px-2.5 py-1.5 rounded-lg transition-colors ${
                    ind.isActive
                      ? "text-zinc-400 hover:text-zinc-700 border-zinc-200"
                      : "text-green-600 hover:text-green-800 border-green-200"
                  }`}
                >
                  {ind.isActive ? "Hide" : "Show"}
                </button>
                {!ind.isSystem && (
                  <button
                    onClick={() => deleteIndustry(ind)}
                    className="text-xs text-red-400 hover:text-red-600 border border-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
