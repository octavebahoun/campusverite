# CampusVérité 🔒 — Plateforme de Feedback Étudiant Anonyme & Chat Live

CampusVérité est une application web d'expression libre et de feedback étudiant garantissant un anonymat total. Les étudiants peuvent y poster des avis sous forme de "coups de gueule" ou de "suggestions", voter pour les avis des autres et échanger dans des salons de discussion privés ou groupés en temps réel.

---

## 🛠️ Stack Technique

* **Frontend** : React, Vite, Tailwind CSS v4, Lucide Icons, React Router 7, Socket.io-client.
* **Backend** : Node.js, Express, Socket.io.
* **Base de données principale** : Supabase (PostgreSQL) pour les avis et les votes.
* **Base de données de chat** : MongoDB (Mongoose) pour les messages et salons.
* **Temps réel** : Socket.io (WebSocket) pour la messagerie instantanée.

---

## 📂 Structure du Projet

```text
campusverite/
├── backend/                 # Serveur Express & WebSockets
│   ├── models/              # Schémas Mongoose (Room, Message)
│   ├── routes/              # Routes API (avis, votes, chat)
│   ├── chatService.js       # Logique de persistance du chat (MongoDB & Fallback mémoire)
│   ├── supabase.js          # Client Supabase & Fallback mémoire pour Avis/Votes
│   ├── socket.js            # Gestionnaires d'évènements WebSockets
│   ├── index.js             # Point d'entrée du serveur
│   └── package.json
│
├── frontend/                # SPA React (Vite)
│   ├── src/
│   │   ├── components/      # Composants réutilisables (AvisCard, FiltreBar, MessageBubble)
│   │   ├── pages/           # Pages de l'application (Feed, Soumettre, Chat)
│   │   ├── utils/           # Fonctions utilitaires (génération de pseudo aléatoire)
│   │   ├── App.jsx          # Routage & Mise en page globale
│   │   ├── index.css        # Import de Tailwind CSS & Styles globaux
│   │   └── main.jsx
│   ├── index.html           # Document HTML principal avec meta SEO
│   └── package.json
│
├── .env                     # Fichier d'environnement (variables Supabase & MongoDB)
├── database.sql             # Scripts SQL d'initialisation pour Supabase
└── README.md
```

---

## ⚙️ Configuration & Lancement Rapide

Le backend de CampusVérité est doté d'un **mode de secours en mémoire (fallback)**. Si vous n'avez pas configuré Supabase ou MongoDB, l'application fonctionnera quand même en stockant temporairement les données dans la mémoire vive du serveur. C'est idéal pour tester et faire des démonstrations locales immédiates !

### 1. Installation des Dépendances

Dans le dossier racine, installez les dépendances du serveur et du client :

```bash
# Installer les dépendances du backend
cd backend
pnpm install

# Installer les dépendances du frontend
cd ../frontend
pnpm install
```

### 2. Configuration d'environnement (Optionnel)

Renommez ou éditez le fichier `.env` à la racine pour ajouter vos identifiants de base de données :

```env
# Supabase (PostgreSQL)
SUPABASE_URL=votre_url_supabase
SUPABASE_ANON_KEY=votre_cle_anonyme_supabase

# MongoDB
MONGO_URI=mongodb+srv://utilisateur:motdepasse@cluster.mongodb.net/campusverite

# Serveur
PORT=5000
```

### 3. Initialisation Supabase (si configuré)

Si vous utilisez Supabase, copiez le contenu du fichier `database.sql` présent à la racine et exécutez-le dans l'onglet **SQL Editor** de votre tableau de bord Supabase pour créer les tables `avis` et `votes` avec leurs politiques d'accès public (RLS).

### 4. Lancement de l'Application

Ouvrez deux terminaux séparés :

**Terminal 1 : Serveur Backend**
```bash
cd backend
pnpm dev
```
Le serveur démarrera sur le port `5000` (ou le port défini dans votre `.env`).

**Terminal 2 : Application Frontend**
```bash
cd frontend
pnpm dev
```
L'application Vite démarrera généralement sur `http://localhost:5173`. Ouvrez cette adresse dans votre navigateur.

---

## 🔒 Règles d'Anonymat Strictes & Fonctionnalités

1. **Pseudonyme Éphémère** : Généré automatiquement lors de la première visite (`Animal#Nombre`, ex: `Corbeau#4821`) et stocké localement (`localStorage`). Il n'est relié à aucun compte ou adresse IP. Un bouton de réinitialisation dans la barre de navigation permet d'en changer à tout moment.
2. **Système Anti-double-vote** : Les votes de l'utilisateur sont enregistrés dans Supabase de façon croisée avec le pseudonyme pour éviter les votes multiples, sans révéler d'identité.
3. **Tableau de chaleur (Heatmap)** : Statistique en temps réel des avis par catégorie pour cibler les points sensibles du campus.
4. **Système de Pétition** : Dès qu'un avis atteint **10 votes** ou plus, il reçoit automatiquement le badge clignotant **🔥 Pétition**.
5. **Signalement d'abus** : Permet de signaler un avis inapproprié.
