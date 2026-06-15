import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getOrCreatePseudo } from '../utils/pseudo';
import { ArrowLeft, AlertTriangle, Send, CheckCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const CATEGORIES = ["Pédagogie", "Infrastructure", "Administration", "Équipements"];

export default function Soumettre() {
  const navigate = useNavigate();
  const [categorie, setCategorie] = useState(CATEGORIES[0]);
  const [type, setType] = useState('coup_de_gueule');
  const [contenu, setContenu] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const pseudo = getOrCreatePseudo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contenu.trim()) return;

    if (contenu.trim().length < 10) {
      setError("Le contenu doit faire au moins 10 caractères.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/avis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categorie, type, contenu: contenu.trim() })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur de soumission");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.message || "Impossible de soumettre l'avis. Vérifiez la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      
      {/* Back to Feed */}
      <Link 
        to="/" 
        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200 text-sm w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour au fil d'actualité</span>
      </Link>

      <div className="glass p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-3xl pointer-events-none rounded-full" />
        
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Exprimer un avis anonyme
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Votre publication sera associée au pseudonyme de session <span className="font-mono text-purple-400 font-bold">{pseudo}</span>.
          </p>
        </div>

        {/* Success Alert */}
        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3 flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 animate-bounce" />
            <h3 className="text-lg font-bold text-white">Avis publié avec succès !</h3>
            <p className="text-sm text-slate-400">Redirection vers le fil d'actualité...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Category Select */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Catégorie
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategorie(cat)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                      categorie === cat
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Choice (suggestion vs coup de gueule) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Format de l'avis
              </label>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setType('coup_de_gueule')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border transition-all duration-200 flex items-center justify-center space-x-2 ${
                    type === 'coup_de_gueule'
                      ? 'bg-rose-500/15 border-rose-500/50 text-rose-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>😡</span>
                  <span>Coup de gueule</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('suggestion')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border transition-all duration-200 flex items-center justify-center space-x-2 ${
                    type === 'suggestion'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>💡</span>
                  <span>Suggestion</span>
                </button>
              </div>
            </div>

            {/* Content Textarea */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <label htmlFor="message-body" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Votre message
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {contenu.length} caractères (min 10)
                </span>
              </div>
              <textarea
                id="message-body"
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                placeholder="Racontez votre expérience ou décrivez votre suggestion..."
                rows={6}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200 resize-none"
              />
            </div>

            {/* Safety & Anonymity warning banner */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start space-x-3 text-amber-300">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wide">Règles d'Anonymat Strictes</h4>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  Ne mentionnez aucun nom propre (étudiant, professeur, administrateur) ni adresse email ou numéro de téléphone. Tout contenu jugé diffamatoire, insultant ou contenant des données personnelles sera masqué et modéré.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || contenido.trim().length < 10}
              className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center space-x-2 transition-all duration-300 ${
                loading || contenido.trim().length < 10
                  ? 'bg-slate-850 text-slate-500 border border-slate-800 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-600/20 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publier l'avis</span>
                </>
              )}
            </button>

          </form>
        )}
      </div>
    </div>
  );
}
