import { describe, it, expect } from "vitest";
import {
  MAX_TURNS,
  aggregateVerdict,
  createInitialState,
  reduce,
  selectFocusClaim,
  validateEvidenceQuote,
} from "./reducer";
import type { Claim, ClaimEvaluation, ExplanationEvaluation, FocusEvaluation, Lesson, SessionState } from "./types";

// --- fixture lesson -------------------------------------------------------
const lesson: Lesson = {
  slug: "closures",
  title: "Closures",
  mode: "authored",
  objective: "Explain what a closure retains.",
  difficulty: "foundations",
  claims: [
    { id: "c1", claim: "A closure retains its surrounding scope.", shortLabel: "Retains scope", whyItMatters: "x", teachingNote: "x", commonMisconception: null },
    { id: "c2", claim: "A closure captures the variable, not a copied value.", shortLabel: "Captures variable", whyItMatters: "x", teachingNote: "x", commonMisconception: "freezes value" },
    { id: "c3", claim: "Each closure keeps its own environment.", shortLabel: "Own environment", whyItMatters: "x", teachingNote: "x", commonMisconception: null },
  ],
  workedExample: "x",
  counterexample: "x",
  applicationScenarios: ["x"],
  misconceptions: ["x"],
  fallbackWeaknessQuestion: "x",
  fallbackUnaddressedQuestion: "x",
  fallbackVerificationQuestion: "x",
  fallbackRepairQuestion: "x",
};

// --- fixture judgment builders (respect the discriminated unions) --------
const expl = (evaluations: ClaimEvaluation[]): ExplanationEvaluation => ({ evaluations });
const solid = (id: string): ClaimEvaluation => ({ sourceClaimId: id, state: "solid", evidenceQuote: null, rationale: "clear" });
const unclear = (id: string): ClaimEvaluation => ({ sourceClaimId: id, state: "unclear", evidenceQuote: null, rationale: "vague" });
const untested = (id: string): ClaimEvaluation => ({ sourceClaimId: id, state: "untested", evidenceQuote: null, rationale: "not addressed" });
const attention = (id: string, quote: string): ClaimEvaluation => ({ sourceClaimId: id, state: "needs_attention", evidenceQuote: quote, rationale: "contradiction" });

const fSolid: FocusEvaluation = { state: "solid", evidenceQuote: null, rationale: "clear now" };
const fUnclear: FocusEvaluation = { state: "unclear", evidenceQuote: null, rationale: "still vague" };
const fAttention = (quote: string): FocusEvaluation => ({ state: "needs_attention", evidenceQuote: quote, rationale: "still off" });

describe("createInitialState", () => {
  it("starts in explanation with every claim untested and no focus", () => {
    const s = createInitialState(lesson);
    expect(s.stage).toBe("explanation");
    expect(s.claims).toHaveLength(3);
    expect(s.claims.every((c) => c.state === "untested")).toBe(true);
    expect(s.focusClaimId).toBeNull();
    expect(s.turnCount).toBe(0);
    expect(s.verdict).toBeNull();
  });
});

describe("selectFocusClaim", () => {
  const base = createInitialState(lesson).claims;
  const withStates = (states: Record<string, Claim["state"]>): Claim[] =>
    base.map((c) => ({ ...c, state: states[c.id] ?? c.state }));

  it("prefers needs_attention over unclear over untested", () => {
    const claims = withStates({ c1: "unclear", c2: "needs_attention", c3: "untested" });
    expect(selectFocusClaim(claims)?.claimId).toBe("c2");
  });
  it("falls to unclear when there is no contradiction", () => {
    const claims = withStates({ c1: "solid", c2: "unclear", c3: "untested" });
    expect(selectFocusClaim(claims)?.claimId).toBe("c2");
  });
  it("returns a verification focus when everything is solid", () => {
    const claims = withStates({ c1: "solid", c2: "solid", c3: "solid" });
    expect(selectFocusClaim(claims)?.kind).toBe("verification");
  });
});

describe("validateEvidenceQuote", () => {
  it("recovers the learner's original casing for a normalized match", () => {
    expect(validateEvidenceQuote("freezes the value", "A closure Freezes The Value at creation.")).toBe("Freezes The Value");
  });
  it("discards a quote that isn't in the text", () => {
    expect(validateEvidenceQuote("copies the reference", "a closure freezes the value")).toBeNull();
  });
  it("returns null for a null quote", () => {
    expect(validateEvidenceQuote(null, "anything")).toBeNull();
  });
});

describe("the loop", () => {
  it("strong path: all solid, probe holds → solid_understanding", () => {
    let s = createInitialState(lesson);
    s = reduce(s, { type: "SUBMIT_EXPLANATION", text: "a full explanation", evaluation: expl([solid("c1"), solid("c2"), solid("c3")]) });
    expect(s.stage).toBe("probe");
    expect(s.focusKind).toBe("verification");
    s = reduce(s, { type: "ANSWER_CURIOUS", text: "transfer answer", evaluation: fSolid });
    expect(s.stage).toBe("summary");
    expect(s.verdict).toBe("solid_understanding");
  });

  it("2+ gaps pause at select_focus; the learner picks, then the loop runs", () => {
    let s = createInitialState(lesson);
    s = reduce(s, { type: "SUBMIT_EXPLANATION", text: "the explanation", evaluation: expl([solid("c1"), attention("c2", "the explanation"), unclear("c3")]) });
    expect(s.stage).toBe("select_focus");
    expect(s.focusClaimId).toBeNull();
    // a probe answer is ignored until a focus is chosen
    expect(reduce(s, { type: "ANSWER_CURIOUS", text: "x", evaluation: fSolid })).toBe(s);
    s = reduce(s, { type: "SET_FOCUS", claimId: "c2" });
    expect(s.stage).toBe("probe");
    expect(s.focusClaimId).toBe("c2");
    expect(s.focusKind).toBe("weakness");
    s = reduce(s, { type: "ANSWER_CURIOUS", text: "clarified", evaluation: fSolid });
    expect(s.stage).toBe("checkpoint"); // c3 still unclear
    s = reduce(s, { type: "WRAP_UP" });
    expect(s.stage).toBe("summary");
    expect(s.verdict).toBe("gap_to_revisit");
  });

  it("set focus only works from select_focus, and only for a real claim", () => {
    const s = createInitialState(lesson);
    expect(reduce(s, { type: "SET_FOCUS", claimId: "c1" })).toBe(s); // wrong stage
    const picking = reduce(s, {
      type: "SUBMIT_EXPLANATION",
      text: "the explanation",
      evaluation: expl([solid("c1"), attention("c2", "the explanation"), unclear("c3")]),
    });
    expect(picking.stage).toBe("select_focus");
    expect(reduce(picking, { type: "SET_FOCUS", claimId: "nope" })).toBe(picking); // unknown claim
  });

  it("keep going advances to the next weakest claim and re-probes", () => {
    let s = createInitialState(lesson);
    s = reduce(s, { type: "SUBMIT_EXPLANATION", text: "the explanation", evaluation: expl([solid("c1"), attention("c2", "the explanation"), unclear("c3")]) });
    s = reduce(s, { type: "SET_FOCUS", claimId: "c2" });
    s = reduce(s, { type: "ANSWER_CURIOUS", text: "clarified", evaluation: fSolid });
    expect(s.stage).toBe("checkpoint");
    s = reduce(s, { type: "CONTINUE" });
    // next weakest open claim is c3 (unclear), never the just-solved c2.
    expect(s.stage).toBe("probe");
    expect(s.focusClaimId).toBe("c3");
    // resolving it too, with nothing left open, settles the whole map.
    s = reduce(s, { type: "ANSWER_CURIOUS", text: "c3 explained", evaluation: fSolid });
    expect(s.stage).toBe("summary");
    // nothing ever broke AT a probe (c2 was self-corrected there), so it reads as solid.
    expect(s.verdict).toBe("solid_understanding");
  });

  it("continue is ignored off a checkpoint; wrap up only settles from a checkpoint", () => {
    let s = createInitialState(lesson);
    s = reduce(s, { type: "SUBMIT_EXPLANATION", text: "x", evaluation: expl([solid("c1"), solid("c2"), untested("c3")]) });
    expect(s.stage).toBe("probe");
    expect(reduce(s, { type: "CONTINUE" })).toBe(s);
    expect(reduce(s, { type: "WRAP_UP" })).toBe(s);
  });

  it("break → teach → repair recovers → understanding_strengthened", () => {
    let s = createInitialState(lesson);
    s = reduce(s, { type: "SUBMIT_EXPLANATION", text: "it stores the value", evaluation: expl([solid("c1"), attention("c2", "it stores the value"), solid("c3")]) });
    expect(s.focusClaimId).toBe("c2");
    s = reduce(s, { type: "ANSWER_CURIOUS", text: "still stores the value", evaluation: fAttention("still stores the value") });
    expect(s.stage).toBe("teaching");
    expect(s.brokeAtProbe).toBe(true);
    s = reduce(s, { type: "ANSWER_REPAIR", text: "it keeps a live reference", evaluation: fSolid });
    expect(s.stage).toBe("summary");
    expect(s.verdict).toBe("understanding_strengthened");
  });

  it("break → teach → repair fails → gap_to_revisit", () => {
    let s = createInitialState(lesson);
    s = reduce(s, { type: "SUBMIT_EXPLANATION", text: "it stores the value", evaluation: expl([solid("c1"), attention("c2", "it stores the value"), solid("c3")]) });
    s = reduce(s, { type: "ANSWER_CURIOUS", text: "stores the value", evaluation: fAttention("stores the value") });
    expect(s.stage).toBe("teaching");
    s = reduce(s, { type: "ANSWER_REPAIR", text: "not sure", evaluation: fUnclear });
    expect(s.stage).toBe("summary");
    expect(s.verdict).toBe("gap_to_revisit");
  });

  it("an untested focus carries no break-point quote", () => {
    let s = createInitialState(lesson);
    s = reduce(s, { type: "SUBMIT_EXPLANATION", text: "partial explanation", evaluation: expl([solid("c1"), solid("c2"), untested("c3")]) });
    expect(s.focusClaimId).toBe("c3");
    expect(s.focusKind).toBe("unaddressed");
    expect(s.claims.find((c) => c.id === "c3")!.evidenceQuote).toBeNull();
  });

  it("discards an invalid break-point quote but keeps a valid one", () => {
    let bad = createInitialState(lesson);
    bad = reduce(bad, { type: "SUBMIT_EXPLANATION", text: "a closure freezes the value", evaluation: expl([solid("c1"), attention("c2", "not in the text"), solid("c3")]) });
    expect(bad.claims.find((c) => c.id === "c2")!.evidenceQuote).toBeNull();

    let good = createInitialState(lesson);
    good = reduce(good, { type: "SUBMIT_EXPLANATION", text: "a closure freezes the value", evaluation: expl([solid("c1"), attention("c2", "freezes the value"), solid("c3")]) });
    expect(good.claims.find((c) => c.id === "c2")!.evidenceQuote).toBe("freezes the value");
  });

  it("ignores out-of-order events", () => {
    const s = createInitialState(lesson);
    expect(reduce(s, { type: "ANSWER_CURIOUS", text: "x", evaluation: fSolid })).toBe(s);
  });
});

describe("safety", () => {
  it("summary is terminal", () => {
    const s: SessionState = { ...createInitialState(lesson), stage: "summary", verdict: "solid_understanding" };
    expect(reduce(s, { type: "SUBMIT_EXPLANATION", text: "x", evaluation: expl([solid("c1")]) })).toBe(s);
  });

  it("the turn cap forces summary + gap_to_revisit, never a rosy accident", () => {
    const s: SessionState = { ...createInitialState(lesson), turnCount: MAX_TURNS };
    const after = reduce(s, { type: "SUBMIT_EXPLANATION", text: "x", evaluation: expl([solid("c1"), solid("c2"), solid("c3")]) });
    expect(after.stage).toBe("summary");
    expect(after.verdict).toBe("gap_to_revisit");
  });

  it("aggregateVerdict is whole-map in both branches", () => {
    const s = createInitialState(lesson);
    const allSolid = s.claims.map((c) => ({ ...c, state: "solid" as const }));
    expect(aggregateVerdict({ ...s, claims: allSolid, brokeAtProbe: false })).toBe("solid_understanding");
    expect(aggregateVerdict({ ...s, claims: allSolid, brokeAtProbe: true })).toBe("understanding_strengthened");
    const oneWeak = allSolid.map((c) => (c.id === "c3" ? { ...c, state: "unclear" as const } : c));
    expect(aggregateVerdict({ ...s, claims: oneWeak, brokeAtProbe: true })).toBe("gap_to_revisit");
  });
});
