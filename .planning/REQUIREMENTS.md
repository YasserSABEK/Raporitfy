# Requirements — Raporitfy MVP

## Requirement IDs

### AUTH — Authentification & Organisation
- **AUTH-01** : Inscription / connexion par email + mot de passe (Supabase Auth)
- **AUTH-02** : Séparation des données par organisation (RLS)
- **AUTH-03** : Deux rôles : `terrain` (saisie) et `bureau` (relecture/validation)

### PROJ — Gestion de Projets
- **PROJ-01** : Créer un projet : nom, adresse, description, phase chantier
- **PROJ-02** : Lister tous ses projets (dashboard "Mes Chantiers")
- **PROJ-03** : Configurer les destinataires e-mail du projet
- **PROJ-04** : Déléguer l'accès projet à un autre utilisateur
- **PROJ-05** : Archiver / réactiver un projet

### VISIT — Visites de Chantier
- **VISIT-01** : Créer une visite : date, type, météo, résumé, agenda
- **VISIT-02** : Ajouter/modifier les participants de la visite
- **VISIT-03** : Lister les visites d'un projet par date

### OBS — Observations
- **OBS-01** : Créer une observation : lot, zone, description, sévérité
- **OBS-02** : Prendre ou associer des photos à une observation
- **OBS-03** : Classifier les observations (constat, remarque, réserve)
- **OBS-04** : Modifier / supprimer une observation

### ACT — Actions
- **ACT-01** : Créer une action : responsable, échéance, priorité, statut
- **ACT-02** : Lier une action à une observation ou décision
- **ACT-03** : Suivre les actions ouvertes au niveau projet (tableau de bord)
- **ACT-04** : Reporter automatiquement les actions ouvertes à la visite suivante

### DEC — Décisions
- **DEC-01** : Enregistrer une décision : contenu, auteur, portée
- **DEC-02** : Valider une décision (auteur + valideur)

### DOC — Documents & Diffusion
- **DOC-01** : Générer un PDF professionnel du compte rendu
- **DOC-02** : Prévisualiser le brouillon avant diffusion
- **DOC-03** : Envoyer le CR par e-mail aux destinataires du projet
- **DOC-04** : Archiver chaque version du CR envoyé (immuable après envoi)

### VAL — Workflow de Validation
- **VAL-01** : Statut de la visite : brouillon → en revue → validé → diffusé
- **VAL-02** : Seul le rôle `bureau` peut passer de "en revue" à "validé"
- **VAL-03** : Journal d'audit : qui a validé, quand, quoi

### AI — Intelligence Artificielle (optionnel MVP)
- **AI-01** : Brouillon automatique du CR à partir des observations/décisions/actions
- **AI-02** : Pipeline 3 temps : extraction structurée → contrôle métier → rédaction
- **AI-03** : L'IA ne modifie jamais les décisions validées ni n'invente de responsabilités
