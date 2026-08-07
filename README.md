# 🎥 InterviewLens

**AI-Powered Video Interview Practice Platform**

See exactly where you lost the interview - with word-level evidence, not just a score.

![InterviewLens](https://img.shields.io/badge/AI-Powered-blue) ![Status](https://img.shields.io/badge/Status-Live-success) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🎯 Dual Scoring System
- **Technical Depth Analysis**: Evaluates correctness, specificity, and technical terminology
- **Communication Skills**: Detects filler words, hedge phrases, and STAR method usage

### 🎥 Real-Time Video Interviews
- **WebRTC-powered** person-to-person video connections
- **Room-based system** for easy interview sharing
- **Interviewer & Candidate modes** for flexible practice

### 🤖 AI-Powered Analysis
- **Google Gemini AI** generates personalized interview questions
- **Instant feedback** on every response
- **Confidence heatmaps** highlighting filler words and weak phrases
- **Follow-up questions** based on incomplete answers

### 📊 Progress Dashboard
- **Track improvement** across multiple sessions
- **Visual analytics** with score progression charts
- **Session history** with detailed breakdowns

### 🎨 Stunning Visual Effects
- **Lens spotlight effects** with floating particles
- **Glassmorphism UI** with rainbow borders
- **Animated aperture icons** and dramatic transitions
- **Premium gradient buttons** with shimmer effects

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/interviewlens.git
cd interviewlens
```

2. **Install all dependencies**:
```bash
npm run install:all
```

3. **Configure environment variables**:

Create `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/interview_prep
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
NODE_ENV=development
```

4. **Start the application**:
```bash
# Start both client and server
npm run dev

# Or start separately:
npm run dev:server  # Server on http://localhost:3001
npm run dev:client  # Client on http://localhost:3000
```

5. **Seed demo data** (optional):
```bash
npm run seed
```

6. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📦 Project Structure

```
interviewlens/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── index.css      # Global styles with animations
│   │   └── main.jsx       # Entry point
│   └── package.json
├── server/                # Express backend
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── services/          # Gemini AI client
│   ├── scripts/           # Seed scripts
│   └── index.js           # Server entry
├── render.yaml            # Render deployment config
├── vercel.json            # Vercel deployment config
└── package.json           # Root package
```

---

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed hosting instructions.

### Quick Deploy to Render:

1. Push to GitHub
2. Connect to [Render](https://render.com)
3. Set environment variables
4. Deploy! ✨

**Live Demo**: [Coming Soon]

---

## 🎮 How to Use

### 1️⃣ Choose Your Experience
- **Real Video Interview**: Connect with another person using room IDs
- **AI Demo Interview**: Practice with simulated video environment
- **Text Practice Mode**: Traditional text-based interview
- **Progress Dashboard**: View your analytics and improvement

### 2️⃣ Start Interview
- Enter your details and role
- Generate or enter a room ID (for video interviews)
- Begin answering AI-generated questions

### 3️⃣ Get Instant Feedback
- See real-time analysis of your responses
- View confidence heatmaps highlighting weak areas
- Receive technical and communication scores

### 4️⃣ Review & Improve
- Get comprehensive session reports
- Track progress over time
- Identify patterns and areas for growth

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling with custom animations
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Socket.IO Client** - Real-time communication
- **WebRTC** - Video/audio streaming

### Backend
- **Node.js + Express** - REST API
- **MongoDB + Mongoose** - Database
- **Socket.IO** - WebRTC signaling
- **Google Gemini AI** - Question generation & scoring
- **dotenv** - Environment configuration

---

## 📊 API Endpoints

### Sessions
- `POST /api/sessions/start` - Start new interview session
- `POST /api/sessions/answer` - Submit answer
- `POST /api/sessions/:id/summary` - Generate session summary

### Users
- `POST /api/users` - Create/get user
- `GET /api/users/:id/dashboard` - Get user dashboard data

### Health
- `GET /api/health` - Server health check

---

## 🎨 Visual Features

### Animations
- **Lens spotlight** with breathing effect
- **Floating particles** background
- **Rainbow border** animations
- **Aperture spinning** icons
- **Progress glow** effects
- **Staggered reveal** animations

### Components
- Enhanced buttons (primary, secondary, success, danger, warning)
- Glassmorphism cards with gradient borders
- Progress rings with pulse effects
- Animated score displays
- Typewriter text effects
- Confidence heatmaps

---

## 🔧 Configuration

### Gemini AI
Configure in `server/services/geminiClient.js`:
- Question generation prompts
- Scoring criteria
- Technical depth analysis
- Follow-up question logic

### MongoDB
Schemas in `server/models/`:
- `User.js` - User profiles
- `Session.js` - Interview sessions
- `Question.js` - Questions
- `Response.js` - User responses
- `Score.js` - Scoring data

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Google Gemini AI for intelligent question generation
- Socket.IO for real-time communication
- Tailwind CSS for beautiful styling
- MongoDB for flexible data storage

---

## 📧 Contact

**Project Link**: [https://github.com/yourusername/interviewlens](https://github.com/yourusername/interviewlens)

**Demo**: [Coming Soon]

---

**Built with ❤️ for aspiring developers worldwide**

*Practice makes perfect. InterviewLens shows you exactly how.*
