"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ContactType {
  id: string;
  name: string;
  slug: string;
  isSystem: boolean;
  isActive: boolean;
  order: number;
  _count: { roles: number };
}

interface Industry {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
}

interface Props {
  industry: Industry;
  contactTypes: ContactType[];
}

export function ContactTypesManager({ industry, contactTypes: initial }: Props) {
  const router = useRouter();
  const [types, setTypes] = useState(initial);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addType = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/contact-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), industryId: industry.id }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed"); }
      const ct = await res.json();
      setTypes((prev) => [...prev, { ...ct, _count: { roles: 0 } }]);
      setNewName("");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/contact-types/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setTypes((prev) => prev.map((ct) => (ct.id === id ? { ...ct, name: updated.name } : ct)));
      setEditId(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ct: ContactType) => {
    const res = await fetch(`/api/contact-types/${ct.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !ct.isActive }),
    });
    const updated = await res.json();
    setTypes((prev) => prev.map((t) => (t.id === ct.id ? { ...t, isActive: updated.isActive } : t)));
    router.refresh();
  };

  const deleteType = async (ct: ContactType) => {
    if (!confirm(`Delete "${ct.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/contact-types/${ct.id}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Cannot delete"); return; }
    setTypes((prev) => prev.filter((t) => t.id !== ct.id));
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

      {/* Add new type */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
        <h2 className="font-semibold text-zinc-900 mb-3">Add Contact Type</h2>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addType()}
            placeholder={`e.g. Wholesaler, Exporter, Agent…`}
            className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
          />
          <button
            onClick={addType}
            disabled={saving || !newName.trim()}
            className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Adding…" : "Add"}
          </button>
        </div>
        <p className="text-xs text-zinc-400 mt-2">Press Enter or click Add to create the type.</p>
      </div>

      {/* Types list */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm divide-y divide-zinc-50">
        {types.length === 0 && (
          <div className="px-5 py-8 text-center text-zinc-400 text-sm">No types yet</div>
        )}
        {types.map((ct) => (
          <div key={ct.id} className="flex items-center gap-3 px-5 py-3">
            {editId === ct.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(ct.id)}
                  autoFocus
                  className="flex-1 border border-zinc-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300"
                />
                <button
                  onClick={() => saveEdit(ct.id)}
                  disabled={saving}
                  className="text-xs bg-zinc-900 text-white px-3 py-1.5 rounded hover:bg-zinc-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditId(null)}
                  className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: industry.color ?? "#6b7280" }}
                />
                <span className="flex-1 text-sm font-medium text-zinc-800">{ct.name}</span>
                {ct.isSystem && (
                  <span className="text-xs text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">System</span>
                )}
                {!ct.isActive && (
                  <span className="text-xs text-red-400 bg-red-50 px-1.5 py-0.5 rounded">Hidden</span>
                )}
                <span className="text-xs text-zinc-400">{ct._count.roles} contacts</span>
                <button
                  onClick={() => { setEditId(ct.id); setEditName(ct.name); }}
                  className="text-xs text-zinc-400 hover:text-zinc-700 px-2 py-1 rounded border border-zinc-200 transition-colors"
                >
                  Rename
                </button>
                <button
                  onClick={() => toggleActive(ct)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    ct.isActive ? "text-zinc-400 border-zinc-200 hover:text-zinc-700" : "text-green-600 border-green-200 hover:text-green-800"
                  }`}
                >
                  {ct.isActive ? "Hide" : "Show"}
                </button>
                {!ct.isSystem && (
                  <button
                    onClick={() => deleteType(ct)}
                    className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded border border-red-100 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
