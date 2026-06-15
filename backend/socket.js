const chatService = require('./chatService');

// Map to track connected sockets and their associated pseudonyms
const activeUsers = new Map(); // socket.id -> pseudo

module.exports = function (io) {
  
  function broadcastOnlineUsers() {
    // Get unique pseudonyms of currently online users
    const uniquePseudos = Array.from(new Set(activeUsers.values()));
    io.emit('online_users', uniquePseudos);
  }

  io.on('connection', (socket) => {
    console.log(`🔌 Client connecté : ${socket.id}`);

    // Register active user pseudonym
    socket.on('register_user', (pseudo) => {
      if (pseudo) {
        socket.pseudo = pseudo;
        activeUsers.set(socket.id, pseudo);
        console.log(`👤 Pseudo enregistré : ${pseudo} sur socket ${socket.id}`);
        broadcastOnlineUsers();
      }
    });

    // Rejoindre une room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`👤 Client ${socket.pseudo || socket.id} a rejoint le salon: ${roomId}`);
    });

    // Envoyer un message
    socket.on('send_message', async (data) => {
      try {
        const { room_id, pseudo, contenu } = data;
        
        if (!room_id || !pseudo || !contenu) {
          console.warn("⚠️ Event 'send_message' reçu avec des données incomplètes:", data);
          return;
        }

        // Sauvegarder le message en base
        const savedMessage = await chatService.addMessage({ room_id, pseudo, contenu });
        
        // Diffuser le message à tous les membres du salon
        io.to(room_id).emit('receive_message', savedMessage);
      } catch (err) {
        console.error("🔴 Erreur lors du traitement de 'send_message':", err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client déconnecté : ${socket.id}`);
      if (activeUsers.has(socket.id)) {
        console.log(`👤 Pseudo retiré : ${activeUsers.get(socket.id)}`);
        activeUsers.delete(socket.id);
        broadcastOnlineUsers();
      }
    });
  });
};
