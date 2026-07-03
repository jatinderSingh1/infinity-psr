"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ContactType {
  id: string;
  name: string;
  slug: string;
}

interface Industry {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  contactTypes: ContactType[];
}

interface RoleEntry {
  industryId: string;
  contactTypeId: string;
  notes?: string;
}

interface ContactFormProps {
  industries: Industry[];
  defaultIndustryId?: string;
  defaultTypeId?: string;
  initialData?: {
    id: string;
    firstName: string;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    phone2?: string | null;
    company?: string | null;
    jobTitle?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    website?: string | null;
    instagram?: string | null;
    linkedIn?: string | null;
    currency?: string;
    notes?: string | null;
    followUpDate?: string | null;
    followUpNote?: string | null;
    tags?: string[];
    status?: string;
    roles?: { industryId: string; contactTypeId: string; notes?: string | null }[];
  };
}

const CURRENCIES = ["INR", "USD", "GBP", "EUR", "AED", "SGD", "AUD", "CAD", "JPY"];
const STATUSES = ["ACTIVE", "INACTIVE", "LEAD", "PROSPECT"];

export function ContactForm({
  industries,
  defaultIndustryId,
  defaultTypeId,
  initialData,
}: ContactFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const buildDefaultRoles = (): RoleEntry[] => {
    if (initialData?.roles?.length) {
      return initialData.roles.map((r) => ({ industryId: r.industryId, contactTypeId: r.contactTypeId, notes: r.notes ?? "" }));
    }
    if (defaultIndustryId && defaultTypeId) {
      return [{ industryId: defaultIndustryId, contactTypeId: defaultTypeId, notes: "" }];
    }
    return [];
  };

  const [form, setForm] = useState({
    firstName: initialData?.firstName ?? "",
    lastName: initialData?.lastName ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    phone2: initialData?.phone2 ?? "",
    company: initialData?.company ?? "",
    jobTitle: initialData?.jobTitle ?? "",
    address: initialData?.address ?? "",
    city: initialData?.city ?? "",
    state: initialData?.state ?? "",
    country: initialData?.country ?? "",
    website: initialData?.website ?? "",
    instagram: initialData?.instagram ?? "",
    linkedIn: initialData?.linkedIn ?? "",
    currency: initialData?.currency ?? "INR",
    notes: initialData?.notes ?? "",
    followUpDate: initialData?.followUpDate ?? "",
    followUpNote: initialData?.followUpNote ?? "",
    tags: initialData?.tags?.join(", ") ?? "",
    status: initialData?.status ?? "ACTIVE",
  });

  const [roles, setRoles] = useState<RoleEntry[]>(buildDefaultRoles);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const field = (key: keyof typeof form, label: string, type = "text", required = false) => (
    <div>
      <label className="block text-xs font-medium text-zinc-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        required={required}
        className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 bg-white"
      />
    </div>
  );

  const addRole = () => setRoles((r) => [...r, { industryId: "", contactTypeId: "", notes: "" }]);
  const removeRole = (i: number) => setRoles((r) => r.filter((_, idx) => idx !== i));
  const setRoleField = (i: number, key: keyof RoleEntry, val: string) => {
    setRoles((r) => {
      const updated = [...r];
      if (key === "industryId") {
        updated[i] = { ...updated[i], industryId: val, contactTypeId: "" };
      } else {
        updated[i] = { ...updated[i], [key]: val };
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      followUpDate: form.followUpDate ? new Date(form.followUpDate).toISOString() : null,
      followUpNote: form.followUpNote || null,
      roles,
    };

    try {
      const url = isEdit ? `/api/contacts/${initialData!.id}` : "/api/contacts";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      const contact = await res.json();
      router.push(`/crm/contacts/${contact.id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <section className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h2 className="font-semibold text-zinc-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("firstName", "First Name", "text", true)}
          {field("lastName", "Last Name")}
          {field("email", "Email", "email")}
          {field("phone", "Phone")}
          {field("phone2", "Phone 2")}
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 bg-white"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Professional */}
      <section className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h2 className="font-semibold text-zinc-900 mb-4">Professional Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("company", "Company / Organisation")}
          {field("jobTitle", "Job Title")}
          {field("website", "Website")}
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 bg-white"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h2 className="font-semibold text-zinc-900 mb-4">Location</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("address", "Address")}
          {field("city", "City")}
          {field("state", "State / Province")}
          {field("country", "Country")}
        </div>
      </section>

      {/* Social */}
      <section className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h2 className="font-semibold text-zinc-900 mb-4">Social / Online</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("instagram", "Instagram")}
          {field("linkedIn", "LinkedIn")}
        </div>
      </section>

      {/* Industry Roles */}
      <section className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zinc-900">Industry Roles</h2>
          <button
            type="button"
            onClick={addRole}
            className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            + Add Role
          </button>
        </div>
        {roles.length === 0 && (
          <p className="text-sm text-zinc-400 text-center py-4">
            No roles assigned yet. Click "Add Role" to assign this contact to an industry.
          </p>
        )}
        <div className="space-y-3">
          {roles.map((role, i) => {
            const ind = industries.find((x) => x.id === role.industryId);
            return (
              <div key={i} className="flex gap-2 items-start p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Industry</label>
                    <select
                      value={role.industryId}
                      onChange={(e) => setRoleField(i, "industryId", e.target.value)}
                      className="w-full border border-zinc-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300"
                    >
                      <option value="">Select industry…</option>
                      {industries.map((ind) => (
                        <option key={ind.id} value={ind.id}>
                          {ind.icon} {ind.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Type / Role</label>
                    <select
                      value={role.contactTypeId}
                      onChange={(e) => setRoleField(i, "contactTypeId", e.target.value)}
                      disabled={!role.industryId}
                      className="w-full border border-zinc-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300 disabled:opacity-50"
                    >
                      <option value="">Select type…</option>
                      {ind?.contactTypes.map((ct) => (
                        <option key={ct.id} value={ct.id}>
                          {ct.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeRole(i)}
                  className="text-zinc-400 hover:text-red-500 transition-colors mt-5 text-lg flex-shrink-0"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Follow-up */}
      <section className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h2 className="font-semibold text-zinc-900 mb-4">Follow-up Reminder</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Follow-up Date</label>
            <input
              type="date"
              value={form.followUpDate}
              onChange={(e) => setForm((f) => ({ ...f, followUpDate: e.target.value }))}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Reminder Note</label>
            <input
              type="text"
              value={form.followUpNote}
              onChange={(e) => setForm((f) => ({ ...f, followUpNote: e.target.value }))}
              placeholder="e.g. Check on order status"
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 bg-white"
            />
          </div>
        </div>
      </section>

      {/* Notes & Tags */}
      <section className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h2 className="font-semibold text-zinc-900 mb-4">Notes & Tags</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="vip, wholesale, returning"
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 bg-white resize-none"
            />
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="flex gap-3 pb-8">
        <button
          type="submit"
          disabled={saving}
          className="bg-zinc-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Contact"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-zinc-200 text-zinc-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
