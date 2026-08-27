import type { Claim, ClaimState } from "@/core/types";

const STATE_WORD: Record<ClaimState, string> = {
  solid: "solid",
  unclear: "unclear",
  needs_attention: "needs attention",
  untested: "not reached yet",
};

const STATE_TONE: Record<ClaimState, string> = {
  solid: "text-ivory-dim",
  unclear: "text-muted-ink",
  needs_attention: "text-amber",
  untested: "text-ghost",
};

/**
 * The node where the beam of understanding crosses this stratum. A sharp square
 * on the vertical beam: solid and clean when the claim holds, split into two
 * offset amber shards (the refraction) when it fractures, hollow when unreached.
 * The obsidian box masks the beam line behind it.
 */
function BeamNode({ state, focused }: { state: ClaimState; focused: boolean }) {
  const ring = focused ? "outline outline-1 outline-offset-2 outline-amber" : "";
  return (
    <span className="relative z-10 flex size-3.5 items-center justify-center bg-obsidian">
      {state === "needs_attention" ? (
        <span className={`flex items-center ${ring}`} aria-hidden="true">
          <span className="beam-fracture size-1.5 -translate-y-[2px] bg-amber" />
          <span className="beam-fracture size-1.5 translate-y-[2px] bg-amber" />
        </span>
      ) : state === "untested" ? (
        <span className={`size-2 border border-ghost ${ring}`} aria-hidden="true" />
      ) : state === "unclear" ? (
        <span className={`size-2 bg-muted-ink ${ring}`} aria-hidden="true" />
      ) : (
        <span className={`size-2 bg-ivory ${ring}`} aria-hidden="true" />
      )}
    </span>
  );
}

/**
 * The stratum itself, read left-to-right: a dense solid band when the claim
 * holds; a porous, honeycombed band when it is under-drawn; the fractured amber
 * break (two offset halves) at the weak point; a faint dotted trace when the
 * claim has not been reached.
 */
function Stratum({ state }: { state: ClaimState }) {
  if (state === "needs_attention") {
    return (
      <span className="flex h-3 items-center" aria-hidden="true">
        <span className="beam-fracture h-[2px] w-2/5 -translate-y-[3px] bg-amber" />
        <span className="w-3" />
        <span className="beam-fracture h-[2px] w-2/5 translate-y-[3px] bg-amber" />
      </span>
    );
  }
  if (state === "untested") {
    return (
      <span className="flex h-3 items-center" aria-hidden="true">
        <span className="w-2/3 border-t border-dotted border-ghost" />
      </span>
    );
  }
  if (state === "unclear") {
    return (
      <span className="flex h-3 items-center" aria-hidden="true">
        <span
          className="h-[3px] w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg,var(--muted-ink) 0 6px,transparent 6px 11px)",
          }}
        />
      </span>
    );
  }
  return (
    <span className="flex h-3 items-center" aria-hidden="true">
      <span className="h-[3px] w-full bg-ivory-dim" />
    </span>
  );
}

/** The compact state key: makes the map legible in five seconds. */
function Legend() {
  const items: ClaimState[] = ["solid", "unclear", "needs_attention", "untested"];
  return (
    <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-5 p-0">
      {items.map((s) => (
        <li key={s} className="flex list-none items-center gap-2">
          <span className="flex w-4 justify-center">
            {s === "needs_attention" ? (
              <span className="flex items-center" aria-hidden="true">
                <span className="size-1.5 bg-amber" />
              </span>
            ) : s === "untested" ? (
              <span className="size-1.5 border border-ghost" aria-hidden="true" />
            ) : s === "unclear" ? (
              <span className="size-1.5 bg-muted-ink" aria-hidden="true" />
            ) : (
              <span className="size-1.5 bg-ivory" aria-hidden="true" />
            )}
          </span>
          <span className={`font-mono text-[0.6rem] tracking-[0.14em] uppercase ${STATE_TONE[s]}`}>
            {STATE_WORD[s]}
          </span>
        </li>
      ))}
    </ul>
  );
}

export interface UnderstandingMapProps {
  conceptTitle: string;
  claims: Claim[];
  focusClaimId: string | null;
  /** "full" = larger standalone. "rail" = compact for the sticky side pane. */
  variant?: "full" | "rail";
}

/**
 * The signature: understanding as a single beam descending through the strata of
 * an explanation. Each claim is one stratum; the beam threads them top to bottom;
 * its state at each crossing (clean, porous, fractured, or unreached) is what
 * the explanation is actually carrying. Reducer-driven and read-only.
 */
export function UnderstandingMap({
  conceptTitle,
  claims,
  focusClaimId,
  variant = "rail",
}: UnderstandingMapProps) {
  const full = variant === "full";

  return (
    <section aria-label="Understanding map" className={full ? "w-full max-w-md" : "w-full"}>
      <header className="mb-8">
        <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
          Understanding map
        </p>
        <h2 className={`mt-3 font-serif tracking-tight text-ivory ${full ? "text-3xl" : "text-2xl"}`}>
          {conceptTitle}
        </h2>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-ink">
          What a strong explanation must carry — and how yours holds.
        </p>
      </header>

      {claims.length === 0 ? (
        <MapSkeleton />
      ) : (
        <>
          <ol className="relative m-0 flex list-none flex-col gap-7 p-0">
        {/* the beam: a single hairline the strata cross */}
        {claims.length > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[calc(0.4375rem)] w-px bg-line-strong"
          />
        )}

        {claims.map((claim) => {
          const focused = claim.id === focusClaimId;
          return (
            <li key={claim.id} className="grid grid-cols-[0.875rem_1fr] items-start gap-x-4">
              <span className="flex justify-center pt-0.5">
                <BeamNode state={claim.state} focused={focused} />
              </span>
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    className={`text-[0.95rem] leading-snug ${
                      focused ? "font-medium text-ivory" : "text-ivory-dim"
                    }`}
                  >
                    {claim.shortLabel}
                  </span>
                  <span
                    className={`shrink-0 font-mono text-[0.6rem] tracking-[0.12em] uppercase ${STATE_TONE[claim.state]}`}
                  >
                    {STATE_WORD[claim.state]}
                  </span>
                </div>
                <div className="mt-2.5">
                  <Stratum state={claim.state} />
                </div>
              </div>
            </li>
          );
        })}
      </ol>

          <Legend />
        </>
      )}
    </section>
  );
}

/** Shown while the first explanation is still being mapped: ghost strata, no data. */
function MapSkeleton() {
  return (
    <div aria-hidden="true" className="relative flex flex-col gap-7">
      <span className="absolute top-2 bottom-2 left-[calc(0.4375rem)] w-px bg-line" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid grid-cols-[0.875rem_1fr] items-start gap-x-4">
          <span className="flex justify-center pt-0.5">
            <span className="relative z-10 flex size-3.5 items-center justify-center bg-obsidian">
              <span className="beam-fracture size-2 bg-line-strong" />
            </span>
          </span>
          <div>
            <span className="block h-3 w-2/3 bg-surface-high" />
            <span className="mt-3 block h-[3px] w-full bg-line-strong" />
          </div>
        </div>
      ))}
      <p className="mt-1 font-mono text-[0.65rem] tracking-[0.14em] uppercase text-muted-ink">
        Mapping what you wrote…
      </p>
    </div>
  );
}
