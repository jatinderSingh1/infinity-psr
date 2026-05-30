"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const industries = [
  "Healthcare & Pharmaceuticals",
  "IT & Technology",
  "Banking & Financial Services",
  "Manufacturing",
  "Real Estate",
  "Education",
  "Global Operations (BPO/KPO)",
  "Other",
];

export default function NewCandidatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentTitle: "",
    currentCompany: "",
    industry: "",
    skills: [] as string[],
    linkedinUrl: "",
    notes: "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addSkill() {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm((f) => ({ ...f, skills: [...f.skills, s] }));
    }
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/crm/candidates");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/crm/candidates" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          ← Back to Candidates
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 mt-4 mb-1">New Candidate</h1>
        <p className="text-zinc-500 text-sm">Add a candidate to your talent pool</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-8 flex flex-col gap-6">
        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">First Name <span className="text-red-500">*</span></label>
            <input
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              required
              placeholder="John"
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Last Name <span className="text-red-500">*</span></label>
            <input
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              required
              placeholder="Doe"
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors"
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
              placeholder="john@example.com"
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors"
            />
          </div>
        </div>

        {/* Current role */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Current Title</label>
            <input
              value={form.currentTitle}
              onChange={(e) => set("currentTitle", e.target.value)}
              placeholder="Senior Engineer"
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Current Company</label>
            <input
              value={form.currentCompany}
              onChange={(e) => set("currentCompany", e.target.value)}
              placeholder="Acme Corp"
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors"
            />
          </div>
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Industry</label>
          <select
            value={form.industry}
            onChange={(e) => set("industry", e.target.value)}
            className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors bg-white"
          >
            <option value="">Select an industry</option>
            {industries.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Skills</label>
          <div className="flex gap-2 mb-3 flex-wrap">
            {form.skills.map((s) => (
              <span key={s} className="flex items-center gap-1.5 bg-zinc-100 text-zinc-700 text-xs font-medium px-3 py-1.5 rounded-full">
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="text-zinc-400 hover:text-zinc-700 transition-colors">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              placeholder="Type a skill and press Enter or Add"
              className="flex-1 border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors"
            />
            <button
              type="button"
              onClick={addSkill}
              className="bg-zinc-100 text-zinc-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">LinkedIn URL</label>
          <input
            type="url"
            value={form.linkedinUrl}
            onChange={(e) => set("linkedinUrl", e.target.value)}
            placeholder="https://linkedin.com/in/johndoe"
            className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            placeholder="Any additional context about this candidate..."
            className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition-colors resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-zinc-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save Candidate"}
          </button>
          <Link
            href="/crm/candidates"
            className="border border-zinc-200 text-zinc-600 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
