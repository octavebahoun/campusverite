import { useMemo } from 'react';
import { motion } from 'framer-motion';

function stringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

const AVATAR_COLORS = [
  'bg-[rgba(var(--color-brand-rgb),0.12)] text-brand border-[rgba(var(--color-brand-rgb),0.3)]',
  'bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-success border-[color-mix(in_srgb,var(--color-success)_30%,transparent)]',
  'bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-info border-[color-mix(in_srgb,var(--color-info)_30%,transparent)]',
  'bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_30%,transparent)]',
];

export default function MessageBubble({ message, currentPseudo }) {
  const { pseudo, contenu, created_at } = message;
  const isMe = pseudo === currentPseudo;
  const isSystem = pseudo === 'Système' || pseudo === 'system';
  const avatarStyle = AVATAR_COLORS[stringHash(pseudo || '') % AVATAR_COLORS.length];

  const timeStr = useMemo(() => {
    try {
      return new Date(created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }, [created_at]);

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-3 flex justify-center"
      >
        <div className="surface-muted px-3 py-2 text-xs font-semibold text-muted">
          {contenu}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`my-2 flex w-full items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
    >
      {!isMe && (
        <div className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border text-xs font-extrabold ${avatarStyle}`}>
          {(pseudo || '?').charAt(0)}
        </div>
      )}

      <div className={`flex max-w-[78%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && <span className="mb-1 ml-1 text-xs tag-pseudo">{pseudo}</span>}
        <div className={`rounded-md border px-4 py-2.5 text-left text-sm leading-6 shadow-sm ${
          isMe
            ? 'border-[rgba(var(--color-brand-rgb),0.28)] bg-[rgba(var(--color-brand-rgb),0.1)] text-white-off'
            : 'border-[var(--color-border)] bg-surface text-white-off'
        }`}>
          {contenu}
        </div>
        <span className="mt-1 px-1 text-[11px] font-semibold text-muted">{timeStr}</span>
      </div>

      {isMe && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border border-[rgba(var(--color-brand-rgb),0.28)] bg-[rgba(var(--color-brand-rgb),0.12)] text-xs font-extrabold text-brand">
          {(pseudo || '?').charAt(0)}
        </div>
      )}
    </motion.div>
  );
}
