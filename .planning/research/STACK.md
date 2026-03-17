# Stack Research — Raporitfy

## Recommended Stack (2025)

| Layer | Choice | Confidence | Rationale |
|---|---|---|---|
| **Framework** | React Native + Expo SDK 52+ | ⬤ High | Industry standard, file-based routing via Expo Router, OTA updates via EAS |
| **Language** | TypeScript (strict) | ⬤ High | Type safety critical for domain models |
| **Navigation** | Expo Router v4 | ⬤ High | File-based, typed params, deep linking built-in |
| **State (local)** | Zustand | ⬤ High | Lightweight, no boilerplate, works well with TypeScript |
| **State (server)** | TanStack Query v5 | ⬤ High | Caching, offline mutations, auto-retry |
| **Forms** | React Hook Form + Zod | ⬤ High | Performance-optimized, Zod for domain validation schemas |
| **Backend** | Supabase (PostgreSQL + Auth + Storage + Edge Functions) | ⬤ High | Already provisioned, replaces need for separate FastAPI backend |
| **PDF generation** | `expo-print` (HTML → PDF) | ○ Medium | Simple, native, no external libs. Alternative: server-side via Edge Function |
| **Camera** | `expo-camera` + `expo-image-picker` | ⬤ High | Native camera access + gallery picker |
| **Email** | Supabase Edge Function + Resend | ○ Medium | Resend is simple, reliable, Supabase trigger-friendly |
| **Styling** | NativeWind (Tailwind for RN) or Tamagui | ○ Medium | NativeWind familiar for web devs; Tamagui for design tokens |
| **Lists** | FlashList | ⬤ High | 5-10x faster than FlatList for long observation lists |
| **Animations** | React Native Reanimated v3 | ⬤ High | Native thread animations, smooth UX |
| **Image optimization** | expo-image (replaces RN Image) | ⬤ High | Caching, progressive loading, WebP support |

## What NOT to Use

| Avoid | Why |
|---|---|
| Separate FastAPI backend | Supabase Edge Functions + RLS can handle MVP. Adding FastAPI adds deployment complexity, a second server, and CORS issues |
| Redux / Redux Toolkit | Overkill for this app size; Zustand + TanStack Query cover all needs |
| AsyncStorage alone | Not structured enough for domain entities; use Supabase local cache via TanStack Query |
| React Navigation (standalone) | Expo Router wraps it with better DX; use Expo Router directly |
| Formik | React Hook Form is more performant and lighter |

## Key Insight: Supabase as Full Backend

Since the user already has a Supabase project, we can eliminate the separate FastAPI backend for MVP:
- **Auth** → Supabase Auth (email/password, JWT)
- **Database** → Supabase PostgreSQL with RLS
- **Storage** → Supabase Storage (photos, PDFs)
- **API** → Supabase auto-generated REST + Edge Functions for complex logic
- **Email** → Supabase Edge Function calling Resend API
- **Realtime** → Supabase Realtime for sync between field/office users

This dramatically simplifies the architecture and deployment.
