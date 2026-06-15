/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import {
  ArrowLeft,
  Hash,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { API_BASE } from '../config';
import MessageBubble from '../components/MessageBubble';
import { getOrCreatePseudo } from '../utils/pseudo';

export default function Chat() {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsgContent, setNewMsgContent] = useState('');
  const [newRoomType, setNewRoomType] = useState('dm');
  const [newRoomMembres, setNewRoomMembres] = useState('');
  const [createError, setCreateError] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [onlinePseudos, setOnlinePseudos] = useState([]);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const pseudo = getOrCreatePseudo();

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await fetch(`${API_BASE}/api/rooms?pseudo=${encodeURIComponent(pseudo)}`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
        if (data.length > 0 && !currentRoom) setCurrentRoom(data[0]);
      }
    } catch (err) {
      console.error('Error loading rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [pseudo]);

  useEffect(() => {
    socketRef.current = io(API_BASE);
    socketRef.current.on('connect', () => {
      socketRef.current.emit('register_user', pseudo);
    });
    socketRef.current.on('online_users', setOnlinePseudos);

    return () => socketRef.current?.disconnect();
  }, [pseudo]);

  useEffect(() => {
    if (!socketRef.current) return undefined;
    const handler = (msg) => {
      if (currentRoom && msg.room_id.toString() === currentRoom._id.toString()) {
        setMessages((prev) => (prev.some((item) => item._id === msg._id) ? prev : [...prev, msg]));
      }
    };
    socketRef.current.on('receive_message', handler);
    return () => socketRef.current?.off('receive_message', handler);
  }, [currentRoom]);

  useEffect(() => {
    if (!currentRoom) return;
    socketRef.current?.emit('join_room', currentRoom._id);

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`${API_BASE}/api/rooms/${currentRoom._id}/messages`);
        if (res.ok) setMessages(await res.json());
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [currentRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMsgContent.trim() || !currentRoom) return;
    socketRef.current?.emit('send_message', {
      room_id: currentRoom._id,
      pseudo,
      contenu: newMsgContent.trim(),
    });
    setNewMsgContent('');
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!newRoomMembres.trim()) {
      setCreateError('Veuillez renseigner au moins un pseudonyme.');
      return;
    }

    const membersList = newRoomMembres
      .split(',')
      .map((member) => member.trim())
      .filter(Boolean);
    if (!membersList.includes(pseudo)) membersList.push(pseudo);

    try {
      const res = await fetch(`${API_BASE}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: newRoomType, membres: membersList }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur de création du salon');
      }
      const createdRoom = await res.json();
      setRooms((prev) => (prev.some((room) => room._id === createdRoom._id) ? prev : [createdRoom, ...prev]));
      setCurrentRoom(createdRoom);
      setNewRoomMembres('');
    } catch (err) {
      setCreateError(err.message);
    }
  };

  const handleStartDM = async (targetPseudo) => {
    if (targetPseudo === pseudo) return;
    setNewRoomType('dm');
    setNewRoomMembres(targetPseudo);

    try {
      const res = await fetch(`${API_BASE}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'dm', membres: [pseudo, targetPseudo] }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la création du salon.');
      }
      const room = await res.json();
      setRooms((prev) => (prev.some((item) => item._id === room._id) ? prev : [room, ...prev]));
      setCurrentRoom(room);
    } catch (err) {
      alert(err.message);
    }
  };

  const activeOnlineUsers = onlinePseudos.filter((item) => item !== pseudo);
  const roomTitle = currentRoom
    ? currentRoom.type === 'group'
      ? `Groupe (${currentRoom.membres.length})`
      : currentRoom.membres.filter((item) => item !== pseudo).join(', ') || 'Moi-même'
    : 'Aucun salon';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-[calc(100vh-190px)] min-h-[620px] flex-col space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="btn-ghost">
          <ArrowLeft className="h-4 w-4" />
          Fil public
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted">
          <ShieldCheck className="h-4 w-4 text-brand" />
          <span>Session</span>
          <span className="tag-pseudo">{pseudo}</span>
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="surface grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[320px_minmax(0,1fr)]"
      >
        <aside className="flex min-h-0 flex-col border-b border-[var(--color-border)] lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-brand" />
              <h1 className="font-extrabold text-white-off">Salons anonymes</h1>
            </div>
            <button type="button" onClick={fetchRooms} className="btn-ghost h-9 w-9 p-0" title="Rafraîchir">
              <RefreshCw className={`h-4 w-4 ${loadingRooms ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {loadingRooms && rooms.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted">Chargement des salons...</p>
            ) : rooms.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted">Aucun salon pour le moment.</p>
            ) : (
              <div className="space-y-2">
                {rooms.map((room) => {
                  const selected = currentRoom?._id === room._id;
                  const label = room.type === 'group'
                    ? `Groupe (${room.membres.length})`
                    : room.membres.filter((item) => item !== pseudo).join(', ') || 'Moi-même';

                  return (
                    <motion.button
                      type="button"
                      key={room._id}
                      onClick={() => setCurrentRoom(room)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full rounded-md border p-3 text-left transition ${
                        selected
                          ? 'border-brand bg-[rgba(var(--color-brand-rgb),0.1)]'
                          : 'border-[var(--color-border)] hover:border-[rgba(var(--color-brand-rgb),0.4)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {room.type === 'dm' ? <User className="h-4 w-4 text-brand" /> : <Users className="h-4 w-4 text-brand" />}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-extrabold text-white-off">{label}</p>
                          <p className="truncate text-xs text-muted">{room.type === 'group' ? room.membres.join(', ') : 'Discussion directe'}</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-[var(--color-border)] p-4">
            <div className="mb-3 flex items-center justify-between text-xs font-bold text-muted">
              <span>Connectés</span>
              <span>{onlinePseudos.length}</span>
            </div>
            <div className="mb-4 max-h-28 space-y-2 overflow-y-auto">
              {activeOnlineUsers.length === 0 ? (
                <p className="text-sm text-muted">Aucun autre pseudonyme en ligne.</p>
              ) : (
                activeOnlineUsers.map((item) => (
                  <motion.button
                    type="button"
                    key={item}
                    onClick={() => handleStartDM(item)}
                    whileTap={{ scale: 0.98 }}
                    className="surface-muted flex w-full items-center justify-between gap-2 p-2 text-left text-sm"
                  >
                    <span className="truncate tag-pseudo">{item}</span>
                    <Plus className="h-4 w-4 text-brand" />
                  </motion.button>
                ))
              )}
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewRoomType('dm')}
                  className={`rounded-md border px-3 py-2 text-sm font-bold ${newRoomType === 'dm' ? 'border-brand text-brand' : 'border-[var(--color-border)] text-muted'}`}
                >
                  Direct
                </button>
                <button
                  type="button"
                  onClick={() => setNewRoomType('group')}
                  className={`rounded-md border px-3 py-2 text-sm font-bold ${newRoomType === 'group' ? 'border-brand text-brand' : 'border-[var(--color-border)] text-muted'}`}
                >
                  Groupe
                </button>
              </div>
              <input
                type="text"
                value={newRoomMembres}
                onChange={(e) => setNewRoomMembres(e.target.value)}
                placeholder={newRoomType === 'dm' ? 'Pseudo destinataire' : 'Pseudo1, Pseudo2'}
                className="input-custom"
              />
              {createError && <p className="text-sm font-bold text-[var(--color-danger)]">{createError}</p>}
              <button type="submit" className="btn-primary w-full">
                <Plus className="h-4 w-4" />
                Créer
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-brand" />
                <h2 className="truncate font-extrabold text-white-off">{roomTitle}</h2>
              </div>
              {currentRoom && <p className="truncate text-xs text-muted">Salon {currentRoom._id}</p>}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--color-bg)]/40 p-4">
            {!currentRoom ? (
              <div className="flex h-full items-center justify-center text-center text-sm text-muted">
                Sélectionnez ou créez un salon pour démarrer.
              </div>
            ) : loadingMessages ? (
              <p className="py-10 text-center text-sm text-muted">Chargement des messages...</p>
            ) : messages.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">Aucun message dans ce salon.</p>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <MessageBubble key={msg._id} message={msg} currentPseudo={pseudo} />
                ))}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-[var(--color-border)] p-4">
            <input
              type="text"
              value={newMsgContent}
              onChange={(e) => setNewMsgContent(e.target.value)}
              placeholder="Écrire un message anonyme..."
              className="input-custom"
            />
            <button type="submit" disabled={!newMsgContent.trim() || !currentRoom} className="btn-primary px-4">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </motion.section>
    </motion.div>
  );
}
