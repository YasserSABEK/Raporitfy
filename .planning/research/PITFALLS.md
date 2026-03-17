# Pitfalls Research — Raporitfy

## Critical Pitfalls

### 1. UX pour le Terrain (Phase: Foundation)
**Risque** : Interfaces trop complexes pour un usage sur chantier (gants, soleil, pluie)
**Signaux** : Boutons < 44px, polices < 16px, formulaires avec trop de champs
**Prévention** :
- Buttons minimum 48px touch targets
- Polices minimum 16px, contraste élevé
- Maximum 3-4 champs par écran
- Saisie rapide : dropdowns pré-remplis, pas de frappe longue
- Mode portrait obligatoire pour saisie terrain

### 2. Photos : Taille et Performance (Phase: Visits)
**Risque** : Photos non compressées qui ralentissent l'app et explosent le stockage
**Signaux** : Upload > 5 secondes, app qui freeze pendant l'upload
**Prévention** :
- Compresser les images côté client (80% quality JPEG, max 1920px)
- Upload en arrière-plan avec queue
- Thumbnails pour l'affichage, full-res en téléchargement
- Limiter à 10-15 photos par observation

### 3. PDF Non Optimisé Mobile (Phase: Documents)
**Risque** : PDF illisible sur smartphone, mise en page cassée entre iOS et Android
**Signaux** : Texte tronqué, images absentes, scroll horizontal
**Prévention** :
- Générer le PDF côté serveur (Edge Function), pas côté client
- Template HTML simple et responsive
- Tester le PDF sur iPhone SE (plus petit écran) et tablette
- Images en base64 dans le HTML avant conversion

### 4. E-mail avec Pièce Jointe (Phase: Documents)
**Risque** : PDF non reçu, bloqué par filtres spam, trop volumineux
**Signaux** : E-mails qui arrivent sans PJ, ou pas du tout
**Prévention** :
- Limiter la taille du PDF (compresser images, max 10MB)
- Utiliser un service e-mail professionnel (Resend), pas SMTP brut
- Inclure un lien de téléchargement en plus de la PJ
- Configurer SPF/DKIM sur le domaine d'envoi

### 5. Absence de Versionnement (Phase: Validation)
**Risque** : Modifications du CR après diffusion sans trace
**Signaux** : Pas de `version` sur les GeneratedDocument
**Prévention** :
- Chaque export crée un enregistrement immuable (GeneratedDocument)
- Numéro de version affiché sur le PDF
- Log de qui a validé et quand

### 6. Droits d'Accès Multi-Projet (Phase: Projects)
**Risque** : Un utilisateur accède aux données d'un projet qui ne lui appartient pas
**Signaux** : Pas de RLS configuré, toutes les données visibles
**Prévention** :
- RLS Supabase obligatoire sur toutes les tables
- Table `project_members` pour le contrôle d'accès
- Tester avec 2 comptes sur 2 projets différents

### 7. Mélange Fait / Interprétation / Décision (Phase: Visits)
**Risque** : L'IA ou l'utilisateur mélange les niveaux dans le CR
**Signaux** : Observations qui contiennent des décisions, décisions sans auteur
**Prévention** :
- Séparer clairement les 3 entités dans le modèle de données
- UI avec sections distinctes : Observations | Décisions | Actions
- L'IA ne peut PAS générer de décisions, seulement des observations et suggestions d'actions

### 8. Résistance au Changement (Phase: Toutes)
**Risque** : Les utilisateurs refusent d'abandonner Word/Excel
**Signaux** : Feedback type « c'était plus simple avant »
**Prévention** :
- Parcours MVP ultra-simple : 5 clics pour créer une visite et prendre une photo
- Template PDF qui ressemble au format Word habituel
- Permettre l'export DOCX en plus du PDF (post-MVP)
