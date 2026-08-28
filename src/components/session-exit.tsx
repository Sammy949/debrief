"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { ArrowLeft, Plus } from "@phosphor-icons/react/dist/ssr";
import { Wordmark } from "@/components/wordmark";
import type { Stage } from "@/core/types";

const LINK =
  "inline-flex items-center gap-1.5 font-mono text-[0.65rem] tracking-[0.16em] uppercase text-muted-ink transition-colors hover:text-amber";

/**
 * Leaving a debrief. Before it starts (the explanation screen) it's a quiet Back,
 * no ceremony. Once it's underway, it's a Quit behind a confirm, since there's
 * live progress to lose. On the summary it's just "New debrief". `onExit` clears
 * the session and returns the learner to a fresh start.
 */
export function SessionExit({
  stage,
  onExit,
  wide,
}: {
  stage: Stage;
  onExit: () => void;
  wide?: boolean;
}) {
  const inProgress =
    stage === "select_focus" || stage === "probe" || stage === "teaching" || stage === "checkpoint";

  return (
    <div
      className={`mx-auto flex w-full items-center justify-between gap-4 px-6 pt-6 ${wide ? "max-w-6xl" : "max-w-2xl"}`}
    >
      <Wordmark />
      {stage === "explanation" ? (
        <button onClick={onExit} className={LINK}>
          <ArrowLeft weight="bold" className="size-3" />
          Back
        </button>
      ) : inProgress ? (
        <AlertDialog.Root>
          <AlertDialog.Trigger className={LINK}>Quit</AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-md transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
            <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[min(90vw,26rem)] -translate-x-1/2 -translate-y-1/2 border border-line bg-surface p-6 transition-[opacity,transform] duration-200 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0">
              <AlertDialog.Title className="font-serif text-xl tracking-tight text-ivory">
                Quit this debrief?
              </AlertDialog.Title>
              <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-ivory-dim">
                You&apos;ll lose the progress on this one. Your map and answers won&apos;t be kept.
              </AlertDialog.Description>
              <div className="mt-6 flex justify-end gap-3">
                <AlertDialog.Close
                  onClick={onExit}
                  className="inline-flex items-center border border-line px-4 py-2.5 font-mono text-[0.7rem] font-medium tracking-[0.16em] text-muted-ink uppercase transition-colors hover:border-terracotta hover:text-terracotta"
                >
                  Quit
                </AlertDialog.Close>
                <AlertDialog.Close className="inline-flex items-center bg-ivory px-4 py-2.5 font-mono text-[0.7rem] font-medium tracking-[0.16em] text-obsidian uppercase transition-colors hover:bg-amber">
                  Keep going
                </AlertDialog.Close>
              </div>
            </AlertDialog.Popup>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      ) : (
        <button onClick={onExit} className={LINK}>
          <Plus weight="bold" className="size-3" />
          New debrief
        </button>
      )}
    </div>
  );
}
