import Link from "next/link";

export default function LessonsPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-muted-ink">
        Lesson library
      </p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight text-ivory">
        Coming together
      </h1>
      <p className="mt-4 max-w-sm leading-relaxed text-ivory-dim">
        The curated debriefs (closures, async requests, and database indexes)
        are being built.
      </p>
      <Link
        href="/"
        className="mt-8 font-mono text-[0.7rem] tracking-[0.18em] uppercase text-amber transition-colors hover:text-ivory"
      >
        Back to start
      </Link>
    </main>
  );
}
