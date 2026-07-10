"use client";

import { useState } from "react";

export function InquiryForm({ initialMessage }: { initialMessage?: string }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: initialMessage ?? "",
    website: "", // honeypot — real people leave this empty
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const inputCls =
    "w-full border border-[#d4d4d4] rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30 focus:border-[#005bd3] transition-shadow";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/public/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send — please try again.");
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-10">
        <p className="text-4xl mb-3">✅</p>
        <h2 className="font-bold text-lg mb-1">Message sent!</h2>
        <p className="text-sm text-[#616161]">
          Thanks for reaching out — we'll get back to you as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#303030] mb-1.5">Your name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Jane Smith"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#303030] mb-1.5">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+1 902 555 0100"
            className={inputCls}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#303030] mb-1.5">Email *</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="you@example.com"
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#303030] mb-1.5">Message *</label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Tell us what you're looking for…"
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Honeypot — hidden from real users */}
      <input
        type="text"
        value={form.website}
        onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {error && (
        <p className="text-sm text-[#8e1f0b] bg-[#fedad9] border border-[#e0b3b2] rounded-xl px-4 py-2.5">{error}</p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full sm:w-auto bg-[#1a1a1a] text-white rounded-xl px-8 py-3 text-sm font-semibold hover:bg-[#303030] transition-colors disabled:opacity-50 cursor-pointer"
      >
        {sending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
