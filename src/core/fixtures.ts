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
    "In a for-loop with var, every closure shares the same i and reads its final value, not the value at creation.",
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
    "SELECT * FROM users WHERE lower(email) = '…' can't use a plain email index; the function on the column defeats it, and it scans.",
  applicationScenarios: [
    "A query filtering on an unindexed column is slow. Where does the time go, and what would an index change?",
  ],
  misconceptions: ["An index is the table sorted in place.", "More indexes are always better."],
  fallbackWeaknessQuestion:
    "Step by step, what is the database doing differently once the index exists?",
  fallbackUnaddressedQuestion:
    "You haven't touched what an index costs yet. What does the database pay to keep one?",
  fallbackVerificationQuestion:
    "You've got the core. Now picture a table with millions of rows and a query on an unindexed column. What happens, and how does an index change it?",
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
      claim: "await pauses only the current async function until the promise settles; it doesn't block the rest of the program.",
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
    "console.log('a'); await fetch(url); console.log('b'): 'a' prints now, control returns to the caller, and 'b' prints only after the fetch settles.",
  counterexample:
    "Awaiting inside a for-loop runs requests one after another; Promise.all would let independent ones run together.",
  applicationScenarios: [
    "You await three independent requests inside a loop. What's slow about that, and what would you change?",
  ],
  misconceptions: ["await blocks the whole program.", "An async function returns the value, not a promise."],
  fallbackWeaknessQuestion:
    "The moment you hit await, what happens to the rest of the program while it waits?",
  fallbackUnaddressedQuestion:
    "You haven't said what an async function hands back to whoever called it. What is it?",
  fallbackVerificationQuestion:
    "You've got the core. You log a line, await a fetch, then log another. In what order do they appear, and why?",
  fallbackRepairQuestion:
    "Now try it: you need three independent API calls to finish as fast as possible. How do you write it, and why?",
};

export const COMPOUND_INTEREST_LESSON: Lesson = {
  slug: "compound-interest",
  title: "Compound interest",
  mode: "authored",
  objective:
    "Explain what compound interest really is, why when you add money matters as much as the rate, and why small rate differences grow into large gaps over time.",
  difficulty: "foundations",
  claims: [
    {
      id: "interest-on-interest",
      claim: "Compound interest pays interest on the interest already earned, not just on the original amount, so the balance grows on an ever-larger base.",
      shortLabel: "Interest on the interest",
      whyItMatters: "It's the difference between growth that accelerates and growth that stays flat.",
      teachingNote: "Each period's interest is added to the balance, and the next period's interest is calculated on that new, larger balance. Simple interest only ever pays on the original principal.",
      commonMisconception: "Compound interest is just a fixed percentage added each year, the same as simple interest.",
    },
    {
      id: "timing",
      claim: "When you add money changes the outcome as much as the rate, because earlier money compounds for longer.",
      shortLabel: "Timing, not just amount",
      whyItMatters: "It's why starting early can beat contributing more later.",
      teachingNote: "A dollar added early earns interest for every period that follows; the same dollar added late earns for far fewer. The extra years, not just the extra dollars, do the work.",
      commonMisconception: "Only the interest rate and the total amount contributed decide the final balance.",
    },
    {
      id: "small-rates",
      claim: "A small difference in rate compounds into a large gap over a long horizon, because the effect multiplies every period.",
      shortLabel: "Small rates, big gaps",
      whyItMatters: "It's why a 1% fee, or a 1% higher return, matters far more than it sounds.",
      teachingNote: "Because growth is multiplicative, a slightly higher rate is applied to a balance that is itself growing faster each period, so the gap widens the longer you wait.",
      commonMisconception: "A 1% difference in rate makes only about a 1% difference at the end.",
    },
  ],
  workedExample:
    "$1,000 at 7% for 30 years grows to about $7,600, not the $3,100 that simple interest at 7% would give. The extra comes from interest earning its own interest.",
  counterexample:
    "Two people invest the same total, but one starts ten years earlier and then stops adding money; the early starter often ends up ahead despite contributing less.",
  applicationScenarios: [
    "Two funds return 6% and 7% over 40 years. Roughly how far apart do they end up, and why is it more than you'd guess?",
  ],
  misconceptions: [
    "Compound interest is a flat percentage each year.",
    "Only the rate and total contributed matter, not the timing.",
  ],
  fallbackWeaknessQuestion:
    "This year's interest is calculated on what, exactly, the original amount or something bigger?",
  fallbackUnaddressedQuestion:
    "You haven't touched why timing matters yet. Walk me through why money added earlier is worth more.",
  fallbackVerificationQuestion:
    "You've got the core. Two people save the same total, but one starts ten years earlier and then stops. Who ends up ahead, and why?",
  fallbackRepairQuestion:
    "Now put it to work: a fund charges a 1% yearly fee over a 40-year investment. Why does that cost far more than 1% of your money?",
};

export const VACCINES_LESSON: Lesson = {
  slug: "how-vaccines-work",
  title: "How vaccines work",
  mode: "authored",
  objective:
    "Explain what a vaccine actually shows the immune system, what it leaves behind, and why the next real exposure goes differently.",
  difficulty: "foundations",
  claims: [
    {
      id: "what-its-shown",
      claim: "A vaccine shows the immune system a harmless preview of a pathogen's distinctive markers (its antigens), not necessarily the live or weakened pathogen itself.",
      shortLabel: "A preview of the markers",
      whyItMatters: "It's how a vaccine can train you without making you sick.",
      teachingNote: "What the immune system learns to recognize is the antigen, a signature piece of the pathogen. Vaccines deliver that signature in several forms (a protein, genetic instructions to make one, an inactivated fragment), not only as a weakened whole virus.",
      commonMisconception: "Every vaccine is just a weakened version of the actual virus.",
    },
    {
      id: "memory-cells",
      claim: "After the response, the body keeps memory cells for that specific antigen, which a first-ever exposure doesn't have.",
      shortLabel: "Memory cells stay behind",
      whyItMatters: "It's what immunity actually is: a standing readiness, not just leftover antibodies.",
      teachingNote: "A first exposure is slow because the body builds a response from scratch. Vaccination leaves behind memory B and T cells, so the recognition is already in place before the real thing arrives.",
      commonMisconception: "Immunity is just the antibodies from the vaccine still floating around.",
    },
    {
      id: "second-exposure",
      claim: "A later real exposure is met faster and harder, because memory cells recognize the antigen and respond before the pathogen can take hold.",
      shortLabel: "The second time is faster",
      whyItMatters: "It's why a vaccinated person can meet the real pathogen and barely notice.",
      teachingNote: "With memory cells primed, the second response ramps up in a day or two instead of a week, often stopping the infection before symptoms appear.",
      commonMisconception: "A vaccine keeps the pathogen out entirely, like a physical shield.",
    },
  ],
  workedExample:
    "A flu shot carries inactivated virus or just its surface proteins; your body learns those proteins and keeps memory cells, so it recognizes the real flu fast if it shows up.",
  counterexample:
    "A brand-new pathogen you've never seen and never been vaccinated against triggers the slow first-time response, which is why it can make you much sicker.",
  applicationScenarios: [
    "Someone gets a vaccine, then meets the real pathogen a year later and barely gets sick. Walk through what happened inside them.",
  ],
  misconceptions: [
    "Every vaccine is a weakened live virus.",
    "Immunity is just leftover antibodies.",
    "A vaccine physically blocks the pathogen from entering.",
  ],
  fallbackWeaknessQuestion:
    "What is the immune system actually learning to recognize from a vaccine, the whole virus or something more specific?",
  fallbackUnaddressedQuestion:
    "You haven't said what the vaccine leaves behind. What's different about your immune system afterward?",
  fallbackVerificationQuestion:
    "You've got the core. A vaccinated person meets the real pathogen a year later and barely gets sick. What happened inside them, step by step?",
  fallbackRepairQuestion:
    "Now put it to work: why does a second exposure to a pathogen usually go so much better than the first?",
};

export const SUPPLY_DEMAND_LESSON: Lesson = {
  slug: "supply-and-demand",
  title: "Supply and demand",
  mode: "authored",
  objective:
    "Explain why a market price settles where it does, what happens when it's off that point, and the difference between a shift in demand and a movement along the curve.",
  difficulty: "foundations",
  claims: [
    {
      id: "why-it-settles",
      claim: "A price settles where the quantity buyers want equals the quantity sellers offer, because that's the only price with no leftover pressure to move it.",
      shortLabel: "Where pressure disappears",
      whyItMatters: "It reframes the crossing point as a balance of forces, not just an intersection on a graph.",
      teachingNote: "Equilibrium isn't special because two lines cross; it's special because at any other price there's a surplus or a shortage that pushes the price back toward it.",
      commonMisconception: "The price settles at the crossing point simply because that's where the two lines meet on the graph.",
    },
    {
      id: "away-from-it",
      claim: "Away from equilibrium there's a surplus or a shortage, and that imbalance is exactly what pushes the price back toward equilibrium.",
      shortLabel: "Off-balance self-corrects",
      whyItMatters: "It's why equilibrium is stable rather than arbitrary.",
      teachingNote: "Above equilibrium, unsold goods pile up and sellers cut prices; below it, buyers compete for scarce goods and prices rise. The deviation itself creates the pressure back.",
      commonMisconception: "Prices away from the crossing point just stay there; nothing makes them move.",
    },
    {
      id: "shift-vs-move",
      claim: "A shift of the demand curve (the whole relationship changes) is different from a movement along it (a response to the good's own price).",
      shortLabel: "Shift vs. move along",
      whyItMatters: "Confusing the two leads to circular reasoning about price and quantity.",
      teachingNote: "A change in the good's own price moves you ALONG the curve. A change in something else (income, tastes, the price of a substitute) shifts the WHOLE curve. Only shifts change the equilibrium price.",
      commonMisconception: "Any change in how much people buy means the demand curve shifted.",
    },
  ],
  workedExample:
    "A frost destroys half the coffee harvest: supply shifts left, so at the old price there's now a shortage, and the price rises to a new equilibrium.",
  counterexample:
    "Coffee gets more expensive and people buy less. That's a movement along the demand curve, not a shift; demand itself didn't change.",
  applicationScenarios: [
    "A study makes coffee trendy and demand jumps. Walk through what happens to price and quantity, and say whether the curve shifted or you moved along it.",
  ],
  misconceptions: [
    "The price settles at the crossing just because the lines meet.",
    "Prices off the equilibrium just stay put.",
    "Any change in quantity bought means demand shifted.",
  ],
  fallbackWeaknessQuestion:
    "What's true at the settling price that isn't true at any other price?",
  fallbackUnaddressedQuestion:
    "You haven't touched what happens when the price is too high or too low. Walk me through it.",
  fallbackVerificationQuestion:
    "You've got the core. A frost wipes out half the coffee crop. What happens to the price, and why doesn't it just stay where it was?",
  fallbackRepairQuestion:
    "Now put it to work: coffee gets pricier and people buy less. Did the demand curve shift, or did you move along it, and why?",
};

/** The curated library - authored lessons whose content is the teaching source of truth. */
export const LESSONS: Lesson[] = [
  CLOSURES_LESSON,
  INDEXES_LESSON,
  ASYNC_LESSON,
  COMPOUND_INTEREST_LESSON,
  VACCINES_LESSON,
  SUPPLY_DEMAND_LESSON,
];

export function lessonBySlug(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}
