// Shopify Polaris-inspired shared UI primitives (server-safe, no hooks)

export type Tone = "success" | "warning" | "critical" | "info" | "default";

const TONES: Record<Tone, string> = {
  success: "bg-[#affebf] text-[#014b40]",
  warning: "bg-[#ffeb78] text-[#4f4700]",
  critical: "bg-[#fedad9] text-[#8e1f0b]",
  info: "bg-[#d5ebff] text-[#00527c]",
  default: "bg-[#e3e3e3] text-[#303030]",
};

export function Badge({ tone = "default", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium whitespace-nowrap ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function PaymentBadge({ status }: { status: string }) {
  if (status === "PAID") return <Badge tone="default">✓ Paid</Badge>;
  if (status === "PARTIAL") return <Badge tone="warning">◐ Partially paid</Badge>;
  return <Badge tone="warning">○ Payment pending</Badge>;
}

export function FulfillmentBadge({ status }: { status: string }) {
  if (status === "FULFILLED") return <Badge tone="success">✓ Fulfilled</Badge>;
  if (status === "CANCELLED") return <Badge tone="critical">✕ Cancelled</Badge>;
  return <Badge tone="warning">◌ Unfulfilled</Badge>;
}

export function contactStatusTone(status: string): Tone {
  switch (status) {
    case "ACTIVE": return "success";
    case "LEAD": return "info";
    case "PROSPECT": return "warning";
    default: return "default";
  }
}

export function dealStageTone(stage: string): Tone {
  switch (stage) {
    case "WON": return "success";
    case "LOST": return "critical";
    case "NEGOTIATION": return "warning";
    case "LEAD": return "default";
    default: return "info";
  }
}

// Class-name tokens
export const card = "bg-white rounded-xl border border-[#e3e3e3] shadow-sm";
export const cardPad = "bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-4";
export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 bg-[#1a1a1a] text-white rounded-lg px-3.5 py-2 text-[13px] font-semibold hover:bg-[#303030] transition-colors shadow-sm disabled:opacity-50 cursor-pointer";
export const btnSecondary =
  "inline-flex items-center justify-center gap-1.5 bg-white border border-[#d4d4d4] text-[#303030] rounded-lg px-3.5 py-2 text-[13px] font-medium hover:bg-[#f7f7f7] transition-colors shadow-sm disabled:opacity-50 cursor-pointer";
export const btnDanger =
  "inline-flex items-center justify-center gap-1.5 bg-white border border-[#e0b3b2] text-[#8e1f0b] rounded-lg px-3.5 py-2 text-[13px] font-medium hover:bg-[#fff0f0] transition-colors shadow-sm disabled:opacity-50 cursor-pointer";
export const inputCls =
  "w-full border border-[#b5b5b5] rounded-lg px-3 py-2 text-[13px] bg-white text-[#1a1a1a] placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30 focus:border-[#005bd3] transition-shadow";
export const labelCls = "block text-[13px] font-medium text-[#303030] mb-1";
export const thCls = "px-4 py-2.5 text-left text-xs font-semibold text-[#616161] whitespace-nowrap";
export const tdCls = "px-4 py-3 text-[13px] text-[#303030]";
export const sectionTitle = "text-[13px] font-semibold text-[#1a1a1a]";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
      <div>
        <h1 className="text-xl font-bold text-[#1a1a1a]">{title}</h1>
        {subtitle && <p className="text-[13px] text-[#616161] mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: string;
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="py-16 px-6 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="font-semibold text-[#1a1a1a] mb-1">{title}</p>
      {text && <p className="text-[13px] text-[#616161] mb-4 max-w-sm mx-auto">{text}</p>}
      {action}
    </div>
  );
}
