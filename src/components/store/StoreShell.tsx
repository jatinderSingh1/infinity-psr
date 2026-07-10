import Link from "next/link";

export function StoreHeader({ storeName }: { storeName: string }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[#ebebeb]">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt={storeName} className="h-10 w-auto flex-shrink-0" />
          <span className="font-bold text-[#1a1a1a] text-lg tracking-tight truncate">{storeName}</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/" className="px-3 py-2 rounded-lg text-[#303030] font-medium hover:bg-[#f4f4f4] transition-colors">
            Shop
          </Link>
          <Link href="/contact" className="px-3 py-2 rounded-lg text-[#303030] font-medium hover:bg-[#f4f4f4] transition-colors">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function StoreFooter({ storeName, email }: { storeName: string; email?: string | null }) {
  return (
    <footer className="border-t border-[#ebebeb] bg-[#fafafa] mt-16">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="h-7 w-auto" />
          <span className="text-sm text-[#616161]">
            © {new Date().getFullYear()} {storeName}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#8a8a8a]">
          {email && (
            <a href={`mailto:${email}`} className="hover:text-[#1a1a1a]">{email}</a>
          )}
          <Link href="/contact" className="hover:text-[#1a1a1a]">Contact us</Link>
          <Link href="/login" className="hover:text-[#1a1a1a]">Staff login</Link>
        </div>
      </div>
    </footer>
  );
}
