"use server";

import {
  decomposeAndEvaluate,
  evaluateExplanation,
  evaluateFocusAnswer,
  generateRepairQuestion,
  generateTeachingIntervention,
  generateUnaddressedQuestion,
  generateVerificationQuestion,
  generateWeaknessQuestion,
  type TeachingIntervention,
} from "@/ai/functions";
import { createInitialState, reduce } from "@/core/reducer";
import type { ExplanationEvaluation, FocusEvaluation, Lesson, LessonClaim, SessionState } from "@/core/types";
import type { TurnContent, TurnResult } from "./turn-types";

/**
 * The orchestration boundary. Each action runs the turn on the server:
 * AI → Zod-validate (inside the function) → pure reducer → generate next
 * content. Evaluations that fail come back as a recoverable `error` (no faking
 * a judgment); content that fails soft-falls-back to the lesson's authored text.
 *
 * NOTE: for the guest demo, state + lesson are passed from the client (ephemeral,
 * nothing stored, only the guest's own session). When Convex + auth land, these
 * get loaded server-side instead of trusted from the client.
 */

function focusClaimOf(lesson: Lesson, state: SessionState): LessonClaim | undefined {
  return state.focusClaimId ? lesson.claims.find((c) => c.id === state.focusClaimId) : undefined;
}

/**
 * The one probe, generated to match its FocusKind. Each kind has its own prompt
 * and its own authored fallback, so a Groq timeout still lands the learner in the
 * right conversation (a gap invitation never degrades into a weakness probe).
 */
async function curiousContent(lesson: Lesson, state: SessionState, learnerText: string): Promise<TurnContent> {
  const focusClaim = focusClaimOf(lesson, state);
  const kind = state.focusKind;
  if (!focusClaim || !kind) return { curiousQuestion: lesson.fallbackWeaknessQuestion };

  const fallback =
    kind === "unaddressed"
      ? lesson.fallbackUnaddressedQuestion
      : kind === "verification"
        ? lesson.fallbackVerificationQuestion
        : lesson.fallbackWeaknessQuestion;

  try {
    const { question } =
      kind === "unaddressed"
        ? await generateUnaddressedQuestion(lesson, focusClaim)
        : kind === "verification"
          ? await generateVerificationQuestion(lesson, focusClaim, learnerText)
          : await generateWeaknessQuestion(lesson, focusClaim, learnerText);
    return { curiousQuestion: question };
  } catch {
    return { curiousQuestion: fallback };
  }
}

async function teachingContent(lesson: Lesson, state: SessionState): Promise<TurnContent> {
  const focusClaim = focusClaimOf(lesson, state);
  if (!focusClaim) return {};
  const breakPoint = state.claims.find((c) => c.id === state.focusClaimId)?.evidenceQuote ?? null;

  let intervention: TeachingIntervention;
  try {
    intervention = await generateTeachingIntervention(lesson, focusClaim, breakPoint);
  } catch {
    intervention = {
      distinction: focusClaim.teachingNote,
      example: lesson.counterexample,
      takeaway: focusClaim.teachingNote,
    };
  }

  let repairQuestion: string;
  try {
    repairQuestion = (await generateRepairQuestion(lesson, focusClaim, intervention.takeaway)).question;
  } catch {
    repairQuestion = lesson.fallbackRepairQuestion;
  }

  return { intervention, repairQuestion };
}

function slugify(s: string): string {
  return (
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "concept"
  );
}

/**
 * The shell an open debrief starts from: a title and objective, but NO claims.
 * Claims are decomposed from the learner's own explanation at submit time (see
 * `submitOpenExplanation`), so nothing here imposes a curriculum in advance —
 * and entry needs no Groq call, so the explanation screen appears instantly.
 */
function openLessonShell(concept: string): Lesson {
  const title = concept.trim();
  return {
    slug: slugify(title),
    title,
    objective: `Explain ${title} in your own words — well enough that it holds up when someone digs in.`,
    difficulty: "intermediate",
    mode: "open",
    claims: [],
    workedExample: "",
    counterexample: "",
    applicationScenarios: [],
    misconceptions: [],
    fallbackWeaknessQuestion:
      "Which part feels shakiest to you? Take another run at just that piece.",
    fallbackUnaddressedQuestion:
      "There's one piece you haven't touched yet — walk me through it?",
    fallbackVerificationQuestion:
      "You've got the core — let's stretch it. Pick a real example where this shows up and walk through what happens.",
    fallbackRepairQuestion: "Now put it to work — try it on a fresh example. What happens, and why?",
  };
}

/** Open-concept entry: build a runnable shell to write against. No claims yet. */
export async function startOpenDebrief(
  concept: string,
): Promise<{ lesson: Lesson } | { error: string }> {
  const trimmed = concept.trim();
  if (!trimmed) return { error: "Give me a concept to dig into first." };
  return { lesson: openLessonShell(trimmed) };
}

/**
 * Open path: decompose the learner's explanation into claims AND evaluate them in
 * one call, build the now-populated Lesson, then run the SAME reducer transition
 * the authored path uses. The enriched lesson rides back on the result so the
 * client can carry its claims (teaching notes, labels) through the rest of the loop.
 */
async function submitOpenExplanation(lesson: Lesson, text: string): Promise<TurnResult> {
  const shell = createInitialState(lesson);
  let debrief;
  try {
    debrief = await decomposeAndEvaluate(lesson.title, text);
  } catch (err) {
    console.error("[debrief] decomposeAndEvaluate failed:", err);
    return {
      state: shell,
      content: {},
      error:
        "Almost! I need a bit more to go on — add a line or two on how it works, and let's try again.",
    };
  }

  const claims: LessonClaim[] = debrief.claims.map((c) => ({
    id: c.id,
    claim: c.claim,
    shortLabel: c.shortLabel,
    whyItMatters: c.whyItMatters,
    teachingNote: c.teachingNote,
    commonMisconception: c.commonMisconception,
  }));
  const enriched: Lesson = { ...lesson, claims };

  const next = reduce(createInitialState(enriched), {
    type: "SUBMIT_EXPLANATION",
    text,
    evaluation: { evaluations: debrief.evaluations },
  });
  return { state: next, content: await curiousContent(enriched, next, text), lesson: enriched };
}

export async function submitExplanation(
  lesson: Lesson,
  state: SessionState,
  text: string,
): Promise<TurnResult> {
  // Open concept: claims don't exist yet — derive them from this explanation.
  if (lesson.mode === "open") return submitOpenExplanation(lesson, text);

  let evaluation: ExplanationEvaluation;
  try {
    evaluation = await evaluateExplanation(lesson, text);
  } catch (err) {
    console.error("[debrief] evaluateExplanation failed:", err);
    return { state, content: {}, error: "That didn't come through — mind sending it again?" };
  }
  const next = reduce(state, { type: "SUBMIT_EXPLANATION", text, evaluation });
  return { state: next, content: await curiousContent(lesson, next, text) };
}

export async function answerCurious(
  lesson: Lesson,
  state: SessionState,
  text: string,
): Promise<TurnResult> {
  const focusClaim = focusClaimOf(lesson, state);
  if (!focusClaim) return { state, content: {}, error: "Lost the thread there — let's start fresh." };

  let evaluation: FocusEvaluation;
  try {
    evaluation = await evaluateFocusAnswer(lesson, focusClaim, text);
  } catch (err) {
    console.error("[debrief] evaluateFocusAnswer (curious) failed:", err);
    return { state, content: {}, error: "That didn't come through — give it another go?" };
  }
  const next = reduce(state, { type: "ANSWER_CURIOUS", text, evaluation });
  const content = next.stage === "teaching" ? await teachingContent(lesson, next) : {};
  return { state: next, content };
}

export async function answerRepair(
  lesson: Lesson,
  state: SessionState,
  text: string,
): Promise<TurnResult> {
  const focusClaim = focusClaimOf(lesson, state);
  if (!focusClaim) return { state, content: {}, error: "Lost the thread there — let's start fresh." };

  let evaluation: FocusEvaluation;
  try {
    evaluation = await evaluateFocusAnswer(lesson, focusClaim, text);
  } catch (err) {
    console.error("[debrief] evaluateFocusAnswer (repair) failed:", err);
    return { state, content: {}, error: "That didn't come through — give it another go?" };
  }
  const next = reduce(state, { type: "ANSWER_REPAIR", text, evaluation });
  return { state: next, content: {} };
}

/**
 * Checkpoint → keep going: the reducer picks the next weakest claim and returns to
 * `probe`; we generate that probe against the learner's original explanation so the
 * question has context. No new AI judgment — CONTINUE is pure navigation.
 */
export async function continueDebrief(lesson: Lesson, state: SessionState): Promise<TurnResult> {
  const next = reduce(state, { type: "CONTINUE" });
  if (next.stage !== "probe") return { state: next, content: {} };
  return { state: next, content: await curiousContent(lesson, next, next.explanationText) };
}

/** Checkpoint → wrap up: settle on the map as it stands. No AI. */
export async function wrapUp(state: SessionState): Promise<TurnResult> {
  return { state: reduce(state, { type: "WRAP_UP" }), content: {} };
}

/**
 * select_focus → the learner picked which mapped gap to work first. Set it as the
 * focus and generate that probe against their original explanation. No new judgment
 * — the gaps were already found by decomposeAndEvaluate.
 */
export async function selectFocus(
  lesson: Lesson,
  state: SessionState,
  claimId: string,
): Promise<TurnResult> {
  const next = reduce(state, { type: "SET_FOCUS", claimId });
  if (next.stage !== "probe") return { state: next, content: {} };
  return { state: next, content: await curiousContent(lesson, next, next.explanationText) };
}
