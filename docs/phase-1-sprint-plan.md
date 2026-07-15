# LifeOS — Phase 1: Foundation — Sprint Plan

Status: **Awaiting approval.** No implementation begins until Sprint 1.1 is explicitly approved. Each subsequent sprint begins only after the previous one is completed, reviewed, and stabilized.

---

## Engineering Conventions (apply to every phase, not just Phase 1)

### 1. Conventional Commits
Every commit follows: `type(scope): short description`

Types used in this project: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `build`, `ci`, `style`. Scope is the affected area (e.g. `auth`, `db`, `layout`, `ui`). Example: `feat(auth): implement Sanctum SPA login endpoint`. Breaking changes get a `!` after the type/scope (`feat(auth)!: ...`) plus a `BREAKING CHANGE:` footer — unlikely to come up often in a solo project, but worth doing correctly from the start since it's part of what makes commit history genuinely useful later.

### 2. Git Branching Strategy — Solo Trunk-Based with Sprint Branches

**Recommendation: one short-lived branch per sprint, merged to `main` via self-reviewed PR, squash-merged.**

Reasoning: full Git Flow (separate `develop`, `release/*`, `hotfix/*` branches) exists to coordinate multiple teams and release trains — for a solo developer, that overhead buys you nothing and adds real friction (constant merging between long-lived branches). But committing straight to `main` loses exactly the review-and-stabilize discipline you explicitly want per sprint. The middle ground:

- `main` is always in a working, deployable state — never broken.
- One branch per sprint: `sprint/1.1-project-setup`, `sprint/1.3-auth-backend`, etc.
- Open a PR to `main` even solo — this isn't theater. It gives you a diff view to actually re-read your own change as a reviewer would, and it's the natural place to run CI checks (lint/build/tests) before merge.
- Squash-merge the PR into `main` with one clean Conventional Commit summarizing the whole sprint — this keeps `main`'s history readable (one commit per sprint) while your feature branch can have messy in-progress commits without polluting history.
- Delete the sprint branch after merge.

This gives you production-like discipline (protected `main`, PR-gated merges, clean history) without team-oriented complexity you don't need yet. If a hotfix is ever needed against a deployed version later, a lightweight `hotfix/*` branch off `main` is enough — no need for the full Git Flow release-branch machinery.

### 3. Sprint Review Checklist (included at the end of every sprint)
A standard checklist confirming the sprint is genuinely done — not just "code was written" — before merging. Included per-sprint below.

### 4. Recommended Commit Message (included at the end of every sprint)
The exact squash-merge commit message to use for that sprint's PR, following the Conventional Commits format above.

### 5. Sprint sizing rule
Every sprint must be small enough to be fully completed, manually tested, reviewed, and merged in one sitting (or one focused day) — if a sprint starts running long enough that you're tempted to merge partial/untested work just to move on, that's a signal the sprint was scoped too large and should be split further, not rushed.

---

## Sprint 1.1 — Project Initialization & Tooling

**Sprint Goal:** Two clean, correctly configured repositories (Next.js frontend, Laravel backend) that run, lint, and build with zero errors — before any real logic exists.

**Scope:** Tooling and scaffolding only. No auth, no DB, no UI beyond framework defaults.

**Tasks:**
- Initialize Next.js (App Router, TypeScript strict mode) project
- Configure ESLint + Prettier with strict rules (no `any`, consistent import order)
- Install and configure Tailwind CSS
- Initialize shadcn/ui (base config, no components installed yet)
- Install Framer Motion, Lucide, Zustand, TanStack Query, Zod, React Hook Form, Recharts as dependencies only (not wired up yet)
- Initialize Laravel project, install Sanctum package
- Configure `.env.example` for both projects with placeholder values (never real secrets)
- Set up `.gitignore` correctly for both (env files, `node_modules`, `vendor`, build artifacts)
- Initialize Git repo(s), first commit

**Dependencies:** None — this is the starting point.

**Expected Output:** Two projects that both run locally (`npm run dev`, `php artisan serve`) showing framework default pages, with zero TypeScript/ESLint/build errors.

**Definition of Done:**
- ✅ `npm run build` succeeds with zero errors/warnings
- ✅ `npm run lint` passes clean
- ✅ Laravel boots via `artisan serve` with no errors
- ✅ Both `.env.example` files committed, no real secrets anywhere in the repo
- ✅ Folder structure matches §3 of the architecture doc

**Possible Risks:**
- Dependency version mismatches between Next.js/React/shadcn (shadcn is sensitive to exact React/Next versions) — pin versions deliberately rather than installing latest blindly.
- TypeScript strict mode surfacing friction immediately if defaults are misconfigured — better to hit this now than after real code exists.

**Testing Checklist:**
- [ ] Fresh `git clone` + install + run works on a clean machine/folder (not just your existing local state)
- [ ] Both dev servers start without warnings
- [ ] Lint and build commands both exit 0

**Sprint Review Checklist:**
- [ ] All tasks above completed
- [ ] Definition of Done fully met, no exceptions
- [ ] Zero TypeScript/ESLint/build errors confirmed fresh (not just "worked earlier")
- [ ] No secrets or real credentials anywhere in the repo (check `.env` is gitignored, not just `.env.example` present)
- [ ] Branch `sprint/1.1-project-setup` opened as a PR to `main`, self-reviewed via the diff view
- [ ] PR squash-merged into `main`, sprint branch deleted

**Recommended Commit Message:**
```
chore(setup): initialize Next.js and Laravel project scaffolding

- Configure TypeScript strict mode, ESLint, Prettier
- Set up Tailwind, shadcn/ui, and core dependencies
- Initialize Laravel with Sanctum package
- Add .env.example for both projects, configure .gitignore
```

---

## Sprint 1.2 — Database Connection

**Sprint Goal:** Laravel is reliably connected to the (rotated) Supabase Postgres instance, with the `users` table migration in place — nothing else yet.

**Scope:** Database connectivity and the single `users` table from §4 of the architecture doc. No other tables.

**Tasks:**
- Configure Laravel's `database.php` for PostgreSQL connection using env-sourced credentials
- Confirm connection against the rotated Supabase Postgres instance
- Write the `users` table migration exactly as specified in §4 (including `missions_per_day`, gamification fields, no soft deletes per your V1 decision)
- Run migration, verify table shape in the actual database
- Add a basic `.env` validation step (fail fast with a clear error if DB env vars are missing, rather than a cryptic connection error)

**Dependencies:** Sprint 1.1 complete (Laravel project must exist and boot).

**Expected Output:** `php artisan migrate` runs cleanly against Supabase Postgres, `users` table exists with the exact columns/constraints from the architecture doc.

**Definition of Done:**
- ✅ Migration runs with no errors
- ✅ Table inspected directly in Supabase's table editor and matches spec exactly (column types, unique index on `email`)
- ✅ Rollback (`migrate:rollback`) also works cleanly — proves the migration is well-formed, not just one-directional

**Possible Risks:**
- Supabase connection pooling settings (it offers both direct and pooled connection strings) — using the wrong one can cause intermittent connection errors under Laravel's default persistent connections. Worth explicitly checking Supabase's Laravel-specific connection guidance here.
- SSL mode requirements — Supabase Postgres typically requires `sslmode=require`; if Laravel's config omits this, connection will fail with a non-obvious error.

**Testing Checklist:**
- [ ] `artisan migrate` succeeds
- [ ] `artisan migrate:rollback` succeeds and cleanly drops the table
- [ ] Manually insert and query a test row via `artisan tinker` to confirm read/write both work
- [ ] Confirm no plaintext credentials committed anywhere (double-check after this sprint specifically, since it's the one touching real DB config)

**Sprint Review Checklist:**
- [ ] All tasks above completed
- [ ] Definition of Done fully met, no exceptions
- [ ] Migration and rollback both verified working
- [ ] Table shape manually confirmed in Supabase directly, not assumed from migration file alone
- [ ] No real DB credentials committed anywhere
- [ ] Branch `sprint/1.2-database-connection` opened as a PR to `main`, self-reviewed via the diff view
- [ ] PR squash-merged into `main`, sprint branch deleted

**Recommended Commit Message:**
```
feat(db): connect Laravel to PostgreSQL and add users migration

- Configure database connection for Supabase Postgres
- Add users table migration per architecture spec
- Verify migration and rollback both succeed
```

---

## Sprint 1.3 — Authentication (Backend Only)

**Sprint Goal:** A fully working Sanctum SPA authentication API, verified independently of any frontend — via direct HTTP requests (Postman/curl/Thunder Client).

**Scope:** `/register`, `/login`, `/logout`, `/user` endpoints. CORS and stateful domain config. No frontend code this sprint.

**Tasks:**
- Configure Sanctum for SPA authentication mode (stateful, cookie-based — not token-based)
- Set `SANCTUM_STATEFUL_DOMAINS` to the exact frontend origin (including port for local dev)
- Configure CORS (`config/cors.php`) to allow credentials from the frontend origin specifically — never a wildcard
- Implement Form Requests for register/login validation
- Implement the four auth endpoints per §9 of the architecture doc
- Implement rate limiting (`throttle`) on login/register per §11
- Set up a base `Handler.php` exception-to-JSON mapping for consistent error responses

**Dependencies:** Sprint 1.2 complete (`users` table must exist).

**Expected Output:** All four auth endpoints verified working via direct API testing tool, cookies correctly issued and validated, no frontend involved yet.

**Definition of Done:**
- ✅ Register creates a user with a hashed password, returns expected shape
- ✅ Login issues a valid session cookie (httpOnly, secure in production config, correct SameSite)
- ✅ `/user` returns 401 without a valid session, correct user data with one
- ✅ Logout invalidates the session
- ✅ Rate limiting confirmed (rapid repeated login attempts get throttled)

**Possible Risks:**
- This is the single highest-risk sprint in Phase 1 — cookie-based SPA auth has more moving parts (CORS credentials, SameSite, domain matching) than token auth, and misconfigurations often fail silently or with unhelpful errors. Budget real debugging time here rather than expecting it to work first try.
- Local dev origin mismatches (e.g., `localhost` vs `127.0.0.1`) silently breaking cookie behavior — worth deciding one canonical local dev URL now and using it consistently.

**Testing Checklist:**
- [ ] Full register → login → authenticated request → logout cycle tested via API client
- [ ] Invalid credentials correctly rejected with proper error shape
- [ ] Duplicate email registration correctly rejected
- [ ] Confirm cookie attributes in the raw response headers (httpOnly, SameSite, Secure as appropriate for environment)
- [ ] Confirm rate limiting triggers after threshold attempts

**Sprint Review Checklist:**
- [ ] All tasks above completed
- [ ] Definition of Done fully met, no exceptions
- [ ] Full register → login → authenticated request → logout cycle verified via API client
- [ ] Cookie attributes (httpOnly, SameSite, Secure) manually inspected in raw response headers
- [ ] CORS/stateful domain config double-checked against exact frontend origin
- [ ] Branch `sprint/1.3-auth-backend` opened as a PR to `main`, self-reviewed via the diff view
- [ ] PR squash-merged into `main`, sprint branch deleted

**Recommended Commit Message:**
```
feat(auth): implement Sanctum SPA authentication endpoints

- Add register, login, logout, and user endpoints
- Configure Sanctum stateful domains and CORS for SPA auth
- Add Form Request validation and rate limiting on auth routes
- Add consistent JSON error handling via Exception Handler
```

---

## Sprint 1.4 — Authentication (Frontend Integration)

**Sprint Goal:** The Next.js app can register, log in, log out, and know the current auth state — talking to the now-proven backend from Sprint 1.3.

**Scope:** Login/register pages, a typed API client for auth calls, TanStack Query setup for the `/user` query, basic auth state exposed to the app.

**Tasks:**
- Set up TanStack Query provider at the app root
- Build `/lib/api` client with a base fetch wrapper (credentials included for cookies)
- Implement login and register pages/forms using React Hook Form + Zod
- Wire forms to the backend endpoints, handle success/error states
- Implement a `useCurrentUser` hook wrapping the `/user` query
- Confirm cross-origin cookie behavior actually works end-to-end from the browser (not just API-tool testing)

**Dependencies:** Sprint 1.3 complete and independently verified.

**Expected Output:** A user can register and log in through the actual UI, and the app correctly knows whether someone is authenticated.

**Definition of Done:**
- ✅ Register form creates an account and reflects success/failure correctly
- ✅ Login form authenticates and persists session across a page refresh (cookie-based, not memory-only)
- ✅ Logout clears session and is reflected immediately in UI state
- ✅ Zero TypeScript errors, Zod schemas shared between validation and types (no duplicated type definitions)

**Possible Risks:**
- Browser-level cookie/CORS issues can appear here even if Sprint 1.3's API-tool testing passed cleanly, since browsers enforce CORS/cookie rules API tools often don't — treat this as a real possible re-open of Sprint 1.3 config, not purely new frontend work.

**Testing Checklist:**
- [ ] Manual register → login → refresh page → still authenticated
- [ ] Manual logout → refresh page → correctly redirected/unauthenticated
- [ ] Invalid form input shows correct validation errors before hitting the API at all
- [ ] Network tab confirms cookies are being sent/received correctly on each request

**Sprint Review Checklist:**
- [ ] All tasks above completed
- [ ] Definition of Done fully met, no exceptions
- [ ] Full auth cycle verified through the actual browser UI, not just API tools
- [ ] Session persists correctly across page refresh
- [ ] Zod schemas confirmed shared between validation and TypeScript types (no duplicated type definitions)
- [ ] Branch `sprint/1.4-auth-frontend` opened as a PR to `main`, self-reviewed via the diff view
- [ ] PR squash-merged into `main`, sprint branch deleted

**Recommended Commit Message:**
```
feat(auth): integrate authentication into Next.js frontend

- Add TanStack Query provider and typed API client
- Implement login/register forms with React Hook Form + Zod
- Add useCurrentUser hook for auth state
- Verify end-to-end cookie-based session flow in browser
```

---

## Sprint 1.5 — Application Shell & Layout

**Sprint Goal:** The authenticated app has a real navigational shell — Navbar, Sidebar, responsive root layout — that every future feature page will sit inside.

**Scope:** Static shell only. Placeholder links/pages, no real page content yet beyond what's needed to prove the shell works.

**Tasks:**
- Build `AppShell` component (wraps all protected routes per §3/§6)
- Build `Navbar` (user menu placeholder, logout action wired to real auth)
- Build `Sidebar` (static nav links to future routes: dashboard, roadmap, missions, progress, achievements, settings — routes can 404/placeholder for now)
- Implement responsive behavior (sidebar collapses on mobile per Tailwind breakpoints)
- Wire the shell into the `(app)` route group layout

**Dependencies:** Sprint 1.4 complete (shell needs real auth state for the user menu/logout to function).

**Expected Output:** Logging in lands you inside a real, responsive app shell with working navigation and a working logout button.

**Definition of Done:**
- ✅ Shell renders correctly at mobile, tablet, and desktop breakpoints
- ✅ Sidebar navigation links route correctly (even to placeholder pages)
- ✅ Logout from the navbar actually logs out and redirects to `/login`
- ✅ No layout shift/flash of unauthenticated content on load

**Possible Risks:**
- Flash-of-unauthenticated-content is a common issue with client-side auth checks — worth deciding now whether to accept a brief loading state or invest in a more robust check, rather than discovering this ad hoc later.

**Testing Checklist:**
- [ ] Resize browser through all breakpoints, confirm no broken layout
- [ ] Every sidebar link navigates without console errors
- [ ] Logout button works from every page inside the shell, not just one

**Sprint Review Checklist:**
- [ ] All tasks above completed
- [ ] Definition of Done fully met, no exceptions
- [ ] Shell verified responsive at mobile, tablet, and desktop breakpoints
- [ ] No flash-of-unauthenticated-content on load
- [ ] Branch `sprint/1.5-app-shell` opened as a PR to `main`, self-reviewed via the diff view
- [ ] PR squash-merged into `main`, sprint branch deleted

**Recommended Commit Message:**
```
feat(layout): add responsive application shell

- Add AppShell, Navbar, and Sidebar components
- Wire logout action into Navbar using real auth state
- Implement responsive sidebar collapse behavior
- Wire shell into protected route group layout
```

---

## Sprint 1.6 — UI Foundation & Design System

**Sprint Goal:** A small, consistent set of base UI primitives and design tokens exist, so future feature sprints build on a real design system rather than one-off styled components.

**Scope:** shadcn component installation (Button, Card, Input, Dialog, Toast, Badge — only what's needed for Phase 1 and reasonably anticipated soon), Tailwind theme tokens (colors, spacing, typography scale), no feature-specific components yet.

**Tasks:**
- Install and lightly customize needed shadcn components
- Define Tailwind theme tokens (brand colors, spacing scale, font choices) in `tailwind.config`
- Establish typography conventions (heading/body scale) used consistently going forward
- Build a small `PageHeader` shared component (used by every future page)
- Confirm dark/light mode decision (recommend: pick one for V1, defer theming toggle to a later polish phase — theming infra is real scope that isn't justified yet)

**Dependencies:** Sprint 1.1 (shadcn initialized), can run in parallel with 1.5 if you prefer, but sequencing after 1.5 lets the shell use these finalized primitives rather than placeholder styling.

**Expected Output:** A small, documented set of reusable UI primitives styled consistently, ready for every future feature sprint to consume.

**Definition of Done:**
- ✅ All installed shadcn components render correctly with your theme tokens applied
- ✅ Typography scale applied consistently across existing pages (auth pages, shell)
- ✅ No inline one-off styling overriding the design tokens

**Possible Risks:**
- Scope creep — it's tempting to over-invest in a full design system here. Resist adding components you don't have a concrete near-term use for; add them when a feature sprint actually needs them.

**Testing Checklist:**
- [ ] Visual check of every installed component against your token set
- [ ] No hardcoded hex colors/spacing values outside the Tailwind config anywhere in current code

**Sprint Review Checklist:**
- [ ] All tasks above completed
- [ ] Definition of Done fully met, no exceptions
- [ ] Every installed component visually checked against theme tokens
- [ ] No scope creep — only components with a concrete near-term use were added
- [ ] Branch `sprint/1.6-ui-foundation` opened as a PR to `main`, self-reviewed via the diff view
- [ ] PR squash-merged into `main`, sprint branch deleted

**Recommended Commit Message:**
```
feat(ui): establish design system foundation

- Install and theme core shadcn/ui components
- Define Tailwind theme tokens (colors, spacing, typography)
- Add shared PageHeader component
- Confirm single light/dark mode choice for V1
```

---

## Sprint 1.7 — Route Protection, Onboarding & Dashboard Placeholders

**Sprint Goal:** Unauthenticated users cannot reach protected routes, and the onboarding/dashboard placeholder pages exist as real (if empty) destinations — closing out Phase 1's Definition of Done.

**Scope:** Middleware-level route protection, onboarding placeholder page, dashboard placeholder page. No real onboarding logic or dashboard content — literally placeholders proving the route exists and is protected.

**Tasks:**
- Implement Next.js middleware (or layout-level guard) checking auth state before rendering any `(app)` route
- Redirect unauthenticated access attempts to `/login`
- Redirect authenticated-but-not-onboarded users to `/onboarding` (using `onboarding_completed_at` from the `users` table)
- Build `/onboarding` placeholder page (static content, a "Continue" button that calls the existing `/user/onboarding` PATCH endpoint — this one real interaction is worth building now since it's simple and closes the loop)
- Build `/dashboard` placeholder page (static "Welcome" content only)

**Dependencies:** Sprints 1.4 (auth), 1.5 (shell), and 1.6 (UI primitives) all complete.

**Expected Output:** The full auth-to-dashboard user journey works end-to-end: register → onboarding → dashboard, with protected routes genuinely inaccessible while logged out.

**Definition of Done — this also closes Phase 1 overall:**
- ✅ Project successfully runs (both frontend and backend)
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ No build errors
- ✅ Clean folder structure (matches §3)
- ✅ Environment variables configured correctly (and no real secrets committed)
- ✅ Database successfully connected
- ✅ Authentication working end-to-end (backend + frontend)
- ✅ Responsive base layout
- ✅ Sidebar and Navbar functioning
- ✅ Root layout in place
- ✅ Route protection verified (unauthenticated access genuinely blocked, not just hidden via UI)
- ✅ Onboarding placeholder reachable and functional (marks completion correctly)
- ✅ Dashboard placeholder reachable post-onboarding

**Possible Risks:**
- Route protection implemented only at the UI level (hiding links) rather than actually blocking navigation is a common shortcut that looks done but isn't secure — confirm protection holds even via direct URL entry, not just by clicking through the UI.

**Testing Checklist:**
- [ ] Direct URL navigation to `/dashboard` while logged out redirects to `/login`
- [ ] Fresh registered user is routed to `/onboarding`, not directly to `/dashboard`
- [ ] Completing onboarding correctly updates `onboarding_completed_at` and unlocks `/dashboard`
- [ ] Returning (already onboarded) user goes straight to `/dashboard` on login
- [ ] Full fresh-clone build (`npm run build`, `artisan` checks) passes with zero errors as a final Phase 1 gate

**Sprint Review Checklist:**
- [ ] All tasks above completed
- [ ] Every item in Phase 1's overall Definition of Done verified, not just this sprint's own DoD
- [ ] Route protection tested via direct URL entry, not just UI click-through
- [ ] Full fresh user journey (register → onboarding → dashboard) tested end-to-end
- [ ] Branch `sprint/1.7-route-protection` opened as a PR to `main`, self-reviewed via the diff view
- [ ] PR squash-merged into `main`, sprint branch deleted
- [ ] Phase 1 tagged in Git (e.g. `git tag v0.1-phase1-foundation`) marking a stable milestone

**Recommended Commit Message:**
```
feat(auth): add route protection and onboarding/dashboard placeholders

- Add middleware guarding protected routes by auth state
- Redirect based on onboarding_completed_at status
- Add onboarding placeholder page with completion action
- Add dashboard placeholder page
- Closes Phase 1: Foundation
```

---

## Summary

| Sprint | Focus | Key Risk |
|---|---|---|
| 1.1 | Project setup & tooling | Dependency/version mismatches |
| 1.2 | Database connection | Supabase connection string / SSL config |
| 1.3 | Auth (backend) | Cookie/CORS/SameSite configuration |
| 1.4 | Auth (frontend) | Browser-level cookie behavior differing from API-tool testing |
| 1.5 | App shell & layout | Flash-of-unauthenticated-content |
| 1.6 | UI foundation | Scope creep into unnecessary design system work |
| 1.7 | Route protection & placeholders | UI-only "fake" protection instead of real guarding |

Waiting for your approval to begin **Sprint 1.1**. Nothing will be implemented until then.
