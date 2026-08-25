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
      <p className="text-sm font-medium text-ink-soft">Open debrief</p>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        What do you want to understand?
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-ink-soft">
        Name a concept you think you know. Debrief maps what a strong explanation needs, then tests
        whether yours holds.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          start();
        }}
        className="mt-8"
      >
        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="e.g. how database indexes work"
          disabled={pending}
          className="w-full rounded-lg border border-paper-deep bg-paper px-4 py-3 text-ink placeholder:text-ink-untested focus-visible:border-sienna focus-visible:outline-none disabled:opacity-60"
        />
        <div className="mt-4">
          {pending ? (
            <p className="shimmer text-sm font-medium text-ink-soft" aria-live="polite">
              Mapping the concept…
            </p>
          ) : (
            <>
              {error && <p className="mb-3 text-sm font-medium text-sienna-deep">{error}</p>}
              <button
                type="submit"
                disabled={!concept.trim()}
                className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-sienna-deep disabled:cursor-not-allowed disabled:opacity-40"
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
