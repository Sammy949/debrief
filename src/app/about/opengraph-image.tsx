import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "About Debrief";

export default function Image() {
  return ogImage({
    eyebrow: "About",
    lead: "Don't just learn it.",
    accent: "Debrief it.",
    subtitle:
      "A teach-back tool that finds the one place your understanding gives way, then helps you fix it.",
  });
}
