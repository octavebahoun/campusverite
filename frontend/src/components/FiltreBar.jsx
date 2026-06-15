import { useMemo } from 'react';
import { Building, FileText, Flame, GraduationCap, Lightbulb, SlidersHorizontal, Wrench } from 'lucide-react';

const CATEGORIES = [
  { name: 'Pédagogie', icon: GraduationCap },
  { name: 'Infrastructure', icon: Building },
  { name: 'Administration', icon: FileText },
  { name: 'Équipements', icon: Wrench },
];

const TYPES = [
  { value: 'coup_de_gueule', label: 'Coups de gueule', icon: Flame },
  { value: 'suggestion', label: 'Suggestions', icon: Lightbulb },
];

export default function FiltreBar({
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  avisList,
}) {
  const categoryStats = useMemo(() => {
    const stats = Object.fromEntries(CATEGORIES.map((item) => [item.name, 0]));
    avisList.forEach((avis) => {
      if (stats[avis.categorie] !== undefined) stats[avis.categorie] += 1;
    });
    return stats;
  }, [avisList]);

  const totalAvis = avisList.length;

  return (
    <div className="space-y-4">
      <div className="surface p-4 md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-brand" />
            <div>
              <h2 className="font-extrabold text-white-off">Tableau de chaleur</h2>
              <p className="text-sm text-muted">Répartition des avis par catégorie.</p>
            </div>
          </div>
          {(selectedCategory || selectedType) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setSelectedType(null);
              }}
              className="btn-ghost"
            >
              Tout afficher
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const count = categoryStats[category.name] || 0;
            const percentage = totalAvis ? Math.round((count / totalAvis) * 100) : 0;
            const isSelected = selectedCategory === category.name;

            return (
              <button
                type="button"
                key={category.name}
                onClick={() => setSelectedCategory(isSelected ? null : category.name)}
                className={`surface-muted p-3 text-left transition hover:border-[rgba(var(--color-brand-rgb),0.45)] ${isSelected ? 'ring-2 ring-[rgba(var(--color-brand-rgb),0.28)]' : ''}`}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[rgba(var(--color-brand-rgb),0.1)] text-brand">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold text-muted">{percentage}%</span>
                </div>
                <div className="font-bold text-white-off">{category.name}</div>
                <div className="mt-1 text-sm text-muted">{count} avis</div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-bg)]">
                  <div
                    className="h-full rounded-full bg-brand transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="surface flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterButton active={!selectedCategory} onClick={() => setSelectedCategory(null)}>
            Toutes catégories
          </FilterButton>
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <FilterButton
                key={category.name}
                active={selectedCategory === category.name}
                onClick={() => setSelectedCategory(category.name)}
              >
                <Icon className="h-4 w-4" />
                {category.name}
              </FilterButton>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterButton active={!selectedType} onClick={() => setSelectedType(null)}>
            Tous types
          </FilterButton>
          {TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <FilterButton
                key={type.value}
                active={selectedType === type.value}
                onClick={() => setSelectedType(type.value)}
              >
                <Icon className="h-4 w-4" />
                {type.label}
              </FilterButton>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-9 items-center gap-2 rounded-md border px-3 py-2 text-sm font-bold transition ${
        active
          ? 'border-brand bg-[rgba(var(--color-brand-rgb),0.1)] text-brand'
          : 'border-[var(--color-border)] bg-transparent text-muted hover:border-[rgba(var(--color-brand-rgb),0.45)] hover:text-brand'
      }`}
    >
      {children}
    </button>
  );
}
