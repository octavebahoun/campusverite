import React from 'react';
import { Flame, Lightbulb, GraduationCap, Building, Wrench, FileText, Activity } from 'lucide-react';

const CATEGORIES = [
  { name: 'Pédagogie', icon: GraduationCap, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { name: 'Infrastructure', icon: Building, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  { name: 'Administration', icon: FileText, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
  { name: 'Équipements', icon: Wrench, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
];

const TYPES = [
  { value: 'coup_de_gueule', label: 'Coup de gueule', icon: Flame, color: 'text-brand' },
  { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'text-success' }
];

export default function FiltreBar({ 
  selectedCategory, 
  setSelectedCategory, 
  selectedType, 
  setSelectedType,
  avisList 
}) {
  // Tableau de chaleur (Bonus implementation: calculate count of avis per category)
  const categoryStats = React.useMemo(() => {
    const stats = {
      Pédagogie: 0,
      Infrastructure: 0,
      Administration: 0,
      Équipements: 0
    };
    avisList.forEach(a => {
      if (stats[a.categorie] !== undefined) {
        stats[a.categorie]++;
      }
    });
    return stats;
  }, [avisList]);

  const totalAvis = avisList.length;

  return (
    <div className="space-y-6">
      {/* Tableau de Chaleur (Heatmap panel) */}
      <div className="bg-surface p-6 rounded-[20px] border border-white/8">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-5 h-5 text-brand animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted font-display">
            Tableau de Chaleur Campus
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map(cat => {
            const count = categoryStats[cat.name] || 0;
            const percentage = totalAvis > 0 ? Math.round((count / totalAvis) * 100) : 0;
            const Icon = cat.icon;
            
            return (
              <div 
                key={cat.name} 
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                className={`p-4 rounded-[12px] border cursor-pointer transition-all duration-300 ${
                  selectedCategory === cat.name 
                    ? 'bg-brand/10 border-brand/40 shadow-[0_0_15px_rgba(var(--color-brand-rgb),0.1)]' 
                    : 'bg-abyssal/40 border-white/5 hover:border-white/12'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-sm border ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-muted font-mono">{percentage}%</span>
                </div>
                <div className="text-xs font-semibold text-white-off truncate">{cat.name}</div>
                <div className="text-lg font-bold text-white mt-1 flex items-baseline font-display">
                  {count}
                  <span className="text-[10px] text-muted font-normal ml-1 font-sans">avis</span>
                </div>
                {/* Visual heat indicator bar */}
                <div className="w-full bg-abyssal rounded-full h-1 mt-2 overflow-hidden">
                  <div 
                    className="bg-brand h-full rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main filters selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-surface rounded-[12px] border border-white/8">
        {/* Category filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold font-display transition-all duration-200 border cursor-pointer ${
              selectedCategory === null
                ? 'bg-brand text-white border-brand shadow-lg shadow-brand/10'
                : 'bg-abyssal/40 border-white/5 text-muted hover:border-white/10 hover:text-white-off'
            }`}
          >
            Toutes Catégories
          </button>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-sm text-xs font-bold font-display transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? 'bg-brand text-white border-brand shadow-lg shadow-brand/10'
                    : 'bg-abyssal/40 border-white/5 text-muted hover:border-white/10 hover:text-white-off'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Type filters (Coup de gueule vs Suggestion) */}
        <div className="flex items-center gap-2 bg-abyssal p-1 rounded-sm border border-white/8">
          <button
            onClick={() => setSelectedType(null)}
            className={`px-3 py-1 rounded-sm text-xs font-bold font-display transition-all duration-200 cursor-pointer ${
              selectedType === null
                ? 'bg-surface text-white-off border border-white/10'
                : 'text-muted hover:text-white-off'
            }`}
          >
            Tous les types
          </button>
          {TYPES.map(t => {
            const Icon = t.icon;
            const isSelected = selectedType === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-sm text-xs font-bold font-display transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? 'bg-surface text-white-off border-white/10'
                    : 'bg-transparent border-transparent text-muted hover:text-white-off'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${t.color}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
