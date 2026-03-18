# STATE — Raporitfy

## Project Reference

See: .planning/PROJECT.md (updated 18 mars 2026)

**Core value:** Permettre à un maître d'œuvre de produire un CR de visite structuré et diffusable en minutes, pas en heures.
**Current focus:** Phase 04 — Decisions & Actions (next)

## Current Milestone

**Milestone 1 : MVP Fonctionnel**
- Total phases: 7 (01-Foundation → 07-AI Draft)
- Current phase: Phase 03 ✅ Complete
- Completed phases: 3 (01-Foundation, 02-Projects, 03-Visits)

## Phase Status

| Phase | Name | Status | Plans |
|---|---|---|---|
| 01 | Foundation | ✅ Complete | 01-01, 01-02 |
| 02 | Projects | ✅ Complete | 02-01, 02-02 |
| 03 | Visits | ✅ Complete | 03-01, 03-02 |
| 04 | Decisions & Actions | ⏳ Not started | — |
| 05 | PDF & Email | ⏳ Not started | — |
| 06 | Validation Workflow | ⏳ Not started | — |
| 07 | AI Draft (Optional) | ⏳ Not started | — |

## What Phase 03 Delivered

- **Data layer:** `lib/services/visits.ts` (CRUD for visits, observations, evidence + photo upload/URL helpers)
- **React Query hooks:** `lib/hooks/useVisits.ts` (queries + mutations with targeted cache invalidation)
- **Visit creation:** Type selector (chantier/réception/levée), date, weather, participants, summary
- **Visit detail screen:** Header card, observations list with photo carousel, FAB for new observations, long-press edit/delete
- **Observation form:** Lot (with quick-pick chips), zone, severity, description, classification
- **Photo system:** expo-image-picker (camera + gallery), `expo-file-system/legacy` + `base64-arraybuffer` for upload to Supabase Storage (public bucket)
- **Photo carousel:** Full-width 180px images on observation cards, horizontal scroll for multiple photos, edge-to-edge layout
- **Form state management:** Timestamp-based reset effect to prevent Expo Router component reuse from showing stale data
- **DB tables:** visits, observations, evidence (all with RLS policies)
- **CTO audit completed:** Fixed React Query cache invalidation, card layout, form state persistence, dead styles

## Critical Architecture Rules

⚠️ **Supabase client uses a Proxy-based lazy singleton in `lib/supabase.ts`.** The client is NEVER created during module import — only on first method call. This prevents Expo Router route evaluation crashes. See `.planning/debug/phase01-post-mortem.md` for full details.

⚠️ **Expo Router reuses component instances.** All navigation links must include `?t=${Date.now()}` to force fresh form state on every navigation. Reset effects must use the `t` param as a dependency.

⚠️ **Photo upload uses `expo-file-system/legacy`** — the main `expo-file-system` package deprecated `readAsStringAsync` in SDK 55.

⚠️ **evidence-photos bucket is PUBLIC** for MVP simplicity. Should be reverted to private for production with signed URL approach.

## Key Decision Log

| Date | Decision | Impact |
|---|---|---|
| 17/03/2026 | Use Supabase as full backend (no separate FastAPI) | Simplifies deployment, eliminates CORS issues |
| 17/03/2026 | Mobile-first with Expo, no web app for MVP | Focuses development effort on field experience |
| 17/03/2026 | Email-only delivery, no client portal | Reduces scope, matches company DNA |
| 17/03/2026 | Skip voice/OCR for MVP | Avoids complexity, can be added post-MVP |
| 17/03/2026 | Skip offline mode for MVP, backend-first storage | Simplifies data layer, offline added later |
| 18/03/2026 | Lazy Proxy Supabase client | Prevents Expo Router route evaluation crashes in Expo Go SDK 55 |
| 18/03/2026 | In-memory auth storage for dev | Sessions don't persist across reloads in Expo Go, but app boots |
| 18/03/2026 | `web.output: "single"` not `"static"` | SSR crashes native modules; SPA mode is correct for mobile |
| 18/03/2026 | Public evidence-photos bucket | Simplifies URL generation for MVP; revert to private for prod |
| 18/03/2026 | Timestamp param on all form navigations | Prevents Expo Router component reuse from showing stale form data |
| 18/03/2026 | `expo-file-system/legacy` for photo upload | Main package deprecated readAsStringAsync in SDK 55 |

---
*Last updated: 18 mars 2026 after Phase 03 completion*
