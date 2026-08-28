import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactNode } from "react";

/**
 * Open Graph images, redesigned from the landing hero. Dark obsidian like the
 * live app (not the earlier light version): the Sentient serif line on the left,
 * and Debrief's signature artifact on the right — a beam descending through the
 * strata of an explanation, with one stratum fractured in amber. Satori only
 * takes TTF/OTF (not woff2), hence the local Sentient OTFs; the artifact is pure
 * geometry, so it reads even at thumbnail size.
 */

const FONT_DIR = join(process.cwd(), "src/app/fonts");
const regular = readFileSync(join(FONT_DIR, "Sentient-Regular.otf"));
const medium = readFileSync(join(FONT_DIR, "Sentient-Medium.otf"));
const italic = readFileSync(join(FONT_DIR, "Sentient-Italic.otf"));

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const OBSIDIAN = "#100f0d";
const IVORY = "#ece7dc";
const IVORY_DIM = "#b4aea0";
const MUTED = "#837c6d";
const GHOST = "#565046";
const LINE_STRONG = "#3c3831";
const AMBER = "#e6c87a";
const AMBER_DEEP = "#b99a4e";
const GRID = "#1c1a16";

const W = 1200;
const H = 630;
const CELL = 34;

const BRAIN =
  "M248,124a56.11,56.11,0,0,0-32-50.61V72a48,48,0,0,0-88-26.49A48,48,0,0,0,40,72v1.39a56,56,0,0,0,0,101.2V176a48,48,0,0,0,88,26.49A48,48,0,0,0,216,176v-1.41A56.09,56.09,0,0,0,248,124ZM88,208a32,32,0,0,1-31.81-28.56A55.87,55.87,0,0,0,64,180h8a8,8,0,0,0,0-16H64A40,40,0,0,1,50.67,86.27,8,8,0,0,0,56,78.73V72a32,32,0,0,1,64,0v68.26A47.8,47.8,0,0,0,88,128a8,8,0,0,0,0,16,32,32,0,0,1,0,64Zm104-44h-8a8,8,0,0,0,0,16h8a55.87,55.87,0,0,0,7.81-.56A32,32,0,1,1,168,144a8,8,0,0,0,0-16,47.8,47.8,0,0,0-32,12.26V72a32,32,0,0,1,64,0v6.73a8,8,0,0,0,5.33,7.54A40,40,0,0,1,192,164Zm16-52a8,8,0,0,1-8,8h-4a36,36,0,0,1-36-36V80a8,8,0,0,1,16,0v4a20,20,0,0,0,20,20h4A8,8,0,0,1,208,112ZM60,120H56a8,8,0,0,1,0-16h4A20,20,0,0,0,80,84V80a8,8,0,0,1,16,0v4A36,36,0,0,1,60,120Z";

export interface OgInput {
  lead: string;
  accent: string;
  tail?: string;
  subtitle: string;
  page?: string;
}

/** A node sitting on the beam: an obsidian box masking the beam, with a mark. */
function node(mark: ReactNode) {
  return (
    <div style={{ display: "flex", width: 20, height: 20, alignItems: "center", justifyContent: "center", backgroundColor: OBSIDIAN }}>
      {mark}
    </div>
  );
}

const sq = (size: number, color: string) => (
  <div style={{ display: "flex", width: size, height: size, backgroundColor: color }} />
);
const hollow = (size: number, color: string) => (
  <div style={{ display: "flex", width: size, height: size, border: `1px solid ${color}` }} />
);

export function ogImage({ lead, accent, tail, subtitle, page }: OgInput) {
  const columns = Array.from({ length: Math.floor(W / CELL) + 1 }, (_, i) => i * CELL);
  const rows = Array.from({ length: Math.floor(H / CELL) + 1 }, (_, i) => i * CELL);

  return new ImageResponse(
    (
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", backgroundColor: OBSIDIAN, color: IVORY, fontFamily: "Sentient" }}>
        {/* faint structural grid, fading into the dark toward the bottom */}
        {columns.map((x) => (
          <div key={`c${x}`} style={{ position: "absolute", top: 0, left: x, width: 1, height: H, backgroundColor: GRID }} />
        ))}
        {rows.map((y) => (
          <div key={`r${y}`} style={{ position: "absolute", top: y, left: 0, width: W, height: 1, backgroundColor: GRID }} />
        ))}
        <div style={{ position: "absolute", inset: 0, display: "flex", backgroundImage: `linear-gradient(to bottom, rgba(16,15,13,0) 18%, ${OBSIDIAN} 88%)` }} />

        {/* content */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: 64 }}>
          {/* top: wordmark + page name */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <svg width="42" height="42" viewBox="0 0 256 256">
                <path d={BRAIN} fill={AMBER} />
              </svg>
              <span style={{ fontSize: 34, fontWeight: 500 }}>Debrief</span>
            </div>
            {page ? (
              <span style={{ fontSize: 22, letterSpacing: 4, color: MUTED }}>{page.toUpperCase()}</span>
            ) : null}
          </div>

          {/* main: headline | rule | signature artifact */}
          <div style={{ display: "flex", flex: 1, alignItems: "center", marginTop: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, maxWidth: 560 }}>
              <div style={{ display: "flex", flexDirection: "column", fontSize: 84, lineHeight: 1.03 }}>
                <span>{lead}</span>
                <span style={{ fontStyle: "italic", color: AMBER }}>{accent}</span>
                {tail ? <span>{tail}</span> : null}
              </div>
              <span style={{ fontSize: 29, color: IVORY_DIM, lineHeight: 1.4, marginTop: 30, maxWidth: 520 }}>
                {subtitle}
              </span>
            </div>

            <div style={{ display: "flex", width: 1, height: 380, backgroundColor: LINE_STRONG, marginLeft: 52, marginRight: 56 }} />

            {/* the beam through the strata, one fracture in amber */}
            <div style={{ position: "relative", display: "flex", flexDirection: "column", width: 360, gap: 40, paddingTop: 6, paddingBottom: 6 }}>
              <div style={{ position: "absolute", top: 12, bottom: 12, left: 9, width: 2, backgroundColor: AMBER_DEEP }} />
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                {node(sq(8, IVORY))}
                <div style={{ display: "flex", width: 236, height: 5, backgroundColor: IVORY }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                {node(sq(8, IVORY_DIM))}
                <div style={{ display: "flex", width: 270, height: 5, backgroundColor: IVORY_DIM }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                {node(sq(11, AMBER))}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", width: 104, height: 5, backgroundColor: AMBER, transform: "translateY(-7px)" }} />
                  <div style={{ display: "flex", width: 24 }} />
                  <div style={{ display: "flex", width: 104, height: 5, backgroundColor: AMBER, transform: "translateY(7px)" }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                {node(sq(8, MUTED))}
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ display: "flex", width: 56, height: 5, backgroundColor: MUTED }} />
                  <div style={{ display: "flex", width: 56, height: 5, backgroundColor: MUTED }} />
                  <div style={{ display: "flex", width: 56, height: 5, backgroundColor: MUTED }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                {node(hollow(8, GHOST))}
                <div style={{ display: "flex", gap: 12 }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ display: "flex", width: 5, height: 5, backgroundColor: GHOST }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Sentient", data: regular, weight: 400, style: "normal" },
        { name: "Sentient", data: medium, weight: 500, style: "normal" },
        { name: "Sentient", data: italic, weight: 400, style: "italic" },
      ],
    },
  );
}
