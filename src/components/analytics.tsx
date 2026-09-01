import Script from "next/script";

/** Site analytics: cookieless, aggregate page views, no cross-site tracking.
 *
 *  The endpoint and site id come from the environment, never the repo, so a
 *  clone of Debrief reports to nobody. With either variable unset (local dev,
 *  a fork) this renders nothing at all. Preview deploys are skipped so they
 *  don't count as real traffic. */
export function Analytics() {
  const src = process.env.ANALYTICS_SRC;
  const websiteId = process.env.ANALYTICS_WEBSITE_ID;

  if (!src || !websiteId || process.env.VERCEL_ENV === "preview") return null;

  return (
    <Script
      src={src}
      strategy="afterInteractive"
      data-website-id={websiteId}
      data-do-not-track="true"
    />
  );
}
