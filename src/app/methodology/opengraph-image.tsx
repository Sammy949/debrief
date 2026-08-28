import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Debrief methodology";

export default function Image() {
  return ogImage({
    page: "Methodology",
    lead: "A guided loop, and the",
    accent: "machine",
    tail: "behind it.",
    subtitle:
      "Retrieval practice and generative learning, run as an explain, probe, reveal, repair loop.",
  });
}
