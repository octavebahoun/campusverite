const mongoose = require('mongoose');
const Room = require('./models/Room');
const Message = require('./models/Message');

function isConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

const chatService = {
  async getRooms(pseudo) {
    if (!isConnected()) {
      throw new Error("MongoDB non connecté. Impossible de charger les salons.");
    }
    return await Room.find({ membres: pseudo }).sort({ created_at: -1 });
  },

  async createRoom({ type, membres }) {
    if (!isConnected()) {
      throw new Error("MongoDB non connecté. Impossible de créer un salon.");
    }

    // Standardize membres: sort them to make finding existing rooms deterministic
    const sortedMembres = [...membres].sort();

    // For DM, check if room already exists
    if (type === 'dm') {
      const existing = await Room.findOne({
        type: 'dm',
        membres: { $all: sortedMembres, $size: sortedMembres.length }
      });
      if (existing) return existing;
    }

    const room = new Room({ type, membres: sortedMembres });
    return await room.save();
  },

  async getMessages(roomId) {
    if (!isConnected()) {
      throw new Error("MongoDB non connecté. Impossible de charger les messages.");
    }
    return await Message.find({ room_id: roomId }).sort({ created_at: 1 });
  },

  async addMessage({ room_id, pseudo, contenu }) {
    if (!isConnected()) {
      throw new Error("MongoDB non connecté. Impossible d'envoyer un message.");
    }
    const msg = new Message({ room_id, pseudo, contenu });
    return await msg.save();
  },

  async getAllMessages() {
    if (!isConnected()) {
      throw new Error("MongoDB non connecté.");
    }
    return await Message.find({}).sort({ created_at: -1 }).limit(100);
  },

  async deleteMessage(id) {
    if (!isConnected()) {
      throw new Error("MongoDB non connecté.");
    }
    return await Message.findByIdAndDelete(id);
  }
};

module.exports = chatService;
