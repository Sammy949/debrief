"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { startOpenDebrief } from "@/app/debrief/actions";
import { DebriefRunner } from "@/components/debrief-runner";
import { Thinking } from "@/components/thinking";
import { Wordmark } from "@/components/wordmark";
import { clearDraft, clearSession, draftKey, loadDraft, loadOpenSession, saveDraft } from "@/lib/session-store";
import type { Lesson } from "@/core/types";

const CONCEPT_KEY = draftKey("new", "concept");

// Ambient examples that cycle in the input, deliberately mixed across domains so
// the entry never reads as dev-only. First one is the reduced-motion fallback.
const PLACEHOLDERS = [
  "How do database indexes work?",
  "Why does compound interest grow the way it does?",
  "What actually happens when your immune system sees a vaccine?",
  "How does a closure remember its variables?",
  "Why does a market price settle where it does?",
  "What does await actually do while it's waiting?",
];

/** Open-concept entry: name a concept, Groq maps the claims, then run the debrief on it. */
export function OpenDebrief() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [concept, setConcept] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phIdx, setPhIdx] = useState(0);
  const [phShown, setPhShown] = useState(true);
  const [focused, setFocused] = useState(false);

  // Cycle the placeholder while the field is empty and idle. Stops on focus or
  // typing, and doesn't run under prefers-reduced-motion (stays on the first phrase).
  useEffect(() => {
    if (lesson || focused || concept.trim() !== "") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let swap: number | undefined;
    const tick = window.setInterval(() => {
      setPhShown(false);
      swap = window.setTimeout(() => {
        setPhIdx((i) => (i + 1) % PLACEHOLDERS.length);
        setPhShown(true);
      }, 300);
    }, 3000);
    return () => {
      window.clearInterval(tick);
      if (swap) window.clearTimeout(swap);
    };
  }, [lesson, focused, concept]);

  // On reload: resume an in-progress open session if there is one, otherwise
  // restore the half-typed concept. Browser-only, so it runs after mount.
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const saved = loadOpenSession();
    if (saved) setLesson(saved.lesson);
    else setConcept(loadDraft(CONCEPT_KEY));
  }, []);

  if (lesson) return <DebriefRunner lesson={lesson} onExit={newDebrief} />;

  function newDebrief() {
    if (lesson) clearSession(lesson.slug);
    clearDraft(CONCEPT_KEY);
    setLesson(null);
    setConcept("");
    setError(null);
  }

  async function start() {
    const c = concept.trim();
    if (!c) return;
    setPending(true);
    setError(null);
    try {
      const result = await startOpenDebrief(c);
      if ("lesson" in result) {
        clearDraft(CONCEPT_KEY);
        setLesson(result.lesson); // the runner persists this shell on mount, so a reload resumes it
      } else {
        setError(result.error);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  function updateConcept(next: string) {
    setConcept(next);
    saveDraft(CONCEPT_KEY, next);
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-6 pt-6">
        <Wordmark />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] tracking-[0.16em] uppercase text-muted-ink transition-colors hover:text-amber"
        >
          <ArrowLeft weight="bold" className="size-3" />
          Back
        </Link>
      </div>
      <div className="mx-auto flex w-full max-w-2xl flex-col px-6 pt-14 pb-24">
        <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
          Open debrief
        </p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ivory sm:text-5xl">
          What do you want to understand?
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ivory-dim">
          Name something you think you&apos;ve got down. Debrief maps what a strong explanation needs,
        then sees if yours holds up.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          start();
        }}
        className="mt-10"
      >
        <div className="relative">
          <input
            type="text"
            value={concept}
            onChange={(e) => updateConcept(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder=""
            aria-label="The concept you want to debrief"
            disabled={pending}
            className="relative w-full border border-line bg-surface px-4 py-3.5 font-mono text-sm text-ivory transition-colors focus-visible:border-amber focus-visible:outline-none disabled:opacity-60"
          />
          {concept.trim() === "" && (
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 flex items-center truncate px-4 font-mono text-sm text-ghost transition-opacity duration-300 ${
                phShown ? "opacity-100" : "opacity-0"
              }`}
            >
              {PLACEHOLDERS[phIdx]}
            </span>
          )}
        </div>
        <div className="mt-5">
          {pending ? (
            <Thinking label="Setting things up…" />
          ) : (
            <>
              {error && (
                <p className="mb-3 font-mono text-xs tracking-wide text-terracotta">{error}</p>
              )}
              <button
                type="submit"
                disabled={!concept.trim()}
                className="inline-flex items-center bg-ivory px-6 py-3 font-mono text-[0.7rem] font-medium tracking-[0.16em] uppercase text-obsidian transition-colors hover:bg-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:cursor-not-allowed disabled:bg-surface-high disabled:text-muted-ink"
              >
                Build my debrief
              </button>
            </>
          )}
        </div>
      </form>
      </div>
    </>
  );
}
