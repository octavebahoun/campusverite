const mongoose = require('mongoose');
const Room = require('./models/Room');
const Message = require('./models/Message');

// In-Memory Chat DB Fallback
const memoryRooms = [
  {
    _id: "r00000000000000000000001",
    type: "group",
    membres: ["Général", "Corbeau#1234"],
    created_at: new Date(Date.now() - 3600000 * 24)
  }
];

const memoryMessages = [
  {
    _id: "m00000000000000000000001",
    room_id: "r00000000000000000000001",
    pseudo: "Système",
    contenu: "Bienvenue dans le canal général anonyme de CampusVérité !",
    created_at: new Date(Date.now() - 3600000 * 24)
  }
];

function isConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

const chatService = {
  async getRooms(pseudo) {
    if (!isConnected()) {
      // Return rooms where member is in, or the default group room
      return memoryRooms.filter(r => r.membres.includes(pseudo) || r.type === "group");
    }
    try {
      // Find rooms where members list contains the pseudo
      return await Room.find({ membres: pseudo }).sort({ created_at: -1 });
    } catch (err) {
      console.error("MongoDB getRooms error:", err.message);
      // Fallback
      return memoryRooms.filter(r => r.membres.includes(pseudo) || r.type === "group");
    }
  },

  async createRoom({ type, membres }) {
    // Standardize membres: sort them to make finding existing rooms deterministic
    const sortedMembres = [...membres].sort();

    if (!isConnected()) {
      // For DM, check if room already exists
      if (type === 'dm') {
        const existing = memoryRooms.find(r => 
          r.type === 'dm' && 
          r.membres.length === sortedMembres.length &&
          r.membres.every((m, idx) => m === sortedMembres[idx])
        );
        if (existing) return existing;
      }

      const newRoom = {
        _id: new mongoose.Types.ObjectId().toString(),
        type,
        membres: sortedMembres,
        created_at: new Date()
      };
      memoryRooms.push(newRoom);
      return newRoom;
    }

    try {
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
    } catch (err) {
      console.error("MongoDB createRoom error:", err.message);
      throw err;
    }
  },

  async getMessages(roomId) {
    if (!isConnected()) {
      return memoryMessages.filter(m => m.room_id.toString() === roomId.toString());
    }

    try {
      return await Message.find({ room_id: roomId }).sort({ created_at: 1 });
    } catch (err) {
      console.error("MongoDB getMessages error:", err.message);
      // Fallback
      return memoryMessages.filter(m => m.room_id.toString() === roomId.toString());
    }
  },

  async addMessage({ room_id, pseudo, contenu }) {
    if (!isConnected()) {
      const newMessage = {
        _id: new mongoose.Types.ObjectId().toString(),
        room_id,
        pseudo,
        contenu,
        created_at: new Date()
      };
      memoryMessages.push(newMessage);
      return newMessage;
    }

    try {
      const msg = new Message({ room_id, pseudo, contenu });
      return await msg.save();
    } catch (err) {
      console.error("MongoDB addMessage error:", err.message);
      throw err;
    }
  }
};

module.exports = chatService;
