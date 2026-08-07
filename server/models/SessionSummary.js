const mongoose = require('mongoose');

const sessionSummarySchema = new mongoose.Schema({
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    unique: true
  },
  overall_score: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  avg_technical: {
    type: Number,
    min: 0,
    max: 100
  },
  avg_communication: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  strengths: [String],
  improvements: [String],
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SessionSummary', sessionSummarySchema);