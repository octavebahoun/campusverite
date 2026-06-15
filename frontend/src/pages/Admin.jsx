/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  Printer,
  X
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

  // AI Petition States
  const [selectedAvisForPetition, setSelectedAvisForPetition] = useState(null);
  const [openRouterKey, setOpenRouterKey] = useState(() => localStorage.getItem('cv_openrouter_key') || '');
  const [selectedModel, setSelectedModel] = useState('google/gemma-4-26b-a4b-it:free');
  const [petitionText, setPetitionText] = useState('');
  const [generatingPetition, setGeneratingPetition] = useState(false);
  const [generationError, setGenerationError] = useState('');

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
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Erreur lors de la suppression.');
      }
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

  // Generate Petition letter using OpenRouter API
  const handleGeneratePetitionText = async () => {
    if (!openRouterKey.trim()) {
      setGenerationError("Veuillez renseigner votre clé API OpenRouter.");
      return;
    }
    setGenerationError('');
    setGeneratingPetition(true);
    setPetitionText('');
    localStorage.setItem('cv_openrouter_key', openRouterKey.trim());

    const prompt = `Rédige une pétition officielle académique adressée à la direction de l'université.
Catégorie du problème : ${selectedAvisForPetition.categorie}
Type : ${selectedAvisForPetition.type === 'suggestion' ? 'Suggestion d\'amélioration' : 'Coup de gueule / Doléance urgente'}
Date de dépôt initial : ${new Date(selectedAvisForPetition.created_at).toLocaleDateString('fr-FR')}
Nombre de signatures / votes utiles de soutien récoltés : ${selectedAvisForPetition.votes || 0}
Contenu initial partagé anonymement par les étudiants :
"${selectedAvisForPetition.contenu}"

La pétition doit être rédigée de manière très formelle et diplomatique, dans un français impeccable.
Structure à respecter obligatoirement :
1. En-tête officiel : "Pétition Étudiante - CampusVérité"
2. Date et destinataire (La Direction du Campus)
3. Objet clair de la pétition
4. Corps de la lettre détaillant :
   - Le rappel de la doléance et le nombre important de soutiens reçus (${selectedAvisForPetition.votes || 0} votes).
   - Les conséquences de ce problème sur le quotidien des étudiants.
   - Des propositions de résolutions concrètes et réalistes.
5. Une formule de politesse respectueuse.
6. Un espace en bas pour "Représentants des étudiants de CampusVérité".
Reste factuel et constructif. Ne génère aucun autre texte explicatif autour de la lettre, uniquement le document lui-même.`;

    try {
      const res = await fetch(`${API_BASE}/api/admin/generate-petition`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          openRouterKey: openRouterKey.trim(),
          model: selectedModel,
          prompt: prompt
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || "Erreur de communication avec OpenRouter.");
      }

      const resData = await res.json();
      const text = resData.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error("Aucun texte n'a été retourné par le modèle.");
      }
      setPetitionText(text);
    } catch (err) {
      setGenerationError(err.message);
    } finally {
      setGeneratingPetition(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-md py-10"
      >
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
      </motion.div>
    );
  }

  const flaggedCount = avisList.filter((item) => item.signale).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-7xl space-y-5"
    >
      <style>{`
        @media screen {
          #printable-petition {
            display: none !important;
          }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-petition, #printable-petition * {
            visibility: visible;
          }
          #printable-petition {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            font-family: Georgia, serif !important;
            padding: 2.5cm !important;
            font-size: 11pt !important;
            line-height: 1.6 !important;
            border: none !important;
            box-shadow: none !important;
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="surface flex flex-wrap items-center justify-between gap-3 p-4 no-print">
        <div>
          <h1 className="text-xl font-extrabold text-white-off">Tableau de modération</h1>
          <p className="text-sm text-muted">Avis signalés et outils de pétition IA.</p>
        </div>
        <button type="button" onClick={handleLogout} className="btn-secondary">
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
        className="grid gap-4 md:grid-cols-3 no-print"
      >
        <Metric icon={ShieldAlert} label="Avis signalés" value={flaggedCount} danger={flaggedCount > 0} />
        <Metric icon={FileText} label="Avis chargés" value={avisList.length} />
        <Metric icon={MessageSquare} label="Messages chargés" value={messagesList.length} />
      </motion.div>

      <div className="surface flex flex-col gap-2 p-2 sm:flex-row no-print">
        <TabButton active={activeTab === 'avis'} onClick={() => setActiveTab('avis')} icon={FileText}>
          Avis ({avisList.length})
        </TabButton>
        <TabButton active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} icon={MessageSquare}>
          Chat ({messagesList.length})
        </TabButton>
      </div>

      {errorMsg && (
        <div className="surface flex items-center gap-3 p-4 text-[var(--color-danger)] no-print">
          <AlertCircle className="h-5 w-5" />
          <p className="font-bold">{errorMsg}</p>
        </div>
      )}

      {/* MODERATION CORE PANEL */}
      <section className="surface p-4 md:p-5 no-print">
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
                <motion.article
                  key={avis.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="surface-muted p-4"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <span className={`badge ${avis.type === 'suggestion' ? 'badge-sug' : 'badge-coup'}`}>
                        {avis.type === 'suggestion' ? 'Suggestion' : 'Coup de gueule'}
                      </span>
                      <span className="badge text-muted">{avis.categorie}</span>
                      {avis.signale && <span className="badge badge-coup">Signalé</span>}
                      <span className="badge bg-brand/10 text-brand">👍 {avis.votes || 0} votes</span>
                    </div>
                    <span className="text-xs font-semibold text-muted">
                      {new Date(avis.created_at).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <p className="mb-4 text-sm leading-6 text-white-off">{avis.contenu}</p>
                  <div className="flex flex-wrap justify-between items-center gap-2 border-t border-[var(--color-soft-border)] pt-3">
                    
                    {/* IA Petition generator button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAvisForPetition(avis);
                        setPetitionText('');
                        setGenerationError('');
                      }}
                      className="btn-secondary border-brand/20 text-brand hover:bg-brand/10"
                    >
                      <Sparkles className="h-4 w-4" />
                      Rédiger Pétition (IA)
                    </button>

                    <div className="flex gap-2">
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
                  </div>
                </motion.article>
              ))}
            </div>
          )
        ) : messagesList.length === 0 ? (
          <p className="surface-muted p-8 text-center text-sm text-muted">Aucun message trouvé.</p>
        ) : (
          <div className="space-y-3">
            {messagesList.map((message) => (
              <motion.article
                key={message._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="surface-muted p-4"
              >
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
              </motion.article>
            ))}
          </div>
        )}
      </section>

      {/* IA PETITION GENERATION MODAL / PANEL */}
      <AnimatePresence>
        {selectedAvisForPetition && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm no-print">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="surface flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4 bg-surface/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand" />
                  <h3 className="font-extrabold text-white-off">Rédaction de Pétition Officielle IA</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAvisForPetition(null)}
                  className="rounded-full p-1 text-muted hover:bg-white/5 hover:text-white-off transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="surface-muted p-3 text-xs leading-relaxed text-muted border-l-2 border-brand">
                  <span className="font-bold text-white-off block mb-1">Avis d'origine ({selectedAvisForPetition.votes || 0} votes) :</span>
                  "{selectedAvisForPetition.contenu}"
                </div>

                {/* API Key configuration input */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white-off">Clé API OpenRouter</label>
                    <input
                      type="password"
                      value={openRouterKey}
                      onChange={(e) => setOpenRouterKey(e.target.value)}
                      placeholder="sk-or-..."
                      className="input-custom py-1.5 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white-off">Modèle IA</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="input-custom py-1.5 text-xs bg-surface"
                    >
                      <option value="google/gemma-4-26b-a4b-it:free">Gemma 4 26B A4B IT (Gratuit)</option>
                      <option value="openrouter/owl-alpha">Owl Alpha</option>
                      <option value="nex-agi/nex-n2-pro:free">Nex N2 Pro (Gratuit)</option>
                    </select>
                  </div>
                </div>

                {generationError && (
                  <p className="rounded-md border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] p-3 text-xs text-[var(--color-danger)] font-bold">
                    {generationError}
                  </p>
                )}

                {/* Action button */}
                <button
                  type="button"
                  onClick={handleGeneratePetitionText}
                  disabled={generatingPetition || !openRouterKey.trim()}
                  className="btn-primary w-full py-2.5"
                >
                  {generatingPetition ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Génération du courrier officiel...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Rédiger le courrier officiel
                    </>
                  )}
                </button>

                {/* Live letterhead review area */}
                {petitionText && (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted uppercase">Aperçu du courrier</span>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="btn-secondary py-1 px-3 text-xs flex items-center gap-1.5 border-brand/20 text-brand"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Imprimer / Télécharger en PDF
                      </button>
                    </div>

                    {/* Printable area */}
                    <div
                      id="preview-petition"
                      className="border border-[var(--color-border)] bg-white text-black p-6 rounded-md whitespace-pre-wrap font-serif text-sm shadow-inner max-h-[300px] overflow-y-auto"
                    >
                      {petitionText}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden printable target container (so print contains only the letter and not the app layout) */}
      {selectedAvisForPetition && petitionText && (
        <div id="printable-petition" className="whitespace-pre-wrap">
          {petitionText}
        </div>
      )}

    </motion.div>
  );
}

function Metric({ icon: Icon, label, value, danger = false }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.24 } },
      }}
      className="surface p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold text-muted">{label}</span>
        <Icon className={`h-5 w-5 ${danger ? 'text-[var(--color-danger)]' : 'text-brand'}`} />
      </div>
      <div className={`text-3xl font-extrabold ${danger ? 'text-[var(--color-danger)]' : 'text-white-off'}`}>{value}</div>
    </motion.div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn-secondary flex-1 cursor-pointer ${active ? 'border-brand bg-[rgba(var(--color-brand-rgb),0.1)] text-brand' : ''}`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}
