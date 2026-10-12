// Quick demo server with Socket.IO for real video connections
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = 3001;

app.use(cors());
app.use(express.json());

// In-memory storage for demo
let users = [];
let sessions = [];
let questions = [];
let responses = [];
let scores = [];
let summaries = [];
let rooms = new Map(); // Store room participants

// Demo data (same as before)
const demoUser = {
  _id: 'demo-user-1',
  name: 'John Developer',
  target_role: 'Full Stack Developer',
  resume_text: 'Experienced in React, Node.js, MongoDB.'
};

const demoSessions = [
  { _id: 'session-1', user_id: 'demo-user-1', role_title: 'Full Stack Developer', difficulty: 'mid', started_at: new Date('2026-07-15'), ended_at: new Date('2026-07-15T00:30:00') },
  { _id: 'session-2', user_id: 'demo-user-1', role_title: 'Full Stack Developer', difficulty: 'mid', started_at: new Date('2026-07-20'), ended_at: new Date('2026-07-20T00:30:00') },
  { _id: 'session-3', user_id: 'demo-user-1', role_title: 'Full Stack Developer', difficulty: 'mid', started_at: new Date('2026-07-25'), ended_at: new Date('2026-07-25T00:30:00') },
  { _id: 'session-4', user_id: 'demo-user-1', role_title: 'Full Stack Developer', difficulty: 'mid', started_at: new Date('2026-07-30'), ended_at: new Date('2026-07-30T00:30:00') }
];

const demoSummaries = [
  { _id: 'summary-1', session_id: 'session-1', overall_score: 30, avg_technical: 25, avg_communication: 35, strengths: ['Attempted to outline process'], improvements: ['Reduce filler language', 'Use specific terms'] },
  { _id: 'summary-2', session_id: 'session-2', overall_score: 60, avg_technical: 55, avg_communication: 65, strengths: ['Good technical foundation'], improvements: ['Practice more examples'] },
  { _id: 'summary-3', session_id: 'session-3', overall_score: 75, avg_technical: 75, avg_communication: 75, strengths: ['Clear communication', 'Showing improvement'], improvements: ['Build confidence'] },
  { _id: 'summary-4', session_id: 'session-4', overall_score: 90, avg_technical: 95, avg_communication: 85, strengths: ['Excellent technical depth', 'Confident delivery'], improvements: ['Continue excellent progress'] }
];

users.push(demoUser);
sessions.push(...demoSessions);
summaries.push(...demoSummaries);

// Socket.IO for WebRTC signaling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('join-room', ({ roomId, userInfo }) => {
    console.log(`User ${socket.id} joining room ${roomId} as ${userInfo.role}`);
    
    socket.join(roomId);
    
    // Track room participants
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }
    
    rooms.get(roomId).set(socket.id, {
      ...userInfo,
      socketId: socket.id
    });
    
    // Notify others in room
    const roomParticipants = Array.from(rooms.get(roomId).values());
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      userInfo,
      participants: roomParticipants
    });
    
    // Send current participants to new user
    socket.emit('room-participants', roomParticipants);
  });

  // WebRTC signaling
  socket.on('offer', ({ offer, targetUserId, roomId }) => {
    socket.to(targetUserId).emit('offer', {
      offer,
      fromUserId: socket.id,
      roomId
    });
  });

  socket.on('answer', ({ answer, targetUserId, roomId }) => {
    socket.to(targetUserId).emit('answer', {
      answer,
      fromUserId: socket.id,
      roomId
    });
  });

  socket.on('ice-candidate', ({ candidate, targetUserId, roomId }) => {
    socket.to(targetUserId).emit('ice-candidate', {
      candidate,
      fromUserId: socket.id,
      roomId
    });
  });

  // Chat messages
  socket.on('chat-message', ({ roomId, message, senderInfo }) => {
    io.to(roomId).emit('chat-message', {
      message,
      senderInfo,
      timestamp: Date.now()
    });
  });

  // Interview control
  socket.on('next-question', ({ roomId, questionIndex }) => {
    socket.to(roomId).emit('next-question', { questionIndex });
  });

  socket.on('answer-submitted', ({ roomId, answer, questionId }) => {
    socket.to(roomId).emit('answer-submitted', { answer, questionId });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove from all rooms
    for (let [roomId, participants] of rooms) {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        socket.to(roomId).emit('user-left', {
          userId: socket.id,
          participants: Array.from(participants.values())
        });
        
        // Clean up empty rooms
        if (participants.size === 0) {
          rooms.delete(roomId);
        }
      }
    }
  });
});

// REST API Routes (same as before)
app.post('/api/users', (req, res) => {
  const { name, target_role, resume_text } = req.body;
  let user = users.find(u => u.name === name && u.target_role === target_role);
  
  if (!user) {
    user = {
      _id: `user-${Date.now()}`,
      name,
      target_role,
      resume_text,
      created_at: new Date()
    };
    users.push(user);
  }
  
  res.json(user);
});

app.post('/api/sessions/start', (req, res) => {
  const { user_id, role_title, difficulty } = req.body;
  
  const session = {
    _id: `session-${Date.now()}`,
    user_id,
    role_title,
    difficulty,
    started_at: new Date()
  };
  sessions.push(session);
  
  // Generate demo questions
  const demoQuestions = [
    { id: `q-${Date.now()}-1`, text: "Tell me about a challenging project you worked on and how you handled it.", type: "behavioral", sequence_no: 1 },
    { id: `q-${Date.now()}-2`, text: "Describe a time when you had to work with a difficult team member.", type: "behavioral", sequence_no: 2 },
    { id: `q-${Date.now()}-3`, text: "Give me an example of when you had to learn a new technology quickly.", type: "behavioral", sequence_no: 3 },
    { id: `q-${Date.now()}-4`, text: "Explain the difference between synchronous and asynchronous programming.", type: "technical", sequence_no: 4 },
    { id: `q-${Date.now()}-5`, text: "How would you optimize a slow database query?", type: "technical", sequence_no: 5 },
    { id: `q-${Date.now()}-6`, text: "Walk me through how you would design a RESTful API.", type: "technical", sequence_no: 6 },
    { id: `q-${Date.now()}-7`, text: "Why are you interested in this particular role and company?", type: "fit", sequence_no: 7 }
  ];
  
  res.json({
    session_id: session._id,
    questions: demoQuestions
  });
});

app.post('/api/sessions/answer', (req, res) => {
  const { question_id, answer_text, input_mode, response_time_sec } = req.body;
  
  // Simple scoring simulation
  const wordCount = answer_text.split(' ').length;
  const hasFillers = /\b(um|uh|like|basically|you know)\b/gi.test(answer_text);
  const hasHedges = /\b(i think|maybe|sort of|kind of|probably)\b/gi.test(answer_text);
  
  let commScore = 85;
  if (hasFillers) commScore -= 20;
  if (hasHedges) commScore -= 15;
  if (wordCount < 20) commScore -= 20;
  
  const techScore = wordCount > 30 ? Math.random() * 30 + 60 : Math.random() * 40 + 30;
  
  const score = {
    technical_score: Math.round(techScore),
    communication_score: Math.max(0, commScore),
    filler_word_ratio: hasFillers ? 0.1 : 0,
    star_detected: wordCount > 50,
    feedback: "Sample feedback for demo purposes",
    filler_words_found: hasFillers ? [{ word: "um", position: answer_text.indexOf("um") }] : [],
    hedge_phrases_found: hasHedges ? [{ phrase: "I think", position: answer_text.indexOf("I think") }] : []
  };
  
  let followUpQuestion = null;
  if (score.technical_score < 50 || wordCount < 25) {
    followUpQuestion = {
      id: `followup-${Date.now()}`,
      text: "Can you provide more specific details about your approach?",
      type: "technical",
      is_followup: true
    };
  }
  
  res.json({ score, follow_up_question: followUpQuestion });
});

app.post('/api/sessions/:sessionId/summary', (req, res) => {
  res.json({
    session_summary: {
      overall_score: 75,
      avg_technical: 70,
      avg_communication: 80,
      strengths: ["Good technical understanding", "Clear communication"],
      improvements: ["Practice more specific examples", "Build confidence"]
    },
    detailed_scores: [
      {
        question: "Tell me about a challenging project you worked on.",
        type: "behavioral",
        answer: "Sample answer for demo",
        technical_score: null,
        communication_score: 80,
        feedback: "Good structure, could use more specific details"
      }
    ]
  });
});

app.get('/api/users/:userId/dashboard', (req, res) => {
  const userSessions = sessions.filter(s => s.user_id === req.params.userId);
  
  const dashboardSessions = userSessions.map(session => {
    const summary = summaries.find(s => s.session_id === session._id);
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
  
  res.json({ sessions: dashboardSessions });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Demo server running with WebRTC', timestamp: new Date().toISOString() });
});

// Get room info
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (room) {
    res.json({
      roomId,
      participants: Array.from(room.values()),
      participantCount: room.size
    });
  } else {
    res.json({
      roomId,
      participants: [],
      participantCount: 0
    });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 InterviewLens server with WebRTC running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:3000/dashboard/demo-user-1`);
  console.log(`🎥 Video Interview: http://localhost:3000`);
});