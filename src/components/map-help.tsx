"use client";

import { Popover } from "@base-ui/react/popover";

type MarkKind = "solid" | "unclear" | "attention" | "untested";

const STATES: { kind: MarkKind; word: string; meaning: string; tone: string }[] = [
  { kind: "solid", word: "solid", meaning: "Clear and correct.", tone: "text-ivory-dim" },
  { kind: "unclear", word: "unclear", meaning: "Mentioned, but vague.", tone: "text-muted-ink" },
  { kind: "attention", word: "needs attention", meaning: "Something's off. The fracture.", tone: "text-amber" },
  { kind: "untested", word: "not reached", meaning: "You haven't got to it yet.", tone: "text-ghost" },
];

function Mark({ kind }: { kind: MarkKind }) {
  if (kind === "attention") {
    return (
      <span className="flex w-5 items-center justify-center" aria-hidden="true">
        <span className="size-1.5 bg-amber" />
      </span>
    );
  }
  return (
    <span className="flex w-5 items-center justify-center" aria-hidden="true">
      {kind === "untested" ? (
        <span className="size-1.5 border border-ghost" />
      ) : kind === "unclear" ? (
        <span className="size-1.5 bg-muted-ink" />
      ) : (
        <span className="size-1.5 bg-ivory" />
      )}
    </span>
  );
}

/** On-demand explainer for the Understanding Map: a "?" that opens a popover
 *  describing the beam-through-strata idea and what each state means. No
 *  auto-popups; the learner asks for it. */
export function MapHelp() {
  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label="What does this map mean?"
        className="flex size-5 items-center justify-center border border-line font-mono text-[0.65rem] text-muted-ink transition-colors hover:border-amber hover:text-amber data-[popup-open]:border-amber data-[popup-open]:text-amber"
      >
        ?
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={8}>
          <Popover.Popup className="w-72 border border-line-strong bg-surface-high p-5 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.9)] transition-[opacity,transform] duration-150 data-[ending-style]:translate-y-1 data-[ending-style]:opacity-0 data-[starting-style]:translate-y-1 data-[starting-style]:opacity-0">
            <Popover.Title className="font-mono text-[0.65rem] tracking-[0.18em] uppercase text-muted-ink">
              Reading the map
            </Popover.Title>
            <Popover.Description className="mt-3 text-sm leading-relaxed text-ivory-dim">
              Each line is a claim your explanation needs to carry. One beam runs
              down through them, and how it looks where it crosses each claim is
              that claim&apos;s state.
            </Popover.Description>
            <ul className="mt-4 flex list-none flex-col gap-2.5 p-0">
              {STATES.map((s) => (
                <li key={s.word} className="flex items-baseline gap-2.5">
                  <Mark kind={s.kind} />
                  <span className="text-sm leading-snug text-ivory-dim">
                    <span className={`font-medium ${s.tone}`}>{s.word}</span>
                    {": "}
                    {s.meaning}
                  </span>
                </li>
              ))}
            </ul>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
