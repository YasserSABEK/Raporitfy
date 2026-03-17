# Debug: Phase 01 Foundation — Post-Deploy Issues

**Started:** 2026-03-18T00:41:00Z
**Status:** Active
**Trigger:** Terminal errors after first Expo start

## Symptoms

| # | Error | Code | Severity |
|---|-------|------|----------|
| 1 | `Unable to resolve asset "./assets/images/icon.png"` | — | 🛑 Blocker |
| 2 | `No route named "projects" exists in nested children: ["actions/index", "projects/index"]` | — | ⚠️ Warning |
| 3 | `Value being stored in SecureStore is larger than 2048 bytes` | — | ⚠️ Warning |
| 4 | `new row violates row-level security policy for table "organizations"` | 42501 | 🛑 Blocker |

## Root Cause Analysis

### Bug 1: Missing icon assets
**Cause:** `app.json` references `./assets/images/icon.png` but we only created `.gitkeep`
**Fix:** Create placeholder icon files

### Bug 2: Tab route naming
**Cause:** Expo Router names nested routes as `projects/index` not `projects`. Our Tabs.Screen `name` prop doesn't match.
**Fix:** Change `name="projects"` to `name="projects/index"` and same for actions

### Bug 3: SecureStore size limit
**Cause:** Supabase JWT token exceeds SecureStore's 2048 byte limit
**Fix:** Use AsyncStorage for auth tokens instead of SecureStore

### Bug 4: RLS blocks org INSERT
**Cause:** After `signUp()`, the `supabase.from('organizations').insert().select().single()` triggers the SELECT policy on organizations. The SELECT policy calls `get_user_organization_id()` which queries `profiles` — but no profile exists yet (chicken-and-egg). So `.select()` returns nothing → error.
**Fix:** Create a SECURITY DEFINER function `handle_new_user()` that creates org + profile atomically, or split the insert and select.
