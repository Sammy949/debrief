import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

export interface LegalSection {
  heading: string;
  body: ReactNode;
}

/** Shared shell for the policy pages: editorial, quiet, one reading column. */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-muted-ink transition-colors hover:text-ivory">
            <ArrowLeft weight="bold" className="size-4" />
            <span className="font-mono text-[0.7rem] tracking-[0.16em] uppercase">Back</span>
          </Link>
          <Link href="/" className="font-serif text-xl tracking-tight text-ivory">
            Debrief
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-20">
        <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
          Last updated {updated}
        </p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ivory sm:text-5xl">{title}</h1>
        <p className="mt-6 text-lg leading-relaxed text-ivory-dim">{intro}</p>

        <div className="mt-14 flex flex-col gap-12">
          {sections.map((s, i) => (
            <section key={s.heading}>
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-xs text-ghost">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-serif text-2xl tracking-tight text-ivory">{s.heading}</h2>
              </div>
              <div className="mt-4 pl-9 text-[0.95rem] leading-relaxed text-ivory-dim">{s.body}</div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
