"use client";

import { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

/** The learner's single response input, reused across explanation / probe / repair.
 *  Styled as a technical drafting surface: a filename header, a sharp bordered field
 *  that turns Focus Amber when active, monospace body. */
export function ResponseField({
  placeholder = "Begin drafting your explanation…",
  submitLabel = "Submit",
  filename = "~/response.md",
  onSubmit,
}: {
  placeholder?: string;
  submitLabel?: string;
  filename?: string;
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const ready = text.trim().length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) onSubmit(text.trim());
      }}
      className="w-full"
    >
      <div className="border border-line bg-surface transition-colors focus-within:border-amber">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
          <span className="size-1.5 bg-muted-ink" aria-hidden="true" />
          <span className="font-mono text-[0.7rem] tracking-wide text-muted-ink">
            {filename}
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={7}
          className="w-full resize-y bg-transparent px-4 py-4 font-mono text-sm leading-relaxed text-ivory placeholder:text-ghost focus-visible:outline-none"
        />
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={!ready}
          className="group inline-flex items-center gap-2 bg-ivory px-6 py-3 font-mono text-[0.7rem] font-medium tracking-[0.16em] uppercase text-obsidian transition-colors hover:bg-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:cursor-not-allowed disabled:bg-surface-high disabled:text-muted-ink"
        >
          {submitLabel}
          <ArrowRight
            weight="bold"
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </form>
  );
}
