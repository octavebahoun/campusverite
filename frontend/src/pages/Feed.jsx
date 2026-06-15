import React, { useState, useEffect } from 'react';
import { getOrCreatePseudo } from '../utils/pseudo';
import FiltreBar from '../components/FiltreBar';
import AvisCard from '../components/AvisCard';
import { RefreshCw, MessageSquare, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5000';

export default function Feed() {
  const [avisList, setAvisList] = useState([]);
  const [votedAvisIds, setVotedAvisIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState(null);
  const [error, setError] = useState(null);
  
  const pseudo = getOrCreatePseudo();

  const fetchAvis = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE}/api/avis`;
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categorie', selectedCategory);
      if (selectedType) params.append('type', selectedType);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Impossible de charger les avis.");
      const data = await res.json();
      setAvisList(data);
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion avec le serveur. Assurez-vous que le backend est lancé.");
    } finally {
      setLoading(false);
    }
  };

  const fetchVotes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/votes?pseudo=${encodeURIComponent(pseudo)}`);
      if (res.ok) {
        const data = await res.json();
        setVotedAvisIds(data);
      }
    } catch (err) {
      console.error("Error fetching votes:", err);
    }
  };

  useEffect(() => {
    fetchAvis();
  }, [selectedCategory, selectedType]);

  useEffect(() => {
    fetchVotes();
  }, [pseudo]);

  const handleVote = async (avisId) => {
    if (votedAvisIds.includes(avisId)) return;
    setVotingId(avisId);
    try {
      const res = await fetch(`${API_BASE}/api/avis/${avisId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudo })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur de vote");
      }

      const updatedAvis = await res.json();
      
      // Update in local state
      setAvisList(prev => prev.map(a => a.id === avisId ? updatedAvis : a));
      setVotedAvisIds(prev => [...prev, avisId]);
    } catch (err) {
      alert(err.message);
    } finally {
      setVotingId(null);
    }
  };

  const handleSignale = async (avisId) => {
    try {
      const res = await fetch(`${API_BASE}/api/avis/${avisId}/signale`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error("Erreur de signalement");
      const updatedAvis = await res.json();
      
      // Update in local state
      setAvisList(prev => prev.map(a => a.id === avisId ? updatedAvis : a));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Banner / Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900/40 via-indigo-950/30 to-slate-900 border border-purple-500/10 p-8 md:p-12">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-2xl space-y-4">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            🔒 Anonymat 100% garanti
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Libérez votre parole sur le campus de façon <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">anonyme</span>.
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Exprimez-vous librement, signalez les problèmes ou proposez des suggestions constructives sans crainte. Pseudo généré localement : <span className="font-mono text-purple-300 font-semibold">{pseudo}</span>
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              to="/soumettre" 
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-purple-600/20 active:scale-95"
            >
              <span>Soumettre un avis</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/chat" 
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 border border-slate-800 hover:border-slate-700 active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Rejoindre le Chat</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and stats component */}
      <FiltreBar 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        avisList={avisList}
      />

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center space-x-3 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchAvis}
            className="flex items-center space-x-1 text-xs underline font-semibold hover:text-red-300 ml-auto"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Réessayer</span>
          </button>
        </div>
      )}

      {/* Main Feed Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-200">
            Avis Récents ({loading ? 'Chargement...' : avisList.length})
          </h2>
          <button
            onClick={fetchAvis}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all duration-200"
            title="Rafraîchir les avis"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading && avisList.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="h-44 rounded-2xl glass border border-slate-800/50 animate-pulse p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-6 w-24 bg-slate-800 rounded-full" />
                  <div className="h-4 w-16 bg-slate-800 rounded" />
                </div>
                <div className="h-12 bg-slate-800 rounded-lg w-full" />
                <div className="h-8 bg-slate-800 rounded-xl w-28" />
              </div>
            ))}
          </div>
        ) : avisList.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 glass">
            <p className="text-slate-500 text-sm">Aucun avis trouvé avec les filtres sélectionnés.</p>
            <button
              onClick={() => { setSelectedCategory(null); setSelectedType(null); }}
              className="mt-4 text-xs font-bold text-purple-400 hover:text-purple-300 underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {avisList.map(a => (
              <AvisCard 
                key={a.id}
                avis={a}
                onVote={handleVote}
                onSignale={handleSignale}
                hasVoted={votedAvisIds.includes(a.id)}
                isVoting={votingId === a.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
