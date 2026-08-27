import type { Lesson } from "./types";

/**
 * Demo/seed content. Curated lesson content is the source of truth for teaching
 * (Groq only adapts wording). This closures lesson doubles as the fixture that
 * drives the mocked vertical slice before Convex + Groq are wired.
 */
export const CLOSURES_LESSON: Lesson = {
  slug: "closures",
  title: "Closures",
  mode: "authored",
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
  fallbackWeaknessQuestion:
    "If the outer variable changes after the function is created but before it runs, what does the function see?",
  fallbackUnaddressedQuestion:
    "Can you explain the part of how closures work that you didn't get to yet?",
  fallbackVerificationQuestion:
    "In a loop that creates several closures over the same variable, what does each one see when it later runs, and why?",
  fallbackRepairQuestion:
    "Write a function that returns another function which reads a variable that later changes. What does calling it print, and why?",
};

export const INDEXES_LESSON: Lesson = {
  slug: "database-indexes",
  title: "Database indexes",
  mode: "authored",
  objective: "Explain what a database index is, why it speeds up reads, and what it costs.",
  difficulty: "intermediate",
  claims: [
    {
      id: "structure",
      claim: "An index is a separate, sorted structure that maps a column's values to their row locations.",
      shortLabel: "A sorted lookup structure",
      whyItMatters: "It's what lets the database find rows without reading the whole table.",
      teachingNote: "An index is a separate sorted structure (usually a B-tree), not the table itself rearranged.",
      commonMisconception: "An index is just the table sorted in place.",
    },
    {
      id: "lookup",
      claim: "An index turns a full scan into a targeted lookup, cutting the work from every row toward a few steps.",
      shortLabel: "Turns scans into lookups",
      whyItMatters: "This is the actual source of the speedup.",
      teachingNote: "With a sorted structure the database can walk a B-tree instead of checking every row, so reads go from O(n) toward O(log n).",
      commonMisconception: "An index makes the database generally faster, for everything.",
    },
    {
      id: "cost",
      claim: "Indexes cost storage and slow writes, because every insert or update has to keep them current.",
      shortLabel: "Writes pay the cost",
      whyItMatters: "It's why you don't just index every column.",
      teachingNote: "Each index is extra data the database must update on every write, so more indexes mean slower writes and more storage.",
      commonMisconception: "Adding indexes is free, so more is always better.",
    },
  ],
  workedExample:
    "SELECT * FROM users WHERE email = 'a@b.com' with an index on email walks the B-tree straight to the row, instead of scanning every user.",
  counterexample:
    "SELECT * FROM users WHERE lower(email) = '…' can't use a plain email index — the function on the column defeats it, and it scans.",
  applicationScenarios: [
    "A query filtering on an unindexed column is slow. Where does the time go, and what would an index change?",
  ],
  misconceptions: ["An index is the table sorted in place.", "More indexes are always better."],
  fallbackWeaknessQuestion:
    "Step by step, what is the database doing differently once the index exists?",
  fallbackUnaddressedQuestion:
    "You haven't touched what an index costs yet — what does the database pay to keep one?",
  fallbackVerificationQuestion:
    "You've got the core — picture a table with millions of rows and a query on an unindexed column. What happens, and how does an index change it?",
  fallbackRepairQuestion:
    "Now put it to work: you add an index on a column you filter by constantly. What gets faster, and what gets slower?",
};

export const ASYNC_LESSON: Lesson = {
  slug: "async-await",
  title: "Async & await",
  mode: "authored",
  objective: "Explain what await actually does, why it doesn't freeze the program, and the order things run in.",
  difficulty: "intermediate",
  claims: [
    {
      id: "pauses",
      claim: "await pauses only the current async function until the promise settles — it doesn't block the rest of the program.",
      shortLabel: "Pauses the function, not everything",
      whyItMatters: "It's the whole point: waiting without freezing the app.",
      teachingNote: "await suspends just the async function it's in; the event loop keeps running other work in the meantime.",
      commonMisconception: "await stops everything / blocks the main thread.",
    },
    {
      id: "returns-promise",
      claim: "Calling an async function returns a promise right away; the value arrives later.",
      shortLabel: "Returns a promise now",
      whyItMatters: "It explains why the caller gets a promise, not the finished value.",
      teachingNote: "An async function hands back a promise immediately; it resolves with the value once the awaited work is done.",
      commonMisconception: "An async function returns the value directly.",
    },
    {
      id: "resumes-later",
      claim: "The code after an await resumes later, once the promise resolves, so synchronous code queued before it runs first.",
      shortLabel: "Continues later, not inline",
      whyItMatters: "It's the source of surprising execution order.",
      teachingNote: "Everything after an await is scheduled to continue later; plain synchronous code keeps running before that continuation.",
      commonMisconception: "Code always runs strictly top-to-bottom in real time.",
    },
  ],
  workedExample:
    "console.log('a'); await fetch(url); console.log('b') — 'a' prints now, control returns to the caller, and 'b' prints only after the fetch settles.",
  counterexample:
    "Awaiting inside a for-loop runs requests one after another; Promise.all would let independent ones run together.",
  applicationScenarios: [
    "You await three independent requests inside a loop. What's slow about that, and what would you change?",
  ],
  misconceptions: ["await blocks the whole program.", "An async function returns the value, not a promise."],
  fallbackWeaknessQuestion:
    "The moment you hit await, what happens to the rest of the program while it waits?",
  fallbackUnaddressedQuestion:
    "You haven't said what an async function hands back to whoever called it — what is it?",
  fallbackVerificationQuestion:
    "You've got the core — you log a line, await a fetch, then log another. In what order do they appear, and why?",
  fallbackRepairQuestion:
    "Now try it: you need three independent API calls to finish as fast as possible. How do you write it, and why?",
};

/** The curated library — authored lessons whose content is the teaching source of truth. */
export const LESSONS: Lesson[] = [CLOSURES_LESSON, INDEXES_LESSON, ASYNC_LESSON];

export function lessonBySlug(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}
