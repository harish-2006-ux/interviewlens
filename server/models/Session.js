const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role_title: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['junior', 'mid', 'senior'],
    required: true
  },
  started_at: {
    type: Date,
    default: Date.now
  },
  ended_at: {
    type: Date
  }
});

module.exports = mongoose.model('Session', sessionSchema);