import React from 'react';
import { ThumbsUp, AlertTriangle, GraduationCap, Building, Wrench, FileText, CheckCircle2, Flame, Megaphone } from 'lucide-react';

const CATEGORY_MAP = {
  Pédagogie: { icon: GraduationCap, bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  Infrastructure: { icon: Building, bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
  Administration: { icon: FileText, bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  Équipements: { icon: Wrench, bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' }
};

export default function AvisCard({ avis, onVote, onSignale, hasVoted, isVoting }) {
  const { id, categorie, type, contenu, votes = 0, signale = false, created_at } = avis;
  
  // Format Date
  const dateStr = React.useMemo(() => {
    try {
      const date = new Date(created_at);
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return "Date inconnue";
    }
  }, [created_at]);

  const catStyle = CATEGORY_MAP[categorie] || { icon: FileText, bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };
  const CategoryIcon = catStyle.icon;

  // If votes >= 10 -> badge "Pétition"
  const isPetition = votes >= 10;

  const handleVoteClick = () => {
    if (!hasVoted && onVote) {
      onVote(id);
    }
  };

  return (
    <div 
      className={`p-6 border-l-4 ${
        type === 'coup_de_gueule' ? 'border-l-brand' : 'border-l-success'
      } avis-card-custom relative overflow-hidden flex flex-col justify-between ${
        signale ? 'border-brand/40 bg-brand/5 opacity-80' : ''
      } ${isPetition ? 'animate-petition-border' : ''}`}
    >
      {/* Background radial highlight for hot posts */}
      {isPetition && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl pointer-events-none rounded-full" />
      )}

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center space-x-2">
            {/* Category Tag */}
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-sm border text-[11px] font-semibold ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
              <CategoryIcon className="w-3.5 h-3.5" />
              <span>{categorie}</span>
            </div>

            {/* Type Tag */}
            {type === 'coup_de_gueule' ? (
              <span className="badge-coup px-2.5 py-1 rounded-sm border flex items-center space-x-1">
                <Flame className="w-3 h-3 text-brand" />
                <span>Coup de gueule</span>
              </span>
            ) : (
              <span className="badge-sug px-2.5 py-1 rounded-sm border flex items-center space-x-1">
                <span className="text-xs">💡</span>
                <span>Suggestion</span>
              </span>
            )}
          </div>

          {/* Date */}
          <span className="text-xs text-muted font-mono">{dateStr}</span>
        </div>

        {/* Main Content */}
        <p className={`text-white-off leading-relaxed text-sm text-left break-words mb-6 whitespace-pre-line font-sans ${
          signale ? 'line-through text-muted select-none opacity-50' : ''
        }`}>
          {signale ? "Ce contenu a été masqué temporairement car il a été signalé par des étudiants." : contenu}
        </p>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between border-t border-white/8 pt-4 mt-auto">
        <div className="flex items-center space-x-3">
          {/* Vote Button */}
          <button
            onClick={handleVoteClick}
            disabled={hasVoted || isVoting || signale}
            className={`flex items-center space-x-2 px-4 py-2 rounded-sm text-xs font-semibold transition-all duration-300 border ${
              hasVoted 
                ? 'bg-success/12 border-success/35 text-success cursor-default'
                : signale
                ? 'bg-[#1A1A1A] text-muted border-white/5 cursor-not-allowed'
                : 'bg-[#1A1A1A] border-white/10 text-white-off hover:border-brand/40 hover:text-brand hover:bg-brand/5 active:scale-95'
            }`}
          >
            {hasVoted ? (
              <CheckCircle2 className="w-4 h-4 text-success animate-vote" />
            ) : (
              <ThumbsUp className="w-4 h-4" />
            )}
            <span className="font-mono font-bold text-sm">{votes}</span>
            <span className="text-[10px] opacity-80">{hasVoted ? 'Utile voté' : 'Utile'}</span>
          </button>

          {/* Petition badge if votes >= 10 */}
          {isPetition && (
            <span className="badge-pet px-2.5 py-1 rounded-sm border flex items-center space-x-1">
              <Megaphone className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Pétition</span>
            </span>
          )}
        </div>

        {/* Flag Button */}
        <button
          onClick={() => onSignale(id)}
          title={signale ? "Annuler le signalement" : "Signaler comme abus"}
          className={`p-2 rounded-sm border transition-all duration-200 ${
            signale 
              ? 'bg-brand/20 border-brand/40 text-brand hover:bg-brand/35'
              : 'bg-[#1A1A1A] border-white/10 text-muted hover:border-brand/35 hover:text-brand hover:bg-brand/5'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
