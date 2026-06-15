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
  'bg-red-500/20 text-red-400 border-red-500/30',
  'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'bg-sky-500/20 text-sky-400 border-sky-500/30',
  'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
  'bg-pink-500/20 text-pink-400 border-pink-500/30'
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
        <div className="bg-slate-900/60 border border-slate-800/80 px-4 py-1.5 rounded-full text-xs text-slate-400 font-medium tracking-wide">
          📢 {contenu}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full my-2 items-end space-x-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
      
      {/* Avatar for other users */}
      {!isMe && (
        <div className={`w-8 h-8 rounded-full border text-xs font-extrabold flex items-center justify-center select-none shrink-0 ${avatarStyle}`}>
          {pseudo.charAt(0)}
        </div>
      )}

      {/* Message Bubble Container */}
      <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        
        {/* Username/Pseudo */}
        {!isMe && (
          <span className="text-[10px] text-slate-400 font-semibold mb-1 ml-1">
            {pseudo}
          </span>
        )}

        {/* Bubble */}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words text-left ${
          isMe 
            ? 'bg-purple-600 text-white rounded-br-none shadow-md shadow-purple-600/10' 
            : 'bg-slate-900 text-slate-100 border border-slate-850 rounded-bl-none'
        }`}>
          {contenu}
        </div>

        {/* Time Stamp */}
        <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
          {timeStr}
        </span>
      </div>

      {/* Avatar for Current User */}
      {isMe && (
        <div className="w-8 h-8 rounded-full border text-xs font-extrabold flex items-center justify-center bg-purple-500/20 text-purple-400 border-purple-500/30 select-none shrink-0">
          M
        </div>
      )}

    </div>
  );
}
