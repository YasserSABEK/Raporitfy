# Raporitfy

Application mobile de génération assistée de **comptes rendus de visite de chantier**.
Contexte métier : maîtrise d'œuvre française, traçabilité des constats, décisions et actions.

## Méthodologie de développement — Skeleton of Thought (SoT)

Chaque fonctionnalité est planifiée en **Skeleton of Thought** : d'abord le squelette (structure, contrats,
interfaces), puis le remplissage (implémentation détaillée). Jamais de code avant d'avoir le squelette validé.

```
SoT en 3 étapes :
1. Squelette  → définir les entités, interfaces, contrats et flux de données
2. Expansion  → implémenter chaque point du squelette avec le détail métier
3. Validation → vérifier que l'implémentation respecte le squelette initial
```

## Principe d'architecture — Source de Vérité Unique (SVU)

La SVU est le **modèle métier structuré en base de données**. Les documents exportés (PDF, DOCX, e-mail)
sont des **projections** générées à partir de la SVU — jamais la source canonique.

Chaîne cible : `visite → preuves → décisions → actions → diffusion`

## Architecture

- **Pattern** : Clean Architecture — Domain → Application → Infrastructure → Présentation
- **Monorepo** :

```
/apps/mobile        → application React Native (Expo)
/apps/api           → API métier FastAPI
/packages/domain    → modèle SVU, règles métier, schémas
/packages/ai        → extraction, prompts, évaluations, garde-fous
/packages/documents → templates DOCX/PDF, mappers de rendu
/packages/shared    → types partagés, utilitaires
/infra              → Docker, IaC, CI/CD
/docs/adr           → décisions d'architecture (Architecture Decision Records)
/docs/product       → taxonomie métier, parcours, critères
```

## Stack technique

| Couche | Choix |
|---|---|
| Mobile | React Native + Expo (TypeScript) |
| Backend API | FastAPI (Python, type hints obligatoires) |
| Base de données | PostgreSQL (via Supabase) |
| Stockage média | S3 compatible (photos, audio, exports) |
| Transcription | Whisper ou STT équivalent |
| OCR | Service cloud ou local selon budget |
| File de tâches | Celery / BullMQ |
| Moteur document | Templates DOCX → export PDF |
| Auth | Supabase Auth, séparation par projet |

## Modèle de domaine (entités SVU)

- **Project** — opération, site, acteurs, règles de diffusion, templates
- **Visit** — date/heure, type, participants, météo, résumé, version
- **Observation** — fait constaté, lot, zone, sévérité, pièce jointe, source, indice de confiance
- **Decision** — arbitrage validé, auteur/valideur, portée
- **ActionItem** — responsable, échéance, priorité, statut, dépendances
- **Evidence** — photo, audio, document, note, extrait OCR/transcription
- **GeneratedDocument** — rendu PDF/DOCX/e-mail lié à une version de la SVU

## Principes non négociables

1. Ne **jamais** introduire un champ métier sans mise à jour des schémas de domaine ET des migrations
2. Ne **jamais** coder un flux qui publie un CR final sans étape de **revue humaine**
3. Chaque observation sensible doit rester **traçable** vers sa preuve source
4. Chaque action doit avoir : `owner`, `statut`, `priorité`, `échéance` (nullable mais explicite)
5. Les prompts et règles IA doivent être **testables et versionnés**
6. Les documents exportés sont **immuables** après émission — toute modification crée une nouvelle version
7. La diffusion enregistre **qui a reçu quoi et à quelle date**

## Pipeline IA — 3 temps

L'IA ne doit **jamais** générer un CR final en un seul prompt.

```
1. Extraction structurée  → transcrire, classer par lot/zone, détecter entités
2. Contrôle métier         → valider cohérence, signaler contradictions, proposer actions
3. Rédaction               → générer le brouillon à partir des données validées
```

### Ce que l'IA doit faire

- Résumer, reformuler proprement, classer par lot ou zone
- Détecter les échéances mentionnées, proposer des tableaux d'actions
- Signaler les contradictions, rapprocher des éléments similaires
- Générer un brouillon de CR cohérent

### Ce que l'IA ne doit PAS faire seule

- Inventer des responsabilités
- Conclure sur une non-conformité technique sans base claire
- Modifier une décision validée
- Publier automatiquement un document sans revue

## Conventions de code

- **TypeScript strict** pour l'app mobile
- **Type hints Python** obligatoires pour toutes les fonctions API
- Préférer les **fonctions pures** dans `/packages/domain`
- Séparer clairement : extraction IA / validation métier / rendu documentaire
- Documenter toute décision d'architecture dans `/docs/adr`
- Mode **formulation sobre** par défaut : faits, écarts observés, actions attendues — pas de formulations juridiquement agressives

## Commandes

```bash
# Mobile
npm run start          # serveur de dev Expo
npm run ios            # simulateur iOS
npm run android        # émulateur Android
npm test               # tests

# Backend
cd apps/api && uvicorn main:app --reload   # serveur API
pytest                                      # tests backend

# Qualité
npm run lint           # lint
npm run typecheck      # vérification des types
```

## Sécurité et conformité

- Journal d'audit sur toutes les transformations automatiques
- Versionnement complet de la SVU et des exports
- Workflow d'approbation avant diffusion externe
- Conformité **RGPD** si personnes identifiables sur photos/audio
- Taxonomies (lots, zones, statuts, sévérités) : configurables mais maîtrisées

## Checklist de revue

- [ ] Le changement respecte-t-il la SVU ?
- [ ] Les preuves sources restent-elles liées aux observations ?
- [ ] Les actions ont-elles owner / statut / date ?
- [ ] Y a-t-il un risque d'hallucination non contrôlé ?
- [ ] Les exports sont-ils déterministes à partir de la SVU ?
- [ ] L'UI est-elle responsive sur iOS et Android ?
- [ ] Les labels d'accessibilité sont-ils présents ?
