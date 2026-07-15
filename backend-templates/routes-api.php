<?php

use Illuminate\Support\Facades\Route;

// All routes versioned and prefixed per architecture §13.
// Controllers stay thin (orchestration only) — real logic lives in app/Services.
Route::prefix('v1')->group(function () {
    // Sprint 1.3+ will populate this file with real endpoints
    // (register, login, logout, /user, /technologies, /missions/today, etc.)
    // Sprint 1.1 scope is tooling/scaffolding only — intentionally left empty.
});
