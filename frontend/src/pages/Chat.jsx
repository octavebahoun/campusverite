import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getOrCreatePseudo } from '../utils/pseudo';
import MessageBubble from '../components/MessageBubble';
import { 
  Send, Plus, MessageSquare, Users, User, Hash, 
  ArrowLeft, RefreshCw, Volume2, ShieldAlert 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config';


export default function Chat() {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsgContent, setNewMsgContent] = useState('');
  
  // Modals / forms
  const [newRoomType, setNewRoomType] = useState('dm');
  const [newRoomMembres, setNewRoomMembres] = useState('');
  const [createError, setCreateError] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

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

  // 2. Setup Socket.io connection
  useEffect(() => {
    socketRef.current = io(API_BASE);

    socketRef.current.on('connect', () => {
      console.log('🔌 Connecté au serveur WebSocket.');
    });

    // Listen for incoming messages
    socketRef.current.on('receive_message', (msg) => {
      // Append if the message belongs to the current room
      if (currentRoom && msg.room_id.toString() === currentRoom._id.toString()) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
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

  // 5. Create new room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setCreateError('');
    
    if (!newRoomMembres.trim()) {
      setCreateError("Veuillez renseigner les membres.");
      return;
    }

    // Parse members (comma separated)
    const membersList = newRoomMembres.split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    // Include oneself in members
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
      setRooms(prev => [createdRoom, ...prev]);
      setCurrentRoom(createdRoom);
      setNewRoomMembres('');
      setCreateError('');
    } catch (err) {
      setCreateError(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-120px)] min-h-[500px] flex flex-col">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <Link to="/" className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200 text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Fil d'actualité</span>
        </Link>
        <div className="text-right">
          <span className="text-xs text-slate-400">Pseudo de session : </span>
          <span className="text-xs font-mono font-bold text-purple-400">{pseudo}</span>
        </div>
      </div>

      {/* Main Chat Layout Container */}
      <div className="flex-1 flex flex-col md:flex-row glass rounded-3xl border border-slate-800 overflow-hidden min-h-0">
        
        {/* LEFT COLUMN: Rooms List & Creation */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col h-1/3 md:h-full min-h-0 bg-slate-950/45">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
            <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Salons de chat</span>
            </h2>
            <button 
              onClick={fetchRooms}
              className="p-1 text-slate-500 hover:text-white transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rooms Navigation List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingRooms && rooms.length === 0 ? (
              <p className="text-xs text-slate-600 p-4 text-center">Chargement...</p>
            ) : rooms.length === 0 ? (
              <p className="text-xs text-slate-600 p-4 text-center">Aucun salon. Créez-en un ci-dessous.</p>
            ) : (
              rooms.map((room) => {
                const isSelected = currentRoom?._id === room._id;
                // Exclude current user from members text for DMs
                const displayMembres = room.membres
                  .filter(m => m !== pseudo)
                  .join(', ') || 'Général';

                return (
                  <button
                    key={room._id}
                    onClick={() => setCurrentRoom(room)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center space-x-3 border ${
                      isSelected
                        ? 'bg-purple-600/10 border-purple-500/30 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.05)]'
                        : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                    }`}
                  >
                    {room.type === 'dm' ? (
                      <User className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-slate-500'}`} />
                    ) : (
                      <Users className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-slate-500'}`} />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">
                        {room.type === 'group' ? `Salon Groupe (${room.membres.length})` : displayMembres}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {room.type === 'group' ? room.membres.join(', ') : 'Messagerie directe'}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Create Room Form (Bottom of Left Pane) */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/10">
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                Nouveau salon
              </div>
              
              <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-850">
                <button
                  type="button"
                  onClick={() => setNewRoomType('dm')}
                  className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${
                    newRoomType === 'dm' ? 'bg-slate-800 text-white' : 'text-slate-500'
                  }`}
                >
                  Direct Msg
                </button>
                <button
                  type="button"
                  onClick={() => setNewRoomType('group')}
                  className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${
                    newRoomType === 'group' ? 'bg-slate-800 text-white' : 'text-slate-500'
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
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-purple-500"
                />
              </div>

              {createError && (
                <div className="text-[10px] text-rose-400 font-medium">{createError}</div>
              )}

              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Créer le salon</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Messages & Message Input */}
        <div className="flex-1 flex flex-col h-2/3 md:h-full min-h-0 bg-slate-900/10">
          {currentRoom ? (
            <>
              {/* Active Room Title Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>💬</span>
                    <span>
                      {currentRoom.type === 'group' 
                        ? `Salon Groupe (${currentRoom.membres.join(', ')})` 
                        : `Discussion avec ${currentRoom.membres.filter(m => m !== pseudo).join(', ') || 'moi-même'}`}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    ID Salon : {currentRoom._id}
                  </div>
                </div>
              </div>

              {/* Message History list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loadingMessages && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xs text-slate-500">Chargement de l'historique...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-60 space-y-2 p-6">
                    <MessageSquare className="w-8 h-8 text-purple-400/80" />
                    <p className="text-xs text-slate-400">Aucun message ici. Lancez la discussion !</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble 
                      key={msg._id} 
                      message={msg} 
                      currentPseudo={pseudo} 
                    />
                  ))
                )}
                {/* Scroll Anchor */}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input form (Bottom of Right Pane) */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/35">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Écrire un message anonyme..."
                    value={newMsgContent}
                    onChange={(e) => setNewMsgContent(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all duration-200"
                  />
                  <button
                    type="submit"
                    disabled={!newMsgContent.trim()}
                    className={`p-2.5 rounded-xl text-white transition-all duration-200 ${
                      newMsgContent.trim()
                        ? 'bg-purple-600 hover:bg-purple-500 active:scale-95 shadow-md shadow-purple-600/10'
                        : 'bg-slate-850 text-slate-600 border border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            // No Room Selected State
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-700 animate-bounce" />
              <h3 className="text-base font-bold text-slate-300">Aucun salon actif</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Sélectionnez un salon à gauche ou créez un nouveau salon avec le pseudonyme d'un camarade.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
