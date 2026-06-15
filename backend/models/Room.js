const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['dm', 'group'],
    default: 'dm'
  },
  membres: {
    type: [String],
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Avoid Overwriting Model errors in HMR / development
module.exports = mongoose.models.Room || mongoose.model('Room', RoomSchema);
