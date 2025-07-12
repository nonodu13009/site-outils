# Produits et Commissions - Documentation Commerciale

## Vue d'ensemble

Dans le dashboard commercial, il existe deux types de processus distincts :

### 1. Processus de vente (avec commission)
- **AN (Assurance Nouvelle)** : Vente de produits d'assurance avec commission

### 2. Processus administratifs (sans commission)
- **M+3** : Processus administratif
- **Préterme Auto** : Processus administratif  
- **Préterme Ird** : Processus administratif

---

## AN (Assurance Nouvelle) - Vente de produits

### Produits d'assurance distribués

Les commerciaux vendent les produits suivants via le processus AN :

**Localisation du tableau de produits :**
- **Fichier** : `src/components/CommercialTable.tsx`
- **Ligne** : 47-58 (const `produitsAN`)
- **Fichier de gestion des commissions** : `src/hooks/useCommercialProduitCommission.ts`
- **Page de gestion** : `src/app/dashboard/commissions/page.tsx`

- **Auto** : Assurance automobile
- **Moto** : Assurance moto
- **NOP 50€** : Nouvelle offre produit 50€
- **IRD Part** : IRD Particulier
- **IRD Pro** : IRD Professionnel
- **PJ Part** : Protection Juridique Particulier
- **PJ Pro** : Protection Juridique Professionnel
- **Santé** : Assurance santé
- **Prévoyance** : Assurance prévoyance
- **Vie PP** : Assurance vie Personne Physique
- **Vie PU** : Assurance vie Personne Unique

### Calcul des commissions

Le calcul de la commission varie selon le produit :

#### Commissions fixes (10€)
- **Auto** : 10€
- **Moto** : 10€
- **NOP 50€** : 10€

#### Commissions fixes (20€)
- **IRD Part** : 20€

#### Commissions progressives
- **IRD Pro** : 
  - 20€ si CA ≤ 999€
  - 20€ + 10€ par tranche de 1000€ supplémentaire

#### Commissions fixes (30€)
- **PJ Part** : 30€
- **PJ Pro** : 30€

#### Commissions fixes (50€)
- **Santé** : 50€
- **Prévoyance** : 50€
- **Vie PP** : 50€

#### Commission variable
- **Vie PU** : 1% du CA (calculé automatiquement)

### Exemples de calculs

- **Auto** (CA 500€) → Commission : 10€
- **IRD Pro** (CA 1500€) → Commission : 20€ + 10€ = 30€
- **Vie PU** (CA 5000€) → Commission : 50€ (1% de 5000€)

---

## Processus administratifs

### M+3
- Processus administratif sans commission
- Pas de CA ni de commission calculée

### Préterme Auto
- Processus administratif sans commission  
- Pas de CA ni de commission calculée

### Préterme Ird
- Processus administratif sans commission
- Pas de CA ni de commission calculée

---

## Règles d'affichage dans le dashboard

### Colonnes du tableau
- **CA Mensuel** : Affiché uniquement pour les AN (produits vendus)
- **Commission potentielle** : Affichée uniquement pour les AN
- **M+3, Préterme Auto, Préterme Ird** : Colonnes CA et Commission affichent "–" (tiret)

### Accès
- Seuls les utilisateurs avec le rôle `cdc_commercial` ont accès
- Boutons d'action colorés pour chaque processus
- Modal de création avec champs dynamiques selon le processus

---

## Questions à résoudre

1. **Produits AN** : Quels sont les produits d'assurance vendus ?
2. **Barème commission** : Comment se calcule la commission par produit ?
3. **Règles métier** : Y a-t-il des conditions particulières (montant minimum, type de client, etc.) ?
4. **Exemples** : Peux-tu donner des exemples concrets de calculs ?

---

## Notes techniques

- Les données sont stockées dans Firestore
- Interface premium inspirée Apple/Linear
- Animations et feedback utilisateur pour toutes les actions
- Formatage automatique des noms de clients en Title Case
- Système de notes avec modal de lecture

---

## Recommandations d'amélioration

### Problème actuel
Le tableau de produits et leurs commissions sont codés en dur dans `src/components/CommercialTable.tsx` (lignes 47-58 et 147-175). Cela pose plusieurs problèmes :
- Modification manuelle du code pour changer les commissions
- Pas de flexibilité pour ajouter/supprimer des produits
- Pas de gestion des périodes de validité des commissions
- Pas de gestion des boosts ou promotions temporaires

### Solution recommandée : Système de gestion dynamique

#### 1. Structure Firestore
Créer une collection `produits_commissions` avec les documents supportant plusieurs schémas :

**Schéma 1 : Commission fixe**
```javascript
{
  id: "auto",
  nom: "Auto",
  description: "Assurance automobile",
  type_commission: "fixe",
  commission: {
    montant: 10,
    unite: "EUR"
  },
  actif: true,
  date_creation: timestamp,
  date_modification: timestamp
}
```

**Schéma 2 : Commission variable (pourcentage)**
```javascript
{
  id: "vie_pu",
  nom: "Vie PU",
  description: "Assurance vie Personne Unique",
  type_commission: "variable",
  commission: {
    pourcentage: 1.0, // 1%
    unite: "POURCENTAGE"
  },
  actif: true,
  date_creation: timestamp,
  date_modification: timestamp
}
```

**Schéma 3 : Commission progressive (IRD Pro)**
```javascript
{
  id: "ird_pro",
  nom: "IRD Pro",
  description: "IRD Professionnel",
  type_commission: "progressive",
  commission: {
    base: 20, // Commission de base fixe
    tranche_supplementaire: 10, // Montant par tranche supplémentaire
    seuil_tranche: 1000, // Seuil pour déclencher les tranches
    seuil_debut: 999, // CA à partir duquel les tranches commencent
    unite: "EUR"
  },
  actif: true,
  date_creation: timestamp,
  date_modification: timestamp
}
```

**Calcul pour IRD Pro :**
- Si CA ≤ 999€ → Commission = 20€
- Si CA > 999€ → Commission = 20€ + (10€ × nombre de tranches de 1000€ supplémentaires)
- Exemple : CA 2500€ → 20€ + (10€ × 2) = 40€

**Schéma 4 : Commission avec boost temporaire**
```javascript
{
  id: "sante",
  nom: "Santé",
  description: "Assurance santé",
  type_commission: "fixe",
  commission: {
    montant: 50,
    unite: "EUR"
  },
  boost: {
    montant: 10, // Bonus temporaire
    periode: {
      debut: timestamp,
      fin: timestamp
    },
    actif: true
  },
  actif: true,
  date_creation: timestamp,
  date_modification: timestamp
}
```

#### 2. Interface d'administration
- **Page dédiée** : `/dashboard/produits` accessible aux administrateurs
- **CRUD complet** : Ajouter, modifier, supprimer, activer/désactiver
- **Validation** : Vérification des règles métier (pourcentages ≤ 100%, etc.)
- **Historique** : Traçabilité des modifications

#### 3. Fonctionnalités avancées
- **Périodes de validité** : Commissions avec dates de début/fin
- **Boosts temporaires** : Promotions avec périodes spécifiques
- **Règles conditionnelles** : Commissions selon le CA, type de client, etc.
- **Import/Export** : Synchronisation avec systèmes externes

#### 4. Types de commission supportés
- **Fixe** : Montant fixe en euros (ex: Auto = 10€)
- **Variable** : Pourcentage du CA (ex: Vie PU = 1%)
- **Progressive** : Base + supplément par tranche (ex: IRD Pro = 20€ + 10€ par tranche de 1000€ > 999€)
- **Avec période** : Validité limitée dans le temps
- **Avec boost** : Bonus temporaire en plus de la commission de base

#### 5. Architecture technique
- **Hook personnalisé** : `useProduitsCommissions()` pour la gestion
- **Context React** : Partage des données entre composants
- **Cache local** : Optimisation des performances
- **Validation côté client et serveur**
- **Calcul dynamique** : Fonction de calcul selon le type de commission

#### 6. Fonction de calcul des commissions
```javascript
function calculerCommission(produit, ca) {
  switch(produit.type_commission) {
    case 'fixe':
      return produit.commission.montant;
    
    case 'variable':
      return Math.round(ca * produit.commission.pourcentage / 100);
    
    case 'progressive':
      if (ca <= produit.commission.seuil_debut) {
        return produit.commission.base;
      } else {
        const tranches = Math.floor((ca - produit.commission.seuil_debut) / produit.commission.seuil_tranche);
        return produit.commission.base + (tranches * produit.commission.tranche_supplementaire);
      }
    
    default:
      return 0;
  }
}
```

#### 7. Migration progressive
1. Créer la nouvelle structure Firestore
2. Développer l'interface d'administration
3. Migrer les données existantes
4. Remplacer le code en dur par les données dynamiques
5. Tester et valider

#### 8. Avantages
- **Flexibilité** : Modifications sans déploiement
- **Traçabilité** : Historique des changements
- **Sécurité** : Contrôle d'accès granulaire
- **Évolutivité** : Ajout facile de nouveaux produits
- **Performance** : Cache et optimisation

#### 9. Priorités de développement
1. **Phase 1** : Structure Firestore + CRUD basique
2. **Phase 2** : Interface d'administration complète
3. **Phase 3** : Fonctionnalités avancées (périodes, boosts)
4. **Phase 4** : Optimisations et monitoring

---

## Structure de la modale d'ajout de produit

### Interface utilisateur
```
┌─────────────────────────────────────────────────────────┐
│ ✕ Nouveau produit                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Informations générales                                 │
│ ┌─────────────────┐ ┌─────────────────┐               │
│ │ Nom du produit  │ │ Description     │               │
│ └─────────────────┘ └─────────────────┘               │
│                                                         │
│ Type de commission                                     │
│ ○ Fixe    ○ Variable    ○ Progressive                 │
│                                                         │
│ [Champs dynamiques selon le type]                      │
│                                                         │
│ ○ Actif                                                │
│                                                         │
│ [Annuler] [Enregistrer]                                │
└─────────────────────────────────────────────────────────┘
```

### Champs dynamiques selon le type

#### Type "Fixe"
```
Commission fixe
┌─────────────────┐
│ Montant (€)     │
└─────────────────┘
```

#### Type "Variable"
```
Commission variable
┌─────────────────┐
│ Pourcentage (%) │
└─────────────────┘
```

#### Type "Progressive"
```
Commission progressive
┌─────────────────┐ ┌─────────────────┐
│ Base (€)        │ │ Supplément (€)  │
└─────────────────┘ └─────────────────┘
┌─────────────────┐ ┌─────────────────┐
│ Seuil début (€) │ │ Seuil tranche   │
└─────────────────┘ └─────────────────┘
```

### Validation
- **Nom** : Requis, unique
- **Description** : Requis
- **Type** : Requis
- **Montant/Pourcentage** : > 0
- **Pourcentage** : ≤ 100
- **Seuils** : Cohérence logique (début < tranche)

### États de la modale
- **Mode création** : Champs vides
- **Mode édition** : Pré-remplissage des champs
- **Validation en temps réel** : Feedback immédiat
- **Sauvegarde** : Toast de confirmation

### Logique technique
- **État local** : Gestion du formulaire avec React
- **Validation** : Règles métier côté client
- **Sauvegarde** : Appel Firestore avec gestion d'erreurs
- **Feedback** : Toast de confirmation/erreur

### Avantages UX/UI
- **Intuitive** : L'utilisateur voit seulement les champs pertinents
- **Robuste** : Validation complète avant sauvegarde
- **Flexible** : Facile d'ajouter de nouveaux types de commission
- **Cohérente** : Même style premium que le reste de l'application
- **Accessible** : Focus trap, navigation clavier, ARIA labels

---

## Proposition de solution : outil d'administration des combos produit/commission

### Objectif
Permettre à un administrateur de créer, modifier, désactiver ou activer dynamiquement des couples produit/commission, avec ou sans période de validité, et de les rendre disponibles dans la modale AN pour les commerciaux.

### Fonctionnalités principales
- **CRUD complet** sur les produits et leurs commissions (ajout, édition, suppression, activation/désactivation)
- **Types de commission supportés** :
  - Forfaitaire (fixe, indépendante de la prime)
  - Variable (pourcentage de la prime)
  - Progressive (forfait + supplément par tranche, ex : IRD Pro)
- **Gestion des périodes de validité** (optionnelle) : possibilité de définir une date de début et/ou de fin pour chaque commission
- **Activation/désactivation** d'un produit sans suppression
- **Historique des modifications** (optionnel, pour audit)

### Structure Firestore recommandée
```javascript
{
  id: "auto",
  nom: "Auto",
  description: "Assurance automobile",
  type_commission: "fixe" | "variable" | "progressive",
  commission: {
    montant?: number, // pour fixe
    pourcentage?: number, // pour variable
    base?: number, // pour progressive
    tranche_supplementaire?: number, // pour progressive
    seuil_tranche?: number, // pour progressive
    seuil_debut?: number, // pour progressive
    unite: "EUR" | "POURCENTAGE"
  },
  periode_validite?: {
    debut?: timestamp,
    fin?: timestamp
  },
  actif: boolean,
  date_creation: timestamp,
  date_modification: timestamp
}
```

### Interface d'administration (UX)
- **Tableau récapitulatif** de tous les produits/commissions
- **Bouton "Nouveau produit"** ouvrant une modale de création (voir structure plus haut)
- **Edition/suppression/activation** via actions sur chaque ligne
- **Filtres** : actifs/inactifs, par type de commission, par période
- **Validation en temps réel**

### Intégration côté commercial (modale AN)
- Lors de la saisie d'un AN, la liste des produits et leur logique de commission sont chargées dynamiquement depuis Firestore
- Le calcul de la commission potentielle s'adapte automatiquement au type de commission du produit sélectionné
- Si un produit est inactif ou hors période, il n'est pas proposé dans la liste

### Avantages
- **Flexibilité totale** pour l'admin, sans déploiement
- **Sécurité** : seuls les admins peuvent modifier la liste
- **Évolutivité** : nouveaux produits ou barèmes ajoutés en quelques clics
- **Expérience commerciale** : toujours à jour, pas d'erreur de barème

### Roadmap conseillée
1. Développer la structure Firestore et le hook de gestion
2. Créer la page d'administration (tableau + modale)
   - **Accès** : Ajouter un bouton "Administrateur" dans la sidebar
   - **Navigation** : Ce bouton ouvre une page dédiée avec l'outil de gestion et le tableau récapitulatif des produits/commissions
3. Adapter la modale AN pour charger dynamiquement les produits/commissions
4. Tester et valider avec des cas réels

---

**Cette solution garantit une gestion moderne, flexible et sécurisée des produits et commissions, parfaitement intégrée à l'expérience commerciale.**

### Roadmap opérationnelle et détaillée

#### 1. Préparation Firestore
- [ ] **Créer la collection `produits_commissions`** dans Firestore
    - Structure conforme aux schémas proposés (voir plus haut)
    - Stocker les dates en `timestamp`
- [ ] **Définir les règles de sécurité Firestore**
    - Seuls les utilisateurs avec le rôle `administrateur` peuvent créer, modifier, activer/désactiver ou supprimer
    - Les commerciaux peuvent uniquement lire les produits actifs et valides
    - Exemple de règle :
    ```
    match /produits_commissions/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role == 'administrateur';
    }
    ```

#### 2. Développement du hook de gestion
- [ ] Créer un hook React `useProduitsCommissions()`
    - Fonctions : fetch, add, update, disable, delete
    - Gestion des erreurs et du loading
    - Utilisation de cache local pour la performance

#### 3. Interface d’administration
- [ ] **Ajouter un bouton "Administrateur" dans la sidebar**
    - Visible uniquement pour les administrateurs
- [ ] **Créer la page `/dashboard/produits`**
    - Tableau récapitulatif des produits/commissions
    - Bouton "Nouveau produit" (ouvre la modale)
    - Actions sur chaque ligne : éditer, activer/désactiver, supprimer
    - Filtres (actif/inactif, type, période)
    - Feedback utilisateur (toasts, loaders)
    - Accessibilité (focus trap, navigation clavier, ARIA)

#### 4. Modale de gestion produit/commission
- [ ] **Créer un composant modale réutilisable**
    - Champs dynamiques selon le type de commission
    - Validation en temps réel (nom unique, valeurs cohérentes, pourcentage ≤ 100, etc.)
    - Gestion des périodes de validité (optionnelles)
    - Mode création/édition
    - Feedback immédiat

#### 5. Intégration côté commercial (modale AN)
- [ ] **Charger dynamiquement la liste des produits actifs et valides**
    - Filtrer selon la période et le statut
- [ ] **Calculer la commission potentielle côté client**
    - Utiliser une fonction générique selon le type de commission
    - Afficher le détail du calcul si besoin

#### 6. Sécurité et tests
- [ ] **Vérifier l’accès à la page d’administration** (client + Firestore)
- [ ] **Tester tous les scénarios métier** (produit inactif, hors période, commission progressive, etc.)
- [ ] **Écrire des tests unitaires pour la fonction de calcul de commission**
- [ ] **Documenter la structure Firestore, les hooks, et la logique de calcul**

#### 7. Validation et déploiement
- [ ] **Recette fonctionnelle avec des cas réels**
- [ ] **Déploiement sur Vercel**
- [ ] **Vérification des droits et de la sécurité**
- [ ] **Formation rapide des administrateurs si besoin**

---

**Cette roadmap détaillée sert de checklist pour suivre l’avancement du projet, garantir la sécurité, la qualité UX, et la maintenabilité de l’outil.**
