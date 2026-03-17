# Raporitfy

## What This Is

Raporitfy est une application mobile (Expo / React Native) de génération assistée de comptes rendus de visite de chantier, destinée aux maîtres d'œuvre, architectes et ingénieurs en France. Les utilisateurs terrain saisissent les constats, photos et décisions sur site ; les assistants en bureau relisent et valident avant diffusion par e-mail aux parties prenantes du projet.

## Core Value

**Permettre à un maître d'œuvre de produire un compte rendu de visite structuré, fiable et diffusable en quelques minutes depuis son téléphone, au lieu de plusieurs heures de rédaction manuelle.** Si tout le reste échoue, cette capacité fondamentale doit fonctionner.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(Aucun — livrer pour valider)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Création et gestion de multiples projets/chantiers
- [ ] Gestion des participants et liste de diffusion e-mail par projet
- [ ] Création de visites avec date, participants, météo, phase chantier
- [ ] Saisie d'observations structurées par zone/lot avec photos
- [ ] Attribution d'actions avec responsable, échéance, priorité, statut
- [ ] Enregistrement des décisions de réunion
- [ ] Brouillon de CR généré par IA (pipeline 3 temps : extraction → contrôle → rédaction)
- [ ] Écran de revue et validation humaine avant diffusion
- [ ] Export PDF du compte rendu finalisé
- [ ] Diffusion automatisée par e-mail aux destinataires du projet
- [ ] Suivi des actions ouvertes d'une visite à la suivante
- [ ] Deux rôles : terrain (saisie) et bureau (relecture/validation)
- [ ] Délégation d'accès projet à d'autres utilisateurs (absence, vacances)
- [ ] Authentification et séparation des données par organisation

### Out of Scope

- Dictée vocale / transcription audio — déferré post-MVP (complexité Whisper + UX terrain)
- OCR sur plans annotés — déferré post-MVP (dépendance service cloud)
- Mode offline complet avec sync — déferré post-MVP (stockage local + résolution conflits)
- Portail client / accès lecture seule — les clients reçoivent le PDF par e-mail uniquement
- Application web desktop — mobile-first uniquement pour le MVP
- Intégrations calendrier/planning — pas dans le scope initial
- Facturation / gestion financière — hors périmètre

## Context

- **Marché** : Maîtrise d'œuvre française, secteur BTP. Les utilisateurs actuels rédigent leurs CR sur Word, Excel ou une application web existante décrite comme « très lente ».
- **Douleur principale** : La rédaction manuelle prend des heures, les informations sont perdues entre les notes de terrain et le document final, et la traçabilité est faible.
- **Cadre juridique** : En France, le CR de chantier peut constituer une pièce de traçabilité en cas de litige. Le système doit distinguer fait observé, interprétation et décision validée.
- **Utilisateurs cibles** :
  - **Terrain** : Architectes, ingénieurs, conducteurs de travaux — saisie rapide sur smartphone pendant la visite
  - **Bureau** : Assistants MOE — relecture, correction, validation et envoi depuis smartphone ou tablette
- **DNA du produit** : Chaque projet a sa liste de destinataires e-mail. Le CR est diffusé par e-mail — c'est le canal unique de livraison.
- **Wireframe initial** : L'utilisateur a fourni un croquis montrant 3 écrans : dashboard projets avec carte projet et bouton +, écran visite avec date et ajout d'éléments, écran observation avec photo.

## Constraints

- **Stack mobile** : React Native + Expo (TypeScript) — mobile-first, pas de web
- **Backend** : FastAPI (Python) avec type hints — workflow asynchrone pour génération docs
- **Base de données** : PostgreSQL via Supabase (projet Supabase existant avec token)
- **Stockage** : Supabase Storage pour photos et exports PDF
- **Langue** : Interface entièrement en français
- **Architecture** : Source de Vérité Unique (SVU) — le modèle métier structuré est la source canonique, les PDF sont des projections
- **Méthodologie** : Skeleton of Thought (SoT) — squelette d'abord, expansion ensuite
- **Sécurité** : RGPD, journal d'audit, versionnement, pas de publication sans revue humaine
- **Design** : À discuter — mockups visuels à valider avant implémentation

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mobile-first Expo, pas de web | Les utilisateurs terrain sont sur smartphone | — Pending |
| E-mail comme seul canal de diffusion | DNA du produit, simplicité, pas de portail client | — Pending |
| Pas de voix/OCR au MVP | Réduit la complexité, focus sur le flux core | — Pending |
| Supabase comme backend | Projet existant avec token, auth + storage + DB intégrés | — Pending |
| Pipeline IA en 3 temps | Plus fiable qu'un prompt unique pour le CR | — Pending |
| Délégation d'accès multi-utilisateur | Continuité de service (absences, vacances) | — Pending |
| Stockage backend, pas offline au MVP | Simplification du MVP, offline ajouté plus tard | — Pending |

---
*Last updated: 17 mars 2026 after initialization*
