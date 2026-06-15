import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import { getOrCreatePseudo, resetPseudo, getPseudoTheme } from './utils/pseudo';
import Feed from './pages/Feed';
import Soumettre from './pages/Soumettre';
import Chat from './pages/Chat';
import Admin from './pages/Admin';
import { MessageSquare, FileText, Send, RefreshCw, Eye, Sun, Moon, Shield, Info, ExternalLink } from 'lucide-react';

export default function App() {
  const [pseudo, setPseudo] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cv_theme');
      if (saved) return saved === 'dark';
      return true; // Default to dark for hacker style
    }
    return true;
  });

  const [selectedTheme, setSelectedTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cv_custom_theme') || '';
    }
    return '';
  });

  useEffect(() => {
    setPseudo(getOrCreatePseudo());
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('cv_theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('cv_theme', 'light');
    }
  }, [isDarkMode]);

  const handleChangePseudo = () => {
    const newPseudo = resetPseudo();
    setPseudo(newPseudo);
    window.location.reload();
  };

  const handleSelectTheme = (themeClass) => {
    setSelectedTheme(themeClass);
    localStorage.setItem('cv_custom_theme', themeClass);
  };

  const themeInfo = React.useMemo(() => getPseudoTheme(pseudo), [pseudo]);
  const activeThemeClass = selectedTheme || themeInfo.class;

  return (
    <BrowserRouter>
      <div className={`min-h-screen bg-abyssal text-white-off flex flex-col justify-between selection:bg-brand selection:text-white transition-colors duration-300 ${activeThemeClass}`}>
        
        {/* Navbar Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md px-4 md:px-8 py-4 shrink-0 transition-colors duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-brand p-2 rounded text-white shadow-md shadow-brand/10 group-hover:scale-105 transition-transform duration-200">
                <Eye className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white-off">
                Campus<span className="text-brand">Vérité</span>
              </span>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center space-x-6">
              <NavLink 
                to="/" 
                end
                className={({ isActive }) => `relative flex items-center space-x-1.5 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive ? 'text-brand' : 'text-muted hover:text-white-off'
                }`}
              >
                {({ isActive }) => (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Actualités</span>
                    {isActive && (
                      <span className="absolute bottom-[-18px] left-0 right-0 h-[2px] bg-brand rounded-full animate-pulse" />
                    )}
                  </>
                )}
              </NavLink>
              
              <NavLink 
                to="/soumettre" 
                className={({ isActive }) => `relative flex items-center space-x-1.5 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive ? 'text-brand' : 'text-muted hover:text-white-off'
                }`}
              >
                {({ isActive }) => (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publier</span>
                    {isActive && (
                      <span className="absolute bottom-[-18px] left-0 right-0 h-[2px] bg-brand rounded-full animate-pulse" />
                    )}
                  </>
                )}
              </NavLink>

              <NavLink 
                to="/chat" 
                className={({ isActive }) => `relative flex items-center space-x-1.5 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive ? 'text-brand' : 'text-muted hover:text-white-off'
                }`}
              >
                {({ isActive }) => (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat</span>
                    {isActive && (
                      <span className="absolute bottom-[-18px] left-0 right-0 h-[2px] bg-brand rounded-full animate-pulse" />
                    )}
                  </>
                )}
              </NavLink>
            </nav>

            {/* Theme & Pseudo Controls */}
            <div className="flex items-center space-x-3">
              
              {/* Accent Theme Dot Color Picker */}
              <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-abyssal rounded-sm border border-white/8" title="Sélectionner l'accent visuel (Militant, Cyber, Ombre, Brut)">
                <button 
                  onClick={() => handleSelectTheme('theme-red')} 
                  className={`w-3.5 h-3.5 rounded-full bg-[#FF4500] border transition-transform cursor-pointer ${activeThemeClass === 'theme-red' ? 'scale-125 border-white ring-2 ring-brand/35' : 'border-transparent hover:scale-110'}`} 
                  title="Thème Rouge Militant"
                />
                <button 
                  onClick={() => handleSelectTheme('theme-green')} 
                  className={`w-3.5 h-3.5 rounded-full bg-[#22C55E] border transition-transform cursor-pointer ${activeThemeClass === 'theme-green' ? 'scale-125 border-white ring-2 ring-brand/35' : 'border-transparent hover:scale-110'}`} 
                  title="Thème Vert Cyber"
                />
                <button 
                  onClick={() => handleSelectTheme('theme-blue')} 
                  className={`w-3.5 h-3.5 rounded-full bg-[#3B82F6] border transition-transform cursor-pointer ${activeThemeClass === 'theme-blue' ? 'scale-125 border-white ring-2 ring-brand/35' : 'border-transparent hover:scale-110'}`} 
                  title="Thème Bleu Ombre"
                />
                <button 
                  onClick={() => handleSelectTheme('theme-amber')} 
                  className={`w-3.5 h-3.5 rounded-full bg-[#F59E0B] border transition-transform cursor-pointer ${activeThemeClass === 'theme-amber' ? 'scale-125 border-white ring-2 ring-brand/35' : 'border-transparent hover:scale-110'}`} 
                  title="Thème Jaune Brut"
                />
              </div>

              {/* Dark / Light Toggle */}
              <button
                onClick={() => setIsDarkMode(prev => !prev)}
                className="p-2 rounded-sm border border-white/8 bg-abyssal text-muted hover:text-brand transition-colors cursor-pointer"
                title={isDarkMode ? "Passer au mode clair" : "Passer au mode sombre"}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Pseudo Display container */}
              <div className="flex items-center space-x-3 bg-abyssal px-3 py-1.5 rounded-sm border border-white/8">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                  <span className="text-xs tag-pseudo max-w-[120px] truncate" title={pseudo}>
                    {pseudo || "Chargement..."}
                  </span>
                  <span className="text-[9px] px-1 py-0.2 bg-white/5 border border-white/10 rounded-sm text-muted uppercase font-mono tracking-wider scale-90">
                    {themeInfo.name}
                  </span>
                </div>
                <button
                  onClick={handleChangePseudo}
                  className="p-1 rounded text-muted hover:text-brand hover:bg-surface transition-colors cursor-pointer"
                  title="Générer un autre pseudo anonyme"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area: Let's let it breathe in max-w-7xl */}
        <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 md:px-8">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/soumettre" element={<Soumettre />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        {/* Mobile Navbar Footer (Sticky for mobile users) */}
        <div className="md:hidden sticky bottom-0 z-50 bg-surface/90 backdrop-blur-md border-t border-white/8 py-3 px-6 shrink-0 flex items-center justify-around">
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => `flex flex-col items-center space-y-1 text-xs font-bold transition-all ${
              isActive ? 'text-brand scale-105' : 'text-muted hover:text-white-off'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Feed</span>
          </NavLink>

          <NavLink 
            to="/soumettre" 
            className={({ isActive }) => `flex flex-col items-center space-y-1 text-xs font-bold transition-all ${
              isActive ? 'text-brand scale-105' : 'text-muted hover:text-white-off'
            }`}
          >
            <Send className="w-5 h-5" />
            <span>Soumettre</span>
          </NavLink>

          <NavLink 
            to="/chat" 
            className={({ isActive }) => `flex flex-col items-center space-y-1 text-xs font-bold transition-all ${
              isActive ? 'text-brand scale-105' : 'text-muted hover:text-white-off'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Chat</span>
          </NavLink>
        </div>

        {/* PREMIUM MULTI-COLUMN SPACIOUS FOOTER */}
        <footer className="w-full border-t border-white/8 bg-surface text-muted py-12 px-6 md:px-12 transition-colors duration-300">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Branding Column */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center space-x-2">
                <div className="bg-brand p-1.5 rounded text-white w-fit">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-lg text-white-off tracking-tight">
                  Campus<span className="text-brand">Vérité</span>
                </span>
              </div>
              <p className="text-xs text-muted max-w-sm leading-relaxed font-sans">
                La plateforme libre et anonyme d'échange étudiant. Exprimez vos coups de gueule, proposez des suggestions et discutez en direct en toute sécurité.
              </p>
              <div className="flex items-center space-x-2 text-[10px] text-green-500 font-mono">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Réseau Opérationnel 🟢</span>
              </div>
            </div>

            {/* Quick Links Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white-off font-display">Navigation</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/" className="hover:text-brand transition-colors">Fil d'actualité</Link>
                </li>
                <li>
                  <Link to="/soumettre" className="hover:text-brand transition-colors">Publier un avis</Link>
                </li>
                <li>
                  <Link to="/chat" className="hover:text-brand transition-colors">Chatrooms Temps Réel</Link>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-brand transition-colors flex items-center space-x-1">
                    <span>Espace Modération</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Privacy Protocols Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white-off font-display">Protocoles Sécurité</h4>
              <ul className="space-y-2 text-xs font-mono text-[11px]">
                <li className="flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-brand" />
                  <span>0% Logs d'adresses IP</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-brand" />
                  <span>Session Locale Chiffrée</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-brand" />
                  <span>Aucun traceur tiers</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="max-w-7xl mx-auto border-t border-white/5 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px]">
            <p>© {new Date().getFullYear()} CampusVérité. Développé pour la transparence académique.</p>
            <p className="mt-2 md:mt-0 text-[9px] uppercase tracking-widest font-mono">
              Designed for Hackathon Excellence
            </p>
          </div>
        </footer>

      </div>
    </BrowserRouter>
  );
}
