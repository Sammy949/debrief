import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "About · Debrief",
  description:
    "Debrief is a teach-back tool: explain a concept in your own words and see exactly where your understanding stops holding.",
};

const PRINCIPLES = [
  {
    n: "01",
    title: "Explaining reveals the gaps",
    body: "Rereading feels like learning but hides what you don't know. Producing an explanation from memory forces the gaps into the open, where they can be fixed.",
    kind: "solid",
  },
  {
    n: "02",
    title: "Diagnose, then teach",
    body: "A grade tells you nothing you can act on. Debrief finds the one sentence where your reasoning breaks, then teaches to that exact point, not the whole topic.",
    kind: "fracture",
  },
  {
    n: "03",
    title: "Understanding is a thing you watch move",
    body: "Every claim your explanation carries has a state. As you answer, you watch it shift from unclear to solid. Progress you can see, not a score you're handed.",
    kind: "beam",
  },
] as const;

/** A load-path that carries, then breaks — the signature fracture, drawn large. */
function FractureGraphic() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center border border-line bg-surface-lowest p-12"
    >
      <span className="flex flex-col gap-8">
        <span className="flex items-center gap-3">
          <span className="h-[3px] w-24 bg-ivory-dim" />
          <span className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-muted-ink">
            holds
          </span>
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center">
            <span className="beam-fracture h-[3px] w-11 -translate-y-1 bg-amber" />
            <span className="w-3" />
            <span className="beam-fracture h-[3px] w-11 translate-y-1 bg-amber" />
          </span>
          <span className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-amber">
            breaks
          </span>
        </span>
        <span className="flex items-center gap-3">
          <span className="w-24 border-t border-dotted border-ghost" />
          <span className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-ghost">
            not reached
          </span>
        </span>
      </span>
    </div>
  );
}

/** The tiny per-principle mark. */
function PrincipleMark({ kind }: { kind: "solid" | "fracture" | "beam" }) {
  if (kind === "fracture") {
    return (
      <span className="flex h-3 items-center" aria-hidden="true">
        <span className="beam-fracture h-[2px] w-6 -translate-y-[3px] bg-amber" />
        <span className="w-2" />
        <span className="beam-fracture h-[2px] w-6 translate-y-[3px] bg-amber" />
      </span>
    );
  }
  if (kind === "beam") {
    return (
      <span className="flex h-3 items-center gap-1.5" aria-hidden="true">
        <span className="size-2 bg-ivory" />
        <span className="size-1.5 bg-muted-ink" />
        <span className="size-2 border border-ghost" />
      </span>
    );
  }
  return (
    <span className="flex h-3 items-center" aria-hidden="true">
      <span className="h-[3px] w-14 bg-ivory-dim" />
    </span>
  );
}

export default function AboutPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        {/* ---- statement hero ---- */}
        <section className="relative overflow-hidden border-b border-line pt-24 pb-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-grid-pattern gradient-mask-b"
          />
          <div className="relative mx-auto max-w-4xl px-6">
            <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
              About Debrief
            </p>
            <h1 className="mt-6 max-w-3xl font-serif text-[clamp(2.5rem,5.5vw,4rem)] leading-[1.06] tracking-[-0.02em] text-ivory">
              You don&apos;t really know it until your explanation{" "}
              <em className="italic text-amber">survives a question.</em>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ivory-dim">
              Debrief is a teach-back tool. Instead of grading you, it acts like
              a sharp, curious friend: you explain something out loud, and it
              finds the one spot where your understanding gives way. Then it helps
              you fix it.
            </p>
          </div>
        </section>

        {/* ---- the idea ---- */}
        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-6 py-24 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
          <div className="max-w-xl">
            <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
              The idea
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-snug tracking-tight text-ivory">
              Learning happens when you generate, not when you review.
            </h2>
            <div className="mt-6 flex flex-col gap-4 text-[0.95rem] leading-relaxed text-ivory-dim">
              <p>
                Decades of research on retrieval practice and generative learning
                point the same way: you learn by pulling an idea out of your own
                head and putting it into words, then checking it against reality.
                Not by reading it one more time.
              </p>
              <p>
                Debrief is built as that loop. It asks you to explain from memory,
                reveals a specific gap instead of a grade, gives just enough
                instruction to close it, and asks you to use the repaired idea in
                a new situation. Diagnosis and teaching stay separate, so you
                never leave with only a judgment.
              </p>
            </div>
          </div>
          <FractureGraphic />
        </section>

        {/* ---- principles ---- */}
        <section className="border-t border-line">
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
              What Debrief believes
            </p>
            <div className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-3">
              {PRINCIPLES.map((p) => (
                <div key={p.n} className="flex flex-col">
                  <span className="font-mono text-xs text-ghost">{p.n}</span>
                  <div className="mt-4">
                    <PrincipleMark kind={p.kind} />
                  </div>
                  <h3 className="mt-5 font-serif text-2xl leading-snug tracking-tight text-ivory">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-ivory-dim">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- pull statement ---- */}
        <section className="border-t border-line">
          <div className="mx-auto w-full max-w-4xl px-6 py-28">
            <p className="font-serif text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.2] tracking-tight text-ivory-dim">
              Most tools tell you whether you were right. Debrief shows you{" "}
              <span className="text-ivory">where you stopped being sure</span>, and
              stays with you until the explanation holds.
            </p>
          </div>
        </section>

        {/* ---- CTA ---- */}
        <section className="border-t border-line">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-6 py-24 md:flex-row md:items-center md:justify-between">
            <h2 className="max-w-lg font-serif text-3xl leading-snug tracking-tight text-ivory">
              Find the edge of what you know.
            </h2>
            <Link
              href="/debrief/new"
              className="group inline-flex shrink-0 items-center gap-2.5 bg-ivory px-7 py-3.5 font-medium text-obsidian transition-colors hover:bg-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
            >
              Start a debrief
              <ArrowUpRight
                weight="bold"
                className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
