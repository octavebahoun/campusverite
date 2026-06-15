import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  FileText,
  Flame,
  GraduationCap,
  Lightbulb,
  Megaphone,
  ThumbsUp,
  Wrench,
} from 'lucide-react';

const CATEGORY_MAP = {
  Pédagogie: { icon: GraduationCap },
  Infrastructure: { icon: Building },
  Administration: { icon: FileText },
  Équipements: { icon: Wrench },
};

export default function AvisCard({ avis, onVote, onSignale, hasVoted, isVoting }) {
  const { id, categorie, type, contenu, votes = 0, signale = false, created_at } = avis;
  const isPetition = votes >= 10;
  const isSuggestion = type === 'suggestion';
  const CategoryIcon = CATEGORY_MAP[categorie]?.icon || FileText;

  const dateStr = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(created_at));
    } catch {
      return 'Date inconnue';
    }
  }, [created_at]);

  const handleVoteClick = () => {
    if (!hasVoted && !isVoting && !signale && onVote) onVote(id);
  };

  return (
    <motion.article
      layout
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.26, ease: 'easeOut' } },
      }}
      whileHover={{ y: -3 }}
      className={`avis-card-custom flex min-h-[230px] flex-col p-5 ${isPetition ? 'animate-petition-border' : ''}`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <span className="badge text-muted">
            <CategoryIcon className="h-3.5 w-3.5 text-brand" />
            {categorie}
          </span>
          <span className={`badge ${isSuggestion ? 'badge-sug' : 'badge-coup'}`}>
            {isSuggestion ? <Lightbulb className="h-3.5 w-3.5" /> : <Flame className="h-3.5 w-3.5" />}
            {isSuggestion ? 'Suggestion' : 'Coup de gueule'}
          </span>
          {isPetition && (
            <span className="badge badge-pet">
              <Megaphone className="h-3.5 w-3.5" />
              Pétition
            </span>
          )}
        </div>
        <time className="text-xs font-semibold text-muted">{dateStr}</time>
      </div>

      <p className={`mb-5 flex-1 whitespace-pre-line break-words text-sm leading-7 text-white-off ${signale ? 'select-none text-muted line-through opacity-70' : ''}`}>
        {signale
          ? 'Ce contenu est masqué temporairement après signalement.'
          : contenu}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--color-soft-border)] pt-4">
        <motion.button
          type="button"
          onClick={handleVoteClick}
          disabled={hasVoted || isVoting || signale}
          whileTap={{ scale: 0.96 }}
          className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-sm font-extrabold transition ${
            hasVoted
              ? 'border-[color-mix(in_srgb,var(--color-success)_34%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-success'
              : 'border-[var(--color-border)] text-white-off hover:border-[rgba(var(--color-brand-rgb),0.5)] hover:text-brand'
          }`}
        >
          {hasVoted ? <CheckCircle2 className="h-4 w-4 animate-vote" /> : <ThumbsUp className="h-4 w-4" />}
          <span>{votes}</span>
          <span className="text-xs font-bold">{hasVoted ? 'Voté' : 'Utile'}</span>
        </motion.button>

        <motion.button
          type="button"
          onClick={() => onSignale(id)}
          whileTap={{ scale: 0.94 }}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-md border transition ${
            signale
              ? 'border-[color-mix(in_srgb,var(--color-danger)_38%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)]'
              : 'border-[var(--color-border)] text-muted hover:border-[color-mix(in_srgb,var(--color-danger)_38%,transparent)] hover:text-[var(--color-danger)]'
          }`}
          title="Signaler comme abus"
        >
          <AlertTriangle className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.article>
  );
}
