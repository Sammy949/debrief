import { z } from "zod";

/**
 * Zod schemas for validating Groq responses. They mirror the /core domain types
 * exactly — including the discriminated-union quote invariant: only a
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

export const conceptScaffoldSchema = z.object({
  objective: z.string(),
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
});
