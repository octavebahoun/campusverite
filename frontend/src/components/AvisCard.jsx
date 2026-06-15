import React, { useState } from 'react';
import { ThumbsUp, AlertTriangle, GraduationCap, Building, Wrench, FileText, CheckCircle2 } from 'lucide-react';

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

  // Bonus feature: If votes >= 10 -> badge "Pétition"
  const isPetition = votes >= 10;

  return (
    <div className={`p-6 rounded-2xl glass glass-hover transition-all duration-300 border ${
      signale ? 'border-rose-950 bg-rose-950/5' : 'border-slate-800'
    } relative overflow-hidden`}>
      
      {/* Petition gradient glow background */}
      {isPetition && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl pointer-events-none rounded-full" />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2">
          {/* Category Tag */}
          <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
            <CategoryIcon className="w-3.5 h-3.5" />
            <span>{categorie}</span>
          </div>

          {/* Type Tag */}
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
            type === 'coup_de_gueule' 
              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25' 
              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
          }`}>
            {type === 'coup_de_gueule' ? '😡 Coup de gueule' : '💡 Suggestion'}
          </span>
        </div>

        {/* Date */}
        <span className="text-xs text-slate-500 font-mono">{dateStr}</span>
      </div>

      {/* Main Content */}
      <p className={`text-slate-200 leading-relaxed text-sm text-left break-words mb-6 whitespace-pre-line ${
        signale ? 'line-through text-slate-500 select-none' : ''
      }`}>
        {signale ? "Ce contenu a été masqué temporairement car il a été signalé par des étudiants." : contenu}
      </p>

      {/* Bottom bar */}
      <div className="flex items-center justify-between border-t border-slate-900 pt-4 mt-auto">
        <div className="flex items-center space-x-3">
          {/* Vote Button */}
          <button
            onClick={() => !hasVoted && onVote(id)}
            disabled={hasVoted || isVoting || signale}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
              hasVoted 
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 cursor-default'
                : signale
                ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-purple-950/20 hover:border-purple-500/30 hover:text-purple-400 active:scale-95'
            }`}
          >
            {hasVoted ? (
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
            ) : (
              <ThumbsUp className="w-4 h-4" />
            )}
            <span className="font-mono font-bold text-sm">{votes}</span>
            <span className="text-[10px] opacity-80">{hasVoted ? 'Utile voté' : 'Utile'}</span>
          </button>

          {/* Petition badge if votes >= 10 */}
          {isPetition && (
            <span className="relative flex h-6 w-fit items-center justify-center rounded-full bg-purple-500/10 px-3 text-[10px] font-bold uppercase tracking-wider text-purple-400 border border-purple-500/30 animate-pulse">
              🔥 Pétition
            </span>
          )}
        </div>

        {/* Flag Button */}
        <button
          onClick={() => onSignale(id)}
          title={signale ? "Annuler le signalement" : "Signaler comme abus"}
          className={`p-2 rounded-xl border transition-all duration-200 ${
            signale 
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
              : 'bg-slate-900 border-slate-850 text-slate-500 hover:border-rose-500/30 hover:text-rose-400 hover:bg-rose-950/10'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
