import { getStoreSettings, waLink } from "@/lib/store";
import { StoreHeader, StoreFooter } from "@/components/store/StoreShell";
import { InquiryForm } from "@/components/store/InquiryForm";

export const dynamic = "force-dynamic";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const sp = await searchParams;
  const settings = await getStoreSettings();
  const initialMessage = sp.product ? `Hi! I'm interested in "${sp.product}". ` : "";

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] flex flex-col">
      <StoreHeader storeName={settings.storeName} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-center">Get in touch</h1>
        <p className="text-[#616161] text-center mb-8">
          Questions, custom orders, wholesale — we'd love to hear from you.
        </p>

        {(settings.whatsapp || settings.email) && (
          <div className="flex gap-3 justify-center mb-8 flex-wrap">
            {settings.whatsapp && (
              <a
                href={waLink(settings.whatsapp, "Hi! I have a question.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity"
              >
                💬 Chat on WhatsApp
              </a>
            )}
            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-2 bg-white border border-[#d4d4d4] text-[#1a1a1a] rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-[#f7f7f7] transition-colors"
              >
                ✉️ {settings.email}
              </a>
            )}
          </div>
        )}

        <div className="border border-[#ebebeb] rounded-2xl p-6 shadow-sm">
          <InquiryForm initialMessage={initialMessage} />
        </div>
      </main>

      <StoreFooter storeName={settings.storeName} email={settings.email} />
    </div>
  );
}
