# Phase 02: Projects — Context

**Gathered:** 18 mars 2026
**Status:** Ready for planning
**Source:** Extracted from PROJECT.md, ROADMAP.md, Phase 01 output

<domain>
## Phase Boundary

This phase delivers full project management: users can create, list, edit, archive/reactivate projects, configure email recipients, and delegate access to other users. After this phase, the "Mes Chantiers" tab is functional with real data.

**This phase DOES:** Project CRUD, project cards dashboard, settings screen, recipients management, delegation, archive/reactivate.
**This phase does NOT:** Visits, observations, PDF generation, or validation workflow.

**Starting point:** Phase 01 delivered auth, tab navigation, empty dashboard, and all DB tables (projects, project_members, project_recipients already exist with RLS).

</domain>

<decisions>
## Implementation Decisions

### Data Layer (Services)
- Create `lib/services/projects.ts` — CRUD operations via Supabase client
- All queries go through RLS-protected Supabase client (no raw SQL in app)
- Return typed results using domain.ts interfaces
- Error handling returns `{ data, error }` pattern (matching Supabase convention)

### React Query Integration
- Create `lib/hooks/useProjects.ts` — TanStack Query hooks wrapping services
- `useProjects()`: list all projects for current org
- `useProject(id)`: single project with members + recipients
- `useCreateProject()`: mutation with cache invalidation
- `useUpdateProject()`: mutation
- `useArchiveProject()`: mutation (soft archive, status toggle)
- `useProjectMembers(projectId)`: list members
- `useAddProjectMember()`: mutation
- `useProjectRecipients(projectId)`: list recipients
- `useManageRecipients()`: add/remove mutations

### Screens
1. **Dashboard** (`app/(tabs)/projects/index.tsx`) — Replace empty state with FlashList of project cards
2. **Create Project** (`app/(tabs)/projects/new.tsx`) — Form with react-hook-form + zod validation
3. **Project Detail** (`app/(tabs)/projects/[id]/index.tsx`) — Project info + visits list placeholder
4. **Project Settings** (`app/(tabs)/projects/[id]/settings.tsx`) — Recipients, members, archive

### Form Validation (Zod)
- Project name: required, min 2 chars
- Address: optional
- Description: optional
- Email recipients: valid email format, unique per project

### UI Patterns
- Project cards: glass surface (#111D32), status badge, address, phase info
- FAB "+" button triggers navigation to new.tsx
- Swipe-to-archive on project cards (or long-press menu)
- Pull-to-refresh on dashboard
- Settings as a scrollable form screen

### Claude's Discretion
- Exact card design within theme constraints
- Loading skeleton patterns
- Empty state illustrations
- Error toast implementation
- Keyboard-avoiding behavior on forms

</decisions>

<canonical_refs>
## Canonical References

### Project Context
- `.planning/PROJECT.md` — Core value, constraints
- `.planning/REQUIREMENTS.md` — PROJ-01 through PROJ-05 details
- `Claude.md` — Architecture rules, conventions

### Phase 01 Output
- `lib/supabase.ts` — Supabase client to use
- `lib/types/domain.ts` — Project, ProjectMember, ProjectRecipient interfaces
- `lib/theme.ts` — Colors, spacing, typography
- `lib/hooks/useAuth.ts` — Auth state for current user

### Research
- `.planning/research/ARCHITECTURE.md` — App file structure, component boundaries
- `.planning/research/PITFALLS.md` — UX recommendations for field usage

</canonical_refs>

<deferred>
## Deferred Ideas

- Project search/filter — post-MVP (small number of projects expected initially)
- Project categories/tags — nice to have
- Project photo (cover image) — post-MVP
- Batch project operations — post-MVP

</deferred>

---

*Phase: 02-projects*
*Context gathered: 18 mars 2026*
