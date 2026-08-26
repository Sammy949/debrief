import type { TeachingIntervention } from "@/ai/functions";
import type { Lesson, SessionState } from "@/core/types";

/** Content generated for the stage a turn lands in (shown in the flow pane). */
export interface TurnContent {
  curiousQuestion?: string;
  intervention?: TeachingIntervention;
  repairQuestion?: string;
}

/** What every server action returns: the new state, its content, and a soft error (evals only). */
export interface TurnResult {
  state: SessionState;
  content: TurnContent;
  error?: string;
  /**
   * Open path only: the lesson enriched with the claims just decomposed from the
   * explanation. The client adopts it so later turns can read teaching notes/labels.
   */
  lesson?: Lesson;
}
