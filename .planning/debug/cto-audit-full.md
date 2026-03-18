# 🔍 Full CTO Audit — Raporitfy

**Date:** 2026-03-18 04:10  
**Scope:** Every source file, Supabase backend, data integrity, cache behavior

---

## ✅ Database Integrity: CLEAN

| Check | Result |
|-------|--------|
| Orphaned observations (no parent visit) | **0** |
| Orphaned evidence (no parent observation) | **0** |
| Orphaned visits (no parent project) | **0** |
| Cross-project data leaks | **None** |
| FK relationships | **All correct** |

### Current Data Map
```
Project: tagter (bac3b856)
  └─ Visit: levee_reserves (e0c9ded1)
       └─ Obs: "That<s cool" (de905e55) → 2 evidence photos ✓

Project: Tabouret (cb8c044a)
  ├─ Visit: reception (4341c6f0)
  │    ├─ Obs: "Ok ok" (cb9d7996) → 2 evidence photos ✓
  │    └─ Obs: "This leaf..." (95e85c08) → 1 evidence photo ✓
  └─ Visit: chantier (d9d7d5a7)
       ├─ Obs: "Ok ok" (33020125) → 0 evidence ✓
       └─ Obs: "That<s cool" (86bf1a08) → 0 evidence ✓
```

> **The data is correct.** Photos are NOT mixing between projects in the database. The "mixing" the user sees is a **frontend cache/navigation** issue.

---

## 🐛 Bugs Found (6 total)

### BUG #1: React Query Cache Shows Stale Data Across Visits (CRITICAL)
**File:** [useVisits.ts](file:///Users/yassersabek/Downloads/Raporitfy/lib/hooks/useVisits.ts)  
**Lines:** 88, 98

**Problem:** `useUpdateObservation` and `useDeleteObservation` invalidate `queryKey: ['observations']` — this is a **wildcard** that invalidates ALL observation queries for ALL visits. When you navigate between visits, React Query may serve cached data from a different visit's observation list before the refetch completes.

**Root cause:** The invalidation keys are too broad. They should invalidate the specific visit's observations, not all observations globally.

```diff
// useUpdateObservation — Line 87-89
 onSuccess: (_data, variables) => {
-  queryClient.invalidateQueries({ queryKey: ['observations'] });
+  queryClient.invalidateQueries({ queryKey: ['visits'] });
+  queryClient.invalidateQueries({ queryKey: ['observations', variables.id] });
 },

// useDeleteObservation — Line 97-99  
 onSuccess: () => {
-  queryClient.invalidateQueries({ queryKey: ['observations'] });
+  queryClient.invalidateQueries({ queryKey: ['visits'] });
 },

// useAddEvidence — Line 117-119
 onSuccess: (_data, variables) => {
   queryClient.invalidateQueries({ queryKey: ['observations', variables.observation_id, 'evidence'] });
-  queryClient.invalidateQueries({ queryKey: ['observations'] });
+  queryClient.invalidateQueries({ queryKey: ['visits'] });
 },

// useRemoveEvidence — Line 128-130
 onSuccess: () => {
-  queryClient.invalidateQueries({ queryKey: ['observations'] });
+  queryClient.invalidateQueries({ queryKey: ['visits'] });
 },
```

---

### BUG #2: Observation Form Reuses Stale State (CRITICAL)
**File:** [observation.tsx](file:///Users/yassersabek/Downloads/Raporitfy/app/(tabs)/projects/[id]/visits/[visitId]/observation.tsx)  
**Lines:** 34-59

**Problem:** Expo Router may reuse the component instance when navigating to the same route path. The `observationId` search param persists across navigations because `useLocalSearchParams` doesn't guarantee a fresh instance.

**Fix:** The reset effect (lines 61-74) was added but it depends on `isEditMode` changing — if Expo Router reuses the same component, `isEditMode` stays `false` and the effect doesn't re-run to clear fields.

**Better fix:** Use a `key` prop on the route or force remount:
```diff
// In visit detail index.tsx, FAB navigation — Line 319
- onPress={() => router.push(`/(tabs)/projects/${projectId}/visits/${visitId}/observation` as any)}
+ onPress={() => router.push(`/(tabs)/projects/${projectId}/visits/${visitId}/observation?t=${Date.now()}` as any)}
```

This forces a fresh `useLocalSearchParams` result each time, which makes `isEditMode` evaluate correctly.

---

### BUG #3: Dead Styles (MINOR)
**File:** [index.tsx](file:///Users/yassersabek/Downloads/Raporitfy/app/(tabs)/projects/[id]/visits/[visitId]/index.tsx)  
**Lines:** 413-425

**Problem:** `obsCardRow`, `obsCardContent`, and `obsThumb` styles still exist but are no longer used (replaced by PhotoCarousel layout). They add confusion and dead code.

**Fix:** Remove `obsCardRow`, `obsThumb` styles. Keep `obsCardContent` (still used).

---

### BUG #4: obsCard Style Has padding That Pushes Photo Inside Card (VISUAL)
**File:** [index.tsx](file:///Users/yassersabek/Downloads/Raporitfy/app/(tabs)/projects/[id]/visits/[visitId]/observation.tsx)  
**Lines:** 406-412

**Problem:** The `obsCard` style has `padding: spacing.md` which creates a gap between the card border and the photo. The photo should be edge-to-edge at the top.

**Fix:**
```diff
 obsCard: {
   backgroundColor: colors.surfaceElevated,
   borderRadius: borderRadius.md,
-  padding: spacing.md,
+  overflow: 'hidden',  // clip photo to rounded corners
   borderWidth: 1,
   borderColor: colors.border,
 },
 obsCardContent: {
-  flex: 1,
+  padding: spacing.md,
 },
```

---

### BUG #5: useDeleteVisit Invalidation Too Broad (MINOR)
**File:** [useVisits.ts](file:///Users/yassersabek/Downloads/Raporitfy/lib/hooks/useVisits.ts)  
**Lines:** 48-50

**Problem:** `useDeleteVisit` invalidates `queryKey: ['projects']` but doesn't know which project to invalidate specifically. This triggers refetches for ALL projects, which is wasteful but not broken.

**Fix:** Pass the return data or use `onMutate` to capture the project ID for targeted invalidation. Low priority.

---

### BUG #6: Storage Bucket is Public (SECURITY — LOW PRIORITY for MVP)
**Supabase:** `evidence-photos` bucket

**Problem:** Bucket was changed to public to fix signed URL issues. Construction site photos are accessible without auth. Acceptable for MVP but should be reverted for production.

**Fix (later):** Revert to private bucket, use signed URLs with proper `expo-file-system/legacy` loading.

---

## 📋 Step-by-Step Fix Plan

### Step 1: Fix Cache Invalidation (BUG #1) — 5 min
Update all `onSuccess` handlers in `useVisits.ts` to use specific query keys instead of wildcard `['observations']`.

### Step 2: Fix Card Layout (BUG #4) — 2 min
Remove padding from `obsCard`, add `overflow: 'hidden'`, move padding to `obsCardContent`.

### Step 3: Fix Form Navigation (BUG #2) — 2 min
Add timestamp param to FAB navigation to force fresh component state.

### Step 4: Clean Dead Styles (BUG #3) — 1 min
Remove unused `obsCardRow` and `obsThumb` styles.

### Step 5: Verify — 5 min
TSC check, test create/edit/browse across different visits and projects.

---

## Summary

> **The database is clean. The bugs are all frontend:**
> 1. React Query cache key invalidation is too broad → shows stale data across visits
> 2. Expo Router component reuse → form pre-fills with old data
> 3. Card styling → photo has padding gap
> 4. Dead styles → confusing leftover code
