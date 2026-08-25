/**
 * The five AI functions — Debrief's only calls to the model. Each has a narrow
 * role, a strict request schema, and Zod validation on the response. Curated
 * lesson content anchors the teaching so Groq only adapts wording; it cannot
 * invent a wrong distinction. Every function throws on failure — the caller
 * (server action) falls back to authored lesson content.
 *
 * SERVER-ONLY (imports the Groq client, which reads GROQ_API_KEY).
 */

import { callGroqStructured, type GroqModel } from "./groq";
import {
  conceptScaffoldSchema,
  curiousQuestionSchema,
  explanationEvaluationSchema,
  focusEvaluationSchema,
  repairQuestionSchema,
  teachingInterventionSchema,
} from "./schemas";
import type { z } from "zod";
import type { ExplanationEvaluation, FocusEvaluation, Lesson, LessonClaim } from "@/core/types";

export type CuriousQuestion = z.infer<typeof curiousQuestionSchema>;
export type TeachingIntervention = z.infer<typeof teachingInterventionSchema>;
export type RepairQuestion = z.infer<typeof repairQuestionSchema>;
export type ConceptScaffold = z.infer<typeof conceptScaffoldSchema>;

const FLAGSHIP: GroqModel = "openai/gpt-oss-120b"; // reliability-critical: evaluate + scaffold
const FAST: GroqModel = "openai/gpt-oss-20b"; //  generative: question / intervention / repair

const CLAIM_STATE_ENUM = ["solid", "unclear", "needs_attention", "untested"] as const;

// --- strict request schemas (flat, root-object, strict-mode compliant) ----
const EVAL_REQUEST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["evaluations"],
  properties: {
    evaluations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["sourceClaimId", "state", "evidenceQuote", "rationale"],
        properties: {
          sourceClaimId: { type: "string" },
          state: { type: "string", enum: CLAIM_STATE_ENUM },
          evidenceQuote: { type: ["string", "null"] },
          rationale: { type: "string" },
        },
      },
    },
  },
} as const;

const FOCUS_REQUEST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["state", "evidenceQuote", "rationale"],
  properties: {
    state: { type: "string", enum: CLAIM_STATE_ENUM },
    evidenceQuote: { type: ["string", "null"] },
    rationale: { type: "string" },
  },
} as const;

const CURIOUS_REQUEST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["question"],
  properties: { question: { type: "string" } },
} as const;

const TEACHING_REQUEST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["distinction", "example", "takeaway"],
  properties: {
    distinction: { type: "string" },
    example: { type: "string" },
    takeaway: { type: "string" },
  },
} as const;

const REPAIR_REQUEST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["question", "type"],
  properties: {
    question: { type: "string" },
    type: { type: "string", enum: ["apply", "why"] },
  },
} as const;

const SCAFFOLD_REQUEST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["objective", "claims"],
  properties: {
    objective: { type: "string" },
    claims: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "shortLabel", "claim", "whyItMatters", "teachingNote", "commonMisconception"],
        properties: {
          id: { type: "string" },
          shortLabel: { type: "string" },
          claim: { type: "string" },
          whyItMatters: { type: "string" },
          teachingNote: { type: "string" },
          commonMisconception: { type: ["string", "null"] },
        },
      },
    },
  },
} as const;

// --- helpers --------------------------------------------------------------
const asSchema = (s: unknown) => s as Record<string, unknown>;

function claimsBlock(lesson: Lesson): string {
  return lesson.claims
    .map(
      (c) =>
        `- id: ${c.id}\n  claim: ${c.claim}${
          c.commonMisconception ? `\n  watch for: ${c.commonMisconception}` : ""
        }`,
    )
    .join("\n");
}

// --- 1. evaluateExplanation (flagship) ------------------------------------
export async function evaluateExplanation(
  lesson: Lesson,
  explanation: string,
): Promise<ExplanationEvaluation> {
  const system = [
    "You are a careful evaluator in a teach-back learning tool.",
    "Given a concept's essential claims and a learner's explanation, judge EACH claim's state from the explanation ALONE:",
    "- solid: clearly and correctly explained.",
    "- unclear: mentioned but vague or partial, not specifically wrong.",
    "- needs_attention: the explanation says something that CONTRADICTS the claim (a real misconception).",
    "- untested: not addressed at all.",
    "Quote rule: for needs_attention ONLY, set evidenceQuote to the EXACT sentence copied verbatim from the learner's explanation that reveals the misconception. For solid, unclear, and untested, evidenceQuote MUST be null.",
    "Never invent or paraphrase quotes. Keep each rationale to one sentence. Return exactly one evaluation per claim, using each claim's id.",
  ].join("\n");

  const user = `Concept: ${lesson.title}\n\nEssential claims:\n${claimsBlock(lesson)}\n\nLearner's explanation:\n"""${explanation}"""`;

  const raw = await callGroqStructured({
    model: FLAGSHIP,
    system,
    user,
    schemaName: "explanation_evaluation",
    jsonSchema: asSchema(EVAL_REQUEST_SCHEMA),
    temperature: 0.15,
  });
  return explanationEvaluationSchema.parse(raw);
}

// --- 2. generateCuriousQuestion (fast) ------------------------------------
export async function generateCuriousQuestion(
  lesson: Lesson,
  focusClaim: LessonClaim,
  learnerText: string,
): Promise<CuriousQuestion> {
  const system = [
    "You are a curious, patient reviewer in a teach-back tool.",
    "Ask ONE short, naive follow-up question that probes the given claim at the weakest point of the learner's answer.",
    "It must be answerable in a sentence or two, must NOT reveal the answer, and should push the learner to apply the idea when the situation changes.",
    "Return only the question.",
  ].join("\n");

  const user = `Concept: ${lesson.title}\nClaim to probe: ${focusClaim.claim}\nWhy it matters: ${focusClaim.whyItMatters}\n\nWhat the learner said:\n"""${learnerText}"""`;

  const raw = await callGroqStructured({
    model: FAST,
    system,
    user,
    schemaName: "curious_question",
    jsonSchema: asSchema(CURIOUS_REQUEST_SCHEMA),
    temperature: 0.4,
    maxTokens: 200,
  });
  return curiousQuestionSchema.parse(raw);
}

// --- 3. re-evaluate the focus claim (flagship) ----------------------------
export async function evaluateFocusAnswer(
  lesson: Lesson,
  focusClaim: LessonClaim,
  answer: string,
): Promise<FocusEvaluation> {
  const system = [
    "You are a careful evaluator in a teach-back tool.",
    "Judge ONLY the given claim, from the learner's answer:",
    "- solid: now clearly and correctly reasoned.",
    "- unclear: vague or partial.",
    "- needs_attention: contradicts the claim (a real misconception).",
    "- untested: does not address the claim.",
    "For needs_attention ONLY, set evidenceQuote to the exact sentence copied verbatim from the answer. Otherwise evidenceQuote MUST be null. One-sentence rationale. Never invent quotes.",
  ].join("\n");

  const user = `Concept: ${lesson.title}\nClaim: ${focusClaim.claim}${
    focusClaim.commonMisconception ? `\nWatch for: ${focusClaim.commonMisconception}` : ""
  }\n\nLearner's answer:\n"""${answer}"""`;

  const raw = await callGroqStructured({
    model: FLAGSHIP,
    system,
    user,
    schemaName: "focus_evaluation",
    jsonSchema: asSchema(FOCUS_REQUEST_SCHEMA),
    temperature: 0.15,
  });
  return focusEvaluationSchema.parse(raw);
}

// --- 4. generateTeachingIntervention (fast, anchored on the teaching note) -
export async function generateTeachingIntervention(
  lesson: Lesson,
  focusClaim: LessonClaim,
  breakPointQuote: string | null,
): Promise<TeachingIntervention> {
  const system = [
    "You repair ONE mental-model distinction, briefly, in a teach-back tool.",
    "Ground the correction in the provided teaching note — do NOT introduce new claims or contradict it.",
    "Return: distinction (one or two sentences correcting the specific misunderstanding), example (one short, concrete example or contrast that makes it click), takeaway (one short sentence to hold onto).",
    "Plain language. No lecture.",
  ].join("\n");

  const user = `Concept: ${lesson.title}\nClaim: ${focusClaim.claim}\nTeaching note (source of truth): ${focusClaim.teachingNote}${
    focusClaim.commonMisconception ? `\nThe misconception: ${focusClaim.commonMisconception}` : ""
  }${breakPointQuote ? `\nThe learner said: "${breakPointQuote}"` : ""}\n\nA worked example you may draw on: ${lesson.workedExample}`;

  const raw = await callGroqStructured({
    model: FAST,
    system,
    user,
    schemaName: "teaching_intervention",
    jsonSchema: asSchema(TEACHING_REQUEST_SCHEMA),
    temperature: 0.3,
    maxTokens: 400,
  });
  return teachingInterventionSchema.parse(raw);
}

// --- 5. generateRepairQuestion (fast) -------------------------------------
export async function generateRepairQuestion(
  lesson: Lesson,
  focusClaim: LessonClaim,
  takeaway: string,
): Promise<RepairQuestion> {
  const system = [
    "Ask ONE question that forces the learner to USE the repaired idea in a new situation (type 'apply'), or to explain WHY it works (type 'why').",
    "Prefer 'apply' when the concept has a concrete application. Short, answerable in a few sentences, and it must require using the correction — not restating a definition.",
  ].join("\n");

  const scenario = lesson.applicationScenarios[0] ?? "";
  const user = `Concept: ${lesson.title}\nClaim: ${focusClaim.claim}\nThe correction the learner just saw: ${takeaway}${
    scenario ? `\nAn application scenario you may use: ${scenario}` : ""
  }`;

  const raw = await callGroqStructured({
    model: FAST,
    system,
    user,
    schemaName: "repair_question",
    jsonSchema: asSchema(REPAIR_REQUEST_SCHEMA),
    temperature: 0.4,
    maxTokens: 200,
  });
  return repairQuestionSchema.parse(raw);
}

// --- 6. buildConceptScaffold (flagship, open-concept path) ----------------
export async function buildConceptScaffold(concept: string): Promise<ConceptScaffold> {
  const system = [
    "You build a compact concept scaffold for a teach-back learning tool.",
    "Return an objective (one sentence naming what the learner should be able to explain) and 3 to 5 essential claims: the load-bearing ideas, not trivia.",
    "Each claim: id (kebab-case slug), shortLabel (a 2 to 4 word label for a diagram), claim (one clear sentence), whyItMatters (one sentence), teachingNote (a one-sentence correction of the likely misunderstanding), commonMisconception (a common wrong belief, or null).",
  ].join("\n");

  const raw = await callGroqStructured({
    model: FLAGSHIP,
    system,
    user: `Concept: ${concept}`,
    schemaName: "concept_scaffold",
    jsonSchema: asSchema(SCAFFOLD_REQUEST_SCHEMA),
    temperature: 0.3,
  });
  return conceptScaffoldSchema.parse(raw);
}
