# Backend Setup — Sprint 1.1 (run these locally; PHP/Composer aren't available in the sandbox)

Run from the repo root (`lifeos/`).

```bash
# 1. Create the Laravel project into backend/
composer create-project laravel/laravel backend
cd backend

# 2. Install Sanctum (SPA cookie-based auth per architecture §6/§18)
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# 3. Create the extra folders architecture §7 calls for beyond Laravel's defaults
mkdir -p app/Http/Controllers/Api/V1 app/Services app/Policies

# 4. Drop in the pre-written templates from ../backend-templates/
cp ../backend-templates/.env.example .env.example
cp ../backend-templates/routes-api.php routes/api.php

# 5. Create your real local .env from the example, then fill in actual
#    Supabase credentials (never commit this file — it's gitignored already)
cp .env.example .env
php artisan key:generate

# 6. Confirm PostgreSQL driver is available
php -m | grep pgsql   # should list pdo_pgsql and pgsql

# 7. Boot check (Definition of Done: boots with no errors)
php artisan serve
```

## Sanctum SPA config checklist (architecture §6, §18)
In `config/sanctum.php`, confirm `stateful` reads from `SANCTUM_STATEFUL_DOMAINS`
(Laravel's default already does this). In `bootstrap/app.php` (Laravel 11+) or
`app/Http/Kernel.php` (Laravel 10), ensure the `EnsureFrontendRequestsAreStateful`
middleware is applied to the API group — required for cookie-based SPA auth to
work at all. This wiring is verified for real in Sprint 1.3 (Auth backend), not
this sprint — Sprint 1.1 only needs Sanctum installed, not wired up yet.

## Definition of Done checklist for this half
- [ ] `php artisan serve` boots with no errors
- [ ] `.env.example` committed, `.env` confirmed gitignored (not committed)
- [ ] Folder structure matches architecture §7 (`Services`, `Policies`, `Http/Controllers/Api/V1`)
- [ ] No real Supabase credentials anywhere in a committed file
