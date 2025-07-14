# Organisation de la gestion des utilisateurs

## 1. Principe général

- **Chaque utilisateur authentifié (Firebase Auth)** doit avoir une fiche correspondante dans la collection Firestore `users`.
- **La correspondance** se fait automatiquement via l’`uid` Firebase (clé unique).
- **La fiche Firestore** permet d’enrichir le profil avec des informations RH, métier ou administratives non gérées par Firebase Auth.

---

## 2. Schéma de données proposé pour la collection `users`

| Champ                | Type         | Description                                                                 |
|----------------------|--------------|-----------------------------------------------------------------------------|
| `uid`                | string       | Identifiant unique Firebase (clé de correspondance)                         |
| `email`              | string       | Email professionnel (issu de l’auth)                                        |
| `displayName`        | string       | Nom complet (issu de l’auth ou personnalisé)                                |
| `role`               | string       | Rôle dans l’agence (ex : agent, admin, commercial, gestion, etc.)           |
| `photoURL`           | string       | URL de la photo de profil (optionnel, issu de l’auth ou personnalisé)       |
| `dateEntree`         | date         | Date d’entrée dans l’entreprise                                             |
| `dateNaissance`      | date         | Date de naissance                                                           |
| `poste`              | string       | Poste ou fonction (ex : Conseiller, Gestionnaire, etc.)                     |
| `telephone`          | string       | Numéro de téléphone professionnel                                           |
| `agence`             | string       | Nom ou code de l’agence                                                     |
| `statut`             | string       | Actif / Inactif / Suspendu / En congé, etc.                                 |
| `notes`              | string       | Remarques RH ou administratives                                             |
| `createdAt`          | timestamp    | Date de création de la fiche                                                |
| `updatedAt`          | timestamp    | Dernière mise à jour                                                        |

---

## 3. Workflow de synchronisation

1. **À la première connexion d’un utilisateur via Auth** :
   - Création automatique d’un document `users/{uid}` si inexistant, avec les infos de base issues de Firebase Auth.
   - L’utilisateur (ou un admin RH) pourra ensuite compléter ou modifier les champs additionnels via l’interface « Utilisateurs ».

2. **Affichage dans l’interface** :
   - Chaque utilisateur apparaît sous forme de carte dans la page « Utilisateurs ».
   - Les détails RH sont affichés ou éditables selon les droits (admin, RH, etc.).

3. **Mise à jour** :
   - Toute modification dans la fiche Firestore n’impacte pas l’authentification, mais permet une gestion RH avancée.

---

## 4. Informations pertinentes à gérer

- **Identité** : nom, prénom, email, photo, date de naissance
- **Parcours dans l’agence** : date d’entrée, poste, évolution, statut
- **Coordonnées** : téléphone, agence
- **Rôle & permissions** : pour la gestion des accès dans l’app
- **Historique** : dates de création/mise à jour, notes RH
- **Statut d’activité** : actif, inactif, suspendu, etc.

---

## 5. Avantages de cette organisation

- **Séparation claire** entre Auth (sécurité, login) et fiche RH (infos métier)
- **Extensible** : on peut ajouter des champs sans impacter l’authentification
- **Sécurité** : seules les infos non sensibles sont stockées côté client, le reste est protégé par les règles Firestore
- **Automatisation** : création automatique à la connexion, évite les oublis

---

## 6. Exemple de document Firestore `users/{uid}`

```json
{
  "uid": "abc123",
  "email": "prenom.nom@agence.fr",
  "displayName": "Prénom Nom",
  "role": "agent",
  "photoURL": "https://...",
  "dateEntree": "2022-09-01",
  "dateNaissance": "1990-05-15",
  "poste": "Conseiller",
  "telephone": "+33 6 12 34 56 78",
  "agence": "Marseille Vieux-Port",
  "statut": "actif",
  "notes": "",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## 7. Synthèse des informations disponibles pour chaque utilisateur

### A. **Via Firebase Auth**
- `uid` (identifiant unique)
- `email`
- `displayName` (nom complet, si renseigné)
- `photoURL` (si renseigné)
- `providerId` (Google, email, etc.)
- `emailVerified` (booléen)
- `metadata` (date de création du compte, dernière connexion)

### B. **Via Firestore (hook useUserProfile)**
- `id` (correspond à l’`uid`)
- `prenom` (découpé depuis displayName ou saisi)
- `nom` (découpé depuis displayName ou saisi)
- `mail` (email professionnel)
- `role` (ex : administrateur, agent, etc.)
- `role_label` (label lisible du rôle)
- `genre` (optionnel)
- `present` (optionnel)
- **Tous les champs RH/métier** : `dateEntree`, `dateNaissance`, `poste`, `telephone`, `agence`, `statut`, `notes`, `createdAt`, `updatedAt`, etc.

### C. **Tableau récapitulatif des sources**

| Champ                | Source              | Détail / Remarque                                  |
|----------------------|---------------------|----------------------------------------------------|
| `uid`                | Auth + Firestore    | Clé de correspondance                              |
| `email` / `mail`     | Auth + Firestore    | Peut différer si modifié côté RH                   |
| `displayName`        | Auth                | Nom complet issu de l’auth                         |
| `prenom` / `nom`     | Firestore           | Découpé ou saisi manuellement                      |
| `photoURL`           | Auth                | Peut être enrichi côté RH                          |
| `role`               | Firestore           | Gestion des droits                                 |
| `role_label`         | Firestore           | Pour affichage UX                                  |
| `dateEntree`         | Firestore           | RH uniquement                                      |
| `dateNaissance`      | Firestore           | RH uniquement                                      |
| `poste`              | Firestore           | RH uniquement                                      |
| `telephone`          | Firestore           | RH uniquement                                      |
| `agence`             | Firestore           | RH uniquement                                      |
| `statut`             | Firestore           | RH uniquement                                      |
| `notes`              | Firestore           | RH uniquement                                      |
| `createdAt`          | Firestore           | Pour audit                                         |
| `updatedAt`          | Firestore           | Pour audit                                         |
| `providerId`         | Auth                | Google, email, etc.                                |
| `emailVerified`      | Auth                | Pour sécurité                                      |
| `metadata`           | Auth                | Dates de création/connexion                        |
| `genre`              | Firestore           | Optionnel                                          |
| `present`            | Firestore           | Optionnel                                          |

---

**Remarque** : L’interface peut fusionner ces deux sources pour afficher une fiche complète, mais la modification des champs sensibles (rôle, RH) doit rester réservée aux administrateurs.

---

## 8. Tableau des utilisateurs actuels (auth + rôle + RH)

> **Remarque** : Les rôles sont issus de Firestore si renseignés, sinon ils sont par défaut à "utilisateur" à la première connexion. Les informations RH sont à jour selon la dernière saisie.

| Prénom + Nom         | Mail                              | Rôle             | Prénom     | Nom         | Genre | Password temporaire | Statut      | ETP  | Salaire mensuel | Entrée      | Sortie | Contrat    |
|----------------------|-----------------------------------|------------------|------------|-------------|-------|--------------------|-------------|------|-----------------|-------------|--------|------------|
| Jean-Michel Nogaro   | jeanmichel@allianz-nogaro.fr      | administrateur   | Jean-Michel| Nogaro      | h     | allianz            | agent       | 1    | -               | 01/01/2001  |        | mandat     |
| Julien Boetti        | julien.boetti@allianz-nogaro.fr   | administrateur   | Julien     | Boetti      | h     | allianz            | agent       | 1    | -               | 01/01/2020  |        | mandat     |
| Gwendal Clouet       | gwendal.clouet@allianz-nogaro.fr  | cdc_commercial   | Gwendal    | Clouet      | h     | allianz            | alternant   | 0,5  | 2 000,00 €      | 01/01/2022  |        | alternant  |
| Emma Nogaro          | emma@allianz-nogaro.fr            | cdc_commercial   | Emma       | Nogaro      | f     | allianz            | alternant   | 0,5  | 2 000,00 €      | 01/01/2022  |        | alternant  |
| Joëlle Abi Karam     | joelle.abikaram@allianz-nogaro.fr | cdc_commercial   | Joëlle     | Abi Karam   | f     | allianz            | non-cadre   | 1    | 2 000,00 €      | 01/01/2022  |        | cdi        |
| Astrid Ulrich        | astrid.ulrich@allianz-nogaro.fr   | cdc_commercial   | Astrid     | Ulrich      | f     | allianz            | non-cadre   | 1    | 2 000,00 €      | 01/01/2022  |        | cdi        |
| Karen Chollet        | karen.chollet@allianz-nogaro.fr   | cdc_sante_coll   | Karen      | Chollet     | f     | allianz            | cadre       | 0,6  | 2 000,00 €      | 01/01/2022  |        | cdi        |
| Kheira Bagnasco      | kheira.bagnasco@allianz-nogaro.fr | cdc_sante_ind    | Kheira     | Bagnasco    | f     | allianz            | non-cadre   | 1    | 2 000,00 €      | 01/01/2022  |        | cdi        |
| Virginie Tommasini   | virginie.tommasini@allianz-nogaro.fr| cdc_sinistre   | Virginie   | Tommasini   | f     | allianz            | cadre       | 1    | 2 000,00 €      | 01/01/2022  |        | cdi        |
| Nejma Hariati        | nejma.hariati@allianz-nogaro.fr   | cdc_sinistre     | Nejma      | Hariati     | f     | allianz            | non-cadre   | 1    | 2 000,00 €      | 01/01/2022  |        | cdi        |
| Corentin Ulrich      | corentin.ulrich@allianz-nogaro.fr | cdc_commercial   | Corentin   | Ulrich      | h     | allianz            | non-cadre   | 1    | 2 000,00 €      | 01/01/2022  |        | cdi        |
| Donia Sahraoui       | donia.sahraoui@allianz-nogaro.fr  | cdc_commercial   | Donia      | Sahraoui    | f     | allianz            | non-cadre   | 1    | 2 000,00 €      | 01/01/2022  |        | cdi        |

---
