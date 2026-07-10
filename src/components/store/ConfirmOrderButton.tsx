"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConfirmOrderButton({ token }: { token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/public/orders/${token}/confirm`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not confirm");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="text-[13px] text-[#616161] mb-3">Everything look right?</p>
      <button
        onClick={confirm}
        disabled={busy}
        className="bg-[#1a1a1a] text-white rounded-xl px-8 py-3 text-sm font-semibold hover:bg-[#303030] transition-colors disabled:opacity-50 cursor-pointer"
      >
        {busy ? "Confirming…" : "Confirm order ✓"}
      </button>
      {error && <p className="text-[13px] text-[#8e1f0b] mt-2">{error}</p>}
    </div>
  );
}
