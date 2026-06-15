const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Configurer dotenv
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configurer Socket.io avec CORS
const FRONTEND_URL = process.env.FRONTEND_URL || "https://campusverite.vercel.app";
const io = socketIo(server, {
  cors: {
    origin: [FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: [FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"]
}));
app.use(express.json());

// Routes
const avisRouter = require('./routes/avis');
const votesRouter = require('./routes/votes');
const chatRouter = require('./routes/chat');
const adminRouter = require('./routes/admin');

app.use('/api/avis', avisRouter);
app.use('/api/votes', votesRouter);
app.use('/api', chatRouter); // Ainsi, /rooms et /rooms/:id/messages sont sous /api/rooms et /api/rooms/:id/messages
app.use('/api/admin', adminRouter);

// Route de base de l'API
app.get('/', (req, res) => {
  res.json({ message: "Serveur API CampusVérité fonctionnel." });
});

// Initialiser les handlers Socket.io
require('./socket')(io);

// Connexion MongoDB
const mongoUri = process.env.MONGO_URI;
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => console.log("🟢 Connexion MongoDB établie avec succès."))
    .catch((err) => {
      console.error("🔴 Erreur de connexion MongoDB :", err.message);
      console.log("⚠️  Le serveur utilisera le mode mémoire de secours pour le chat.");
    });
} else {
  console.warn("⚠️  MONGO_URI manquant dans .env. Mode mémoire activé pour le chat.");
}

// Lancer le serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur en cours d'exécution sur le port ${PORT}`);
});
