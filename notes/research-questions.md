# Debrief — research questions (open)

_Things to investigate before / during the next phases. Prepared 2026-08-26._

## Highest leverage
1. **Better Auth anonymous / guest sessions.** Does Better Auth ship an anonymous plugin that fits our `guest:<cookie>` ownerKey, or do we roll our own httpOnly guest cookie and only use Better Auth for real accounts? This decides the whole guest-first persistence shape. (The Convex+Better Auth guides didn't confirm the anonymous plugin — check Better Auth's plugin docs directly.)

2. **Groq evaluation consistency.** Does `evaluateExplanation` (gpt-oss-120b, temp 0.15) flip-flop across runs on the *same* explanation (e.g. solid vs unclear)? The signature's credibility depends on stable judgments. Test: run the same explanation N times, measure state variance per claim. If it drifts, add few-shot anchors from the lesson or lower temperature further.

3. **Map redefinition — what actually communicates.** What representation lets a first-time viewer say what the map means in 5 seconds? Options to test: a state key/legend, more prominent state words, a "claims your explanation must cover" caption, a less-abstract mark than the load-path rule. Test on someone who hasn't seen it.

## Convex / persistence
4. **Data model shape.** Store `SessionState` + `trajectory` as one session document with embedded claim snapshots, or normalized tables (`claims`, `responses`, `followUps`, ...)? Trade-off: simplicity/atomic reads vs. queryability for "focus points across sessions."
5. **Where reduce + persist sit.** Confirm: Next server action runs Groq + pure `reduce`, then calls a Convex mutation to persist. (We chose Next server actions for Groq, Convex for storage — verify no reason to move Groq into a Convex action.)
6. **Guest -> account claim (deferred).** How to migrate a guest's ephemeral sessions onto a user on sign-up, when we get there.

## Deploy / ops
7. **Convex prod + Vercel.** Prod Convex deployment, the `.site` URL wiring, env split (Convex vs Vercel), and confirming the `app/api/auth/[...all]` proxy works on `debrief.samuelyahaya.com`.
8. **Quote-gate resilience in the wild.** How often does Groq's verbatim break-point quote fail the substring gate (paraphrase/normalization)? If frequent, tune the prompt or widen normalization.

## Content
9. **Curated lessons vs open-concept.** Given open-concept works, are curated lessons still worth authoring for the demo, or does one strong seeded lesson + open-concept cover it?
