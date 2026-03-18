# Phase 01 — Post-Mortem: Routing & Expo Go Compatibility

## Status: ✅ RESOLVED (2026-03-18)

---

## Root Causes Found (3 separate issues)

### 1. `expo-secure-store` Native Module Crash
**Symptom:** "Unmatched Route" on app boot
**Root Cause:** `expo-secure-store` calls `ExpoSecureStore.default.getValueWithKeyAsync` which doesn't exist in the Expo Go SDK 55 binary. This crash happens during **module evaluation** — any route file that imports from the `supabase.ts → expo-secure-store` chain fails to register as a route.

**Fix:** Replaced SecureStore with pure in-memory storage adapter in `lib/supabase.ts`. Zero native module dependencies.

**Rule:** ⚠️ **NEVER import native modules (SecureStore, Camera, etc.) in route files that must load on boot.** Use lazy `require()` or in-memory fallbacks.

### 2. `app/index.tsx` Cannot Import from `@/lib/`
**Symptom:** Login screen shows when index.tsx has zero imports, but "Unmatched Route" when it imports `useAuth`
**Root Cause:** `index.tsx` is the FIRST route evaluated by Expo Router. If its import chain includes ANY module that crashes during evaluation (even indirectly via `useAuth → supabase.ts`), the route fails silently — no error in terminal, just "Unmatched Route".

**Fix:** `app/index.tsx` is permanently a zero-import redirect: `<Redirect href="/(auth)/login" />`

**Rule:** ⚠️ **`app/index.tsx` must have ZERO imports from `@/lib/`. Only import from `expo-router` and `react-native`.**

### 3. Route Groups Are Not Directly Navigable
**Symptom:** Login succeeds but `router.replace('/(tabs)')` shows "Unmatched Route"
**Root Cause:** `/(tabs)` is a route GROUP, not a screen. Expo Router requires navigation to a specific SCREEN within the group.

**Fix:** Changed to `router.replace('/(tabs)/projects')` — navigates to the first tab screen.

**Rule:** ⚠️ **Always navigate to a specific screen, never to a route group. Use `/(tabs)/projects` not `/(tabs)`.**

---

## Architecture Rules (MUST follow for all future phases)

### Routing
```
app/
├── _layout.tsx       → ALWAYS renders Stack, NEVER conditional Views
├── index.tsx         → ZERO lib imports, just <Redirect>
├── +native-intent.tsx → Deep link interceptor (defense in depth)
├── (auth)/
│   ├── _layout.tsx   → Stack with no auth logic
│   ├── login.tsx     → Handles post-login navigation
│   └── register.tsx  → Handles post-register navigation
└── (tabs)/
    ├── _layout.tsx   → Tabs component
    ├── projects/     → Tab screens (safe lib imports)
    └── actions/      → Tab screens (safe lib imports)
```

### Auth Flow
1. App opens → `index.tsx` → redirects to `/(auth)/login`
2. User logs in → `login.tsx` calls `signIn()` → on success → `router.replace('/(tabs)/projects')`
3. User registers → `register.tsx` calls `signUp()` → on success → `router.replace('/(tabs)/projects')`
4. No auth guard in `_layout.tsx` — navigation is explicit

### Storage
- **Dev (Expo Go):** In-memory storage adapter (sessions don't persist across reloads)
- **Prod (standalone):** TODO: Add SecureStore back with lazy loading + try/catch

### Dependencies to Keep Aligned
```
expo: ~55.0.7
expo-router: ~55.0.6
Expo Go on simulator: 55.0.27
```
Run `npx expo install --fix` after any dependency changes.

---

## Verification Checklist
- [x] `npx tsc --noEmit` → 0 errors
- [x] App boots to login screen (no Unmatched Route)
- [x] Login with `sabekyasser@gmail.com` / `123456` → navigates to Mes Chantiers
- [x] Tab bar shows "Chantiers" and "Actions" tabs
- [x] Empty state with FAB button visible
