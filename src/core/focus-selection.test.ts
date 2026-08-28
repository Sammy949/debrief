import { describe, it, expect } from "vitest";
import { createInitialState, reduce, selectFocusClaim } from "./reducer";
import type { Claim, ClaimEvaluation, ClaimState, Lesson } from "./types";

/**
 * Fix 1: focus selection must distinguish "never mentioned" (untested → an
 * invitation) from "verified solid" (all solid → a transfer check). They are
 * opposite signals, so they must never collapse into the same FocusKind.
 */

const claim = (id: string, state: ClaimState, focusOrder: number): Claim => ({
  id,
  sourceClaimId: id,
  claimText: id,
  shortLabel: id,
  whyItMatters: "x",
  state,
  rationale: null,
  evidenceQuote: null,
  focusOrder,
});

describe("selectFocusClaim - kinds", () => {
  it("all untested, none solid → unaddressed (never verification)", () => {
    const focus = selectFocusClaim([
      claim("c1", "untested", 0),
      claim("c2", "untested", 1),
      claim("c3", "untested", 2),
    ]);
    expect(focus?.kind).toBe("unaddressed");
    expect(focus?.claimId).toBe("c1"); // focusOrder tie-break
  });

  it("one needs_attention, rest untested → weakness on the needs_attention claim", () => {
    const focus = selectFocusClaim([
      claim("c1", "untested", 0),
      claim("c2", "needs_attention", 1),
      claim("c3", "untested", 2),
    ]);
    expect(focus?.kind).toBe("weakness");
    expect(focus?.claimId).toBe("c2");
  });

  it("all solid → verification", () => {
    const focus = selectFocusClaim([
      claim("c1", "solid", 0),
      claim("c2", "solid", 1),
      claim("c3", "solid", 2),
    ]);
    expect(focus?.kind).toBe("verification");
  });

  it("mixed unclear + untested → weakness wins (unclear outranks untested)", () => {
    const focus = selectFocusClaim([
      claim("c1", "untested", 0),
      claim("c2", "unclear", 1),
      claim("c3", "untested", 2),
    ]);
    expect(focus?.kind).toBe("weakness");
    expect(focus?.claimId).toBe("c2");
  });

  it("returns null for an empty claim set", () => {
    expect(selectFocusClaim([])).toBeNull();
  });
});

/**
 * Fix 2 (downstream only): the open path decomposes claims from the explanation,
 * then runs the SAME reducer transition as the authored path. This asserts that
 * given a decomposed claim list + its evaluations, the map renders correctly -
 * the decomposition Groq call itself is verified live, not here.
 */
describe("open path - decomposed claims drive the reducer", () => {
  const lessonFrom = (claims: Lesson["claims"]): Lesson => ({
    slug: "open",
    title: "how the internet works",
    mode: "open",
    objective: "x",
    difficulty: "intermediate",
    claims,
    workedExample: "",
    counterexample: "",
    applicationScenarios: [],
    misconceptions: [],
    fallbackWeaknessQuestion: "x",
    fallbackUnaddressedQuestion: "x",
    fallbackVerificationQuestion: "x",
    fallbackRepairQuestion: "x",
  });

  it("seeds the decomposed claims and evaluates them onto the map", () => {
    const enriched = lessonFrom([
      { id: "c1", claim: "Data is split into packets.", shortLabel: "Packets", whyItMatters: "x", teachingNote: "x", commonMisconception: null },
      { id: "c2", claim: "Routers forward packets by address.", shortLabel: "Routing", whyItMatters: "x", teachingNote: "x", commonMisconception: null },
    ]);
    const evaluations: ClaimEvaluation[] = [
      { sourceClaimId: "c1", state: "solid", evidenceQuote: null, rationale: "clear" },
      { sourceClaimId: "c2", state: "needs_attention", evidenceQuote: "routers send the whole file", rationale: "contradiction" },
    ];

    const next = reduce(createInitialState(enriched), {
      type: "SUBMIT_EXPLANATION",
      text: "packets get sent and routers send the whole file",
      evaluation: { evaluations },
    });

    expect(next.stage).toBe("probe");
    expect(next.claims.map((c) => c.state)).toEqual(["solid", "needs_attention"]);
    expect(next.focusClaimId).toBe("c2");
    expect(next.focusKind).toBe("weakness");
    // The break-point quote is located verbatim in the learner's original text.
    expect(next.claims.find((c) => c.id === "c2")!.evidenceQuote).toBe("routers send the whole file");
  });
});
