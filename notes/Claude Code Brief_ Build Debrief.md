# Claude Code Brief: Build Debrief

Paste this brief into Claude Code at the start of the project.

---

I am building a hackathon product called **Debrief** and want you to help me scaffold and implement it in small, testable vertical slices.

The public URL will be:

> `https://debrief.samuelyahaya.com`

The project will use **Next.js + Vercel + Convex + Better Auth + Groq**.

## The product idea

Debrief is a guided **teach-back system**. It helps a learner learn by asking them to reconstruct an idea, exposing the weak part of that reconstruction, providing a small targeted teaching intervention, and then asking the learner to use the repaired idea in a new situation.

It is not primarily a generic AI tutor and not primarily a recall quiz. Its central question is:

> **Can you explain the idea, identify where your explanation breaks, and use the idea when the situation changes?**

Debrief has two jobs:

1. **Diagnose understanding:** determine what the learner can explain, support, and apply.
2. **Teach the missing piece:** give the smallest useful correction, example, or contrast needed to repair the learner’s mental model.

The product promise is:

> **Don’t just learn it. Debrief it.**

Supporting line:

> **Explain. Probe. Reveal. Repair.**

## How Debrief teaches

The learning loop has five stages:

1. **Retrieve:** the learner explains the concept from memory or prior knowledge without copying a definition.
2. **Map:** Debrief makes the essential claims behind the concept visible as an understanding map.
3. **Probe:** Debrief asks one short, curious follow-up question aimed at the weakest claim.
4. **Teach:** if a real gap appears, Debrief shows the verified break point, explains the distinction, and gives a concrete example or contrast.
5. **Repair:** the learner applies or re-explains the corrected idea in a new situation.

The key product insight is that diagnosis alone is not enough. A learner should not receive a weak-state label and be left there. Every meaningful gap should lead to a concise teaching intervention and another attempt.

## Lessons

Yes, Debrief has lessons, but they are not long, linear courses. A **lesson is a structured concept scaffold** that gives Debrief reliable instructional material.

Each lesson contains:

```ts
{
  title: string;
  slug: string;
  description: string;
  objective: string;
  difficulty: "foundations" | "intermediate" | "advanced";
  estimatedMinutes: number;
  claims: Array<{
    id: string;
    claim: string;
    whyItMatters: string;
    teachingNote: string;
  }>;
  workedExample: string;
  counterexample: string;
  applicationScenarios: string[];
  misconceptions: string[];
  isPublished: boolean;
}
```

The distinction is:

> **Lessons provide the material. Debriefs provide the learning activity.**

The MVP should ship with three curated lessons:

- **JavaScript closures:** scope, retained environment, and changing values.
- **APIs and asynchronous requests:** request lifecycle, delayed results, and error handling.
- **Database indexes:** lookup speed, storage/write tradeoffs, and when an index helps.

Also support an **Open debrief** path where the learner enters a custom concept. For an open concept, Groq can generate a provisional scaffold, but curated lessons should be the recommended demo path because they provide better teaching notes and more predictable results.

## Product modes

Debrief has three modes:

### Learn mode

The learner chooses a curated lesson, sees a short objective, and is asked to explain the concept before seeing the reference material.

### Debrief mode

The learner explains, sees the understanding map, answers the curious question, and receives a teaching intervention if needed. This is the signature experience and the competition demo.

### Review mode

The learner revisits previous break points, reads the compact teaching intervention, and attempts another application. This is where persistent account history becomes useful.

## End-to-end user flow

1. Public landing page explains the product and offers **Start a debrief**.
2. User signs in or creates an account with Better Auth.
3. Protected dashboard shows **Continue learning**, **Your focus points**, **Recent debriefs**, and **Lesson library**.
4. User chooses a curated lesson or selects **Open debrief**.
5. User sees the lesson objective and submits a text explanation.
6. Server evaluates the explanation against the lesson claims.
7. UI displays the understanding map with states: `solid`, `unclear`, `needs_attention`, and `untested`.
8. Server selects the weakest claim and generates one curious follow-up question.
9. User answers the follow-up.
10. If a contradiction or meaningful gap appears, UI shows the exact verified break-point sentence, a concise teaching intervention, and a worked example or contrast.
11. User completes a repair round with one application or “why” question.
12. Server re-evaluates the focus claim and computes the final verdict in application code.
13. UI shows the Debrief summary and saves the session to Convex.
14. Dashboard makes unresolved focus points available for later review.

## Learner-facing terminology

Use these terms consistently:

| Concept | Product term |
|---|---|
| Learning session | **Debrief** |
| Learner’s initial response | **Explanation** |
| Essential-claim visualization | **Understanding map** |
| Weakest current claim | **Focus point** |
| Targeted follow-up | **Curious question** |
| Exact sentence where reasoning fails | **Break point** |
| Short corrective instruction | **Teaching intervention** |
| Second attempt | **Repair round** |
| Final result | **Debrief summary** |
| Strong claim | **Solid** |
| Partial or vague claim | **Unclear** |
| Contradicted claim | **Needs attention** |
| Not yet addressed | **Untested** |

The experience should feel like a patient reviewer, not an examiner waiting for failure. Avoid “failed,” “wrong learner,” “red flag,” “score,” and “gotcha.”

## Technical stack

Use:

- Next.js App Router with TypeScript.
- Vercel for deployment.
- Convex as the database and typed backend.
- Better Auth integrated with Convex using the official `@convex-dev/better-auth` component.
- Groq for the AI calls.
- Zod for runtime validation of model outputs and request inputs.
- Tailwind CSS and accessible component primitives.
- Vitest for pure domain/state tests.
- Lucide React for icons if needed.

Do not add a separate SQL database, Drizzle, Prisma, tRPC, or a custom authentication system. Convex is the backend for this project.

Follow the current official Better Auth + Convex integration pattern rather than inventing one. Reference:

- https://better-auth.com/docs/integrations/convex
- https://labs.convex.dev/better-auth/framework-guides/next

Verify current package versions and commands before installing anything.

## Better Auth and Convex requirements

Use Better Auth with Convex for identity and sessions. Start with email/password authentication unless a social provider is clearly needed for the demo.

The integration should include the current official pattern for:

- `@convex-dev/better-auth` component registration.
- Convex auth configuration.
- Better Auth instance using the Convex adapter.
- Next.js client provider.
- Next.js auth route handler that proxies auth requests to Convex.
- Authenticated Convex queries and mutations.
- Server-side access to the authenticated identity.

Expected environment variables include the current documented equivalents of:

```env
BETTER_AUTH_SECRET=
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=
GROQ_API_KEY=
```

Use the correct current names from the official integration docs. Configure deployment values in Vercel and Convex as appropriate. Never expose secrets through `NEXT_PUBLIC_` variables.

Every session, lesson progress record, response, and summary must be scoped to the authenticated user. Never trust a client-supplied `userId`.

## Convex data model

Use a practical schema with these entities:

### `lessons`

- `title`
- `slug`
- `description`
- `objective`
- `difficulty`
- `estimatedMinutes`
- `claims`
- `workedExample`
- `counterexample`
- `applicationScenarios`
- `misconceptions`
- `isPublished`
- `createdAt`
- `updatedAt`

### `debriefSessions`

- `userId`
- `lessonId` optional
- `concept`
- `status`: `active | completed | abandoned`
- `stage`: `orientation | explanation | follow_up | teaching | repair | summary`
- `verdict` optional
- `startedAt`
- `completedAt` optional

### `claims`

- `sessionId`
- `sourceClaimId` optional
- `claimText`
- `whyItMatters`
- `teachingNote` optional
- `state`: `solid | unclear | needs_attention | untested`
- `rationale` optional
- `evidenceQuote` optional
- `focusOrder`

### `responses`

- `sessionId`
- `claimId` optional
- `stage`
- `text`
- `createdAt`

### `followUps`

- `sessionId`
- `claimId`
- `question`
- `kind`: `curious | apply | why`
- `answeredAt` optional

### `interventions`

- `sessionId`
- `claimId`
- `breakPointQuote`
- `distinction`
- `example` optional
- `createdAt`

### `repairAttempts`

- `sessionId`
- `claimId`
- `question`
- `answer`
- `resultState`
- `createdAt`

Use Convex queries and mutations for normal application data. Use Convex actions or another server-only path for Groq calls, depending on the current recommended Convex/Next.js integration. Keep secrets and external API calls server-side.

## AI responsibilities

Keep each AI function narrow and separately validated.

### `buildConceptScaffold`

For an open concept, return 3–5 essential claims:

```ts
{
  claims: Array<{
    id: string;
    claim: string;
    whyItMatters: string;
    teachingNote: string;
    commonMisconception: string | null;
  }>;
}
```

### `evaluateExplanation`

Input: lesson claims, complete learner explanation, and relevant prior responses.

Return one result for every claim:

```ts
{
  evaluations: Array<{
    claimId: string;
    state: "solid" | "unclear" | "needs_attention" | "untested";
    evidenceQuote: string | null;
    rationale: string;
  }>;
}
```

Any non-null quote must be an exact substring of the learner’s submitted text. Validate this in code before persisting or displaying it. If invalid, discard it.

### `generateCuriousQuestion`

Input: the selected focus claim and relevant learner explanation.

Return:

```ts
{
  question: string;
}
```

The question must be short, naive, curious, and targeted. It must not give away the answer.

### `generateTeachingIntervention`

Input: focus claim, verified break point, lesson teaching note, and relevant example.

Return:

```ts
{
  distinction: string;
  example: string;
  takeaway: string;
}
```

Keep it short. Do not produce a full lecture. The intervention should repair one mental-model distinction.

### `generateRepairQuestion`

Input: focus claim, teaching intervention, and lesson application scenario.

Return:

```ts
{
  question: string;
  type: "apply" | "why";
}
```

The question must require the learner to use or explain the repaired idea.

## Deterministic application logic

The model proposes judgments. Application code decides what happens.

Implement and test pure functions for:

- `selectFocusClaim`
- `validateEvidenceQuote`
- `shouldTeach`
- `shouldStartRepairRound`
- `aggregateVerdict`
- `nextStage`

Suggested verdict rules:

- All claims become solid without a break point → `solid_understanding`.
- A break point appears and the repair attempt recovers the focus claim → `understanding_strengthened`.
- A break point remains weak after repair → `gap_to_revisit`.

Add a maximum session turn count so the flow cannot loop forever.

## Routes

Create these routes:

- `/` — public landing page.
- `/sign-in` — authentication entry.
- `/dashboard` — protected dashboard.
- `/lessons` — protected lesson library.
- `/lessons/[slug]` — lesson orientation.
- `/debrief/new` — open concept entry.
- `/debrief/[id]` — active Debrief session.
- `/debrief/[id]/summary` — completed summary.
- `/review/[id]` — revisit a previous break point.

## Core components

- `DebriefShell`
- `DashboardShell`
- `LessonCard`
- `LessonObjective`
- `ExplanationEditor`
- `UnderstandingMap`
- `ClaimNode`
- `FocusPointCard`
- `CuriousQuestionCard`
- `TeachingInterventionCard`
- `BreakPointEvidence`
- `RepairRound`
- `VerdictCard`
- `DebriefSummary`
- `FocusPointList`

The understanding map is the signature visual. Show the concept in the center, essential claims around it, and one clearly highlighted focus point. Do not rely on color alone; include readable state labels.

## Visual direction

The interface should feel like a calm technical workbench: dark ink or charcoal, warm off-white surfaces, one restrained accent color, subtle node-and-connection visuals, generous spacing, and concise copy.

Avoid school-like gamification, cartoons, mascots, leaderboards, points, streaks, and punitive red failure screens. Use motion sparingly and respect reduced-motion preferences.

## Guardrails

- Keep `GROQ_API_KEY` server-side.
- Keep Better Auth secrets server-side.
- Validate all AI responses with Zod.
- Add timeouts and recoverable error states for AI calls.
- Do not log API keys or full learner explanations in production logs.
- Do not let the client choose the final verdict.
- Do not trust model-generated evidence quotes without exact substring validation.
- Do not create a generic chat interface as the first feature.
- Do not add voice, teams, instructor analytics, social sharing, billing, or full course authoring before the core loop works.

## How to work

Before writing substantial code, inspect the repository and ask no more than four questions that could change the architecture:

1. Should email/password be the only authentication method for the demo, or is a social provider required?
2. Is there already a Vercel project, Convex deployment, and DNS access for `debrief.samuelyahaya.com`?
3. Should the three curated lessons be seeded directly into Convex from the start?
4. Which current Groq model should be used, and does it support the required structured response format?

Make sensible assumptions about colors, copy, minor component details, and package versions after checking current documentation. Do not block on non-architectural decisions.

Implement in this order:

### Phase 1: Foundation

Scaffold Next.js, install and configure Convex and Better Auth using the current official integration, and prove that sign-in leads to a protected dashboard.

### Phase 2: Domain model

Create the Convex schema, seed the three lessons, and implement authenticated lesson and session queries.

### Phase 3: Mocked vertical slice

Build the complete UX with deterministic fixture data: lesson → explanation → understanding map → curious question → teaching intervention → repair round → summary.

### Phase 4: Groq integration

Connect concept scaffolding, evaluation, curious-question generation, teaching intervention, and repair prompts one at a time. Validate every response and add retries.

### Phase 5: Persistence and review

Add resume behavior, recent debriefs, unresolved focus points, lesson progress, and the review route.

### Phase 6: Demo polish and deployment

Choose one reliable lesson for the live demo, improve loading states, verify a fresh-browser sign-in, test mobile layout, deploy to Vercel, connect `debrief.samuelyahaya.com`, and verify the public URL.

At each step, explain what changed, how to run it locally, and how to verify it. The first success criterion is one complete teach-back path—not a generic chat screen:

> **lesson → explanation → map → curious question → teaching intervention → repair → summary**

---

## Official references

- [Better Auth: Convex Integration](https://better-auth.com/docs/integrations/convex)
- [Convex + Better Auth: Next.js Guide](https://labs.convex.dev/better-auth/framework-guides/next)
- [Groq Structured Outputs](https://console.groq.com/docs/structured-outputs)
- [Groq + Vercel AI SDK](https://console.groq.com/docs/ai-sdk)
- [UC San Diego Psychology: Retrieval Practice](https://psychology.ucsd.edu/undergraduate-program/undergraduate-resources/academic-writing-resources/effective-studying/retrieval-practice.html)
- [Fiorella: Making Sense of Generative Learning](https://link.springer.com/article/10.1007/s10648-023-09769-7)
