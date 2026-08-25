"use client";

import { useState } from "react";

/** The learner's single response input, reused across explanation / probe / repair. */
export function ResponseField({
  placeholder = "Type your response here.",
  submitLabel = "Submit",
  onSubmit,
}: {
  placeholder?: string;
  submitLabel?: string;
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
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="w-full resize-y rounded-lg border border-paper-deep bg-paper px-4 py-3 text-ink placeholder:text-ink-untested focus-visible:border-sienna focus-visible:outline-none"
      />
      <div className="mt-3">
        <button
          type="submit"
          disabled={!ready}
          className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-sienna-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
