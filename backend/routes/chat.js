const express = require('express');
const router = express.Router();
const chatService = require('../chatService');

// GET /api/rooms - Récupérer les salons d'un utilisateur
router.get('/rooms', async (req, res) => {
  try {
    const { pseudo } = req.query;
    if (!pseudo) {
      return res.status(400).json({ error: "Le pseudo est requis." });
    }
    const rooms = await chatService.getRooms(pseudo);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message || "Erreur de récupération des salons." });
  }
});

// POST /api/rooms - Créer un salon (DM ou groupe)
router.post('/rooms', async (req, res) => {
  try {
    const { type, membres } = req.body;
    if (!type || !membres || !Array.isArray(membres) || membres.length === 0) {
      return res.status(400).json({ error: "Les champs 'type' (dm ou group) et 'membres' (tableau) sont requis." });
    }

    const room = await chatService.createRoom({ type, membres });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message || "Erreur lors de la création du salon." });
  }
});

// GET /api/rooms/:id/messages - Récupérer les messages d'un salon
router.get('/rooms/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await chatService.getMessages(id);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message || "Erreur lors de la récupération des messages." });
  }
});

module.exports = router;
