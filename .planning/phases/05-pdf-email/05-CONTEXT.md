---
phase: 05-pdf-email
gathered: 2026-03-25
status: Ready for planning (auto-defaults — user skipped discussion)
---

# Phase 05: PDF & Email - Context

## Phase Boundary
Generate a professional PDF report from visit data and distribute via email. Archival of sent versions.

**Requirements:** DOC-01, DOC-02, DOC-03, DOC-04

## Implementation Decisions

### 1. PDF Generation Strategy
- **LOCKED:** Use `pdf-lib` (pure JS, Deno-compatible) inside a Supabase Edge Function
- **Rationale:** Headless browsers (Puppeteer) don't work in Edge Functions. pdf-lib is Edge-friendly.
- **Approach:** Programmatic PDF layout — header, sections, tables. NOT HTML→PDF conversion.
- **Photos:** Embed observation photos inline (fetch from Storage, embed as JPEG bytes)
- **Include:** Project info header, visit metadata, observations with photos, decisions, actions, carried-forward actions table

### 2. Preview Flow
- **LOCKED:** "Prévisualiser" button on Visit Detail screen → Edge Function generates PDF → uploaded to Supabase Storage → opened in-app via `expo-sharing` / `Linking.openURL`
- **Each preview = new version** (version auto-incremented in `generated_documents`)
- **Visit status stays `brouillon`** until explicitly sent

### 3. Email Delivery
- **LOCKED:** Use Resend API (free tier: 100 emails/day, sufficient for MVP)
- **Edge Function:** Receives `visit_id` + optional `additional_emails[]` → fetches PDF URL from latest `generated_documents` → sends via Resend with PDF as URL attachment
- **Recipients:** Default = `project_recipients` for the visit's project + any one-off additions at send time
- **Email template:** Simple HTML email with project name, visit date, and PDF link. Subject: `CR Visite — {project_name} — {date}`
- **After send:** Update `generated_documents.sent_at` + `recipients[]`, update `visit.status` to `diffuse`

### 4. Document Versioning & Immutability
- **LOCKED:** `generated_documents` table already has `version` (int, default 1)
- **Immutability:** After `sent_at` is set, that document row is never modified (new versions create new rows)
- **Storage path:** `reports/{visit_id}/cr_v{version}.pdf` in a private `reports` bucket

### 5. Supabase Infrastructure
- **No `generated_documents` migration needed** — table already exists with correct schema
- **New Storage bucket:** `reports` (private, RLS via service_role in Edge Function)
- **Edge Functions:** 2 new functions: `generate-pdf`, `send-report`
- **Secrets needed:** `RESEND_API_KEY` (set via `supabase secrets set`)

### Claude's Discretion
- PDF visual design (fonts, colors, spacing) — professional but simple
- Error handling in Edge Functions
- Loading states in the app

## Deferred Ideas
- DOCX export (DOC format column exists but PDF-only for MVP)
- Custom company logo/branding on PDF
- PDF template customization

---
*Phase: 05-pdf-email*
*Context gathered: 25 mars 2026 via auto-defaults*
