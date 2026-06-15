const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("🔴 SUPABASE_URL ou SUPABASE_ANON_KEY manquant dans .env. L'API Avis/Votes ne fonctionnera pas.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log("🟢 Client Supabase initialisé.");

const db = {
  async getAvis(filters = {}) {
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
  },

  async getAllAvis() {
    const { data, error } = await supabase
      .from('avis')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async deleteAvis(id) {
    // Supprimer d'abord les votes liés à cet avis pour éviter les violations de clé étrangère
    const { error: votesError } = await supabase
      .from('votes')
      .delete()
      .eq('avis_id', id);

    if (votesError) throw votesError;

    const { data, error } = await supabase
      .from('avis')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error(
        "L'avis n'a pas pu être supprimé. RLS (Row Level Security) est activé sur Supabase mais aucune politique n'autorise la suppression (DELETE) pour la clé Anon. Veuillez désactiver RLS ou ajouter des politiques DELETE dans l'éditeur SQL Supabase."
      );
    }
    return data[0];
  },

  async unflagAvis(id) {
    const { data, error } = await supabase
      .from('avis')
      .update({ signale: false })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createAvis({ categorie, type, contenu }) {
    const { data, error } = await supabase
      .from('avis')
      .insert([{ categorie, type, contenu, votes: 0, signale: false }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async voteAvis(avisId, pseudo) {
    // Check if vote already exists
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('*')
      .eq('avis_id', avisId)
      .eq('pseudo', pseudo)
      .maybeSingle();

    if (checkError) throw checkError;

    // Read current vote count
    const { data: currentAvis, error: readError } = await supabase
      .from('avis')
      .select('votes')
      .eq('id', avisId)
      .single();

    if (readError) throw readError;

    let newVotesCount = currentAvis.votes || 0;

    if (existingVote) {
      // User already voted, so UNVOTE (dévoter)
      const { error: deleteError } = await supabase
        .from('votes')
        .delete()
        .eq('avis_id', avisId)
        .eq('pseudo', pseudo);

      if (deleteError) throw deleteError;
      newVotesCount = Math.max(0, newVotesCount - 1);
    } else {
      // User hasn't voted yet, so VOTE
      const { error: insertError } = await supabase
        .from('votes')
        .insert([{ avis_id: avisId, pseudo }]);

      if (insertError) throw insertError;
      newVotesCount = newVotesCount + 1;
    }

    const { data: updatedAvis, error: updateError } = await supabase
      .from('avis')
      .update({ votes: newVotesCount })
      .eq('id', avisId)
      .select()
      .single();

    if (updateError) throw updateError;
    return updatedAvis;
  },

  async getVotesByPseudo(pseudo) {
    const { data, error } = await supabase
      .from('votes')
      .select('avis_id')
      .eq('pseudo', pseudo);

    if (error) throw error;
    return data.map(v => v.avis_id);
  },

  async toggleSignale(avisId) {
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
  }
};

module.exports = db;
