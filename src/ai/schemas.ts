import { z } from "zod";

/**
 * Zod schemas for validating Groq responses. They mirror the /core domain types
 * exactly - including the discriminated-union quote invariant: only a
 * `needs_attention` claim carries a break-point quote. Strict structured output
 * guarantees the JSON *shape*; these guard the *content* (defence in depth), and
 * the substring gate in the reducer guards the quote against the learner's text.
 */

export const claimEvaluationSchema = z.discriminatedUnion("state", [
  z.object({
    sourceClaimId: z.string(),
    state: z.literal("needs_attention"),
    evidenceQuote: z.string(),
    rationale: z.string(),
  }),
  z.object({
    sourceClaimId: z.string(),
    state: z.enum(["unclear", "solid", "untested"]),
    evidenceQuote: z.null(),
    rationale: z.string(),
  }),
]);

export const explanationEvaluationSchema = z.object({
  evaluations: z.array(claimEvaluationSchema),
});

export const focusEvaluationSchema = z.discriminatedUnion("state", [
  z.object({ state: z.literal("needs_attention"), evidenceQuote: z.string(), rationale: z.string() }),
  z.object({ state: z.enum(["unclear", "solid", "untested"]), evidenceQuote: z.null(), rationale: z.string() }),
]);

export const curiousQuestionSchema = z.object({
  question: z.string(),
});

export const teachingInterventionSchema = z.object({
  distinction: z.string(),
  example: z.string(),
  takeaway: z.string(),
});

export const repairQuestionSchema = z.object({
  question: z.string(),
  type: z.enum(["apply", "why"]),
});

/**
 * Open-concept path: one Groq call both DERIVES the claims (from the learner's own
 * explanation, not the topic name) and EVALUATES each against that explanation. One
 * call → one validated unit: this single schema covers both arrays, so neither can
 * slip through half-checked. Zod guards the shape of each array; the reducer's
 * substring gate guards the quotes; and `decomposeAndEvaluate` adds a semantic check
 * that the two arrays line up one-to-one on claim id (shape validity ≠ referential
 * integrity - that relationship is the one thing this schema alone cannot prove).
 */
export const conceptDebriefSchema = z.object({
  claims: z.array(
    z.object({
      id: z.string(),
      shortLabel: z.string(),
      claim: z.string(),
      whyItMatters: z.string(),
      teachingNote: z.string(),
      commonMisconception: z.union([z.string(), z.null()]),
    }),
  ),
  evaluations: z.array(claimEvaluationSchema),
});

/**
 * LENIENT response schemas. Groq's strict structured output guarantees the JSON
 * SHAPE, but not the conditional quote invariant (only `needs_attention` carries
 * a quote) - the model routinely attaches a quote to a `solid` claim or omits a
 * rationale. The strict discriminated-union schemas above would REJECT that
 * otherwise-usable output and fail the whole turn. So we parse leniently here and
 * normalize to the strict domain type in code (see `functions.ts`), which is far
 * more robust than throwing the learner back to the start over a stray quote.
 */
const anyState = z.enum(["solid", "unclear", "needs_attention", "untested"]);
const looseQuote = z.union([z.string(), z.null()]).optional();

export const rawClaimEvaluationSchema = z.object({
  sourceClaimId: z.string(),
  state: anyState,
  evidenceQuote: looseQuote,
  rationale: z.string().optional(),
});

export const rawExplanationEvaluationSchema = z.object({
  evaluations: z.array(rawClaimEvaluationSchema),
});

export const rawFocusEvaluationSchema = z.object({
  state: anyState,
  evidenceQuote: looseQuote,
  rationale: z.string().optional(),
});

export const rawConceptDebriefSchema = z.object({
  claims: z.array(
    z.object({
      id: z.string(),
      shortLabel: z.string(),
      claim: z.string(),
      whyItMatters: z.string().optional(),
      teachingNote: z.string().optional(),
      commonMisconception: looseQuote,
    }),
  ),
  evaluations: z.array(rawClaimEvaluationSchema),
});
