# CampusVérité 🔒 — Plateforme de Feedback Étudiant Anonyme & Chat Live

CampusVérité est une application web d'expression libre, de doléances et de feedback étudiant garantissant un anonymat total. Conçue pour briser les barrières de communication au sein des campus, elle permet aux étudiants de publier des avis ("coups de gueule" ou "suggestions"), de voter ou d'annuler leurs votes sur les sujets prioritaires, et de dialoguer en temps réel via un chat anonyme.

La plateforme intègre également un **espace de modération administrative** sécurisé doté d'outils de **rédaction de pétitions par Intelligence Artificielle** (via OpenRouter) et d'une mise en page d'impression officielle.

---

## 🎥 Démo Vidéo de Présentation

Découvrez les fonctionnalités de **CampusVérité** en action dans cette présentation de 30 secondes :

<video src="assets/presentation.mp4" width="100%" controls muted autoplay loop></video>

---

## ✨ Fonctionnalités Majeures

### 📢 Avis & Feedback Publics (Cahier des charges F1-F6)
* **Double typologie** : Publication de *Coups de gueule* (problèmes urgents) ou de *Suggestions* (idées constructives).
* **Catégorisation thématique** : Pédagogie, Infrastructure, Administration, Équipements.
* **Système de Vote Bidirectionnel (Toggle)** : Possibilité de voter pour un avis utile et d'annuler son vote (dévoter) à tout moment.
* **Seuil de Pétition automatique** : Dès qu'un avis atteint **10 votes utiles**, il est promu au statut de **🔥 Pétition**.
* **Signalement citoyen** : Les étudiants peuvent signaler un abus, ce qui masque temporairement le contenu en attendant la modération.

### 💬 Salons de Chat Live & Privés
* **Communication temps réel** : Propulsée par **Socket.io** pour des échanges instantanés.
* **Découverte anonyme** : Affichage des pseudos connectés en ligne dans le salon pour les ajouter directement en message privé (DM) ou groupe de discussion.
* **Anonymat préservé** : Pseudos générés à la volée sous la forme `Animal#Nombre` (ex: `Loup#7312`).

### 🛡️ Backoffice de Modération & IA Administrative
* **Accès sécurisé** : Protection renforcée par clé d'administration personnelle.
* **Outils de modération** : Validation des signalements (restaurer le contenu) ou suppression définitive (en cascade sur les votes).
* **Rédacteur de Pétition IA (OpenRouter)** :
  - Génération de courriers officiels adressés à la direction académique à partir des avis populaires.
  - Choix des modèles IA (*Gemini 2.5 Flash*, *Llama 3*, *Mistral*).
  - Mise en page académique à en-tête officielle avec zone de signature.
* **Mise en page Print / PDF** : Intégration de règles d'impression CSS (@media print) masquant automatiquement l'interface utilisateur pour ne générer qu'un PDF propre et impeccable.

---

## 🛠️ Stack Technique

* **Frontend** : React, Vite, Tailwind CSS v4, Framer Motion (animations fluides ultra-rapides de 0.18s), Lucide Icons.
* **Backend** : Node.js, Express, Socket.io.
* **Base de données relationnelle** : Supabase (PostgreSQL) pour la persistance des avis et des votes (avec gestion des clés étrangères et politiques RLS).
* **Base de données de chat** : MongoDB (Mongoose) pour l'historique des salons et messages.
* **Passerelle IA** : API OpenRouter.

---

## 📂 Structure du Projet

```text
campusverite/
├── backend/                 # Serveur Express & WebSockets
│   ├── models/              # Schémas Mongoose (Room, Message)
│   ├── routes/              # Routes API (avis, votes, chat, admin)
│   ├── chatService.js       # Gestion de la persistance MongoDB
│   ├── supabase.js          # Client Supabase & Modèles SQL
│   ├── socket.js            # Évènements WebSockets temps réel
│   ├── seed.js              # Script d'initialisation de données de démo
│   └── index.js             # Point d'entrée du serveur
│
├── frontend/                # Application React (Vite)
│   ├── public/              # Actifs statiques (.webp, logo, favicon)
│   ├── src/
│   │   ├── components/      # AvisCard, FiltreBar, MessageBubble
│   │   ├── pages/           # Feed, Soumettre, Chat, Admin (Modération & IA)
│   │   ├── utils/           # Générateur de pseudo session
│   │   ├── App.jsx          # Shell global & Thème Light/Dark
│   │   └── index.css        # Variables CSS, Thèmes & Règles d'impression
│
├── database.sql             # Schéma SQL d'initialisation Supabase
└── README.md
```

---

## ⚙️ Installation & Lancement

### 1. Installation des dépendances
Installez les dépendances pour les deux parties du projet :

```bash
# Pour le backend
cd backend
pnpm install

# Pour le frontend
cd ../frontend
pnpm install
```

### 2. Configuration de l'environnement
Configurez les variables d'environnement à l'aide d'un fichier `.env` à la racine :

```env
# Supabase
SUPABASE_URL=votre_url_supabase
SUPABASE_ANON_KEY=votre_cle_anonyme

# MongoDB
MONGO_URI=mongodb+srv://...

# Serveur
PORT=5000
```

### 3. Chargement des données de démonstration (Seed)
Pour tester immédiatement la plateforme avec des données d'avis réalistes, des votes pré-configurés et des salons de chat actifs, lancez le script de peuplement :

```bash
cd backend
node seed.js
```

### 4. Démarrage en développement
Lancez le backend et le frontend dans deux terminaux séparés :

**Serveur Backend :**
```bash
cd backend
pnpm dev
```

**Client Frontend :**
```bash
cd frontend
pnpm dev
```
L'application s'ouvrira sur `http://localhost:5173`.

---

## 🔒 Sécurité & Conception
* **Zéro Tracking** : Aucun cookie persistant de tracking. Le pseudonyme de session peut être réinitialisé en un clic depuis le header pour renouveler l'identité numérique.
* **Cascade d'intégrité** : La suppression d'un avis en modération entraîne la suppression automatique en cascade de tous ses votes associés dans la table `votes`, évitant toute corruption de contraintes.
* **Optimisation des performances** : Tous les visuels graphiques majeurs utilisent des images WebP optimisées de moins de 150 Ko pour garantir un affichage fluide y compris sur connexions mobiles.
