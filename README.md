# LifeOS

Gamified learning OS for tracking a structured journey to becoming a professional Full Stack Web Developer — competency-based roadmap, daily missions, XP/level/streak/achievements.

See `architecture.md` for the full architecture document (single source of truth) and `docs/phase-1-sprint-plan.md` for the Phase 1 sprint-by-sprint plan.

## Structure

- `frontend/` — Next.js (App Router, TypeScript strict), Tailwind, shadcn/ui
- `backend/` — Laravel API (Sanctum SPA auth), PostgreSQL (hosted on Supabase)

## Local development

```bash
# Frontend
cd frontend
npm install
cp .env.local.example .env.local
npm run dev        # http://localhost:3000

# Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan serve  # http://localhost:8000
```

## Status

Phase 1: Foundation — in progress. See sprint plan for current sprint.
