const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  sequence_no: {
    type: Number,
    required: true
  },
  question_text: {
    type: String,
    required: true
  },
  question_type: {
    type: String,
    enum: ['behavioral', 'technical', 'fit'],
    required: true
  },
  is_followup: {
    type: Boolean,
    default: false
  },
  parent_question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }
});

module.exports = mongoose.model('Question', questionSchema);