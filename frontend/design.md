# CampusVérité — Brand & Design System

## Identité Visuelle

> "La parole libre, sans visage."

Ambiance : mur d'expression anonyme, tension contenue, parole militante.  
Pas institutionnel — humain, brut, direct.

---

## Palette de Couleurs

| Nom | Hex | Usage |
|-----|-----|-------|
| Noir Abyssal | `#0D0D0D` | Background principal |
| Surface Card | `#161616` | Cards, sidebar, panels |
| Border Subtil | `rgba(255,255,255,0.08)` | Bordures, séparateurs |
| Blanc Cassé | `#F0F0F0` | Texte principal |
| Gris Doux | `#9CA3AF` | Texte secondaire, labels |
| Rouge Brûlant | `#FF4500` | Accent principal, CTA, Coup de Gueule |
| Vert Signal | `#22C55E` | Suggestion, succès, vote utile |
| Bleu Info | `#3B82F6` | Info, filtre actif |

---

## Typographie

| Rôle | Famille | Poids | Usage |
|------|---------|-------|-------|
| Display | Space Grotesk | 700 | Titres, hero, badges |
| Body | Inter | 400 / 500 | Texte courant, formulaires |
| Mono | JetBrains Mono | 400 | Pseudos, timestamps, IDs |

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500&family=JetBrains+Mono&display=swap');

--font-display: 'Space Grotesk', sans-serif;
--font-body: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

---

## Tokens CSS

```css
:root {
  /* Couleurs */
  --bg:           #0D0D0D;
  --surface:      #161616;
  --border:       rgba(255, 255, 255, 0.08);
  --text:         #F0F0F0;
  --text-muted:   #9CA3AF;
  --accent:       #FF4500;
  --success:      #22C55E;
  --info:         #3B82F6;

  /* Typographie */
  --font-display: 'Space Grotesk', sans-serif;
  --font-body:    'Inter', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* Spacing */
  --radius-sm:    6px;
  --radius-md:    12px;
  --radius-lg:    20px;

  /* Shadows */
  --shadow-card:  0 0 0 1px rgba(255,255,255,0.06);
  --glow-accent:  0 0 20px rgba(255, 69, 0, 0.25);
}
```

---

## Composants Clés

### AvisCard
```
┌─────────────────────────────────────────┐
│  [COUP DE GUEULE]        Pédagogie  ·  │ ← badges colorés
│                                         │
│  "Le prof n'a pas assuré le cours      │ ← texte blanc
│   depuis 3 semaines..."                 │
│                                         │
│  Corbeau#4821 · il y a 2h    [👍 12]   │ ← mono + vote
└─────────────────────────────────────────┘
bg: #161616 | border: rgba(255,255,255,0.08) | radius: 12px
```

### Badges Type
| Type | Couleur | Label |
|------|---------|-------|
| Coup de Gueule | `#FF4500` bg 15% + border | 🔥 COUP DE GUEULE |
| Suggestion | `#22C55E` bg 15% + border | 💡 SUGGESTION |
| Pétition (bonus) | `#F59E0B` bg 15% + border | 📢 PÉTITION |

### Bouton Principal (CTA)
```css
.btn-primary {
  background: #FF4500;
  color: #fff;
  font-family: var(--font-display);
  font-weight: 700;
  border-radius: var(--radius-sm);
  padding: 10px 24px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-primary:hover { opacity: 0.85; }
```

### Input / Textarea
```css
.input {
  background: #1A1A1A;
  border: 1px solid rgba(255,255,255,0.10);
  color: var(--text);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-family: var(--font-body);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.input:focus {
  border-color: var(--accent);
}
```

---

## Signature Design

**L'élément unique :** le pseudo apparaît toujours en `JetBrains Mono` avec une couleur `#FF4500` atténuée — comme un tag graffiti discret. Rappelle que derrière chaque avis, il y a une voix réelle mais protégée.

---

## Layout Global

```
┌──────────────────────────────────────────────┐
│  NAVBAR  · CampusVérité  [Feed] [Chat] [+]  │
├──────────────────────────────────────────────┤
│  FILTRES : Tous | Péda | Infra | Admin | Éq  │
├──────────────┬───────────────────────────────┤
│              │                               │
│  FEED AVIS   │  (sidebar optionnelle)        │
│  scroll      │  Top 3 chauds (bonus)         │
│              │                               │
└──────────────┴───────────────────────────────┘
```

---

## Animations (légères)

| Élément | Animation |
|---------|-----------|
| Card au hover | `translateY(-2px)` + glow accent subtil |
| Vote click | Scale `1 → 1.2 → 1` sur le compteur |
| Message chat | Slide-in depuis le bas `opacity 0→1` |
| Badge pétition | Pulse lent sur la bordure orange |

```css
/* Hover card */
.avis-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.avis-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--glow-accent);
}
```