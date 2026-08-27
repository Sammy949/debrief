"use client";

import { useState } from "react";
import { startOpenDebrief } from "@/app/debrief/actions";
import { DebriefRunner } from "@/components/debrief-runner";
import type { Lesson } from "@/core/types";

/** Open-concept entry: name a concept, Groq maps the claims, then run the debrief on it. */
export function OpenDebrief() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [concept, setConcept] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (lesson) return <DebriefRunner lesson={lesson} />;

  async function start() {
    const c = concept.trim();
    if (!c) return;
    setPending(true);
    setError(null);
    try {
      const result = await startOpenDebrief(c);
      if ("lesson" in result) setLesson(result.lesson);
      else setError(result.error);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-6 py-24">
      <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
        Open debrief
      </p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight text-ivory sm:text-5xl">
        What do you want to understand?
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ivory-dim">
        Name a concept you think you know. Debrief maps what a strong explanation needs, then tests
        whether yours holds.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          start();
        }}
        className="mt-10"
      >
        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="e.g. how database indexes work"
          disabled={pending}
          className="w-full border border-line bg-surface px-4 py-3.5 font-mono text-sm text-ivory transition-colors placeholder:text-ghost focus-visible:border-amber focus-visible:outline-none disabled:opacity-60"
        />
        <div className="mt-5">
          {pending ? (
            <p className="shimmer font-mono text-[0.7rem] tracking-[0.16em] uppercase" aria-live="polite">
              Mapping the concept…
            </p>
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
  );
}
