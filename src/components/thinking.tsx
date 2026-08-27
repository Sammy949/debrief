/** The shared "working" state — one warm line with a single live beat.
 *  Used for every Groq turn so waiting feels consistent across the app. */
export function Thinking({ label }: { label: string }) {
  return (
    <p className="flex items-center gap-2.5" role="status" aria-live="polite">
      <span className="beam-fracture size-1.5 shrink-0 bg-amber" aria-hidden="true" />
      <span className="shimmer font-mono text-[0.7rem] tracking-[0.16em] uppercase">{label}</span>
    </p>
  );
}
