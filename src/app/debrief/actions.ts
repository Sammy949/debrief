"use server";

import {
  buildConceptScaffold,
  evaluateExplanation,
  evaluateFocusAnswer,
  generateCuriousQuestion,
  generateRepairQuestion,
  generateTeachingIntervention,
  type ConceptScaffold,
  type TeachingIntervention,
} from "@/ai/functions";
import { reduce } from "@/core/reducer";
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

async function curiousContent(lesson: Lesson, state: SessionState, learnerText: string): Promise<TurnContent> {
  const focusClaim = focusClaimOf(lesson, state);
  if (!focusClaim) return { curiousQuestion: lesson.fallbackCuriousQuestion };
  try {
    const { question } = await generateCuriousQuestion(lesson, focusClaim, learnerText);
    return { curiousQuestion: question };
  } catch {
    return { curiousQuestion: lesson.fallbackCuriousQuestion };
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

/** Turn a generated scaffold into a full Lesson the loop can run. */
function lessonFromScaffold(concept: string, scaffold: ConceptScaffold): Lesson {
  return {
    slug: slugify(concept),
    title: concept.trim(),
    objective: scaffold.objective,
    difficulty: "intermediate",
    claims: scaffold.claims.map((c) => ({
      id: c.id,
      claim: c.claim,
      shortLabel: c.shortLabel,
      whyItMatters: c.whyItMatters,
      teachingNote: c.teachingNote,
      commonMisconception: c.commonMisconception,
    })),
    workedExample: "",
    counterexample: "",
    applicationScenarios: [],
    misconceptions: scaffold.claims
      .map((c) => c.commonMisconception)
      .filter((m): m is string => Boolean(m)),
    fallbackCuriousQuestion: "If the situation changed, would your explanation still hold, and why?",
    fallbackRepairQuestion: "Use this idea in a new, concrete example and walk through what happens.",
  };
}

/** Open-concept entry: scaffold a concept and build a runnable Lesson from it. */
export async function startOpenDebrief(
  concept: string,
): Promise<{ lesson: Lesson } | { error: string }> {
  const trimmed = concept.trim();
  if (!trimmed) return { error: "Enter a concept to debrief." };
  try {
    const scaffold = await buildConceptScaffold(trimmed);
    if (scaffold.claims.length === 0) return { error: "Couldn't map that concept. Try another one." };
    return { lesson: lessonFromScaffold(trimmed, scaffold) };
  } catch {
    return { error: "Couldn't build that debrief just now. Try again." };
  }
}

export async function submitExplanation(
  lesson: Lesson,
  state: SessionState,
  text: string,
): Promise<TurnResult> {
  let evaluation: ExplanationEvaluation;
  try {
    evaluation = await evaluateExplanation(lesson, text);
  } catch {
    return { state, content: {}, error: "We couldn't read that explanation just now. Try submitting again." };
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
  if (!focusClaim) return { state, content: {}, error: "Lost the focus point — start over." };

  let evaluation: FocusEvaluation;
  try {
    evaluation = await evaluateFocusAnswer(lesson, focusClaim, text);
  } catch {
    return { state, content: {}, error: "We couldn't read that answer just now. Try again." };
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
  if (!focusClaim) return { state, content: {}, error: "Lost the focus point — start over." };

  let evaluation: FocusEvaluation;
  try {
    evaluation = await evaluateFocusAnswer(lesson, focusClaim, text);
  } catch {
    return { state, content: {}, error: "We couldn't read that answer just now. Try again." };
  }
  const next = reduce(state, { type: "ANSWER_REPAIR", text, evaluation });
  return { state: next, content: {} };
}
