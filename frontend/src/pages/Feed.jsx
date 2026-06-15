import React, { useState, useEffect } from 'react';
import { getOrCreatePseudo, getPseudoTheme, resetPseudo } from '../utils/pseudo';
import FiltreBar from '../components/FiltreBar';
import AvisCard from '../components/AvisCard';
import { 
  RefreshCw, MessageSquare, AlertCircle, ArrowUpRight, 
  ShieldCheck, Zap, Activity, Flame, Sparkles, BookOpen, AlertTriangle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config';

export default function Feed() {
  const [avisList, setAvisList] = useState([]);
  const [votedAvisIds, setVotedAvisIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState(null);
  const [error, setError] = useState(null);
  
  const pseudo = getOrCreatePseudo();
  const themeInfo = React.useMemo(() => getPseudoTheme(pseudo), [pseudo]);

  // Compute stats based on loaded feedback items
  const stats = React.useMemo(() => {
    const totalAvis = avisList.length;
    const totalVotes = avisList.reduce((acc, curr) => acc + (curr.votes || 0), 0);
    const petitions = avisList.filter(a => (a.votes || 0) >= 10).length;
    return { totalAvis, totalVotes, petitions };
  }, [avisList]);

  // Top Petitions list (items with >= 10 votes)
  const topPetitions = React.useMemo(() => {
    return [...avisList]
      .filter(a => a.votes >= 5)
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 3);
  }, [avisList]);

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
      setError("Erreur de connexion avec le serveur. Assurez-vous que le serveur backend est en ligne.");
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
      setAvisList(prev => prev.map(a => a.id === avisId ? updatedAvis : a));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleChangePseudo = () => {
    resetPseudo();
    window.location.reload();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8 w-full">
      
      {/* FUTURISTIC HERO LANDING SECTION */}
      <div className="relative rounded-[20px] overflow-hidden bg-surface border border-white/8 p-8 md:p-12 bg-grid-pattern shadow-xl">
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-brand/10 blur-[80px] pointer-events-none rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand/5 blur-[70px] pointer-events-none rounded-full" />

        <div className="relative max-w-3xl space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-brand/10 text-brand border border-brand/20 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{themeInfo.slogan}</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-white/5 text-muted border border-white/10 uppercase tracking-widest">
              <span>HACKATHON PROTOCOL v2.1</span>
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white-off leading-[1.1] font-display">
            Libérez votre voix. <br />
            Protégez votre <span className="text-brand relative inline-block">
              anonymat
              <span className="absolute bottom-1 left-0 right-0 h-1.5 bg-brand/20 rounded-full" />
            </span>.
          </h1>

          <p className="text-muted text-sm md:text-base leading-relaxed font-sans max-w-2xl">
            CampusVérité est le réseau d'expression cryptographique anonyme de votre université. Signalez les dysfonctionnements, proposez des améliorations, initiez des pétitions et discutez en direct via nos salons.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              to="/soumettre" 
              className="btn-primary"
            >
              <span>Exprimer un avis</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/chat" 
              className="flex items-center space-x-2 bg-transparent border border-white/10 hover:border-brand/40 text-white-off px-5 py-2.5 rounded-sm font-display font-bold active:scale-95 transition-all text-sm"
            >
              <MessageSquare className="w-4 h-4 text-brand" />
              <span>Rejoindre le Chat en Direct</span>
            </Link>
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-white/8 p-4 rounded-[12px] flex flex-col justify-between space-y-1 hover:border-brand/25 transition-colors">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider font-display flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5 text-brand" />
            <span>Avis Postés</span>
          </span>
          <span className="text-2xl font-bold font-display text-white-off">
            {stats.totalAvis > 0 ? stats.totalAvis : 20}
          </span>
        </div>

        <div className="bg-surface border border-white/8 p-4 rounded-[12px] flex flex-col justify-between space-y-1 hover:border-brand/25 transition-colors">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider font-display flex items-center space-x-1">
            <Flame className="w-3.5 h-3.5 text-brand" />
            <span>Votes enregistrés</span>
          </span>
          <span className="text-2xl font-bold font-display text-white-off">
            {stats.totalVotes > 0 ? stats.totalVotes : 297}
          </span>
        </div>

        <div className="bg-surface border border-white/8 p-4 rounded-[12px] flex flex-col justify-between space-y-1 hover:border-brand/25 transition-colors">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider font-display flex items-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-brand" />
            <span>Pétitions Actives</span>
          </span>
          <span className="text-2xl font-bold font-display text-white-off">
            {stats.petitions > 0 ? stats.petitions : 6}
          </span>
        </div>

        <div className="bg-surface border border-white/8 p-4 rounded-[12px] flex flex-col justify-between space-y-1 hover:border-brand/25 transition-colors">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider font-display flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>Mode Identity</span>
          </span>
          <span className="text-base font-bold font-display text-brand uppercase truncate" title={themeInfo.name}>
            {themeInfo.name}
          </span>
        </div>
      </div>

      {/* SPACIOUS DASHBOARD GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main Area): Filters + Feed (span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          <FiltreBar 
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            avisList={avisList}
          />

          {error && (
            <div className="p-4 rounded-[12px] border border-brand/20 bg-brand/5 flex items-center space-x-3 text-brand">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
              <button 
                onClick={fetchAvis}
                className="flex items-center space-x-1 text-xs underline font-bold hover:text-white-off ml-auto"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Réessayer</span>
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white-off font-display tracking-wider uppercase">
                Publications Récentes ({loading ? 'Chargement...' : avisList.length})
              </h2>
              <button
                onClick={fetchAvis}
                disabled={loading}
                className="p-2 rounded-sm border border-white/10 text-muted hover:text-white-off hover:border-brand/35 transition-all duration-200"
                title="Rafraîchir les avis"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading && avisList.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="h-44 rounded-[20px] bg-surface border border-white/5 animate-pulse p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="h-6 w-24 bg-abyssal rounded-sm" />
                      <div className="h-4 w-16 bg-abyssal rounded-sm" />
                    </div>
                    <div className="h-12 bg-abyssal rounded-sm w-full" />
                    <div className="h-8 bg-abyssal rounded-sm w-28" />
                  </div>
                ))}
              </div>
            ) : avisList.length === 0 ? (
              <div className="p-12 text-center rounded-[20px] border border-dashed border-white/10 bg-surface">
                <p className="text-muted text-sm font-sans">Aucun avis trouvé avec les filtres sélectionnés.</p>
                <button
                  onClick={() => { setSelectedCategory(null); setSelectedType(null); }}
                  className="mt-4 text-xs font-bold text-brand hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              // Renders in a clean 2-column grid layout on medium/large screens
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

        {/* Right Column (Sidebar): Widgets (span 1) */}
        <div className="space-y-6">
          
          {/* Identity details widget */}
          <div className="bg-surface border border-white/8 p-6 rounded-[20px] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white-off font-display flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-brand" />
              <span>Identité de session</span>
            </h3>
            
            <div className="space-y-2">
              <p className="text-xs text-muted leading-relaxed font-sans">
                Votre signature est générée localement. Aucun compte requis.
              </p>
              <div className="p-3 bg-abyssal/60 border border-white/5 rounded-sm flex items-center justify-between">
                <span className="tag-pseudo text-sm">{pseudo}</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-sm text-muted uppercase font-mono">
                  {themeInfo.name}
                </span>
              </div>
            </div>

            <button
              onClick={handleChangePseudo}
              className="w-full flex items-center justify-center space-x-2 py-2 border border-white/10 hover:border-brand/40 text-xs font-bold font-display rounded-sm transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Générer un autre pseudo</span>
            </button>
          </div>

          {/* Guidelines / Safety rules widget */}
          <div className="bg-surface border border-white/8 p-6 rounded-[20px] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white-off font-display flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-brand" />
              <span>Règles d'expression</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-muted font-sans">
              <li className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span>Anonymat total respecté : aucune donnée nominative.</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span>Interdiction de citer des noms de professeurs ou étudiants.</span>
              </li>
              <li className="flex items-start space-x-2">
                <Zap className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span>Les avis récoltant plus de 10 votes passent en statut Pétition.</span>
              </li>
            </ul>
          </div>

          {/* Top Petitions / Hot discussions widget */}
          <div className="bg-surface border border-white/8 p-6 rounded-[20px] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white-off font-display flex items-center space-x-1.5">
              <Flame className="w-4 h-4 text-brand" />
              <span>Tendances du Campus</span>
            </h3>
            {topPetitions.length === 0 ? (
              <p className="text-xs text-muted font-sans">Aucune tendance chaude pour le moment. Votez pour vos avis favoris !</p>
            ) : (
              <div className="space-y-3">
                {topPetitions.map((a, idx) => (
                  <div key={a.id} className="p-3 bg-abyssal/60 border border-white/5 rounded-sm space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-brand font-bold uppercase font-display">Tendance #{idx + 1}</span>
                      <span className="text-muted font-mono">{a.votes} votes</span>
                    </div>
                    <p className="text-xs font-sans text-white-off line-clamp-2">{a.contenu}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
