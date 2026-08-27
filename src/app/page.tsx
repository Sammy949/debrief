import Link from "next/link";
import { Brain, MagnifyingGlass, ArrowRight } from "@phosphor-icons/react/dist/ssr";

const NAV = [
  { label: "Methodology", href: "#methodology", active: true },
  { label: "Library", href: "/lessons", active: false },
  { label: "Pricing", href: "#pricing", active: false },
  { label: "About", href: "#about", active: false },
];

const FOOTER_LINKS = [
  "Documentation",
  "Privacy Policy",
  "Terms of Service",
  "API Reference",
  "Status",
];

export default function Home() {
  return (
    <>
      {/* ---- top nav ---- */}
      <header className="sticky top-0 z-50 border-b border-line bg-obsidian">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Brain weight="duotone" className="size-5 text-amber" />
            <span className="font-serif text-2xl tracking-tight text-ivory">Debrief</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={
                  item.active
                    ? "border-b border-ivory pb-1 text-sm text-ivory"
                    : "pb-1 text-sm text-muted-ink transition-colors hover:text-ivory"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <form
              action="/lessons"
              className="hidden items-center gap-2 border border-line px-3 py-1.5 transition-colors focus-within:border-amber md:flex"
            >
              <MagnifyingGlass className="size-4 text-muted-ink" aria-hidden="true" />
              <input
                name="q"
                placeholder="Search…"
                aria-label="Search the library"
                className="w-28 bg-transparent text-sm text-ivory placeholder:text-muted-ink focus:outline-none"
              />
            </form>
            <Link
              href="/debrief/new"
              className="inline-flex items-center gap-2 bg-ivory px-4 py-2 font-mono text-[0.7rem] font-medium tracking-[0.14em] uppercase text-obsidian transition-colors hover:bg-amber"
            >
              Get Started
              <ArrowRight weight="bold" className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* ---- hero: editorial split over a fading drafting grid ---- */}
        <section className="relative overflow-hidden border-b border-line bg-grid-pattern pt-28 pb-24 gradient-mask-b">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-12">
            {/* left: the pitch */}
            <div className="flex flex-col gap-8 md:col-span-7">
              <div className="inline-flex w-fit items-center gap-2.5 border border-line bg-surface-lowest px-3 py-1.5">
                <span className="size-1.5 bg-amber" aria-hidden="true" />
                <span className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-ivory-dim">
                  The Teach-Back Method
                </span>
              </div>

              <h1 className="font-serif text-[clamp(2.75rem,6vw,4.25rem)] leading-[1.08] tracking-[-0.02em] text-ivory">
                Make your <br />
                <em className="italic text-amber">understanding</em> <br />
                visible.
              </h1>

              <p className="max-w-xl text-lg leading-relaxed text-ivory-dim">
                A strict, editorial environment for high-cognitive consolidation.
                Articulate complex concepts, receive surgical feedback, and forge
                robust mental models through the act of teaching.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/debrief/new"
                  className="inline-flex items-center bg-ivory px-7 py-3 font-medium text-obsidian transition-colors hover:bg-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
                >
                  Start a Session
                </Link>
                <Link
                  href="#methodology"
                  className="inline-flex items-center border border-line px-7 py-3 font-medium text-ivory transition-colors hover:bg-surface-high"
                >
                  Read the Manifesto
                </Link>
              </div>
            </div>

            {/* right: the teach-back prompt, as a session log */}
            <div className="relative flex items-center justify-center md:col-span-5">
              <span
                aria-hidden="true"
                className="orbit-slow pointer-events-none absolute -right-16 -bottom-16 size-64 rounded-full border border-dashed border-line opacity-25"
              />
              <div className="relative z-10 w-full max-w-md rotate-2 border border-line bg-surface-lowest p-4 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.9)] transition-transform duration-500 hover:rotate-0">
                <div className="mb-3 flex items-center justify-between border-b border-line pb-2.5">
                  <span className="font-mono text-xs text-muted-ink">session_042.log</span>
                  <div className="flex gap-1.5" aria-hidden="true">
                    <span className="size-1.5 bg-line-strong" />
                    <span className="size-1.5 bg-line-strong" />
                    <span className="size-1.5 bg-line-strong" />
                  </div>
                </div>
                <p className="mb-4 font-serif text-xl leading-snug text-ivory">
                  Explain &lsquo;Quantum Entanglement&rsquo; as if to a fellow
                  physicist.
                </p>
                <div className="border border-line bg-surface p-3">
                  <p className="font-mono text-xs leading-relaxed text-muted-ink">
                    &gt; It&apos;s a physical phenomenon that occurs when a group
                    of particles are generated, interact, or share spatial
                    proximity…
                  </p>
                  <div className="mt-3 h-px w-full animate-pulse bg-amber opacity-60" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---- footer ---- */}
      <footer className="mt-auto border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 px-6 py-16 md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <span className="font-serif text-2xl text-ivory">Debrief</span>
            <span className="text-sm text-muted-ink">
              © 2026 Debrief Technical Systems.
            </span>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-3">
            {FOOTER_LINKS.map((label) => (
              <a
                key={label}
                href="#"
                className="text-sm text-muted-ink underline decoration-1 underline-offset-4 transition-colors hover:text-ivory"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}
