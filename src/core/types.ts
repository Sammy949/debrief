/**
 * Debrief — core domain model.
 *
 * Framework-free. No Convex, Groq, or React imports live here. This module is
 * the single source of truth for the state machine, imported by the reducer,
 * the server actions, and the Vitest suite alike.
 *
 * Principle: Groq proposes, the reducer decides. The AI's *validated* output is
 * carried on the event, so `reduce(state, event)` stays pure and testable.
 */

// ---------------------------------------------------------------------------
// Enumerations (string-literal unions + runtime arrays for validation/UI)
// ---------------------------------------------------------------------------

export const CLAIM_STATES = ["solid", "unclear", "needs_attention", "untested"] as const;
export type ClaimState = (typeof CLAIM_STATES)[number];

/**
 * Screens the reducer waits on. `explanation` is the initial stage — the lesson
 * objective/orientation is shown by the UI on that screen, so no separate stage
 * or event is needed. The teaching intervention and its "Try it" repair prompt
 * share one screen, so ANSWER_REPAIR fires from `teaching`; there is no distinct
 * `repair` stage and no intermediate event. The reducer owns every transition.
 */
export const STAGES = ["explanation", "probe", "teaching", "summary"] as const;
export type Stage = (typeof STAGES)[number];

/** When a claim was (re)evaluated — labels the summary's before/after trail. */
export const EVAL_PHASES = ["explanation", "probe", "repair"] as const;
export type EvalPhase = (typeof EVAL_PHASES)[number];

export const VERDICTS = [
  "solid_understanding",
  "understanding_strengthened",
  "gap_to_revisit",
] as const;
export type Verdict = (typeof VERDICTS)[number];

/**
 * What the single probe is doing, which decides its whole tone:
 * - `weakness`: the learner wrote something wrong or vague — probe the weak point.
 * - `unaddressed`: the learner never touched this part — invite them into it (no
 *   implied claim, no "what if"). Distinct from `verification`: an untested claim
 *   is a gap, not a solid answer waiting to be stress-tested.
 * - `verification`: EVERY claim is solid — a transfer check that it holds in a new case.
 */
export type FocusKind = "weakness" | "unaddressed" | "verification";

// ---------------------------------------------------------------------------
// Lesson scaffold — authored content, the source of truth for teaching.
// ---------------------------------------------------------------------------

export interface LessonClaim {
  id: string;
  /** Full claim text (shown in the focus detail panel). */
  claim: string;
  /** Concise label for the understanding map. */
  shortLabel: string;
  whyItMatters: string;
  /** Pre-authored correction; Groq only adapts its wording to the break point. */
  teachingNote: string;
  commonMisconception: string | null;
}

export interface Lesson {
  slug: string;
  title: string;
  objective: string;
  difficulty: "foundations" | "intermediate" | "advanced";
  /**
   * `authored`: a curated lesson with claims written in advance (source of truth
   * for teaching). `open`: a learner-named concept — claims are NOT known up front;
   * they are decomposed from the learner's own explanation at submit time, so the
   * shell begins with an empty `claims` array. Only the open path re-derives claims.
   */
  mode: "authored" | "open";
  claims: LessonClaim[];
  workedExample: string;
  counterexample: string;
  applicationScenarios: string[];
  misconceptions: string[];
  /**
   * Demo-safety: used if the AI call times out or fails validation. One per
   * FocusKind so the fallback matches the probe the learner actually got.
   */
  fallbackWeaknessQuestion: string;
  fallbackUnaddressedQuestion: string;
  fallbackVerificationQuestion: string;
  fallbackRepairQuestion: string;
}

// ---------------------------------------------------------------------------
// Session-scoped claim — a lesson claim once it is being evaluated in a debrief.
// ---------------------------------------------------------------------------

export interface Claim {
  id: string;
  sourceClaimId: string;
  claimText: string;
  shortLabel: string;
  whyItMatters: string;
  state: ClaimState;
  rationale: string | null;
  /**
   * Exact substring of the ORIGINAL learner text this claim was evaluated
   * against. Only ever set for a `needs_attention` claim (the contradicted
   * sentence). `unclear` / `solid` / `untested` carry null — vague or absent
   * claims have no single sentence to pin.
   */
  evidenceQuote: string | null;
  /** Deterministic ordering used by selectFocusClaim as the tie-breaker. */
  focusOrder: number;
}

/** One snapshot of a claim's state at an eval phase, for the before/after trail. */
export interface ClaimSnapshot {
  claimId: string;
  phase: EvalPhase;
  state: ClaimState;
  rationale: string | null;
  evidenceQuote: string | null;
}

// ---------------------------------------------------------------------------
// Session state — exactly what the reducer owns and advances.
// ---------------------------------------------------------------------------

export interface SessionState {
  stage: Stage;
  claims: Claim[];
  focusClaimId: string | null;
  focusKind: FocusKind | null;
  turnCount: number;
  /** Whether the focus claim broke at the probe (gates the mandatory teach). */
  brokeAtProbe: boolean;
  verdict: Verdict | null;
  trajectory: ClaimSnapshot[];
}

// ---------------------------------------------------------------------------
// AI judgments — the validated shapes the reducer consumes off an event.
// (Zod-validated at the server boundary before dispatch; never trusted raw.)
// ---------------------------------------------------------------------------

/**
 * One entry per claim from evaluateExplanation. Discriminated on `state` so the
 * quote invariant is compiler- and z.discriminatedUnion-enforced: ONLY a
 * contradicted claim (`needs_attention`) carries a pinpoint break-point quote.
 * `unclear` is vague/partial with no single sentence to pin, so it — like
 * `solid` and `untested` — carries null.
 */
export type ClaimEvaluation =
  | { sourceClaimId: string; state: "needs_attention"; evidenceQuote: string; rationale: string }
  | { sourceClaimId: string; state: "unclear" | "solid" | "untested"; evidenceQuote: null; rationale: string };

export interface ExplanationEvaluation {
  evaluations: ClaimEvaluation[];
}

/** Re-evaluation of the single focus claim after a probe or repair answer. */
export type FocusEvaluation =
  | { state: "needs_attention"; evidenceQuote: string; rationale: string }
  | { state: "unclear" | "solid" | "untested"; evidenceQuote: null; rationale: string };

// ---------------------------------------------------------------------------
// Events — learner actions. Each carries the AI's already-validated judgment,
// so the reducer is a pure function of (state, event).
// ---------------------------------------------------------------------------

export type DebriefEvent =
  | { type: "SUBMIT_EXPLANATION"; text: string; evaluation: ExplanationEvaluation }
  | { type: "ANSWER_CURIOUS"; text: string; evaluation: FocusEvaluation }
  | { type: "ANSWER_REPAIR"; text: string; evaluation: FocusEvaluation };

export type DebriefEventType = DebriefEvent["type"];
