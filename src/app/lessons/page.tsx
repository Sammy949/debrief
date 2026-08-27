import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LESSONS } from "@/core/fixtures";

export const metadata: Metadata = {
  title: "Library · Debrief",
  description: "Curated debriefs to start from, or bring your own concept.",
};

export default function LessonsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-24">
        <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
          The library
        </p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight tracking-tight text-ivory sm:text-5xl">
          Start with one of ours.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ivory-dim">
          Each of these is mapped claim by claim, so a good place to feel how a debrief
          works. Or skip the list and bring your own.
        </p>

        {/* curated, runnable lessons */}
        <ul className="mt-14 grid list-none gap-6 p-0 md:grid-cols-3">
          {LESSONS.map((lesson) => (
            <li key={lesson.slug}>
              <Link
                href={`/debrief/${lesson.slug}`}
                className="group flex h-full flex-col border border-line bg-surface-lowest p-6 transition-colors hover:border-line-strong"
              >
                <span className="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-muted-ink">
                  {lesson.difficulty}
                </span>
                <h2 className="mt-4 font-serif text-2xl tracking-tight text-ivory">{lesson.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ivory-dim">
                  {lesson.objective}
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 font-mono text-[0.65rem] tracking-[0.16em] uppercase text-amber">
                  Start
                  <ArrowRight
                    weight="bold"
                    className="size-3 transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* bring your own */}
        <div className="mt-14 flex flex-col items-start gap-5 border-t border-line pt-10 md:flex-row md:items-center md:justify-between">
          <p className="max-w-md font-serif text-2xl leading-snug tracking-tight text-ivory-dim">
            Something not on the list? Debrief it anyway.
          </p>
          <Link
            href="/debrief/new"
            className="group inline-flex shrink-0 items-center gap-2.5 bg-ivory px-6 py-3 font-medium text-obsidian transition-colors hover:bg-amber"
          >
            Debrief anything
            <ArrowUpRight
              weight="bold"
              className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
