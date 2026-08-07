import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Interview from './pages/Interview'
import VideoInterview from './pages/VideoInterview'
import JoinRoom from './pages/JoinRoom'
import Dashboard from './pages/Dashboard'
import SessionReport from './pages/SessionReport'
import Navbar from './components/Navbar'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join-room" element={<JoinRoom />} />
          <Route path="/interview/:sessionId" element={<Interview />} />
          <Route path="/video-interview/:sessionId/:mode" element={<VideoInterview />} />
          <Route path="/dashboard/:userId" element={<Dashboard />} />
          <Route path="/report/:sessionId" element={<SessionReport />} />
        </Routes>
      </main>
    </div>
  )
}

export default App