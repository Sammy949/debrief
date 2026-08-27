import { notFound } from "next/navigation";
import { DebriefRunner } from "@/components/debrief-runner";
import { LESSONS, lessonBySlug } from "@/core/fixtures";

/** Prerender the curated lessons; unknown slugs 404. */
export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export default async function LessonRunPage({ params }: PageProps<"/debrief/[slug]">) {
  const { slug } = await params;
  const lesson = lessonBySlug(slug);
  if (!lesson) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <DebriefRunner lesson={lesson} />
    </main>
  );
}
