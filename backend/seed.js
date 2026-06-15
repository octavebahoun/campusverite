/**
 * seed.js — Script de peuplement de la base de données CampusVérité
 * 
 * Insère des avis réalistes dans Supabase (PostgreSQL)
 * et des salons + messages dans MongoDB.
 *
 * Usage :
 *   node seed.js
 *
 * Prérequis :
 *   - Fichier .env configuré avec SUPABASE_URL, SUPABASE_ANON_KEY, MONGO_URI
 *   - Tables Supabase créées via database.sql
 */

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const mongoose = require('mongoose');
const Room = require('./models/Room');
const Message = require('./models/Message');

// ─── Configuration ────────────────────────────────────────────

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// ─── Pseudos réalistes ────────────────────────────────────────

const PSEUDOS = [
  "Corbeau#4821", "Loup#7312", "Renard#2091", "Aigle#5543",
  "Tigre#8877", "Lynx#1429", "Ours#6640", "Faucon#3358",
  "Panthère#9102", "Hibou#2765", "Lion#4417", "Guépard#6083",
  "Cerf#1190", "Loutre#8234", "Castor#5571", "Panda#3846"
];

// ─── Données d'avis à insérer ─────────────────────────────────

const AVIS_DATA = [
  // ── Pédagogie ──
  {
    categorie: "Pédagogie",
    type: "coup_de_gueule",
    contenu: "Le prof de maths n'a pas assuré le cours depuis 3 semaines. On a un partiel dans 15 jours et on n'a vu que la moitié du programme. C'est inadmissible.",
    votes: 34
  },
  {
    categorie: "Pédagogie",
    type: "suggestion",
    contenu: "Enregistrer les cours magistraux en vidéo et les mettre sur la plateforme pédagogique. Ça permettrait de réviser et aiderait ceux qui travaillent en parallèle.",
    votes: 28
  },
  {
    categorie: "Pédagogie",
    type: "coup_de_gueule",
    contenu: "Les TD de chimie sont en amphi de 300 places. Comment on est censés poser des questions ou faire des exercices au tableau dans ces conditions ?",
    votes: 19
  },
  {
    categorie: "Pédagogie",
    type: "suggestion",
    contenu: "Mettre en place un système de tutorat entre L3 et L1. Les anciens aident les nouveaux, tout le monde y gagne. D'autres facs le font déjà avec succès.",
    votes: 15
  },
  {
    categorie: "Pédagogie",
    type: "coup_de_gueule",
    contenu: "Les notes du partiel de droit constitutionnel ne sont toujours pas publiées alors qu'on est à 6 semaines du partiel. On ne peut même pas savoir si on doit rattraper.",
    votes: 22
  },

  // ── Infrastructure ──
  {
    categorie: "Infrastructure",
    type: "coup_de_gueule",
    contenu: "Le chauffage ne fonctionne toujours pas dans le bâtiment B. On est en plein hiver et on gèle littéralement en amphi. Les étudiants gardent leurs manteaux pendant les cours.",
    votes: 45
  },
  {
    categorie: "Infrastructure",
    type: "suggestion",
    contenu: "Installer des fontaines à eau filtrée dans chaque bâtiment. On utilise tous des bouteilles en plastique alors qu'on pourrait avoir de l'eau gratuite et écologique.",
    votes: 31
  },
  {
    categorie: "Infrastructure",
    type: "coup_de_gueule",
    contenu: "Les toilettes du bâtiment C sont dans un état lamentable. Pas de savon, pas de papier, des portes qui ne ferment plus. On est à l'université, pas dans un squat.",
    votes: 38
  },
  {
    categorie: "Infrastructure",
    type: "suggestion",
    contenu: "Créer une salle de repos/détente avec des canapés et du silence pour les étudiants qui ont des trous de 3h entre deux cours. La BU est toujours pleine.",
    votes: 12
  },
  {
    categorie: "Infrastructure",
    type: "coup_de_gueule",
    contenu: "L'ascenseur du bâtiment principal est en panne depuis 2 mois. Les étudiants à mobilité réduite ne peuvent plus accéder aux salles du 3e étage.",
    votes: 52
  },

  // ── Administration ──
  {
    categorie: "Administration",
    type: "coup_de_gueule",
    contenu: "3 semaines d'attente pour une simple signature de convention de stage. Le secrétariat est ouvert 2h par jour et il faut prendre RDV 10 jours à l'avance.",
    votes: 27
  },
  {
    categorie: "Administration",
    type: "suggestion",
    contenu: "Dématérialiser la procédure de convention de stage. En 2026 on ne devrait plus avoir à faire la queue avec des papiers physiques pour une signature.",
    votes: 41
  },
  {
    categorie: "Administration",
    type: "coup_de_gueule",
    contenu: "Personne ne répond aux emails de la scolarité. J'ai envoyé 4 mails en 3 semaines à propos de mon inscription et aucune réponse.",
    votes: 16
  },
  {
    categorie: "Administration",
    type: "suggestion",
    contenu: "Publier un calendrier clair des deadlines administratives (inscriptions, bourses, stages) en début d'année et envoyer des rappels automatiques par mail.",
    votes: 9
  },

  // ── Équipements ──
  {
    categorie: "Équipements",
    type: "suggestion",
    contenu: "Installer des prises électriques sur chaque table de la bibliothèque universitaire. La moitié des places sont inutilisables quand le PC n'a plus de batterie.",
    votes: 47
  },
  {
    categorie: "Équipements",
    type: "coup_de_gueule",
    contenu: "Les ordinateurs de la salle informatique tournent sous Windows 7 et mettent 10 minutes à démarrer. On perd la moitié du TP à attendre que la machine soit prête.",
    votes: 33
  },
  {
    categorie: "Équipements",
    type: "suggestion",
    contenu: "Proposer un accès VPN étudiant pour se connecter aux ressources numériques de la fac depuis chez soi. Les licences logicielles devraient aussi être accessibles à distance.",
    votes: 18
  },
  {
    categorie: "Équipements",
    type: "coup_de_gueule",
    contenu: "Le WiFi du campus est catastrophique. Impossible de charger une vidéo de cours en streaming, ça coupe toutes les 30 secondes dans le bâtiment A.",
    votes: 56
  },
  {
    categorie: "Équipements",
    type: "suggestion",
    contenu: "Mettre à disposition des casiers sécurisés gratuits pour les étudiants qui viennent avec du matériel lourd (PC, livres). On ne peut pas tout trimballer toute la journée.",
    votes: 7
  },
  {
    categorie: "Équipements",
    type: "coup_de_gueule",
    contenu: "Le vidéoprojecteur de l'amphi D est cassé depuis le mois dernier. Les profs font cours sans support visuel, c'est complètement inadapté pour des cours scientifiques.",
    votes: 14
  }
];

// ─── Messages de chat de démonstration ────────────────────────

const CHAT_CONVERSATIONS = [
  // Salon groupe "Général"
  {
    room: { type: "group", membres: PSEUDOS.slice(0, 8) },
    messages: [
      { pseudo: "Système", contenu: "Bienvenue dans le canal général anonyme de CampusVérité !" },
      { pseudo: "Corbeau#4821", contenu: "Salut tout le monde ! Quelqu'un sait si le partiel de stats est maintenu vendredi ?" },
      { pseudo: "Loup#7312", contenu: "Oui c'est confirmé, le prof a envoyé un mail hier soir." },
      { pseudo: "Renard#2091", contenu: "Sérieux ? J'ai rien reçu moi. Il a envoyé ça sur quelle adresse ?" },
      { pseudo: "Loup#7312", contenu: "Sur la boîte universitaire. Regarde dans tes spams." },
      { pseudo: "Aigle#5543", contenu: "Quelqu'un a les notes du dernier DM de maths ? Le corrigé n'est toujours pas en ligne." },
      { pseudo: "Tigre#8877", contenu: "Non mais j'ai demandé au délégué, il relance le prof demain." },
      { pseudo: "Corbeau#4821", contenu: "Merci les gars. Bon courage à tous pour les partiels 💪" },
    ]
  },
  // Salon groupe "Infra & Équipements"
  {
    room: { type: "group", membres: [PSEUDOS[0], PSEUDOS[2], PSEUDOS[4], PSEUDOS[6], PSEUDOS[8]] },
    messages: [
      { pseudo: "Système", contenu: "Salon dédié aux discussions sur l'infrastructure et les équipements du campus." },
      { pseudo: "Corbeau#4821", contenu: "Le WiFi est encore tombé dans le bâtiment A. C'est la 3e fois cette semaine." },
      { pseudo: "Renard#2091", contenu: "Pareil au bâtiment C. J'ai dû utiliser mes données mobiles pour envoyer un mail." },
      { pseudo: "Tigre#8877", contenu: "Il paraît que la DSI change les bornes WiFi pendant les vacances. Croisons les doigts." },
      { pseudo: "Ours#6640", contenu: "En attendant, est-ce que quelqu'un a trouvé un spot où le WiFi marche correctement ?" },
      { pseudo: "Panthère#9102", contenu: "La cafèt du bâtiment E ça passe. C'est le seul endroit stable honnêtement." },
    ]
  },
  // DM privé
  {
    room: { type: "dm", membres: [PSEUDOS[0], PSEUDOS[3]] },
    messages: [
      { pseudo: "Corbeau#4821", contenu: "Hey, t'as réussi à avoir ta convention de stage signée finalement ?" },
      { pseudo: "Aigle#5543", contenu: "Oui mais ça m'a pris 3 semaines. J'ai dû relancer 4 fois par mail." },
      { pseudo: "Corbeau#4821", contenu: "C'est n'importe quoi. J'ai posté un avis sur la plateforme à ce sujet." },
      { pseudo: "Aigle#5543", contenu: "Bien joué. Plus on sera nombreux à remonter le problème, plus ça bougera." },
    ]
  }
];


// ─── Fonctions d'insertion ────────────────────────────────────

async function seedSupabase() {
  console.log("\n📦 Nettoyage des tables Supabase...");

  // Delete votes first (foreign key constraint)
  const { error: delVotes } = await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delVotes) console.warn("   ⚠️  Erreur suppression votes:", delVotes.message);

  const { error: delAvis } = await supabase.from('avis').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delAvis) console.warn("   ⚠️  Erreur suppression avis:", delAvis.message);

  console.log("📝 Insertion de", AVIS_DATA.length, "avis...");

  const insertedAvis = [];
  for (const avis of AVIS_DATA) {
    // Stagger created_at timestamps to create realistic ordering
    const hoursAgo = Math.floor(Math.random() * 168); // up to 7 days ago
    const created_at = new Date(Date.now() - hoursAgo * 3600000).toISOString();

    const { data, error } = await supabase
      .from('avis')
      .insert([{
        categorie: avis.categorie,
        type: avis.type,
        contenu: avis.contenu,
        votes: avis.votes,
        signale: false,
        created_at
      }])
      .select()
      .single();

    if (error) {
      console.error("   ❌ Erreur insertion avis:", error.message);
    } else {
      insertedAvis.push(data);
      console.log(`   ✅ [${avis.categorie}] ${avis.contenu.substring(0, 50)}...`);
    }
  }

  // Seed some votes
  console.log("\n🗳️  Insertion des votes...");
  let voteCount = 0;
  for (const avis of insertedAvis) {
    // Generate random votes from random pseudos
    const numVoters = Math.min(avis.votes, PSEUDOS.length);
    const shuffled = [...PSEUDOS].sort(() => Math.random() - 0.5);
    const voters = shuffled.slice(0, numVoters);

    for (const pseudo of voters) {
      const { error } = await supabase
        .from('votes')
        .insert([{ avis_id: avis.id, pseudo }]);
      
      if (!error) voteCount++;
    }
  }
  console.log(`   ✅ ${voteCount} votes insérés.`);

  return insertedAvis;
}

async function seedMongoDB() {
  console.log("\n🍃 Connexion à MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("   ✅ Connecté.");

  console.log("🧹 Nettoyage des collections...");
  await Room.deleteMany({});
  await Message.deleteMany({});

  console.log("💬 Insertion des salons et messages...");

  for (const conv of CHAT_CONVERSATIONS) {
    // Create room
    const room = new Room({
      type: conv.room.type,
      membres: [...conv.room.membres].sort()
    });
    const savedRoom = await room.save();
    console.log(`   ✅ Salon [${conv.room.type}] — ${conv.room.membres.length} membres`);

    // Insert messages with staggered timestamps
    for (let i = 0; i < conv.messages.length; i++) {
      const msg = conv.messages[i];
      const minutesAgo = (conv.messages.length - i) * 5; // 5 min apart
      const created_at = new Date(Date.now() - minutesAgo * 60000);

      const message = new Message({
        room_id: savedRoom._id,
        pseudo: msg.pseudo,
        contenu: msg.contenu,
        created_at
      });
      await message.save();
    }
    console.log(`      ↳ ${conv.messages.length} messages insérés`);
  }
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  console.log("══════════════════════════════════════════");
  console.log("   🌱 CampusVérité — Seed Database");
  console.log("══════════════════════════════════════════");

  try {
    await seedSupabase();
    await seedMongoDB();

    console.log("\n══════════════════════════════════════════");
    console.log("   ✅ Seed terminé avec succès !");
    console.log("══════════════════════════════════════════\n");
  } catch (err) {
    console.error("\n❌ Erreur fatale pendant le seed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
