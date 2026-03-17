# Research Summary — Raporitfy

## Key Strategic Insight

**Simplify the backend.** The user already has Supabase. Instead of building a separate FastAPI backend (as the brainstorming doc suggested), we can use Supabase as the full backend: Auth, Database, Storage, Edge Functions, and Realtime. This eliminates an entire deployment layer and lets us focus on the mobile experience.

## Stack Decision

| Layer | Technology |
|---|---|
| Mobile | Expo SDK 52+ / React Native / TypeScript |
| Navigation | Expo Router v4 (file-based) |
| State | Zustand (local) + TanStack Query (server) |
| Forms | React Hook Form + Zod |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| PDF | expo-print or Supabase Edge Function (HTML → PDF) |
| Email | Supabase Edge Function + Resend |
| Styling | NativeWind or Tamagui |

## Competitive Landscape

French BTP apps (Archireport, BatiScript, Finalcad, PlanRadar) all offer basic report generation. **None** offers AI-assisted drafting with a 3-step pipeline. This is Raporitfy's key differentiator.

## Table Stakes for MVP

1. Multi-project management
2. Visit creation with context (date, participants, weather)
3. Structured observations (zone, lot, severity, photos)
4. Action assignment (owner, deadline, status)
5. Professional PDF generation
6. Email distribution to project recipients
7. Two roles: field (entry) + office (review/validate)
8. Project access delegation

## Top 3 Risks

1. **UX terrain** — construction workers need big buttons, fast flows, minimal typing
2. **Photo management** — compress, upload async, don't freeze the app
3. **PDF quality** — generate server-side, test on all devices, keep under 10MB

## Architecture

Monolithic Expo app → Supabase backend → Edge Functions for heavy lifting (PDF, email, AI)

Build order: Foundation → Projects → Visits → Actions → Documents → Validation → AI
