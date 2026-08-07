const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  answer_text: {
    type: String,
    required: true
  },
  input_mode: {
    type: String,
    enum: ['text', 'voice'],
    required: true
  },
  response_time_sec: {
    type: Number
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Response', responseSchema);