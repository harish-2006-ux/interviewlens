const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  target_role: {
    type: String,
    required: true
  },
  resume_text: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);