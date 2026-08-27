import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/** The state of a stratum in the map-preview card. */
const PREVIEW_STRATA = [
  { label: "What an index is", state: "solid" },
  { label: "Why lookups get faster", state: "needs_attention" },
  { label: "The write-time cost", state: "untested" },
] as const;

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        {/* ---- hero: editorial split over a fading drafting grid ---- */}
        <section className="relative overflow-hidden border-b border-line pt-28 pb-24">
          {/* background grid on its own layer, faded downward; content stays at full opacity */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-grid-pattern gradient-mask-b"
          />
          <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-x-12 gap-y-16 px-6 md:grid-cols-12">
            {/* left: the pitch */}
            <div className="flex flex-col gap-8 md:col-span-6">
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

              <p className="max-w-md text-lg leading-relaxed text-ivory-dim">
                Pick something you think you understand and explain it in your own
                words. Debrief finds the exact point where your explanation breaks,
                then helps you repair it.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/debrief/new"
                  className="inline-flex items-center bg-ivory px-7 py-3 font-medium text-obsidian transition-colors hover:bg-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
                >
                  Start a Session
                </Link>
                <Link
                  href="/methodology"
                  className="inline-flex items-center border border-line px-7 py-3 font-medium text-ivory transition-colors hover:bg-surface-high"
                >
                  How it works
                </Link>
              </div>
            </div>

            {/* right: two layered artifacts: the prompt, and the map it produces */}
            <div className="md:col-span-6">
              <HeroArtifacts />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

const STATE_TONE: Record<string, string> = {
  solid: "text-ivory-dim",
  needs_attention: "text-amber",
  untested: "text-ghost",
};
const STATE_WORD: Record<string, string> = {
  solid: "solid",
  needs_attention: "needs attention",
  untested: "not reached",
};

/** The two stacked cards: the teach-back prompt lying over the map it produces. */
function HeroArtifacts() {
  return (
    <div className="relative mx-auto max-w-md pt-10 pb-16 md:pb-10">
      {/* back card: the understanding map the session builds */}
      <div className="ml-auto w-[82%] border border-line bg-surface-lowest p-5">
        <div className="mb-4 flex items-center justify-between border-b border-line pb-2.5">
          <span className="font-mono text-xs text-muted-ink">understanding.map</span>
          <span className="size-1.5 bg-amber" aria-hidden="true" />
        </div>
        <p className="mb-5 font-serif text-lg leading-snug text-ivory">Database indexes</p>
        <ul className="flex list-none flex-col gap-4 p-0">
          {PREVIEW_STRATA.map((s) => (
            <li key={s.label} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-ivory-dim">{s.label}</span>
                <span
                  className={`shrink-0 font-mono text-[0.6rem] tracking-[0.12em] uppercase ${STATE_TONE[s.state]}`}
                >
                  {STATE_WORD[s.state]}
                </span>
              </div>
              {s.state === "needs_attention" ? (
                <span className="flex h-2 items-center" aria-hidden="true">
                  <span className="beam-fracture h-[2px] w-2/5 -translate-y-[3px] bg-amber" />
                  <span className="w-3" />
                  <span className="beam-fracture h-[2px] w-2/5 translate-y-[3px] bg-amber" />
                </span>
              ) : s.state === "untested" ? (
                <span className="w-2/3 border-t border-dotted border-ghost" aria-hidden="true" />
              ) : (
                <span className="h-[3px] w-full bg-ivory-dim" aria-hidden="true" />
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* front card: the teach-back prompt, offset to overlap the map below-left */}
      <div className="relative -mt-16 mr-auto w-[86%] border border-line bg-surface p-5 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.95)]">
        <div className="mb-3 flex items-center justify-between border-b border-line pb-2.5">
          <span className="font-mono text-xs text-muted-ink">session_042.log</span>
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-1.5 bg-line-strong" />
            <span className="size-1.5 bg-line-strong" />
            <span className="size-1.5 bg-line-strong" />
          </div>
        </div>
        <p className="mb-4 font-serif text-xl leading-snug text-ivory">
          Explain how a database index makes a lookup faster.
        </p>
        <div className="border border-line bg-surface-lowest p-3">
          <p className="font-mono text-xs leading-relaxed text-muted-ink">
            &gt; It keeps a sorted copy of the column, so the database can jump
            straight to the row instead of scanning every…
          </p>
          <div className="mt-3 h-px w-full animate-pulse bg-amber opacity-60" />
        </div>
      </div>
    </div>
  );
}
