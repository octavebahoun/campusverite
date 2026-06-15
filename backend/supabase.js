const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;
let useMemoryFallback = false;

// In-Memory Database Fallback for Development/Demo if Supabase is not configured
const memoryDb = {
  avis: [
    {
      id: "a0000000-0000-0000-0000-000000000001",
      categorie: "Pédagogie",
      type: "suggestion",
      contenu: "On devrait enregistrer les cours de programmation pour pouvoir les réécouter chez soi.",
      votes: 12,
      signale: false,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: "a0000000-0000-0000-0000-000000000002",
      categorie: "Infrastructure",
      type: "coup_de_gueule",
      contenu: "Le chauffage ne fonctionne toujours pas dans le bâtiment B. On gèle en amphi !",
      votes: 35,
      signale: false,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: "a0000000-0000-0000-0000-000000000003",
      categorie: "Administration",
      type: "coup_de_gueule",
      contenu: "3 semaines d'attente pour une simple signature de convention de stage, c'est abusé.",
      votes: 8,
      signale: false,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: "a0000000-0000-0000-0000-000000000004",
      categorie: "Équipements",
      type: "suggestion",
      contenu: "Installer des prises électriques sur chaque table de la bibliothèque universitaire.",
      votes: 42,
      signale: false,
      created_at: new Date(Date.now() - 3600000 * 48).toISOString()
    }
  ],
  votes: [
    { id: "v1", avis_id: "a0000000-0000-0000-0000-000000000001", pseudo: "Loup#1234" }
  ]
};

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("🟢 Client Supabase initialisé.");
  } catch (error) {
    console.error("🔴 Erreur initialisation Supabase. Utilisation du fallback en mémoire.", error);
    useMemoryFallback = true;
  }
} else {
  console.warn("⚠️  SUPABASE_URL ou SUPABASE_ANON_KEY manquant dans .env. Mode mémoire activé pour Avis/Votes.");
  useMemoryFallback = true;
}

// Generate UUID helper for memory DB
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const db = {
  async getAvis(filters = {}) {
    if (useMemoryFallback) {
      let result = [...memoryDb.avis];
      if (filters.categorie) {
        result = result.filter(a => a.categorie.toLowerCase() === filters.categorie.toLowerCase());
      }
      if (filters.type) {
        result = result.filter(a => a.type.toLowerCase() === filters.type.toLowerCase());
      }
      // Sort by date descending
      return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    try {
      let query = supabase.from('avis').select('*');
      
      if (filters.categorie) {
        query = query.eq('categorie', filters.categorie);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase getAvis error:", err.message);
      throw err;
    }
  },

  async createAvis({ categorie, type, contenu }) {
    if (useMemoryFallback) {
      const newAvis = {
        id: generateUUID(),
        categorie,
        type,
        contenu,
        votes: 0,
        signale: false,
        created_at: new Date().toISOString()
      };
      memoryDb.avis.push(newAvis);
      return newAvis;
    }

    try {
      const { data, error } = await supabase
        .from('avis')
        .insert([{ categorie, type, contenu, votes: 0, signale: false }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase createAvis error:", err.message);
      throw err;
    }
  },

  async voteAvis(avisId, pseudo) {
    if (useMemoryFallback) {
      // Check if already voted
      const alreadyVoted = memoryDb.votes.some(v => v.avis_id === avisId && v.pseudo === pseudo);
      if (alreadyVoted) {
        throw new Error("Vous avez déjà voté pour cet avis.");
      }
      
      // Find avis
      const avis = memoryDb.avis.find(a => a.id === avisId);
      if (!avis) {
        throw new Error("Avis introuvable.");
      }
      
      // Save vote
      memoryDb.votes.push({
        id: generateUUID(),
        avis_id: avisId,
        pseudo
      });
      
      // Increment vote
      avis.votes += 1;
      return avis;
    }

    try {
      // Check if vote already exists
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('*')
        .eq('avis_id', avisId)
        .eq('pseudo', pseudo)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingVote) {
        throw new Error("Vous avez déjà voté pour cet avis.");
      }

      // Insert vote
      const { error: insertError } = await supabase
        .from('votes')
        .insert([{ avis_id: avisId, pseudo }]);

      if (insertError) throw insertError;

      // Increment votes count in avis table
      // We read the current votes first, then increment
      const { data: currentAvis, error: readError } = await supabase
        .from('avis')
        .select('votes')
        .eq('id', avisId)
        .single();

      if (readError) throw readError;

      const newVotesCount = (currentAvis.votes || 0) + 1;

      const { data: updatedAvis, error: updateError } = await supabase
        .from('avis')
        .update({ votes: newVotesCount })
        .eq('id', avisId)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedAvis;
    } catch (err) {
      console.error("Supabase voteAvis error:", err.message);
      throw err;
    }
  },

  async getVotesByPseudo(pseudo) {
    if (useMemoryFallback) {
      return memoryDb.votes.filter(v => v.pseudo === pseudo).map(v => v.avis_id);
    }
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('avis_id')
        .eq('pseudo', pseudo);
      if (error) throw error;
      return data.map(v => v.avis_id);
    } catch (err) {
      console.error("Supabase getVotesByPseudo error:", err.message);
      return [];
    }
  },

  async toggleSignale(avisId) {
    if (useMemoryFallback) {
      const avis = memoryDb.avis.find(a => a.id === avisId);
      if (!avis) throw new Error("Avis introuvable.");
      avis.signale = !avis.signale;
      return avis;
    }

    try {
      const { data: current, error: readError } = await supabase
        .from('avis')
        .select('signale')
        .eq('id', avisId)
        .single();

      if (readError) throw readError;

      const { data, error } = await supabase
        .from('avis')
        .update({ signale: !current.signale })
        .eq('id', avisId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase toggleSignale error:", err.message);
      throw err;
    }
  }
};

module.exports = db;
