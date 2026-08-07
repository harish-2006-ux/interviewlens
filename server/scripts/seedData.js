require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Session = require('../models/Session');
const Question = require('../models/Question');
const Response = require('../models/Response');
const Score = require('../models/Score');
const SessionSummary = require('../models/SessionSummary');

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Session.deleteMany({});
    await Question.deleteMany({});
    await Response.deleteMany({});
    await Score.deleteMany({});
    await SessionSummary.deleteMany({});

    // Create sample user
    const user = new User({
      name: 'John Developer',
      target_role: 'Full Stack Developer',
      resume_text: 'Experienced in React, Node.js, MongoDB. Built several web applications.'
    });
    await user.save();

    // Create historical sessions for dashboard
    const sessions = [];
    const sessionDates = [
      new Date('2024-01-15'),
      new Date('2024-02-01'),
      new Date('2024-02-20')
    ];

    for (let i = 0; i < sessionDates.length; i++) {
      const session = new Session({
        user_id: user._id,
        role_title: 'Full Stack Developer',
        difficulty: 'mid',
        started_at: sessionDates[i],
        ended_at: new Date(sessionDates[i].getTime() + 30 * 60 * 1000) // 30 minutes later
      });
      await session.save();
      sessions.push(session);

      // Create session summary with improving scores
      const summary = new SessionSummary({
        session_id: session._id,
        overall_score: 60 + (i * 15), // 60, 75, 90
        avg_technical: 55 + (i * 20), // 55, 75, 95
        avg_communication: 65 + (i * 10), // 65, 75, 85
        strengths: [
          'Good technical foundation',
          'Clear communication',
          i > 0 ? 'Showing improvement' : 'Eager to learn'
        ],
        improvements: [
          'Practice more complex scenarios',
          'Work on specific examples',
          i < 2 ? 'Build confidence in technical depth' : 'Continue excellent progress'
        ]
      });
      await summary.save();
    }

    console.log('Sample data seeded successfully!');
    console.log(`Created user: ${user.name} (ID: ${user._id})`);
    console.log(`Created ${sessions.length} historical sessions with summaries`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();