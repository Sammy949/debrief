# Debrief: Product and Implementation Plan

## 1. The idea, clarified

Debrief is a **guided teach-back system**. It helps a learner learn by asking them to reconstruct an idea, expose the weak part of that reconstruction, receive a small corrective lesson, and then use the repaired idea in a new situation.

The product is not primarily an AI tutor that talks at the learner. It is not primarily a quiz engine that scores recall. It is a learning loop built around a more demanding activity:

> **If you cannot explain an idea, identify where the explanation breaks, and use the idea in a new situation, the understanding is not yet dependable.**

Debrief therefore has two jobs:

1. **Diagnose understanding.** What can this learner currently explain, support, and apply?
2. **Teach the missing piece.** What is the smallest useful explanation or example that will help the learner repair the gap?

The first version should make this distinction explicit. Diagnosis alone is an assessment tool. Debrief becomes a learning product when every meaningful gap leads to a targeted instructional intervention and another attempt.

## 2. How Debrief teaches

Debrief should teach through a five-part loop:

| Step | Learner action | Debrief action | Learning purpose |
|---|---|---|---|
| 1. Retrieve | Explain the concept without copying a definition. | Listen for the concept’s essential claims. | Bring prior knowledge into the open. |
| 2. Map | See the structure of the idea being checked. | Represent claims as an understanding map. | Make the mental model visible. |
| 3. Probe | Answer one curious question about the weakest point. | Select a targeted follow-up instead of a random quiz question. | Reveal vague reasoning or contradiction. |
| 4. Teach | Read or inspect a short corrective explanation, example, or contrast. | Deliver just-in-time instruction for the identified gap. | Replace the weak mental model with a more useful one. |
| 5. Repair | Apply or re-explain the idea in a new situation. | Re-evaluate the repaired claim and update the map. | Test whether the correction became usable understanding. |

The crucial addition is **Teach**. The original concept had strong diagnosis but risked leaving the learner with a red node and no instruction. Debrief should not immediately dump a long lesson. It should give the smallest targeted intervention needed for the current gap.

### The teaching intervention

When a break point appears, Debrief should show four compact pieces:

1. **What you said.** The exact learner sentence, verified against the submitted text.
2. **What is missing or off.** A concise explanation of the conceptual issue.
3. **A better mental model.** One corrected explanation in plain language.
4. **Try it.** One application or “why” prompt that requires the learner to use the correction.

Example:

> **Your break point**
>
> “A closure stores the value of the variable when the function is created.”
>
> **The distinction to make**
>
> A closure preserves access to the surrounding lexical environment. It does not always freeze a copied value at the moment the function is created.
>
> **Try it**
>
> If the outer variable changes before the function runs, what should the function observe, and why?

The intervention should be short enough that the learner still does the important cognitive work. Debrief teaches by **briefly repairing the model, then requiring the learner to generate the repaired explanation**.

## 3. Do we have lessons?

Yes, but not conventional linear lessons—at least not in the first version.

A Debrief **lesson** should be a compact concept scaffold that gives the AI and the learner a reliable instructional target. It is not a twenty-minute article or a sequence of passive slides. A lesson is a structured learning object containing:

| Lesson field | Purpose |
|---|---|
| Title | Human-readable concept name, such as “JavaScript closures.” |
| Short promise | What the learner should be able to explain or do. |
| Prerequisites | Concepts that may be needed first. |
| Essential claims | The 3–5 ideas that define a satisfactory explanation. |
| Worked example | One concrete instance showing the concept in action. |
| Counterexample | One plausible case where the common misunderstanding fails. |
| Application scenario | A new situation for the repair round. |
| Misconceptions | Common incorrect mental models to watch for. |
| Teaching notes | Short corrections associated with each claim or misconception. |
| Source/reference | Optional link or attribution for the lesson author. |

This creates a useful product distinction:

> **Lessons provide the material. Debriefs provide the learning activity.**

A learner can enter through either path:

- **Lesson library:** choose a curated lesson with a known scaffold.
- **Open debrief:** enter any concept and let Debrief generate a provisional scaffold.

For the competition MVP, create three curated technical lessons so the experience feels intentional and repeatable:

| Seed lesson | Why it is useful for the demo |
|---|---|
| JavaScript closures | Produces a realistic misconception about values, scope, and time. |
| APIs and asynchronous requests | Supports application questions and visible causal reasoning. |
| Database indexes | Demonstrates tradeoffs, not just a single definition. |

The open-concept path can remain available, but curated lessons should be the recommended starting point because they allow better teaching notes, examples, and predictable demos.

## 4. Product modes

Debrief should have three modes rather than one undifferentiated chat experience.

### Learn mode

The learner chooses a lesson and receives a short orientation: the goal, the scenario, and the instruction to explain the concept without looking at the reference material. Learn mode is where the lesson scaffold is introduced, but the learner should still produce the first explanation before seeing a full answer.

### Debrief mode

The learner explains, receives a curious follow-up, and sees the understanding map update. This is the signature product experience and the mode that should dominate the competition demo.

### Review mode

The learner revisits previous break points, reads the compact teaching intervention, and attempts a new application. Review mode is where persistent history becomes useful. It should surface unresolved focus points rather than only displaying completed sessions.

## 5. End-to-end user flow

### A. Landing and onboarding

The public landing page should make the product immediately understandable and send the user to **Start a debrief**. After sign-in, the user reaches a dashboard with two primary choices:

> **Continue a focus point** or **Start a new debrief**.

Do not force a long profile setup. Authentication should establish identity and persistence, not become part of the product’s ceremony.

### B. Dashboard

The dashboard should answer three questions:

1. What should I work on now?
2. What have I already debriefed?
3. Where does my understanding tend to break?

Recommended sections are **Continue learning**, **Your focus points**, **Recent debriefs**, and **Lesson library**. The dashboard should feel like a workbench rather than a gradebook; avoid leaderboards, streaks, and points.

### C. Lesson selection

The lesson library shows the three seed lessons as cards with a title, a short promise, difficulty, and estimated session length. A secondary action allows the learner to enter an open concept.

Example card:

> **JavaScript closures**
>
> Explain how a function can retain access to variables from its surrounding scope.
>
> 5–7 minutes · Foundations
>
> **Start lesson**

### D. Orientation

The lesson opens with a short objective:

> **By the end of this debrief, you should be able to explain what a closure retains, when that access is used, and how changing the surrounding variable affects the result.**

Then the learner is asked to explain the concept from memory or prior knowledge. The reference material remains hidden until the teaching intervention or the learner explicitly chooses to reveal it after the first attempt.

### E. Explanation

Prompt:

> **Explain it as if you were teaching someone who is curious but new to the topic.**

Support text:

> Use your own words. Examples are welcome. You do not need to be perfect—the explanation gives Debrief something to work with.

The learner can submit text in the MVP. Voice can be added after the text loop is reliable.

### F. Map and curious question

After submission, show the understanding map and a brief processing transition. Do not reveal the hidden rubric as a raw AI artifact; translate it into readable claim cards.

Then show one question:

> **A curious question**
>
> If the function runs later, how can it still access the variable from earlier?

The learner answers in their own words. The system evaluates the answer against the focus claim.

### G. Teaching intervention

If the claim is still weak or a contradiction is confirmed, show the verified break point and the concise intervention. The learner should be able to expand “Why this matters” for more context, but the default view should stay brief.

The intervention has the following UI labels:

- **Break point**
- **The distinction**
- **A concrete example**
- **Try it another way**

### H. Repair round

Present one application or “why” question. The learner answers without seeing the final answer first. Debrief then updates the map and produces the summary.

### I. Summary

The summary should show:

- Overall understanding state.
- Final understanding map.
- What held up.
- The verified break point, if one appeared.
- The teaching intervention shown.
- The learner’s repaired explanation.
- One recommended next step.

Recommended summary language:

> **Your explanation became stronger.**
>
> You repaired the distinction between a closure and a copied value. Try one more application later to make the idea durable.

## 6. Functional scope for the hackathon

### Must have

| Capability | Definition of done |
|---|---|
| Authentication | A user can sign up/sign in with Better Auth and reach a protected dashboard. |
| Lesson library | At least three curated lesson records exist in Convex. |
| Open debrief | A user can enter a custom concept. |
| Concept scaffold | A lesson or open concept has 3–5 essential claims. |
| Explanation | The user submits a text explanation. |
| Evaluation | Each claim receives a validated state and rationale. |
| Targeted follow-up | One question targets the weakest claim. |
| Break point evidence | Any displayed quote is an exact substring of learner text. |
| Teaching intervention | The learner receives a short correction tied to the weak claim. |
| Repair round | The learner applies or re-explains the repaired idea. |
| Summary | The user sees the map, verdict, evidence, and next step. |
| Persistence | Sessions, claims, responses, and outcomes are stored in Convex. |

### Should have

A user should be able to resume an unfinished session, revisit a focus point from the dashboard, and see a recent-session list. The lesson library should distinguish curated lessons from open concepts.

### Defer

Voice input, spaced reminders, instructor dashboards, social sharing, teams, badges, streaks, full course authoring, file uploads, and elaborate analytics should wait. They do not strengthen the first demonstration as much as a reliable teach-back loop does.

## 7. Domain model

The following entities are enough for the first persistent version:

| Entity | Important fields |
|---|---|
| User | Managed by Better Auth and the Convex Better Auth component. |
| Lesson | `title`, `slug`, `description`, `objective`, `difficulty`, `claims`, `examples`, `misconceptions`, `teachingNotes`, `isPublished`. |
| DebriefSession | `userId`, `lessonId?`, `concept`, `status`, `currentStage`, `startedAt`, `completedAt`, `verdict`. |
| Claim | `sessionId`, `sourceClaimId?`, `claimText`, `whyItMatters`, `state`, `rationale`, `focusOrder`. |
| Response | `sessionId`, `claimId?`, `stage`, `text`, `createdAt`. |
| FollowUp | `sessionId`, `claimId`, `question`, `kind`, `answeredAt?`. |
| Intervention | `sessionId`, `claimId`, `breakPointQuote`, `distinction`, `example`, `createdAt`. |
| RepairAttempt | `sessionId`, `claimId`, `question`, `answer`, `resultState`. |
| ProgressEvent | `userId`, `sessionId`, `eventType`, `metadata`, `createdAt`. |

For the hackathon, lessons can store structured arrays in a Convex document rather than requiring a highly normalized schema. Session responses should be stored separately so the application can render the evidence trail and resume work.

## 8. Technical architecture

Use:

- **Next.js App Router + TypeScript** for the web application.
- **Vercel** for deployment and the public domain `debrief.samuelyahaya.com`.
- **Convex** as the application database and typed backend for lessons, sessions, responses, and progress.
- **Better Auth integrated with Convex** for email/password authentication first; social login can follow later.
- **Groq** for concept scaffolding, evaluation, curious-question generation, teaching interventions, and repair prompts.
- **Zod** for runtime validation of model outputs and API inputs.
- **Tailwind CSS + accessible component primitives** for the interface.
- **Vitest** for claim selection, state transitions, verdict aggregation, quote validation, and lesson fixtures.

The architectural rule is:

> **Groq proposes. Convex persists. Application code decides.**

The client should call typed Convex queries and mutations. AI calls should happen in server-side code or Convex actions, never in the browser. The Groq key must remain server-side.

### Authentication and data boundary

Better Auth should manage identity and sessions through the documented Convex integration. The authenticated user identity must be available to Convex queries and mutations, and every session query must filter by the current user rather than trusting a client-supplied `userId`.

Use the official Better Auth + Convex integration pattern rather than inventing a custom adapter. The documented setup includes the Better Auth Convex component, Convex auth configuration, environment variables for the auth secret and site URLs, a Next.js provider, and an auth route handler that proxies requests to Convex. [1] [2]

### AI boundary

Use separate server-side functions for:

- `buildConceptScaffold`
- `evaluateExplanation`
- `generateCuriousQuestion`
- `generateTeachingIntervention`
- `generateRepairQuestion`

Each function should have a narrow prompt, a versioned schema, timeout handling, and an explicit fallback path. The final verdict should be deterministic code over claim states, not a free-form model opinion.

## 9. Proper build phases

### Phase 0: Environment and decisions

Confirm the Git repository, package manager, Vercel project, Convex deployment, Better Auth provider choice, and Groq model. Create local and deployment environment variable checklists. Verify the custom domain only after the application runs locally.

### Phase 1: Foundation

Scaffold the Next.js app, install Convex and Better Auth integration packages according to their current official documentation, configure the Convex provider, establish the auth route, and prove that a user can sign in and reach a protected dashboard.

### Phase 2: Data model and seed lessons

Create the Convex schema and seed the three curated lessons. Implement authenticated lesson queries, session creation, and recent-session queries. Add typed domain objects shared between the UI and backend.

### Phase 3: First vertical slice with mocked AI

Build the complete flow with deterministic fixtures before connecting Groq: lesson → explanation → map → curious question → answer → intervention → repair → summary. This proves the UX and state machine without debugging model behavior at the same time.

### Phase 4: Groq integration

Connect concept scaffolding, evaluation, follow-up, intervention, and repair actions one at a time. Validate every response. Add a model-response error state and retry behavior. Add exact-substring quote validation before any quote can be persisted or displayed.

### Phase 5: Dashboard and resume behavior

Add incomplete-session resume, active focus points, recent debriefs, lesson library navigation, and summary history. Ensure every query is scoped to the authenticated user.

### Phase 6: Demo polish and deployment

Use a seeded demo account or a fast sign-up flow, choose one reliable lesson for the live demonstration, improve loading states and transitions, verify mobile layout, deploy to Vercel, connect `debrief.samuelyahaya.com`, and test the public URL in a fresh browser session.

## 10. Decisions Claude Code should ask first

Claude Code should ask only these architecture-changing questions before scaffolding:

1. Should the first sign-in method be email/password only, or is a social provider essential for the demo?
2. Which Groq model should be used for structured evaluation, and does the chosen model support the desired response format?
3. Should the three seed lessons be stored as Convex data from the start, or loaded from a checked-in seed file during the first slice?
4. Is the Vercel project and DNS access for `debrief.samuelyahaya.com` already available?

Claude Code should make assumptions about colors, copy, and minor component details rather than blocking on them.

## References

[1]: https://better-auth.com/docs/integrations/convex "Better Auth Convex Integration"
[2]: https://labs.convex.dev/better-auth/framework-guides/next "Convex + Better Auth: Next.js Guide"
[3]: https://psychology.ucsd.edu/undergraduate-program/undergraduate-resources/academic-writing-resources/effective-studying/retrieval-practice.html "UC San Diego Psychology: Retrieval Practice"
[4]: https://link.springer.com/article/10.1007/s10648-023-09769-7 "Fiorella, Making Sense of Generative Learning"
