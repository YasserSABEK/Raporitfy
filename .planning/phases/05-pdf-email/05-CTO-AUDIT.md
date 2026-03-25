# CTO Audit — Phase 05: PDF & Email

**Auditor:** Senior CTO (30 years experience)
**Date:** 25 mars 2026
**Scope:** Plans 05-01, 05-02, 05-03

---

## 🔴 CRITICAL ISSUES (Must Fix Before Execution)

### GAP-A: Wrong `pdf-lib` import path
**Plan 05-01, Task 2** uses `https://cdn.skypack.dev/pdf-lib@1.17.1`
- Skypack CDN is unreliable/deprecated for Deno Edge Functions
- **Fix:** Use `npm:pdf-lib` specifier in Edge Function (Deno natively supports npm imports since 2024)
- Import should be: `import { PDFDocument, rgb, StandardFonts } from "npm:pdf-lib@1.17.1";`

### GAP-B: Photo URLs are PATHS, not full URLs
**Plan 05-01, Task 2** says "fetch each evidence photo URL via Storage"
- In reality, `evidence.file_url` stores **storage paths** like `observations/1711234567-abc.jpg`, NOT full URLs
- The `evidence-photos` bucket is PUBLIC, so the Edge Function must construct the full URL:
  ```
  const photoUrl = `${SUPABASE_URL}/storage/v1/object/public/evidence-photos/${file_url}`;
  ```
- **Impact:** Without this fix, ALL photo downloads will fail with 404

### GAP-C: Private `reports` bucket needs signed URLs for app download
**Plan 05-01, Task 2** uploads to private bucket but returns `file_url`
- A private bucket URL won't be accessible in-app or by Resend
- **Fix:** Either make `reports` bucket PUBLIC (acceptable for MVP) or generate signed URLs for each download
- Recommendation: Make it PUBLIC like `evidence-photos` for simplicity

### GAP-D: `process.env.EXPO_PUBLIC_SUPABASE_URL` in documents.ts won't work reliably
**Plan 05-01, Task 3** uses `process.env.EXPO_PUBLIC_SUPABASE_URL`
- This works in `supabase.ts` because Metro's Babel transforms it. But it's fragile.
- **Fix:** Import the URL from `lib/supabase.ts` or define a shared constant. Actually checking the code, `process.env.EXPO_PUBLIC_SUPABASE_URL` IS used in `supabase.ts` and works fine in Metro/Expo — keep as-is but be consistent.

### GAP-E: Missing `generated_documents` RLS for UPDATE 
**RLS audit** found only SELECT and INSERT policies exist. No UPDATE policy.
- **Impact:** The `send-report` function tries to UPDATE `generated_documents.sent_at` but uses `service_role`, so it bypasses RLS. OK for Edge Functions.
- **But:** App client-side queries need UPDATE if we add "re-send" features. Defer for now since Edge Functions use service_role.

---

## 🟡 IMPORTANT ISSUES (Should Fix)

### GAP-F: PDF layout doesn't match French CR Standard
**Research finding:** French CR de chantier (NF P 03-001 pattern) has a specific structure:

1. **En-tête avec numéro de CR** — `COMPTE RENDU DE CHANTIER N°{version}` (not just "de visite")
2. **Bloc identification** — Maître d'ouvrage, Maître d'œuvre, Adresse chantier, N° affaire
3. **Participants** — Présents (with function/enterprise) / Absents / Excusés
4. **Suivi des actions antérieures** — Status table of previous CR's actions (CRITICAL — this is the carry-forward)
5. **Observations par lot** — Grouped by trade/lot, with zone, description, severity, photos
6. **Décisions prises** — Each with author, scope, validated status
7. **Actions à mener** — Table: Description | Responsable | Échéance | Priorité
8. **Prochaine réunion** — Date of next visit
9. **Diffusion** — List of recipients
10. **Pied de page** — N° CR / Page N/Total / Date de diffusion

**Plan 05-01 Task 2 PDF layout is close but missing:**
- CR number (version should be called "N°{n}")
- Participants section
- "Suivi des actions antérieures" as a formal section
- "Prochaine réunion" field
- "Diffusion" footer with recipient list

### GAP-G: Resend `from` address requires domain verification
**Plan 05-03** uses `cr@raporitfy.com` — this requires DNS verification in Resend
- **Fix for MVP:** Use `onboarding@resend.dev` (Resend's free test sender, no verification needed)
- Note in plan: production requires adding raporitfy.com domain in Resend dashboard

### GAP-H: Storage bucket creation via SQL is fragile
**Plan 05-01, Task 1** tries to create bucket via SQL INSERT
- Supabase storage bucket creation via SQL is undocumented/unsupported
- **Fix:** Use Supabase dashboard or `supabase storage create` CLI command
- For MCP deploy: use `execute_sql` to insert, but test carefully

### GAP-I: Edge Function `verify_jwt: false` has security implications
**Plans 05-01 and 05-03** disable JWT verification
- Correct approach: keep `verify_jwt: true` (default) and pass JWT normally
- The Edge Function receives the JWT in the Authorization header automatically when verify_jwt is true
- With verify_jwt true, unauthorized requests are rejected at the gateway level (before function runs)
- **Fix:** Keep `verify_jwt: true`, still call `supabase.auth.getUser(token)` inside for user context

---

## 🟢 MINOR NOTES

### NOTE-1: `generated_documents` table already complete
No migration needed — schema already has: id, visit_id, version, format, file_url, recipients[], sent_at, created_at.

### NOTE-2: Existing patterns confirmed
- Service pattern: `lib/services/visits.ts` — consistent with planned `documents.ts`
- Hook pattern: `lib/hooks/useVisits.ts` — consistent with planned `useDocuments.ts`
- Photo URL pattern: `getPhotoUrl()` in visits.ts builds public URL from path — Edge Function must replicate
- `getProjectRecipients()` already exists for report send screen

### NOTE-3: Visit `participants` field is `text[]` array
The PDF should render participant names comma-separated.

---

## ✅ REVISED PLAN DECISIONS

| Issue | Resolution |
|-------|-----------|
| GAP-A | Use `npm:pdf-lib@1.17.1` import |
| GAP-B | Build full photo URL from SUPABASE_URL + bucket + path |
| GAP-C | Make `reports` bucket PUBLIC for MVP simplicity |
| GAP-D | Keep `process.env` pattern — it works in Metro |
| GAP-E | Defer — Edge Functions use service_role |
| GAP-F | Restructure PDF to match French CR standard |
| GAP-G | Use `onboarding@resend.dev` for MVP |
| GAP-H | Create bucket via execute_sql + verify |
| GAP-I | Keep `verify_jwt: true` on both functions |

---

*Audit complete. Plans will be revised before execution.*
