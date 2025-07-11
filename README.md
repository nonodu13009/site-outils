# Site Outils

Une plateforme moderne pour gérer tous vos outils et projets en un seul endroit. Construite avec Next.js et Firebase.

## 🚀 Technologies utilisées

- **Frontend**: Next.js 15 (App Router)
- **Backend**: Firebase (Firestore, Authentication)
- **Styling**: CSS natif avec Tailwind CSS
- **Déploiement**: Vercel
- **Versioning**: Git

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Firebase

## 🛠️ Installation

1. **Cloner le repository**
   ```bash
   git clone <votre-repo>
   cd site-outils
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration Firebase**

   Créez un fichier `.env.local` à la racine du projet avec vos variables Firebase :

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_project_id.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

5. **Ouvrir votre navigateur**
   ```
   http://localhost:3000
   ```

## 🏗️ Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── dashboard/         # Tableau de bord (protégé)
│   ├── login/            # Page de connexion
│   ├── signup/           # Page d'inscription
│   ├── globals.css       # Styles globaux
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Page d'accueil
├── components/            # Composants réutilisables
│   ├── AuthGuard.tsx     # Protection des routes
│   └── LoginForm.tsx     # Formulaire de connexion
├── hooks/                # Hooks personnalisés
│   └── useAuth.ts        # Hook d'authentification
└── lib/                  # Services et utilitaires
    ├── auth.ts           # Service d'authentification
    ├── firebase.ts       # Configuration Firebase
    └── firestore.ts      # Service Firestore
```

## 🔐 Authentification

Le projet utilise Firebase Authentication avec les fonctionnalités suivantes :

- **Connexion/Inscription** avec email et mot de passe
- **Protection des routes** avec AuthGuard
- **Gestion d'état** avec useAuth hook
- **Déconnexion** automatique

## 📊 Base de données

Firestore est utilisé pour stocker les données avec les services suivants :

- **CRUD complet** pour les documents
- **Requêtes filtrées** avec where clauses
- **Types TypeScript** pour la sécurité des types
- **Gestion d'erreurs** robuste

## 🎨 Design et UX

- **Design moderne** inspiré de Superhuman et Linear
- **Responsive** pour tous les appareils
- **Accessible** avec ARIA et navigation clavier
- **Feedback utilisateur** pour toutes les actions
- **Animations fluides** et transitions

## 🚀 Déploiement

### Vercel (Recommandé)

1. **Connecter votre repository GitHub à Vercel**
2. **Configurer les variables d'environnement** dans Vercel
3. **Déployer automatiquement** à chaque push

### Variables d'environnement pour la production

Assurez-vous de configurer ces variables dans Vercel :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

## 🔧 Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Vérification du code
```

## 📝 Fonctionnalités

- ✅ **Page d'accueil** avec CTA vers connexion
- ✅ **Authentification** complète (login/signup/logout)
- ✅ **Tableau de bord** protégé
- ✅ **Design moderne** et responsive
- ✅ **Gestion d'erreurs** et feedback utilisateur
- ✅ **Configuration Firebase** sécurisée
- ✅ **Types TypeScript** complets

## 🔮 Prochaines étapes

- [ ] Ajouter des outils spécifiques au tableau de bord
- [ ] Implémenter la gestion des profils utilisateur
- [ ] Ajouter des notifications en temps réel
- [ ] Intégrer des analytics
- [ ] Ajouter des tests unitaires et d'intégration

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :

1. Vérifiez la documentation Firebase
2. Consultez les issues GitHub
3. Contactez l'équipe de développement

---

**Développé avec ❤️ en utilisant Next.js et Firebase**
