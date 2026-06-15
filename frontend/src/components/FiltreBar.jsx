import React from 'react';
import { Flame, Lightbulb, GraduationCap, Building, Wrench, FileText, Activity } from 'lucide-react';

const CATEGORIES = [
  { name: 'Pédagogie', icon: GraduationCap, color: 'text-amber-400 bg-amber-500/10' },
  { name: 'Infrastructure', icon: Building, color: 'text-sky-400 bg-sky-500/10' },
  { name: 'Administration', icon: FileText, color: 'text-teal-400 bg-teal-500/10' },
  { name: 'Équipements', icon: Wrench, color: 'text-indigo-400 bg-indigo-500/10' },
];

const TYPES = [
  { value: 'coup_de_gueule', label: 'Coup de gueule', icon: Flame, color: 'text-rose-500 bg-rose-500/10' },
  { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'text-emerald-500 bg-emerald-500/10' }
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
      <div className="glass p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-5 h-5 text-purple-400 animate-pulse" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Tableau de Chaleur Campus
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.map(cat => {
            const count = categoryStats[cat.name] || 0;
            const percentage = totalAvis > 0 ? Math.round((count / totalAvis) * 100) : 0;
            const Icon = cat.icon;
            
            return (
              <div 
                key={cat.name} 
                className={`p-3 rounded-xl border transition-all duration-300 ${
                  selectedCategory === cat.name 
                    ? 'bg-purple-950/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{percentage}%</span>
                </div>
                <div className="text-xs font-medium text-slate-300 truncate">{cat.name}</div>
                <div className="text-lg font-bold text-white mt-1 flex items-baseline">
                  {count}
                  <span className="text-[10px] text-slate-500 font-normal ml-1">avis</span>
                </div>
                {/* Visual heat indicator bar */}
                <div className="w-full bg-slate-950 rounded-full h-1 mt-2 overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main filters selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 glass rounded-2xl border border-slate-800">
        {/* Category filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              selectedCategory === null
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
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
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Type filters (Coup de gueule vs Suggestion) */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setSelectedType(null)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
              selectedType === null
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
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
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${t.value === 'coup_de_gueule' ? 'text-rose-500' : 'text-emerald-500'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
