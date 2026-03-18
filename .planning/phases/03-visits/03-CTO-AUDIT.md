# Phase 03 — CTO Audit (30-Year Review)

**Reviewer:** CTO Lens
**Date:** 18 mars 2026
**Verdict:** ⚠️ **NOT READY — 7 gaps to close before execution**

---

## ✅ What the Plan Gets Right

- Follows Phase 02 service/hook pattern (proven, tested)
- Uses `expo-image-picker` not `expo-camera` (Expo Go compat — hard lesson learned)
- Photo compression rules from PITFALLS.md (80% JPEG, 1920px)
- RLS policies scoped to org via project_members join
- French labels, dark theme, 48px touch targets
- FlatList over FlashList (Expo Go compat — another hard lesson)

---

## 🔴 Gap 1: VISIT-02 (Participants) is MISSING

**REQUIREMENTS.md says:** `VISIT-02: Ajouter/modifier les participants de la visite`
**ROADMAP.md says:** `Users can create visits, add participants...`
**Plan says:** Nothing. Zero mention of participants.

**Impact:** A visit without participants is legally incomplete as a CR de chantier.

**Fix:** Add a `visit_participants` junction table, or a JSONB `participants` column on visits, and a participant picker on the create visit form.

**Recommendation:** JSONB array `participants text[]` on visits table. Simple comma-separated names field in the form. No complex user lookup for MVP.

---

## 🔴 Gap 2: No `updated_at` Column on ANY Table

Visits, observations, evidence — none have `updated_at`. This means:
- No way to sort by "last modified"
- No conflict detection for concurrent edits
- No audit trail for when data changed

**Fix:** Add `updated_at timestamptz DEFAULT now()` + trigger:
```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
```

---

## 🔴 Gap 3: Storage Bucket is PUBLIC

The plan sets `public: true` on the evidence-photos bucket. **Construction site photos can contain:**
- Worker faces (GDPR)
- Safety violations
- Client property layouts
- Proprietary designs

**Fix:** `public: false`. Serve photos via signed URLs (Supabase `createSignedUrl`, 1-hour expiry). This is a single-line change but affects how photos are displayed in the app.

---

## 🟡 Gap 4: No Permissions Handling for Camera/Gallery

`expo-image-picker` requires:
- `NSCameraUsageDescription` in app.json (iOS)
- `NSPhotoLibraryUsageDescription` in app.json (iOS)
- Runtime permission request before first use

**Current app.json:** No camera/photo descriptions found.

**Fix:** Add to `app.json` plugins section + add `requestPermissionsAsync()` before launching picker. Without this, the app crashes on first camera tap on iOS.

---

## 🟡 Gap 5: Photo Upload is Fragile

The plan shows `fetch(uri) → blob → upload`. Problems:
1. **No compression at pick time** — expo-image-picker supports `quality: 0.8` and `maxWidth: 1920` in `launchCameraAsync()`. This is 10x more efficient than post-processing.
2. **Sequential uploads** — 15 photos uploaded one-by-one will take 30+ seconds on LTE. Use `Promise.allSettled()` with max 3 concurrent.
3. **No retry** — if upload #8 of 15 fails, the user loses all photos.
4. **No upload progress** — user sees a spinner for 30 seconds with no feedback.

**Fix:** Compress at pick time (ImagePicker options), parallel uploads with concurrency limit, per-photo status indicator.

---

## 🟡 Gap 6: Deep Route Nesting Will Break

Route: `app/(tabs)/projects/[id]/visits/[visitId]/observation.tsx`

That's **5 levels deep inside (tabs)**. Every single file needs `href: null` in _layout.tsx. With Phase 03 adding ~4 more routes, that's 8+ hidden routes. This is:
- Hard to maintain
- Each route file is evaluated at startup (route tree building)
- Risk of the Unmatched Route crash resurfacing

**Better architecture:** Move visit/observation screens to a **separate Stack group** outside tabs:
```
app/
  (tabs)/           ← only dashboard + actions
  (visit)/          ← Stack group for visit flow
    [visitId]/
      index.tsx
      observation.tsx
```

**Recommendation for MVP:** Keep the current structure but monitor. If we hit 10+ hidden routes, refactor.

---

## 🟡 Gap 7: No Visit Edit or Delete

Plan 03-01 creates visits but cannot:
- Edit a visit (change date, weather, summary)
- Delete a visit (mistake, duplicate)

Both are basic CRUD and should be in Task 3 or 4.

**Fix:** Add edit capability to visit detail screen (pencil icon → same form in edit mode). Add delete via long-press or settings.

---

## Revised Execution Order

| Task | Content | Status |
|------|---------|--------|
| **Task 0** | Fix app.json permissions + storage bucket private | Pre-req |
| **Task 1** | DB migration (with updated_at, participants, private bucket) | Ready after fixes |
| **Task 2** | Services + hooks | Ready as-is |
| **Task 3** | Visit list + create form + **participants field** + **edit/delete** | Needs participants |
| **Task 4** | Visit detail | Ready as-is |
| **Task 5** | Observation form + camera (compress at pick, parallel upload) | Needs upload rewrite |
| **Task 6** | Enhanced visit detail + filtering | Ready as-is |

---

## Final Verdict

> The plan has the **right structure** and follows proven patterns. But it has **7 gaps** — 3 red (legal/security/data), 4 yellow (UX/architecture). None are hard to fix. With the gaps closed, this plan is **ready for execution**.

### Action Items Before Executing:
1. ✏️ Add `participants` to visits schema and create form
2. ✏️ Add `updated_at` columns + trigger to all 3 tables
3. ✏️ Change storage bucket to `public: false` + use signed URLs
4. ✏️ Add camera/photo permissions to app.json
5. ✏️ Compress at pick time, parallel upload with concurrency limit
6. ✏️ Add visit edit/delete to Task 3
7. ⚡ Monitor route nesting — refactor if hits 10+ hidden routes
