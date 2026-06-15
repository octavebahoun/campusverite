import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, ShieldCheck, Trash2, Key, LogOut, MessageSquare, 
  FileText, Activity, AlertCircle, RefreshCw 
} from 'lucide-react';
import { API_BASE } from '../config';

export default function Admin() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem('cv_admin_key') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('avis'); // 'avis' | 'messages'

  // Moderation state arrays
  const [avisList, setAvisList] = useState([]);
  const [messagesList, setMessagesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Verify key validity on mount or when key changes
  const verifyKey = async (keyToVerify) => {
    if (!keyToVerify) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: keyToVerify })
      });
      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('cv_admin_key', keyToVerify);
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('cv_admin_key');
        setLoginError("Clé d'administration invalide.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Impossible de joindre le serveur d'authentification.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) {
      verifyKey(adminKey);
    }
  }, [adminKey]);

  // Load content once authenticated
  const loadModerationData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const headers = { 'Authorization': `Bearer ${adminKey}` };
      
      if (activeTab === 'avis') {
        const res = await fetch(`${API_BASE}/api/admin/avis`, { headers });
        if (!res.ok) throw new Error("Erreur de chargement des avis.");
        const data = await res.json();
        setAvisList(data);
      } else {
        const res = await fetch(`${API_BASE}/api/admin/messages`, { headers });
        if (!res.ok) throw new Error("Erreur de chargement des messages.");
        const data = await res.json();
        setMessagesList(data);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModerationData();
  }, [isAuthenticated, activeTab]);

  // 2. Actions
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginInput.trim()) return;
    verifyKey(loginInput.trim());
  };

  const handleLogout = () => {
    localStorage.removeItem('cv_admin_key');
    setAdminKey('');
    setIsAuthenticated(false);
  };

  const handleApproveAvis = async (id) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/avis/${id}/unflag`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminKey}` }
      });
      if (!res.ok) throw new Error("Erreur lors de la validation.");
      // Update local state
      setAvisList(prev => prev.map(a => a.id === id ? { ...a, signale: false } : a));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteAvis = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cet avis ?")) return;
    setActionLoadingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/avis/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminKey}` }
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression.");
      // Remove from state
      setAvisList(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce message de chat ?")) return;
    setActionLoadingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminKey}` }
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression.");
      // Remove from state
      setMessagesList(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 3. Render Login Screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-[480px] mx-auto px-4 py-16">
        <div className="bg-surface rounded-[20px] border border-white/8 p-8 space-y-6 shadow-xl relative overflow-hidden bg-grid-pattern">
          <div className="absolute top-0 right-0 w-44 h-44 bg-brand/5 blur-3xl rounded-full" />
          
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
              <Key className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold font-display uppercase tracking-wider text-white-off">Backoffice</h1>
            <p className="text-xs text-muted font-sans">
              Entrez votre clé d'administration pour modérer CampusVérité.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <input
                type="password"
                placeholder="Clé d'accès confidentielle..."
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                className="input-custom py-3 text-sm text-center font-mono tracking-widest"
                autoFocus
              />
            </div>

            {loginError && (
              <div className="p-3 bg-brand/5 border border-brand/20 rounded-sm text-xs font-bold text-brand text-center">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !loginInput}
              className="btn-primary w-full py-3"
            >
              {loading ? "Authentification..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate quick admin indicators
  const flaggedCount = avisList.filter(a => a.signale).length;

  // 4. Render Admin Dashboard Panel
  return (
    <div className="max-w-[760px] mx-auto px-4 py-8 space-y-6">
      
      {/* Header controls bar */}
      <div className="flex items-center justify-between bg-surface border border-white/8 p-4 rounded-[12px]">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold font-mono tracking-wider text-muted uppercase">
            Panneau Modérateur Connecté
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-sm border border-white/10 hover:border-brand/40 text-xs font-bold font-display transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Déconnexion</span>
        </button>
      </div>

      {/* Stats indicators dashboard */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-white/8 p-4 rounded-[12px] flex flex-col justify-between hover:border-brand/20 transition-colors">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider font-display flex items-center space-x-1">
            <ShieldAlert className="w-3.5 h-3.5 text-brand" />
            <span>Avis Signalés</span>
          </span>
          <span className={`text-2xl font-bold font-display ${flaggedCount > 0 ? 'text-brand' : 'text-white-off'}`}>
            {flaggedCount}
          </span>
        </div>

        <div className="bg-surface border border-white/8 p-4 rounded-[12px] flex flex-col justify-between hover:border-brand/20 transition-colors">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider font-display flex items-center space-x-1">
            <FileText className="w-3.5 h-3.5 text-muted" />
            <span>Total Avis</span>
          </span>
          <span className="text-2xl font-bold font-display text-white-off">
            {avisList.length}
          </span>
        </div>

        <div className="bg-surface border border-white/8 p-4 rounded-[12px] flex flex-col justify-between hover:border-brand/20 transition-colors">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider font-display flex items-center space-x-1">
            <MessageSquare className="w-3.5 h-3.5 text-muted" />
            <span>Chats Récents</span>
          </span>
          <span className="text-2xl font-bold font-display text-white-off">
            {messagesList.length}
          </span>
        </div>
      </div>

      {/* Tabs Switch navigation panel */}
      <div className="flex bg-surface border border-white/8 p-1 rounded-sm">
        <button
          onClick={() => setActiveTab('avis')}
          className={`flex-1 py-2 rounded-sm text-xs font-bold font-display transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'avis' ? 'bg-brand/10 text-brand border border-brand/20' : 'text-muted'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Modération Avis ({avisList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex-1 py-2 rounded-sm text-xs font-bold font-display transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'messages' ? 'bg-brand/10 text-brand border border-brand/20' : 'text-muted'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Modération Chats ({messagesList.length})</span>
        </button>
      </div>

      {/* Error / Alert banner */}
      {errorMsg && (
        <div className="p-4 rounded-sm border border-brand/20 bg-brand/5 text-brand text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* List content area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-display">
            {activeTab === 'avis' ? "Liste des publications" : "Messages de chat récents"}
          </h3>
          <button
            onClick={loadModerationData}
            disabled={loading}
            className="p-1 text-muted hover:text-white-off"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-muted font-sans animate-pulse">
            Chargement des données...
          </div>
        ) : activeTab === 'avis' ? (
          // Modérer les Avis
          avisList.length === 0 ? (
            <p className="text-center text-xs text-muted py-12 bg-surface border border-white/8 rounded-sm">Aucun avis trouvé.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {avisList.map((a) => (
                <div 
                  key={a.id} 
                  className={`p-6 bg-surface border border-white/8 rounded-[20px] space-y-4 relative overflow-hidden transition-all duration-300 ${
                    a.signale ? 'border-brand/45 shadow-[0_0_15px_rgba(255,69,0,0.05)]' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-sm uppercase font-mono font-bold ${
                        a.type === 'coup_de_gueule' ? 'bg-brand/10 text-brand' : 'bg-success/10 text-success'
                      }`}>
                        {a.type === 'coup_de_gueule' ? '😡 Coup de Gueule' : '💡 Suggestion'}
                      </span>
                      <span className="text-[10px] text-muted font-mono bg-white/5 px-2 py-0.5 rounded-sm">
                        {a.categorie}
                      </span>
                    </div>

                    {a.signale && (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-brand uppercase bg-brand/10 px-2 py-0.5 rounded-sm animate-pulse">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Signalé</span>
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-sans leading-relaxed text-white-off">{a.contenu}</p>

                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <span className="text-[10px] text-muted font-mono">
                      Créé le {new Date(a.created_at).toLocaleString('fr-FR')}
                    </span>
                    
                    {/* Moderation Controls */}
                    <div className="flex space-x-2">
                      {a.signale && (
                        <button
                          onClick={() => handleApproveAvis(a.id)}
                          disabled={actionLoadingId === a.id}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-sm bg-success/15 hover:bg-success/25 text-success text-xs font-bold font-display transition-all"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Valider</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAvis(a.id)}
                        disabled={actionLoadingId === a.id}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-sm bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold font-display transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Modérer le Chat (Messages MongoDB)
          messagesList.length === 0 ? (
            <p className="text-center text-xs text-muted py-12 bg-surface border border-white/8 rounded-sm">Aucun message de chat trouvé.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {messagesList.map((m) => (
                <div 
                  key={m._id} 
                  className="p-4 bg-surface border border-white/8 rounded-[12px] space-y-2 hover:border-white/15 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="tag-pseudo text-xs">{m.pseudo}</span>
                      <span className="text-[9px] text-muted font-mono bg-white/5 px-1.5 py-0.2 rounded-sm">
                        Room: {m.room_id}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteMessage(m._id)}
                      disabled={actionLoadingId === m._id}
                      className="p-1 rounded text-muted hover:text-brand hover:bg-abyssal transition-colors"
                      title="Supprimer le message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-white-off font-sans">{m.contenu}</p>
                  <div className="text-[9px] text-muted font-mono text-right">
                    Envoyé le {new Date(m.created_at).toLocaleString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
