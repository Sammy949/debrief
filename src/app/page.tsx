import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

const STAGES = [
  { name: "Explain", copy: "Say it in your own words, from memory.", accent: false },
  { name: "Probe", copy: "One curious question, aimed at the weakest point.", accent: false },
  { name: "Reveal", copy: "The exact sentence where your reasoning stops holding.", accent: true },
  { name: "Repair", copy: "A small correction, then you use it where it changed.", accent: false },
];

/**
 * The signature: a single beam of understanding descending through the strata of an
 * explanation. Solid strata pass it clean; the fractured one splits it (the amber break);
 * the faint stratum below is not yet reached. Static structure, one slow reduced-motion-safe
 * scan. Previews the live Understanding Map.
 */
function SignatureBeam() {
  const strata = [
    { label: "premise", state: "solid" },
    { label: "mechanism", state: "solid" },
    { label: "the claim under load", state: "fracture" },
    { label: "consequence", state: "faint" },
  ] as const;

  return (
    <div
      aria-hidden="true"
      className="relative hidden select-none sm:block"
      style={{ ["--beam-x" as string]: "1.5rem" }}
    >
      {/* the beam: a hairline that scans slowly, gated by reduced-motion */}
      <span className="beam-scan absolute top-0 bottom-0 left-[var(--beam-x)] w-px -translate-x-1/2 bg-line-strong" />
      <ul className="flex list-none flex-col gap-9 p-0">
        {strata.map((s) => (
          <li key={s.label} className="relative flex items-center gap-4">
            {s.state === "fracture" ? (
              <span className="relative left-[var(--beam-x)] flex -translate-x-1/2 items-center">
                <span className="h-px w-6 -translate-y-[3px] bg-amber" />
                <span className="h-px w-6 translate-y-[3px] bg-amber" />
              </span>
            ) : (
              <span
                className={`relative left-[var(--beam-x)] block h-px -translate-x-1/2 ${
                  s.state === "faint" ? "w-10 bg-ghost" : "w-12 bg-ivory-dim"
                }`}
              />
            )}
            <span
              className={`ml-6 font-mono text-[0.6rem] tracking-[0.18em] uppercase ${
                s.state === "fracture"
                  ? "text-amber"
                  : s.state === "faint"
                    ? "text-ghost"
                    : "text-muted-ink"
              }`}
            >
              {s.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-serif text-xl tracking-tight text-ivory">
          Debrief
        </Link>
        <Link
          href="/debrief/new"
          className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-muted-ink transition-colors hover:text-ivory"
        >
          Start a debrief
        </Link>
      </header>

      <main className="flex flex-1 flex-col">
        {/* ---- hero: editorial, marginalia beam on the left, one clear action ---- */}
        <section className="flex min-h-[82vh] items-center border-b border-line">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-x-16 gap-y-12 px-6 py-24 lg:grid-cols-[14rem_minmax(0,1fr)]">
            <SignatureBeam />

            <div className="max-w-[36rem]">
              <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
                The teach-back method
              </p>

              <h1 className="mt-6 font-serif text-[clamp(2.75rem,6vw,4.5rem)] leading-[1.05] tracking-[-0.01em] text-ivory">
                Make your{" "}
                <em className="italic text-amber">understanding</em> visible.
              </h1>

              <p className="mt-8 max-w-[30rem] text-lg leading-relaxed text-ivory-dim">
                Explain a concept in your own words. Debrief maps what
                you&apos;re carrying, probes the weakest point, and shows you the
                exact sentence where it stops holding.
              </p>

              <div className="mt-10">
                <Link
                  href="/debrief/new"
                  className="group inline-flex items-center gap-2.5 bg-ivory px-7 py-3.5 text-base font-medium text-obsidian transition-colors hover:bg-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
                >
                  Start a debrief
                  <ArrowUpRight
                    weight="bold"
                    className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ---- how it works: the loop, terse ---- */}
        <section className="mx-auto w-full max-w-6xl px-6 py-24">
          <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
            The loop
          </p>
          <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {STAGES.map((s) => (
              <div key={s.name}>
                <span
                  className={`block h-px w-full ${s.accent ? "bg-amber" : "bg-line-strong"}`}
                  aria-hidden="true"
                />
                <h2
                  className={`mt-5 font-serif text-2xl tracking-tight ${
                    s.accent ? "text-amber" : "text-ivory"
                  }`}
                >
                  {s.name}
                </h2>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ivory-dim">
                  {s.copy}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ---- footer: the signature wordmark, anchored flush to the bottom edge ---- */}
        <footer className="mt-auto border-t border-line">
          <div className="mx-auto w-full max-w-6xl px-6 pt-16">
            <p className="max-w-md font-serif text-xl leading-snug text-ivory-dim">
              Don&apos;t just learn it.{" "}
              <span className="text-ivory">Debrief it.</span>
            </p>
          </div>
          <div className="mt-12 overflow-hidden">
            <p
              className="mx-auto max-w-6xl translate-y-[0.12em] px-6 font-serif text-[clamp(4rem,19vw,16rem)] leading-none tracking-[-0.02em] text-surface-high"
              aria-hidden="true"
            >
              Debrief
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
