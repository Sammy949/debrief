import { DebriefRunner } from "@/components/debrief-runner";
import { CLOSURES_LESSON } from "@/core/fixtures";

/**
 * The mocked vertical slice: the whole teach-back loop driven by the reducer
 * with scripted (non-AI) judgments. Proves the UX and state machine end to end
 * before Groq + Convex are wired.
 */
export default function DebriefDemoPage() {
  return (
    <main className="flex flex-1 flex-col">
      <DebriefRunner lesson={CLOSURES_LESSON} />
    </main>
  );
}
