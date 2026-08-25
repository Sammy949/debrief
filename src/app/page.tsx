export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h1 className="font-heading text-5xl font-bold tracking-tight text-ink sm:text-6xl">
        Debrief
      </h1>

      {/* load-path motif — the signature that foreshadows the understanding map */}
      <div className="mt-6 flex items-center" aria-hidden="true">
        <span className="h-0.5 w-16 rounded-full bg-ink" />
        <span className="ml-1.5 h-0.5 w-6 rounded-full bg-sienna" />
      </div>

      <p className="mt-6 max-w-md text-lg text-ink-soft">
        Don&apos;t just learn it. Debrief it.
      </p>

      <p className="mt-10 text-sm text-ink-untested">Workbench in progress.</p>
    </main>
  );
}
