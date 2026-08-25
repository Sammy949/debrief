import Link from "next/link";

export default function LessonsPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-ink-soft">Lesson library</p>
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-ink">
        Coming together
      </h1>
      <p className="mt-4 max-w-sm text-ink-soft">
        The curated debriefs (closures, async requests, and database indexes)
        are being built.
      </p>
      <Link
        href="/"
        className="mt-8 text-sm font-medium text-sienna-deep transition-colors hover:text-ink"
      >
        Back to start
      </Link>
    </main>
  );
}
