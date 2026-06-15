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
