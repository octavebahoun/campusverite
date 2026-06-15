const express = require('express');
const router = express.Router();
const db = require('../supabase');

// GET /api/votes - Récupérer tous les IDs des avis votés par un pseudo
router.get('/', async (req, res) => {
  try {
    const { pseudo } = req.query;
    if (!pseudo) {
      return res.status(400).json({ error: "Le pseudo est obligatoire pour récupérer ses votes." });
    }
    const votedIds = await db.getVotesByPseudo(pseudo);
    res.json(votedIds);
  } catch (error) {
    res.status(500).json({ error: error.message || "Erreur lors de la récupération des votes." });
  }
});

module.exports = router;
