/**
 * The five AI functions — Debrief's only calls to the model. Each has a narrow
 * role, a strict request schema, and Zod validation on the response. Curated
 * lesson content anchors the teaching so Groq only adapts wording; it cannot
 * invent a wrong distinction. Every function throws on failure — the caller
 * (server action) falls back to authored lesson content.
 *
 * SERVER-ONLY (imports the Groq client, which reads GROQ_API_KEY).
 */

import { callGroqStructured, GroqError, type GroqModel } from "./groq";
import {
  conceptDebriefSchema,
  curiousQuestionSchema,
  rawConceptDebriefSchema,
  rawExplanationEvaluationSchema,
  rawFocusEvaluationSchema,
  repairQuestionSchema,
  teachingInterventionSchema,
} from "./schemas";
import type { z } from "zod";
import type {
  ClaimEvaluation,
  ClaimState,
  ExplanationEvaluation,
  FocusEvaluation,
  Lesson,
  LessonClaim,
} from "@/core/types";

export type CuriousQuestion = z.infer<typeof curiousQuestionSchema>;
export type TeachingIntervention = z.infer<typeof teachingInterventionSchema>;
export type RepairQuestion = z.infer<typeof repairQuestionSchema>;
export type ConceptDebrief = z.infer<typeof conceptDebriefSchema>;

/** The quote invariant lives here, not in the schema: only a contradicted claim
 *  keeps a break-point quote; every other state is forced to null. The reducer
 *  then checks that quote against the learner's actual text. */
function normalizeClaimEval(e: {
  sourceClaimId: string;
  state: ClaimState;
  evidenceQuote?: string | null;
  rationale?: string;
}): ClaimEvaluation {
  const rationale = e.rationale ?? "";
  return e.state === "needs_attention"
    ? { sourceClaimId: e.sourceClaimId, state: "needs_attention", evidenceQuote: e.evidenceQuote ?? "", rationale }
    : { sourceClaimId: e.sourceClaimId, state: e.state, evidenceQuote: null, rationale };
}

function normalizeFocusEval(e: {
  state: ClaimState;
  evidenceQuote?: string | null;
  rationale?: string;
}): FocusEvaluation {
  const rationale = e.rationale ?? "";
  return e.state === "needs_attention"
    ? { state: "needs_attention", evidenceQuote: e.evidenceQuote ?? "", rationale }
    : { state: e.state, evidenceQuote: null, rationale };
}

const FLAGSHIP: GroqModel = "openai/gpt-oss-120b"; // reliability-critical: evaluate + scaffold
const FAST: GroqModel = "openai/gpt-oss-20b"; //  generative: question / intervention / repair

// Shared voice for everything the learner reads. Evaluators stay neutral; the
// generative prompts (questions, teaching) speak in this coach voice.
const TONE =
  "Voice: an encouraging coach — warm, second person, a little momentum. A brief, genuine bit of reassurance is welcome; keep it plain and human, never clinical or rubric-like. Contractions are good. No emoji.";

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

const CONCEPT_DEBRIEF_REQUEST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["claims", "evaluations"],
  properties: {
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
  const parsed = rawExplanationEvaluationSchema.parse(raw);
  return { evaluations: parsed.evaluations.map(normalizeClaimEval) };
}

// --- 2. probe questions (fast) — one generator per FocusKind --------------
// All three return the same { question } shape; the reducer's focusKind picks which
// fires. They differ only in intent, because probing a wrong answer, inviting the
// learner into an untouched gap, and stress-testing a solid answer are three
// different conversations.

/** `weakness`: the claim was wrong or vague — probe the weakest point of what they said. */
export async function generateWeaknessQuestion(
  lesson: Lesson,
  focusClaim: LessonClaim,
  learnerText: string,
): Promise<CuriousQuestion> {
  const system = [
    "You are a curious, patient reviewer in a teach-back tool.",
    "The learner's account of this claim is weak or partly off. Ask ONE short, naive follow-up question that probes exactly the weakest point of what they said.",
    "It must be answerable in a sentence or two and must NOT reveal the answer. Return only the question.",
    TONE,
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

/** `unaddressed`: the learner never touched this part — invite them into it. */
export async function generateUnaddressedQuestion(
  lesson: Lesson,
  focusClaim: LessonClaim,
): Promise<CuriousQuestion> {
  const system = [
    "You are a warm, direct reviewer in a teach-back tool.",
    "The learner has NOT yet addressed one part of this concept. Ask ONE friendly, direct question inviting them to explain that specific part in their own words.",
    "Do NOT imply they already claimed anything about it. Do NOT ask a hypothetical 'what if' question. Name the actual gap. One or two sentences. Return only the question.",
    TONE,
  ].join("\n");

  const user = `Concept: ${lesson.title}\nThe part they haven't covered yet: ${focusClaim.claim}\nWhy it matters: ${focusClaim.whyItMatters}`;

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

/** `verification`: every claim was solid — a transfer check in a new situation. */
export async function generateVerificationQuestion(
  lesson: Lesson,
  focusClaim: LessonClaim,
  learnerText: string,
): Promise<CuriousQuestion> {
  const system = [
    "You are a curious reviewer in a teach-back tool. The learner explained every essential claim solidly, so this is a transfer check, not a correction.",
    "Point to a SPECIFIC, concrete example or scenario and ask what happens in it — so the learner has to use the idea, not restate it.",
    "Sound like a curious person, not a rubric. NEVER use abstract phrasing like 'apply this in a new situation' or 'use this idea in a new context'; name an actual case instead. One or two sentences, answerable briefly, and don't reveal the answer. Return only the question.",
    TONE,
  ].join("\n");

  const user = `Concept: ${lesson.title}\nClaim to stress-test: ${focusClaim.claim}\nWhy it matters: ${focusClaim.whyItMatters}\n\nWhat the learner said:\n"""${learnerText}"""`;

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
  return normalizeFocusEval(rawFocusEvaluationSchema.parse(raw));
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
    TONE,
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
    "Prefer 'apply' when the concept has a concrete application. Ground it in a SPECIFIC example — name the case rather than saying 'a new situation' abstractly. Warm, plain, human phrasing, answerable in a few sentences, and it must require using the correction, not restating a definition.",
    TONE,
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

// --- 6. decomposeAndEvaluate (flagship, open-concept path) ----------------
// ONE call that maps the learner's OWN explanation into claims AND judges each
// against it. The claims trace back to what the learner actually said, not a
// textbook syllabus imposed on the topic name before they wrote a word.
export async function decomposeAndEvaluate(
  concept: string,
  explanation: string,
): Promise<ConceptDebrief> {
  const system = [
    "You map a learner's explanation into its essential claims AND judge each one, in a single pass, for a teach-back learning tool. You are not authoring a textbook curriculum.",
    "CLAIMS: From the topic and the learner's OWN explanation, identify 3 to 5 claims that a complete, correct version of THIS explanation would need to make. Base them on the framing and vocabulary the learner actually used — each claim should trace back to something they said or gestured at — not on a standard textbook breakdown of the topic. Add a claim the learner omitted ONLY if it is genuinely essential to correctness (not merely a deeper detail).",
    "For each claim: id (exactly 'c1','c2',… in order), shortLabel (2 to 4 words for a diagram), claim (one clear sentence), whyItMatters (one sentence), teachingNote (a one-sentence correction of the likely misunderstanding), commonMisconception (a common wrong belief, or null).",
    "EVALUATION: Then judge EACH claim from the explanation ALONE, returning exactly one evaluation per claim whose sourceClaimId is that claim's id:",
    "- solid: clearly and correctly explained.",
    "- unclear: mentioned but vague or partial, not specifically wrong.",
    "- needs_attention: the explanation says something that CONTRADICTS the claim (a real misconception).",
    "- untested: not addressed at all.",
    "Quote rule: for needs_attention ONLY, set evidenceQuote to the EXACT sentence copied verbatim from the explanation. For solid, unclear, and untested, evidenceQuote MUST be null. Never invent quotes. Keep each rationale to one sentence.",
  ].join("\n");

  const user = `Topic: ${concept}\n\nLearner's explanation:\n"""${explanation}"""`;

  const raw = await callGroqStructured({
    model: FLAGSHIP,
    system,
    user,
    schemaName: "concept_debrief",
    jsonSchema: asSchema(CONCEPT_DEBRIEF_REQUEST_SCHEMA),
    temperature: 0.2,
    maxTokens: 2000,
  });
  const parsed = rawConceptDebriefSchema.parse(raw);

  const ids = parsed.claims.map((c) => c.id);
  const idSet = new Set(ids);

  // A thin explanation can yield an empty or degenerate decomposition. Don't
  // advance the loop into a focus-less probe: require a real map with distinct
  // claim ids. The caller turns this into an "add a bit more detail" prompt.
  if (parsed.claims.length < 2 || idSet.size !== ids.length) {
    throw new GroqError(
      `decomposeAndEvaluate: degenerate decomposition (${parsed.claims.length} claims, ${idSet.size} distinct)`,
    );
  }

  const claims = parsed.claims.map((c) => ({
    id: c.id,
    shortLabel: c.shortLabel,
    claim: c.claim,
    whyItMatters: c.whyItMatters ?? "",
    teachingNote: c.teachingNote ?? "",
    commonMisconception: c.commonMisconception ?? null,
  }));

  // Reconcile rather than reject: keep one evaluation per real claim id, drop the
  // rest. A claim the model didn't evaluate simply stays `untested` in the reducer
  // — a valid state, not a reason to fail the whole turn.
  const seen = new Set<string>();
  const evaluations: ClaimEvaluation[] = [];
  for (const e of parsed.evaluations) {
    if (!idSet.has(e.sourceClaimId) || seen.has(e.sourceClaimId)) continue;
    seen.add(e.sourceClaimId);
    evaluations.push(normalizeClaimEval(e));
  }

  return { claims, evaluations };
}
