"use client";

import { useState, type ReactNode } from "react";
import { answerCurious, answerRepair, submitExplanation } from "@/app/debrief/actions";
import type { TurnContent, TurnResult } from "@/app/debrief/turn-types";
import { ResponseField } from "@/components/response-field";
import { Thinking } from "@/components/thinking";
import { UnderstandingMap } from "@/components/understanding-map";
import { createInitialState } from "@/core/reducer";
import type { ClaimState, Lesson, SessionState, Verdict } from "@/core/types";

const STATE_WORD: Record<ClaimState, string> = {
  solid: "solid",
  unclear: "unclear",
  needs_attention: "needs attention",
  untested: "not reached yet",
};

const VERDICT: Record<Verdict, { title: string; line: string; next: string }> = {
  solid_understanding: {
    title: "Solid understanding",
    line: "Your explanation held up under pressure. Every claim carried its weight.",
    next: "Come back to a harder concept while this is fresh.",
  },
  understanding_strengthened: {
    title: "Your explanation got stronger",
    line: "You hit one weak point, saw exactly where it broke, and repaired it.",
    next: "Try the idea once more in a new situation to make it durable.",
  },
  gap_to_revisit: {
    title: "A gap to revisit",
    line: "You made real progress, but part of the idea still needs another pass.",
    next: "Revisit the focus point when you have a few minutes.",
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

  async function runTurn(action: () => Promise<TurnResult>) {
    setPending(true);
    setError(null);
    try {
      const result = await action();
      if (result.lesson) setLesson(result.lesson);
      setState(result.state);
      setContent(result.content);
      if (result.error) setError(result.error);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  function restart() {
    setLesson(initialLesson);
    setState(createInitialState(initialLesson));
    setContent({});
    setError(null);
  }

  // The input area: a thinking shimmer while a turn runs, else the field (+ any recoverable error).
  function inputArea(
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
          placeholder={opts?.placeholder}
          filename={opts?.filename}
          submitLabel={submitLabel}
          onSubmit={onSubmit}
        />
      </>
    );
  }

  // Explanation: a single focused column — write cold, no map/claims revealed yet.
  if (state.stage === "explanation") {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col px-6 py-20">
        <Eyebrow>{lesson.title}</Eyebrow>
        <p className="mt-4 font-serif text-2xl leading-snug text-ivory">{lesson.objective}</p>
        <p className="mt-10 font-medium text-ivory">
          Explain it as if you were teaching someone curious but new to it.
        </p>
        <p className="mt-1 mb-5 text-sm text-muted-ink">
          Use your own words. You don&apos;t need to be perfect.
        </p>
        {inputArea(
          "Reading what you wrote…",
          "Submit explanation",
          (text) => runTurn(() => submitExplanation(lesson, state, text)),
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
    // Secondary safety net only — the action already resolves a per-kind fallback.
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
          "Thinking about your answer…",
          "Answer",
          (text) => runTurn(() => answerCurious(lesson, state, text)),
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

        <Eyebrow>try it</Eyebrow>
        <p className="mt-4 mb-6 font-serif text-2xl leading-snug text-ivory">
          {content.repairQuestion ?? lesson.fallbackRepairQuestion}
        </p>
        {inputArea(
          "Seeing how that holds up…",
          "Try it",
          (text) => runTurn(() => answerRepair(lesson, state, text)),
          { filename: "~/repair.md" },
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
          <Eyebrow>what to do next</Eyebrow>
          <p className="mt-3 text-ivory">{verdict?.next}</p>
        </div>

        <button
          onClick={restart}
          className="mt-12 border border-line px-6 py-3 font-mono text-[0.7rem] font-medium tracking-[0.16em] uppercase text-ivory transition-colors hover:border-amber hover:text-amber"
        >
          Start over
        </button>
      </>
    );
  }

  return <TwoPane left={left} map={map} />;
}
