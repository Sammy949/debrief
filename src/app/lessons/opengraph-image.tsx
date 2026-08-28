import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "The Debrief library";

export default function Image() {
  return ogImage({
    page: "Library",
    lead: "Bring your own concept, or",
    accent: "start with ours.",
    subtitle: "Curated debriefs across code, money, science, and markets.",
  });
}
