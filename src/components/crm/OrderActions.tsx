"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary, btnSecondary, btnDanger, inputCls } from "@/components/crm/ui";
import { round2 } from "@/lib/format";

interface Props {
  id: string;
  status: string;
  paymentStatus: string;
  total: number;
  amountPaid: number;
}

export function OrderActions({ id, status, paymentStatus, total, amountPaid }: Props) {
  const router = useRouter();
  const balance = round2(total - amountPaid);
  const [showPay, setShowPay] = useState(false);
  const [amount, setAmount] = useState(balance.toFixed(2));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const act = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      setShowPay(false);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "share" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create link");
      const url = `${window.location.origin}/i/${data.token}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const cancelled = status === "CANCELLED";

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {!cancelled && (
          <button onClick={copyLink} disabled={busy} className={btnSecondary}>
            {copied ? "✓ Link copied!" : "Copy customer link"}
          </button>
        )}
        {!cancelled && paymentStatus !== "PAID" && !showPay && (
          <button onClick={() => setShowPay(true)} className={btnPrimary}>
            Record payment
          </button>
        )}
        {status === "OPEN" && (
          <button onClick={() => act({ action: "fulfill" })} disabled={busy} className={btnSecondary}>
            Mark as fulfilled
          </button>
        )}
        {!cancelled && (
          <button
            onClick={() => {
              if (confirm("Cancel this order? Product stock will be restored.")) {
                act({ action: "cancel" });
              }
            }}
            disabled={busy}
            className={btnDanger}
          >
            Cancel order
          </button>
        )}
      </div>

      {showPay && (
        <div className="flex items-center gap-2 bg-white border border-[#e3e3e3] rounded-xl shadow-sm p-2">
          <div className="relative w-32">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a8a8a] text-xs">$</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              max={balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`${inputCls} pl-6 py-1.5`}
              autoFocus
            />
          </div>
          <button
            onClick={() => act({ action: "payment", amount: Number(amount) })}
            disabled={busy || !(Number(amount) > 0)}
            className={btnPrimary}
          >
            {busy ? "Saving…" : "Confirm"}
          </button>
          <button onClick={() => setShowPay(false)} className={btnSecondary}>
            ✕
          </button>
        </div>
      )}

      {error && <p className="text-[13px] text-[#8e1f0b]">{error}</p>}
    </div>
  );
}
