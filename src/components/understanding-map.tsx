import type { Claim, ClaimState } from "@/core/types";

const STATE_WORD: Record<ClaimState, string> = {
  solid: "solid",
  unclear: "unclear",
  needs_attention: "needs attention",
  untested: "not reached yet",
};

const STATE_COLOR: Record<ClaimState, string> = {
  solid: "text-ink",
  unclear: "text-ink-soft",
  needs_attention: "text-sienna-deep",
  untested: "text-ink-untested",
};

/**
 * The load-path rule: a claim's state written in one line, legible without
 * colour. solid = a complete member; unclear = under-drawn; needs_attention =
 * the fracture (two offset halves that don't meet); untested = never built.
 */
function LoadPath({ state }: { state: ClaimState }) {
  if (state === "needs_attention") {
    return (
      <span className="flex h-4 items-center" aria-hidden="true">
        <span className="h-[2px] w-12 -translate-y-1 rounded-full bg-sienna-deep" />
        <span className="w-2.5" />
        <span className="h-[2px] w-14 translate-y-1 rounded-full bg-sienna-deep" />
      </span>
    );
  }
  if (state === "untested") {
    return (
      <span className="flex h-4 items-center" aria-hidden="true">
        <span className="w-28 border-t-2 border-dotted border-ink-ghost" />
      </span>
    );
  }
  if (state === "unclear") {
    return (
      <span className="flex h-4 items-center" aria-hidden="true">
        <span
          className="h-[2px] w-28 rounded-full bg-ink-soft"
          style={{
            WebkitMaskImage: "linear-gradient(90deg,#000 52%,transparent)",
            maskImage: "linear-gradient(90deg,#000 52%,transparent)",
          }}
        />
      </span>
    );
  }
  return (
    <span className="flex h-4 items-center" aria-hidden="true">
      <span className="h-[2px] w-28 rounded-full bg-ink" />
    </span>
  );
}

export interface UnderstandingMapProps {
  conceptTitle: string;
  claims: Claim[];
  focusClaimId: string | null;
  /** "full" = centered horizontal members (standalone). "rail" = compact vertical list for the sticky side pane. */
  variant?: "full" | "rail";
}

/**
 * The signature visual: the concept as the load, its claims as the load-bearing
 * members. The focus claim is drawn forward by weight while the rest recede —
 * no boxes, no pills, no colour doing the work alone.
 */
export function UnderstandingMap({
  conceptTitle,
  claims,
  focusClaimId,
  variant = "full",
}: UnderstandingMapProps) {
  const rail = variant === "rail";

  return (
    <section aria-label="Understanding map" className={rail ? "w-full" : "w-full max-w-3xl"}>
      <header className={rail ? "mb-7" : "mb-12 text-center"}>
        <h2
          className={
            rail
              ? "font-heading text-xl font-bold tracking-tight text-ink"
              : "font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl"
          }
        >
          {conceptTitle}
        </h2>
        <p className={rail ? "mt-1 text-xs text-ink-soft" : "mt-2 text-sm text-ink-soft"}>
          What your explanation is carrying.
        </p>
      </header>

      <ol
        className={
          rail
            ? "flex list-none flex-col gap-6 p-0"
            : "flex list-none flex-wrap items-start justify-center gap-x-10 gap-y-10 p-0"
        }
      >
        {claims.map((claim) => {
          const focused = claim.id === focusClaimId;
          return (
            <li
              key={claim.id}
              className={
                rail
                  ? "flex flex-col items-start text-left"
                  : "flex w-40 flex-col items-center text-center"
              }
            >
              <span
                className={`text-[0.95rem] leading-snug ${rail ? "" : "grid min-h-[3.6em] content-end"} ${
                  focused ? "font-bold text-ink" : "font-medium text-ink-soft"
                }`}
              >
                {claim.shortLabel}
              </span>
              <div className="my-2.5">
                <LoadPath state={claim.state} />
              </div>
              <span className={`text-xs font-medium ${STATE_COLOR[claim.state]}`}>
                {STATE_WORD[claim.state]}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
