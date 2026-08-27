import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { UnderstandingMap } from "@/components/understanding-map";
import type { Claim } from "@/core/types";

export const metadata: Metadata = {
  title: "Methodology · Debrief",
  description:
    "How Debrief works: the teach-back loop, the understanding map, the claim states, and the model-plus-reducer pipeline behind it.",
};

// A frozen sample map — the closures debrief mid-session, one claim fractured —
// so the methodology page shows the real component, not a picture of one.
const SAMPLE_CLAIMS: Claim[] = [
  {
    id: "c1",
    sourceClaimId: "c1",
    claimText: "A closure retains access to the variables in its surrounding scope.",
    shortLabel: "Retains surrounding scope",
    whyItMatters: "",
    state: "solid",
    rationale: null,
    evidenceQuote: null,
    focusOrder: 0,
  },
  {
    id: "c2",
    sourceClaimId: "c2",
    claimText: "A closure captures the variable itself, not a value copied at creation time.",
    shortLabel: "Captures the variable, not a copy",
    whyItMatters: "",
    state: "needs_attention",
    rationale: null,
    evidenceQuote: "it saves whatever the value was when the function was made",
    focusOrder: 1,
  },
  {
    id: "c3",
    sourceClaimId: "c3",
    claimText: "Each closure keeps its own independent environment.",
    shortLabel: "Each keeps its own environment",
    whyItMatters: "",
    state: "unclear",
    rationale: null,
    evidenceQuote: null,
    focusOrder: 2,
  },
  {
    id: "c4",
    sourceClaimId: "c4",
    claimText: "Closures are what make callbacks and event handlers remember their setup.",
    shortLabel: "Powers callbacks & handlers",
    whyItMatters: "",
    state: "untested",
    rationale: null,
    evidenceQuote: null,
    focusOrder: 3,
  },
];

const LOOP = [
  {
    n: "01",
    name: "Explain",
    accent: false,
    body: "You write the idea from memory, in your own words. Retrieval practice — no notes, no multiple choice. The act of producing it is where the learning starts.",
  },
  {
    n: "02",
    name: "Probe",
    accent: false,
    body: "Debrief maps the claims your explanation must carry, judges each, and asks one curious question aimed at the single weakest point.",
  },
  {
    n: "03",
    name: "Reveal",
    accent: true,
    body: "It shows the exact sentence where your reasoning stops holding, with a short, just-in-time correction — the fracture, made visible.",
  },
  {
    n: "04",
    name: "Repair",
    accent: false,
    body: "You use the corrected idea in a new situation. Application, not repetition, so the fix becomes something you can transfer.",
  },
] as const;

const STATES = [
  { word: "solid", tone: "text-ivory-dim", body: "Clearly and correctly explained. The stratum is dense; the beam passes clean." },
  { word: "unclear", tone: "text-muted-ink", body: "Mentioned, but vague or partial. The band is porous — the light diffuses." },
  { word: "needs attention", tone: "text-amber", body: "The explanation contradicts the claim. The beam refracts: the amber fracture." },
  { word: "not reached", tone: "text-ghost", body: "Never addressed. A faint, dotted trace the beam hasn't arrived at yet." },
] as const;

const PIPELINE = [
  { fn: "decomposeAndEvaluate", out: "claims + states", tag: "flagship" },
  { fn: "selectFocusClaim", out: "the weakest point", tag: "reducer" },
  { fn: "generateProbe", out: "one curious question", tag: "fast" },
  { fn: "evaluateFocusAnswer", out: "re-judged claim", tag: "flagship" },
  { fn: "generateTeaching", out: "the distinction", tag: "fast" },
  { fn: "generateRepair", out: "apply it anew", tag: "fast" },
] as const;

export default function MethodologyPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        {/* ---- hero ---- */}
        <section className="relative overflow-hidden border-b border-line pt-24 pb-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-grid-pattern gradient-mask-b"
          />
          <div className="relative mx-auto max-w-4xl px-6">
            <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
              Methodology
            </p>
            <h1 className="mt-6 max-w-3xl font-serif text-[clamp(2.5rem,5.5vw,4rem)] leading-[1.06] tracking-[-0.02em] text-ivory">
              A guided loop, and the <em className="italic text-amber">machine</em> behind it.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ivory-dim">
              Debrief is not an evaluation tool with a score at the end. It is a
              learning loop grounded in retrieval practice and generative
              learning: explain, find the break, teach to it, apply the fix.
            </p>
          </div>
        </section>

        {/* ---- the loop ---- */}
        <section className="mx-auto w-full max-w-6xl px-6 py-24">
          <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
            The loop
          </p>
          {/* the beam the four steps sit on */}
          <div className="relative mt-14 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-4">
            <span
              aria-hidden="true"
              className="absolute top-[7px] right-0 left-0 hidden h-px bg-line-strong md:block"
            />
            {LOOP.map((step) => (
              <div key={step.n} className="relative flex flex-col">
                <span
                  aria-hidden="true"
                  className={`relative z-10 size-3.5 bg-obsidian ${
                    step.accent ? "outline outline-1 outline-offset-2 outline-amber" : ""
                  }`}
                >
                  <span
                    className={`block size-3.5 ${step.accent ? "bg-amber" : "bg-ivory"}`}
                  />
                </span>
                <span className="mt-6 font-mono text-xs text-ghost">{step.n}</span>
                <h2
                  className={`mt-2 font-serif text-2xl tracking-tight ${
                    step.accent ? "text-amber" : "text-ivory"
                  }`}
                >
                  {step.name}
                </h2>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ivory-dim">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---- the understanding map, live ---- */}
        <section className="border-t border-line">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-14 px-6 py-24 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="max-w-xl">
              <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
                The understanding map
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-snug tracking-tight text-ivory">
                Understanding as a beam through the strata of an explanation.
              </h2>
              <div className="mt-6 flex flex-col gap-4 text-[0.95rem] leading-relaxed text-ivory-dim">
                <p>
                  Every concept decomposes into the claims a complete explanation
                  must carry. Each claim is a stratum; a single beam threads them
                  top to bottom. Its state at each crossing is what your
                  explanation is actually holding — clean, porous, fractured, or
                  not yet reached.
                </p>
                <p>
                  The map is driven entirely by the session state. It is
                  read-only: it never asks for input, it just shows, at a glance,
                  where the understanding is load-bearing and where it breaks. To
                  the right is a real closures debrief, mid-session, with one
                  claim fractured.
                </p>
              </div>
            </div>
            <div className="border border-line bg-surface-lowest p-7">
              <UnderstandingMap
                variant="rail"
                conceptTitle="Closures"
                claims={SAMPLE_CLAIMS}
                focusClaimId="c2"
              />
            </div>
          </div>
        </section>

        {/* ---- the four states ---- */}
        <section className="border-t border-line">
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
              What a claim can be
            </p>
            <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {STATES.map((s) => (
                <div key={s.word}>
                  <span
                    className={`font-mono text-[0.7rem] tracking-[0.16em] uppercase ${s.tone}`}
                  >
                    {s.word}
                  </span>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-ivory-dim">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- the machine ---- */}
        <section className="border-t border-line">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-14 px-6 py-24 lg:grid-cols-[24rem_minmax(0,1fr)] lg:items-center">
            <div className="order-2 max-w-xl lg:order-1">
              <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
                The machine
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-snug tracking-tight text-ivory">
                The model proposes. The reducer decides.
              </h2>
              <div className="mt-6 flex flex-col gap-4 text-[0.95rem] leading-relaxed text-ivory-dim">
                <p>
                  Each turn runs a narrow model call, validates the response
                  against a strict schema, then hands the result to a pure state
                  machine that owns every transition. The model never drives the
                  session directly — it only supplies judgments the reducer chooses
                  to act on.
                </p>
                <p>
                  Teaching is anchored on curated notes, so the model adapts
                  wording but cannot invent a wrong correction. When a call fails
                  validation, the turn falls back to authored content rather than
                  faking a judgment.
                </p>
              </div>
            </div>

            {/* the pipeline, as a session log */}
            <div className="order-1 border border-line bg-surface-lowest p-5 lg:order-2">
              <div className="mb-4 flex items-center justify-between border-b border-line pb-2.5">
                <span className="font-mono text-xs text-muted-ink">debrief.pipeline</span>
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="size-1.5 bg-line-strong" />
                  <span className="size-1.5 bg-line-strong" />
                  <span className="size-1.5 bg-line-strong" />
                </div>
              </div>
              <ul className="flex list-none flex-col gap-3 p-0 font-mono text-xs">
                {PIPELINE.map((p) => (
                  <li key={p.fn} className="flex items-center gap-3">
                    <span className="text-ivory">{p.fn}</span>
                    <span className="h-px flex-1 bg-line" aria-hidden="true" />
                    <span className="text-muted-ink">{p.out}</span>
                    <span
                      className={`w-16 shrink-0 text-right tracking-[0.12em] uppercase ${
                        p.tag === "reducer" ? "text-amber" : "text-ghost"
                      }`}
                    >
                      {p.tag}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-line pt-4 font-mono text-[0.7rem] leading-relaxed text-muted-ink">
                &gt; every response is schema-validated; the pure reducer is the
                single source of truth for stage, focus, and verdict.
              </p>
            </div>
          </div>
        </section>

        {/* ---- grounding ---- */}
        <section className="border-t border-line">
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
              Grounded in
            </p>
            <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-2">
              <div className="border-t border-line-strong pt-5">
                <h3 className="font-serif text-2xl tracking-tight text-ivory">
                  Retrieval practice
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ivory-dim">
                  Recalling from memory, then checking against the source, beats
                  rereading. Debrief begins with explanation from memory and ends
                  the repair round with application, not a restated definition.
                </p>
              </div>
              <div className="border-t border-line-strong pt-5">
                <h3 className="font-serif text-2xl tracking-tight text-ivory">
                  Generative learning
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ivory-dim">
                  Explaining, visualizing, and applying are complementary
                  sense-making modes. Debrief sequences all three: the explanation,
                  the understanding map, and the applied repair.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---- CTA ---- */}
        <section className="border-t border-line">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-6 py-24 md:flex-row md:items-center md:justify-between">
            <h2 className="max-w-lg font-serif text-3xl leading-snug tracking-tight text-ivory">
              See the loop close on something you know.
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
