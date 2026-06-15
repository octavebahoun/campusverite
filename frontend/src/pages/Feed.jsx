/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  Megaphone,
  RefreshCw,
  ShieldCheck,
  ThumbsUp,
} from 'lucide-react';
import { API_BASE } from '../config';
import heroImage from '../assets/hero.png';
import { getOrCreatePseudo, resetPseudo } from '../utils/pseudo';
import AvisCard from '../components/AvisCard';
import FiltreBar from '../components/FiltreBar';

export default function Feed() {
  const [avisList, setAvisList] = useState([]);
  const [votedAvisIds, setVotedAvisIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState(null);
  const [error, setError] = useState(null);

  const pseudo = getOrCreatePseudo();

  const stats = useMemo(() => {
    const totalAvis = avisList.length;
    const totalVotes = avisList.reduce((acc, item) => acc + (item.votes || 0), 0);
    const petitions = avisList.filter((item) => (item.votes || 0) >= 10).length;
    const signales = avisList.filter((item) => item.signale).length;
    return { totalAvis, totalVotes, petitions, signales };
  }, [avisList]);

  const topPetitions = useMemo(() => (
    [...avisList]
      .filter((item) => (item.votes || 0) >= 5)
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, 3)
  ), [avisList]);

  const fetchAvis = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE}/api/avis`;
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categorie', selectedCategory);
      if (selectedType) params.append('type', selectedType);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Impossible de charger les avis.');
      setAvisList(await res.json());
    } catch (err) {
      console.error(err);
      setError('Le serveur backend ne répond pas. Lancez le backend puis réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVotes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/votes?pseudo=${encodeURIComponent(pseudo)}`);
      if (res.ok) setVotedAvisIds(await res.json());
    } catch (err) {
      console.error('Error fetching votes:', err);
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
        body: JSON.stringify({ pseudo }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur de vote');
      }
      const updatedAvis = await res.json();
      setAvisList((prev) => prev.map((item) => (item.id === avisId ? updatedAvis : item)));
      setVotedAvisIds((prev) => [...prev, avisId]);
    } catch (err) {
      alert(err.message);
    } finally {
      setVotingId(null);
    }
  };

  const handleSignale = async (avisId) => {
    try {
      const res = await fetch(`${API_BASE}/api/avis/${avisId}/signale`, { method: 'POST' });
      if (!res.ok) throw new Error('Erreur de signalement');
      const updatedAvis = await res.json();
      setAvisList((prev) => prev.map((item) => (item.id === avisId ? updatedAvis : item)));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleChangePseudo = () => {
    resetPseudo();
    window.location.reload();
  };

  return (
    <div className="space-y-7">
      <section className="surface overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="p-6 md:p-8 lg:p-10">
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="badge bg-[rgba(var(--color-brand-rgb),0.1)] text-brand">
                <ShieldCheck className="h-3.5 w-3.5" />
                Anonymat sans compte
              </span>
              <span className="badge text-muted">
                Cahier des charges F1-F6
              </span>
            </div>

            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-white-off md:text-5xl">
              La voix du campus, lisible et protégée.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Publiez un coup de gueule ou une suggestion, votez pour les avis utiles et faites émerger les sujets prioritaires sans donner votre nom.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/soumettre" className="btn-primary">
                Soumettre un avis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button type="button" onClick={handleChangePseudo} className="btn-secondary">
                <RefreshCw className="h-4 w-4" />
                Nouveau pseudo
              </button>
            </div>
          </div>

          <div
            className="hero-image min-h-[260px] border-t border-[var(--color-border)] lg:border-l lg:border-t-0"
            style={{ backgroundImage: `linear-gradient(180deg, rgba(15, 118, 110, 0.08), rgba(15, 118, 110, 0.26)), url(${heroImage})` }}
            aria-hidden="true"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric icon={FileText} label="Avis publiés" value={stats.totalAvis} />
        <Metric icon={ThumbsUp} label="Votes utiles" value={stats.totalVotes} />
        <Metric icon={Megaphone} label="Pétitions" value={stats.petitions} />
        <Metric icon={AlertCircle} label="Signalés" value={stats.signales} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <FiltreBar
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            avisList={avisList}
          />

          {error && (
            <div className="surface flex flex-col gap-3 border-[color-mix(in_srgb,var(--color-danger)_34%,transparent)] p-4 text-sm sm:flex-row sm:items-center">
              <AlertCircle className="h-5 w-5 shrink-0 text-[var(--color-danger)]" />
              <p className="flex-1 font-semibold text-[var(--color-danger)]">{error}</p>
              <button type="button" onClick={fetchAvis} className="btn-secondary">
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-white-off">Fil public</h2>
              <p className="text-sm text-muted">
                Du plus récent au plus ancien, selon les filtres actifs.
              </p>
            </div>
            <button type="button" onClick={fetchAvis} disabled={loading} className="btn-secondary">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {loading && avisList.length === 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="surface h-48 animate-pulse p-5">
                  <div className="mb-5 h-6 w-2/3 rounded bg-[var(--color-elevated)]" />
                  <div className="mb-3 h-4 rounded bg-[var(--color-elevated)]" />
                  <div className="mb-7 h-4 w-5/6 rounded bg-[var(--color-elevated)]" />
                  <div className="h-10 w-28 rounded bg-[var(--color-elevated)]" />
                </div>
              ))}
            </div>
          ) : avisList.length === 0 ? (
            <div className="surface p-10 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-9 w-9 text-brand" />
              <p className="font-bold text-white-off">Aucun avis pour cette sélection.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedType(null);
                }}
                className="btn-ghost mt-3"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {avisList.map((avis) => (
                <AvisCard
                  key={avis.id}
                  avis={avis}
                  onVote={handleVote}
                  onSignale={handleSignale}
                  hasVoted={votedAvisIds.includes(avis.id)}
                  isVoting={votingId === avis.id}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="surface p-5">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand" />
              <h3 className="font-extrabold text-white-off">Session anonyme</h3>
            </div>
            <p className="mb-3 text-sm leading-6 text-muted">
              Le formulaire ne demande ni nom, ni email. Votre signature locale sert seulement à éviter les votes répétés.
            </p>
            <div className="surface-muted flex items-center justify-between gap-3 p-3">
              <span className="min-w-0 truncate text-sm tag-pseudo">{pseudo}</span>
              <button type="button" onClick={handleChangePseudo} className="text-muted hover:text-brand" title="Changer de pseudonyme">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="surface p-5">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand" />
              <h3 className="font-extrabold text-white-off">Sujets chauds</h3>
            </div>
            {topPetitions.length === 0 ? (
              <p className="text-sm leading-6 text-muted">
                Les tendances apparaissent dès qu'un avis reçoit plusieurs votes utiles.
              </p>
            ) : (
              <div className="space-y-3">
                {topPetitions.map((item, index) => (
                  <div key={item.id} className="surface-muted p-3">
                    <div className="mb-1 flex items-center justify-between gap-2 text-xs font-bold">
                      <span className="text-brand">Priorité #{index + 1}</span>
                      <span className="text-muted">{item.votes} votes</span>
                    </div>
                    <p className="line-clamp-2 text-sm text-white-off">{item.contenu}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="surface p-5">
            <h3 className="mb-3 font-extrabold text-white-off">Charte rapide</h3>
            <ul className="space-y-2 text-sm leading-6 text-muted">
              <li>Pas de nom propre, téléphone ou email dans les messages.</li>
              <li>Un avis à 10 votes devient une pétition visible.</li>
              <li>Tout abus peut être signalé puis modéré.</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold text-muted">{label}</span>
        <Icon className="h-5 w-5 text-brand" />
      </div>
      <div className="text-3xl font-extrabold tracking-tight text-white-off">{value}</div>
    </div>
  );
}
