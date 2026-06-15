import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getOrCreatePseudo } from '../utils/pseudo';
import MessageBubble from '../components/MessageBubble';
import { 
  Send, Plus, MessageSquare, Users, User, Hash, 
  ArrowLeft, RefreshCw, Volume2, ShieldAlert, Sparkles, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config';

export default function Chat() {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsgContent, setNewMsgContent] = useState('');
  
  // Modals / forms / list
  const [newRoomType, setNewRoomType] = useState('dm');
  const [newRoomMembres, setNewRoomMembres] = useState('');
  const [createError, setCreateError] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [onlinePseudos, setOnlinePseudos] = useState([]);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const pseudo = getOrCreatePseudo();

  // 1. Fetch rooms on load
  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await fetch(`${API_BASE}/api/rooms?pseudo=${encodeURIComponent(pseudo)}`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
        // Auto-select first room if none selected
        if (data.length > 0 && !currentRoom) {
          setCurrentRoom(data[0]);
        }
      }
    } catch (err) {
      console.error("Error loading rooms:", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [pseudo]);

  // 2. Setup Socket.io connection (once on mount)
  useEffect(() => {
    socketRef.current = io(API_BASE);

    socketRef.current.on('connect', () => {
      console.log('🔌 Connecté au serveur WebSocket.');
      // Register current user pseudonym on the backend socket
      socketRef.current.emit('register_user', pseudo);
    });

    socketRef.current.on('online_users', (pseudos) => {
      setOnlinePseudos(pseudos);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [pseudo]);

  // 2b. Listen for incoming messages
  useEffect(() => {
    if (!socketRef.current) return;

    const handler = (msg) => {
      if (currentRoom && msg.room_id.toString() === currentRoom._id.toString()) {
        setMessages((prev) => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socketRef.current.on('receive_message', handler);

    return () => {
      socketRef.current.off('receive_message', handler);
    };
  }, [currentRoom]);

  // 3. Handle changing rooms
  useEffect(() => {
    if (!currentRoom) return;

    // Join room in socket
    if (socketRef.current) {
      socketRef.current.emit('join_room', currentRoom._id);
    }

    // Fetch messages for room
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`${API_BASE}/api/rooms/${currentRoom._id}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [currentRoom]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingMessages]);

  // 4. Send Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMsgContent.trim() || !currentRoom) return;

    const msgData = {
      room_id: currentRoom._id,
      pseudo: pseudo,
      contenu: newMsgContent.trim()
    };

    if (socketRef.current) {
      socketRef.current.emit('send_message', msgData);
    }

    setNewMsgContent('');
  };

  // 5. Create room via manual inputs
  const handleCreateRoom = async (e) => {
    if (e) e.preventDefault();
    setCreateError('');
    
    if (!newRoomMembres.trim()) {
      setCreateError("Veuillez renseigner les membres.");
      return;
    }

    const membersList = newRoomMembres.split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    if (!membersList.includes(pseudo)) {
      membersList.push(pseudo);
    }

    try {
      const res = await fetch(`${API_BASE}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newRoomType,
          membres: membersList
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur de création du salon");
      }

      const createdRoom = await res.json();
      setRooms(prev => {
        if (prev.some(r => r._id === createdRoom._id)) return prev;
        return [createdRoom, ...prev];
      });
      setCurrentRoom(createdRoom);
      setNewRoomMembres('');
      setCreateError('');
    } catch (err) {
      setCreateError(err.message);
    }
  };

  // 6. Direct click to start DM with an online user
  const handleStartDM = async (targetPseudo) => {
    if (targetPseudo === pseudo) return;
    try {
      const res = await fetch(`${API_BASE}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'dm',
          membres: [pseudo, targetPseudo]
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors du ciblage du salon.");
      }

      const room = await res.json();
      setRooms(prev => {
        if (prev.some(r => r._id === room._id)) return prev;
        return [room, ...prev];
      });
      setCurrentRoom(room);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Exclude current user from online users list
  const activeOnlineUsers = onlinePseudos.filter(p => p !== pseudo);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-140px)] min-h-[550px] flex flex-col">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <Link to="/" className="flex items-center space-x-2 text-muted hover:text-white-off transition-colors duration-200 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Fil d'actualité</span>
        </Link>
        <div className="text-right">
          <span className="text-xs text-muted">Pseudo de session : </span>
          <span className="text-xs tag-pseudo font-bold">{pseudo}</span>
        </div>
      </div>

      {/* Main Chat Layout Container */}
      <div className="flex-1 flex flex-col md:flex-row bg-surface rounded-[20px] border border-white/8 overflow-hidden min-h-0">
        
        {/* LEFT COLUMN: Rooms List, Active Users & Creation */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/8 flex flex-col h-1/2 md:h-full min-h-0 bg-abyssal/20">
          
          {/* Header */}
          <div className="p-4 border-b border-white/8 flex items-center justify-between bg-surface">
            <h2 className="text-sm font-bold text-white-off flex items-center space-x-2 font-display uppercase tracking-wider">
              <MessageSquare className="w-4 h-4 text-brand" />
              <span>Salons de chat</span>
            </h2>
            <button 
              onClick={fetchRooms}
              className="p-1 text-muted hover:text-white-off transition-colors cursor-pointer"
              title="Rafraîchir"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rooms Navigation List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
            {loadingRooms && rooms.length === 0 ? (
              <p className="text-xs text-muted p-4 text-center">Chargement...</p>
            ) : rooms.length === 0 ? (
              <p className="text-xs text-muted p-4 text-center">Aucun salon de chat actif.</p>
            ) : (
              rooms.map((room) => {
                const isSelected = currentRoom?._id === room._id;
                const displayMembres = room.membres
                  .filter(m => m !== pseudo)
                  .join(', ') || 'Général';

                return (
                  <button
                    key={room._id}
                    onClick={() => setCurrentRoom(room)}
                    className={`w-full text-left p-3 rounded-sm transition-all duration-200 flex items-center space-x-3 border cursor-pointer ${
                      isSelected
                        ? 'bg-brand/10 border-brand/20 text-brand'
                        : 'bg-transparent border-transparent text-muted hover:bg-surface hover:text-white-off'
                    }`}
                  >
                    {room.type === 'dm' ? (
                      <User className={`w-4 h-4 ${isSelected ? 'text-brand' : 'text-muted'}`} />
                    ) : (
                      <Users className={`w-4 h-4 ${isSelected ? 'text-brand' : 'text-muted'}`} />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">
                        {room.type === 'group' ? `Groupe (${room.membres.length})` : displayMembres}
                      </div>
                      <div className="text-[10px] text-muted font-mono truncate">
                        {room.type === 'group' ? room.membres.join(', ') : 'Messagerie privée'}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* ONLINE ACTIVE USERS WIDGET (Preserves Anonymity, enables direct selection) */}
          <div className="border-t border-white/8 p-4 bg-abyssal/30 min-h-[120px] max-h-[160px] overflow-y-auto flex flex-col">
            <div className="text-[10px] font-bold text-muted uppercase tracking-wider font-display mb-2 flex items-center justify-between">
              <span>Utilisateurs Connectés</span>
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="font-mono text-[9px] lowercase text-green-500">{onlinePseudos.length} en ligne</span>
              </span>
            </div>

            {activeOnlineUsers.length === 0 ? (
              <p className="text-[10px] text-muted italic my-auto text-center">
                Aucun autre utilisateur en ligne.
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {activeOnlineUsers.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleStartDM(p)}
                    className="w-full text-left flex items-center justify-between py-1 px-2 rounded-sm bg-surface/50 border border-white/5 hover:border-brand/40 text-[11px] transition-colors cursor-pointer group"
                    title={`Lancer un chat privé anonyme avec ${p}`}
                  >
                    <span className="tag-pseudo text-[11px] group-hover:underline">{p}</span>
                    <span className="text-[9px] text-muted font-sans group-hover:text-brand flex items-center space-x-1">
                      <span>Discuter</span>
                      <Plus className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create Room Form (Bottom of Left Pane) */}
          <div className="p-4 border-t border-white/8 bg-surface">
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div className="text-[11px] font-bold text-muted uppercase tracking-wider font-display">
                Nouveau salon manuel
              </div>
              
              <div className="flex bg-abyssal p-0.5 rounded-sm border border-white/8">
                <button
                  type="button"
                  onClick={() => setNewRoomType('dm')}
                  className={`flex-1 py-1 rounded-sm text-[10px] font-bold font-display transition-all cursor-pointer ${
                    newRoomType === 'dm' ? 'bg-surface text-white-off border border-white/5' : 'text-muted'
                  }`}
                >
                  Direct Msg
                </button>
                <button
                  type="button"
                  onClick={() => setNewRoomType('group')}
                  className={`flex-1 py-1 rounded-sm text-[10px] font-bold font-display transition-all cursor-pointer ${
                    newRoomType === 'group' ? 'bg-surface text-white-off border border-white/5' : 'text-muted'
                  }`}
                >
                  Groupe
                </button>
              </div>

              <div className="space-y-1">
                <input
                  type="text"
                  placeholder={newRoomType === 'dm' ? "Ex: Loup#8214" : "Ex: Renard#12, Tigre#44"}
                  value={newRoomMembres}
                  onChange={(e) => setNewRoomMembres(e.target.value)}
                  className="input-custom py-1.5 text-xs"
                />
              </div>

              {createError && (
                <div className="text-[10px] text-brand font-bold">{createError}</div>
              )}

              <button
                type="submit"
                className="w-full py-1.5 rounded-sm bg-brand hover:opacity-90 text-white text-xs font-bold font-display transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Créer le salon</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Messages & Message Input */}
        <div className="flex-1 flex flex-col h-1/2 md:h-full min-h-0 bg-transparent">
          {currentRoom ? (
            <>
              {/* Active Room Title Header */}
              <div className="p-4 border-b border-white/8 flex items-center justify-between bg-surface">
                <div>
                  <div className="text-xs font-bold text-white-off flex items-center space-x-1.5 font-display uppercase tracking-wide">
                    <span>💬</span>
                    <span>
                      {currentRoom.type === 'group' 
                        ? `Salon Groupe (${currentRoom.membres.join(', ')})` 
                        : `Discussion avec ${currentRoom.membres.filter(m => m !== pseudo).join(', ') || 'moi-même'}`}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted font-mono">
                    ID Salon : {currentRoom._id}
                  </div>
                </div>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-abyssal/10">
                {loadingMessages ? (
                  <div className="text-center text-xs text-muted py-8 font-mono animate-pulse">
                    Chargement des messages chiffrés...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-xs text-muted font-semibold">Aucun message ici. Lancez la discussion !</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg._id} className="chat-message-anim">
                      <MessageBubble 
                        message={msg} 
                        currentPseudo={pseudo} 
                      />
                    </div>
                  ))
                )}
                {/* Scroll Anchor */}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input form (Bottom of Right Pane) */}
              <div className="p-4 border-t border-white/8 bg-surface">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Écrire un message anonyme..."
                    value={newMsgContent}
                    onChange={(e) => setNewMsgContent(e.target.value)}
                    className="flex-1 input-custom"
                  />
                  <button
                    type="submit"
                    disabled={!newMsgContent.trim()}
                    className="btn-primary py-2.5 px-4 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-abyssal/5">
              <MessageSquare className="w-12 h-12 text-muted mb-4 animate-bounce" />
              <h3 className="text-sm font-bold text-white-off font-display uppercase tracking-wider">Sélectionnez un salon</h3>
              <p className="text-xs text-muted font-sans mt-2 max-w-xs">
                Sélectionnez un salon à gauche ou cliquez sur un membre connecté pour démarrer une messagerie privée anonyme.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
