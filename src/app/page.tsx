import Link from "next/link";

const sectors = [
  "Healthcare & Pharmaceuticals",
  "IT & Technology",
  "Banking & Financial Services",
  "Manufacturing",
  "Real Estate",
  "Education",
  "Global Operations (BPO/KPO)",
];

const pillars = [
  {
    title: "Structural Acquisition",
    description:
      "Scientific skill analysis to identify and place specialists and leaders who align with your organisational DNA.",
  },
  {
    title: "Talent Velocity",
    description:
      "Predictive analytics to anticipate candidate availability and move faster than the market.",
  },
  {
    title: "DNA Compatibility",
    description:
      "Deep cultural and behavioural matching to ensure long-term retention and organisational fit.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">INFINITY PSR</span>
          <nav className="hidden md:flex gap-8 text-sm text-zinc-600">
            <a href="#methodology" className="hover:text-zinc-900 transition-colors">Methodology</a>
            <a href="#sectors" className="hover:text-zinc-900 transition-colors">Sectors</a>
            <a href="#contact" className="hover:text-zinc-900 transition-colors">Contact</a>
          </nav>
          <Link
            href="/login"
            className="text-sm bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Portal Login
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-4">
            Est. 2024 · Global Operations
          </p>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Global Talent Architecture<br />
            <span className="text-zinc-400">for World-Class Institutions</span>
          </h1>
          <p className="text-lg text-zinc-600 leading-relaxed mb-10 max-w-xl">
            We don&apos;t just recruit. We architect precision talent strategies that
            drive long-term organisational success across seven global sectors.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a
              href="#contact"
              className="bg-zinc-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              Start a Search
            </a>
            <a
              href="#methodology"
              className="border border-zinc-200 text-zinc-700 px-6 py-3 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
            >
              Our Methodology
            </a>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section id="methodology" className="py-24 px-6 bg-zinc-50">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-3">
            Our Approach
          </p>
          <h2 className="text-3xl font-bold mb-12">The Three-Pillar Framework</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {pillars.map((p) => (
              <div key={p.title} className="bg-white rounded-xl p-8 border border-zinc-100">
                <div className="w-8 h-8 bg-zinc-900 rounded-lg mb-5" />
                <h3 className="font-semibold text-lg mb-3">{p.title}</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section id="sectors" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-3">
            Sector Specialisation
          </p>
          <h2 className="text-3xl font-bold mb-12">Industries We Serve</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sectors.map((s) => (
              <div
                key={s}
                className="border border-zinc-100 rounded-xl px-5 py-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-6 bg-zinc-900 text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <h2 className="text-3xl font-bold mb-3">Ready to Build Your Team?</h2>
            <p className="text-zinc-400 text-sm">
              Reach out and a talent architect will respond within 24 hours.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <a href="mailto:contact@infinitypsr.com" className="text-zinc-300 hover:text-white transition-colors">
              contact@infinitypsr.com
            </a>
            <a href="tel:+1234567890" className="text-zinc-300 hover:text-white transition-colors">
              +1 (234) 567-890
            </a>
          </div>
        </div>
      </section>

      <footer className="py-6 px-6 border-t border-zinc-100 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} INFINITY PSR. All rights reserved.
      </footer>
    </div>
  );
}
