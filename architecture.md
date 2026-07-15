# LifeOS — Architecture Documentation

**This document is the single source of truth for LifeOS.** All implementation must follow the decisions recorded here unless a change is explicitly proposed and approved.

---

## Table of Contents
1. [Project Vision](#1-project-vision)
2. [Goals](#2-goals)
3. [MVP Scope](#3-mvp-scope)
4. [Future Versions](#4-future-versions)
5. [Tech Stack](#5-tech-stack)
6. [Architecture Decisions](#6-architecture-decisions)
7. [Folder Structure](#7-folder-structure)
8. [Database Design](#8-database-design)
9. [ER Diagram](#9-er-diagram)
10. [Routing](#10-routing)
11. [Component Tree](#11-component-tree)
12. [State Management](#12-state-management)
13. [API Structure](#13-api-structure)
14. [Engineering Rules](#14-engineering-rules)
15. [Git Strategy](#15-git-strategy)
16. [Sprint Strategy](#16-sprint-strategy)
17. [Coding Standards](#17-coding-standards)
18. [Security Decisions](#18-security-decisions)
19. [Performance Decisions](#19-performance-decisions)
20. [Development Roadmap](#20-development-roadmap)
21. [Future Migration Plan](#21-future-migration-plan)
22. [Architecture Status](#architecture-status)

---

## 1. Project Vision

LifeOS is a gamified learning operating system supporting a structured, long-term journey to becoming a professional Full Stack Web Developer. It combines a competency-based learning roadmap, daily missions, and an XP/level/streak/achievement system into a single application — replacing "did I finish watching a tutorial" with "can I actually use this skill" as the measure of progress.

The UI language is **Bahasa Indonesia** throughout (labels, reminders, progress messages, notifications, missions, achievements). Technical terms (JavaScript, React, API, REST, Git, SQL, etc.) remain in English where that's the natural convention.

## 2. Goals

- Track learning progress by demonstrated competency, not passive content consumption.
- Turn a multi-month self-directed learning plan into daily, trackable, motivating action (missions, XP, streaks).
- Serve as a real production-quality portfolio project in its own right — built with the same rigor as professional software, not a throwaway personal tool.
- Evolve gradually through clearly separated versions without requiring major rewrites of the core (V1) foundation.

## 3. MVP Scope (Version 1)

**Must Have**
- Authentication (register, login, logout, session persistence)
- Onboarding tutorial (first-time setup, locale confirmation)
- Roadmap browsing (technologies → topics → competencies)
- Competency checklist tracking
- Topic completion logic (derived from competencies)
- Daily missions (system-generated only, automatically derived from the roadmap and user's schedule — no manual mission creation in V1)
- XP system, Level system, Streak tracking
- Dashboard (aggregates XP, streak, today's mission, current focus)
- Settings (profile, locale, password)

**Should Have**
- Achievements (unlockable badges tied to milestones)
- Basic analytics (XP over time, topics completed per week)

**Could Have**
- Manual/custom mission creation (deferred to Version 2)
- Basic in-app reminder banner (deferred to Version 2)

**Won't Have (Version 1)**
- Workout tracking, water tracking, learning journal, portfolio tracker, advanced analytics, push/email notifications, social/leaderboard features

**Reasoning:** ship and validate the core learning-and-gamification loop before expanding into adjacent domains (health tracking, journaling, portfolio management). Each "Won't Have" item is a genuinely separate domain that risks tripling schema/UI scope before the core loop is even proven with real daily use.

## 4. Future Versions

Deferred features, each scoped as its own future version rather than designed in detail now (full schema detail in [§21](#21-future-migration-plan)):

- **Version 2** — Reminders & Custom Missions
- **Version 3** — Portfolio Tracker
- **Version 4** — Learning Journal
- **Version 5** — Health & Wellness Tracking (Workout + Water)
- **Version 6** — Advanced Analytics

## 5. Tech Stack

| Layer | Choice |
|---|---|
| Frontend framework | Next.js (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Component primitives | shadcn/ui |
| Animation | Framer Motion |
| Icons | Lucide |
| State management | Zustand |
| Data fetching | TanStack Query (React Query) |
| Form validation | Zod + React Hook Form |
| Charts | Recharts |
| Backend framework | Laravel API |
| Authentication | Laravel Sanctum (SPA mode, httpOnly cookie-based) |
| Database | PostgreSQL, hosted on Supabase, used purely as a managed Postgres instance |

## 6. Architecture Decisions

**Supabase usage — confirmed:** Supabase is used purely as a managed PostgreSQL host. Laravel + Sanctum is the sole authentication, authorization, and API layer. No Supabase Auth, no Row Level Security, no client-side database access from the frontend. This avoids running two competing authorization systems.

**State management — Zustand:** chosen over Redux Toolkit for minimal boilerplate and strong TypeScript support; over plain Context for avoiding unnecessary re-renders across frequently-updating gamification state (XP, streak, mission completion).

**Data fetching — TanStack Query:** almost all app data is server state (roadmap, progress, missions, XP). TanStack Query provides caching, background refetching, and optimistic updates out of the box, avoiding the common anti-pattern of manually copying fetched data into global state.

**Form validation — Zod + React Hook Form:** Zod schemas double as the TypeScript type source (`z.infer`), keeping validation and types as one source of truth. React Hook Form avoids re-rendering the whole form tree on every keystroke.

**Charts — Recharts:** composable, idiomatic React API, easy to theme with existing Tailwind tokens.

**Authentication — Sanctum SPA (cookie-based), not token-based:** httpOnly cookies are not readable by JavaScript, meaningfully reducing XSS-based session theft risk compared to storing tokens in localStorage.

**Hard deletes for V1 — confirmed:** no soft-delete columns on any V1 table. Appropriate for a single-user personal app at this stage; revisit only if a real audit-trail or accidental-deletion need emerges.

**Automatic mission generation — confirmed:** daily missions are generated entirely by a backend `MissionGenerationService`, run on a daily scheduled job, selecting incomplete competencies from the user's current roadmap position. No manual mission creation exists in V1 — this is deferred to Version 2 so the automated core loop can be validated first.

**No Repository pattern over Eloquent:** Eloquent already is the data-access abstraction for this project's size; adding a Repository layer on top would be overengineering without a concrete multi-datasource need.

## 7. Folder Structure

### Frontend (Next.js)
```
/app
  /(auth)/login, /register
  /(app)                     -- protected route group
    /dashboard
    /roadmap/[technologySlug]/[topicSlug]
    /missions
    /progress
    /achievements
    /settings
    /onboarding
    layout.tsx               -- authenticated shell (nav/sidebar)
  layout.tsx                 -- root layout, providers
  providers.tsx              -- React Query client, theme, etc.

/components
  /ui                        -- shadcn primitives
  /features/{dashboard,roadmap,missions,gamification}
  /shared                    -- Navbar, Sidebar, PageHeader, EmptyState

/lib
  /api                       -- typed API client, per-resource functions
  /hooks
  /validators                -- Zod schemas
  /utils

/stores                      -- Zustand stores
/types
/constants
```

### Backend (Laravel)
```
/app
  /Http/Controllers/Api/V1   -- thin, orchestration only
  /Http/Requests             -- Form Request validation
  /Http/Resources            -- API response shaping
  /Models                    -- Eloquent models
  /Services                  -- business logic (XPService, StreakService, MissionGenerationService)
  /Policies                  -- per-model authorization
/database/migrations
/database/seeders            -- roadmap + achievement seed data
/routes/api.php              -- versioned, prefix /api/v1
```

**Rationale:** feature-based grouping on the frontend keeps related UI together as the app grows. A thin Service layer on the backend keeps controllers and models focused on their own responsibilities, since actions like completing a competency require cross-cutting orchestration (progress update → XP award → streak update → achievement check).

## 8. Database Design (Version 1)

All tables: `id BIGSERIAL PRIMARY KEY`, `created_at`/`updated_at TIMESTAMPTZ`, snake_case columns, **no soft deletes**.

**`users`** — core account + gamification state
`name`, `email` (unique), `password` (hashed), `locale` (default `id`), `xp` (default 0), `level` (default 1), `current_streak`, `longest_streak`, `last_activity_date`, `onboarding_completed_at`, `email_verified_at`, `missions_per_day` (default 3, used by mission generation).

**`technologies`** — top-level roadmap nodes
`name`, `slug` (unique), `description`, `category` (`frontend`\|`backend`\|`tooling`), `order_index`.

**`topics`** — subtopics within a technology
`technology_id` (FK → technologies, cascade), `name`, `slug` (unique per technology), `description`, `order_index`.

**`competencies`** — individual checklist items within a topic
`topic_id` (FK → topics, cascade), `description`, `order_index`.

**`user_competency_progress`**
`user_id` (FK, cascade), `competency_id` (FK, cascade), `completed_at` (nullable). Unique on (`user_id`, `competency_id`).

**`user_topic_progress`** — denormalized topic status, avoids recomputation on every dashboard load
`user_id` (FK, cascade), `topic_id` (FK, cascade), `status` (`not_started`\|`in_progress`\|`completed`), `completed_at`. Unique on (`user_id`, `topic_id`).

**`daily_missions`**
`user_id` (FK, cascade), `title`, `description`, `related_topic_id` (FK → topics, nullable, set null on delete), `xp_reward` (default 10), `mission_date`, `completed_at`. Index on (`user_id`, `mission_date`).

**`xp_logs`** — audit trail for every XP change; needed for analytics and for debugging gamification logic
`user_id` (FK, cascade), `amount`, `source_type` (`competency`\|`topic`\|`mission`\|`achievement`), `source_id`. Index on (`user_id`, `created_at`).

**`achievements`** — static catalog
`key` (unique), `name`, `description`, `xp_reward`, `criteria_type` (`streak`\|`topics_completed`\|`technology_completed`), `criteria_value`.

**`user_achievements`**
`user_id` (FK, cascade), `achievement_id` (FK, cascade), `unlocked_at`. Unique on (`user_id`, `achievement_id`).

**Mission generation logic:** a scheduled `MissionGenerationService` runs daily per user, selects up to `missions_per_day` incomplete competencies from the current in-progress topic (falling back to the next topic if needed), and inserts idempotent `daily_missions` rows — no new table required, pure service logic over existing tables.

**Analytics:** no dedicated analytics table in V1 — computed on demand from `xp_logs` and `user_topic_progress`. A pre-aggregated table is deferred to Version 6 once real usage data justifies its shape.

## 9. ER Diagram (Relationships)

- `users` 1—N `user_competency_progress`, `user_topic_progress`, `daily_missions`, `xp_logs`, `user_achievements`
- `technologies` 1—N `topics`
- `topics` 1—N `competencies`
- `topics` 1—N `daily_missions` (optional, via `related_topic_id`)
- `competencies` 1—N `user_competency_progress`
- `topics` 1—N `user_topic_progress`
- `achievements` 1—N `user_achievements`

All user-owned tables cascade-delete with their user — no orphaned progress data.

## 10. Routing

**Public:** `/`, `/login`, `/register`

**Protected** (redirect to `/login` if unauthenticated; redirect to `/onboarding` if not yet onboarded):
`/onboarding`, `/dashboard`, `/roadmap`, `/roadmap/[technologySlug]`, `/roadmap/[technologySlug]/[topicSlug]`, `/missions`, `/progress`, `/achievements`, `/settings`

## 11. Component Tree

- **Dashboard** → `XPBar`, `StreakCounter`, `LevelBadge`, `TodayMissionCard`, `ContinueLearningCard`, `MiniProgressChart`
- **Roadmap list** → `TechnologyCard` (progress ring, category badge)
- **Topic detail** → `TopicHeader`, `CompetencyChecklist` → `CompetencyItem`, `TopicCompletionBanner`
- **Missions** → `MissionList` → `MissionCard`
- **Achievements** → `AchievementGrid` → `AchievementBadge`
- **Settings** → `ProfileForm`, `LocaleToggle`, `PasswordChangeForm`
- **Shared/global:** `Navbar`, `Sidebar`, `AppShell`, `LoadingSpinner`, `Modal`, `ToastProvider`, `PageHeader`, `EmptyState`

## 12. State Management

| Data | Category | Location |
|---|---|---|
| Roadmap data, progress, XP, missions | Server state | TanStack Query cache (source of truth: Laravel DB) |
| Auth session | Server + persistent | httpOnly cookie only — never JS-readable storage |
| Onboarding step, sidebar/theme state | Global UI state | Zustand |
| Form field values | Local state | React Hook Form (not global) |
| Toast/notification queue | Global UI state | Zustand or shadcn toast provider |

**Principle:** anything originating from the database is server state and belongs in TanStack Query — never duplicated into Zustand.

## 13. API Structure

All routes prefixed `/api/v1`. Responses shaped via Laravel API Resources (never raw Eloquent serialization).

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/register` | Create account | No |
| POST | `/login` | Authenticate, issue session cookie | No |
| POST | `/logout` | Destroy session | Yes |
| GET | `/user` | Current user + gamification summary | Yes |
| PATCH | `/user/onboarding` | Mark onboarding complete | Yes |
| PATCH | `/settings/profile` | Update name/locale | Yes |
| PATCH | `/settings/password` | Change password | Yes |
| GET | `/technologies` | List technologies with progress % | Yes |
| GET | `/technologies/{slug}` | Technology detail + topics | Yes |
| GET | `/topics/{slug}` | Topic detail + competencies | Yes |
| POST | `/competencies/{id}/toggle` | Toggle competency; triggers XP + topic recalculation | Yes |
| GET | `/missions/today` | Today's mission(s) | Yes |
| POST | `/missions/{id}/complete` | Complete mission; triggers XP + streak update | Yes |
| GET | `/progress/summary` | Dashboard aggregate | Yes |
| GET | `/progress/analytics` | Chart data | Yes |
| GET | `/achievements` | Achievements with unlocked state | Yes |

## 14. Engineering Rules

- Never use `any` in TypeScript unless interfacing with a genuinely untyped external value — narrow it immediately.
- Business logic lives in Services (backend) and hooks (frontend) — never in controllers or page components.
- Single Responsibility: one component, one job.
- Prefer composition over inheritance/deep prop drilling.
- Every mutating API action must be safe against double-clicks (disable-on-submit or natural idempotency).
- No component calls `fetch`/`axios` directly — always through `/lib/api`.
- All dates/times stored and transmitted in UTC; converted to local display only at the UI layer.
- Every new table has a corresponding seeder/factory before merging.
- Comments explain *why*, not *what* — prefer self-documenting names.

## 15. Git Strategy

**Conventional Commits:** `type(scope): description` — types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `build`, `ci`, `style`. Breaking changes use `!` and a `BREAKING CHANGE:` footer.

**Branching — solo trunk-based with sprint branches:**
- `main` is always in a working, deployable state.
- One short-lived branch per sprint: `sprint/{phase.sprint}-{name}`.
- Every sprint branch is opened as a PR to `main`, self-reviewed via the diff view, then **squash-merged** with one clean Conventional Commit summarizing the sprint.
- Sprint branch deleted after merge.
- Full Git Flow (`develop`/`release`/`hotfix` branches) is intentionally not used — it exists to coordinate multiple teams/release trains, which adds friction with no benefit for a solo developer. A lightweight `hotfix/*` branch off `main` is sufficient if ever needed post-deployment.

## 16. Sprint Strategy

- Development proceeds in **Phases** (e.g., Phase 1: Foundation), each broken into small **Sprints**.
- Every sprint must be completable, testable, reviewable, and mergeable in one focused sitting — if a sprint runs long enough to tempt merging untested work, it was scoped too large and should be split.
- Each sprint is documented with: Sprint Goal, Scope, Tasks, Dependencies, Expected Output, Definition of Done, Possible Risks, Testing Checklist, **Sprint Review Checklist**, and **Recommended Commit Message**.
- A phase is only considered complete when every sprint within it is merged, stable, and its phase-level Definition of Done is fully satisfied.
- Detailed sprint-by-sprint plans are maintained in separate phase-specific documents (e.g., `docs/phase-1-sprint-plan.md`), not duplicated here — this document defines the *strategy*, phase documents define the *execution detail*.

## 17. Coding Standards

- **Naming:** PascalCase (components/classes), camelCase (functions/variables), snake_case (DB columns), kebab-case (route slugs).
- **Components:** one per file, named exports (except Next.js page files), colocated component-specific types.
- **Hooks:** `use` prefix, single concern per hook.
- **Error handling:** Laravel — custom domain exceptions caught centrally, consistent JSON error shape (`{ message, errors }`). Frontend — TanStack Query `onError` + shared error-toast utility, never silent catches.
- **Environment variables:** `.env` / `.env.local` never committed; `.env.example` committed with placeholders only.

## 18. Security Decisions

- **Authentication:** Sanctum SPA mode, httpOnly + Secure + SameSite cookies only — never localStorage tokens.
- **Authorization:** Laravel Policies per model, enforced server-side always; frontend route guards are UX only, never the actual security boundary.
- **Input validation:** Form Request classes on every mutating endpoint; always verify resource ownership server-side.
- **SQL injection:** Eloquent/query builder parameter binding exclusively — no raw string-interpolated queries.
- **XSS:** React's default escaping plus a Content-Security-Policy header as defense-in-depth.
- **CSRF:** handled via Sanctum's stateful domain configuration, scoped to the exact frontend origin.
- **Secrets management:** `.env` only; any credential ever exposed outside `.env` (e.g., pasted in chat or committed) must be rotated immediately.
- **Rate limiting:** Laravel `throttle` middleware on authentication endpoints.

## 19. Performance Decisions

- **Lazy loading:** automatic per-route via Next.js App Router; `next/dynamic` for heavy, rarely-visible components.
- **Caching:** TanStack Query stale-time tuned per resource (long for rarely-changing roadmap data, short for frequently-changing progress/XP data).
- **Memoization:** applied only where an actual re-render cost is observed — not preemptively.
- **Images:** `next/image` for any raster assets beyond SVG icons.
- **Bundle size:** named/tree-shakeable imports only (e.g., `lucide-react` icons).
- **Database indexes:** every foreign key and frequently-filtered column indexed (see [§8](#8-database-design)).

## 20. Development Roadmap

1. **Foundation** — auth, DB connection, base layout, design tokens.
2. **Roadmap data layer** — technologies/topics/competencies + seeders, read-only browsing UI.
3. **Progress tracking** — competency toggling, topic status derivation.
4. **Gamification core** — XP, level, streak services.
5. **Daily missions** — automatic generation + completion flow.
6. **Dashboard integration** — aggregates all prior phases.
7. **Achievements + basic analytics.**
8. **Onboarding + Settings polish.**
9. **QA, hardening, deploy.**

**Ordering rationale:** each phase depends only on phases before it — the roadmap data layer must exist before progress tracking can reference it, progress tracking must exist before XP can be awarded, and the dashboard is deliberately near the end since it's a thin aggregation layer over everything else, not a starting point.

## 21. Future Migration Plan

Each future version is an **additive** migration only — no restructuring of V1's core tables (`users`, `technologies`, `topics`, `competencies`, or the progress tables). If a future feature ever seems to require reshaping a V1 table rather than adding to it, that is a signal to pause and re-discuss the design, not force it through.

### Version 2 — Reminders & Custom Missions
- **New tables:** `user_notification_preferences` (user_id, reminder_time, channel, is_enabled)
- **Modified tables:** `daily_missions` — add `is_user_created` (default false), `created_by_user_id`
- **New relationships:** `users` 1—1 `user_notification_preferences`
- **Reason:** validate the automated mission engine first; group reminders with custom missions since they're natural companions to an established mission system.

### Version 3 — Portfolio Tracker
- **New tables:** `portfolio_projects` (user_id, title, description, repo_url, live_url, status, started_at, finished_at); `portfolio_project_technologies` (pivot)
- **New relationships:** `users` 1—N `portfolio_projects`; `portfolio_projects` N—N `technologies`
- **Reason:** reuses the existing `technologies` table rather than duplicating a tech-list concept, connecting portfolio work back to the learning roadmap.

### Version 4 — Learning Journal
- **New tables:** `journal_entries` (user_id, related_topic_id nullable, title, body)
- **New relationships:** `users` 1—N `journal_entries`; `journal_entries` N—1 `topics` (optional)
- **Reason:** supports the "learning by teaching"/reflection habit; kept separate from competencies to preserve a clean distinction between tracked progress and free-form reflection.

### Version 5 — Health & Wellness Tracking
- **New tables:** `workout_logs` (user_id, activity_type, duration_minutes, logged_date, notes); `water_logs` (user_id, amount_ml, logged_at)
- **New relationships:** `users` 1—N `workout_logs`; `users` 1—N `water_logs`
- **Reason:** independent logging domains, deliberately uncoupled from the learning schema — no real relationship between workout activity and topic completion worth modeling.

### Version 6 — Advanced Analytics
- **New tables:** `analytics_snapshots` (user_id, snapshot_date, xp_total, topics_completed_count, current_streak, category_breakdown JSONB) — shape finalized only once real usage data justifies it
- **Reason:** deliberately last and deliberately under-specified now; the right aggregate views only become clear after real use of V1's basic analytics.

---

# Architecture Status

**The architecture described in this document has been reviewed and approved.**

All implementation work — across every phase and sprint — must follow the decisions recorded here. Any deviation, technology change, or structural revision must be explicitly proposed, explained, and approved before implementation, rather than introduced silently.

This document supersedes prior in-conversation architecture discussions. Where earlier discussion explored alternatives (e.g., other state management or backend-database pairings) that were not chosen, those alternatives are intentionally omitted here — only final, approved decisions are recorded as the source of truth.
