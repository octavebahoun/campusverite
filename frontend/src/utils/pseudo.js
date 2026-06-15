const animaux = [
  "Corbeau", "Loup", "Renard", "Aigle", "Tigre", "Lynx", 
  "Ours", "Faucon", "Panthère", "Hibou", "Lion", "Guépard", 
  "Cerf", "Écureuil", "Loutre", "Castor", "Panda", "Koala"
];

export function getOrCreatePseudo() {
  if (typeof window === "undefined") return "Anonyme#0000";
  
  let pseudo = localStorage.getItem("cv_pseudo");
  if (!pseudo) {
    const animal = animaux[Math.floor(Math.random() * animaux.length)];
    const number = Math.floor(1000 + Math.random() * 9000);
    pseudo = `${animal}#${number}`;
    localStorage.setItem("cv_pseudo", pseudo);
  }
  return pseudo;
}

export function resetPseudo() {
  localStorage.removeItem("cv_pseudo");
  return getOrCreatePseudo();
}

/**
 * Calculates a unique theme variant for a given pseudonym.
 * Returns the theme CSS class, a custom slogan, accent color info, and a theme name.
 */
export function getPseudoTheme(pseudo) {
  if (!pseudo) {
    return { 
      class: 'theme-red', 
      slogan: "La parole libre, sans visage.", 
      colorHex: '#FF4500', 
      name: 'Militant' 
    };
  }
  
  let hash = 0;
  for (let i = 0; i < pseudo.length; i++) {
    hash = pseudo.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 4;
  
  const themes = [
    { 
      class: 'theme-red', 
      slogan: "La parole libre, sans visage.", 
      colorHex: '#FF4500', 
      name: 'Militant' 
    },
    { 
      class: 'theme-green', 
      slogan: "La vérité brute, sans filtre.", 
      colorHex: '#22C55E', 
      name: 'Cyber' 
    },
    { 
      class: 'theme-blue', 
      slogan: "L'écho du campus, dans l'ombre.", 
      colorHex: '#3B82F6', 
      name: 'Ombre' 
    },
    { 
      class: 'theme-amber', 
      slogan: "Le cri du campus, sans concession.", 
      colorHex: '#F59E0B', 
      name: 'Brut' 
    }
  ];
  
  return themes[index];
}
