const express = require('express');
const router = express.Router();
const db = require('../supabase');

// GET /api/avis - Récupérer tous les avis (triés par date, filtres optionnels)
router.get('/', async (req, res) => {
  try {
    const { categorie, type } = req.query;
    const filters = {};
    if (categorie) filters.categorie = categorie;
    if (type) filters.type = type;

    const data = await db.getAvis(filters);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "Erreur lors de la récupération des avis." });
  }
});

// POST /api/avis - Soumettre un avis anonyme
router.post('/', async (req, res) => {
  try {
    const { categorie, type, contenu } = req.body;
    
    if (!categorie || !type || !contenu) {
      return res.status(400).json({ error: "Tous les champs (categorie, type, contenu) sont obligatoires." });
    }

    const validCategories = ["Pédagogie", "Infrastructure", "Administration", "Équipements"];
    const validTypes = ["coup_de_gueule", "suggestion"];

    if (!validCategories.includes(categorie)) {
      return res.status(400).json({ error: `Catégorie invalide. Doit être l'une de: ${validCategories.join(', ')}` });
    }

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Type invalide. Doit être l'un de: ${validTypes.join(', ')}` });
    }

    if (contenu.trim().length < 10) {
      return res.status(400).json({ error: "Le contenu doit faire au moins 10 caractères." });
    }

    const data = await db.createAvis({ categorie, type, contenu: contenu.trim() });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "Erreur lors de la création de l'avis." });
  }
});

// POST /api/avis/:id/vote - Voter "Utile" sur un avis
router.post('/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { pseudo } = req.body; // pseudo envoyé par le client

    if (!pseudo) {
      return res.status(400).json({ error: "Le pseudo est requis pour voter." });
    }

    const updatedAvis = await db.voteAvis(id, pseudo);
    res.json(updatedAvis);
  } catch (error) {
    // If error is double vote
    if (error.message.includes("déjà voté")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || "Erreur lors du vote." });
  }
});

// POST /api/avis/:id/signale - Signaler un avis (Fonctionnalité bonus)
router.post('/:id/signale', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAvis = await db.toggleSignale(id);
    res.json(updatedAvis);
  } catch (error) {
    res.status(500).json({ error: error.message || "Erreur lors du signalement." });
  }
});

module.exports = router;
