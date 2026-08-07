const express = require('express');
const Session = require('../models/Session');
const Question = require('../models/Question');
const Response = require('../models/Response');
const Score = require('../models/Score');
const SessionSummary = require('../models/SessionSummary');
const User = require('../models/User');
const geminiClient = require('../services/geminiClient');
const { scoreCommunication } = require('../services/communicationScorer');

const router = express.Router();

// Start new session and generate questions
router.post('/start', async (req, res) => {
  try {
    const { user_id, role_title, difficulty } = req.body;
    
    // Get user's resume
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create session
    const session = new Session({
      user_id,
      role_title,
      difficulty
    });
    await session.save();
    
    // Generate questions
    const questionsData = await geminiClient.generateQuestions(
      role_title, 
      user.resume_text, 
      difficulty
    );
    
    // Save questions to database
    const questions = [];
    for (let i = 0; i < questionsData.questions.length; i++) {
      const questionData = questionsData.questions[i];
      const question = new Question({
        session_id: session._id,
        sequence_no: i + 1,
        question_text: questionData.text,
        question_type: questionData.type
      });
      await question.save();
      questions.push(question);
    }
    
    res.json({
      session_id: session._id,
      questions: questions.map(q => ({
        id: q._id,
        text: q.question_text,
        type: q.question_type,
        sequence_no: q.sequence_no
      }))
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// Submit answer and get scoring + potential follow-up
router.post('/answer', async (req, res) => {
  try {
    const { question_id, answer_text, input_mode, response_time_sec } = req.body;
    
    // Get question details
    const question = await Question.findById(question_id).populate('session_id');
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Save response
    const response = new Response({
      question_id,
      answer_text,
      input_mode,
      response_time_sec
    });
    await response.save();
    
    // Score communication (always)
    const commScore = scoreCommunication(answer_text);
    
    // Score technical (for technical questions only)
    let techScore = null;
    if (question.question_type === 'technical') {
      const session = question.session_id;
      techScore = await geminiClient.scoreTechnical(
        question.question_text,
        answer_text,
        session.role_title
      );
    }
    
    // Save scores
    const score = new Score({
      response_id: response._id,
      technical_score: techScore?.technical_score || null,
      communication_score: commScore.score,
      filler_word_ratio: commScore.fillerWordRatio,
      filler_words_found: commScore.fillerWordsFound,
      hedge_phrases_found: commScore.hedgePhrasesFound,
      star_detected: commScore.starDetected,
      feedback_text: techScore?.feedback || "Communication patterns analyzed",
      missing_concepts: techScore?.missing_concepts || []
    });
    await score.save();
    
    // Check if follow-up is needed
    let followUpQuestion = null;
    const shouldFollowUp = (
      (techScore && techScore.technical_score < 50) || 
      answer_text.split(' ').length < 25
    );
    
    if (shouldFollowUp && !question.is_followup) {
      try {
        const followUpData = await geminiClient.generateFollowUp(
          question.question_text,
          answer_text,
          score.missing_concepts
        );
        
        // Save follow-up question
        const followUp = new Question({
          session_id: question.session_id._id,
          sequence_no: question.sequence_no + 0.5, // Between original questions
          question_text: followUpData.followup,
          question_type: question.question_type,
          is_followup: true,
          parent_question_id: question._id
        });
        await followUp.save();
        
        followUpQuestion = {
          id: followUp._id,
          text: followUp.question_text,
          type: followUp.question_type,
          is_followup: true
        };
      } catch (followUpError) {
        console.error('Error generating follow-up:', followUpError);
      }
    }
    
    res.json({
      score: {
        technical_score: score.technical_score,
        communication_score: score.communication_score,
        filler_word_ratio: score.filler_word_ratio,
        star_detected: score.star_detected,
        feedback: score.feedback_text,
        filler_words_found: score.filler_words_found,
        hedge_phrases_found: score.hedge_phrases_found
      },
      follow_up_question: followUpQuestion
    });
  } catch (error) {
    console.error('Error processing answer:', error);
    res.status(500).json({ error: 'Failed to process answer' });
  }
});

// End session and generate summary
router.post('/:sessionId/summary', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Mark session as ended
    await Session.findByIdAndUpdate(sessionId, { ended_at: new Date() });
    
    // Get all questions and responses for this session
    const questions = await Question.find({ session_id: sessionId }).lean();
    const questionIds = questions.map(q => q._id);
    
    const responses = await Response.find({ 
      question_id: { $in: questionIds } 
    }).lean();
    
    const responseIds = responses.map(r => r._id);
    const scores = await Score.find({ 
      response_id: { $in: responseIds } 
    }).lean();
    
    // Create lookup maps
    const responseMap = {};
    responses.forEach(r => {
      responseMap[r.question_id.toString()] = r;
    });
    
    const scoreMap = {};
    scores.forEach(s => {
      scoreMap[s.response_id.toString()] = s;
    });
    
    // Combine data for summary generation
    const questionsAndAnswers = questions.map(q => {
      const response = responseMap[q._id.toString()];
      const score = response ? scoreMap[response._id.toString()] : null;
      
      return {
        question: q.question_text,
        type: q.question_type,
        answer: response?.answer_text || '',
        technical_score: score?.technical_score,
        communication_score: score?.communication_score,
        feedback: score?.feedback_text
      };
    }).filter(qa => qa.answer); // Only include answered questions
    
    // Calculate averages
    const technicalScores = scores
      .map(s => s.technical_score)
      .filter(s => s !== null && s !== undefined);
    const communicationScores = scores
      .map(s => s.communication_score)
      .filter(s => s !== null && s !== undefined);
    
    const avgTechnical = technicalScores.length > 0 
      ? Math.round(technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length)
      : null;
    const avgCommunication = communicationScores.length > 0
      ? Math.round(communicationScores.reduce((a, b) => a + b, 0) / communicationScores.length)
      : 0;
    
    // Generate AI summary
    const summaryData = await geminiClient.generateSessionSummary(
      questionsAndAnswers,
      scores
    );
    
    // Save session summary
    const sessionSummary = new SessionSummary({
      session_id: sessionId,
      overall_score: summaryData.overall_score,
      avg_technical: avgTechnical,
      avg_communication: avgCommunication,
      strengths: summaryData.strengths,
      improvements: summaryData.improvements
    });
    await sessionSummary.save();
    
    res.json({
      session_summary: {
        overall_score: sessionSummary.overall_score,
        avg_technical: sessionSummary.avg_technical,
        avg_communication: sessionSummary.avg_communication,
        strengths: sessionSummary.strengths,
        improvements: sessionSummary.improvements
      },
      detailed_scores: questionsAndAnswers
    });
  } catch (error) {
    console.error('Error generating session summary:', error);
    res.status(500).json({ error: 'Failed to generate session summary' });
  }
});

// Get session details
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await Session.findById(sessionId).populate('user_id');
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const questions = await Question.find({ session_id: sessionId })
      .sort({ sequence_no: 1 });
    
    res.json({
      session,
      questions: questions.map(q => ({
        id: q._id,
        text: q.question_text,
        type: q.question_type,
        sequence_no: q.sequence_no,
        is_followup: q.is_followup
      }))
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

module.exports = router;