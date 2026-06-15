import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getOrCreatePseudo } from '../utils/pseudo';
import { ArrowLeft, AlertTriangle, Send, CheckCircle } from 'lucide-react';
import { API_BASE } from '../config';

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
    <div className="max-w-[760px] mx-auto px-4 py-8 space-y-6">
      
      {/* Back to Feed */}
      <Link 
        to="/" 
        className="flex items-center space-x-2 text-muted hover:text-white-off transition-colors duration-200 text-sm w-fit font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour au fil d'actualité</span>
      </Link>

      <div className="bg-surface p-8 rounded-[20px] border border-white/8 space-y-6 relative overflow-hidden">
        {/* Decorative subtle brand gradient accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-3xl pointer-events-none rounded-full" />
        
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white-off font-display tracking-wide uppercase">
            Exprimer un avis anonyme
          </h1>
          <p className="text-xs md:text-sm text-muted font-sans">
            Votre publication sera associée au pseudonyme de session <span className="tag-pseudo">{pseudo}</span>.
          </p>
        </div>

        {/* Success Alert */}
        {success ? (
          <div className="p-6 rounded-sm bg-success/10 border border-success/20 text-center space-y-3 flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-success animate-bounce" />
            <h3 className="text-lg font-bold text-white-off font-display uppercase tracking-wider">Avis publié avec succès !</h3>
            <p className="text-sm text-muted">Redirection vers le fil d'actualité...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Category Select */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted font-display">
                Catégorie
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategorie(cat)}
                    className={`py-2.5 px-3 rounded-sm text-xs font-bold font-display border transition-all duration-200 ${
                      categorie === cat
                        ? 'bg-brand/10 border-brand/40 text-brand'
                        : 'bg-[#1A1A1A] border-white/5 text-muted hover:border-white/10 hover:text-white-off'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Choice (suggestion vs coup de gueule) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted font-display">
                Format de l'avis
              </label>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setType('coup_de_gueule')}
                  className={`flex-1 py-3 px-4 rounded-sm text-xs font-bold font-display border transition-all duration-200 flex items-center justify-center space-x-2 ${
                    type === 'coup_de_gueule'
                      ? 'bg-brand/15 border-brand/40 text-brand'
                      : 'bg-[#1A1A1A] border-white/5 text-muted hover:border-white/10'
                  }`}
                >
                  <span>😡</span>
                  <span>Coup de gueule</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('suggestion')}
                  className={`flex-1 py-3 px-4 rounded-sm text-xs font-bold font-display border transition-all duration-200 flex items-center justify-center space-x-2 ${
                    type === 'suggestion'
                      ? 'bg-success/15 border-success/40 text-success'
                      : 'bg-[#1A1A1A] border-white/5 text-muted hover:border-white/10'
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
                <label htmlFor="message-body" className="block text-xs font-bold uppercase tracking-wider text-muted font-display">
                  Votre message
                </label>
                <span className="text-[10px] text-muted font-mono">
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
                className="input-custom resize-none"
              />
            </div>

            {/* Safety & Anonymity warning banner */}
            <div className="p-4 rounded-sm bg-[#1A1A1A] border border-white/8 flex items-start space-x-3 text-amber-300">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-brand" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wide font-display text-white-off">Règles d'Anonymat Strictes</h4>
                <p className="text-[11px] text-muted leading-relaxed font-sans">
                  Ne mentionnez aucun nom propre (étudiant, professeur, administrateur) ni adresse email ou numéro de téléphone. Tout contenu jugé diffamatoire, insultant ou contenant des données personnelles sera masqué et modéré.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-sm border border-brand/20 bg-brand/5 text-brand text-xs font-semibold font-sans">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || contenu.trim().length < 10}
              className="btn-primary w-full py-3"
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
