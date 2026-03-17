# Phase 01: Foundation - Context

**Gathered:** 17 mars 2026
**Status:** Ready for planning
**Source:** Extracted from PROJECT.md, ROADMAP.md, and user questioning

<domain>
## Phase Boundary

This phase delivers the project skeleton: Expo initialization, Supabase connection, authentication, database schema for core entities, RLS policies, and navigation with theming. After this phase, a user can register, log in, and see an empty dashboard.

**This phase does NOT include:** project CRUD, visits, observations, PDF, or any business features.

</domain>

<decisions>
## Implementation Decisions

### Expo Setup
- Use Expo SDK 52+ with TypeScript strict
- Use Expo Router v4 (file-based routing)
- Initialize with `npx create-expo-app@latest ./ --template tabs`
- Install core dependencies: `expo-router`, `@supabase/supabase-js`, `zustand`, `@tanstack/react-query`, `react-hook-form`, `zod`

### Supabase Configuration
- Use existing Supabase project (token already attached)
- Supabase client initialized in `lib/supabase.ts`
- Auth: email/password only (no social auth for MVP)
- RLS enabled on all tables from day one
- Generate TypeScript types from Supabase schema

### Database Schema (Core)
- `organizations` table: id, name, created_at
- `profiles` table: id (FK auth.users), organization_id (FK), full_name, role (terrain|bureau), created_at
- `projects` table: id, organization_id, name, address, description, phase, status (active|archived), created_at
- `project_members` table: id, project_id, profile_id, role, created_at
- `project_recipients` table: id, project_id, email, name, created_at
- RLS: users see only data from their organization

### Authentication
- Supabase Auth with email/password
- On registration: create profile row with organization
- Session stored via Supabase's built-in session management
- Auth state managed via a custom `useAuth` hook
- Protected routes via Expo Router layout with auth check

### Navigation & Theme
- Tab navigation: "Mes Chantiers" (projects), "Actions" (dashboard)
- Dark navy theme (#0A1628) with amber/orange accent (#F59E0B)
- Inter font (via expo-google-fonts)
- 48px minimum touch targets for field usage

### Claude's Discretion
- Exact folder structure within conventions from CLAUDE.md
- Error handling patterns
- Loading state implementations
- Splash screen config

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value, requirements, constraints
- `.planning/REQUIREMENTS.md` — AUTH-01, AUTH-02 requirement details
- `Claude.md` — Architecture rules, conventions, domain model

### Research
- `.planning/research/STACK.md` — Recommended libraries with versions
- `.planning/research/ARCHITECTURE.md` — System diagram and app structure
- `.planning/research/PITFALLS.md` — UX terrain concerns, touch targets

</canonical_refs>

<specifics>
## Specific Ideas

- Auth screens should be simple: email + password fields, Register / Login buttons
- Dashboard placeholder shows "Aucun chantier" with a prominent "+" button
- Use FlashList for any list rendering from the start
- expo-image instead of RN Image
- Zustand store for auth state + TanStack Query for server state

</specifics>

<deferred>
## Deferred Ideas

- Social auth (Google, Apple) — post-MVP
- Biometric login (FaceID, fingerprint) — post-MVP
- Onboarding flow / tutorial — post-MVP
- Dark/light mode toggle — MVP is dark mode only

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 17 mars 2026 via manual extraction*
