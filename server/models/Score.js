const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  response_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Response',
    required: true
  },
  technical_score: {
    type: Number,
    min: 0,
    max: 100
  },
  communication_score: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  filler_word_ratio: {
    type: Number,
    default: 0
  },
  filler_words_found: [{
    word: String,
    position: Number
  }],
  hedge_phrases_found: [{
    phrase: String,
    position: Number
  }],
  star_detected: {
    type: Boolean,
    default: false
  },
  feedback_text: {
    type: String
  },
  missing_concepts: [String]
});

module.exports = mongoose.model('Score', scoreSchema);