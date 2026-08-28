import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Debrief: make your understanding visible";

export default function Image() {
  return ogImage({
    lead: "Make your",
    accent: "understanding",
    tail: "visible.",
    subtitle:
      "Explain a concept in your own words. Debrief finds the exact point it breaks, then helps you fix it.",
  });
}
