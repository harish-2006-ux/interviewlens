const express = require('express');
const User = require('../models/User');
const SessionSummary = require('../models/SessionSummary');
const Session = require('../models/Session');

const router = express.Router();

// Create or get user
router.post('/', async (req, res) => {
  try {
    const { name, target_role, resume_text } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ name, target_role });
    
    if (!user) {
      user = new User({ name, target_role, resume_text });
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error creating/finding user:', error);
    res.status(500).json({ error: 'Failed to create/find user' });
  }
});

// Get user dashboard data
router.get('/:userId/dashboard', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get all sessions for this user with summaries
    const sessions = await Session.find({ user_id: userId })
      .sort({ started_at: 1 })
      .lean();
    
    const sessionIds = sessions.map(s => s._id);
    const summaries = await SessionSummary.find({ 
      session_id: { $in: sessionIds } 
    }).lean();
    
    // Create lookup map
    const summaryMap = {};
    summaries.forEach(summary => {
      summaryMap[summary.session_id.toString()] = summary;
    });
    
    // Combine session data with summaries
    const dashboardData = sessions.map(session => {
      const summary = summaryMap[session._id.toString()];
      return {
        session_id: session._id,
        date: session.started_at,
        role_title: session.role_title,
        difficulty: session.difficulty,
        overall_score: summary?.overall_score || 0,
        avg_technical: summary?.avg_technical || 0,
        avg_communication: summary?.avg_communication || 0,
        completed: !!session.ended_at
      };
    });
    
    res.json({ sessions: dashboardData });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;