import type { Lesson } from "./types";

/**
 * Demo/seed content. Curated lesson content is the source of truth for teaching
 * (Groq only adapts wording). This closures lesson doubles as the fixture that
 * drives the mocked vertical slice before Convex + Groq are wired.
 */
export const CLOSURES_LESSON: Lesson = {
  slug: "javascript-closures",
  title: "Closures",
  objective:
    "Explain what a closure retains, when that access is used, and how changing the surrounding variable affects the result.",
  difficulty: "foundations",
  claims: [
    {
      id: "retains-scope",
      claim: "A closure retains access to the variables in its surrounding lexical scope.",
      shortLabel: "Retains surrounding scope",
      whyItMatters: "It is the mechanism that lets an inner function use outer variables.",
      teachingNote: "A closure keeps a reference to its lexical environment, not a snapshot of the code.",
      commonMisconception: null,
    },
    {
      id: "captures-var",
      claim: "A closure captures the variable itself, not a value copied at creation time.",
      shortLabel: "Captures the variable, not a copy",
      whyItMatters: "It decides what the function sees when the outer variable changes later.",
      teachingNote:
        "A closure holds a live reference to the variable. If the variable changes before the function runs, the function observes the new value.",
      commonMisconception: "A closure freezes the value at the moment the function is created.",
    },
    {
      id: "own-env",
      claim: "Each closure keeps its own independent environment.",
      shortLabel: "Each keeps its own environment",
      whyItMatters: "It explains why closures created separately can differ.",
      teachingNote: "Every function created in a new scope gets its own environment record.",
      commonMisconception: null,
    },
  ],
  workedExample:
    "function makeCounter() { let n = 0; return () => ++n; } const next = makeCounter(); next(); next(); // 2",
  counterexample:
    "In a for-loop with var, every closure shares the same i and reads its final value — not the value at creation.",
  applicationScenarios: [
    "You build a counter with a closure. After three calls, what does it return, and why?",
  ],
  misconceptions: ["Closures copy values at creation.", "All closures share one environment."],
  fallbackCuriousQuestion:
    "If the outer variable changes after the function is created but before it runs, what does the function see?",
  fallbackRepairQuestion:
    "Write a function that returns another function which reads a variable that later changes. What does calling it print, and why?",
};
