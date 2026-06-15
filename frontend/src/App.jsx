/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  Eye,
  FileText,
  MessageSquare,
  Moon,
  RefreshCw,
  Send,
  ShieldCheck,
  Sun,
  Wrench,
} from 'lucide-react';
import { getOrCreatePseudo, resetPseudo } from './utils/pseudo';
import Feed from './pages/Feed';
import Soumettre from './pages/Soumettre';
import Chat from './pages/Chat';
import Admin from './pages/Admin';

function NavigationLink({ to, end, icon: Icon, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </NavLink>
  );
}

export default function App() {
  const [pseudo, setPseudo] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('cv_theme') === 'dark';
  });

  useEffect(() => {
    setPseudo(getOrCreatePseudo());
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('light', !isDarkMode);
    localStorage.setItem('cv_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const shortPseudo = useMemo(() => pseudo || 'Session anonyme', [pseudo]);

  const handleChangePseudo = () => {
    const nextPseudo = resetPseudo();
    setPseudo(nextPseudo);
    window.location.reload();
  };

  return (
    <BrowserRouter>
      <div className="app-shell flex min-h-screen flex-col">
        <header className="topbar">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
            <Link to="/" className="flex min-w-0 items-center gap-3">
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-transparent overflow-hidden border border-white/10 shadow-md"
              >
                <img src="/logo.webp" alt="CampusVérité" className="h-full w-full object-cover" />
              </motion.span>
              <span className="min-w-0">
                <span className="block truncate text-base font-extrabold tracking-tight text-white-off">
                  CampusVérité
                </span>
                <span className="hidden text-xs font-semibold text-muted sm:block">
                  Feedback étudiant anonyme
                </span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              <NavigationLink to="/" end icon={FileText}>Avis</NavigationLink>
              <NavigationLink to="/soumettre" icon={Send}>Soumettre</NavigationLink>
              <NavigationLink to="/chat" icon={MessageSquare}>Chat</NavigationLink>
              <NavigationLink to="/admin" icon={Wrench}>Modération</NavigationLink>
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-md border border-[var(--color-border)] bg-surface px-3 py-2 lg:flex">
                <ShieldCheck className="h-4 w-4 text-brand" />
                <span className="max-w-[150px] truncate text-xs font-bold">
                  <span className="tag-pseudo">{shortPseudo}</span>
                </span>
                <button
                  type="button"
                  onClick={handleChangePseudo}
                  className="text-muted transition hover:text-brand"
                  title="Changer de pseudonyme"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsDarkMode((value) => !value)}
                className="btn-secondary h-10 w-10 p-0"
                title={isDarkMode ? 'Mode clair' : 'Mode sombre'}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8 md:py-8">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/soumettre" element={<Soumettre />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        <nav className="topbar bottom-0 top-auto z-50 grid grid-cols-4 gap-1 px-3 py-2 md:hidden">
          <NavigationLink to="/" end icon={FileText}>Avis</NavigationLink>
          <NavigationLink to="/soumettre" icon={Send}>Publier</NavigationLink>
          <NavigationLink to="/chat" icon={MessageSquare}>Chat</NavigationLink>
          <NavigationLink to="/admin" icon={Wrench}>Admin</NavigationLink>
        </nav>

        {/* PREMIUM MULTI-COLUMN SPACIOUS FOOTER */}
        <footer className="border-t border-[var(--color-border)] bg-surface py-12 px-4 md:px-8 text-muted transition-colors duration-300">
          <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Branding Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src="/logo.webp" alt="Logo" className="h-6 w-6 rounded-md object-cover border border-white/10 shadow-md" />
                <span className="font-display font-bold text-lg text-white-off tracking-tight">
                  Campus<span className="text-brand">Vérité</span>
                </span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                La plateforme libre et anonyme d'échange étudiant. Exprimez-vous en toute sécurité sans laisser d'empreinte numérique.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-success font-mono">
                <Activity className="h-3.5 w-3.5" />
                <span>Réseau opérationnel</span>
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
                  <Link to="/chat" className="hover:text-brand transition-colors">Chatrooms Live</Link>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-brand transition-colors">Modération Admin</Link>
                </li>
              </ul>
            </div>

            {/* Privacy Protocols Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white-off font-display">Protocoles Sécurité</h4>
              <ul className="space-y-2 text-xs font-mono text-[11px]">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand" />
                  <span>0% Cookie nominatif</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand" />
                  <span>Cryptographie locale</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand" />
                  <span>Zéro IP logger</span>
                </li>
              </ul>
            </div>

            {/* Session Summary Info Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white-off font-display">Votre Session</h4>
              <div className="p-3 bg-abyssal/60 border border-white/5 rounded-md space-y-1">
                <div className="text-[10px] text-muted uppercase font-mono">Pseudo anonyme</div>
                <div className="tag-pseudo text-xs truncate">{shortPseudo}</div>
              </div>
              <p className="text-[10px] text-muted leading-tight">
                Pour changer d'identité et de thème graphique, générez un nouveau pseudonyme depuis le header.
              </p>
            </div>

          </div>

          <div className="mx-auto max-w-7xl border-t border-white/5 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px]">
            <p>© {new Date().getFullYear()} CampusVérité. Conçu pour la transparence académique.</p>
            <p className="mt-2 md:mt-0 text-[9px] uppercase tracking-widest font-mono text-muted">
              Hackathon Edition v2.1
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
