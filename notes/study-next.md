# Debrief — next-phase study guide

_Prepared 2026-08-26. Grounded against the current docs, not memory. Reference material for the phases after the live loop._

## Where we are (done)
- Real teach-back loop, live on Groq (`gpt-oss-120b`/`20b`, strict structured outputs, Zod-validated).
- Open-concept entry (`/debrief/new`): name any concept -> Groq scaffolds claims -> debrief runs.
- Guest-first + ephemeral (no persistence yet); two-pane workbench UI; World A + Satoshi.
- `/core` pure reducer + Vitest (green). Repo + CI/CD live; prod `GROQ_API_KEY` set.

## Next up (priority order)
1. **Map clarity** (a) — the signature isn't self-explanatory. See `notes/private/map-redefine.md`.
2. **Demo hardening** (b) — loading/mobile/error/edge; a clean fresh-browser run.
3. **Persistence: Convex + Better Auth** (deferred; below) — save debriefs / focus points / history.
4. Content — more curated lessons (optional; open-concept already covers "any concept").
5. Devpost — video/screenshots/write-up (Samuel is handling).

---

## STUDY 1 — Convex + Better Auth (guest-first persistence)

**Packages:** `convex@latest` (>= 1.25.0), `@convex-dev/better-auth`, `better-auth@~1.6.15`. The `@convex-dev/better-auth` component is maintained by Convex.

**File map (App Router):**
- `convex/convex.config.ts` — `app.use(betterAuth)` to register the component.
- `convex/auth.config.ts` — `providers: [getAuthConfigProvider()]`.
- `convex/auth.ts` — `createClient<DataModel>(components.betterAuth)` + `createAuth(ctx)` using `betterAuth/minimal`, `emailAndPassword: { enabled: true }`, `plugins: [convex({ authConfig })]`.
- `src/lib/auth-client.ts` — `createAuthClient({ plugins: [convexClient()] })`.
- `src/lib/auth-server.ts` — `convexBetterAuthNextJs(...)` -> exports `handler`, `preloadAuthQuery`, `isAuthenticated`, `getToken`, `fetchAuthQuery/Mutation/Action`.
- `app/ConvexClientProvider.tsx` — wrap in `ConvexBetterAuthProvider` (replaces `ConvexProvider`).
- `convex/http.ts` — `authComponent.registerRoutes(http, createAuth)`.
- `app/api/auth/[...all]/route.ts` — `export const { GET, POST } = handler`.

**Accessing the user:** query -> `authComponent.getAuthUser(ctx)`; mutation -> `const { auth, headers } = await authComponent.getAuth(createAuth, ctx)`. Session cookies handled automatically.

**Env vars** (note the split — auth-instance vars live on Convex, NOT `.env.local`):
- On Convex (via `npx convex env set`): `BETTER_AUTH_SECRET`, `SITE_URL`.
- In `.env.local`: `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL` (the `.site` URL), `NEXT_PUBLIC_SITE_URL`.

**Guest-first adaptation (ours):** every session owned by `ownerKey = user:<id> | guest:<httpOnly-cookie>`. Auth is persistence, never a gate. Open question: does Better Auth's anonymous plugin fit, or do we roll the guest cookie ourselves? -> see research doc.

**Refs:** labs.convex.dev/better-auth/framework-guides/next · better-auth.com/docs/integrations/convex

## STUDY 2 — Convex data model for Debrief

Entities (from the locked architecture): `lessons`, `debriefSessions`, `claims`, `responses`, `followUps`, `interventions`, `repairAttempts`. Every row scoped by `ownerKey`; never trust a client-supplied owner once auth lands.

The persistence pattern keeps the boundary we already built: **Next server action runs Groq -> Zod-validate -> pure `reduce` -> then a Convex mutation persists the new state + trajectory.** The reducer stays the single source of truth; Convex is durable storage. Study: how to store `SessionState` + `trajectory` (one session doc with embedded claim snapshots vs. normalized tables) and how `lessons.seed.ts` seeds the curated lessons.

## STUDY 3 — Map redefinition
See `notes/private/map-redefine.md`. Study legible "progress readout" and diagnostic-panel UI: state keys, prominent state words, a one-line "what this is" caption. Keep card-less World A; prioritise meaning over metaphor.

## STUDY 4 — Demo hardening checklist
Loading/thinking states on every AI turn · error/retry paths · mobile (two-pane collapses cleanly) · map at 3/4/5 claims · reduced-motion · a full fresh-browser run of `/debrief/new` end to end · latency feel.

## Deployment note
Convex needs its own prod deployment + env wiring; `NEXT_PUBLIC_CONVEX_SITE_URL` is the `.site` URL. Verify `debrief.samuelyahaya.com` serves the built app and the auth route proxies correctly.
