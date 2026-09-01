# Debrief

**Don't just learn it. Debrief it.**

Debrief is a teach-back learning tool. You explain a concept in your own words, and it finds the exact point where your explanation stops holding, then helps you fix it. No quizzes, no flashcards, no login: just you, explaining, and a curious agent probing where it matters.

Live at **[debrief.samuelyahaya.com](https://debrief.samuelyahaya.com)**.

## The idea

Rereading feels like learning but hides what you don't know. Producing an explanation from memory forces the gaps into the open, where they can actually be fixed. Debrief is built as that loop, grounded in **retrieval practice** and **generative learning**:

1. **Explain.** Write the idea from memory, in your own words.
2. **Probe.** Debrief maps the claims a strong explanation must carry, judges each, and asks one curious question aimed at the weakest point.
3. **Reveal.** It shows the exact sentence where your reasoning breaks, with a short, just-in-time correction.
4. **Repair.** You use the corrected idea in a new situation, so the fix sticks.

When several claims come out shaky, you choose which gap to dig into first; when one resolves and others remain open, you decide whether to keep going or wrap up. Diagnosis and teaching stay separate, so you never leave with only a grade.

## The understanding map

Every debrief builds a live map: each claim your explanation must carry is a stratum, and a single beam threads them top to bottom. Its state at each crossing, clean, porous, fractured, or not yet reached, shows what your explanation is actually holding. It's read-only, driven entirely by the session state.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind v4** with **Base UI** / **shadcn** (base-nova) primitives, **Phosphor** icons
- **Groq** (OpenAI-compatible) for the AI, using `openai/gpt-oss-120b` and `-20b` with structured outputs
- **Zod** for validating every model response
- A framework-free **pure reducer** owns the state machine; **Vitest** covers it
- Self-hosted **Sentient** (serif) + **Geist** / Geist Mono

## Getting started

Prerequisites: **Node 20+** and **pnpm**. You'll need a **Groq API key** ([console.groq.com](https://console.groq.com)).

```bash
pnpm install
cp .env.example .env.local   # then fill in GROQ_API_KEY
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The analytics variables in `.env.example` are optional: left blank, Debrief loads no tracker and reports nowhere. Set them to point a deployment at your own analytics server.

### Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm test` | Run the reducer test suite (Vitest) |
| `pnpm lint` | Lint with ESLint |

## How it's built

The guiding principle is **"Groq proposes, the reducer decides."** Each turn runs a narrow model call, validates the response against a schema, then hands the result to a pure state machine that owns every transition. The model never drives the session directly, and teaching is anchored on curated notes so it adapts wording without inventing a wrong correction. When a call fails validation, the turn falls back to authored content rather than faking a judgment.

Model output is parsed leniently and normalized in code (the quote invariant, one-to-one reconciliation), because strict structured output guarantees shape, not correctness.

It's **guest-first**: the whole loop runs with zero auth. Sessions and unsent drafts persist to `localStorage` and survive a reload; `src/lib/session-store.ts` is the seam where server storage will slot in later.

### Where things live

```
src/
  core/         framework-free domain: types, the reducer state machine, fixtures, tests
  ai/           the Groq client, the AI functions, and their Zod schemas
  app/          Next routes: landing, /debrief, /lessons, /methodology, /about, legal
  components/   the debrief runner, understanding map, response field, site chrome
  lib/          session persistence
```

## Design

A dark **"Editorial Technical"** system: warm obsidian surfaces, sharp corners, 1px structural lines (no glow), a single Focus Amber accent, an editorial serif for the concept voice and Geist for the interface. Reduced-motion safe throughout.

## Status

A hackathon build, guest-first by design. Accounts are optional persistence, never a gate, and are deferred; the curated library is growing. Feedback and issues welcome.
