import Link from "next/link";

const LINKS = [
  { label: "Methodology", href: "/methodology" },
  { label: "Library", href: "/lessons" },
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 px-6 py-14 md:flex-row md:items-end">
        <div className="flex flex-col gap-3">
          <span className="font-serif text-2xl text-ivory">Debrief</span>
          <span className="max-w-xs text-sm leading-relaxed text-muted-ink">
            Don&apos;t just learn it. Debrief it.
          </span>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <nav className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm text-muted-ink transition-colors hover:text-ivory"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <span className="font-mono text-[0.7rem] tracking-wide text-ghost">© 2026 Debrief</span>
        </div>
      </div>
    </footer>
  );
}
