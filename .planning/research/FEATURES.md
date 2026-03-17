# Features Research — Raporitfy

## French BTP Competitors Analyzed

| App | Focus | Strengths | Weaknesses |
|---|---|---|---|
| **Archireport** | Architects, MOE | Fast report generation, photo annotations | Limited action tracking, no AI |
| **BatiScript** | Site monitoring | Mobile data entry, anomaly photos | Complex UI, steep learning curve |
| **Finalcad** | Safety/quality | BIM integration, compliance | Enterprise-heavy, expensive |
| **PlanRadar** | Defect tracking | Photo documentation, task assignment | Not France-specific |
| **Daxium-Air** | Collaborative forms | Customizable, HQSE-focused | Generic platform, not construction-specific |

## Table Stakes (Users Will Leave Without These)

| Feature | Priority | Notes |
|---|---|---|
| Créer/gérer des projets | P0 | Multi-chantier obligatoire |
| Créer une visite avec date, participants, météo | P0 | Contexte de base du CR |
| Saisir des observations par lot/zone | P0 | Cœur du CR |
| Prendre et associer des photos | P0 | Indispensable terrain |
| Attribuer des actions (owner, date, statut) | P0 | Suivi post-visite |
| Générer un PDF professionnel | P0 | Le livrable client |
| Envoyer le CR par e-mail | P0 | DNA du produit |
| Deux rôles (terrain + bureau) | P0 | Workflow validation |
| Suivi des actions d'une visite à l'autre | P0 | Continuité |
| Auth par organisation | P0 | Séparation des données |

## Differentiators (Competitive Advantage)

| Feature | Impact | Complexity |
|---|---|---|
| **IA : brouillon automatique du CR** | ⬤ High | Medium |
| **Pipeline 3 temps (extraction → contrôle → rédaction)** | ⬤ High | High |
| **Délégation d'accès projet** | ○ Medium | Low |
| **Historique et versionnement des CR** | ○ Medium | Medium |
| **Tableau de bord actions ouvertes** | ○ Medium | Low |
| **Templates CR personnalisés par entreprise** | ○ Medium | Medium |

## Anti-Features (Deliberately NOT Building)

| Feature | Why Not |
|---|---|
| BIM viewer | Hors scope, complexité énorme |
| Planning/Gantt | L'app est un outil de reporting, pas de planification |
| Facturation | Domaine séparé |
| Chat / messagerie | E-mail suffit pour la diffusion |
| Formulaires custom drag-and-drop | Trop complexe pour MVP |
