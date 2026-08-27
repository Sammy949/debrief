/**
 * Debrief — the pure state machine. "The reducer decides."
 *
 * Every transition lives here as a pure function of (state, event). The AI's
 * validated judgment rides on the event, so nothing in this file calls Groq,
 * Convex, or React. That is what makes the whole loop testable with fixtures.
 */

import type {
  Claim,
  ClaimSnapshot,
  ClaimState,
  DebriefEvent,
  EvalPhase,
  FocusEvaluation,
  FocusKind,
  Lesson,
  SessionState,
  Verdict,
} from "./types";

/** Hard backstop so a session can never loop forever. Raised for multi-claim
 *  sessions: explanation + several probe/repair cycles before the cap bites. */
export const MAX_TURNS = 12;

/** Focus priority: a live misconception is the most valuable single probe. */
const WEAKNESS_PRIORITY: Record<ClaimState, number> = {
  needs_attention: 0,
  unclear: 1,
  untested: 2,
  solid: 3,
};

// ---------------------------------------------------------------------------
// Initial state — a session begins in `explanation` with every claim untested.
// ---------------------------------------------------------------------------

export function createInitialState(lesson: Lesson): SessionState {
  const claims: Claim[] = lesson.claims.map((c, i) => ({
    id: c.id,
    sourceClaimId: c.id,
    claimText: c.claim,
    shortLabel: c.shortLabel,
    whyItMatters: c.whyItMatters,
    state: "untested",
    rationale: null,
    evidenceQuote: null,
    focusOrder: i,
  }));

  return {
    stage: "explanation",
    claims,
    focusClaimId: null,
    focusKind: null,
    turnCount: 0,
    brokeAtProbe: false,
    verdict: null,
    trajectory: [],
    explanationText: "",
  };
}

// ---------------------------------------------------------------------------
// Evidence-quote validation — normalize, locate in the ORIGINAL text, and
// return the learner's ORIGINAL words for the matched span (never the
// normalized form). Resilient to case / whitespace / quote / dash drift.
// ---------------------------------------------------------------------------

function normalizeWithMap(text: string): { norm: string; map: number[] } {
  let norm = "";
  const map: number[] = []; // map[i] = original index of the i-th normalized char
  let prevSpace = false;

  for (let i = 0; i < text.length; i++) {
    let ch = text[i];
    if (ch === "‘" || ch === "’") ch = "'";
    else if (ch === "“" || ch === "”") ch = '"';
    else if (ch === "–" || ch === "—") ch = "-";

    if (/\s/.test(ch)) {
      if (prevSpace) continue; // collapse runs of whitespace
      norm += " ";
      map.push(i);
      prevSpace = true;
    } else {
      norm += ch.toLowerCase();
      map.push(i);
      prevSpace = false;
    }
  }
  return { norm, map };
}

export function validateEvidenceQuote(quote: string | null, sourceText: string): string | null {
  if (!quote || !quote.trim()) return null;

  const { norm, map } = normalizeWithMap(sourceText);
  const needle = normalizeWithMap(quote).norm.trim();
  if (!needle) return null;

  const start = norm.indexOf(needle);
  if (start === -1) return null; // not actually in the learner's text → discard

  const origStart = map[start];
  const origEnd = map[start + needle.length - 1] + 1;
  return sourceText.slice(origStart, origEnd);
}

// ---------------------------------------------------------------------------
// Focus selection — one focus per debrief.
// ---------------------------------------------------------------------------

export function selectFocusClaim(claims: Claim[]): { claimId: string; kind: FocusKind } | null {
  if (claims.length === 0) return null;

  const [top] = [...claims].sort(
    (a, b) =>
      WEAKNESS_PRIORITY[a.state] - WEAKNESS_PRIORITY[b.state] || a.focusOrder - b.focusOrder,
  );

  // "Never mentioned" and "verified solid" are opposite signals, not neighbours.
  // Priority ordering guarantees: `solid` here means every claim is solid (transfer
  // check); `untested` here means nothing weaker exists, so it is a genuine gap to
  // invite the learner into — never a stress-test of an answer they never gave.
  const kind: FocusKind =
    top.state === "solid" ? "verification" : top.state === "untested" ? "unaddressed" : "weakness";
  return { claimId: top.id, kind };
}

// ---------------------------------------------------------------------------
// Guards / verdict.
// ---------------------------------------------------------------------------

/** Teaching is mandatory the moment the focus claim does not hold. */
export function shouldTeach(focusState: ClaimState): boolean {
  return focusState !== "solid";
}

/**
 * The verdict is a function of the WHOLE map in BOTH branches. A session
 * settles well only when every claim is solid; `brokeAtProbe` merely decides
 * whether that reads as "strengthened" (we repaired a gap) or "solid" (it held
 * first try). Anything less than a fully-solid map is `gap_to_revisit`.
 */
export function aggregateVerdict(state: SessionState): Verdict {
  if (!state.claims.every((c) => c.state === "solid")) return "gap_to_revisit";
  return state.brokeAtProbe ? "understanding_strengthened" : "solid_understanding";
}

// ---------------------------------------------------------------------------
// Internals.
// ---------------------------------------------------------------------------

function snapshotFocus(claim: Claim, phase: EvalPhase): ClaimSnapshot {
  return {
    claimId: claim.id,
    phase,
    state: claim.state,
    rationale: claim.rationale,
    evidenceQuote: claim.evidenceQuote,
  };
}

/** Apply a single-claim re-evaluation to the focus claim, validating its quote. */
function applyFocusEval(
  state: SessionState,
  evaluation: FocusEvaluation,
  sourceText: string,
): Claim[] {
  const quote = validateEvidenceQuote(evaluation.evidenceQuote, sourceText);
  return state.claims.map((c) =>
    c.id === state.focusClaimId
      ? { ...c, state: evaluation.state, rationale: evaluation.rationale, evidenceQuote: quote }
      : c,
  );
}

function toSummary(state: SessionState): SessionState {
  const settled: SessionState = { ...state, stage: "summary" };
  return { ...settled, verdict: aggregateVerdict(settled) };
}

/**
 * Claims still worth a probe, EXCLUDING the one just worked — so continuing never
 * immediately re-focuses the same claim (that would loop on a stubborn gap; the
 * turn cap and the learner's "wrap up" are the ways out). Empty ⇒ nothing left to
 * offer, so the session settles instead of pausing at a checkpoint.
 */
function openClaimsAfter(state: SessionState): Claim[] {
  return state.claims.filter((c) => c.state !== "solid" && c.id !== state.focusClaimId);
}

/** After a claim resolves: pause at a checkpoint if there's more to work on, else settle. */
function resolveOrCheckpoint(state: SessionState): SessionState {
  return openClaimsAfter(state).length > 0 ? { ...state, stage: "checkpoint" } : toSummary(state);
}

// ---------------------------------------------------------------------------
// The reducer.
// ---------------------------------------------------------------------------

export function reduce(state: SessionState, event: DebriefEvent): SessionState {
  if (state.stage === "summary") return state; // terminal
  // Backstop: a session that hits the turn cap is, by definition, unresolved —
  // force a summary with an explicit gap_to_revisit, never an accidental verdict.
  if (state.turnCount >= MAX_TURNS) {
    return { ...state, stage: "summary", verdict: "gap_to_revisit" };
  }

  switch (event.type) {
    case "SUBMIT_EXPLANATION": {
      if (state.stage !== "explanation") return state;

      const claims = state.claims.map((c) => {
        const ev = event.evaluation.evaluations.find((e) => e.sourceClaimId === c.sourceClaimId);
        if (!ev) return c;
        return {
          ...c,
          state: ev.state,
          rationale: ev.rationale,
          evidenceQuote: validateEvidenceQuote(ev.evidenceQuote, event.text),
        };
      });

      const focus = selectFocusClaim(claims);
      const trajectory = [
        ...state.trajectory,
        ...claims.map((c) => snapshotFocus(c, "explanation")),
      ];

      return {
        ...state,
        claims,
        focusClaimId: focus?.claimId ?? null,
        focusKind: focus?.kind ?? null,
        stage: "probe",
        turnCount: state.turnCount + 1,
        trajectory,
        explanationText: event.text,
      };
    }

    case "ANSWER_CURIOUS": {
      if (state.stage !== "probe" || !state.focusClaimId) return state;

      const claims = applyFocusEval(state, event.evaluation, event.text);
      const focus = claims.find((c) => c.id === state.focusClaimId)!;
      const next: SessionState = {
        ...state,
        claims,
        turnCount: state.turnCount + 1,
        trajectory: [...state.trajectory, snapshotFocus(focus, "probe")],
      };

      // Broke → teaching is mandatory. Held → resolve (checkpoint or settle).
      if (shouldTeach(focus.state)) {
        return { ...next, stage: "teaching", brokeAtProbe: true };
      }
      return resolveOrCheckpoint(next);
    }

    case "ANSWER_REPAIR": {
      if (state.stage !== "teaching" || !state.focusClaimId) return state;

      const claims = applyFocusEval(state, event.evaluation, event.text);
      const focus = claims.find((c) => c.id === state.focusClaimId)!;
      return resolveOrCheckpoint({
        ...state,
        claims,
        turnCount: state.turnCount + 1,
        trajectory: [...state.trajectory, snapshotFocus(focus, "repair")],
      });
    }

    // Learner chose to keep going: focus the next weakest open claim and re-probe.
    case "CONTINUE": {
      if (state.stage !== "checkpoint") return state;
      const focus = selectFocusClaim(openClaimsAfter(state));
      if (!focus) return toSummary(state);
      return { ...state, stage: "probe", focusClaimId: focus.claimId, focusKind: focus.kind };
    }

    // Learner chose to wrap up: settle on the map as it stands.
    case "WRAP_UP": {
      if (state.stage !== "checkpoint") return state;
      return toSummary(state);
    }

    default:
      return state;
  }
}
