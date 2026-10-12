require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const sessionRoutes = require('./routes/sessions');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://interviewlens-client.onrender.com', 'https://your-vercel-domain.vercel.app']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/sessions', sessionRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server running', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});