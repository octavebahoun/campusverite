/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Key,
  LogOut,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { API_BASE } from '../config';

export default function Admin() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem('cv_admin_key') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('avis');
  const [avisList, setAvisList] = useState([]);
  const [messagesList, setMessagesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const verifyKey = async (keyToVerify) => {
    if (!keyToVerify) return;
    setLoading(true);
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: keyToVerify }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setAdminKey(keyToVerify);
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
    if (adminKey) verifyKey(adminKey);
  }, []);

  const loadModerationData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const headers = { Authorization: `Bearer ${adminKey}` };
      const url = activeTab === 'avis' ? `${API_BASE}/api/admin/avis` : `${API_BASE}/api/admin/messages`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error('Erreur de chargement des données.');
      const data = await res.json();
      if (activeTab === 'avis') setAvisList(data);
      else setMessagesList(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModerationData();
  }, [isAuthenticated, activeTab]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginInput.trim()) verifyKey(loginInput.trim());
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
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error('Erreur lors de la validation.');
      setAvisList((prev) => prev.map((item) => (item.id === id ? { ...item, signale: false } : item)));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteAvis = async (id) => {
    if (!window.confirm('Supprimer définitivement cet avis ?')) return;
    setActionLoadingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/avis/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression.');
      setAvisList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Supprimer ce message de chat ?')) return;
    setActionLoadingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression.');
      setMessagesList((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md py-10">
        <section className="surface p-6 md:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-[rgba(var(--color-brand-rgb),0.1)] text-brand">
              <Key className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white-off">Espace modération</h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Connexion réservée à l'administration pour traiter les signalements.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <input
              type="password"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="Clé d'administration"
              className="input-custom text-center"
              autoFocus
            />
            {loginError && (
              <p className="rounded-md border border-[color-mix(in_srgb,var(--color-danger)_34%,transparent)] p-3 text-center text-sm font-bold text-[var(--color-danger)]">
                {loginError}
              </p>
            )}
            {errorMsg && <p className="text-center text-sm font-bold text-[var(--color-danger)]">{errorMsg}</p>}
            <button type="submit" disabled={loading || !loginInput.trim()} className="btn-primary w-full">
              {loading ? 'Authentification...' : 'Se connecter'}
            </button>
          </form>
        </section>
      </div>
    );
  }

  const flaggedCount = avisList.filter((item) => item.signale).length;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="surface flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <h1 className="text-xl font-extrabold text-white-off">Tableau de modération</h1>
          <p className="text-sm text-muted">Avis signalés et messages récents.</p>
        </div>
        <button type="button" onClick={handleLogout} className="btn-secondary">
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={ShieldAlert} label="Avis signalés" value={flaggedCount} danger={flaggedCount > 0} />
        <Metric icon={FileText} label="Avis chargés" value={avisList.length} />
        <Metric icon={MessageSquare} label="Messages chargés" value={messagesList.length} />
      </div>

      <div className="surface flex flex-col gap-2 p-2 sm:flex-row">
        <TabButton active={activeTab === 'avis'} onClick={() => setActiveTab('avis')} icon={FileText}>
          Avis ({avisList.length})
        </TabButton>
        <TabButton active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} icon={MessageSquare}>
          Chat ({messagesList.length})
        </TabButton>
      </div>

      {errorMsg && (
        <div className="surface flex items-center gap-3 p-4 text-[var(--color-danger)]">
          <AlertCircle className="h-5 w-5" />
          <p className="font-bold">{errorMsg}</p>
        </div>
      )}

      <section className="surface p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-extrabold text-white-off">
            {activeTab === 'avis' ? 'Publications' : 'Messages de chat'}
          </h2>
          <button type="button" onClick={loadModerationData} disabled={loading} className="btn-secondary">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-muted">Chargement...</p>
        ) : activeTab === 'avis' ? (
          avisList.length === 0 ? (
            <p className="surface-muted p-8 text-center text-sm text-muted">Aucun avis trouvé.</p>
          ) : (
            <div className="space-y-3">
              {avisList.map((avis) => (
                <article key={avis.id} className="surface-muted p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <span className={`badge ${avis.type === 'suggestion' ? 'badge-sug' : 'badge-coup'}`}>
                        {avis.type === 'suggestion' ? 'Suggestion' : 'Coup de gueule'}
                      </span>
                      <span className="badge text-muted">{avis.categorie}</span>
                      {avis.signale && <span className="badge badge-coup">Signalé</span>}
                    </div>
                    <span className="text-xs font-semibold text-muted">
                      {new Date(avis.created_at).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <p className="mb-4 text-sm leading-6 text-white-off">{avis.contenu}</p>
                  <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--color-soft-border)] pt-3">
                    {avis.signale && (
                      <button
                        type="button"
                        onClick={() => handleApproveAvis(avis.id)}
                        disabled={actionLoadingId === avis.id}
                        className="btn-secondary"
                      >
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Valider
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteAvis(avis.id)}
                      disabled={actionLoadingId === avis.id}
                      className="btn-secondary text-[var(--color-danger)]"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )
        ) : messagesList.length === 0 ? (
          <p className="surface-muted p-8 text-center text-sm text-muted">Aucun message trouvé.</p>
        ) : (
          <div className="space-y-3">
            {messagesList.map((message) => (
              <article key={message._id} className="surface-muted p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="tag-pseudo text-sm">{message.pseudo}</span>
                    <p className="truncate text-xs text-muted">Salon {message.room_id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteMessage(message._id)}
                    disabled={actionLoadingId === message._id}
                    className="btn-secondary text-[var(--color-danger)]"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm leading-6 text-white-off">{message.contenu}</p>
                <p className="mt-2 text-right text-xs text-muted">
                  {new Date(message.created_at).toLocaleString('fr-FR')}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, danger = false }) {
  return (
    <div className="surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold text-muted">{label}</span>
        <Icon className={`h-5 w-5 ${danger ? 'text-[var(--color-danger)]' : 'text-brand'}`} />
      </div>
      <div className={`text-3xl font-extrabold ${danger ? 'text-[var(--color-danger)]' : 'text-white-off'}`}>{value}</div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn-secondary flex-1 ${active ? 'border-brand bg-[rgba(var(--color-brand-rgb),0.1)] text-brand' : ''}`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}
