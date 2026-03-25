# Phase 04: Decisions & Actions — Context

**Gathered:** 25 mars 2026
**Status:** Ready for planning
**Approach:** Expert validation — decisions made from domain research on French CR de chantier standards

<domain>
## Phase Boundary

Permettre à l'utilisateur de **consigner les décisions prises en réunion** et d'**assigner des actions suivies** avec responsable, échéance et priorité. Les actions ouvertes doivent se reporter automatiquement d'une visite à l'autre.

**Ce que cette phase livre :**
- Formulaire de décision (contenu, auteur, portée, validation)
- Formulaire d'action (responsable, échéance, priorité, statut)
- Liaison action ↔ observation ou décision
- Tableau de bord des actions (tab "Actions" déjà en placeholder)
- Report automatique (carry-forward) des actions ouvertes

**Ce que cette phase NE livre PAS :**
- PDF/export (Phase 05)
- Workflow de validation brouillon → validé (Phase 06)
- Rôles terrain/bureau différenciés (Phase 06)
</domain>

<decisions>
## Implementation Decisions

### 1. Layout du visit detail — Sections empilées (pas de tabs)

**Décision :** La page visite affiche 3 sections empilées verticalement dans l'ordre métier :
1. **Observations** (existant)
2. **Décisions** (nouveau)
3. **Actions** (nouveau)

**Justification métier :** Dans un CR de chantier français, le corps du rapport suit strictement l'ordre : constats → décisions → actions. Ce n'est pas un choix UX arbitraire — c'est la structure que tous les maîtres d'œuvre connaissent. Les onglets (tabs) casseraient le flux de lecture naturel du CR.

**Chaque section :** Titre avec compteur (ex: "Décisions (3)"), liste de cartes, bouton "+" pour ajouter. Même pattern que les observations actuelles.

---

### 2. Formulaire de décision — Inline léger

**Champs :**
- **Contenu** — TextInput multiline (obligatoire, min 10 chars)
- **Auteur** — Picker parmi les participants de la visite (obligatoire)
- **Portée** — Chips : `Lot spécifique` | `Chantier global` | `Contractuel`
- **Validée** — Toggle (par défaut non validée au MVP)

**Pas de validateur séparé au MVP.** La validation formelle (auteur ≠ valideur, rôle bureau requis) est le domaine de la Phase 06. Au MVP, un simple toggle "Validée" suffit.

**Exemple réel :** "Changement du carrelage de la salle de bain — remplacement par grès cérame 60x60 suite à rupture de stock fournisseur"

---

### 3. Formulaire d'action — Complet mais rapide

**Champs :**
- **Description** — TextInput multiline (obligatoire, min 5 chars)
- **Responsable** — TextInput libre (nom de l'entreprise ou de la personne, ex: "SARL Martin - Plomberie")
- **Échéance** — DatePicker (obligatoire)
- **Priorité** — 3-button selector : Basse (gris) | Moyenne (amber) | Haute (rouge)
- **Statut** — Segment : Ouverte | En cours | Fermée | Reportée
- **Source** — Liaison optionnelle à une observation ou décision existante

**Pourquoi TextInput libre pour le responsable :** Les responsables d'actions sur un chantier sont principalement des entreprises sous-traitantes (plombier, électricien, maçon...) qui ne sont PAS des utilisateurs de l'app. Un picker lié aux users serait trop restrictif. Le champ libre permet : "Ent. Durand", "M. Lefèvre (MOA)", "BET Structure".

---

### 4. Liaison action ↔ observation/décision

**Implémentation :** L'action peut être liée à UNE observation OU UNE décision via les FK existantes dans `domain.ts` (`observation_id`, `decision_id`).

**UX de création contextuelle :**
- Depuis une carte observation → long-press → "Créer une action" → formulaire pré-lié
- Depuis une carte décision → long-press → "Créer une action" → formulaire pré-lié
- Depuis le bouton "+" → formulaire vierge (pas de liaison)

**Affichage :** Sur la carte action, si liée, afficher un chip cliquable "↗ Observation" ou "↗ Décision" qui scrolle vers la source.

---

### 5. Carry-forward — Référence, pas copie

**Décision :** Les actions ouvertes (statut ≠ `fermee`) s'affichent automatiquement dans la prochaine visite du même projet, mais comme **référence** (non dupliquée en DB).

**Mécanisme :** Query Supabase qui récupère les actions ouvertes de TOUTES les visites précédentes du projet. Section séparée "Actions reportées (N)" dans le visit detail, avec badge d'âge ("depuis 2 visites").

**Pourquoi pas copie :** Dans la pratique du CR chantier, une action reportée reste rattachée à la visite d'origine pour la traçabilité. On ne crée pas de duplicata — on référence. L'entreprise responsable doit pouvoir tracer quand l'action a été émise originellement.

**Mise à jour de statut :** Le maître d'œuvre peut changer le statut d'une action reportée directement depuis n'importe quelle visite. Le changement s'applique à l'action originale.

---

### 6. Tableau de bord Actions (tab existant)

**Le tab "Actions" (`app/(tabs)/actions/index.tsx`)** affiche toutes les actions ouvertes, tous projets confondus.

**Layout :**
- **Filtre par projet** — Horizontal chips en haut (tous | projet A | projet B)
- **Filtre par statut** — Segment : Ouvertes | En cours | Toutes
- **Tri par défaut** — Échéance croissante (les plus urgentes en premier)
- **Carte action :** Nom du projet (petit), description (2 lignes), responsable, échéance avec couleur (rouge si dépassée, amber si < 3 jours, vert sinon), badge priorité

**Indicateur de retard :** Les actions dont l'échéance est passée sont visuellement marquées en rouge avec un badge "En retard".

### Claude's Discretion

- Style exact des cartes (taille, espacement, ombres) — suivre le pattern des observation cards existantes
- Animations de transition entre sections
- Ordre de tri dans les listes de décisions (chronologique suffit)
- Messages des empty states
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Domain Types
- `lib/types/domain.ts` — Définit `Decision`, `ActionItem`, `ActionStatus`, `ActionPriority` (déjà en place)

### Existing Patterns (à reproduire)
- `lib/services/visits.ts` — Pattern CRUD services (getAll, getOne, create, update, delete)
- `lib/hooks/useVisits.ts` — Pattern React Query hooks avec cache invalidation
- `app/(tabs)/projects/[id]/visits/[visitId]/index.tsx` — Visit detail screen, intégration des nouvelles sections ici
- `app/(tabs)/projects/[id]/visits/[visitId]/observation.tsx` — Pattern formulaire avec reset effect + timestamp param

### Integration Points
- `app/(tabs)/actions/index.tsx` — Tab placeholder à remplacer par le vrai dashboard
- `app/(tabs)/_layout.tsx` — Routes à ajouter (formulaire décision, formulaire action)
- `lib/validation/schemas.ts` — Ajouter `decisionSchema` et `actionSchema`

### Requirements
- `.planning/REQUIREMENTS.md` — ACT-01, ACT-02, ACT-03, ACT-04, DEC-01, DEC-02
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`domain.ts` types** — `Decision` et `ActionItem` déjà définis avec tous les champs nécessaires
- **`visits.ts` services** — Pattern CRUD à dupliquer pour decisions.ts et actions.ts
- **`useVisits.ts` hooks** — Pattern React Query à dupliquer pour useDecisions.ts et useActions.ts
- **Observation cards** — Le rendu de cartes avec severity color border est réutilisable pour les cartes action (priority color au lieu de severity)
- **Photo carousel** — Non nécessaire pour cette phase
- **theme.ts** — Couleurs, spacing, typography déjà en place

### Established Patterns
- **Services** : `lib/services/{entity}.ts` — fonctions pures avec supabase client
- **Hooks** : `lib/hooks/use{Entity}.ts` — React Query wrappers
- **Formulaires** : Écran dédié avec timestamp reset, même pattern `?t=${Date.now()}`
- **Cache invalidation** : `queryClient.invalidateQueries({ queryKey: [...] })`

### Integration Points
- **Visit detail** : Le `ListHeaderComponent` du FlatList actuel montre uniquement la section Observations. Il faut restructurer pour ajouter Décisions et Actions comme sections supplémentaires — possiblement passer à un SectionList ou garder le FlatList avec un header enrichi
- **Tab Actions** : Remplacer le placeholder empty state par le vrai dashboard
- **Tab layout** : Ajouter `href: null` pour les nouvelles routes de formulaires
</code_context>

<gaps>
## ⚠️ Gaps Identified (Architect Audit)

### GAP-A : Type `Decision.author_id` trop restrictif
**Problème :** `domain.ts` définit `author_id: string` comme FK vers `auth.users`. Mais l'auteur d'une décision n'est pas toujours un utilisateur de l'app — c'est souvent le maître d'ouvrage, un bureau d'études, ou un sous-traitant qui était présent à la réunion.

**Recommandation :** Changer en `author: string` (texte libre, nom de la personne) au lieu de `author_id: uuid`. Garder `created_by: uuid` pour savoir qui a SAISI la décision.

### GAP-B : Pas de champ `updated_at` sur `Decision`
**Problème :** Le type `Decision` dans `domain.ts` n'a pas de `updated_at` alors que tous les autres types (Visit, Observation, Evidence) en ont un. Incohérence qui empêchera le trigger auto-update.

**Recommandation :** Ajouter `updated_at: string` au type et à la table.

### GAP-C : `ActionItem.owner` est texte libre — OK
**Validation :** L'owner en texte libre est la bonne approche (voir décision §3). Pas de gap ici.

### GAP-D : Pas de source/origin tracking sur les actions reportées
**Problème :** Pour le carry-forward, il faut pouvoir afficher "Action créée lors de la visite du 15/03" et distinguer les actions de la visite courante vs reportées. La FK `visit_id` suffit pour cela — pas de champ supplémentaire nécessaire.

**Validation :** Le modèle actuel est suffisant. La query filtre par `project_id` (via join visits) et `status != 'fermee'`.

### GAP-E : Le type `Decision` a un champ `validated: boolean` mais pas de `validated_at` ni de `validated_by`
**Problème :** Pour la traçabilité juridique du CR (qui valide, quand), il manque ces champs. Même si Phase 06 implémente le workflow complet, il faut poser la colonne maintenant.

**Recommandation :** Ajouter `validated_at: timestamptz` et `validated_by: uuid` (nullable) à la table decisions.

### GAP-F : Manque un champ `description` sur Decision
**Problème :** Le type `Decision` a `content` mais dans le ROADMAP on parle de "contenu, auteur, portée, validation". Il serait plus clair de nommer le champ `content` ce qui est déjà le cas — pas de gap.

**Validation :** OK, `content` est le bon nom.
</gaps>

<specifics>
## Specific Ideas

### Référence métier — Structure d'un CR type
Un CR de visite français suit cette structure canonique :
1. En-tête (projet, date, participants, météo) ✅ déjà en place
2. Observations par lot/zone ✅ Phase 03
3. **Décisions prises** ← Phase 04
4. **Actions à mener** (avec responsable + échéance) ← Phase 04
5. Date prochaine réunion (hors scope MVP)

### Couleurs de priorité actions (calquées sur les severity colors existantes)
- Basse : `#6B7280` (gris)
- Moyenne : `#F59E0B` (amber — même que "majeur")
- Haute : `#EF4444` (rouge — même que "critique")
- Urgente : `#DC2626` (rouge foncé) — si on l'ajoute

### Badge retard
- Vert : échéance > 3 jours
- Amber : échéance ≤ 3 jours
- Rouge : échéance dépassée, avec texte "En retard — J+N"
</specifics>

<deferred>
## Deferred Ideas

- **Notifications push** quand une action approche de son échéance — future phase
- **Export CSV** des actions ouvertes — pourrait aller dans Phase 05 (PDF & Email)
- **Historique des changements de statut** d'une action — Phase 06 (audit log)
- **Date de prochaine réunion** dans le visit header — feature mineure, peut être ajoutée ultérieurement
- **Commentaires/notes sur une action** (ex: "Relancé le 20/03") — future phase
</deferred>

---

*Phase: 04-decisions-actions*
*Context gathered: 25 mars 2026*
*Approach: Expert validation from French CR de chantier domain research*
