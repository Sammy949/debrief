/**
 * Guest-session persistence (browser-only). Debrief has no accounts yet, so a
 * session and any unsent draft live in localStorage and are restored on reload.
 * All functions are SSR-safe no-ops on the server, and every access is wrapped
 * so a disabled/full store never throws into the render.
 *
 * When Convex + auth land, this is the seam to swap for server-side storage.
 */

import type { Lesson, SessionState } from "@/core/types";
import type { TurnContent } from "@/app/debrief/turn-types";

/** Bump when the persisted shape changes, so stale saves are ignored not crashed. */
const VERSION = 1;

const SESSION_PREFIX = "debrief:session:";
const DRAFT_PREFIX = "debrief:draft:";
/** Points at the slug of the in-progress OPEN session, so the open entry can resume it. */
const OPEN_POINTER = "debrief:open-slug";

export interface PersistedSession {
  lesson: Lesson;
  state: SessionState;
  content: TurnContent;
}

interface Envelope {
  v: number;
  session: PersistedSession;
}

function store(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function saveSession(session: PersistedSession): void {
  const s = store();
  if (!s) return;
  try {
    const env: Envelope = { v: VERSION, session };
    s.setItem(SESSION_PREFIX + session.lesson.slug, JSON.stringify(env));
    if (session.lesson.mode === "open") s.setItem(OPEN_POINTER, session.lesson.slug);
  } catch {
    /* quota or serialization failure: skip persistence, never break the turn */
  }
}

export function loadSession(slug: string): PersistedSession | null {
  const s = store();
  if (!s) return null;
  try {
    const raw = s.getItem(SESSION_PREFIX + slug);
    if (!raw) return null;
    const env = JSON.parse(raw) as Envelope;
    if (env.v !== VERSION || env.session?.lesson?.slug !== slug) return null;
    return env.session;
  } catch {
    return null;
  }
}

/** The in-progress open-concept session, if any (used by the open entry to resume). */
export function loadOpenSession(): PersistedSession | null {
  const s = store();
  if (!s) return null;
  try {
    const slug = s.getItem(OPEN_POINTER);
    if (!slug) return null;
    const session = loadSession(slug);
    return session && session.lesson.mode === "open" ? session : null;
  } catch {
    return null;
  }
}

export function clearSession(slug: string): void {
  const s = store();
  if (!s) return;
  try {
    s.removeItem(SESSION_PREFIX + slug);
    if (s.getItem(OPEN_POINTER) === slug) s.removeItem(OPEN_POINTER);
  } catch {
    /* ignore */
  }
}

// --- unsent draft text, keyed per lesson + field ---------------------------

export function draftKey(slug: string, field: string): string {
  return `${DRAFT_PREFIX}${slug}:${field}`;
}

export function saveDraft(key: string, text: string): void {
  const s = store();
  if (!s) return;
  try {
    if (text.trim()) s.setItem(key, text);
    else s.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function loadDraft(key: string): string {
  const s = store();
  if (!s) return "";
  try {
    return s.getItem(key) ?? "";
  } catch {
    return "";
  }
}

export function clearDraft(key: string): void {
  const s = store();
  if (!s) return;
  try {
    s.removeItem(key);
  } catch {
    /* ignore */
  }
}
