const express = require('express');
const router = express.Router();
const db = require('../supabase');
const chatService = require('../chatService');

// Admin Authorization Middleware
const adminAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: "Clé d'administration manquante." });
  }
  const key = authHeader.replace('Bearer ', '').trim();
  if (key !== 'octavebahounestmeilleurequeclaude') {
    return res.status(403).json({ error: "Clé d'administration invalide." });
  }
  next();
};

// POST /api/admin/login — Verify credentials
router.post('/login', (req, res) => {
  const { key } = req.body;
  if (key === 'octavebahounestmeilleurequeclaude') {
    return res.json({ success: true, message: "Authentification admin réussie." });
  }
  return res.status(401).json({ error: "Clé d'administration invalide." });
});

// GET /api/admin/avis — Get all feedback for moderation
router.get('/avis', adminAuth, async (req, res) => {
  try {
    const data = await db.getAllAvis();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "Impossible de charger les avis pour modération." });
  }
});

// POST /api/admin/avis/:id/unflag — Approve / unflag an avis
router.post('/avis/:id/unflag', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.unflagAvis(id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message || "Erreur de validation de l'avis." });
  }
});

// DELETE /api/admin/avis/:id — Delete an avis
router.delete('/avis/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.deleteAvis(id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message || "Erreur de suppression de l'avis." });
  }
});

// GET /api/admin/messages — Get recent chat messages
router.get('/messages', adminAuth, async (req, res) => {
  try {
    const data = await chatService.getAllMessages();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "Erreur de chargement des messages de chat." });
  }
});

// DELETE /api/admin/messages/:id — Delete a chat message
router.delete('/messages/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await chatService.deleteMessage(id);
    res.json({ success: true, message: "Message supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ error: error.message || "Erreur de suppression du message." });
  }
});

module.exports = router;
