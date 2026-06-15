const chatService = require('./chatService');

module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connecté : ${socket.id}`);

    // Rejoindre une room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`👤 Client ${socket.id} a rejoint le salon: ${roomId}`);
    });

    // Envoyer un message
    socket.on('send_message', async (data) => {
      try {
        const { room_id, pseudo, contenu } = data;
        
        if (!room_id || !pseudo || !contenu) {
          console.warn("⚠️ Event 'send_message' reçu avec des données incomplètes:", data);
          return;
        }

        // Sauvegarder le message en base (ou mémoire)
        const savedMessage = await chatService.addMessage({ room_id, pseudo, contenu });
        
        // Diffuser le message à tous les membres du salon (y compris l'émetteur)
        io.to(room_id).emit('receive_message', savedMessage);
      } catch (err) {
        console.error("🔴 Erreur lors du traitement de 'send_message':", err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client déconnecté : ${socket.id}`);
    });
  });
};
