# Roadmap — Raporitfy MVP

## Milestone 1 : MVP Fonctionnel

### Phase 01 — Foundation ✅
**Goal:** Expo project initialized, Supabase connected, auth working, navigation skeleton in place.
**Requirements:** [AUTH-01, AUTH-02]
**Status:** Complete (18 mars 2026)

- ✅ Expo SDK 55 + TypeScript + Expo Router v7
- ✅ Supabase client configured (Auth, DB, Storage) — lazy Proxy singleton
- ✅ Database schema : tables core (organizations, profiles, projects, project_members)
- ✅ RLS policies for organization-level data separation
- ✅ Auth screens (login, register) + session management
- ✅ Tab navigation skeleton + theme system (dark navy/amber)

---

### Phase 02 — Projects ✅
**Goal:** Users can create, list, and manage multiple construction projects with email recipients.
**Requirements:** [PROJ-01, PROJ-02, PROJ-03, PROJ-04, PROJ-05]
**Status:** Complete (18 mars 2026)

- ✅ Dashboard "Mes Chantiers" with FlashList project cards + filter tabs
- ✅ Create project form (name, address, phase, description) + Zod validation
- ✅ Project detail screen with header card + visits placeholder
- ✅ Project settings: email recipients CRUD, members list, archive/reactivate
- ✅ Services layer + React Query hooks with cache invalidation
- ✅ DB tables: projects, project_members, project_recipients (from Phase 01)

---

### Phase 03 — Visits ✅
**Goal:** Users can create visits, add participants, and capture structured observations with photos.
**Requirements:** [VISIT-01, VISIT-02, VISIT-03, OBS-01, OBS-02, OBS-03, OBS-04]
**Status:** Complete (18 mars 2026)

- ✅ Create visit screen (date, type, weather, participants, agenda)
- ✅ Visit detail screen with Observations / Décisions / Actions sections
- ✅ Observation form: lot, zone, severity, description
- ✅ Camera integration (expo-image-picker)
- ✅ Photo upload to Supabase Storage (base64-arraybuffer pattern)
- ✅ Photo carousel thumbnails on observation cards
- ✅ DB tables: visits, observations, evidence
- ✅ CTO audit: cache invalidation, form state, card layout fixes

---

### Phase 04 — Decisions & Actions
**Goal:** Users can record decisions and assign trackable actions with follow-up across visits.
**Requirements:** [DEC-01, DEC-02, ACT-01, ACT-02, ACT-03, ACT-04]
**Estimated Plans:** 2-3

- Decision form: content, author, scope, validation
- Action form: owner, deadline, priority, status
- Link actions to observations or decisions
- Actions dashboard (project-level: filtering, status updates)
- Auto-carry-forward: open actions appear in next visit
- DB tables: decisions, action_items

---

### Phase 05 — PDF & Email
**Goal:** Users can generate a professional PDF report and distribute it via email.
**Requirements:** [DOC-01, DOC-02, DOC-03, DOC-04]
**Estimated Plans:** 3-4

- PDF template (HTML → PDF via Edge Function)
- PDF preview in-app
- Supabase Edge Function: generate PDF from visit data
- Supabase Edge Function: send email with PDF via Resend
- Recipients pulled from project settings
- Generated document record (version, timestamp, recipients, storage link)

---

### Phase 06 — Validation Workflow
**Goal:** Field users submit, office users review and validate, then the report is distributed.
**Requirements:** [VAL-01, VAL-02, VAL-03, AUTH-03]
**Estimated Plans:** 2-3

- Visit status machine: brouillon → en_revue → validé → diffusé
- Role-based permissions: terrain can submit, bureau can validate
- Review screen: edit observations, approve/reject
- Audit log: validation events stored
- Status badges and notifications

---

### Phase 07 — AI Draft (Optional)
**Goal:** AI generates a structured draft report from raw visit data.
**Requirements:** [AI-01, AI-02, AI-03]
**Estimated Plans:** 2-3

- Edge Function: extraction structurée (observations → structured data)
- Edge Function: contrôle métier (validate coherence, detect contradictions)
- Edge Function: rédaction (generate French prose report draft)
- "Générer brouillon IA" button on validated visits
- AI output as editable draft, never published without human review
