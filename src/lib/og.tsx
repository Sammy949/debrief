import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Shared Open Graph image, in Debrief's own styles. OG previews render on light
 * social surfaces, so these use the light "paper" palette (the app's light theme):
 * ink on warm paper, the Sentient serif, one sienna accent word, the brand mark.
 * Satori only takes TTF/OTF (not woff2) and inline styles, hence the local OTFs.
 */

const FONT_DIR = join(process.cwd(), "src/app/fonts");
const sentientRegular = readFileSync(join(FONT_DIR, "Sentient-Regular.otf"));
const sentientMedium = readFileSync(join(FONT_DIR, "Sentient-Medium.otf"));
const sentientItalic = readFileSync(join(FONT_DIR, "Sentient-Italic.otf"));

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const PAPER = "#f3efe7";
const INK = "#23201a";
const INK_DIM = "#5a5348";
const MUTED = "#857d6d";
const LINE = "#ddd7c9";
const AMBER = "#9a5a2c";

const BRAIN =
  "M248,124a56.11,56.11,0,0,0-32-50.61V72a48,48,0,0,0-88-26.49A48,48,0,0,0,40,72v1.39a56,56,0,0,0,0,101.2V176a48,48,0,0,0,88,26.49A48,48,0,0,0,216,176v-1.41A56.09,56.09,0,0,0,248,124ZM88,208a32,32,0,0,1-31.81-28.56A55.87,55.87,0,0,0,64,180h8a8,8,0,0,0,0-16H64A40,40,0,0,1,50.67,86.27,8,8,0,0,0,56,78.73V72a32,32,0,0,1,64,0v68.26A47.8,47.8,0,0,0,88,128a8,8,0,0,0,0,16,32,32,0,0,1,0,64Zm104-44h-8a8,8,0,0,0,0,16h8a55.87,55.87,0,0,0,7.81-.56A32,32,0,1,1,168,144a8,8,0,0,0,0-16,47.8,47.8,0,0,0-32,12.26V72a32,32,0,0,1,64,0v6.73a8,8,0,0,0,5.33,7.54A40,40,0,0,1,192,164Zm16-52a8,8,0,0,1-8,8h-4a36,36,0,0,1-36-36V80a8,8,0,0,1,16,0v4a20,20,0,0,0,20,20h4A8,8,0,0,1,208,112ZM60,120H56a8,8,0,0,1,0-16h4A20,20,0,0,0,80,84V80a8,8,0,0,1,16,0v4A36,36,0,0,1,60,120Z";

export interface OgInput {
  eyebrow: string;
  /** Title rendered as: lead, then an italic sienna accent, then an optional tail. */
  lead: string;
  accent: string;
  tail?: string;
  subtitle: string;
}

export function ogImage({ eyebrow, lead, accent, tail, subtitle }: OgInput) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: PAPER,
          color: INK,
          fontFamily: "Sentient",
        }}
      >
        {/* wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg width="46" height="46" viewBox="0 0 256 256">
            <path d={BRAIN} fill={AMBER} />
          </svg>
          <span style={{ fontSize: 36, fontWeight: 500 }}>Debrief</span>
        </div>

        {/* the line */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{ fontSize: 22, letterSpacing: 5, color: MUTED, marginBottom: 24 }}
          >
            {eyebrow.toUpperCase()}
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", fontSize: 78, lineHeight: 1.05 }}>
            <span>{lead} </span>
            <span style={{ fontStyle: "italic", color: AMBER }}>{accent}</span>
            {tail ? <span>&nbsp;{tail}</span> : null}
          </div>
          <span
            style={{ fontSize: 28, color: INK_DIM, maxWidth: 860, lineHeight: 1.4, marginTop: 28 }}
          >
            {subtitle}
          </span>
        </div>

        {/* footer: url + the beam-through-strata mark */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <span style={{ fontSize: 22, color: MUTED }}>debrief.samuelyahaya.com</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", height: 3, width: 120, backgroundColor: INK_DIM }} />
            <div style={{ display: "flex", alignItems: "center", height: 3 }}>
              <div style={{ display: "flex", height: 3, width: 48, backgroundColor: AMBER, transform: "translateY(-3px)" }} />
              <div style={{ display: "flex", width: 16 }} />
              <div style={{ display: "flex", height: 3, width: 48, backgroundColor: AMBER, transform: "translateY(3px)" }} />
            </div>
            <div style={{ display: "flex", height: 3, width: 84, backgroundColor: LINE }} />
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Sentient", data: sentientRegular, weight: 400, style: "normal" },
        { name: "Sentient", data: sentientMedium, weight: 500, style: "normal" },
        { name: "Sentient", data: sentientItalic, weight: 400, style: "italic" },
      ],
    },
  );
}
