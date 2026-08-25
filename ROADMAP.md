# Debrief — Build Roadmap

**Debrief** is a guided teach-back tool: explain a concept in your own words, and see exactly where your explanation stops holding. Not a quiz, not a chatbot.

> **Groq proposes. The reducer decides. Convex persists. Better Auth remembers.**

Loop: `Retrieve → Map → Probe → Teach → Repair`. Live at [debrief.samuelyahaya.com](https://debrief.samuelyahaya.com) (auto-deploys from `main`).

**Legend:** ✅ done · ◑ partial · 🔨 to build · ★ the signature

_Last updated: 2026-08-25_

---

## Pages / routes

| Route | Purpose | Access | Key pieces | Priority | Status |
|---|---|---|---|---|---|
| `/` | Landing — what Debrief is, one way in | public | hero, pitch, single CTA | MVP | ◑ placeholder |
| `/lessons` | Lesson library (3 curated + open) | all (guest ok) | `LessonCard` grid, "open debrief" | MVP | 🔨 |
| `/lessons/[slug]` | Orientation — objective, "explain from memory" | all | `LessonObjective` | MVP | 🔨 |
| `/debrief/[id]` | **The teach-back loop** — explain → map → probe → teach → repair | owner-scoped | `UnderstandingMap`, `ResponseField`, question/teaching/repair cards, `BreakPointEvidence` | MVP ★ | 🔨 |
| `/debrief/[id]/summary` | Verdict, final map, evidence, next step | owner-scoped | `DebriefSummary`, `VerdictCard` | MVP | 🔨 |
| `/debrief/new` | Open-concept entry | all | concept input | Should | 🔨 |
| `/dashboard` | Continue / recent / focus points / library | authed (guests: lighter) | `DashboardShell`, `FocusPointList` | Should | 🔨 |
| `/sign-in` | Email/password (guest-first, so non-blocking) | public | auth form | Should | 🔨 |
| `/review/[id]` | Revisit a past break point | owner-scoped | intervention recap + new application | Defer | 🔨 |

**MVP demo spine:** `/` → `/lessons` → `/lessons/[slug]` → `/debrief/[id]` → `/debrief/[id]/summary`.

---

## Architecture layers

| Layer | Contains | Status |
|---|---|---|
| **Domain core** `/core` | types (Claim / State / Session / Stage / Verdict), pure reducer, `selectFocusClaim` · `validateEvidenceQuote` · `shouldTeach` · `aggregateVerdict` · `nextStage`, turn cap; Vitest | 🔨 **next** |
| **Data** (Convex) | schema, queries, mutations, `lessons.seed.ts` | 🔨 |
| **Auth** (Better Auth) | component registration, guest-cookie → `ownerKey`, email/password | 🔨 |
| **AI** (Groq / server actions) | 5 functions, Zod ↔ strict-JSON-schema, per-turn orchestration, fallbacks + retries + in-flight lock | 🔨 |
| **UI** (pages + components) | the kit below | ◑ shell + theme up |
| **Design system** | World A tokens ✅, Satoshi ✅, grain ✅, **load-path + fracture primitives** 🔨, state-language | ◑ |
| **Content** | 3 curated lessons authored (+ fallback question / intervention) — this is prompt-engineering surface | 🔨 |
| **Ops** | repo ✅, CI/CD ✅, env vars, loading / error states, mobile, a11y | ◑ |

---

## Components

- **Signature ★** — `UnderstandingMap` (→ `ConceptHeader`, `ClaimMember`, `LoadPathRule`, `Fracture`, `FocusDetailPanel`), `BreakPointEvidence`
- **Flow** — `ResponseField` (one input, reused 3×), `CuriousQuestionCard`, `TeachingInterventionCard`, `RepairRound`, `VerdictCard`, `DebriefSummary`
- **Library / dashboard** — `LessonCard`, `LessonObjective`, `DashboardShell`, `FocusPointList`, `FocusPointCard`
- **Shell** — `DebriefShell`, a treated nav / header (not a default bar)

---

## Backend surface

- **Convex tables** — `lessons` · `debriefSessions` · `claims` · `responses` · `followUps` · `interventions` · `repairAttempts` (+ Better Auth's own)
- **AI functions** — `buildConceptScaffold` · `evaluateExplanation` · `generateCuriousQuestion` · `generateTeachingIntervention` · `generateRepairQuestion`
- **Content** — 3 lessons: JS closures · APIs / async · database indexes

---

## State machine (the reducer owns this)

One probe, always. Then:

```
break point?
├─ yes → teach (mandatory) → repair
│         ├─ focus recovers → understanding_strengthened
│         └─ still weak     → gap_to_revisit
└─ no  → all claims solid? ── yes → solid_understanding
                            └─ no  → gap_to_revisit  (+ remaining = next focus points)
```

- Repair is reachable **only** through teaching.
- One focus point per debrief. `selectFocusClaim` order: `needs_attention → unclear → untested → verificationClaim` (if all solid).
- A break-point quote requires the focus claim to have been written about; validated as an exact (normalized) substring of the **original** learner text.

---

## Build order (each unblocks the next)

1. **`/core`** — types + reducer + Vitest _(no network)_
2. **`UnderstandingMap` + flow components** wired to **fixtures** → the mocked end-to-end slice _(no network; proves the signature in-app)_
3. **Convex** — schema, seed, queries / mutations _(persistence)_
4. **Better Auth** — guest-first `ownerKey`
5. **Groq** — swap fixtures for real AI, one function at a time, Zod-gated
6. **Dashboard / review + polish** — loading / error, mobile, demo hardening

Content authoring (the 3 lessons) runs in parallel — it feeds the fixtures in step 2 and the AI in step 5.

---

## Guardrails

- `GROQ_API_KEY` and Better Auth secrets stay server-side; never trust a client-supplied owner.
- Validate every AI response with Zod; the client never decides the verdict.
- No generic chat UI; the learner answers via focused response fields attached to the map.
- Atomic commits, Conventional Commit naming.
