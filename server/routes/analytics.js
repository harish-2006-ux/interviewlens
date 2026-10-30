const express = require('express');
const Session = require('../models/Session');
const SessionSummary = require('../models/SessionSummary');
const Score = require('../models/Score');
const User = require('../models/User');
const Question = require('../models/Question');
const Response = require('../models/Response');

const router = express.Router();

// Get overview statistics
router.get('/overview', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSessions = await Session.countDocuments();
    const completedSessions = await Session.countDocuments({ ended_at: { $exists: true } });
    
    const summaries = await SessionSummary.find({});
    const avgOverallScore = summaries.length > 0 
      ? Math.round(summaries.reduce((sum, s) => sum + (s.overall_score || 0), 0) / summaries.length)
      : 0;
    const avgTechnical = summaries.length > 0
      ? Math.round(summaries.reduce((sum, s) => sum + (s.avg_technical || 0), 0) / summaries.length)
      : 0;
    const avgCommunication = summaries.length > 0
      ? Math.round(summaries.reduce((sum, s) => sum + (s.avg_communication || 0), 0) / summaries.length)
      : 0;

    const completionRate = totalSessions > 0 
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;

    res.json({
      totalUsers,
      totalSessions,
      completedSessions,
      completionRate,
      avgOverallScore,
      avgTechnical,
      avgCommunication
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

// Get user analytics
router.get('/users', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    const users = await User.find().lean();
    const userSessions = await Session.aggregate([
      {
        $group: {
          _id: '$user_id',
          sessionCount: { $sum: 1 }
        }
      }
    ]);

    const userSessionMap = {};
    userSessions.forEach(us => {
      userSessionMap[us._id.toString()] = us.sessionCount;
    });

    const userActivity = users.map(user => ({
      name: user.name,
      role: user.target_role,
      sessions: userSessionMap[user._id.toString()] || 0,
      createdAt: user.created_at
    }));

    res.json({
      totalUsers,
      userActivity: userActivity.slice(0, 10),
      totalActivity: userActivity
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// Get session analytics
router.get('/sessions', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    
    if (startDate || endDate) {
      query.started_at = {};
      if (startDate) query.started_at.$gte = new Date(startDate);
      if (endDate) query.started_at.$lte = new Date(endDate);
    }

    const sessions = await Session.find(query).lean();
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.ended_at).length;

    const sessionsByDifficulty = await Session.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]);

    const sessionsByRole = await Session.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$role_title',
          count: { $sum: 1 }
        }
      }
    ]);

    const durations = sessions
      .filter(s => s.started_at && s.ended_at)
      .map(s => (new Date(s.ended_at) - new Date(s.started_at)) / 1000 / 60); // minutes
    
    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    res.json({
      totalSessions,
      completedSessions,
      completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
      avgDuration,
      sessionsByDifficulty,
      sessionsByRole
    });
  } catch (error) {
    console.error('Error fetching session analytics:', error);
    res.status(500).json({ error: 'Failed to fetch session analytics' });
  }
});

// Get performance trends
router.get('/performance', async (req, res) => {
  try {
    const { userId, days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const query = { started_at: { $gte: startDate } };
    if (userId) query.user_id = userId;

    const sessions = await Session.find(query)
      .populate('_id')
      .sort({ started_at: 1 })
      .lean();

    const sessionIds = sessions.map(s => s._id);
    
    const summaries = await SessionSummary.find({
      session_id: { $in: sessionIds }
    }).sort({ _id: 1 }).lean();

    const performanceData = summaries.map((summary, index) => ({
      sessionNumber: index + 1,
      date: summary._id,
      overallScore: summary.overall_score,
      technicalScore: summary.avg_technical,
      communicationScore: summary.avg_communication
    }));

    // Calculate trend
    const overallTrend = performanceData.length >= 2
      ? performanceData[performanceData.length - 1].overallScore - performanceData[0].overallScore
      : 0;

    res.json({
      performanceData,
      trend: overallTrend,
      average: performanceData.length > 0
        ? Math.round(performanceData.reduce((sum, p) => sum + p.overallScore, 0) / performanceData.length)
        : 0
    });
  } catch (error) {
    console.error('Error fetching performance trends:', error);
    res.status(500).json({ error: 'Failed to fetch performance trends' });
  }
});

// Get communication metrics
router.get('/communication', async (req, res) => {
  try {
    const scores = await Score.find({ filler_word_ratio: { $exists: true } }).lean();
    
    const totalFillerWords = scores.reduce((sum, s) => sum + (s.filler_words_found?.length || 0), 0);
    const totalResponses = scores.length;
    const responseWithFillers = scores.filter(s => s.filler_words_found?.length > 0).length;
    const responseWithHedges = scores.filter(s => s.hedge_phrases_found?.length > 0).length;
    const starDetections = scores.filter(s => s.star_detected).length;

    // Collect all filler words
    const fillerWordMap = {};
    scores.forEach(score => {
      (score.filler_words_found || []).forEach(fw => {
        fillerWordMap[fw.word] = (fillerWordMap[fw.word] || 0) + 1;
      });
    });

    const fillerWordsAnalysis = Object.entries(fillerWordMap)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      totalResponses,
      avgFillerWordsPerResponse: totalResponses > 0 ? (totalFillerWords / totalResponses).toFixed(2) : 0,
      responsesWithFillers: responseWithFillers,
      responsesWithHedges: responseWithHedges,
      starStructureUsage: totalResponses > 0 ? Math.round((starDetections / totalResponses) * 100) : 0,
      topFillerWords: fillerWordsAnalysis
    });
  } catch (error) {
    console.error('Error fetching communication metrics:', error);
    res.status(500).json({ error: 'Failed to fetch communication metrics' });
  }
});

// Get technical metrics
router.get('/technical', async (req, res) => {
  try {
    const scores = await Score.find({ technical_score: { $exists: true, $ne: null } }).lean();
    
    const technicalScores = scores.map(s => s.technical_score);
    const avgTechnical = technicalScores.length > 0
      ? Math.round(technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length)
      : 0;

    const scoreDistribution = {
      excellent: technicalScores.filter(s => s >= 80).length,
      good: technicalScores.filter(s => s >= 60 && s < 80).length,
      average: technicalScores.filter(s => s >= 40 && s < 60).length,
      poor: technicalScores.filter(s => s < 40).length
    };

    // Questions aggregation
    const questions = await Question.find({}).lean();
    const questionTypes = {};
    
    for (const question of questions) {
      if (!questionTypes[question.question_type]) {
        questionTypes[question.question_type] = { count: 0, totalScore: 0 };
      }
      questionTypes[question.question_type].count++;
    }

    res.json({
      avgScore: avgTechnical,
      totalResponses: scores.length,
      scoreDistribution,
      questionTypes: Object.entries(questionTypes).map(([type, data]) => ({
        type,
        count: data.count
      }))
    });
  } catch (error) {
    console.error('Error fetching technical metrics:', error);
    res.status(500).json({ error: 'Failed to fetch technical metrics' });
  }
});

// Get detailed report for export
router.get('/export', async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    const overview = await router.get('/overview');
    const users = await User.find().lean();
    const sessions = await Session.find().lean();
    const summaries = await SessionSummary.find().lean();
    const scores = await Score.find().lean();

    const report = {
      generatedAt: new Date(),
      overview: {
        totalUsers: users.length,
        totalSessions: sessions.length,
        totalScores: scores.length
      },
      data: {
        users,
        sessions,
        summaries,
        scores
      }
    };

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics-report.csv"');
      // Convert to CSV
      res.send(convertToCSV(report));
    } else {
      res.json(report);
    }
  } catch (error) {
    console.error('Error generating export:', error);
    res.status(500).json({ error: 'Failed to generate export' });
  }
});

// Helper function to convert to CSV
function convertToCSV(report) {
  let csv = 'Analytics Report\n';
  csv += `Generated: ${report.generatedAt}\n\n`;
  
  csv += 'OVERVIEW\n';
  csv += `Total Users,Total Sessions,Total Scores\n`;
  csv += `${report.overview.totalUsers},${report.overview.totalSessions},${report.overview.totalScores}\n\n`;
  
  csv += 'SESSIONS\n';
  csv += 'Session ID,User ID,Role,Difficulty,Status,Started,Ended\n';
  report.data.sessions.forEach(s => {
    csv += `${s._id},${s.user_id},${s.role_title},${s.difficulty},${s.ended_at ? 'Completed' : 'Pending'},${s.started_at},${s.ended_at || 'N/A'}\n`;
  });

  return csv;
}

module.exports = router;
