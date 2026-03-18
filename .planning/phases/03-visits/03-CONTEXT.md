# Phase 03: Visits & Observations — Context

**Gathered:** 18 mars 2026
**Status:** Ready for planning
**Source:** ROADMAP.md, REQUIREMENTS.md, Phase 02 output, PITFALLS.md

<domain>
## Phase Boundary

This phase delivers the core visit workflow: users can create visits for a project, add observations with photos, and list/filter observations. After this phase, the app supports live field data capture.

**This phase DOES:** Visit CRUD, observation CRUD, camera/gallery photo capture, photo compression/upload to Supabase Storage, observations list with lot/zone filtering.
**This phase does NOT:** Decisions, actions, PDF generation, validation workflow, or AI draft.

**Starting point:** Phase 02 delivered project CRUD, dashboard, services/hooks pattern (established in `lib/services/` and `lib/hooks/`), Zod validation, and dark theme.
</domain>

<decisions>
## Implementation Decisions

### DB Tables (Migration Required)
Phase 01 created project-related tables. Phase 03 needs visits, observations, and evidence tables:
- `visits` — FK to projects, fields: date, type, weather, summary, status, version, created_by
- `observations` — FK to visits, fields: lot, zone, description, severity, classification, source, confidence
- `evidence` — FK to observations, fields: type (photo|audio|document|note), file_url, content
- RLS: all 3 tables restricted to organization members via project_members join

### Data Layer (Services)
Follow Phase 02 pattern exactly:
- `lib/services/visits.ts` — CRUD for visits + observations + evidence
- `lib/hooks/useVisits.ts` — React Query hooks wrapping services
- Query key structure: `['projects', projectId, 'visits']`, `['visits', visitId, 'observations']`

### Camera & Photos (⚠️ CRITICAL — Expo Go Constraints)
- **Use `expo-image-picker` only** — NOT `expo-camera` (camera requires dev build)
- `expo-image-picker` works in Expo Go for both camera and gallery
- Compress to 80% JPEG quality, max 1920px width (per PITFALLS.md)
- Upload to Supabase Storage bucket `evidence-photos`
- Generate thumbnails via Supabase Image Transformation (URL params)
- Max 15 photos per observation (per PITFALLS.md)

### Screens
1. **Visit List** — inside project detail (replaces Phase 03 placeholder)
2. **Create Visit** — `app/(tabs)/projects/[id]/visits/new.tsx`
3. **Visit Detail** — `app/(tabs)/projects/[id]/visits/[visitId]/index.tsx`
4. **Add Observation** — `app/(tabs)/projects/[id]/visits/[visitId]/observation.tsx`

### UX Rules (from PITFALLS.md)
- 48px minimum touch targets (field usage with gloves)
- Max 3-4 fields per screen
- Pre-filled dropdowns for lot/zone/severity (no long typing)
- Portrait mode only

### Claude's Discretion
- Exact observation card design within theme
- Weather icon selection
- Animation on photo capture
- Severity color coding
- Lot/zone dropdown pre-fill values
</decisions>

<canonical_refs>
## Canonical References

### Project Context
- `.planning/PROJECT.md` — Core value, constraints
- `.planning/REQUIREMENTS.md` — VISIT-01→03, OBS-01→04
- `.planning/research/PITFALLS.md` — Photo compression, UX terrain
- `.planning/debug/phase01-post-mortem.md` — Lazy Proxy pattern, Expo Go compat rules
- `Claude.md` — Architecture rules

### Phase 02 Output (Patterns to Follow)
- `lib/services/projects.ts` — Service layer pattern
- `lib/hooks/useProjects.ts` — React Query hook pattern
- `lib/validation/schemas.ts` — Zod schema pattern
- `lib/utils/date.ts` — Date formatting
- `lib/theme.ts` — Design tokens
- `lib/types/domain.ts` — Visit, Observation, Evidence interfaces

### Installed Dependencies
- `expo-image-picker ~55.0.13` — Camera + gallery (Expo Go compatible)
- `expo-camera ~55.0.10` — ⛔ DO NOT USE in Expo Go (needs dev build)
- `expo-image ~55.0.6` — Image display component
</canonical_refs>

<deferred>
## Deferred Ideas

- Visit participants management — post-Phase 03 (VISIT-02 partial: list only, no invite flow)
- Observation audio recording — post-MVP
- Offline photo queue — post-MVP
- Photo annotation / markup — post-MVP
- Batch photo upload — nice to have
- GPS coordinates on observations — nice to have
</deferred>

---

*Phase: 03-visits*
*Context gathered: 18 mars 2026*
