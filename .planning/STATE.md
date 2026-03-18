# STATE — Raporitfy

## Project Reference

See: .planning/PROJECT.md (updated 18 mars 2026)

**Core value:** Permettre à un maître d'œuvre de produire un CR de visite structuré et diffusable en minutes, pas en heures.
**Current focus:** Phase 03 — Visits (next)

## Current Milestone

**Milestone 1 : MVP Fonctionnel**
- Total phases: 7 (01-Foundation → 07-AI Draft)
- Current phase: Phase 02 ✅ Complete
- Completed phases: 2 (01-Foundation, 02-Projects)

## Phase Status

| Phase | Name | Status | Plans |
|---|---|---|---|
| 01 | Foundation | ✅ Complete | 01-01, 01-02 |
| 02 | Projects | ✅ Complete | 02-01, 02-02 |
| 03 | Visits | ⏳ Not started | — |
| 04 | Decisions & Actions | ⏳ Not started | — |
| 05 | PDF & Email | ⏳ Not started | — |
| 06 | Validation Workflow | ⏳ Not started | — |
| 07 | AI Draft (Optional) | ⏳ Not started | — |

## What Phase 02 Delivered

- **Data layer:** `lib/services/projects.ts` (CRUD for projects, members, recipients)
- **React Query hooks:** `lib/hooks/useProjects.ts` (queries + mutations with cache invalidation)
- **Dashboard:** FlashList with project cards, active/archived filter tabs, pull-to-refresh, long-press archive
- **Create project form:** Zod validation, dark theme, keyboard-avoiding
- **Project detail screen:** Header card, visits placeholder, settings link
- **Settings screen:** Recipients CRUD, members list, archive/reactivate
- **Validation schemas:** `lib/validation/schemas.ts` (project + recipient)
- **Date utils:** `lib/utils/date.ts` (French locale formatting)

## Critical Architecture Rule (from Phase 01 Post-Mortem)

⚠️ **Supabase client uses a Proxy-based lazy singleton in `lib/supabase.ts`.** The client is NEVER created during module import — only on first method call. This prevents Expo Router route evaluation crashes. See `.planning/debug/phase01-post-mortem.md` for full details.

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

---
*Last updated: 18 mars 2026 after Phase 02 completion*
