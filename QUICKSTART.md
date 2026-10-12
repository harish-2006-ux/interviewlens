# Quick Start Guide

## Prerequisites

1. **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
2. **MongoDB**: 
   - Install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud)
3. **Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/)

## 5-Minute Setup

### Option 1: Automated Setup (Recommended)

**Windows:**
```cmd
npm run setup
.\start.bat
```

**Mac/Linux:**
```bash
npm run setup
./start.sh
```

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Configure environment:**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env and add your Gemini API key
   ```

3. **Start MongoDB:**
   ```bash
   # Local MongoDB
   mongod --dbpath ./data
   
   # Or update MONGODB_URI in .env for Atlas
   ```

4. **Seed demo data:**
   ```bash
   npm run seed
   ```

5. **Start the app:**
   ```bash
   npm run dev
   ```

## First Time Usage

1. Open http://localhost:3000
2. Click "View Dashboard" to see demo progress charts
3. Click "Start New Interview" to try the system
4. Test voice input (works in Chrome/Safari/Edge)
5. Complete an interview to see the full report

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with Google account
3. Click "Get API Key"
4. Copy the key to `server/.env`:
   ```
   GEMINI_API_KEY=your_actual_key_here
   ```

## Troubleshooting

**"MongoDB connection error"**:
- Make sure MongoDB is running
- Check the connection string in `server/.env`

**"Gemini API error"**:
- Verify your API key is correct
- Check you have API credits/quota

**"Voice input not working"**:
- Use Chrome, Safari, or Edge browser
- Allow microphone permissions
- HTTPS required in production

**"npm run seed fails"**:
- Ensure MongoDB is running first
- Check database connection string

## Demo Flow

1. **Start Interview**: Enter name "Test User" and role "Software Engineer"
2. **Answer Questions**: Try both text and voice input
3. **See Real-time Scoring**: Notice filler word detection and follow-up questions
4. **View Report**: Get detailed analysis with confidence heatmap
5. **Check Dashboard**: See progress trends (uses seeded historical data)

## What's Included

- ✅ 7 generated interview questions per session
- ✅ Real-time technical + communication scoring  
- ✅ Voice input with Web Speech API
- ✅ Confidence heatmap highlighting filler words
- ✅ Adaptive follow-up questions
- ✅ Multi-session progress dashboard
- ✅ Comprehensive session reports
- ✅ Sample data for immediate demo