import React from 'react';

// Generates a consistent hash number from a string
function stringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

const AVATAR_COLORS = [
  'bg-brand/20 text-brand border-brand/35',
  'bg-success/20 text-success border-success/35',
  'bg-info/20 text-info border-info/35',
  'bg-amber-500/20 text-amber-400 border-amber-500/35',
  'bg-teal-500/20 text-teal-400 border-teal-500/35',
  'bg-indigo-500/20 text-indigo-400 border-indigo-500/35',
  'bg-purple-500/20 text-purple-400 border-purple-500/35'
];

export default function MessageBubble({ message, currentPseudo }) {
  const { pseudo, contenu, created_at } = message;
  
  const isMe = pseudo === currentPseudo;
  const isSystem = pseudo === "Système" || pseudo === "system";

  // Pick color based on pseudonym hash
  const colorIndex = stringHash(pseudo) % AVATAR_COLORS.length;
  const avatarStyle = AVATAR_COLORS[colorIndex];

  // Format Date
  const timeStr = React.useMemo(() => {
    try {
      const date = new Date(created_at);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "";
    }
  }, [created_at]);

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="bg-[#1A1A1A] border border-white/8 px-4 py-1.5 rounded-sm text-xs text-muted font-medium tracking-wide">
          📢 {contenu}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full my-2 items-end space-x-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
      
      {/* Avatar for other users */}
      {!isMe && (
        <div className={`w-8 h-8 rounded-sm border text-xs font-extrabold flex items-center justify-center select-none shrink-0 ${avatarStyle}`}>
          {pseudo.charAt(0)}
        </div>
      )}

      {/* Message Bubble Container */}
      <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        
        {/* Username/Pseudo */}
        {!isMe && (
          <span className="text-[10px] tag-pseudo mb-1 ml-1">
            {pseudo}
          </span>
        )}

        {/* Bubble */}
        <div className={`px-4 py-2.5 rounded-sm text-sm leading-relaxed break-words text-left ${
          isMe 
            ? 'bg-brand/10 text-white-off border border-brand/25' 
            : 'bg-[#1A1A1A] text-white-off border border-white/8'
        }`}>
          {contenu}
        </div>

        {/* Time Stamp */}
        <span className="text-[9px] text-muted font-mono mt-1 px-1">
          {timeStr}
        </span>
      </div>

      {/* Avatar for Current User */}
      {isMe && (
        <div className="w-8 h-8 rounded-sm border text-xs font-extrabold flex items-center justify-center bg-brand/20 text-brand border-brand/30 select-none shrink-0">
          {pseudo.charAt(0)}
        </div>
      )}

    </div>
  );
}
