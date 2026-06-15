import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import { getOrCreatePseudo, resetPseudo } from './utils/pseudo';
import Feed from './pages/Feed';
import Soumettre from './pages/Soumettre';
import Chat from './pages/Chat';
import { MessageSquare, FileText, Send, User, RefreshCw, Sparkles } from 'lucide-react';

export default function App() {
  const [pseudo, setPseudo] = useState('');

  useEffect(() => {
    setPseudo(getOrCreatePseudo());
  }, []);

  const handleChangePseudo = () => {
    const newPseudo = resetPseudo();
    setPseudo(newPseudo);
    // Refresh page to propagate pseudo updates to all components
    window.location.reload();
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-purple-600 selection:text-white">
        
        {/* Navbar Header */}
        <header className="sticky top-0 z-50 glass border-b border-slate-900 px-4 md:px-8 py-4 shrink-0">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-tr from-purple-600 to-pink-500 p-2 rounded-xl text-white shadow-md shadow-purple-600/10 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                Campus<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Vérité</span>
              </span>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center space-x-1">
              <NavLink 
                to="/" 
                className={({ isActive }) => `flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Actualités</span>
              </NavLink>
              
              <NavLink 
                to="/soumettre" 
                className={({ isActive }) => `flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Publier</span>
              </NavLink>

              <NavLink 
                to="/chat" 
                className={({ isActive }) => `flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat</span>
              </NavLink>
            </nav>

            {/* Pseudo controls */}
            <div className="flex items-center space-x-3 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-slate-300 font-bold max-w-[120px] truncate" title={pseudo}>
                  {pseudo || "Chargement..."}
                </span>
              </div>
              <button
                onClick={handleChangePseudo}
                className="p-1 rounded text-slate-500 hover:text-slate-350 hover:bg-slate-800 transition-colors"
                title="Générer un autre pseudo anonyme"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-6xl mx-auto py-6">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/soumettre" element={<Soumettre />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </main>

        {/* Mobile Navbar Footer (Sticky for mobile users) */}
        <div className="md:hidden sticky bottom-0 z-50 glass border-t border-slate-900 py-3 px-6 shrink-0 flex items-center justify-around">
          <NavLink 
            to="/" 
            className={({ isActive }) => `flex flex-col items-center space-y-1 text-xs font-bold transition-all ${
              isActive ? 'text-purple-400 scale-105' : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Feed</span>
          </NavLink>

          <NavLink 
            to="/soumettre" 
            className={({ isActive }) => `flex flex-col items-center space-y-1 text-xs font-bold transition-all ${
              isActive ? 'text-purple-400 scale-105' : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            <Send className="w-5 h-5" />
            <span>Soumettre</span>
          </NavLink>

          <NavLink 
            to="/chat" 
            className={({ isActive }) => `flex flex-col items-center space-y-1 text-xs font-bold transition-all ${
              isActive ? 'text-purple-400 scale-105' : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Chat</span>
          </NavLink>
        </div>

        {/* Footer */}
        <footer className="w-full text-center py-6 border-t border-slate-900 text-xs text-slate-600 bg-slate-950 shrink-0">
          <p>© {new Date().getFullYear()} CampusVérité. Conçu pour le respect de l'anonymat et le feedback étudiant constructif.</p>
        </footer>

      </div>
    </BrowserRouter>
  );
}
