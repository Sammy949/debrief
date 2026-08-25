import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

const STAGES = [
  { name: "Explain", copy: "Say it in your own words, from memory.", accent: false },
  { name: "Probe", copy: "One curious question, aimed at the weakest point.", accent: false },
  { name: "Reveal", copy: "The exact sentence where your reasoning stops holding.", accent: true },
  { name: "Repair", copy: "A small correction, then you use it where it changed.", accent: false },
];

/** The signature mark: a load-path that carries, then fractures. */
function FractureMark() {
  return (
    <span className="flex items-center" aria-hidden="true">
      <span className="h-[3px] w-28 rounded-full bg-ink" />
      <span className="ml-2.5 h-[3px] w-10 -translate-y-1 rounded-full bg-sienna-deep" />
      <span className="ml-2.5 h-[3px] w-16 translate-y-1 rounded-full bg-sienna-deep" />
    </span>
  );
}

export default function Home() {
  return (
    <>
      <header className="mx-auto flex w-full max-w-6xl items-center px-6 py-6">
        <Link
          href="/"
          className="font-heading text-lg font-bold tracking-tight text-ink"
        >
          Debrief
        </Link>
      </header>

      <main className="flex flex-1 flex-col">
        {/* ---- hero: editorial, off-axis, over a living paper-shader field ---- */}
        <section className="relative isolate flex min-h-[80vh] items-center overflow-hidden">
          <div className="hero-atmos absolute inset-0 z-0" aria-hidden="true" />
          {/* feather the shader into the paper below — no hard seam */}
          <div
            className="absolute inset-x-0 bottom-0 z-0 h-40 bg-gradient-to-b from-transparent to-paper"
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24">
            <div className="max-w-[40rem]">
              <h1 className="text-balance font-heading text-[clamp(2rem,4.6vw,3rem)] font-bold leading-[1.1] tracking-tight text-ink">
                Understanding isn&apos;t real until the explanation{" "}
                <em className="font-medium italic text-sienna-deep">
                  survives one more question.
                </em>
              </h1>

              <div className="mt-8">
                <FractureMark />
              </div>

              <p className="mt-8 max-w-[30rem] text-lg leading-relaxed text-ink-soft">
                Explain a concept in your own words. Debrief maps what you&apos;re
                carrying, probes the weakest point, and shows you the exact
                sentence where it stops holding.
              </p>

              <div className="mt-10">
                <Link
                  href="/lessons"
                  className="group inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-base font-medium text-paper transition-colors hover:bg-sienna-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sienna"
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
        <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
          <p className="text-sm font-medium text-ink-soft">The loop</p>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {STAGES.map((s) => (
              <div key={s.name}>
                <h2
                  className={`font-heading text-xl font-bold tracking-tight ${
                    s.accent ? "text-sienna-deep" : "text-ink"
                  }`}
                >
                  {s.name}
                </h2>
                <span
                  className={`mt-3 block h-[2px] w-10 rounded-full ${
                    s.accent ? "bg-sienna-deep" : "bg-ink"
                  }`}
                  aria-hidden="true"
                />
                <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">
                  {s.copy}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ---- footer ---- */}
        <footer className="mx-auto w-full max-w-6xl border-t border-paper-deep px-6 py-12">
          <p className="font-heading text-lg font-medium text-ink">
            Don&apos;t just learn it. Debrief it.
          </p>
          <p className="mt-2 text-sm text-ink-untested">
            Debrief · a teach-back tool for real understanding
          </p>
        </footer>
      </main>
    </>
  );
}
