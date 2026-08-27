import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
        {/* a load-path that doesn't connect: the page that isn't there */}
        <span className="flex items-center" aria-hidden="true">
          <span className="h-[3px] w-16 bg-ivory-dim" />
          <span className="w-4" />
          <span className="h-[3px] w-10 -translate-y-1 bg-amber" />
        </span>
        <p className="mt-10 font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
          404
        </p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ivory sm:text-5xl">
          This one doesn&apos;t hold.
        </h1>
        <p className="mt-4 max-w-sm leading-relaxed text-ivory-dim">
          The page you were after isn&apos;t here. Let&apos;s get you back to something solid.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center bg-ivory px-6 py-3 font-medium text-obsidian transition-colors hover:bg-amber"
          >
            Back home
          </Link>
          <Link
            href="/debrief/new"
            className="inline-flex items-center border border-line px-6 py-3 font-medium text-ivory transition-colors hover:bg-surface-high"
          >
            Start a debrief
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
