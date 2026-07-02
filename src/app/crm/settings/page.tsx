import Link from "next/link";

const SETTINGS = [
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
];

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Configure your ERP/CRM system</p>
      </div>

      <div className="grid gap-4">
        {SETTINGS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all flex items-start gap-4"
          >
            <span className="text-3xl flex-shrink-0">{s.icon}</span>
            <div>
              <p className="font-semibold text-zinc-900 mb-1">{s.title}</p>
              <p className="text-sm text-zinc-500">{s.desc}</p>
            </div>
            <span className="ml-auto text-zinc-300 text-lg self-center">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
