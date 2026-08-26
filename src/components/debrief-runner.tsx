"use client";

import { useState, type ReactNode } from "react";
import { answerCurious, answerRepair, submitExplanation } from "@/app/debrief/actions";
import type { TurnContent, TurnResult } from "@/app/debrief/turn-types";
import { ResponseField } from "@/components/response-field";
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

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-sm font-medium text-ink-soft">{children}</p>;
}

function Thinking({ label }: { label: string }) {
  return (
    <p className="shimmer text-sm font-medium text-ink-soft" aria-live="polite">
      {label}
    </p>
  );
}

/** Two-pane workbench: flow on the left, sticky map on the right. Stacks (map on top) on mobile. */
function TwoPane({ left, map }: { left: ReactNode; map: ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-x-14 gap-y-12 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_27rem]">
      <div className="order-2 max-w-2xl lg:order-1">{left}</div>
      <div className="order-1 lg:order-2">
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
  function inputArea(thinkingLabel: string, submitLabel: string, onSubmit: (text: string) => void, placeholder?: string) {
    if (pending) return <Thinking label={thinkingLabel} />;
    return (
      <>
        {error && <p className="mb-3 text-sm font-medium text-sienna-deep">{error}</p>}
        <ResponseField placeholder={placeholder} submitLabel={submitLabel} onSubmit={onSubmit} />
      </>
    );
  }

  // Explanation: a single focused column — write cold, no map/claims revealed yet.
  if (state.stage === "explanation") {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col px-6 py-20">
        <Eyebrow>{lesson.title}</Eyebrow>
        <p className="mt-2 text-lg leading-relaxed text-ink">{lesson.objective}</p>
        <p className="mt-8 font-medium text-ink">
          Explain it as if you were teaching someone curious but new to it.
        </p>
        <p className="mt-1 mb-4 text-sm text-ink-soft">
          Use your own words. You don&apos;t need to be perfect.
        </p>
        {inputArea(
          "Reading your explanation…",
          "Submit explanation",
          (text) => runTurn(() => submitExplanation(lesson, state, text)),
          "Start with what it is, and why it matters.",
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
        <p className="mt-2 mb-5 text-lg font-medium leading-relaxed text-ink">
          {content.curiousQuestion ?? probeFallback}
        </p>
        {inputArea("Considering your answer…", "Answer", (text) =>
          runTurn(() => answerCurious(lesson, state, text)),
        )}
      </>
    );
  } else if (state.stage === "teaching") {
    const intervention = content.intervention;
    left = (
      <>
        {focusEval?.evidenceQuote && (
          <div className="mb-8">
            <p className="text-sm font-medium text-sienna-deep">where the explanation stops holding</p>
            <blockquote className="mt-2 border-l-2 border-sienna pl-4 text-lg leading-relaxed text-ink">
              {focusEval.evidenceQuote}
            </blockquote>
          </div>
        )}

        {intervention && (
          <div className="mb-8">
            <Eyebrow>the distinction</Eyebrow>
            <p className="mt-2 text-lg leading-relaxed text-ink">{intervention.distinction}</p>
            {intervention.example && (
              <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">{intervention.example}</p>
            )}
            {intervention.takeaway && (
              <p className="mt-4 text-ink">{intervention.takeaway}</p>
            )}
          </div>
        )}

        <Eyebrow>try it</Eyebrow>
        <p className="mt-2 mb-5 text-lg font-medium leading-relaxed text-ink">
          {content.repairQuestion ?? lesson.fallbackRepairQuestion}
        </p>
        {inputArea("Checking your repair…", "Try it", (text) =>
          runTurn(() => answerRepair(lesson, state, text)),
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
            <h2 className="font-heading text-2xl font-bold tracking-tight text-ink">{verdict.title}</h2>
            <p className="mt-2 text-lg leading-relaxed text-ink-soft">{verdict.line}</p>
          </>
        )}

        {focusClaim && from && to && from !== to && (
          <p className="mt-6 text-sm text-ink-soft">
            {focusClaim.shortLabel}:{" "}
            <span className="font-medium text-ink">
              {STATE_WORD[from]} &rarr; {STATE_WORD[to]}
            </span>
          </p>
        )}

        <p className="mt-8 text-sm font-medium text-ink-soft">what to do next</p>
        <p className="mt-1 text-ink">{verdict?.next}</p>

        <button
          onClick={restart}
          className="mt-10 rounded-md border border-paper-deep px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-paper-deep"
        >
          Start over
        </button>
      </>
    );
  }

  return <TwoPane left={left} map={map} />;
}
