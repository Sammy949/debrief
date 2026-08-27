import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Library · Debrief",
  description: "Curated debriefs, being built. Start an open debrief on anything in the meantime.",
};

const UPCOMING = [
  { title: "Closures", note: "What a function remembers, and why it changes." },
  { title: "Async requests", note: "What actually happens while you wait." },
  { title: "Database indexes", note: "Why a lookup gets faster — and what it costs." },
];

export default function LessonsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-24">
        <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
          The library
        </p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight tracking-tight text-ivory sm:text-5xl">
          Curated debriefs are on the way.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ivory-dim">
          We&apos;re writing a set of hand-built debriefs, each mapped claim by claim.
          Until they land, you don&apos;t have to wait — bring any concept you like and
          debrief it now.
        </p>

        <div className="mt-6">
          <Link
            href="/debrief/new"
            className="group inline-flex items-center gap-2.5 bg-ivory px-6 py-3 font-medium text-obsidian transition-colors hover:bg-amber"
          >
            Debrief anything
            <ArrowUpRight
              weight="bold"
              className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {/* what's coming — an honest empty state, not fake-clickable cards */}
        <div className="mt-16">
          <p className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-ghost">
            In progress
          </p>
          <ul className="mt-6 grid list-none gap-6 p-0 md:grid-cols-3">
            {UPCOMING.map((l) => (
              <li key={l.title} className="border border-line bg-surface-lowest p-6">
                <span className="block h-[3px] w-10 bg-line-strong" aria-hidden="true" />
                <h2 className="mt-5 font-serif text-2xl tracking-tight text-ivory-dim">{l.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-ink">{l.note}</p>
                <span className="mt-6 inline-block font-mono text-[0.6rem] tracking-[0.16em] uppercase text-ghost">
                  Being built
                </span>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
