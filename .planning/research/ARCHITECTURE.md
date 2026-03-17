# Architecture Research — Raporitfy

## System Architecture

```
┌─────────────────────────────────────────────┐
│              Mobile App (Expo)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │  Screens │ │  Domain  │ │  Services    │ │
│  │  (UI)    │ │  Models  │ │  (API/Store) │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
└──────────────────┬──────────────────────────┘
                   │ Supabase JS Client
┌──────────────────▼──────────────────────────┐
│              Supabase Platform              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │   Auth   │ │ Storage  │ │ Edge Funcs   │ │
│  │   (JWT)  │ │ (Photos) │ │ (PDF/Email)  │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
│  ┌──────────────────────────────────────┐   │
│  │        PostgreSQL (SVU)              │   │
│  │  Projects → Visits → Observations   │   │
│  │  Decisions → Actions → Evidence     │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Component Boundaries

| Component | Responsibility | Talks To |
|---|---|---|
| **Screens** | UI rendering, user input | Domain Models, Services |
| **Domain Models** | Business entities, validation rules | TypeScript types only |
| **Services** | Data operations (CRUD via Supabase) | Supabase client |
| **Supabase Auth** | Authentication, JWT tokens | Mobile App |
| **Supabase Storage** | Photo upload/download | Mobile App, Edge Functions |
| **Edge Functions** | PDF generation, email sending, AI pipeline | Storage, Database, Resend |
| **PostgreSQL** | SVU — Source de Vérité Unique | Edge Functions, Mobile App (via RLS) |

## Data Flow

```
Field User (terrain)                   Office User (bureau)
     │                                      │
     ▼                                      ▼
  Saisir visite                    Relire brouillon CR
  Prendre photos ──────┐          Corriger / Valider
  Noter observations   │               │
     │                 │               │
     ▼                 ▼               ▼
  Supabase DB     Supabase Storage   Supabase DB
  (observations)  (photos)           (status: validé)
     │                                   │
     ▼                                   ▼
  Edge Function: Générer PDF ◄──── Trigger on validation
     │
     ▼
  Edge Function: Envoyer e-mail
     │
     ▼
  Destinataires (liste projet)
```

## Mobile App Structure (Expo Router)

```
app/
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/
│   ├── _layout.tsx
│   ├── projects/
│   │   ├── index.tsx          ← Dashboard "Mes Chantiers"
│   │   ├── [id]/
│   │   │   ├── index.tsx      ← Project detail & visits list
│   │   │   ├── visit/
│   │   │   │   ├── [visitId].tsx  ← Visit detail
│   │   │   │   └── new.tsx        ← Create visit
│   │   │   └── settings.tsx   ← Project settings & recipients
│   │   └── new.tsx            ← Create project
│   └── actions/
│       └── index.tsx          ← Actions dashboard
├── _layout.tsx
└── +not-found.tsx

lib/
├── supabase.ts                ← Supabase client init
├── types/
│   ├── database.ts            ← Generated Supabase types
│   └── domain.ts              ← Domain model interfaces
├── services/
│   ├── projects.ts
│   ├── visits.ts
│   ├── observations.ts
│   └── actions.ts
├── hooks/
│   ├── useProjects.ts
│   ├── useVisits.ts
│   └── useAuth.ts
└── utils/
    ├── date.ts
    └── validation.ts

supabase/
├── functions/
│   ├── generate-pdf/index.ts
│   ├── send-report/index.ts
│   └── ai-draft/index.ts
└── migrations/
    └── *.sql
```

## Suggested Build Order

1. **Foundation** → Auth, Supabase setup, types, navigation skeleton
2. **Projects** → CRUD projets, settings, recipients list
3. **Visits** → Créer visite, participants, observations, photos
4. **Actions** → Attribution, suivi, dashboard
5. **Documents** → PDF generation, e-mail diffusion
6. **Validation** → Workflow terrain → bureau → diffusion
7. **AI** → Brouillon automatique (optionnel MVP)
