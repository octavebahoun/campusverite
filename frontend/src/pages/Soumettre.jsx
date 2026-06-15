import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  Building,
  CheckCircle2,
  FileText,
  Flame,
  GraduationCap,
  Lightbulb,
  Send,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { API_BASE } from '../config';
import { getOrCreatePseudo } from '../utils/pseudo';

const CATEGORIES = [
  { name: 'Pédagogie', icon: GraduationCap },
  { name: 'Infrastructure', icon: Building },
  { name: 'Administration', icon: FileText },
  { name: 'Équipements', icon: Wrench },
];

export default function Soumettre() {
  const navigate = useNavigate();
  const [categorie, setCategorie] = useState(CATEGORIES[0].name);
  const [type, setType] = useState('coup_de_gueule');
  const [contenu, setContenu] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const pseudo = getOrCreatePseudo();

  const remaining = useMemo(() => Math.max(10 - contenu.trim().length, 0), [contenu]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (contenu.trim().length < 10) {
      setError('Le contenu doit faire au moins 10 caractères.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/avis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categorie, type, contenu: contenu.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur de soumission');
      }

      setSuccess(true);
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err.message || "Impossible de soumettre l'avis. Vérifiez la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: 'easeOut' }}
      className="mx-auto max-w-5xl space-y-5"
    >
      <Link to="/" className="btn-ghost w-fit">
        <ArrowLeft className="h-4 w-4" />
        Retour au fil public
      </Link>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: 'easeOut' }}
          className="surface p-5 md:p-7"
        >
          <div className="mb-6">
            <p className="mb-2 text-sm font-extrabold text-brand">Soumission anonyme</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-white-off md:text-3xl">
              Déposer un avis sans identité.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              Votre message sera publié avec un pseudonyme de session, jamais avec un nom, email ou numéro.
            </p>
          </div>

          <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="surface-muted p-8 text-center"
            >
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-success" />
              <h2 className="text-xl font-extrabold text-white-off">Avis publié</h2>
              <p className="mt-2 text-sm text-muted">Redirection vers le fil public...</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <fieldset className="space-y-3">
                <legend className="text-sm font-extrabold text-white-off">Catégorie</legend>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    const active = categorie === category.name;
                    return (
                      <motion.button
                        key={category.name}
                        type="button"
                        onClick={() => setCategorie(category.name)}
                        whileTap={{ scale: 0.98 }}
                        className={`min-h-20 rounded-md border p-3 text-left transition ${
                          active
                            ? 'border-brand bg-[rgba(var(--color-brand-rgb),0.1)] text-brand'
                            : 'border-[var(--color-border)] text-muted hover:border-[rgba(var(--color-brand-rgb),0.45)] hover:text-brand'
                        }`}
                      >
                        <Icon className="mb-2 h-5 w-5" />
                        <span className="block text-sm font-extrabold">{category.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-sm font-extrabold text-white-off">Type de publication</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  <motion.button
                    type="button"
                    onClick={() => setType('coup_de_gueule')}
                    whileTap={{ scale: 0.98 }}
                    className={`rounded-md border p-4 text-left transition ${
                      type === 'coup_de_gueule'
                        ? 'border-[color-mix(in_srgb,var(--color-danger)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)]'
                        : 'border-[var(--color-border)] text-muted hover:text-white-off'
                    }`}
                  >
                    <Flame className="mb-2 h-5 w-5" />
                    <span className="block font-extrabold">Coup de gueule</span>
                    <span className="mt-1 block text-sm text-muted">Un problème concret à rendre visible.</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => setType('suggestion')}
                    whileTap={{ scale: 0.98 }}
                    className={`rounded-md border p-4 text-left transition ${
                      type === 'suggestion'
                        ? 'border-[color-mix(in_srgb,var(--color-success)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-success'
                        : 'border-[var(--color-border)] text-muted hover:text-white-off'
                    }`}
                  >
                    <Lightbulb className="mb-2 h-5 w-5" />
                    <span className="block font-extrabold">Suggestion</span>
                    <span className="mt-1 block text-sm text-muted">Une idée d'amélioration pour le campus.</span>
                  </motion.button>
                </div>
              </fieldset>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="message-body" className="text-sm font-extrabold text-white-off">
                    Message
                  </label>
                  <span className="text-xs font-semibold text-muted">
                    {remaining > 0 ? `${remaining} caractères minimum restants` : `${contenu.length} caractères`}
                  </span>
                </div>
                <textarea
                  id="message-body"
                  value={contenu}
                  onChange={(e) => setContenu(e.target.value)}
                  placeholder="Décrivez clairement le problème ou la proposition, sans citer de personne identifiable."
                  rows={8}
                  required
                  className="input-custom resize-none"
                />
              </div>

              <div className="surface-muted flex items-start gap-3 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-warning)]" />
                <p className="text-sm leading-6 text-muted">
                  Ne publiez pas de nom propre, adresse, email, numéro de téléphone ou accusation personnelle. Le fond du problème suffit au suivi.
                </p>
              </div>

              {error && (
                <div className="rounded-md border border-[color-mix(in_srgb,var(--color-danger)_34%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] p-3 text-sm font-bold text-[var(--color-danger)]">
                  {error}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading || contenu.trim().length < 10}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Publier anonymement
                  </>
                )}
              </motion.button>
            </motion.form>
          )}
          </AnimatePresence>
        </motion.section>

        <aside className="space-y-4">
          <div className="surface p-5">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand" />
              <h2 className="font-extrabold text-white-off">Charte avant publication</h2>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-muted">
              <li>Aucun champ nom ou email n'est collecté.</li>
              <li>Le message doit viser une situation, pas une personne.</li>
              <li>Les avis inappropriés peuvent être signalés.</li>
              <li>Les avis très soutenus deviennent des pétitions.</li>
            </ul>
          </div>

          <div className="surface p-5">
            <p className="mb-2 text-sm font-bold text-muted">Votre signature locale</p>
            <div className="surface-muted p-3 tag-pseudo">{pseudo}</div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
