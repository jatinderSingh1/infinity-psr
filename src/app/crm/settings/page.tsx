import Link from "next/link";
import { card } from "@/components/crm/ui";

const SETTINGS = [
  {
    href: "/crm/settings/store",
    icon: "🛍️",
    title: "Online Store",
    desc: "Store name, tagline, WhatsApp number, and public contact details.",
  },
  {
    href: "/crm/settings/industries",
    icon: "🏭",
    title: "Industries",
    desc: "Add, edit, or remove industries. Rearrange order and toggle visibility.",
  },
  {
    href: "/crm/settings/contact-types",
    icon: "🏷️",
    title: "Contact Types",
    desc: "Manage sub-types within each industry (e.g. Buyer, Seller, Wholesaler).",
  },
  {
    href: "/crm/settings/users",
    icon: "👤",
    title: "Users",
    desc: "Manage team members and their access levels.",
  },
  {
    href: "/crm/settings/import",
    icon: "📥",
    title: "Import Contacts",
    desc: "Bulk-import contacts from a CSV file or pasted spreadsheet data.",
  },
  {
    href: "/api/contacts/export",
    icon: "📤",
    title: "Export Data",
    desc: "Download all contacts as a CSV file. Orders can be exported from the Orders page.",
    external: true,
  },
];

export default function SettingsPage() {
  return (
    <div className="p-5 max-w-[750px] mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#1a1a1a]">Settings</h1>
        <p className="text-[13px] text-[#616161] mt-0.5">Configure your ERP / CRM system</p>
      </div>

      <div className="grid gap-3">
        {SETTINGS.map((s) => {
          const inner = (
            <>
              <span className="text-2xl flex-shrink-0 w-10 h-10 rounded-lg bg-[#f1f1f1] flex items-center justify-center">
                {s.icon}
              </span>
              <div>
                <p className="text-[13px] font-semibold text-[#1a1a1a] mb-0.5">{s.title}</p>
                <p className="text-[13px] text-[#616161]">{s.desc}</p>
              </div>
              <span className="ml-auto text-[#c7c7c7] self-center">→</span>
            </>
          );
          const cls = `${card} p-4 hover:border-[#c7c7c7] transition-colors flex items-start gap-3`;
          return s.external ? (
            <a key={s.href} href={s.href} className={cls}>{inner}</a>
          ) : (
            <Link key={s.href} href={s.href} className={cls}>{inner}</Link>
          );
        })}
      </div>
    </div>
  );
}
