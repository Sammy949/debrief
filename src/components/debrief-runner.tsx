"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { answerCurious, answerRepair, continueDebrief, submitExplanation, wrapUp } from "@/app/debrief/actions";
import type { TurnContent, TurnResult } from "@/app/debrief/turn-types";
import { ResponseField } from "@/components/response-field";
import { Thinking } from "@/components/thinking";
import { UnderstandingMap } from "@/components/understanding-map";
import { createInitialState } from "@/core/reducer";
import type { ClaimState, Lesson, SessionState, Verdict } from "@/core/types";
import {
  clearDraft,
  draftKey,
  loadSession,
  saveSession,
} from "@/lib/session-store";

const STATE_WORD: Record<ClaimState, string> = {
  solid: "solid",
  unclear: "unclear",
  needs_attention: "needs attention",
  untested: "not reached yet",
};

const VERDICT: Record<Verdict, { title: string; line: string; next: string }> = {
  solid_understanding: {
    title: "Nailed it.",
    line: "Your explanation held up under pressure — every claim carried its weight.",
    next: "Come back to a harder concept while this is fresh.",
  },
  understanding_strengthened: {
    title: "That got stronger.",
    line: "You hit one weak point, saw exactly where it broke, and fixed it.",
    next: "Try the idea once more in a new spot to make it stick.",
  },
  gap_to_revisit: {
    title: "One to come back to.",
    line: "You made real progress — part of this just needs another pass.",
    next: "Circle back to the focus point when you've got a few minutes.",
  },
};

/** The technical label voice: Geist mono, tracked, upper. */
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
      {children}
    </p>
  );
}

/** Two-pane workbench: flow on the left, sticky map on the right, ruled between.
 *  Stacks (map on top) on mobile. */
function TwoPane({ left, map }: { left: ReactNode; map: ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-x-14 gap-y-12 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_26rem]">
      <div className="order-2 max-w-2xl lg:order-1">{left}</div>
      <div className="order-1 lg:order-2 lg:border-l lg:border-line lg:pl-14">
        <div className="lg:sticky lg:top-16">{map}</div>
      </div>
    </div>
  );
}

export function DebriefRunner({ lesson: initialLesson }: { lesson: Lesson }) {
  // Lesson lives in state because the open path enriches it (claims decomposed from
  // the explanation) on the first turn; authored lessons simply never change it.
  const [lesson, setLesson] = useState<Lesson>(initialLesson);
  const [state, setState] = useState<SessionState>(() => createInitialState(initialLesson));
  const [content, setContent] = useState<TurnContent>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore a saved session on reload (browser-only, so it runs after mount to
  // stay hydration-safe). No save yet → persist the fresh session so this debrief
  // can be resumed and its draft survives even before the first turn.
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const saved = loadSession(initialLesson.slug);
    if (saved) {
      setLesson(saved.lesson);
      setState(saved.state);
      setContent(saved.content);
    } else {
      saveSession({ lesson: initialLesson, state: createInitialState(initialLesson), content: {} });
    }
  }, [initialLesson]);

  async function runTurn(action: () => Promise<TurnResult>, clearDraftKey?: string) {
    setPending(true);
    setError(null);
    try {
      const result = await action();
      if (result.lesson) setLesson(result.lesson);
      setState(result.state);
      setContent(result.content);
      if (result.error) {
        setError(result.error);
      } else {
        // Persist only a good turn, and only then drop the sent draft — so a reload
        // mid-request keeps both the session and the unsent text.
        saveSession({ lesson: result.lesson ?? lesson, state: result.state, content: result.content });
        if (clearDraftKey) clearDraft(clearDraftKey);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  function restart() {
    const fresh = createInitialState(initialLesson);
    setLesson(initialLesson);
    setState(fresh);
    setContent({});
    setError(null);
    saveSession({ lesson: initialLesson, state: fresh, content: {} });
    for (const field of ["explanation", "curious", "repair"]) {
      clearDraft(draftKey(initialLesson.slug, field));
    }
  }

  // The input area: a thinking shimmer while a turn runs, else the field (+ any recoverable error).
  function inputArea(
    field: string,
    thinkingLabel: string,
    submitLabel: string,
    onSubmit: (text: string) => void,
    opts?: { placeholder?: string; filename?: string },
  ) {
    if (pending) return <Thinking label={thinkingLabel} />;
    return (
      <>
        {error && (
          <p className="mb-3 font-mono text-xs tracking-wide text-terracotta">{error}</p>
        )}
        <ResponseField
          draftKey={draftKey(lesson.slug, field)}
          placeholder={opts?.placeholder}
          filename={opts?.filename}
          submitLabel={submitLabel}
          onSubmit={onSubmit}
        />
      </>
    );
  }

  // Explanation: a single focused column; write cold, no map/claims revealed yet.
  if (state.stage === "explanation") {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col px-6 py-20">
        <Eyebrow>{lesson.title}</Eyebrow>
        <p className="mt-4 font-serif text-2xl leading-snug text-ivory">{lesson.objective}</p>
        <p className="mt-10 font-medium text-ivory">
          Explain it like you&apos;re teaching a curious friend who&apos;s new to it.
        </p>
        <p className="mt-1 mb-5 text-sm text-muted-ink">
          Your own words are perfect — don&apos;t overthink it.
        </p>
        {inputArea(
          "explanation",
          "Reading what you wrote…",
          "Submit explanation",
          (text) => runTurn(() => submitExplanation(lesson, state, text), draftKey(lesson.slug, "explanation")),
          {
            placeholder: "Start with what it is, and why it matters.",
            filename: "~/explanation.md",
          },
        )}
      </div>
    );
  }

  const map = (
    <UnderstandingMap
      variant="rail"
      conceptTitle={lesson.title}
      claims={state.claims}
      focusClaimId={state.focusClaimId}
    />
  );

  const focusEval = state.claims.find((c) => c.id === state.focusClaimId);

  let left: ReactNode;

  if (state.stage === "probe") {
    // Secondary safety net only; the action already resolves a per-kind fallback.
    const probeFallback =
      state.focusKind === "unaddressed"
        ? lesson.fallbackUnaddressedQuestion
        : state.focusKind === "verification"
          ? lesson.fallbackVerificationQuestion
          : lesson.fallbackWeaknessQuestion;
    left = (
      <>
        <Eyebrow>a curious question</Eyebrow>
        <p className="mt-4 mb-6 font-serif text-2xl leading-snug text-ivory">
          {content.curiousQuestion ?? probeFallback}
        </p>
        {inputArea(
          "curious",
          "Working through your answer…",
          "Answer",
          (text) => runTurn(() => answerCurious(lesson, state, text), draftKey(lesson.slug, "curious")),
          { filename: "~/answer.md" },
        )}
      </>
    );
  } else if (state.stage === "teaching") {
    const intervention = content.intervention;
    left = (
      <>
        {focusEval?.evidenceQuote && (
          <div className="mb-10">
            <Eyebrow>
              <span className="text-amber">where the explanation stops holding</span>
            </Eyebrow>
            <blockquote className="mt-3 border-l-2 border-amber pl-5 font-serif text-xl leading-relaxed text-ivory italic">
              {focusEval.evidenceQuote}
            </blockquote>
          </div>
        )}

        {intervention && (
          <div className="mb-10">
            <Eyebrow>the distinction</Eyebrow>
            <p className="mt-3 font-serif text-xl leading-relaxed text-ivory">
              {intervention.distinction}
            </p>
            {intervention.example && (
              <p className="mt-4 text-[0.95rem] leading-relaxed text-ivory-dim">
                {intervention.example}
              </p>
            )}
            {intervention.takeaway && <p className="mt-4 text-ivory">{intervention.takeaway}</p>}
          </div>
        )}

        <Eyebrow>your turn</Eyebrow>
        <p className="mt-4 mb-6 font-serif text-2xl leading-snug text-ivory">
          {content.repairQuestion ?? lesson.fallbackRepairQuestion}
        </p>
        {inputArea(
          "repair",
          "Seeing how that holds up…",
          "Try it",
          (text) => runTurn(() => answerRepair(lesson, state, text), draftKey(lesson.slug, "repair")),
          { filename: "~/repair.md" },
        )}
      </>
    );
  } else if (state.stage === "checkpoint") {
    const solidCount = state.claims.filter((c) => c.state === "solid").length;
    const total = state.claims.length;
    const justWorked = state.claims.find((c) => c.id === state.focusClaimId);
    const line =
      justWorked?.state === "solid"
        ? `${justWorked.shortLabel} is solid now.`
        : justWorked
          ? `${justWorked.shortLabel} is clearer — we can come back to it.`
          : "Good progress.";
    left = (
      <>
        <Eyebrow>nice work</Eyebrow>
        <h2 className="mt-4 font-serif text-3xl leading-snug tracking-tight text-ivory">{line}</h2>
        <p className="mt-3 text-lg leading-relaxed text-ivory-dim">
          {solidCount} of {total} claims are holding. Want to keep going, or wrap up here?
        </p>
        {pending ? (
          <div className="mt-8">
            <Thinking label="Lining up the next one…" />
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => runTurn(() => continueDebrief(lesson, state))}
              className="inline-flex items-center bg-ivory px-6 py-3 font-medium text-obsidian transition-colors hover:bg-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
            >
              Keep going
            </button>
            <button
              onClick={() => runTurn(() => wrapUp(state))}
              className="inline-flex items-center border border-line px-6 py-3 font-medium text-ivory transition-colors hover:bg-surface-high"
            >
              Wrap up
            </button>
          </div>
        )}
      </>
    );
  } else {
    // summary
    const verdict = state.verdict ? VERDICT[state.verdict] : null;
    const focusClaim = lesson.claims.find((c) => c.id === state.focusClaimId);
    const focusSnaps = state.trajectory.filter((s) => s.claimId === state.focusClaimId);
    const from = focusSnaps[0]?.state;
    const to = focusSnaps[focusSnaps.length - 1]?.state;

    left = (
      <>
        {verdict && (
          <>
            <h2 className="font-serif text-3xl tracking-tight text-ivory">{verdict.title}</h2>
            <p className="mt-3 text-lg leading-relaxed text-ivory-dim">{verdict.line}</p>
          </>
        )}

        {focusClaim && from && to && from !== to && (
          <p className="mt-8 font-mono text-xs tracking-wide text-muted-ink">
            {focusClaim.shortLabel}:{" "}
            <span className="text-amber">
              {STATE_WORD[from]} &rarr; {STATE_WORD[to]}
            </span>
          </p>
        )}

        <div className="mt-10">
          <Eyebrow>what&apos;s next</Eyebrow>
          <p className="mt-3 text-ivory">{verdict?.next}</p>
        </div>

        <button
          onClick={restart}
          className="mt-12 border border-line px-6 py-3 font-mono text-[0.7rem] font-medium tracking-[0.16em] uppercase text-ivory transition-colors hover:border-amber hover:text-amber"
        >
          Go again
        </button>
      </>
    );
  }

  return <TwoPane left={left} map={map} />;
}
